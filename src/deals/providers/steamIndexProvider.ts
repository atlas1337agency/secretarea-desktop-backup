import { fetchCachedProviderJson, getDealsCredentialStatus } from '../httpClient';
import type { GameAchievementStat, PriceHistoryPoint } from '../types';

const STEAMIDX_BASE = 'https://public-api.steamidx.com/v1';
const STEAMIDX_TTL_MS = 20 * 60 * 1000;

interface RawSteamIdxPricesHistory {
  history?: Array<{
    recordedAt?: string;
    recorded_at?: string;
    t?: number;
    initial?: number;
    final?: number;
    discountPercent?: number;
    discount_percent?: number;
    currency?: string;
  }>;
}

interface RawSteamIdxAchievements {
  achievements?: Array<{
    name?: string;
    displayName?: string;
    description?: string;
    icon?: string;
    percent?: number;
    globalPercent?: number;
  }>;
}

class SteamIndexProviderImpl {
  private lastRemainingQuota: number | null = null;
  private lastQuotaLimit: number | null = 1440;

  getQuotaSnapshot(): { remaining: number | null; limit: number | null } {
    return { remaining: this.lastRemainingQuota, limit: this.lastQuotaLimit };
  }

  async isConfigured(): Promise<boolean> {
    const status = await getDealsCredentialStatus();
    return Boolean(status.providers?.steam_index?.configured);
  }

  private captureQuotaHeaders(headers: Record<string, string>): void {
    const rem = Number(headers['ratelimit-remaining']);
    const lim = Number(headers['ratelimit-limit']);
    if (Number.isFinite(rem)) this.lastRemainingQuota = rem;
    if (Number.isFinite(lim)) this.lastQuotaLimit = lim;
  }

  async fetchPriceHistory(
    appId: string,
    forceRefresh = false
  ): Promise<PriceHistoryPoint[]> {
    if (!(await this.isConfigured())) return [];
    // Protect free-tier quota
    if (this.lastRemainingQuota !== null && this.lastRemainingQuota <= 10) return [];

    try {
      const { data, headers } = await fetchCachedProviderJson<RawSteamIdxPricesHistory>({
        provider: 'steam_index',
        providerName: 'Steam Index',
        url: `${STEAMIDX_BASE}/apps/${encodeURIComponent(appId)}/prices/history?cc=us`,
        cacheKey: `steamidx:pricehist:${appId}`,
        ttlMs: STEAMIDX_TTL_MS,
        forceRefresh,
        authProviderId: 'steam_index',
      });
      this.captureQuotaHeaders(headers);

      const list = Array.isArray(data?.history) ? data.history : [];
      return list
        .map<PriceHistoryPoint | null>((pt) => {
          const ts =
            typeof pt.t === 'number'
              ? pt.t * 1000
              : Date.parse(pt.recordedAt || pt.recorded_at || '');
          if (!Number.isFinite(ts) || ts <= 0) return null;
          const finalVal = Number(pt.final ?? 0) / 100;
          const initVal = typeof pt.initial === 'number' ? pt.initial / 100 : null;
          return {
            timestamp: ts,
            priceUsd: finalVal,
            normalPriceUsd: initVal,
            discountPercent: Number(pt.discountPercent ?? pt.discount_percent ?? 0),
            note: 'Steam Index Price Record',
          };
        })
        .filter((x): x is PriceHistoryPoint => x !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch {
      return [];
    }
  }

  async fetchAchievementsWithNames(
    appId: string,
    forceRefresh = false
  ): Promise<GameAchievementStat[]> {
    if (!(await this.isConfigured())) return [];
    if (this.lastRemainingQuota !== null && this.lastRemainingQuota <= 10) return [];

    try {
      const { data, headers } = await fetchCachedProviderJson<RawSteamIdxAchievements>({
        provider: 'steam_index',
        providerName: 'Steam Index',
        url: `${STEAMIDX_BASE}/apps/${encodeURIComponent(appId)}/achievements`,
        cacheKey: `steamidx:ach:${appId}`,
        ttlMs: STEAMIDX_TTL_MS,
        forceRefresh,
        authProviderId: 'steam_index',
      });
      this.captureQuotaHeaders(headers);

      if (!Array.isArray(data?.achievements)) return [];
      return data.achievements
        .filter((a) => a && (a.displayName || a.name))
        .slice(0, 40)
        .map((a) => ({
          apiName: String(a.name || a.displayName || ''),
          displayName: String(a.displayName || a.name || ''),
          description: a.description || null,
          iconUrl: a.icon || null,
          globalPercent: Math.max(
            0,
            Math.min(100, Number(Number(a.globalPercent ?? a.percent ?? 0).toFixed(1)))
          ),
        }));
    } catch {
      return [];
    }
  }
}

export const SteamIndexProvider = new SteamIndexProviderImpl();
