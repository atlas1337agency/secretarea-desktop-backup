import { fetchCachedProviderJson, sanitizeExternalHttpUrl } from '../httpClient';
import type {
  PlayerHistoryPoint,
  PlayerHistoryRange,
  PriceHistoryPoint,
  SteamDataUpdateImpact,
  SteamLiveRankEntry,
} from '../types';

const STEAMDATA_API_BASE = 'https://api.steamdata.dev/api';
// Respect SteamData 15-minute cache policy and rate limits
const STEAMDATA_CACHE_TTL_MS = 15 * 60 * 1000;

interface RawSteamDataTag {
  family?: string;
  tag?: string;
  value?: {
    state?: string;
    value?: number;
    initial?: number;
    final?: number;
    lowest?: boolean;
    discount?: number;
    real?: number;
    raised_from?: number;
    released?: number;
  };
}

interface RawSteamDataAppSummary {
  app_id: number;
  name: string;
  header_image?: string;
  player_count?: number;
  recorded_at?: number;
  peak_player_count?: number;
  day_ago_player_count?: number;
  day_ago_recorded_at?: number;
  day_change?: number;
  rank?: number;
  day_ago_rank?: number;
  trend?: number[];
  tags?: RawSteamDataTag[];
  value?: {
    state?: string;
    value?: number;
    initial?: number;
    final?: number;
    lowest?: boolean;
    released?: number;
    discount?: number;
    real?: number;
    raised_from?: number;
  };
}

interface RawSteamDataAppsResponse {
  total?: number;
  page?: number;
  per_page?: number;
  apps?: RawSteamDataAppSummary[];
}

interface RawSteamDataTagResponse {
  tag?: string;
  apps?: RawSteamDataAppSummary[];
}

interface RawSteamDataAppDetailResponse {
  app_id: number;
  name: string;
  header_image?: string;
  player_count?: number;
  recorded_at?: number;
  peak_player_count?: number;
  day_ago_player_count?: number;
  day_change?: number;
  rank?: number;
  day_ago_rank?: number;
  peak_recorded_at?: number;
  store?: {
    short_description?: string;
    release_date?: string;
    developers?: string[];
    publishers?: string[];
    genres?: string[];
    platforms?: string[];
    metacritic_score?: number;
  };
  price?: {
    initial?: number;
    final?: number;
    discount_percent?: number;
  } | null;
  tags?: RawSteamDataTag[];
  updates?: Array<{
    t?: number;
    title?: string;
    gid?: string;
    kind?: string;
    before?: number;
    after?: number;
    change?: number;
  }>;
  sales?: Array<{
    t?: number;
    from?: number;
    to?: number;
    discount?: number;
    initial?: number;
    final?: number;
    lowest?: boolean;
  }>;
  price_changes?: Array<{
    t?: number;
    initial?: number;
    final?: number;
    discount?: number;
  }>;
}

interface RawSteamDataHistoryResponse {
  app_id?: number;
  range?: string;
  points?: Array<{ t: number; player_count: number }>;
  sales?: Array<{
    t?: number;
    from?: number;
    to?: number;
    discount?: number;
    initial?: number;
    final?: number;
    lowest?: boolean;
  }>;
  price_changes?: Array<{
    t?: number;
    initial?: number;
    final?: number;
    discount?: number;
  }>;
}

export interface SteamDataDetailParsed {
  appId: string;
  name: string;
  headerImage: string | null;
  currentPlayers: number | null;
  peak24h: number | null;
  dayChangeFraction: number | null;
  rank: number | null;
  recordedAt: number | null;
  discountShame: {
    flagged: boolean;
    raisedFromUsd?: number | null;
    advertisedDiscount?: number | null;
    realDiscount?: number | null;
  } | null;
  updates: SteamDataUpdateImpact[];
  priceHistory: PriceHistoryPoint[];
}

