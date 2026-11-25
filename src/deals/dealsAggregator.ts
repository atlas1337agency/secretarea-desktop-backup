import { clearDealsMemoryCache, getProviderHealthSnapshot } from './httpClient';
export { clearDealsMemoryCache };
import { CheapSharkProvider } from './providers/cheapSharkProvider';
import { FreeGamesProvider } from './providers/freeGamesProvider';
import { IsThereAnyDealProvider } from './providers/isThereAnyDealProvider';
import type {
  DealsOverviewSnapshot,
  DealsPageResult,
  DealsQueryParams,
  DealsRegionCode,
  DealsStoreInfo,
  FreeGamesSnapshot,
  NormalizedDealGame,
  ProviderHealthStatus,
} from './types';

function deduplicateDealGames(items: NormalizedDealGame[]): NormalizedDealGame[] {
  const byKey = new Map<string, NormalizedDealGame>();

  for (const game of items) {
    const existing = byKey.get(game.canonicalKey);
    if (!existing) {
      byKey.set(game.canonicalKey, {
        ...game,
        offers: [...game.offers],
        providers: [...game.providers],
      });
      continue;
    }

    // Never merge incompatible currencies on the primary comparison record
    if (existing.bestOffer.currency !== game.bestOffer.currency) {
      const altKey = `${game.canonicalKey}:${game.bestOffer.currency}`;
      if (!byKey.has(altKey)) {
        byKey.set(altKey, game);
      }
      continue;
    }

    const offerIds = new Set(existing.offers.map((o) => `${o.provider}:${o.storeId}:${o.offerId}`));
    for (const offer of game.offers) {
      const key = `${offer.provider}:${offer.storeId}:${offer.offerId}`;
      if (!offerIds.has(key)) {
        offerIds.add(key);
        existing.offers.push(offer);
      }
    }

    existing.offers.sort(
      (a, b) => a.salePrice - b.salePrice || b.savingsPercent - a.savingsPercent
    );
    existing.bestOffer = existing.offers[0];
    existing.providers = Array.from(new Set([...existing.providers, ...game.providers]));
    if (!existing.thumbUrl && game.thumbUrl) {
      existing.thumbUrl = game.thumbUrl;
    }
  }

  return Array.from(byKey.values());
}

export function getAllProviderHealthStatuses(): ProviderHealthStatus[] {
  const runtimeStatuses = getProviderHealthSnapshot();
  const byProvider = new Map(runtimeStatuses.map((s) => [s.provider, s]));

  if (!byProvider.has('cheapshark')) {
    byProvider.set('cheapshark', CheapSharkProvider.getHealth());
  }
  byProvider.set('isthereanydeal', IsThereAnyDealProvider.getHealth());

  return Array.from(byProvider.values());
}

