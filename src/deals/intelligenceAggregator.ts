import { CheapSharkProvider } from './providers/cheapSharkProvider';
import { CriticsProvider } from './providers/criticsProvider';
import { GameCensusProvider } from './providers/gameCensusProvider';
import { SteamDataProvider } from './providers/steamDataProvider';
import { SteamIndexProvider } from './providers/steamIndexProvider';
import { SteamProvider } from './providers/steamProvider';
import type {
  DealsStoreInfo,
  GameAchievementStat,
  GameIntelligenceDossier,
  LiveIntelligenceSnapshot,
  NormalizedDealGame,
  PlayerHistoryRange,
  PriceHistoryPoint,
  SeparateCriticCards,
  SteamLiveRankEntry,
  SteamReviewSummary,
} from './types';

export interface DossierTargetInput {
  steamAppId?: string | null;
  cheapsharkGameId?: string | null;
  title?: string;
  thumbUrl?: string | null;
  dealGame?: NormalizedDealGame | null;
  liveEntry?: SteamLiveRankEntry | null;
}

export interface IntelligenceSearchOption {
  key: string;
  title: string;
  steamAppId: string | null;
  cheapsharkGameId: string | null;
  thumbUrl: string | null;
  currentPlayers: number | null;
  salePriceUsd: number | null;
}

export async function loadLiveIntelligence(
  forceRefresh = false
): Promise<LiveIntelligenceSnapshot> {
  const [
    sdTopRes,
    sdTrendingRes,
    sdMoversRes,
    sdNewReleasesRes,
    steamOfficialMostPlayedRes,
    steamConcurrentRes,
    censusRisingRes,
    censusFallingRes,
  ] = await Promise.allSettled([
    SteamDataProvider.fetchTopConcurrentApps(100, forceRefresh),
    SteamDataProvider.fetchTrending(16, forceRefresh),
    SteamDataProvider.fetchMovers(24, forceRefresh),
    SteamDataProvider.fetchTagApps('new_release', 'recent', 12, forceRefresh),
    SteamProvider.fetchMostPlayedOfficialRanks(forceRefresh),
    SteamProvider.fetchConcurrentPlayersCharts(forceRefresh),
    GameCensusProvider.fetchMovers('rising', 12, forceRefresh),
    GameCensusProvider.fetchMovers('falling', 12, forceRefresh),
  ]);

  const sdTop = sdTopRes.status === 'fulfilled' ? sdTopRes.value : [];
  const sdTrending = sdTrendingRes.status === 'fulfilled' ? sdTrendingRes.value : [];
  const sdMovers = sdMoversRes.status === 'fulfilled' ? sdMoversRes.value : [];
  const sdNewReleases = sdNewReleasesRes.status === 'fulfilled' ? sdNewReleasesRes.value : [];
  const officialMostPlayedRaw =
    steamOfficialMostPlayedRes.status === 'fulfilled' ? steamOfficialMostPlayedRes.value : [];
  const steamConcurrent =
    steamConcurrentRes.status === 'fulfilled' ? steamConcurrentRes.value : null;

  // Map known titles/images/stats from SteamData onto official Steam rank lists
  const byAppId = new Map<string, SteamLiveRankEntry>();
  for (const item of [...sdTop, ...sdTrending, ...sdMovers, ...sdNewReleases]) {
    byAppId.set(item.appId, item);
  }

  // Enrich sdTop currentPlayers if official Steam Concurrent returned even fresher timestamp
  if (steamConcurrent?.ranks?.length) {
    const officialMap = new Map(steamConcurrent.ranks.map((r) => [r.appId, r]));
    for (const item of sdTop) {
      const off = officialMap.get(item.appId);
      if (off && steamConcurrent.lastUpdate > item.recordedAt && off.concurrentInGame > 0) {
        item.currentPlayers = off.concurrentInGame;
        item.recordedAt = steamConcurrent.lastUpdate;
      }
    }
  }

  const mostPlayedOfficial: SteamLiveRankEntry[] = officialMostPlayedRaw.map((entry) => {
    const enriched = byAppId.get(entry.appId);
    if (!enriched) return entry;
    return {
      ...entry,
      title: enriched.title,
      headerImage: enriched.headerImage || entry.headerImage,
      currentPlayers: enriched.currentPlayers || entry.currentPlayers,
      dayChangeFraction: enriched.dayChangeFraction,
      trendSpark: enriched.trendSpark,
      onSalePercent: enriched.onSalePercent,
      salePriceUsd: enriched.salePriceUsd,
      normalPriceUsd: enriched.normalPriceUsd,
      source: 'steam_official',
    };
  });

  // Derive biggest gainers & biggest declines from movers + top 100
  const poolMap = new Map<string, SteamLiveRankEntry>();
  for (const entry of [...sdMovers, ...sdTop]) {
    if (!poolMap.has(entry.appId)) {
      poolMap.set(entry.appId, entry);
    }
  }
  const pool = Array.from(poolMap.values()).filter(
    (x) => typeof x.dayChangeFraction === 'number' && Number.isFinite(x.dayChangeFraction)
  );

  const biggestGains = [...pool]
    .filter((x) => (x.dayChangeFraction || 0) > 0.02)
    .sort((a, b) => (b.dayChangeFraction || 0) - (a.dayChangeFraction || 0))
    .slice(0, 20);

  const biggestDeclines = [...pool]
    .filter((x) => (x.dayChangeFraction || 0) < -0.02)
    .sort((a, b) => (a.dayChangeFraction || 0) - (b.dayChangeFraction || 0))
    .slice(0, 20);

  return {
    topPlayers: sdTop,
    mostPlayedOfficial:
      mostPlayedOfficial.length > 0 ? mostPlayedOfficial.slice(0, 50) : sdTop.slice(0, 50),
    trendingToday: sdTrending.length > 0 ? sdTrending : sdTop.slice(0, 12),
    biggestGains,
    biggestDeclines,
    popularNewReleases: sdNewReleases,
    censusRising: censusRisingRes.status === 'fulfilled' ? censusRisingRes.value : [],
    censusFalling: censusFallingRes.status === 'fulfilled' ? censusFallingRes.value : [],
    fetchedAt: Date.now(),
  };
}