function normalizeAppSummary(raw: RawSteamDataAppSummary): SteamLiveRankEntry {
  const appId = String(raw.app_id);
  const rank = Number(raw.rank || 0);
  const prevRank = typeof raw.day_ago_rank === 'number' && raw.day_ago_rank > 0 ? raw.day_ago_rank : null;

  const saleTag = raw.tags?.find((t) => t.tag === 'on_sale');
  const newRelTag = raw.tags?.find((t) => t.tag === 'new_release');
  const updateBumpTag = raw.tags?.find((t) => t.tag === 'update_bump');
  const saleBumpTag = raw.tags?.find((t) => t.tag === 'sale_bump');
  const shameTag = raw.tags?.find((t) => t.tag === 'discount_shame');

  const saleVal = saleTag?.value || (raw.value?.initial ? raw.value : undefined);
  const onSalePercent =
    typeof saleVal?.value === 'number' && saleVal.value > 0
      ? saleVal.value
      : typeof raw.value?.discount === 'number'
      ? raw.value.discount
      : null;

  return {
    appId,
    rank,
    previousRank: prevRank,
    rankDelta: prevRank && rank > 0 ? prevRank - rank : null,
    title: raw.name.trim(),
    headerImage:
      sanitizeExternalHttpUrl(raw.header_image) ||
      `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
    currentPlayers: Number(raw.player_count || 0),
    peak24h: typeof raw.peak_player_count === 'number' ? raw.peak_player_count : null,
    dayAgoPlayers: typeof raw.day_ago_player_count === 'number' ? raw.day_ago_player_count : null,
    dayChangeFraction: typeof raw.day_change === 'number' ? raw.day_change : null,
    trendSpark: Array.isArray(raw.trend) ? raw.trend.filter((n) => Number.isFinite(n)) : [],
    recordedAt: (Number(raw.recorded_at || 0) * 1000) || Date.now(),
    onSalePercent,
    salePriceUsd: typeof saleVal?.final === 'number' ? saleVal.final / 100 : null,
    normalPriceUsd: typeof saleVal?.initial === 'number' ? saleVal.initial / 100 : null,
    isLowestPrice: Boolean(saleVal?.lowest),
    isNewRelease: Boolean(newRelTag),
    hasUpdateBump: Boolean(updateBumpTag && updateBumpTag.value?.state === 'up'),
    hasSaleBump: Boolean(saleBumpTag && saleBumpTag.value?.state === 'up'),
    discountShame: Boolean(shameTag),
    source: 'steamdata',
    sourceUrl: `https://steamdata.dev/app/${appId}`,
  };
}

class SteamDataProviderImpl {
  async fetchTopConcurrentApps(
    perPage = 100,
    forceRefresh = false
  ): Promise<SteamLiveRankEntry[]> {
    const { data } = await fetchCachedProviderJson<RawSteamDataAppsResponse>({
      provider: 'steamdata',
      providerName: 'SteamData',
      url: `${STEAMDATA_API_BASE}/apps?page=0&per_page=${Math.min(100, Math.max(10, perPage))}`,
      cacheKey: `steamdata:apps:top:${perPage}`,
      ttlMs: STEAMDATA_CACHE_TTL_MS,
      forceRefresh,
    });

    if (!Array.isArray(data?.apps)) return [];
    return data.apps.filter((a) => a && a.app_id && a.name).map(normalizeAppSummary);
  }

  async fetchTrending(limit = 20, forceRefresh = false): Promise<SteamLiveRankEntry[]> {
    const { data } = await fetchCachedProviderJson<{ apps?: RawSteamDataAppSummary[] } | RawSteamDataAppSummary[]>({
      provider: 'steamdata',
      providerName: 'SteamData',
      url: `${STEAMDATA_API_BASE}/trending?limit=${Math.min(50, Math.max(1, limit))}`,
      cacheKey: `steamdata:trending:${limit}`,
      ttlMs: STEAMDATA_CACHE_TTL_MS,
      forceRefresh,
    });

    const list = Array.isArray(data) ? data : Array.isArray(data?.apps) ? data.apps : [];
    return list.filter((a) => a && a.app_id && a.name).map(normalizeAppSummary);
  }

