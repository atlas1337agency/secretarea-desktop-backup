import {
  fetchCachedProviderJson,
  getDesktopDealsBridge,
  sanitizeExternalHttpUrl,
  setProviderHealth,
} from '../httpClient';
import {
  DEALS_REGION_OPTIONS,
  type DealsRegionCode,
  type NormalizedFreeOffer,
} from '../types';
import { CheapSharkProvider, normalizeCanonicalTitle } from './cheapSharkProvider';
import type { FreeGamesProviderAdapter } from './types';

const FREE_GAMES_TTL_MS = 8 * 60 * 1000;
const FREE_TO_PLAY_TTL_MS = 20 * 60 * 1000;

interface EpicPromotionalOfferItem {
  startDate?: string;
  endDate?: string;
  discountSetting?: {
    discountType?: string;
    discountPercentage?: number;
  };
}

interface EpicCatalogElement {
  id?: string;
  title?: string;
  description?: string;
  offerType?: string;
  productSlug?: string | null;
  urlSlug?: string | null;
  catalogNs?: {
    mappings?: Array<{ pageSlug?: string; pageType?: string }>;
  };
  offerMappings?: Array<{ pageSlug?: string; pageType?: string }>;
  keyImages?: Array<{ type?: string; url?: string }>;
  price?: {
    totalPrice?: {
      discountPrice?: number;
      originalPrice?: number;
      currencyCode?: string;
      fmtPrice?: {
        originalPrice?: string;
        discountPrice?: string;
      };
    };
  };
  promotions?: {
    promotionalOffers?: Array<{
      promotionalOffers?: EpicPromotionalOfferItem[];
    }>;
  };
}

interface EpicFreeGamesResponse {
  data?: {
    Catalog?: {
      searchStore?: {
        elements?: EpicCatalogElement[];
      };
    };
  };
}

interface GamerPowerItem {
  id: number;
  title: string;
  worth?: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  instructions?: string;
  open_giveaway_url?: string;
  open_giveaway?: string;
  published_date?: string;
  type?: string;
  platforms?: string;
  end_date?: string;
  status?: string;
  gamerpower_url?: string;
}

interface FreeToGameItem {
  id: number;
  title: string;
  thumbnail?: string;
  short_description?: string;
  game_url?: string;
  genre?: string;
  platform?: string;
  publisher?: string;
  developer?: string;
  release_date?: string;
  freetogame_profile_url?: string;
}

function parseGamerPowerStore(platformsRaw?: string): { storeName: string; storeKey: string } {
  const p = (platformsRaw || '').toLowerCase();
  if (p.includes('steam')) return { storeName: 'Steam', storeKey: 'steam' };
  if (p.includes('epic')) return { storeName: 'Epic Games Store', storeKey: 'epic' };
  if (p.includes('gog')) return { storeName: 'GOG', storeKey: 'gog' };
  if (p.includes('itch')) return { storeName: 'itch.io', storeKey: 'itch' };
  if (p.includes('ubisoft')) return { storeName: 'Ubisoft Connect', storeKey: 'ubisoft' };
  if (p.includes('drm-free')) return { storeName: 'DRM-Free PC', storeKey: 'drm-free' };
  return { storeName: 'PC Store', storeKey: 'pc' };
}

function parseExpirationTimestamp(rawDate?: string | null): { iso: string | null; ts: number | null } {
  if (!rawDate || rawDate === 'N/A' || !rawDate.trim()) {
    return { iso: null, ts: null };
  }
  const normalized = rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T') + 'Z';
  const parsed = Date.parse(normalized);
  if (!Number.isFinite(parsed)) {
    const fallback = Date.parse(rawDate);
    if (!Number.isFinite(fallback)) return { iso: null, ts: null };
    return { iso: new Date(fallback).toISOString(), ts: fallback };
  }
  return { iso: new Date(parsed).toISOString(), ts: parsed };
}

function normalizeFreeDedupeKey(title: string, storeKey: string): string {
  const stripped = title
    .replace(/\((steam|epic games|epic games store|gog|pc)\)\s*(giveaway)?/gi, '')
    .replace(/\bgiveaway\b/gi, '');
  return `${storeKey}:${normalizeCanonicalTitle(stripped)}`;
}

