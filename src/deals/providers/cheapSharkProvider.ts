import {
  fetchCachedProviderJson,
  getProviderHealthSnapshot,
  sanitizeExternalHttpUrl,
  setProviderHealth,
} from '../httpClient';
import type {
  DealOffer,
  DealsPageResult,
  DealsQueryParams,
  DealsSortOption,
  DealsStoreInfo,
  NormalizedDealGame,
  ProviderHealthStatus,
} from '../types';
import type { DealsProviderAdapter } from './types';

const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';
const CHEAPSHARK_ORIGIN = 'https://www.cheapshark.com';

const STORES_TTL_MS = 30 * 60 * 1000;
const DEALS_TTL_MS = 3 * 60 * 1000;
const GAME_DETAIL_TTL_MS = 5 * 60 * 1000;

interface RawCheapSharkStore {
  storeID: string;
  storeName: string;
  isActive: number;
  images?: {
    banner?: string;
    logo?: string;
    icon?: string;
  };
}

interface RawCheapSharkDeal {
  internalName?: string;
  title?: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale?: string;
  savings?: string;
  metacriticScore?: string;
  steamRatingText?: string | null;
  steamRatingPercent?: string;
  steamRatingCount?: string;
  steamAppID?: string | null;
  releaseDate?: number;
  lastChange?: number;
  dealRating?: string;
  thumb?: string;
}

interface RawCheapSharkGameDetailResponse {
  info?: {
    title?: string;
    steamAppID?: string | null;
    thumb?: string;
  };
  cheapestPriceEver?: {
    price?: string;
    date?: number;
  };
  deals?: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
}

interface RawCheapSharkGameSearchItem {
  gameID: string;
  steamAppID?: string | null;
  cheapest?: string;
  cheapestDealID?: string;
  external?: string;
  thumb?: string;
}

