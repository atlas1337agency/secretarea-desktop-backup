import { useEffect, useRef, useState } from 'react';
import { CaretDown, Check, CurrencyDollar, Globe } from '@phosphor-icons/react';
import {
  DEALS_CURRENCY_OPTIONS,
  DEALS_REGION_OPTIONS,
  type DealsCurrencyCode,
  type DealsRegionCode,
  type ExchangeRateSnapshot,
} from '../../deals/types';
import { getCurrencyMeta, getRateForCurrency } from '../../deals/currencyService';
import type { AppThemeMode } from '../../services/launcherSettings';

interface CurrencySwitcherProps {
  selectedCurrency: DealsCurrencyCode;
  region: DealsRegionCode;
  fxSnapshot: ExchangeRateSnapshot | null;
  isLoadingFx: boolean;
  activeTheme: AppThemeMode;
  labels: {
    currencyLabel: string;
    regionLabel: string;
    allCurrenciesLabel: string;
    liveFxRateLabel: string;
    fxLoadingLabel: string;
    fxUnavailableLabel: string;
    currencyNames: Record<DealsCurrencyCode, string>;
  };
  onSelectCurrency: (currency: DealsCurrencyCode) => void;
  onSelectRegion: (region: DealsRegionCode) => void;
}

export function CurrencySwitcher({
  selectedCurrency,
  region,
  fxSnapshot,
  isLoadingFx,
  activeTheme,
  labels,
  onSelectCurrency,
  onSelectRegion,
}: CurrencySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isXbox = activeTheme === 'xbox';
  const isPs5 = activeTheme === 'ps5';

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeMeta = getCurrencyMeta(selectedCurrency);
  const quickPickCodes: DealsCurrencyCode[] = ['USD', 'EUR', 'MAD', 'GBP'];
  const visibleQuickPicks = quickPickCodes.includes(selectedCurrency)
    ? quickPickCodes
    : [...quickPickCodes.slice(0, 3), selectedCurrency];

  const activeRate = getRateForCurrency('USD', selectedCurrency, fxSnapshot);

  const formatRatePreview = (code: DealsCurrencyCode): string => {
    if (code === 'USD') return '1.00';
    const r = getRateForCurrency('USD', code, fxSnapshot);
    if (!r) return '—';
    return code === 'JPY' ? r.toFixed(1) : r.toFixed(2);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto"
    >
      {/* Unified Currency Quick-Bar + Popover Trigger */}
      <div className="flex items-center justify-between sm:justify-start gap-1.5 min-w-0">
        {/* Desktop/Tablet Quick Segmented Currency Switcher */}
        <div
          role="group"
          aria-label={labels.currencyLabel}
          className={`sa-ps5-pill-group hidden md:inline-flex items-center p-1 rounded-xl border ${
            isXbox
              ? 'bg-[#061609]/85 border-[#52e042]/25'
              : isPs5
              ? 'bg-[#07183b]/80 border-white/[0.12]'
              : 'bg-slate-100 dark:bg-[#10161e] border-slate-200 dark:border-white/[0.08]'
          }`}
        >
          {visibleQuickPicks.map((code) => {
            const meta = getCurrencyMeta(code);
            const active = selectedCurrency === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectCurrency(code)}
                className={`inline-flex items-center gap-1.5 min-h-[30px] px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? isXbox
                      ? 'bg-[#107C10] text-white shadow-sm'
                      : 'bg-[#0284c7] dark:bg-[#1a9fff] text-white shadow-sm'
                    : 'text-slate-600 dark:text-[#9cb0c9] hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/[0.06]'
                }`}
              >
                <span className="font-mono-tabular text-[11px] opacity-85">{meta.symbol}</span>
                <span className="font-mono-tabular">{code}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Currency Selector Button (Primary on <md, "+ More" on >=md) */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={labels.currencyLabel}
          className={`sa-ps5-subpanel flex-1 sm:flex-initial inline-flex items-center justify-between sm:justify-center gap-2 min-h-[38px] px-3 py-1.5 rounded-xl border text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            isXbox
              ? 'bg-[#09200d]/90 border-[#52e042]/30 hover:border-[#7cf25c] text-white'
              : isPs5
              ? 'bg-[#081a3d]/85 border-white/[0.14] hover:border-[#7cc4ff]/70 text-white'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#10161e] dark:hover:bg-[#192330] border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-[#e2eaf4]'
          }`}
        >
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <CurrencyDollar
              weight="bold"
              className={`w-4 h-4 shrink-0 ${
                isXbox
                  ? 'text-[#6ee755]'
                  : 'text-[#0284c7] dark:text-[#38bdf8] sa-custom-accent-text'
              }`}
            />
            <span className="font-mono-tabular md:hidden">
              {activeMeta.symbol} {selectedCurrency}
            </span>
            <span className="hidden md:inline font-mono-tabular">
              {selectedCurrency !== 'USD' && activeRate
                ? `1 USD = ${formatRatePreview(selectedCurrency)} ${selectedCurrency}`
                : labels.allCurrenciesLabel}
            </span>
          </span>
          <CaretDown
            weight="bold"
            className={`w-3.5 h-3.5 shrink-0 opacity-75 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Store Region Selector (Mobile inline / Desktop compact) */}
        <label
          className={`sa-ps5-select-wrap inline-flex items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-xl border text-[12px] cursor-pointer shrink-0 ${
            isXbox
              ? 'bg-[#09200d]/90 border-[#52e042]/30 text-white'
              : isPs5
              ? 'bg-[#081a3d]/85 border-white/[0.14] text-white'
              : 'bg-slate-50 dark:bg-[#10161e] border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-[#cbd6e4]'
          }`}
        >
          <Globe
            className={`w-3.5 h-3.5 shrink-0 ${
              isXbox ? 'text-[#6ee755]' : 'text-[#0284c7] dark:text-[#38bdf8] sa-custom-accent-text'
            }`}
          />
          <span className="sr-only">{labels.regionLabel}</span>
          <select
            value={region}
            onChange={(e) => onSelectRegion(e.target.value as DealsRegionCode)}
            aria-label={labels.regionLabel}
            className="bg-transparent font-semibold focus:outline-none cursor-pointer max-w-[115px] sm:max-w-none truncate"
          >
            {DEALS_REGION_OPTIONS.map((opt) => (
              <option
                key={opt.code}
                value={opt.code}
                className="bg-white dark:bg-[#151c25] text-slate-900 dark:text-white"
              >
                {opt.code} · {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Modern Multi-Currency Selector Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={labels.currencyLabel}
          className={`sa-ps5-panel absolute top-full end-0 mt-2 z-50 w-[min(92vw,390px)] rounded-2xl border shadow-2xl overflow-hidden ${
            isXbox
              ? 'bg-[#07180a]/98 border-[#52e042]/35 text-white'
              : isPs5
              ? 'bg-[#071636]/98 border-white/[0.16] text-white'
              : 'bg-white dark:bg-[#151c25] border-slate-200 dark:border-white/[0.12] text-slate-900 dark:text-white'
          }`}
        >
          {/* Popover Header with Live FX Telemetry */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-[#10161e]/85">
            <span className="text-[12.5px] font-bold tracking-tight">
              {labels.currencyLabel}
            </span>
            <span
              dir="ltr"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono-tabular text-slate-500 dark:text-[#8b9bb4]"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isLoadingFx
                    ? 'bg-amber-400 animate-pulse'
                    : fxSnapshot
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                {isLoadingFx
                  ? labels.fxLoadingLabel
                  : fxSnapshot
                  ? activeRate && selectedCurrency !== 'USD'
                    ? `${labels.liveFxRateLabel} · 1 USD = ${formatRatePreview(selectedCurrency)} ${selectedCurrency}`
                    : labels.liveFxRateLabel
                  : labels.fxUnavailableLabel}
              </span>
            </span>
          </div>

          {/* 2-Column Responsive Grid of All 10 Currencies */}
          <div className="p-3 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto">
            {DEALS_CURRENCY_OPTIONS.map((opt) => {
              const active = selectedCurrency === opt.code;
              const rateStr = formatRatePreview(opt.code);
              return (
                <button
                  key={opt.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    onSelectCurrency(opt.code);
                    setIsOpen(false);
                  }}
                  className={`sa-ps5-subpanel flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border text-start transition-all cursor-pointer ${
                    active
                      ? isXbox
                        ? 'bg-[#107C10]/30 border-[#6ee755] text-white'
                        : isPs5
                        ? 'bg-[#0070d1]/35 border-[#7cc4ff] text-white'
                        : 'bg-sky-500/12 border-[#0284c7] dark:border-[#38bdf8] text-slate-900 dark:text-white'
                      : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-[#10161e]/75 dark:hover:bg-[#1b2432] border-slate-200/80 dark:border-white/[0.06] text-slate-800 dark:text-[#cbd6e4]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      dir="ltr"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-tabular text-[11.5px] font-bold shrink-0 ${
                        active
                          ? isXbox
                            ? 'bg-[#107C10] text-white'
                            : 'bg-[#0284c7] dark:bg-[#1a9fff] text-white'
                          : 'bg-slate-200/80 dark:bg-white/[0.06] text-slate-700 dark:text-[#cbd6e4]'
                      }`}
                    >
                      {opt.symbol}
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono-tabular text-[12.5px] font-bold leading-tight">
                        {opt.code}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8b9bb4] truncate">
                        {labels.currencyNames[opt.code]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      dir="ltr"
                      className="font-mono-tabular text-[11px] text-slate-500 dark:text-[#8b9bb4]"
                    >
                      {rateStr}
                    </span>
                    {active && (
                      <Check
                        weight="bold"
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isXbox
                            ? 'text-[#6ee755]'
                            : 'text-[#0284c7] dark:text-[#38bdf8] sa-custom-accent-text'
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