async function fetchEpicOfficialFreeGames(
  region: DealsRegionCode,
  forceRefresh: boolean
): Promise<NormalizedFreeOffer[]> {
  const regionMeta = DEALS_REGION_OPTIONS.find((r) => r.code === region) || DEALS_REGION_OPTIONS[0];
  const isElectron = Boolean(getDesktopDealsBridge());
  if (!isElectron) {
    setProviderHealth({
      provider: 'epic_official',
      name: 'Epic Games Store',
      state: 'cors_limited',
      lastSuccessAt: null,
      retryAfterSec: null,
      message:
        'Direct Epic endpoint requires Electron desktop context (CORS blocked in browser); Epic giveaways remain visible via GamerPower & CheapShark.',
    });
    return [];
  }

  const url = `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=${encodeURIComponent(
    regionMeta.epicLocale
  )}&country=${encodeURIComponent(regionMeta.epicCountry)}&allowCountries=${encodeURIComponent(
    regionMeta.epicCountry
  )}`;

  const { data } = await fetchCachedProviderJson<EpicFreeGamesResponse>({
    provider: 'epic_official',
    providerName: 'Epic Games Store',
    url,
    cacheKey: `epic:free:${regionMeta.epicCountry}`,
    ttlMs: FREE_GAMES_TTL_MS,
    forceRefresh,
  });

  const elements = data?.data?.Catalog?.searchStore?.elements;
  if (!Array.isArray(elements)) return [];

  const now = Date.now();
  const offers: NormalizedFreeOffer[] = [];

  for (const el of elements) {
    if (!el || !el.title) continue;
    const totalPrice = el.price?.totalPrice;
    const discountPrice = Number(totalPrice?.discountPrice);
    const originalPrice = Number(totalPrice?.originalPrice);

    // Strictly ensure it's a paid game temporarily discounted to 0 (not permanently free-to-play!)
    if (!Number.isFinite(discountPrice) || discountPrice !== 0) continue;
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) continue;

    const promoGroups = el.promotions?.promotionalOffers || [];
    let matchedEndIso: string | null = null;
    let matchedEndTs: number | null = null;
    let matchedStartIso: string | null = null;

    for (const group of promoGroups) {
      for (const promo of group.promotionalOffers || []) {
        const startMs = promo.startDate ? Date.parse(promo.startDate) : 0;
        const endMs = promo.endDate ? Date.parse(promo.endDate) : 0;
        const pct = promo.discountSetting?.discountPercentage;
        if (
          pct === 0 &&
          Number.isFinite(startMs) &&
          Number.isFinite(endMs) &&
          now >= startMs &&
          now < endMs
        ) {
          matchedStartIso = promo.startDate || null;
          matchedEndIso = promo.endDate || null;
          matchedEndTs = endMs;
          break;
        }
      }
      if (matchedEndTs) break;
    }

    if (!matchedEndTs) continue;

    const slug =
      el.catalogNs?.mappings?.find((m) => m.pageType === 'productHome')?.pageSlug ||
      el.offerMappings?.find((m) => m.pageType === 'productHome')?.pageSlug ||
      el.productSlug?.replace(/\/home$/i, '') ||
      el.urlSlug;

    const storeUrl = slug
      ? `https://store.epicgames.com/p/${encodeURIComponent(slug)}`
      : 'https://store.epicgames.com/free-games';

    const wideImg =
      el.keyImages?.find((img) => img.type === 'OfferImageWide')?.url ||
      el.keyImages?.find((img) => img.type === 'Thumbnail')?.url ||
      el.keyImages?.[0]?.url;

    const currency = totalPrice?.currencyCode || 'USD';
    const origFmt = totalPrice?.fmtPrice?.originalPrice || null;

    offers.push({
      id: `epic-${el.id || el.title}`,
      dedupeKey: normalizeFreeDedupeKey(el.title, 'epic'),
      provider: 'epic_official',
      providerLabel: 'Epic Games Official',
      category: 'limited_time_free',
      title: el.title.trim(),
      description: el.description?.trim() || '',
      coverUrl: sanitizeExternalHttpUrl(wideImg),
      storeName: 'Epic Games Store',
      storeKey: 'epic',
      offerTypeLabel: 'Limited-Time Free',
      originalPriceText: origFmt && origFmt !== '0' ? origFmt : null,
      currency,
      expiresAtIso: matchedEndIso,
      expiresTimestamp: matchedEndTs,
      publishedAtText: matchedStartIso,
      url: storeUrl,
      genre: null,
      instructions: null,
    });
  }

  return offers;
}