function buildCheapSharkAssetUrl(relativeOrAbsolute?: string | null): string | null {
  if (!relativeOrAbsolute || typeof relativeOrAbsolute !== 'string') return null;
  const trimmed = relativeOrAbsolute.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return sanitizeExternalHttpUrl(trimmed);
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${CHEAPSHARK_ORIGIN}${normalizedPath}`;
}

export function buildCheapSharkRedirectUrl(dealId: string): string {
  const trimmed = dealId.trim();
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    decoded = trimmed;
  }
  return `${CHEAPSHARK_ORIGIN}/redirect?dealID=${encodeURIComponent(decoded)}`;
}

function mapSortToCheapSharkParam(sortBy: DealsSortOption): { sortBy: string; desc: '0' | '1' } {
  switch (sortBy) {
    case 'savings':
      return { sortBy: 'Savings', desc: '0' };
    case 'price-asc':
      return { sortBy: 'Price', desc: '1' };
    case 'price-desc':
      return { sortBy: 'Price', desc: '0' };
    case 'recent':
      return { sortBy: 'recent', desc: '0' };
    case 'metacritic':
      return { sortBy: 'Metacritic', desc: '0' };
    case 'title':
      return { sortBy: 'Title', desc: '1' };
    case 'deal-rating':
    default:
      return { sortBy: 'Deal Rating', desc: '0' };
  }
}

function parseNumberOrNull(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractEditionTag(title: string): string | null {
  const match = title.match(
    /\b(ultimate|deluxe|gold|complete|goty|game of the year|definitive|collector'?s|digital deluxe|enhanced|anniversary|remastered|legacy|premium)\s*(edition|bundle|collection)?\b/i
  );
  if (!match) return null;
  return match[0].trim().toLowerCase();
}

export function normalizeCanonicalTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/[:\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeRawDealToGame(
  raw: RawCheapSharkDeal,
  storesMap: Map<string, DealsStoreInfo>
): NormalizedDealGame | null {
  if (!raw || !raw.dealID || !raw.gameID || !raw.title) return null;

  const store = storesMap.get(String(raw.storeID));
  const salePrice = Number(raw.salePrice);
  const normalPrice = Number(raw.normalPrice);
  const savingsRaw = Number(raw.savings);
  const savingsPercent = Number.isFinite(savingsRaw)
    ? Math.max(0, Math.min(100, Math.round(savingsRaw)))
    : normalPrice > 0 && Number.isFinite(salePrice)
    ? Math.max(0, Math.round(((normalPrice - salePrice) / normalPrice) * 100))
    : 0;

  const metacriticRaw = parseNumberOrNull(raw.metacriticScore);
  const steamPercentRaw = parseNumberOrNull(raw.steamRatingPercent);
  const steamCountRaw = parseNumberOrNull(raw.steamRatingCount);
  const dealRatingRaw = parseNumberOrNull(raw.dealRating);
  const isOnSale = raw.isOnSale === '1' || savingsPercent > 0;
  const isFreeNow = Number.isFinite(salePrice) && salePrice <= 0;

  const offer: DealOffer = {
    offerId: raw.dealID,
    provider: 'cheapshark',
    providerLabel: 'CheapShark',
    storeId: String(raw.storeID),
    storeName: store?.storeName || `Store #${raw.storeID}`,
    storeLogoUrl: store?.logoUrl || null,
    storeIconUrl: store?.iconUrl || null,
    currency: 'USD',
    salePrice: Number.isFinite(salePrice) ? salePrice : 0,
    normalPrice: Number.isFinite(normalPrice) ? normalPrice : 0,
    savingsPercent,
    dealRating: dealRatingRaw,
    metacriticScore: metacriticRaw && metacriticRaw > 0 ? metacriticRaw : null,
    steamRatingPercent: steamPercentRaw && steamPercentRaw > 0 ? steamPercentRaw : null,
    steamRatingText: raw.steamRatingText || null,
    steamRatingCount: steamCountRaw && steamCountRaw > 0 ? steamCountRaw : null,
    dealUrl: buildCheapSharkRedirectUrl(raw.dealID),
    isFreeNow,
    isOnSale,
    lastChangeTimestamp: typeof raw.lastChange === 'number' ? raw.lastChange : null,
    releaseDateTimestamp:
      typeof raw.releaseDate === 'number' && raw.releaseDate > 0 ? raw.releaseDate : null,
  };

  const editionTag = extractEditionTag(raw.title);
  const steamAppId = raw.steamAppID ? String(raw.steamAppID).trim() : null;
  const normalizedTitle = normalizeCanonicalTitle(raw.title);
  const canonicalKey = steamAppId
    ? `steam:${steamAppId}:${editionTag || 'base'}`
    : `cs:${raw.gameID}:${normalizedTitle}`;

  return {
    canonicalKey,
    title: raw.title.trim(),
    editionTag,
    steamAppId,
    cheapsharkGameId: String(raw.gameID),
    thumbUrl: sanitizeExternalHttpUrl(raw.thumb),
    bestOffer: offer,
    offers: [offer],
    cheapestEver: null,
    providers: ['cheapshark'],
  };
}

class CheapSharkProviderImpl implements DealsProviderAdapter {
  readonly id = 'cheapshark' as const;
  readonly displayName = 'CheapShark';
  readonly attributionUrl = 'https://www.cheapshark.com/';

  constructor() {
    setProviderHealth({
      provider: this.id,
      name: this.displayName,
      state: 'ok',
      lastSuccessAt: null,
      retryAfterSec: null,
      message: 'Ready',
    });
  }

  isPermitted(): boolean {
    return true;
  }

  getHealth(): ProviderHealthStatus {
    const existing = getProviderHealthSnapshot().find((p) => p.provider === this.id);
    return (
      existing || {
        provider: this.id,
        name: this.displayName,
        state: 'ok',
        lastSuccessAt: null,
        retryAfterSec: null,
        message: 'Ready',
      }
    );
  }

