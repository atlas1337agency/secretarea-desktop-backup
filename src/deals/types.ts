export type DealsProviderId =
  | 'cheapshark'
  | 'isthereanydeal'
  | 'epic_official'
  | 'gamerpower'
  | 'freetogame'
  | 'fx'
  | 'steam_official'
  | 'steam_store'
  | 'steamdata'
  | 'game_census'
  | 'steam_index'
  | 'metacritic_apish'
  | 'opencritic_rapidapi';

export type OptionalCredentialProviderId =
  | 'steam_index'
  | 'metacritic_apish'
  | 'opencritic_rapidapi';

export interface ProviderCredentialStatusItem {
  id: OptionalCredentialProviderId;
  label: string;
  configured: boolean;
  maskedPreview: string | null;
  source: 'none' | 'safeStorage' | 'session_memory' | 'env';
}

export interface DealsCredentialsStatus {
  safeStorageAvailable: boolean;
  providers: Partial<Record<OptionalCredentialProviderId, ProviderCredentialStatusItem>>;
}

export type DealsRegionCode = 'US' | 'MA' | 'FR' | 'ES' | 'GB' | 'DE';

export type DealsCurrencyCode =
  | 'USD'
  | 'MAD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'SAR'
  | 'AED'
  | 'TRY'
  | 'BRL'
  | 'JPY';

export interface DealsRegionOption {
  code: DealsRegionCode;
  label: string;
  epicLocale: string;
  epicCountry: string;
  defaultCurrency: DealsCurrencyCode;
}

export const DEALS_REGION_OPTIONS: DealsRegionOption[] = [
  { code: 'US', label: 'United States', epicLocale: 'en-US', epicCountry: 'US', defaultCurrency: 'USD' },
  { code: 'MA', label: 'Morocco', epicLocale: 'en-US', epicCountry: 'MA', defaultCurrency: 'MAD' },
  { code: 'FR', label: 'France', epicLocale: 'fr-FR', epicCountry: 'FR', defaultCurrency: 'EUR' },
  { code: 'ES', label: 'Spain', epicLocale: 'es-ES', epicCountry: 'ES', defaultCurrency: 'EUR' },
  { code: 'GB', label: 'United Kingdom', epicLocale: 'en-GB', epicCountry: 'GB', defaultCurrency: 'GBP' },
  { code: 'DE', label: 'Germany', epicLocale: 'de-DE', epicCountry: 'DE', defaultCurrency: 'EUR' },
];

export const REGION_DEFAULT_CURRENCY: Record<DealsRegionCode, DealsCurrencyCode> = {
  US: 'USD',
  MA: 'MAD',
  FR: 'EUR',
  ES: 'EUR',
  GB: 'GBP',
  DE: 'EUR',
};

export interface DealsCurrencyOption {
  code: DealsCurrencyCode;
  symbol: string;
  decimals: number;
  quickPick?: boolean;
}

export const DEALS_CURRENCY_OPTIONS: DealsCurrencyOption[] = [
  { code: 'USD', symbol: '$', decimals: 2, quickPick: true },
  { code: 'EUR', symbol: '€', decimals: 2, quickPick: true },
  { code: 'MAD', symbol: 'DH', decimals: 2, quickPick: true },
  { code: 'GBP', symbol: '£', decimals: 2, quickPick: true },
  { code: 'CAD', symbol: 'C$', decimals: 2 },
  { code: 'SAR', symbol: 'SAR', decimals: 2 },
  { code: 'AED', symbol: 'AED', decimals: 2 },
  { code: 'TRY', symbol: '₺', decimals: 2 },
  { code: 'BRL', symbol: 'R$', decimals: 2 },
  { code: 'JPY', symbol: '¥', decimals: 0 },
];

export interface ExchangeRateSnapshot {
  base: 'USD';
  rates: Record<string, number>;
  source: string;
  updatedAtText: string | null;
  fetchedAt: number;
}

export type DealsHubSectionTab =
  | 'overview'
  | 'all-deals'
  | 'live-players'
  | 'free-games'
  | 'compare'
  | 'alerts'
  | 'stores';

export type DealsSortOption =
  | 'deal-rating'
  | 'savings'
  | 'price-asc'
  | 'price-desc'
  | 'recent'
  | 'metacritic'
  | 'title';

export type FreeOfferCategory = 'limited_time_free' | 'giveaway' | 'free_to_play';
export type FreeStoreFilter = 'all' | 'epic' | 'steam' | 'gog' | 'pc_dlc';

export interface DealsStoreInfo {
  storeId: string;
  storeName: string;
  isActive: boolean;
  bannerUrl: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
  provider: DealsProviderId;
  activeDealCount?: number;
  topSavingsPercent?: number;
}

