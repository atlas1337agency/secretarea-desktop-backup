import type {
  DealsPageResult,
  DealsQueryParams,
  DealsStoreInfo,
  NormalizedDealGame,
  ProviderHealthStatus,
} from '../types';
import type { DealsProviderAdapter } from './types';

/**
 * IsThereAnyDeal (ITAD) Provider Adapter
 *
 * Terms of Service Compliance Notice:
 * According to IsThereAnyDeal's official API Terms of Service (docs.isthereanydeal.com):
 * 1. An approved registered Application + private API key (or OAuth2 client) on isthereanydeal.com is required.
 * 2. The API Terms strictly prohibit creating competing price-comparison/deal-tracking products or aiding competitors without explicit permission (contact: api@isthereanydeal.com).
 * 3. Distributing private API keys inside a packaged Electron client without a backend proxy violates credential security.
 *
 * Therefore, IsThereAnyDeal is intentionally kept inactive (`isPermitted() === false`)
 * until the application owner obtains explicit permission from api@isthereanydeal.com
 * and provisions credentials securely. CheapShark operates independently.
 */
class IsThereAnyDealProviderImpl implements DealsProviderAdapter {
  readonly id = 'isthereanydeal' as const;
  readonly displayName = 'IsThereAnyDeal';
  readonly attributionUrl = 'https://docs.isthereanydeal.com/';

  isPermitted(): boolean {
    return false;
  }

  getHealth(): ProviderHealthStatus {
    return {
      provider: this.id,
      name: this.displayName,
      state: 'requires_approval',
      lastSuccessAt: null,
      retryAfterSec: null,
      message:
        'Paused pending IsThereAnyDeal ToS permission (api@isthereanydeal.com) and API key registration.',
    };
  }

  async getStores(): Promise<DealsStoreInfo[]> {
    return [];
  }

  async fetchDeals(_params: DealsQueryParams): Promise<DealsPageResult> {
    return {
      items: [],
      pageNumber: 0,
      totalPages: 1,
      hasNextPage: false,
      stores: [],
      fetchedAt: Date.now(),
      currency: 'USD',
    };
  }

  async fetchGameComparison(): Promise<NormalizedDealGame | null> {
    return null;
  }
}

export const IsThereAnyDealProvider = new IsThereAnyDealProviderImpl();