  async fetchMovers(limit = 20, forceRefresh = false): Promise<SteamLiveRankEntry[]> {
    const { data } = await fetchCachedProviderJson<{
      apps?: RawSteamDataAppSummary[];
      gainers?: RawSteamDataAppSummary[];
    } | RawSteamDataAppSummary[]>({
      provider: 'steamdata',
      providerName: 'SteamData',
      url: `${STEAMDATA_API_BASE}/movers?limit=${Math.min(50, Math.max(1, limit))}`,
      cacheKey: `steamdata:movers:${limit}`,
      ttlMs: STEAMDATA_CACHE_TTL_MS,
      forceRefresh,
    });

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.apps)
      ? data.apps
      : Array.isArray(data?.gainers)
      ? data.gainers
      : [];
    return list.filter((a) => a && a.app_id && a.name).map(normalizeAppSummary);
  }

  async fetchTagApps(
    tag: 'new_release' | 'on_sale' | 'discount_shame' | 'update_bump' | 'sale_bump',
    state: string,
    limit = 16,
    forceRefresh = false
  ): Promise<SteamLiveRankEntry[]> {
    const { data } = await fetchCachedProviderJson<RawSteamDataTagResponse>({
      provider: 'steamdata',
      providerName: 'SteamData',
      url: `${STEAMDATA_API_BASE}/tags/${encodeURIComponent(tag)}?state=${encodeURIComponent(
        state
      )}&limit=${limit}`,
      cacheKey: `steamdata:tag:${tag}:${state}:${limit}`,
      ttlMs: STEAMDATA_CACHE_TTL_MS,
      forceRefresh,
    });

    if (!Array.isArray(data?.apps)) return [];
    return data.apps.filter((a) => a && a.app_id && a.name).map(normalizeAppSummary);
  }

  async searchApps(query: string, forceRefresh = false): Promise<SteamLiveRankEntry[]> {
    const clean = query.trim();
    if (!clean) return [];
    try {
      const { data } = await fetchCachedProviderJson<
        { apps?: RawSteamDataAppSummary[] } | RawSteamDataAppSummary[]
      >({
        provider: 'steamdata',
        providerName: 'SteamData',
        url: `${STEAMDATA_API_BASE}/search?q=${encodeURIComponent(clean)}`,
        cacheKey: `steamdata:search:${clean.toLowerCase()}`,
        ttlMs: 10 * 60 * 1000,
        forceRefresh,
      });

      const list = Array.isArray(data) ? data : Array.isArray(data?.apps) ? data.apps : [];
      return list.filter((a) => a && a.app_id && a.name).map(normalizeAppSummary);
    } catch {
      return [];
    }
  }

  async fetchAppDetail(appId: string, forceRefresh = false): Promise<SteamDataDetailParsed | null> {
    const cleanId = appId.trim();
    if (!cleanId) return null;
    try {
      const { data } = await fetchCachedProviderJson<RawSteamDataAppDetailResponse>({
        provider: 'steamdata',
        providerName: 'SteamData',
        url: `${STEAMDATA_API_BASE}/apps/${encodeURIComponent(cleanId)}`,
        cacheKey: `steamdata:app:${cleanId}`,
        ttlMs: STEAMDATA_CACHE_TTL_MS,
        forceRefresh,
      });

      if (!data || !data.name) return null;

      const shameTag = data.tags?.find((t) => t.tag === 'discount_shame');
      const updates: SteamDataUpdateImpact[] = Array.isArray(data.updates)
        ? data.updates
            .filter((u) => u && u.title)
            .slice(0, 8)
            .map((u) => ({
              timestamp: Number(u.t || 0) * 1000,
              title: String(u.title),
              gid: u.gid || null,
              kind: u.kind || null,
              beforePlayers: typeof u.before === 'number' ? u.before : null,
              afterPlayers: typeof u.after === 'number' ? u.after : null,
              changeFraction: typeof u.change === 'number' ? u.change : null,
            }))
        : [];

      const priceHistory: PriceHistoryPoint[] = [];
      for (const s of data.sales || []) {
        const ts = Number(s.t || s.from || 0) * 1000;
        const finalCents = Number(s.final ?? 0);
        const initCents = Number(s.initial ?? finalCents);
        if (ts > 0 && Number.isFinite(finalCents)) {
          priceHistory.push({
            timestamp: ts,
            priceUsd: finalCents / 100,
            normalPriceUsd: initCents > 0 ? initCents / 100 : null,
            discountPercent: Number(s.discount || 0),
            isLowest: Boolean(s.lowest),
            note: s.lowest ? 'Steam Historical Low' : s.discount ? `-${s.discount}% Sale` : null,
          });
        }
      }
      for (const p of data.price_changes || []) {
        const ts = Number(p.t || 0) * 1000;
        const finalCents = Number(p.final ?? 0);
        const initCents = Number(p.initial ?? finalCents);
        if (ts > 0 && Number.isFinite(finalCents)) {
          priceHistory.push({
            timestamp: ts,
            priceUsd: finalCents / 100,
            normalPriceUsd: initCents > 0 ? initCents / 100 : null,
            discountPercent: Number(p.discount || 0),
            note: 'Base/Sale Price Change',
          });
        }
      }

      priceHistory.sort((a, b) => a.timestamp - b.timestamp);

      return {
        appId: cleanId,
        name: data.name.trim(),
        headerImage: sanitizeExternalHttpUrl(data.header_image),
        currentPlayers: typeof data.player_count === 'number' ? data.player_count : null,
        peak24h: typeof data.peak_player_count === 'number' ? data.peak_player_count : null,
        dayChangeFraction: typeof data.day_change === 'number' ? data.day_change : null,
        rank: typeof data.rank === 'number' ? data.rank : null,
        recordedAt: data.recorded_at ? Number(data.recorded_at) * 1000 : null,
        discountShame: shameTag
          ? {
              flagged: true,
              raisedFromUsd:
                typeof shameTag.value?.raised_from === 'number'
                  ? shameTag.value.raised_from / 100
                  : null,
              advertisedDiscount: shameTag.value?.discount ?? null,
              realDiscount: shameTag.value?.real ?? null,
            }
          : null,
        updates,
        priceHistory,
      };
    } catch {
      return null;
    }
  }

  async fetchPlayerHistory(
    appId: string,
    range: PlayerHistoryRange = '7d',
    forceRefresh = false
  ): Promise<{ points: PlayerHistoryPoint[]; priceHistory: PriceHistoryPoint[] }> {
    const cleanId = appId.trim();
    if (!cleanId) return { points: [], priceHistory: [] };
    try {
      const { data } = await fetchCachedProviderJson<RawSteamDataHistoryResponse>({
        provider: 'steamdata',
        providerName: 'SteamData',
        url: `${STEAMDATA_API_BASE}/apps/${encodeURIComponent(cleanId)}/history?range=${encodeURIComponent(
          range
        )}`,
        cacheKey: `steamdata:history:${cleanId}:${range}`,
        ttlMs: STEAMDATA_CACHE_TTL_MS,
        forceRefresh,
      });

      const points: PlayerHistoryPoint[] = Array.isArray(data?.points)
        ? data.points
            .filter((pt) => pt && typeof pt.t === 'number' && typeof pt.player_count === 'number')
            .map((pt) => ({
              timestamp: pt.t * 1000,
              playerCount: pt.player_count,
            }))
            .sort((a, b) => a.timestamp - b.timestamp)
        : [];

      const priceHistory: PriceHistoryPoint[] = [];
      for (const s of data?.sales || []) {
        const ts = Number(s.t || s.from || 0) * 1000;
        const finalCents = Number(s.final ?? 0);
        const initCents = Number(s.initial ?? finalCents);
        if (ts > 0 && Number.isFinite(finalCents)) {
          priceHistory.push({
            timestamp: ts,
            priceUsd: finalCents / 100,
            normalPriceUsd: initCents > 0 ? initCents / 100 : null,
            discountPercent: Number(s.discount || 0),
            isLowest: Boolean(s.lowest),
          });
        }
      }

      return { points, priceHistory: priceHistory.sort((a, b) => a.timestamp - b.timestamp) };
    } catch {
      return { points: [], priceHistory: [] };
    }
  }
}

export const SteamDataProvider = new SteamDataProviderImpl();