export async function searchIntelligenceGames(
  query: string,
  forceRefresh = false
): Promise<IntelligenceSearchOption[]> {
  const clean = query.trim();
  if (!clean) return [];

  const [sdRes, csRes] = await Promise.allSettled([
    SteamDataProvider.searchApps(clean, forceRefresh),
    CheapSharkProvider.searchGamesMaster(clean, 15, forceRefresh),
  ]);

  const byKey = new Map<string, IntelligenceSearchOption>();

  if (sdRes.status === 'fulfilled') {
    for (const item of sdRes.value.slice(0, 12)) {
      const key = `steam:${item.appId}`;
      byKey.set(key, {
        key,
        title: item.title,
        steamAppId: item.appId,
        cheapsharkGameId: null,
        thumbUrl: item.headerImage,
        currentPlayers: item.currentPlayers,
        salePriceUsd: item.salePriceUsd,
      });
    }
  }

  if (csRes.status === 'fulfilled') {
    for (const cs of csRes.value.slice(0, 12)) {
      const steamId = cs.steamAppID ? String(cs.steamAppID).trim() : null;
      const key = steamId ? `steam:${steamId}` : `cs:${cs.gameID}`;
      const existing = byKey.get(key);
      const cheapest = cs.cheapest ? Number(cs.cheapest) : null;
      if (existing) {
        existing.cheapsharkGameId = String(cs.gameID);
        if (existing.salePriceUsd === null && cheapest !== null && Number.isFinite(cheapest)) {
          existing.salePriceUsd = cheapest;
        }
      } else {
        byKey.set(key, {
          key,
          title: (cs.external || `Game #${cs.gameID}`).trim(),
          steamAppId: steamId,
          cheapsharkGameId: String(cs.gameID),
          thumbUrl: cs.thumb || null,
          currentPlayers: null,
          salePriceUsd: cheapest !== null && Number.isFinite(cheapest) ? cheapest : null,
        });
      }
    }
  }

  return Array.from(byKey.values()).slice(0, 18);
}