export interface DealOffer {
  offerId: string;
  provider: DealsProviderId;
  providerLabel: string;
  storeId: string;
  storeName: string;
  storeLogoUrl: string | null;
  storeIconUrl: string | null;
  currency: string;
  salePrice: number;
  normalPrice: number;
  savingsPercent: number;
  dealRating: number | null;
  metacriticScore: number | null;
  steamRatingPercent: number | null;
  steamRatingText: string | null;
  steamRatingCount: number | null;
  dealUrl: string;
  isFreeNow: boolean;
  isOnSale: boolean;
  lastChangeTimestamp: number | null;
  releaseDateTimestamp: number | null;
}

export interface NormalizedDealGame {
  canonicalKey: string;
  title: string;
  editionTag: string | null;
  steamAppId: string | null;
  cheapsharkGameId: string | null;
  thumbUrl: string | null;
  bestOffer: DealOffer;
  offers: DealOffer[];
  cheapestEver: {
    price: number;
    currency: string;
    dateTimestamp: number;
  } | null;
  providers: DealsProviderId[];
}

export interface NormalizedFreeOffer {
  id: string;
  dedupeKey: string;
  provider: DealsProviderId;
  providerLabel: string;
  category: FreeOfferCategory;
  title: string;
  description: string;
  coverUrl: string | null;
  storeName: string;
  storeKey: string;
  offerTypeLabel: string;
  isDlcOrReward?: boolean;
  originalPriceText: string | null;
  currency: string | null;
  expiresAtIso: string | null;
  expiresTimestamp: number | null;
  publishedAtText: string | null;
  url: string;
  genre: string | null;
  instructions: string | null;
}

export type ProviderAvailabilityState =
  | 'ok'
  | 'rate_limited'
  | 'cors_limited'
  | 'offline'
  | 'error'
  | 'requires_key'
  | 'requires_approval';

export interface ProviderHealthStatus {
  provider: DealsProviderId;
  name: string;
  state: ProviderAvailabilityState;
  lastSuccessAt: number | null;
  retryAfterSec: number | null;
  message: string;
}

export interface DealsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  storeIds?: string[];
  lowerPrice?: number;
  upperPrice?: number;
  minSavings?: number;
  title?: string;
  sortBy?: DealsSortOption;
  onSaleOnly?: boolean;
  forceRefresh?: boolean;
}

export interface DealsPageResult {
  items: NormalizedDealGame[];
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  stores: DealsStoreInfo[];
  fetchedAt: number;
  currency: string;
}

export type GameHealthTier =
  | 'thriving'
  | 'healthy'
  | 'cooling'
  | 'quiet'
  | 'dormant'
  | 'unknown';

export type PlayerHistoryRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface PlayerHistoryPoint {
  timestamp: number;
  playerCount: number;
}

export interface PriceHistoryPoint {
  timestamp: number;
  priceUsd: number;
  normalPriceUsd: number | null;
  discountPercent: number;
  isLowest?: boolean;
  note?: string | null;
}

export interface SteamLiveRankEntry {
  appId: string;
  rank: number;
  previousRank: number | null;
  rankDelta: number | null;
  title: string;
  headerImage: string | null;
  currentPlayers: number;
  peak24h: number | null;
  dayAgoPlayers: number | null;
  dayChangeFraction: number | null;
  trendSpark: number[];
  recordedAt: number;
  onSalePercent: number | null;
  salePriceUsd: number | null;
  normalPriceUsd: number | null;
  isLowestPrice: boolean;
  isNewRelease: boolean;
  hasUpdateBump: boolean;
  hasSaleBump: boolean;
  discountShame: boolean;
  source: 'steamdata' | 'steam_official';
  sourceUrl: string;
}

export interface CensusMoverEntry {
  appId: string;
  title: string;
  direction: 'rising' | 'falling';
  positiveVelocity: number;
  negativeVelocity: number;
  positiveRatio: number | null;
  recentReviews?: number | null;
  baselineReviews?: number | null;
  deltaPct?: number | null;
  healthTier: GameHealthTier;
  ccuLatest: number | null;
  recordedAt: number | null;
  sourceUrl: string;
}

export interface SteamReviewEntry {
  recommendationId: string;
  authorSteamId: string;
  playtimeHours: number;
  votedUp: boolean;
  reviewText: string;
  timestampCreated: number;
  votesUp: number;
  votesFunny: number;
  reviewUrl: string;
}

export interface SteamReviewSummary {
  positive: number;
  negative: number;
  total: number;
  positivePercent: number | null;
  label: string | null;
  scoreTier: number | null;
  recordedAt: number | null;
  source: string;
  sourceUrl: string;
  isCensusSnapshot: boolean;
  dailyTrend: Array<{ timestamp: number; positive: number; negative: number }>;
  reviews: SteamReviewEntry[];
  steamReviewsNotice?: string | null;
}

