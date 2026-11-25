import {
  fetchCachedProviderJson,
  getDealsCredentialStatus,
  sanitizeExternalHttpUrl,
} from '../httpClient';

const APISH_METACRITIC_BASE = 'https://api.api.sh/metacritic/v1';
const OPENCRITIC_RAPIDAPI_BASE = 'https://opencritic-api.p.rapidapi.com/api';

const CRITICS_TTL_MS = 60 * 60 * 1000;

export interface MetacriticDetailResult {
  metascore: number | null;
  metascoreCount: number | null;
  metascoreSentiment: string | null;
  userScore: number | null;
  userScoreCount: number | null;
  userSentiment: string | null;
  url: string | null;
  requiresKey: boolean;
}

export interface OpenCriticDetailResult {
  topCriticScore: number | null;
  percentRecommended: number | null;
  tier: string | null;
  numReviews: number | null;
  url: string | null;
  requiresKey: boolean;
}

class CriticsProviderImpl {
  async fetchMetacriticViaApiSh(
    title: string,
    forceRefresh = false
  ): Promise<MetacriticDetailResult> {
    const status = await getDealsCredentialStatus();
    if (!status.providers?.metacritic_apish?.configured) {
      return {
        metascore: null,
        metascoreCount: null,
        metascoreSentiment: null,
        userScore: null,
        userScoreCount: null,
        userSentiment: null,
        url: null,
        requiresKey: true,
      };
    }

    try {
      const { data } = await fetchCachedProviderJson<{
        success?: boolean;
        data?: {
          url?: string;
          criticScoreSummary?: {
            score?: number;
            max?: number;
            reviewCount?: number;
            sentiment?: string;
          };
          userScoreSummary?: {
            score?: number;
            max?: number;
            reviewCount?: number;
            sentiment?: string;
          };
          metascore?: number;
          userscore?: number;
        };
      }>({
        provider: 'metacritic_apish',
        providerName: 'API.SH Metacritic',
        url: `${APISH_METACRITIC_BASE}/title?title=${encodeURIComponent(
          title
        )}&category=games&platform=pc`,
        cacheKey: `apish:mc:${title.toLowerCase()}`,
        ttlMs: CRITICS_TTL_MS,
        forceRefresh,
        authProviderId: 'metacritic_apish',
      });

      const d = data?.data;
      const metaRaw = d?.criticScoreSummary?.score ?? d?.metascore ?? null;
      const userRaw = d?.userScoreSummary?.score ?? d?.userscore ?? null;

      return {
        metascore: typeof metaRaw === 'number' && metaRaw > 0 ? Math.round(metaRaw) : null,
        metascoreCount:
          typeof d?.criticScoreSummary?.reviewCount === 'number'
            ? d.criticScoreSummary.reviewCount
            : null,
        metascoreSentiment: d?.criticScoreSummary?.sentiment || null,
        userScore: typeof userRaw === 'number' && userRaw > 0 ? Number(userRaw.toFixed(1)) : null,
        userScoreCount:
          typeof d?.userScoreSummary?.reviewCount === 'number'
            ? d.userScoreSummary.reviewCount
            : null,
        userSentiment: d?.userScoreSummary?.sentiment || null,
        url: sanitizeExternalHttpUrl(d?.url),
        requiresKey: false,
      };
    } catch {
      return {
        metascore: null,
        metascoreCount: null,
        metascoreSentiment: null,
        userScore: null,
        userScoreCount: null,
        userSentiment: null,
        url: null,
        requiresKey: false,
      };
    }
  }

  async fetchOpenCriticViaRapidApi(
    title: string,
    forceRefresh = false
  ): Promise<OpenCriticDetailResult> {
    const status = await getDealsCredentialStatus();
    if (!status.providers?.opencritic_rapidapi?.configured) {
      return {
        topCriticScore: null,
        percentRecommended: null,
        tier: null,
        numReviews: null,
        url: null,
        requiresKey: true,
      };
    }

    try {
      const { data: searchList } = await fetchCachedProviderJson<
        Array<{ id?: number; name?: string; dist?: number }>
      >({
        provider: 'opencritic_rapidapi',
        providerName: 'OpenCritic',
        url: `${OPENCRITIC_RAPIDAPI_BASE}/game/search?criteria=${encodeURIComponent(title)}`,
        cacheKey: `oc:search:${title.toLowerCase()}`,
        ttlMs: CRITICS_TTL_MS,
        forceRefresh,
        authProviderId: 'opencritic_rapidapi',
      });

      const topMatch = Array.isArray(searchList) && searchList[0]?.id ? searchList[0] : null;
      if (!topMatch?.id) {
        return {
          topCriticScore: null,
          percentRecommended: null,
          tier: null,
          numReviews: null,
          url: null,
          requiresKey: false,
        };
      }

      const { data: detail } = await fetchCachedProviderJson<{
        id?: number;
        url?: string;
        topCriticScore?: number;
        percentRecommended?: number;
        tier?: string;
        numReviews?: number;
      }>({
        provider: 'opencritic_rapidapi',
        providerName: 'OpenCritic',
        url: `${OPENCRITIC_RAPIDAPI_BASE}/game/${encodeURIComponent(String(topMatch.id))}`,
        cacheKey: `oc:game:${topMatch.id}`,
        ttlMs: CRITICS_TTL_MS,
        forceRefresh,
        authProviderId: 'opencritic_rapidapi',
      });

      const score =
        typeof detail?.topCriticScore === 'number' && detail.topCriticScore > 0
          ? Math.round(detail.topCriticScore)
          : null;
      const pct =
        typeof detail?.percentRecommended === 'number' && detail.percentRecommended >= 0
          ? Math.round(detail.percentRecommended)
          : null;

      return {
        topCriticScore: score,
        percentRecommended: pct,
        tier: detail?.tier || null,
        numReviews: typeof detail?.numReviews === 'number' ? detail.numReviews : null,
        url:
          sanitizeExternalHttpUrl(detail?.url) ||
          `https://opencritic.com/game/${topMatch.id}/`,
        requiresKey: false,
      };
    } catch {
      return {
        topCriticScore: null,
        percentRecommended: null,
        tier: null,
        numReviews: null,
        url: null,
        requiresKey: false,
      };
    }
  }
}

export const CriticsProvider = new CriticsProviderImpl();