  async getStores(forceRefresh = false): Promise<DealsStoreInfo[]> {
    const { data } = await fetchCachedProviderJson<RawCheapSharkStore[]>({
      provider: this.id,
      providerName: this.displayName,
      url: `${CHEAPSHARK_BASE_URL}/stores`,
      cacheKey: 'cheapshark:stores',
      ttlMs: STORES_TTL_MS,
      forceRefresh,
    });

    if (!Array.isArray(data)) return [];
    return data
      .filter((s) => s && s.storeID && s.storeName)
      .map((s) => ({
        storeId: String(s.storeID),
        storeName: String(s.storeName).trim(),
        isActive: Number(s.isActive) === 1,
        bannerUrl: buildCheapSharkAssetUrl(s.images?.banner),
        logoUrl: buildCheapSharkAssetUrl(s.images?.logo),
        iconUrl: buildCheapSharkAssetUrl(s.images?.icon),
        provider: 'cheapshark',
      }));
  }

  async fetchDeals(params: DealsQueryParams = {}): Promise<DealsPageResult> {
    const stores = await this.getStores(params.forceRefresh);
    const storesMap = new Map(stores.map((s) => [s.storeId, s]));

    const pageNumber = Math.max(0, Math.floor(params.pageNumber ?? 0));
    const pageSize = Math.min(60, Math.max(6, Math.floor(params.pageSize ?? 24)));
    const { sortBy, desc } = mapSortToCheapSharkParam(params.sortBy ?? 'deal-rating');

    const searchParams = new URLSearchParams();
    searchParams.set('pageNumber', String(pageNumber));
    searchParams.set('pageSize', String(pageSize));
    searchParams.set('sortBy', sortBy);
    searchParams.set('desc', desc);

    if (params.onSaleOnly !== false) {
      searchParams.set('onSale', '1');
    }
    if (params.storeIds && params.storeIds.length > 0) {
      searchParams.set('storeID', params.storeIds.join(','));
    }
    if (typeof params.lowerPrice === 'number' && params.lowerPrice >= 0) {
      searchParams.set('lowerPrice', params.lowerPrice.toFixed(2));
    }
    if (typeof params.upperPrice === 'number' && params.upperPrice >= 0 && params.upperPrice < 999) {
      searchParams.set('upperPrice', params.upperPrice.toFixed(2));
    }
    if (params.title && params.title.trim()) {
      searchParams.set('title', params.title.trim());
    }

    const url = `${CHEAPSHARK_BASE_URL}/deals?${searchParams.toString()}`;
    const { data, headers } = await fetchCachedProviderJson<RawCheapSharkDeal[]>({
      provider: this.id,
      providerName: this.displayName,
      url,
      cacheKey: `cheapshark:deals:${searchParams.toString()}`,
      ttlMs: DEALS_TTL_MS,
      forceRefresh: params.forceRefresh,
    });

    const totalPagesHeader = Number(headers['x-total-page-count']);
    const totalPages =
      Number.isFinite(totalPagesHeader) && totalPagesHeader >= 0 ? totalPagesHeader + 1 : pageNumber + 1;

    const minSavings = typeof params.minSavings === 'number' ? params.minSavings : 0;
    const normalizedList: NormalizedDealGame[] = [];

    if (Array.isArray(data)) {
      for (const rawDeal of data) {
        const game = normalizeRawDealToGame(rawDeal, storesMap);
        if (!game) continue;
        if (minSavings > 0 && game.bestOffer.savingsPercent < minSavings) continue;
        normalizedList.push(game);
      }
    }

    return {
      items: normalizedList,
      pageNumber,
      totalPages: Math.max(1, totalPages),
      hasNextPage: pageNumber + 1 < totalPages && (Array.isArray(data) ? data.length > 0 : false),
      stores: stores.filter((s) => s.isActive),
      fetchedAt: Date.now(),
      currency: 'USD',
    };
  }

  async searchGamesMaster(
    title: string,
    limit = 20,
    forceRefresh = false
  ): Promise<RawCheapSharkGameSearchItem[]> {
    const clean = title.trim();
    if (!clean) return [];
    const qs = new URLSearchParams({
      title: clean,
      limit: String(Math.min(60, Math.max(1, limit))),
    });
    const { data } = await fetchCachedProviderJson<RawCheapSharkGameSearchItem[]>({
      provider: this.id,
      providerName: this.displayName,
      url: `${CHEAPSHARK_BASE_URL}/games?${qs.toString()}`,
      cacheKey: `cheapshark:games-search:${qs.toString()}`,
      ttlMs: DEALS_TTL_MS,
      forceRefresh,
    });
    return Array.isArray(data) ? data : [];
  }