export async function loadGameIntelligenceDossier(
  target: DossierTargetInput,
  stores: DealsStoreInfo[] = [],
  historyRange: PlayerHistoryRange = '7d',
  forceRefresh = false
): Promise<GameIntelligenceDossier> {
  const baseTitle =
    target.title ||
    target.dealGame?.title ||
    target.liveEntry?.title ||
    (target.steamAppId ? `Steam App #${target.steamAppId}` : 'PC Game');

  let steamAppId =
    target.steamAppId ||
    target.dealGame?.steamAppId ||
    target.liveEntry?.appId ||
    null;

  let cheapsharkGameId =
    target.cheapsharkGameId || target.dealGame?.cheapsharkGameId || null;

  // Resolve CheapShark ID or SteamAppID cross-reference if one is missing
  if (!cheapsharkGameId && (baseTitle || steamAppId)) {
    try {
      const searchHits = await CheapSharkProvider.searchGamesMaster(
        baseTitle,
        6,
        forceRefresh
      );
      const matched =
        (steamAppId && searchHits.find((h) => String(h.steamAppID || '') === steamAppId)) ||
        searchHits[0];
      if (matched?.gameID) {
        cheapsharkGameId = String(matched.gameID);
        if (!steamAppId && matched.steamAppID) {
          steamAppId = String(matched.steamAppID).trim();
        }
      }
    } catch {
      // Non-fatal
    }
  }

  const storesMap = new Map(stores.map((s) => [s.storeId, s]));

  const [
    dealDetailRes,
    steamAppDetailsRes,
    steamLiveCcuRes,
    steamDataDetailRes,
    steamDataHistRes,
    censusGameRes,
    censusCcuRes,
    censusReviewsTrendRes,
    steamStoreReviewsRes,
    steamAchRes,
    steamNewsRes,
    steamIdxPriceHistRes,
    steamIdxAchRes,
    apiShMetaRes,
    openCriticRes,
  ] = await Promise.allSettled([
    cheapsharkGameId
      ? CheapSharkProvider.fetchGameComparison(cheapsharkGameId, storesMap, forceRefresh)
      : Promise.resolve(target.dealGame || null),
    steamAppId ? SteamProvider.fetchAppDetails(steamAppId, forceRefresh) : Promise.resolve(null),
    steamAppId
      ? SteamProvider.fetchNumberOfCurrentPlayers(steamAppId, forceRefresh)
      : Promise.resolve(null),
    steamAppId ? SteamDataProvider.fetchAppDetail(steamAppId, forceRefresh) : Promise.resolve(null),
    steamAppId
      ? SteamDataProvider.fetchPlayerHistory(steamAppId, historyRange, forceRefresh)
      : Promise.resolve({ points: [], priceHistory: [] }),
    steamAppId ? GameCensusProvider.fetchGameOverview(steamAppId, forceRefresh) : Promise.resolve(null),
    steamAppId
      ? GameCensusProvider.fetchDailyPlayerHistory(steamAppId, forceRefresh)
      : Promise.resolve([]),
    steamAppId
      ? GameCensusProvider.fetchReviewTrend(steamAppId, forceRefresh)
      : Promise.resolve([]),
    steamAppId
      ? SteamProvider.fetchStoreUserReviews(steamAppId, 'all', forceRefresh)
      : Promise.resolve(null),
    steamAppId ? SteamProvider.fetchGlobalAchievements(steamAppId, [], forceRefresh) : Promise.resolve([]),
    steamAppId ? SteamProvider.fetchAppNews(steamAppId, 8, forceRefresh) : Promise.resolve([]),
    steamAppId ? SteamIndexProvider.fetchPriceHistory(steamAppId, forceRefresh) : Promise.resolve([]),
    steamAppId
      ? SteamIndexProvider.fetchAchievementsWithNames(steamAppId, forceRefresh)
      : Promise.resolve([]),
    CriticsProvider.fetchMetacriticViaApiSh(baseTitle, forceRefresh),
    CriticsProvider.fetchOpenCriticViaRapidApi(baseTitle, forceRefresh),
  ]);

  const dealSummary =
    dealDetailRes.status === 'fulfilled' && dealDetailRes.value
      ? dealDetailRes.value
      : target.dealGame || null;

  const steamDetails =
    steamAppDetailsRes.status === 'fulfilled' ? steamAppDetailsRes.value : null;
  const steamLiveCcu =
    steamLiveCcuRes.status === 'fulfilled' ? steamLiveCcuRes.value : null;
  const sdDetail =
    steamDataDetailRes.status === 'fulfilled' ? steamDataDetailRes.value : null;
  const sdHistory =
    steamDataHistRes.status === 'fulfilled'
      ? steamDataHistRes.value
      : { points: [], priceHistory: [] };
  const censusGame =
    censusGameRes.status === 'fulfilled' ? censusGameRes.value : null;
  const censusCcu = censusCcuRes.status === 'fulfilled' ? censusCcuRes.value : [];
  const censusReviewTrend =
    censusReviewsTrendRes.status === 'fulfilled' ? censusReviewsTrendRes.value : [];
  const steamReviews =
    steamStoreReviewsRes.status === 'fulfilled' ? steamStoreReviewsRes.value : null;
  const steamAch = steamAchRes.status === 'fulfilled' ? steamAchRes.value : [];
  const steamIdxAch = steamIdxAchRes.status === 'fulfilled' ? steamIdxAchRes.value : [];
  const steamNews = steamNewsRes.status === 'fulfilled' ? steamNewsRes.value : [];
  const steamIdxPriceHist =
    steamIdxPriceHistRes.status === 'fulfilled' ? steamIdxPriceHistRes.value : [];
  const apiShMeta = apiShMetaRes.status === 'fulfilled' ? apiShMetaRes.value : null;
  const openCritic = openCriticRes.status === 'fulfilled' ? openCriticRes.value : null;

  const resolvedTitle =
    steamDetails?.name || sdDetail?.name || dealSummary?.title || baseTitle;
  const resolvedImage =
    steamDetails?.headerImage ||
    sdDetail?.headerImage ||
    target.liveEntry?.headerImage ||
    dealSummary?.thumbUrl ||
    target.thumbUrl ||
    null;

  // Player history selection: SteamData hourly/daily points preferred, fallback to Game Census 400-day daily CCU
  const playerHistory =
    sdHistory.points.length > 0 && historyRange !== 'all'
      ? sdHistory.points
      : censusCcu.length > 0 && (sdHistory.points.length === 0 || historyRange === 'all')
      ? censusCcu
      : sdHistory.points;

  // Merge price history points cleanly (SteamData sales + SteamIndex history + CheapShark cheapestEver)
  const priceHistoryMap = new Map<string, PriceHistoryPoint>();
  for (const pt of [...sdDetail?.priceHistory || [], ...sdHistory.priceHistory, ...steamIdxPriceHist]) {
    const key = `${Math.floor(pt.timestamp / (24 * 60 * 60 * 1000))}:${pt.priceUsd.toFixed(2)}`;
    if (!priceHistoryMap.has(key)) {
      priceHistoryMap.set(key, pt);
    }
  }
  if (dealSummary?.cheapestEver && dealSummary.cheapestEver.dateTimestamp > 0) {
    const ts = dealSummary.cheapestEver.dateTimestamp * 1000;
    priceHistoryMap.set(`atl:${dealSummary.cheapestEver.price.toFixed(2)}`, {
      timestamp: ts,
      priceUsd: dealSummary.cheapestEver.price,
      normalPriceUsd: dealSummary.bestOffer.normalPrice || null,
      discountPercent: dealSummary.bestOffer.savingsPercent,
      isLowest: true,
      note: 'CheapShark All-Time Low',
    });
  }
  const priceHistory = Array.from(priceHistoryMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  // Merge achievements (prefer SteamIdx readable names if available, enriched with Steam Official percentages)
  const achievements: GameAchievementStat[] =
    steamIdxAch.length > 0 ? steamIdxAch : steamAch;

  // Review summary: combine official Steam Store Reviews (with written reviews) + The Game Census snapshot + CheapShark fallback
  const censusPos = censusGame?.positiveReviews ?? null;
  const censusNeg = censusGame?.negativeReviews ?? null;
  const csPct = dealSummary?.bestOffer.steamRatingPercent ?? null;
  const csCount = dealSummary?.bestOffer.steamRatingCount ?? null;
  const csLabel = dealSummary?.bestOffer.steamRatingText ?? null;

  let reviewSummary: SteamReviewSummary | null = null;
  if (steamReviews) {
    reviewSummary = {
      positive: steamReviews.positive ?? 0,
      negative: steamReviews.negative ?? 0,
      total: steamReviews.total ?? 0,
      positivePercent: steamReviews.positivePercent ?? null,
      label: steamReviews.label ?? csLabel,
      scoreTier: steamReviews.scoreTier ?? censusGame?.reviewScoreTier ?? null,
      recordedAt: steamReviews.recordedAt ?? Date.now(),
      source: 'Steam Store User Reviews',
      sourceUrl:
        steamReviews.sourceUrl ||
        `https://store.steampowered.com/app/${steamAppId}/#app_reviews_hash`,
      isCensusSnapshot: false,
      dailyTrend: censusReviewTrend,
      reviews: steamReviews.reviews || [],
      steamReviewsNotice: null,
    };
  } else if (censusPos !== null && censusNeg !== null) {
    const total = censusPos + censusNeg;
    reviewSummary = {
      positive: censusPos,
      negative: censusNeg,
      total,
      positivePercent: total > 0 ? Math.round((censusPos / total) * 100) : null,
      label: censusGame?.reviewScoreDesc || csLabel,
      scoreTier: censusGame?.reviewScoreTier ?? null,
      recordedAt: censusGame?.reviewsRecordedAt ?? censusGame?.healthUpdatedAt ?? null,
      source: 'The Game Census (Snapshot)',
      sourceUrl:
        censusGame?.sourceUrl ||
        `https://store.steampowered.com/app/${steamAppId}/#app_reviews_hash`,
      isCensusSnapshot: true,
      dailyTrend: censusReviewTrend,
      reviews: [],
      steamReviewsNotice: steamAppId
        ? 'Individual written Steam reviews could not be fetched directly from this network; displaying verified aggregate review metrics & daily trend from The Game Census.'
        : null,
    };
  } else if (csPct !== null && csCount !== null) {
    const pos = Math.round((csCount * csPct) / 100);
    const neg = Math.max(0, csCount - pos);
    reviewSummary = {
      positive: pos,
      negative: neg,
      total: csCount,
      positivePercent: csPct,
      label: csLabel,
      scoreTier: null,
      recordedAt: null,
      source: 'CheapShark Steam Summary',
      sourceUrl: steamAppId
        ? `https://store.steampowered.com/app/${steamAppId}/#app_reviews_hash`
        : dealSummary?.bestOffer.dealUrl || 'https://store.steampowered.com/',
      isCensusSnapshot: true,
      dailyTrend: censusReviewTrend,
      reviews: [],
      steamReviewsNotice: null,
    };
  }

  // Strictly separate critic & rating cards (NEVER average across scales!)
  const steamPercent =
    reviewSummary?.positivePercent ?? dealSummary?.bestOffer.steamRatingPercent ?? null;
  const steamTotal = reviewSummary?.total ?? dealSummary?.bestOffer.steamRatingCount ?? null;
  const metascoreValue =
    apiShMeta?.metascore ??
    steamDetails?.metacriticScore ??
    dealSummary?.bestOffer.metacriticScore ??
    null;

  const criticCards: SeparateCriticCards = {
    steamUserRating: {
      scorePercent: steamPercent,
      label: reviewSummary?.label || dealSummary?.bestOffer.steamRatingText || null,
      reviewCount: steamTotal,
      sourceUrl: steamAppId
        ? `https://store.steampowered.com/app/${steamAppId}/#app_reviews_hash`
        : 'https://store.steampowered.com/',
      sourceName: reviewSummary?.source || 'Steam Reviews',
    },
    metacriticMetascore: {
      score: metascoreValue,
      scaleMax: 100,
      verdict: apiShMeta?.metascoreSentiment || null,
      reviewCount: apiShMeta?.metascoreCount ?? null,
      sourceUrl: apiShMeta?.url || steamDetails?.metacriticUrl || null,
      sourceName: apiShMeta?.metascore ? 'Metacritic (API.SH)' : 'Metacritic (via Steam/CheapShark)',
      requiresKey: Boolean(apiShMeta?.requiresKey && metascoreValue === null),
    },
    metacriticUserScore: {
      score: apiShMeta?.userScore ?? null,
      scaleMax: 10,
      verdict: apiShMeta?.userSentiment || null,
      reviewCount: apiShMeta?.userScoreCount ?? null,
      sourceUrl: apiShMeta?.url || steamDetails?.metacriticUrl || null,
      sourceName: 'Metacritic User Score (API.SH)',
      requiresKey: Boolean(apiShMeta?.requiresKey && apiShMeta?.userScore === null),
    },
    openCriticScore: {
      topCriticScore: openCritic?.topCriticScore ?? null,
      scaleMax: 100,
      percentRecommended: openCritic?.percentRecommended ?? null,
      tier: openCritic?.tier ?? null,
      numReviews: openCritic?.numReviews ?? null,
      sourceUrl: openCritic?.url ?? null,
      sourceName: 'OpenCritic (RapidAPI)',
      requiresKey: Boolean(openCritic?.requiresKey && openCritic?.topCriticScore === null),
    },
  };

  const attributions: Array<{ label: string; url: string }> = [];
  if (steamAppId) {
    attributions.push({
      label: 'Steam Store & Web API',
      url: `https://store.steampowered.com/app/${steamAppId}/`,
    });
  }
  if (sdDetail || sdHistory.points.length > 0) {
    attributions.push({
      label: 'SteamData',
      url: steamAppId ? `https://steamdata.dev/app/${steamAppId}` : 'https://steamdata.dev/',
    });
  }
  if (censusGame || censusCcu.length > 0 || censusReviewTrend.length > 0) {
    attributions.push({
      label: 'The Game Census (CC BY 4.0)',
      url: censusGame?.sourceUrl || 'https://thegamecensus.com/data',
    });
  }
  if (dealSummary) {
    attributions.push({
      label: 'CheapShark',
      url: 'https://www.cheapshark.com/',
    });
  }

  return {
    steamAppId,
    cheapsharkGameId,
    title: resolvedTitle,
    headerImage: resolvedImage,
    shortDescription: steamDetails?.shortDescription || null,
    developers: steamDetails?.developers || [],
    publishers: steamDetails?.publishers || [],
    releaseDateText: steamDetails?.releaseDateText || null,
    platforms: steamDetails?.platforms || { windows: true, mac: false, linux: false },
    genres: steamDetails?.genres || [],
    currentPlayers:
      steamLiveCcu ??
      sdDetail?.currentPlayers ??
      target.liveEntry?.currentPlayers ??
      censusGame?.ccuLatest ??
      null,
    peak24h: sdDetail?.peak24h ?? target.liveEntry?.peak24h ?? null,
    peak30d: censusGame?.peak30d ?? null,
    dayChangeFraction: sdDetail?.dayChangeFraction ?? target.liveEntry?.dayChangeFraction ?? null,
    playersRecordedAt:
      steamLiveCcu !== null
        ? Date.now()
        : sdDetail?.recordedAt ?? censusGame?.ccuLatestAt ?? null,
    rank: sdDetail?.rank ?? target.liveEntry?.rank ?? null,
    healthTier: censusGame?.healthTier ?? 'unknown',
    healthUpdatedAt: censusGame?.healthUpdatedAt ?? null,
    discountShame: sdDetail?.discountShame ?? null,
    playerHistory,
    playerHistoryRange: historyRange,
    priceHistory,
    reviewSummary,
    criticCards,
    achievementsTotal: steamDetails?.achievementsTotal ?? (achievements.length || null),
    achievements,
    news: steamNews,
    steamDataUpdates: sdDetail?.updates || [],
    dealSummary,
    attributions,
    fetchedAt: Date.now(),
  };
}
