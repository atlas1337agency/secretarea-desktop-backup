import type {
  DealsPageResult,
  DealsProviderId,
  DealsQueryParams,
  DealsRegionCode,
  DealsStoreInfo,
  NormalizedDealGame,
  NormalizedFreeOffer,
  ProviderHealthStatus,
} from '../types';

export interface DealsProviderAdapter {
  readonly id: DealsProviderId;
  readonly displayName: string;
  readonly attributionUrl: string;
  isPermitted(): boolean;
  getHealth(): ProviderHealthStatus;
  getStores(forceRefresh?: boolean): Promise<DealsStoreInfo[]>;
  fetchDeals(params: DealsQueryParams): Promise<DealsPageResult>;
  fetchGameComparison(
    gameId: string,
    storesMap?: Map<string, DealsStoreInfo>,
    forceRefresh?: boolean
  ): Promise<NormalizedDealGame | null>;
}

export interface FreeGamesProviderAdapter {
  readonly id: DealsProviderId;
  readonly displayName: string;
  fetchFreeOffers(
    region: DealsRegionCode,
    forceRefresh?: boolean
  ): Promise<NormalizedFreeOffer[]>;
}