  async fetchGameComparison(
    gameId: string,
    existingStoresMap?: Map<string, DealsStoreInfo>,
    forceRefresh = false
  ): Promise<NormalizedDealGame | null> {
    const cleanId = gameId.trim();
    if (!cleanId) return null;

    const storesMap =
      existingStoresMap && existingStoresMap.size > 0
        ? existingStoresMap
        : new Map((await this.getStores(forceRefresh)).map((s) => [s.storeId, s]));

    const { data } = await fetchCachedProviderJson<RawCheapSharkGameDetailResponse>({
      provider: this.id,
      providerName: this.displayName,
      url: `${CHEAPSHARK_BASE_URL}/games?id=${encodeURIComponent(cleanId)}`,
      cacheKey: `cheapshark:game-detail:${cleanId}`,
      ttlMs: GAME_DETAIL_TTL_MS,
      forceRefresh,
    });

    if (!data?.info?.title || !Array.isArray(data.deals) || data.deals.length === 0) {
      return null;
    }

    const title = data.info.title.trim();
    const steamAppId = data.info.steamAppID ? String(data.info.steamAppID).trim() : null;
    const thumbUrl = sanitizeExternalHttpUrl(data.info.thumb);

    const offers: DealOffer[] = [];
    for (const d of data.deals) {
      if (!d || !d.dealID) continue;
      const store = storesMap.get(String(d.storeID));
      // Only show active verified stores or stores explicitly present in storesMap
      if (store && !store.isActive) continue;
      const salePrice = Number(d.price);
      const normalPrice = Number(d.retailPrice);
      const savingsNum = Number(d.savings);
      const savingsPercent = Number.isFinite(savingsNum)
        ? Math.max(0, Math.min(100, Math.round(savingsNum)))
        : normalPrice > 0 && Number.isFinite(salePrice)
        ? Math.max(0, Math.round(((normalPrice - salePrice) / normalPrice) * 100))
        : 0;

      offers.push({
        offerId: d.dealID,
        provider: 'cheapshark',
        providerLabel: 'CheapShark',
        storeId: String(d.storeID),
        storeName: store?.storeName || `Store #${d.storeID}`,
        storeLogoUrl: store?.logoUrl || null,
        storeIconUrl: store?.iconUrl || null,
        currency: 'USD',
        salePrice: Number.isFinite(salePrice) ? salePrice : 0,
        normalPrice: Number.isFinite(normalPrice) ? normalPrice : 0,
        savingsPercent,
        dealRating: null,
        metacriticScore: null,
        steamRatingPercent: null,
        steamRatingText: null,
        steamRatingCount: null,
        dealUrl: buildCheapSharkRedirectUrl(d.dealID),
        isFreeNow: Number.isFinite(salePrice) && salePrice <= 0,
        isOnSale: savingsPercent > 0,
        lastChangeTimestamp: null,
        releaseDateTimestamp: null,
      });
    }

    if (offers.length === 0) return null;

    offers.sort((a, b) => a.salePrice - b.salePrice || b.savingsPercent - a.savingsPercent);

    const cheapestEverPrice = Number(data.cheapestPriceEver?.price);
    const cheapestEverDate = Number(data.cheapestPriceEver?.date);
    const cheapestEver =
      Number.isFinite(cheapestEverPrice) && Number.isFinite(cheapestEverDate)
        ? {
            price: cheapestEverPrice,
            currency: 'USD',
            dateTimestamp: cheapestEverDate,
          }
        : null;

    const editionTag = extractEditionTag(title);
    const canonicalKey = steamAppId
      ? `steam:${steamAppId}:${editionTag || 'base'}`
      : `cs:${cleanId}:${normalizeCanonicalTitle(title)}`;

    return {
      canonicalKey,
      title,
      editionTag,
      steamAppId,
      cheapsharkGameId: cleanId,
      thumbUrl,
      bestOffer: offers[0],
      offers,
      cheapestEver,
      providers: ['cheapshark'],
    };
  }
}

export const CheapSharkProvider = new CheapSharkProviderImpl();
