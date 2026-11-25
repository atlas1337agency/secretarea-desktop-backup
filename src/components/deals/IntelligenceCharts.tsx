import { useMemo, useState } from 'react';
import type {
  DealsCurrencyCode,
  ExchangeRateSnapshot,
  PlayerHistoryPoint,
  PriceHistoryPoint,
} from '../../deals/types';
import { resolveDisplayPrice } from '../../deals/currencyService';
import type { AppThemeMode } from '../../services/launcherSettings';

function getAccentStroke(activeTheme: AppThemeMode): string {
  if (activeTheme === 'xbox') return '#6ee755';
  if (activeTheme === 'ps5') return '#7cc4ff';
  return '#1a9fff';
}

export function MiniTrendSparkline({
  values,
  positive = true,
  activeTheme,
}: {
  values: number[];
  positive?: boolean;
  activeTheme: AppThemeMode;
}) {
  if (!values || values.length < 2) {
    return <span className="text-[11px] text-slate-400 dark:text-[#6f829c]">—</span>;
  }

  const width = 76;
  const height = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((v, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - 2 - ((v - min) / span) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const stroke = positive
    ? activeTheme === 'xbox'
      ? '#6ee755'
      : '#22c55e'
    : '#f43f5e';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function PlayerHistoryChart({
  points,
  locale,
  activeTheme,
  noDataLabel,
}: {
  points: PlayerHistoryPoint[];
  locale: string;
  activeTheme: AppThemeMode;
  noDataLabel: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const stroke = getAccentStroke(activeTheme);

  const stats = useMemo(() => {
    if (!points || points.length < 2) return null;
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const pt of points) {
      if (pt.playerCount < min) min = pt.playerCount;
      if (pt.playerCount > max) max = pt.playerCount;
      sum += pt.playerCount;
    }
    return {
      min,
      max,
      avg: Math.round(sum / points.length),
    };
  }, [points]);

  if (!points || points.length < 2 || !stats) {
    return (
      <div className="h-44 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0e141b] flex items-center justify-center px-4 text-center text-[12.5px] text-slate-500 dark:text-[#8b9bb4]">
        {noDataLabel}
      </div>
    );
  }

  const width = 640;
  const height = 190;
  const padX = 12;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const span = stats.max - stats.min || 1;

  const coords = points.map((pt, idx) => {
    const x = padX + (idx / (points.length - 1)) * plotW;
    const y = padY + plotH - ((pt.playerCount - stats.min) / span) * plotH;
    return { x, y, pt };
  });

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${coords[0].x.toFixed(1)},${padY + plotH} L ${coords
    .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' L ')} L ${coords[coords.length - 1].x.toFixed(1)},${padY + plotH} Z`;

  const activePoint =
    hoverIdx !== null && coords[hoverIdx] ? coords[hoverIdx] : coords[coords.length - 1];

  return (
    <div dir="ltr" className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-mono-tabular">
        <div className="flex items-center gap-3 text-slate-600 dark:text-[#9cb0c9]">
          <span>Peak: {stats.max.toLocaleString(locale)}</span>
          <span>Avg: {stats.avg.toLocaleString(locale)}</span>
          <span>Low: {stats.min.toLocaleString(locale)}</span>
        </div>
        <div className="font-semibold text-slate-900 dark:text-white">
          {activePoint.pt.playerCount.toLocaleString(locale)} ·{' '}
          {new Date(activePoint.pt.timestamp).toLocaleString(locale, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#0c1219] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="sa-player-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((pct) => {
            const y = padY + plotH * pct;
            return (
              <line
                key={pct}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-white/[0.07]"
                strokeDasharray="3 3"
              />
            );
          })}

          <path d={areaPath} fill="url(#sa-player-grad)" />
          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />

          <line
            x1={activePoint.x}
            y1={padY}
            x2={activePoint.x}
            y2={padY + plotH}
            stroke={stroke}
            strokeOpacity="0.45"
            strokeDasharray="3 3"
          />
          <circle cx={activePoint.x} cy={activePoint.y} r="4.5" fill={stroke} />

          {/* Invisible hit zones for smooth scrubbing */}
          {coords.map((c, idx) => (
            <rect
              key={idx}
              x={Math.max(0, c.x - plotW / coords.length / 2)}
              y={0}
              width={Math.max(4, plotW / coords.length)}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(idx)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export function PriceHistoryChart({
  points,
  selectedCurrency,
  fxSnapshot,
  locale,
  activeTheme,
  noDataLabel,
  freeLabel,
}: {
  points: PriceHistoryPoint[];
  selectedCurrency: DealsCurrencyCode;
  fxSnapshot: ExchangeRateSnapshot | null;
  locale: string;
  activeTheme: AppThemeMode;
  noDataLabel: string;
  freeLabel: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const stroke = activeTheme === 'xbox' ? '#6ee755' : '#10b981';

  if (!points || points.length === 0) {
    return (
      <div className="h-44 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0e141b] flex items-center justify-center px-4 text-center text-[12.5px] text-slate-500 dark:text-[#8b9bb4]">
        {noDataLabel}
      </div>
    );
  }

  const displayPoints = points.length === 1 ? [points[0], { ...points[0], timestamp: Date.now() }] : points;
  const maxUsd = Math.max(
    1,
    ...displayPoints.map((p) => Math.max(p.priceUsd, p.normalPriceUsd ?? p.priceUsd))
  );
  const minUsd = Math.min(...displayPoints.map((p) => p.priceUsd));

  const width = 640;
  const height = 175;
  const padX = 14;
  const padY = 16;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const span = maxUsd - minUsd || maxUsd || 1;

  const coords = displayPoints.map((pt, idx) => {
    const x = padX + (idx / (displayPoints.length - 1)) * plotW;
    const y = padY + plotH - ((pt.priceUsd - minUsd) / span) * plotH;
    return { x, y, pt };
  });

  const stepPoints = coords
    .map((c, idx) => {
      if (idx === 0) return `${c.x.toFixed(1)},${c.y.toFixed(1)}`;
      const prev = coords[idx - 1];
      return `${c.x.toFixed(1)},${prev.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    })
    .join(' ');

  const active =
    hoverIdx !== null && coords[hoverIdx] ? coords[hoverIdx] : coords[coords.length - 1];

  const activeFormatted = resolveDisplayPrice({
    amount: active.pt.priceUsd,
    sourceCurrency: 'USD',
    targetCurrency: selectedCurrency,
    fxSnapshot,
    locale,
    freeLabel,
  });

  return (
    <div dir="ltr" className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-mono-tabular">
        <span className="text-slate-600 dark:text-[#9cb0c9]">
          {active.pt.note || (active.pt.discountPercent > 0 ? `-${active.pt.discountPercent}%` : 'Recorded Price')}
        </span>
        <span className="font-bold text-emerald-700 dark:text-[#4ade80]">
          {activeFormatted.formatted} ·{' '}
          {new Date(active.pt.timestamp).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#0c1219] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 overflow-visible"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {[0.25, 0.5, 0.75].map((pct) => {
            const y = padY + plotH * pct;
            return (
              <line
                key={pct}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-white/[0.07]"
                strokeDasharray="3 3"
              />
            );
          })}

          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
            points={stepPoints}
          />

          {coords.map((c, idx) => (
            <g key={idx}>
              <circle
                cx={c.x}
                cy={c.y}
                r={c.pt.isLowest ? 5 : 3.2}
                fill={c.pt.isLowest ? '#f59e0b' : stroke}
              />
              <rect
                x={Math.max(0, c.x - plotW / coords.length / 2)}
                y={0}
                width={Math.max(8, plotW / coords.length)}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(idx)}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function ReviewDailyTrendChart({
  trend,
  locale,
}: {
  trend: Array<{ timestamp: number; positive: number; negative: number }>;
  locale: string;
}) {
  if (!trend || trend.length < 2) return null;
  const recent = trend.slice(-30);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const width = 560;
  const height = 110;
  const pad = 10;

  const totals = recent.map((pt) => pt.positive + pt.negative);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  const span = maxTotal - minTotal || 1;

  const posRatioPoints = recent
    .map((pt, idx) => {
      const total = pt.positive + pt.negative;
      const x = pad + (idx / (recent.length - 1)) * (width - pad * 2);
      const y = pad + (height - pad * 2) - ((total - minTotal) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const deltaPos = Math.max(0, last.positive - first.positive);
  const deltaNeg = Math.max(0, last.negative - first.negative);

  return (
    <div dir="ltr" className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-mono-tabular text-slate-600 dark:text-[#9cb0c9]">
        <span>
          Last {recent.length}d growth: +{deltaPos.toLocaleString(locale)} pos · +
          {deltaNeg.toLocaleString(locale)} neg
        </span>
        <span>
          {new Date(last.timestamp).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0c1219] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={posRatioPoints}
          />
        </svg>
      </div>
    </div>
  );
}