async function fetchGamerPowerOffers(forceRefresh: boolean): Promise<NormalizedFreeOffer[]> {
  const { data } = await fetchCachedProviderJson<GamerPowerItem[]>({
    provider: 'gamerpower',
    providerName: 'GamerPower',
    url: 'https://www.gamerpower.com/api/giveaways?platform=pc',
    cacheKey: 'gamerpower:pc-giveaways',
    ttlMs: FREE_GAMES_TTL_MS,
    forceRefresh,
  });

  if (!Array.isArray(data)) return [];
  const now = Date.now();
  const offers: NormalizedFreeOffer[] = [];

  for (const item of data) {
    if (!item || !item.title || (item.status && item.status.toLowerCase() !== 'active')) {
      continue;
    }

    const url = sanitizeExternalHttpUrl(item.open_giveaway_url || item.open_giveaway || item.gamerpower_url);
    if (!url) continue;

    const { iso: expiresAtIso, ts: expiresTimestamp } = parseExpirationTimestamp(item.end_date);
    if (expiresTimestamp && expiresTimestamp <= now) {
      continue;
    }

    const { storeName, storeKey } = parseGamerPowerStore(item.platforms);
    const rawType = (item.type || 'Giveaway').trim();
    const isFullGame = rawType.toLowerCase() === 'game';
    const isDlcOrReward = /dlc|loot|in-game|pack|skin|currency|beta|early access/i.test(rawType);
    const category = isFullGame ? 'limited_time_free' : 'giveaway';

    const cleanedTitle = item.title
      .replace(/\((steam|epic games|epic games store|gog|pc)\)\s*(giveaway)?/gi, '')
      .replace(/\s+giveaway$/i, '')
      .trim();

    const worth = item.worth && item.worth !== 'N/A' ? item.worth.trim() : null;

    offers.push({
      id: `gp-${item.id}`,
      dedupeKey: normalizeFreeDedupeKey(cleanedTitle, storeKey),
      provider: 'gamerpower',
      providerLabel: 'GamerPower',
      category,
      title: cleanedTitle || item.title.trim(),
      description: item.description?.trim() || '',
      coverUrl: sanitizeExternalHttpUrl(item.image || item.thumbnail),
      storeName,
      storeKey,
      offerTypeLabel: isFullGame ? 'Limited-Time Free' : rawType,
      isDlcOrReward,
      originalPriceText: worth,
      currency: worth && worth.startsWith('$') ? 'USD' : null,
      expiresAtIso,
      expiresTimestamp,
      publishedAtText: item.published_date || null,
      url,
      genre: null,
      instructions: item.instructions?.trim() || null,
    });
  }

  return offers;
}

async function fetchFreeToGameCatalog(forceRefresh: boolean): Promise<NormalizedFreeOffer[]> {
  const { data } = await fetchCachedProviderJson<FreeToGameItem[]>({
    provider: 'freetogame',
    providerName: 'FreeToGame',
    url: 'https://www.freetogame.com/api/games?platform=pc',
    cacheKey: 'freetogame:pc-games',
    ttlMs: FREE_TO_PLAY_TTL_MS,
    forceRefresh,
  });

  if (!Array.isArray(data)) return [];
  const offers: NormalizedFreeOffer[] = [];

  for (const item of data.slice(0, 60)) {
    if (!item || !item.title) continue;
    const url = sanitizeExternalHttpUrl(item.game_url || item.freetogame_profile_url);
    if (!url) continue;

    offers.push({
      id: `ftg-${item.id}`,
      dedupeKey: normalizeFreeDedupeKey(item.title, 'f2p'),
      provider: 'freetogame',
      providerLabel: 'FreeToGame',
      category: 'free_to_play',
      title: item.title.trim(),
      description: item.short_description?.trim() || '',
      coverUrl: sanitizeExternalHttpUrl(item.thumbnail),
      storeName: item.publisher?.trim() || 'PC Official',
      storeKey: 'pc',
      offerTypeLabel: 'Free-to-Play',
      originalPriceText: null,
      currency: null,
      expiresAtIso: null,
      expiresTimestamp: null,
      publishedAtText: item.release_date || null,
      url,
      genre: item.genre || null,
      instructions: null,
    });
  }

  return offers;
}

