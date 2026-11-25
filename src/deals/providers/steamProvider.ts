import { fetchCachedProviderJson, sanitizeExternalHttpUrl } from '../httpClient';
import type {
  GameAchievementStat,
  GameNewsItem,
  SteamLiveRankEntry,
  SteamReviewEntry,
  SteamReviewSummary,
} from '../types';

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_BASE = 'https://store.steampowered.com';

const CHARTS_TTL_MS = 5 * 60 * 1000;
const APP_DETAILS_TTL_MS = 30 * 60 * 1000;
const REVIEWS_TTL_MS = 10 * 60 * 1000;
const NEWS_TTL_MS = 15 * 60 * 1000;

interface RawSteamConcurrentResponse {
  response?: {
    rollup_date?: number;
    last_update?: number;
    ranks?: Array<{
      rank: number;
      appid: number;
      concurrent_in_game: number;
      peak_in_game: number;
    }>;
  };
}

interface RawSteamMostPlayedResponse {
  response?: {
    rollup_date?: number;
    ranks?: Array<{
      rank: number;
      appid: number;
      last_week_rank?: number;
      peak_in_game?: number;
    }>;
  };
}

interface RawSteamCurrentPlayersResponse {
  response?: {
    player_count?: number;
    result?: number;
  };
}

interface RawSteamGlobalAchievementsResponse {
  achievementpercentages?: {
    achievements?: Array<{
      name?: string;
      percent?: number;
    }>;
  };
}

interface RawSteamNewsResponse {
  appnews?: {
    appid?: number;
    newsitems?: Array<{
      gid?: string;
      title?: string;
      url?: string;
      author?: string;
      contents?: string;
      feedlabel?: string;
      date?: number;
    }>;
  };
}

export interface SteamAppDetailsParsed {
  appId: string;
  name: string;
  shortDescription: string | null;
  headerImage: string | null;
  developers: string[];
  publishers: string[];
  releaseDateText: string | null;
  platforms: { windows: boolean; mac: boolean; linux: boolean };
  genres: string[];
  metacriticScore: number | null;
  metacriticUrl: string | null;
  recommendationsTotal: number | null;
  achievementsTotal: number | null;
  highlightedAchievements: Array<{ name: string; path: string | null }>;
  isFree: boolean;
  priceUsd: {
    initialUsd: number;
    finalUsd: number;
    discountPercent: number;
  } | null;
}

interface RawSteamAppReviewsResponse {
  success?: number;
  query_summary?: {
    num_reviews?: number;
    review_score?: number;
    review_score_desc?: string;
    total_positive?: number;
    total_negative?: number;
    total_reviews?: number;
  };
  reviews?: Array<{
    recommendationid?: string;
    author?: {
      steamid?: string;
      playtime_forever?: number;
    };
    review?: string;
    timestamp_created?: number;
    voted_up?: boolean;
    votes_up?: number;
    votes_funny?: number;
  }>;
}

function stripBbCodeAndHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\/?[a-z*]+(?:=[^\]]*)?\]/gi, ' ')
    .replace(/\{STEAM_CLAN_IMAGE\}[^\s]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAchievementApiName(apiName: string): string {
  return apiName
    .replace(/^(ACH_|ACHIEVEMENT_|NEW_ACHIEVEMENT_\d+_\d+_)/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

class SteamProviderImpl {
  async fetchConcurrentPlayersCharts(forceRefresh = false): Promise<{
    lastUpdate: number;
    ranks: Array<{ rank: number; appId: string; concurrentInGame: number; peakInGame: number }>;
  }> {
    const { data } = await fetchCachedProviderJson<RawSteamConcurrentResponse>({
      provider: 'steam_official',
      providerName: 'Steam Charts API',
      url: `${STEAM_API_BASE}/ISteamChartsService/GetGamesByConcurrentPlayers/v1/`,
      cacheKey: 'steam:charts:concurrent',
      ttlMs: CHARTS_TTL_MS,
      forceRefresh,
    });

    const lastUpdate = Number(data?.response?.last_update || data?.response?.rollup_date || 0) * 1000;
    const ranks = (data?.response?.ranks || [])
      .filter((r) => r && r.appid)
      .map((r) => ({
        rank: Number(r.rank || 0),
        appId: String(r.appid),
        concurrentInGame: Number(r.concurrent_in_game || 0),
        peakInGame: Number(r.peak_in_game || 0),
      }));

    return { lastUpdate: lastUpdate || Date.now(), ranks };
  }

  async fetchMostPlayedOfficialRanks(forceRefresh = false): Promise<SteamLiveRankEntry[]> {
    const { data } = await fetchCachedProviderJson<RawSteamMostPlayedResponse>({
      provider: 'steam_official',
      providerName: 'Steam Charts API',
      url: `${STEAM_API_BASE}/ISteamChartsService/GetMostPlayedGames/v1/`,
      cacheKey: 'steam:charts:mostplayed',
      ttlMs: CHARTS_TTL_MS,
      forceRefresh,
    });

    const recordedAt = (Number(data?.response?.rollup_date || 0) * 1000) || Date.now();
    const list = data?.response?.ranks || [];

    return list.map((r) => {
      const appId = String(r.appid);
      const rank = Number(r.rank || 0);
      const lastWeek = typeof r.last_week_rank === 'number' && r.last_week_rank > 0 ? r.last_week_rank : null;
      return {
        appId,
        rank,
        previousRank: lastWeek,
        rankDelta: lastWeek ? lastWeek - rank : null,
        title: `Steam App #${appId}`,
        headerImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
        currentPlayers: Number(r.peak_in_game || 0),
        peak24h: Number(r.peak_in_game || 0),
        dayAgoPlayers: null,
        dayChangeFraction: null,
        trendSpark: [],
        recordedAt,
        onSalePercent: null,
        salePriceUsd: null,
        normalPriceUsd: null,
        isLowestPrice: false,
        isNewRelease: false,
        hasUpdateBump: false,
        hasSaleBump: false,
        discountShame: false,
        source: 'steam_official',
        sourceUrl: `https://store.steampowered.com/app/${appId}/`,
      };
    });
  }

  async fetchNumberOfCurrentPlayers(appId: string, forceRefresh = false): Promise<number | null> {
    const cleanId = appId.trim();
    if (!cleanId) return null;
    try {
      const { data } = await fetchCachedProviderJson<RawSteamCurrentPlayersResponse>({
        provider: 'steam_official',
        providerName: 'Steam Web API',
        url: `${STEAM_API_BASE}/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${encodeURIComponent(cleanId)}`,
        cacheKey: `steam:ccu:${cleanId}`,
        ttlMs: 3 * 60 * 1000,
        forceRefresh,
      });
      if (data?.response?.result === 1 && typeof data.response.player_count === 'number') {
        return data.response.player_count;
      }
      return null;
    } catch {
      return null;
    }
  }

  async fetchAppDetails(appId: string, forceRefresh = false): Promise<SteamAppDetailsParsed | null> {
    const cleanId = appId.trim();
    if (!cleanId) return null;
    try {
      const { data } = await fetchCachedProviderJson<
        Record<
          string,
          {
            success?: boolean;
            data?: {
              name?: string;
              is_free?: boolean;
              short_description?: string;
              header_image?: string;
              developers?: string[];
              publishers?: string[];
              release_date?: { date?: string; coming_soon?: boolean };
              platforms?: { windows?: boolean; mac?: boolean; linux?: boolean };
              genres?: Array<{ id?: string; description?: string }>;
              metacritic?: { score?: number; url?: string };
              recommendations?: { total?: number };
              achievements?: {
                total?: number;
                highlighted?: Array<{ name?: string; path?: string }>;
              };
              price_overview?: {
                currency?: string;
                initial?: number;
                final?: number;
                discount_percent?: number;
              };
            };
          }
        >
      >({
        provider: 'steam_store',
        providerName: 'Steam Store API',
        url: `${STEAM_STORE_BASE}/api/appdetails?appids=${encodeURIComponent(cleanId)}&cc=us&l=en`,
        cacheKey: `steam:appdetails:${cleanId}`,
        ttlMs: APP_DETAILS_TTL_MS,
        forceRefresh,
      });

      const entry = data?.[cleanId];
      if (!entry?.success || !entry.data?.name) return null;
      const d = entry.data;

      return {
        appId: cleanId,
        name: String(d.name).trim(),
        shortDescription: d.short_description ? stripBbCodeAndHtml(d.short_description) : null,
        headerImage: sanitizeExternalHttpUrl(d.header_image),
        developers: Array.isArray(d.developers) ? d.developers.filter(Boolean) : [],
        publishers: Array.isArray(d.publishers) ? d.publishers.filter(Boolean) : [],
        releaseDateText: d.release_date?.date || null,
        platforms: {
          windows: Boolean(d.platforms?.windows),
          mac: Boolean(d.platforms?.mac),
          linux: Boolean(d.platforms?.linux),
        },
        genres: Array.isArray(d.genres)
          ? d.genres.map((g) => g.description || '').filter(Boolean)
          : [],
        metacriticScore: typeof d.metacritic?.score === 'number' ? d.metacritic.score : null,
        metacriticUrl: sanitizeExternalHttpUrl(d.metacritic?.url),
        recommendationsTotal:
          typeof d.recommendations?.total === 'number' ? d.recommendations.total : null,
        achievementsTotal:
          typeof d.achievements?.total === 'number' ? d.achievements.total : null,
        highlightedAchievements: Array.isArray(d.achievements?.highlighted)
          ? d.achievements.highlighted
              .filter((a) => a && a.name)
              .map((a) => ({
                name: String(a.name),
                path: sanitizeExternalHttpUrl(a.path),
              }))
          : [],
        isFree: Boolean(d.is_free),
        priceUsd:
          d.price_overview &&
          d.price_overview.currency === 'USD' &&
          typeof d.price_overview.final === 'number'
            ? {
                initialUsd: Number(d.price_overview.initial || d.price_overview.final) / 100,
                finalUsd: Number(d.price_overview.final) / 100,
                discountPercent: Number(d.price_overview.discount_percent || 0),
              }
            : null,
      };
    } catch {
      return null;
    }
  }

  async fetchGlobalAchievements(
    appId: string,
    highlightedHints: Array<{ name: string; path: string | null }> = [],
    forceRefresh = false
  ): Promise<GameAchievementStat[]> {
    const cleanId = appId.trim();
    if (!cleanId) return [];
    try {
      const { data } = await fetchCachedProviderJson<RawSteamGlobalAchievementsResponse>({
        provider: 'steam_official',
        providerName: 'Steam Achievements API',
        url: `${STEAM_API_BASE}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${encodeURIComponent(cleanId)}`,
        cacheKey: `steam:achievements:${cleanId}`,
        ttlMs: APP_DETAILS_TTL_MS,
        forceRefresh,
      });

      const list = data?.achievementpercentages?.achievements;
      if (!Array.isArray(list)) return [];

      return list
        .filter((a) => a && a.name && Number.isFinite(Number(a.percent)))
        .slice(0, 40)
        .map((a) => {
          const apiName = String(a.name);
          const matchedHint = highlightedHints.find(
            (h) => h.name.toLowerCase() === apiName.toLowerCase()
          );
          return {
            apiName,
            displayName: matchedHint?.name || formatAchievementApiName(apiName),
            globalPercent: Math.max(0, Math.min(100, Number(Number(a.percent).toFixed(1)))),
            iconUrl: matchedHint?.path || null,
          };
        });
    } catch {
      return [];
    }
  }

  async fetchAppNews(appId: string, count = 8, forceRefresh = false): Promise<GameNewsItem[]> {
    const cleanId = appId.trim();
    if (!cleanId) return [];
    try {
      const { data } = await fetchCachedProviderJson<RawSteamNewsResponse>({
        provider: 'steam_official',
        providerName: 'Steam News API',
        url: `${STEAM_API_BASE}/ISteamNews/GetNewsForApp/v2/?appid=${encodeURIComponent(
          cleanId
        )}&count=${Math.min(15, Math.max(1, count))}&maxlength=360`,
        cacheKey: `steam:news:${cleanId}`,
        ttlMs: NEWS_TTL_MS,
        forceRefresh,
      });

      const items = data?.appnews?.newsitems;
      if (!Array.isArray(items)) return [];

      return items
        .filter((n) => n && n.title)
        .map((n) => ({
          gid: String(n.gid || `${cleanId}-${n.date || 0}`),
          title: String(n.title).trim(),
          url:
            sanitizeExternalHttpUrl(n.url) ||
            `https://store.steampowered.com/news/app/${cleanId}`,
          author: (n.author || 'Steam').trim(),
          dateTimestamp: Number(n.date || 0) * 1000,
          feedLabel: (n.feedlabel || 'Announcement').trim(),
          summary: stripBbCodeAndHtml(n.contents || '').slice(0, 320),
        }));
    } catch {
      return [];
    }
  }

  async fetchStoreUserReviews(
    appId: string,
    filter: 'recent' | 'all' = 'all',
    forceRefresh = false
  ): Promise<Partial<SteamReviewSummary> | null> {
    const cleanId = appId.trim();
    if (!cleanId) return null;
    try {
      const { data } = await fetchCachedProviderJson<RawSteamAppReviewsResponse>({
        provider: 'steam_store',
        providerName: 'Steam User Reviews',
        url: `${STEAM_STORE_BASE}/appreviews/${encodeURIComponent(
          cleanId
        )}?json=1&language=english&filter=${filter}&purchase_type=all&num_per_page=10`,
        cacheKey: `steam:appreviews:${cleanId}:${filter}`,
        ttlMs: REVIEWS_TTL_MS,
        forceRefresh,
      });

      if (data?.success !== 1 || !data.query_summary) return null;
      const q = data.query_summary;
      const positive = Number(q.total_positive || 0);
      const negative = Number(q.total_negative || 0);
      const total = Number(q.total_reviews || positive + negative);
      const positivePercent = total > 0 ? Math.round((positive / total) * 100) : null;

      const reviews: SteamReviewEntry[] = Array.isArray(data.reviews)
        ? data.reviews
            .filter((r) => r && r.review)
            .map((r) => ({
              recommendationId: String(r.recommendationid || Math.random()),
              authorSteamId: String(r.author?.steamid || ''),
              playtimeHours: Math.round(((Number(r.author?.playtime_forever || 0) / 60) + Number.EPSILON) * 10) / 10,
              votedUp: Boolean(r.voted_up),
              reviewText: String(r.review || '').trim(),
              timestampCreated: Number(r.timestamp_created || 0) * 1000,
              votesUp: Number(r.votes_up || 0),
              votesFunny: Number(r.votes_funny || 0),
              reviewUrl: r.author?.steamid
                ? `https://steamcommunity.com/profiles/${r.author.steamid}/recommended/${cleanId}/`
                : `https://store.steampowered.com/app/${cleanId}/#app_reviews_hash`,
            }))
        : [];

      return {
        positive,
        negative,
        total,
        positivePercent,
        label: q.review_score_desc || null,
        scoreTier: typeof q.review_score === 'number' ? q.review_score : null,
        recordedAt: Date.now(),
        source: 'Steam Store User Reviews',
        sourceUrl: `https://store.steampowered.com/app/${cleanId}/#app_reviews_hash`,
        isCensusSnapshot: false,
        reviews,
      };
    } catch {
      return null;
    }
  }
}

export const SteamProvider = new SteamProviderImpl();