export async function loadDealsOverview(
  region: DealsRegionCode,
  forceRefresh = false
): Promise<DealsOverviewSnapshot> {
  // Batch 3 lean CheapShark feeds + FreeGames feed cleanly (respecting rate limits & caching)
  const [ratingResult, savingsResult, recentResult, freeOffersResult] = await Promise.allSettled([
    CheapSharkProvider.fetchDeals({
      pageNumber: 0,
      pageSize: 36,
      sortBy: 'deal-rating',
      onSaleOnly: true,
      forceRefresh,
    }),
    CheapSharkProvider.fetchDeals({
      pageNumber: 0,
      pageSize: 24,
      sortBy: 'savings',
      onSaleOnly: true,
      forceRefresh,
    }),
    CheapSharkProvider.fetchDeals({
      pageNumber: 0,
      pageSize: 24,
      sortBy: 'recent',
      onSaleOnly: true,
      forceRefresh,
    }),
    FreeGamesProvider.fetchFreeOffers(region, forceRefresh),
  ]);

  const ratingItems =
    ratingResult.status === 'fulfilled' ? deduplicateDealGames(ratingResult.value.items) : [];
  const savingsItems =
    savingsResult.status === 'fulfilled' ? deduplicateDealGames(savingsResult.value.items) : [];
  const recentItems =
    recentResult.status === 'fulfilled' ? deduplicateDealGames(recentResult.value.items) : [];

  const allFailed =
    ratingResult.status === 'rejected' &&
    savingsResult.status === 'rejected' &&
    recentResult.status === 'rejected' &&
    freeOffersResult.status === 'rejected';

  if (allFailed) {
    throw ratingResult.reason instanceof Error
      ? ratingResult.reason
      : new Error('Unable to fetch deals from any provider.');
  }

  const baseStores =
    ratingResult.status === 'fulfilled'
      ? ratingResult.value.stores
      : savingsResult.status === 'fulfilled'
      ? savingsResult.value.stores
      : recentResult.status === 'fulfilled'
      ? recentResult.value.stores
      : [];

  // Enrich stores strictly from verified deals returned by CheapShark (never hardcoded)
  const combinedDeals = deduplicateDealGames([...ratingItems, ...savingsItems, ...recentItems]);
  const storeStats = new Map<string, { count: number; topSavings: number }>();
  for (const game of combinedDeals) {
    for (const offer of game.offers) {
      const prev = storeStats.get(offer.storeId) || { count: 0, topSavings: 0 };
      storeStats.set(offer.storeId, {
        count: prev.count + 1,
        topSavings: Math.max(prev.topSavings, offer.savingsPercent),
      });
    }
  }

  const verifiedStores: DealsStoreInfo[] = baseStores
    .filter((s) => s.isActive)
    .map((s) => ({
      ...s,
      activeDealCount: storeStats.get(s.storeId)?.count || 0,
      topSavingsPercent: storeStats.get(s.storeId)?.topSavings || 0,
    }));

  const featuredDeals = ratingItems.slice(0, 10);
  const bestDiscounts = savingsItems.slice(0, 12);
  const trendingDeals = [...ratingItems]
    .sort((a, b) => {
      const aScore = (a.bestOffer.steamRatingCount || 0) * (a.bestOffer.dealRating || 5);
      const bScore = (b.bestOffer.steamRatingCount || 0) * (b.bestOffer.dealRating || 5);
      return bScore - aScore;
    })
    .slice(0, 12);
  const recentlyUpdatedDeals = recentItems.slice(0, 12);
  const popularGames = [...combinedDeals]
    .sort(
      (a, b) =>
        (b.bestOffer.steamRatingCount || 0) - (a.bestOffer.steamRatingCount || 0) ||
        (b.bestOffer.metacriticScore || 0) - (a.bestOffer.metacriticScore || 0)
    )
    .slice(0, 12);

  const freeAll = freeOffersResult.status === 'fulfilled' ? freeOffersResult.value : [];
  const freeSpotlights = [
    ...freeAll.filter((f) => f.category === 'limited_time_free'),
    ...freeAll.filter((f) => f.category === 'giveaway').slice(0, 4),
  ].slice(0, 8);

  return {
    featuredDeals,
    bestDiscounts,
    trendingDeals,
    recentlyUpdatedDeals,
    popularGames,
    freeSpotlights,
    stores: verifiedStores,
    providerStatuses: getAllProviderHealthStatuses(),
    fetchedAt: Date.now(),
  };
}

export async function queryAllDeals(params: DealsQueryParams): Promise<DealsPageResult> {
  const result = await CheapSharkProvider.fetchDeals(params);
  return {
    ...result,
    items: deduplicateDealGames(result.items),
  };
}

export async function loadFreeGamesCatalog(
  region: DealsRegionCode,
  forceRefresh = false
): Promise<FreeGamesSnapshot> {
  const all = await FreeGamesProvider.fetchFreeOffers(region, forceRefresh);
  return {
    limitedTimeFree: all.filter((f) => f.category === 'limited_time_free'),
    giveaways: all.filter((f) => f.category === 'giveaway'),
    freeToPlay: all.filter((f) => f.category === 'free_to_play'),
    providerStatuses: getAllProviderHealthStatuses(),
    fetchedAt: Date.now(),
  };
}

export async function loadGameComparisonDetail(
  game: NormalizedDealGame,
  stores: DealsStoreInfo[],
  forceRefresh = false
): Promise<NormalizedDealGame> {
  if (!game.cheapsharkGameId) return game;
  const storesMap = new Map(stores.map((s) => [s.storeId, s]));
  const detailed = await CheapSharkProvider.fetchGameComparison(
    game.cheapsharkGameId,
    storesMap,
    forceRefresh
  );
  if (!detailed) return game;

  return {
    ...detailed,
    bestOffer: {
      ...detailed.bestOffer,
      metacriticScore: detailed.bestOffer.metacriticScore ?? game.bestOffer.metacriticScore,
      steamRatingPercent:
        detailed.bestOffer.steamRatingPercent ?? game.bestOffer.steamRatingPercent,
      steamRatingText: detailed.bestOffer.steamRatingText ?? game.bestOffer.steamRatingText,
      steamRatingCount: detailed.bestOffer.steamRatingCount ?? game.bestOffer.steamRatingCount,
      dealRating: detailed.bestOffer.dealRating ?? game.bestOffer.dealRating,
    },
  };
}

export function formatDealMoney(amount: number, currency = 'USD', locale = 'en-US'): string {
  if (!Number.isFinite(amount)) return '—';
  if (amount <= 0) return 'FREE';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatShortRelativeExpiry(
  expiresTimestamp: number | null,
  locale = 'en-US'
): string | null {
  if (!expiresTimestamp || !Number.isFinite(expiresTimestamp)) return null;
  const diffMs = expiresTimestamp - Date.now();
  if (diffMs <= 0) return null;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days >= 1) {
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
  }
  if (hours >= 1) {
    return `${hours}h`;
  }
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return `${mins}m (${new Date(expiresTimestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })})`;
}