async function fetchCheapSharkTemporaryFree(forceRefresh: boolean): Promise<NormalizedFreeOffer[]> {
  try {
    const page = await CheapSharkProvider.fetchDeals({
      pageNumber: 0,
      pageSize: 20,
      lowerPrice: 0,
      upperPrice: 0,
      onSaleOnly: true,
      sortBy: 'recent',
      forceRefresh,
    });

    const offers: NormalizedFreeOffer[] = [];
    for (const game of page.items) {
      const offer = game.bestOffer;
      // Strictly paid games discounted to $0.00 (never permanently free)
      if (!offer.isFreeNow || offer.normalPrice <= 0 || !offer.isOnSale) continue;

      const storeKey = offer.storeName.toLowerCase().includes('epic')
        ? 'epic'
        : offer.storeName.toLowerCase().includes('steam')
        ? 'steam'
        : offer.storeName.toLowerCase().includes('gog')
        ? 'gog'
        : offer.storeId;

      offers.push({
        id: `cs-free-${offer.offerId}`,
        dedupeKey: normalizeFreeDedupeKey(game.title, storeKey),
        provider: 'cheapshark',
        providerLabel: 'CheapShark',
        category: 'limited_time_free',
        title: game.title,
        description: '',
        coverUrl: game.thumbUrl,
        storeName: offer.storeName,
        storeKey,
        offerTypeLabel: 'Limited-Time Free',
        originalPriceText: `$${offer.normalPrice.toFixed(2)}`,
        currency: offer.currency,
        expiresAtIso: null,
        expiresTimestamp: null,
        publishedAtText: offer.lastChangeTimestamp
          ? new Date(offer.lastChangeTimestamp * 1000).toISOString()
          : null,
        url: offer.dealUrl,
        genre: null,
        instructions: null,
      });
    }
    return offers;
  } catch {
    return [];
  }
}

class FreeGamesProviderImpl implements FreeGamesProviderAdapter {
  readonly id = 'gamerpower' as const;
  readonly displayName = 'Free Games Aggregator';

  async fetchFreeOffers(
    region: DealsRegionCode = 'US',
    forceRefresh = false
  ): Promise<NormalizedFreeOffer[]> {
    const [epicRes, gpRes, ftgRes, csFreeRes] = await Promise.allSettled([
      fetchEpicOfficialFreeGames(region, forceRefresh),
      fetchGamerPowerOffers(forceRefresh),
      fetchFreeToGameCatalog(forceRefresh),
      fetchCheapSharkTemporaryFree(forceRefresh),
    ]);

    const limitedAndGiveaways = new Map<string, NormalizedFreeOffer>();
    const freeToPlay = new Map<string, NormalizedFreeOffer>();

    const upsertLimitedOrGiveaway = (offer: NormalizedFreeOffer) => {
      const existing = limitedAndGiveaways.get(offer.dedupeKey);
      if (!existing) {
        limitedAndGiveaways.set(offer.dedupeKey, offer);
        return;
      }
      // Prefer official Epic Store or entries with explicit expiration / higher fidelity
      const existingPriority =
        (existing.provider === 'epic_official' ? 4 : existing.provider === 'gamerpower' ? 2 : 1) +
        (existing.expiresTimestamp ? 2 : 0);
      const nextPriority =
        (offer.provider === 'epic_official' ? 4 : offer.provider === 'gamerpower' ? 2 : 1) +
        (offer.expiresTimestamp ? 2 : 0);
      if (nextPriority > existingPriority) {
        limitedAndGiveaways.set(offer.dedupeKey, offer);
      }
    };

    if (epicRes.status === 'fulfilled') {
      for (const item of epicRes.value) upsertLimitedOrGiveaway(item);
    }
    if (gpRes.status === 'fulfilled') {
      for (const item of gpRes.value) upsertLimitedOrGiveaway(item);
    }
    if (csFreeRes.status === 'fulfilled') {
      for (const item of csFreeRes.value) upsertLimitedOrGiveaway(item);
    }
    if (ftgRes.status === 'fulfilled') {
      for (const item of ftgRes.value) {
        if (!freeToPlay.has(item.dedupeKey)) {
          freeToPlay.set(item.dedupeKey, item);
        }
      }
    }

    const sortedLimited = Array.from(limitedAndGiveaways.values()).sort((a, b) => {
      // Prioritize offers that are about to expire soonest
      if (a.expiresTimestamp && b.expiresTimestamp) {
        return a.expiresTimestamp - b.expiresTimestamp;
      }
      if (a.expiresTimestamp && !b.expiresTimestamp) return -1;
      if (!a.expiresTimestamp && b.expiresTimestamp) return 1;
      return a.title.localeCompare(b.title);
    });

    return [...sortedLimited, ...Array.from(freeToPlay.values())];
  }
}

export const FreeGamesProvider = new FreeGamesProviderImpl();