export interface SeparateCriticCards {
  steamUserRating: {
    scorePercent: number | null;
    label: string | null;
    reviewCount: number | null;
    sourceUrl: string;
    sourceName: string;
  };
  metacriticMetascore: {
    score: number | null;
    scaleMax: 100;
    verdict: string | null;
    reviewCount: number | null;
    sourceUrl: string | null;
    sourceName: string;
    requiresKey: boolean;
  };
  metacriticUserScore: {
    score: number | null;
    scaleMax: 10;
    verdict: string | null;
    reviewCount: number | null;
    sourceUrl: string | null;
    sourceName: string;
    requiresKey: boolean;
  };
  openCriticScore: {
    topCriticScore: number | null;
    scaleMax: 100;
    percentRecommended: number | null;
    tier: string | null;
    numReviews: number | null;
    sourceUrl: string | null;
    sourceName: string;
    requiresKey: boolean;
  };
}

export interface GameAchievementStat {
  apiName: string;
  displayName: string;
  globalPercent: number;
  description?: string | null;
  iconUrl?: string | null;
}

export interface GameNewsItem {
  gid: string;
  title: string;
  url: string;
  author: string;
  dateTimestamp: number;
  feedLabel: string;
  summary: string;
}

export interface SteamDataUpdateImpact {
  timestamp: number;
  title: string;
  gid: string | null;
  kind: string | null;
  beforePlayers: number | null;
  afterPlayers: number | null;
  changeFraction: number | null;
}

export interface GameIntelligenceDossier {
  steamAppId: string | null;
  cheapsharkGameId: string | null;
  title: string;
  headerImage: string | null;
  shortDescription: string | null;
  developers: string[];
  publishers: string[];
  releaseDateText: string | null;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  genres: string[];
  currentPlayers: number | null;
  peak24h: number | null;
  peak30d: number | null;
  dayChangeFraction: number | null;
  playersRecordedAt: number | null;
  rank: number | null;
  healthTier: GameHealthTier;
  healthUpdatedAt: number | null;
  discountShame: {
    flagged: boolean;
    raisedFromUsd?: number | null;
    advertisedDiscount?: number | null;
    realDiscount?: number | null;
  } | null;
  playerHistory: PlayerHistoryPoint[];
  playerHistoryRange: PlayerHistoryRange;
  priceHistory: PriceHistoryPoint[];
  reviewSummary: SteamReviewSummary | null;
  criticCards: SeparateCriticCards;
  achievementsTotal: number | null;
  achievements: GameAchievementStat[];
  news: GameNewsItem[];
  steamDataUpdates: SteamDataUpdateImpact[];
  dealSummary: NormalizedDealGame | null;
  attributions: Array<{ label: string; url: string }>;
  fetchedAt: number;
}

export interface LiveIntelligenceSnapshot {
  topPlayers: SteamLiveRankEntry[];
  mostPlayedOfficial: SteamLiveRankEntry[];
  trendingToday: SteamLiveRankEntry[];
  biggestGains: SteamLiveRankEntry[];
  biggestDeclines: SteamLiveRankEntry[];
  popularNewReleases: SteamLiveRankEntry[];
  censusRising: CensusMoverEntry[];
  censusFalling: CensusMoverEntry[];
  fetchedAt: number;
}

export interface DealsOverviewSnapshot {
  featuredDeals: NormalizedDealGame[];
  bestDiscounts: NormalizedDealGame[];
  trendingDeals: NormalizedDealGame[];
  recentlyUpdatedDeals: NormalizedDealGame[];
  popularGames: NormalizedDealGame[];
  freeSpotlights: NormalizedFreeOffer[];
  stores: DealsStoreInfo[];
  providerStatuses: ProviderHealthStatus[];
  fetchedAt: number;
}

export interface FreeGamesSnapshot {
  limitedTimeFree: NormalizedFreeOffer[];
  giveaways: NormalizedFreeOffer[];
  freeToPlay: NormalizedFreeOffer[];
  providerStatuses: ProviderHealthStatus[];
  fetchedAt: number;
}

export interface PriceAlertRule {
  id: string;
  canonicalKey: string;
  title: string;
  steamAppId: string | null;
  cheapsharkGameId: string | null;
  thumbUrl: string | null;
  targetPriceUsd: number | null;
  lastKnownPriceUsd: number | null;
  lastCheckedAt: number | null;
  createdAt: number;
}

export interface PriceAlertEvent {
  id: string;
  ruleId: string;
  canonicalKey: string;
  title: string;
  oldPriceUsd: number | null;
  newPriceUsd: number;
  savingsPercent: number;
  storeName: string;
  dealUrl: string;
  triggeredAt: number;
  read: boolean;
}
