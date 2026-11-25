import { fetchCachedProviderJson } from './httpClient';
import {
  DEALS_CURRENCY_OPTIONS,
  type DealsCurrencyCode,
  type ExchangeRateSnapshot,
} from './types';

const FX_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const PRIMARY_FX_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_FX_URL = 'https://api.frankfurter.dev/v1/latest?from=USD';

interface OpenErApiResponse {
  result?: string;
  base_code?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
}

interface FrankfurterResponse {
  base?: string;
  date?: string;
  rates?: Record<string, number>;
}

export interface ConvertedPriceDisplay {
  formatted: string;
  numericValue: number;
  displayCurrency: string;
  isConverted: boolean;
  sourceCurrency: string;
  sourceFormatted: string;
  rateUsed: number | null;
}

const CURRENCY_META_MAP = new Map(DEALS_CURRENCY_OPTIONS.map((c) => [c.code, c]));

export function getCurrencyMeta(code: DealsCurrencyCode) {
  return CURRENCY_META_MAP.get(code) || DEALS_CURRENCY_OPTIONS[0];
}

export async function loadUsdExchangeRates(
  forceRefresh = false
): Promise<ExchangeRateSnapshot | null> {
  try {
    const primary = await fetchCachedProviderJson<OpenErApiResponse>({
      provider: 'fx',
      providerName: 'ExchangeRate-API',
      url: PRIMARY_FX_URL,
      cacheKey: 'fx:usd:primary',
      ttlMs: FX_CACHE_TTL_MS,
      forceRefresh,
    });

    if (
      primary.data &&
      primary.data.result !== 'error' &&
      primary.data.rates &&
      Object.keys(primary.data.rates).length > 5
    ) {
      return {
        base: 'USD',
        rates: { USD: 1, ...primary.data.rates },
        source: 'ExchangeRate-API',
        updatedAtText: primary.data.time_last_update_utc || null,
        fetchedAt: Date.now(),
      };
    }
  } catch {
    // Try secondary keyless ECB-backed endpoint cleanly
  }

  try {
    const fallback = await fetchCachedProviderJson<FrankfurterResponse>({
      provider: 'fx',
      providerName: 'Frankfurter FX',
      url: FALLBACK_FX_URL,
      cacheKey: 'fx:usd:fallback',
      ttlMs: FX_CACHE_TTL_MS,
      forceRefresh,
    });

    if (fallback.data && fallback.data.rates && Object.keys(fallback.data.rates).length > 3) {
      return {
        base: 'USD',
        rates: { USD: 1, ...fallback.data.rates },
        source: 'Frankfurter',
        updatedAtText: fallback.data.date || null,
        fetchedAt: Date.now(),
      };
    }
  } catch {
    // Gracefully fall back to native source prices without inventing rates
  }

  return null;
}

export function getRateForCurrency(
  sourceCurrency: string,
  targetCurrency: DealsCurrencyCode,
  fxSnapshot: ExchangeRateSnapshot | null
): number | null {
  const from = (sourceCurrency || 'USD').trim().toUpperCase();
  const to = (targetCurrency || 'USD').trim().toUpperCase();
  if (from === to) return 1;
  if (!fxSnapshot) return null;

  const targetRate = fxSnapshot.rates[to];
  if (!Number.isFinite(targetRate) || targetRate <= 0) return null;

  if (from === 'USD') {
    return targetRate;
  }

  const fromRate = fxSnapshot.rates[from];
  if (!Number.isFinite(fromRate) || fromRate <= 0) return null;
  return targetRate / fromRate;
}

export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  locale = 'en-US',
  freeLabel = 'FREE'
): string {
  if (!Number.isFinite(amount)) return '—';
  if (amount <= 0) return freeLabel;

  const normalizedCode = (currencyCode || 'USD').trim().toUpperCase();
  const meta = CURRENCY_META_MAP.get(normalizedCode as DealsCurrencyCode);
  const decimals = meta?.decimals ?? (normalizedCode === 'JPY' ? 0 : 2);

  try {
    // Force Latin digits even under Arabic locale for clean tabular alignment
    const safeLocale =
      locale.startsWith('ar') && !locale.includes('-u-nu-latn')
        ? `${locale}-u-nu-latn`
        : locale;

    return new Intl.NumberFormat(safeLocale, {
      style: 'currency',
      currency: normalizedCode,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${amount.toFixed(decimals)} ${normalizedCode}`;
  }
}

export function resolveDisplayPrice(opts: {
  amount: number;
  sourceCurrency?: string;
  targetCurrency: DealsCurrencyCode;
  fxSnapshot: ExchangeRateSnapshot | null;
  locale: string;
  freeLabel?: string;
}): ConvertedPriceDisplay {
  const sourceCurrency = (opts.sourceCurrency || 'USD').trim().toUpperCase();
  const freeLabel = opts.freeLabel || 'FREE';

  if (!Number.isFinite(opts.amount) || opts.amount <= 0) {
    return {
      formatted: freeLabel,
      numericValue: 0,
      displayCurrency: opts.targetCurrency,
      isConverted: false,
      sourceCurrency,
      sourceFormatted: freeLabel,
      rateUsed: null,
    };
  }

  const sourceFormatted = formatCurrencyAmount(opts.amount, sourceCurrency, opts.locale, freeLabel);
  if (sourceCurrency === opts.targetCurrency) {
    return {
      formatted: sourceFormatted,
      numericValue: opts.amount,
      displayCurrency: sourceCurrency,
      isConverted: false,
      sourceCurrency,
      sourceFormatted,
      rateUsed: 1,
    };
  }

  const rate = getRateForCurrency(sourceCurrency, opts.targetCurrency, opts.fxSnapshot);
  if (rate === null) {
    // Transparently display native price if FX rate isn't available for this currency
    return {
      formatted: sourceFormatted,
      numericValue: opts.amount,
      displayCurrency: sourceCurrency,
      isConverted: false,
      sourceCurrency,
      sourceFormatted,
      rateUsed: null,
    };
  }

  const converted = opts.amount * rate;
  return {
    formatted: formatCurrencyAmount(converted, opts.targetCurrency, opts.locale, freeLabel),
    numericValue: converted,
    displayCurrency: opts.targetCurrency,
    isConverted: true,
    sourceCurrency,
    sourceFormatted,
    rateUsed: rate,
  };
}

export function convertFilterAmountToUsd(
  rawInput: string,
  selectedCurrency: DealsCurrencyCode,
  fxSnapshot: ExchangeRateSnapshot | null
): number | undefined {
  const trimmed = rawInput.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  if (selectedCurrency === 'USD') return parsed;

  const rate = getRateForCurrency('USD', selectedCurrency, fxSnapshot);
  if (!rate || rate <= 0) {
    return parsed;
  }
  return Number((parsed / rate).toFixed(2));
}

export function convertUsdAmountToCurrency(
  amountUsd: number,
  targetCurrency: DealsCurrencyCode,
  fxSnapshot: ExchangeRateSnapshot | null
): number | null {
  if (!Number.isFinite(amountUsd)) return null;
  if (targetCurrency === 'USD') return amountUsd;
  const rate = getRateForCurrency('USD', targetCurrency, fxSnapshot);
  if (!rate || rate <= 0) return null;
  const decimals = CURRENCY_META_MAP.get(targetCurrency)?.decimals ?? (targetCurrency === 'JPY' ? 0 : 2);
  return Number((amountUsd * rate).toFixed(decimals));
}

