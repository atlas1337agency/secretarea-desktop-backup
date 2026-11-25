import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Buildings,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  CheckCircle,
  Laptop,
  MagnifyingGlass,
  PushPin,
  SealCheck,
  Sparkle,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import type { GameItem, LibrarySectionTab, SortOption } from '../types';
import { buildItemStudiosMap, LIBRARY_SECTIONS } from '../utils/parsers';
import { evaluateCanRunGame } from '../services/canRunIt';
import type { SystemHardwareSpecs } from '../services/systemSpecs';
import { GameCover } from './GameCover';
import { getSectionVisualMeta, SectionSourceBadge } from './SectionBadge';
import type { AppLanguage } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface LibraryViewProps {
  activeSectionTab: LibrarySectionTab;
  games: GameItem[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  genreFilter: string;
  onGenreFilterChange: (genre: string) => void;
  canRunFilter?: 'all' | 'can-run' | 'cannot-run';
  onCanRunFilterChange?: (filter: 'all' | 'can-run' | 'cannot-run') => void;
  canRunItEnabled?: boolean;
  onClearAllFilters: () => void;
  availableGenres: string[];
  favorites: Set<string>;
  systemSpecs?: SystemHardwareSpecs;
  language?: AppLanguage;
  onToggleFavorite: (id: string) => void;
  onSelectGame: (game: GameItem) => void;
  studios?: GameItem[];
  onSelectStudio?: (studio: GameItem) => void;
}

const LIBRARY_PAGE_SIZE = 50;

function getPageWindow(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const pages = new Set<number>([0, totalPages - 1, currentPage]);
  if (currentPage - 1 >= 0) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
  const sorted = Array.from(pages).sort((a, b) => a - b);

  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push('ellipsis');
    }
    out.push(sorted[i]);
  }
  return out;
}

interface FilterDropdownOption<T extends string> {
  value: T;
  label: string;
  tone?: 'default' | 'emerald' | 'rose';
}

interface LibraryFilterDropdownProps<T extends string> {
  ariaLabel: string;
  value: T;
  options: FilterDropdownOption<T>[];
  onChange: (value: T) => void;
  icon: ReactNode;
  prefixLabel?: string;
  activeTone?: 'default' | 'sky' | 'emerald' | 'rose';
  isActive?: boolean;
  menuMinWidth?: number;
}

function LibraryFilterDropdown<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  icon,
  prefixLabel,
  activeTone = 'default',
  isActive = false,
  menuMinWidth = 200,
}: LibraryFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    minWidth: number;
  }>({ top: 0, left: 0, minWidth: menuMinWidth });

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const updatePosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const isRtl = document.documentElement.dir === 'rtl';
    const width = Math.max(menuMinWidth, Math.min(rect.width + 24, 280));
    const spaceBelow = viewportH - rect.bottom - 12;
    const placeAbove = spaceBelow < 200 && rect.top > spaceBelow;
    const rawLeft = isRtl ? rect.right - width : rect.left;
    const clampedLeft = Math.max(12, Math.min(rawLeft, viewportW - width - 12));

    setCoords(
      placeAbove
        ? {
            bottom: viewportH - rect.top + 6,
            left: clampedLeft,
            minWidth: width,
          }
        : {
            top: rect.bottom + 6,
            left: clampedLeft,
            minWidth: width,
          }
    );
  }, [menuMinWidth]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, updatePosition]);

  const toneClasses = useMemo(() => {
    if (activeTone === 'emerald') {
      return 'bg-emerald-500/12 hover:bg-emerald-500/18 border-emerald-500/40 text-emerald-700 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/22 dark:border-emerald-400/45 dark:text-[#4ade80]';
    }
    if (activeTone === 'rose') {
      return 'bg-rose-500/12 hover:bg-rose-500/18 border-rose-500/40 text-rose-700 dark:bg-rose-500/15 dark:hover:bg-rose-500/22 dark:border-rose-400/45 dark:text-[#f87171]';
    }
    if (open || isActive || activeTone === 'sky') {
      return 'bg-[#0284c7]/[0.09] hover:bg-[#0284c7]/[0.14] border-[#0284c7]/45 text-[#0369a1] dark:bg-[#1a9fff]/15 dark:hover:bg-[#1a9fff]/22 dark:border-[#38bdf8]/50 dark:text-[#7dd3fc] shadow-[0_0_0_1px_rgba(56,189,248,0.16)]';
    }
    return 'bg-white/95 hover:bg-white border-slate-200/95 hover:border-slate-300 text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:bg-[#1e2733]/90 dark:hover:bg-[#263140] dark:border-white/[0.1] dark:hover:border-white/[0.2] dark:text-[#e5e9f0] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_6px_rgba(0,0,0,0.2)]';
  }, [activeTone, isActive, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`sa-ps5-select-wrap h-9 px-2.5 sm:px-3 rounded-xl border inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 text-[12px] font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]/50 ${toneClasses}`}
      >
        <span className="shrink-0 flex items-center">{icon}</span>
        {prefixLabel && (
          <span className="hidden xl:inline text-[10.5px] font-semibold tracking-[0.06em] uppercase text-slate-400 dark:text-[#7a8ca5] shrink-0">
            {prefixLabel}
          </span>
        )}
        <span className="truncate max-w-[118px] sm:max-w-[160px] lg:max-w-[185px]">
          {selectedOption?.label}
        </span>
        <CaretDown
          weight="bold"
          className={`w-3 h-3 shrink-0 opacity-65 transition-transform duration-150 ${
            open ? 'rotate-180 opacity-100' : ''
          }`}
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              minWidth: coords.minWidth,
            }}
            className="fixed z-[140] max-w-[min(300px,calc(100vw-24px))] max-h-[min(320px,55vh)] overflow-y-auto rounded-xl border border-slate-200/95 dark:border-white/[0.12] bg-white/98 dark:bg-[#141b24]/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.16)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.68)]"
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              const optTone =
                opt.tone === 'emerald'
                  ? 'text-emerald-700 dark:text-[#4ade80]'
                  : opt.tone === 'rose'
                    ? 'text-rose-700 dark:text-[#f87171]'
                    : selected
                      ? 'text-[#0284c7] dark:text-[#7dd3fc]'
                      : 'text-slate-700 dark:text-[#dbe3ec]';

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] text-start transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#0284c7]/10 dark:bg-[#1a9fff]/18 font-semibold'
                      : 'font-medium hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                  } ${optTone}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check weight="bold" className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

export function LibraryView({
  activeSectionTab,
  games,
  totalCount,
  searchQuery,
  onSearchChange,
  sortBy,
  genreFilter,
  canRunFilter = 'all',
  onCanRunFilterChange,
  canRunItEnabled = true,
  systemSpecs,
  language = 'en',
  onSelectGame,
  studios = [],
  onSelectStudio,
}: LibraryViewProps) {
  const t = getTranslations(language).library;
  const [page, setPage] = useState(0);
  const scrollSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setPage(0);
  }, [activeSectionTab, sortBy, genreFilter, canRunFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(games.length / LIBRARY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const pageGames = useMemo(() => {
    const start = safePage * LIBRARY_PAGE_SIZE;
    return games.slice(start, start + LIBRARY_PAGE_SIZE);
  }, [games, safePage]);

  const studiosByItemKey = useMemo(
    () => buildItemStudiosMap(studios),
    [studios]
  );

  const sectionLabel =
    LIBRARY_SECTIONS.find((s) => s.key === activeSectionTab)?.label || 'Games';
  const sectionVisual = getSectionVisualMeta(activeSectionTab);
  const SectionIcon = sectionVisual.icon;

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(bounded);
    scrollSectionRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canRunOptions = useMemo<FilterDropdownOption<'all' | 'can-run' | 'cannot-run'>[]>(
    () => [
      { value: 'all', label: t.canRunAll },
      { value: 'can-run', label: t.canRunPass, tone: 'emerald' },
      { value: 'cannot-run', label: t.canRunFail, tone: 'rose' },
    ],
    [t.canRunAll, t.canRunFail, t.canRunPass]
  );

  const pageTokens = getPageWindow(safePage, totalPages);

  return (
    <section
      ref={scrollSectionRef}
      className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-[#f4f6f9] to-slate-100 dark:from-[#1f2937] dark:via-[#1b222c] dark:to-[#151a22] px-3.5 sm:px-5 lg:px-7 py-4 sm:py-5"
    >
      {/* Header Title Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] shadow-xs flex items-center justify-center shrink-0">
            <SectionIcon className={`w-4.5 h-4.5 ${sectionVisual.iconColorClass}`} />
          </span>
          <h1 className="font-display text-[15px] sm:text-[16px] font-bold tracking-tight text-slate-900 dark:text-white shrink-0">
            {sectionLabel}{' '}
            <span className="text-slate-500 dark:text-[#8b9bb4] font-normal text-[13.5px] font-mono-tabular">
              ({games.length}
              {games.length !== totalCount ? ` / ${totalCount}` : ''})
            </span>
          </h1>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
        </div>

        {totalPages > 1 && (
          <span className="text-[12px] text-slate-500 dark:text-[#8b9bb4] font-mono-tabular shrink-0">
            {t.pageOf} {safePage + 1} / {totalPages}
          </span>
        )}
      </div>

      {/* Modern Single-Line Can Run It Button & Smart Search Toolbar */}
      <div className="flex flex-nowrap items-center justify-between gap-2 sm:gap-3 mb-5">
        {canRunItEnabled && onCanRunFilterChange ? (
          <LibraryFilterDropdown
            ariaLabel={t.canRunAll}
            value={canRunFilter}
            options={canRunOptions}
            onChange={onCanRunFilterChange}
            activeTone={
              canRunFilter === 'can-run'
                ? 'emerald'
                : canRunFilter === 'cannot-run'
                  ? 'rose'
                  : 'default'
            }
            menuMinWidth={190}
            icon={
              <Laptop
                weight="bold"
                className={`w-3.5 h-3.5 ${
                  canRunFilter === 'can-run'
                    ? 'text-emerald-600 dark:text-[#4ade80]'
                    : canRunFilter === 'cannot-run'
                      ? 'text-rose-600 dark:text-[#f87171]'
                      : 'text-[#0284c7] dark:text-[#38bdf8]'
                }`}
              />
            }
          />
        ) : (
          <div />
        )}

        {/* Single Smart Search Bar (always on the same single line across all screens) */}
        <div className="relative flex-1 min-w-0 sm:flex-initial sm:w-64 lg:w-72">
          <MagnifyingGlass className="w-4 h-4 text-slate-400 dark:text-[#7a8ca5] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`${t.searchPlaceholder} ${sectionLabel.toLowerCase()}...`}
            className="sa-ps5-select-wrap w-full h-9 ps-9 pe-8 rounded-xl bg-white/95 dark:bg-[#141b24]/95 border border-slate-200/95 dark:border-white/[0.1] text-[12px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#566376] shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus:outline-none focus:border-[#1a9fff] focus:ring-2 focus:ring-[#1a9fff]/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label={t.clear}
              onClick={() => onSearchChange('')}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:text-[#677487] dark:hover:text-white cursor-pointer"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Poster Grid */}
      {pageGames.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#141921]/60 border border-slate-200 dark:border-white/[0.06] rounded">
          <p className="text-[15px] font-semibold text-slate-900 dark:text-[#e5e9f0] mb-1">
            {t.emptyTitle}
          </p>
          <p className="text-[13px] text-slate-600 dark:text-[#8b9bb4]">
            {t.emptySubtitle}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {pageGames.map((game, index) => {
              const metaBadge = game.repackSize || game.version || game.category;
              const itemStudios = studiosByItemKey.get(`${game.tab}:${game.id}`) || [];
              const canRunEval =
                canRunItEnabled && systemSpecs
                  ? evaluateCanRunGame(game, systemSpecs)
                  : null;
              return (
                <div
                  key={`${game.tab}-${game.id}`}
                  onClick={() => onSelectGame(game)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectGame(game);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-[#10151c] border border-slate-300/90 dark:border-white/[0.09] hover:border-[#0284c7] dark:hover:border-[#1a9fff] shadow-sm dark:shadow-md hover:shadow-xl hover:shadow-black/25 dark:hover:shadow-black/60 transition-all duration-200 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a9fff]"
                >
                  <GameCover
                    src={game.coverImage}
                    alt={game.name}
                    priority={index < 14}
                    imgClassName="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                  />

                  {/* Modern Floating New Release Badge */}
                  {game.isNew && (
                    <span className="absolute top-2 end-2 inline-flex items-center gap-1 px-2 py-[3px] rounded-full bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] border border-white/25 backdrop-blur-md text-white text-[9.5px] font-bold tracking-[0.07em] uppercase leading-none shadow-[0_4px_14px_rgba(2,132,199,0.5)] pointer-events-none select-none">
                      <Sparkle weight="fill" className="w-2.5 h-2.5 shrink-0" />
                      <span>NEW</span>
                    </span>
                  )}

                  {/* Source Section Badge inside Image Card */}
                  <SectionSourceBadge
                    tab={game.tab}
                    className="absolute start-2"
                  />

                  {/* Metadata Scrim (Always readable on small touchscreens, hover reveal on desktop) */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent pt-10 pb-2.5 px-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end">
                    <p className="text-[12px] sm:text-[12.5px] font-semibold text-white leading-snug line-clamp-2">
                      {game.name}
                    </p>
                    {itemStudios.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10.5px] font-medium text-[#7dd3fc]">
                        <Buildings weight="fill" className="w-3 h-3 shrink-0 opacity-90" />
                        {itemStudios.map((studio, sIdx) => (
                          <span key={studio.id} className="inline-flex items-center gap-1 min-w-0">
                            {sIdx > 0 && <span className="text-white/40">/</span>}
                            {onSelectStudio ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectStudio(studio);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="truncate hover:text-white underline decoration-[#38bdf8]/40 underline-offset-2 transition-colors cursor-pointer text-start"
                              >
                                {studio.name}
                              </button>
                            ) : (
                              <span className="truncate">{studio.name}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-1 flex items-center justify-between gap-2 text-[10.5px] sm:text-[11px] text-[#aeb9c7] font-mono-tabular">
                      <span className="truncate">{metaBadge}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {game.tab === 'architect' && game.isPinned && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-full bg-amber-500/20 border border-amber-400/35 text-amber-200 text-[9px] font-bold uppercase leading-none">
                            <PushPin weight="fill" className="w-2.5 h-2.5 shrink-0" />
                            <span>{t.pinned}</span>
                          </span>
                        )}
                        {game.tab === 'architect' && game.isFree && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 text-[9px] font-bold uppercase leading-none">
                            <SealCheck weight="fill" className="w-2.5 h-2.5 shrink-0" />
                            <span>{t.free}</span>
                          </span>
                        )}
                        {game.repackBy && (
                          <span className="text-[#66c0f4]">{game.repackBy}</span>
                        )}
                      </div>
                    </div>
                    {canRunEval && canRunEval.status !== 'unknown' && (
                      <div
                        className={`mt-1 inline-flex items-center gap-1 text-[10.5px] font-bold truncate ${
                          canRunEval.status === 'can-run'
                            ? 'text-[#4ade80]'
                            : 'text-[#f87171]'
                        }`}
                      >
                        {canRunEval.status === 'can-run' ? (
                          <>
                            <CheckCircle weight="fill" className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{t.canRunCard}</span>
                          </>
                        ) : (
                          <>
                            <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{canRunEval.shortBadge}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination when > 50 items */}
          {totalPages > 1 && (
            <div className="mt-6 pt-4 pb-2 flex items-center justify-between gap-2.5 border-t border-slate-200 dark:border-white/[0.07]">
              <div className="flex items-center flex-nowrap gap-1.5 min-w-0 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => goToPage(safePage - 1)}
                  className="sa-ps5-select-wrap h-9 inline-flex items-center gap-1 px-3 rounded-xl bg-white/95 hover:bg-white dark:bg-[#1e2733]/90 dark:hover:bg-[#263140] disabled:opacity-40 disabled:pointer-events-none border border-slate-200/95 dark:border-white/[0.1] text-[12px] font-medium text-slate-800 dark:text-[#dce4ee] shadow-[0_1px_2px_rgba(15,23,42,0.05)] whitespace-nowrap shrink-0 transition-all cursor-pointer"
                >
                  <CaretLeft weight="bold" className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span className="hidden min-[440px]:inline">{t.previous}</span>
                </button>

                {pageTokens.map((token, idx) =>
                  token === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-[12px] text-slate-500 dark:text-[#6b788b] select-none shrink-0"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={token}
                      type="button"
                      onClick={() => goToPage(token)}
                      className={`min-w-[36px] h-9 px-2.5 rounded-xl text-[12px] font-mono-tabular font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        token === safePage
                          ? 'bg-[#1a9fff] text-white shadow-[0_4px_12px_rgba(26,159,255,0.3)]'
                          : 'bg-white/95 text-slate-700 hover:bg-white hover:text-slate-950 border border-slate-200/95 dark:bg-[#18202b] dark:text-[#9ca8b8] dark:hover:bg-[#232f3e] dark:hover:text-white dark:border-white/[0.08]'
                      }`}
                    >
                      {token + 1}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => goToPage(safePage + 1)}
                  className="sa-ps5-select-wrap h-9 inline-flex items-center gap-1 px-3 rounded-xl bg-white/95 hover:bg-white dark:bg-[#1e2733]/90 dark:hover:bg-[#263140] disabled:opacity-40 disabled:pointer-events-none border border-slate-200/95 dark:border-white/[0.1] text-[12px] font-medium text-slate-800 dark:text-[#dce4ee] shadow-[0_1px_2px_rgba(15,23,42,0.05)] whitespace-nowrap shrink-0 transition-all cursor-pointer"
                >
                  <span className="hidden min-[440px]:inline">{t.next}</span>
                  <CaretRight weight="bold" className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              {safePage < totalPages - 1 ? (
                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  className="hidden sm:inline-flex h-9 items-center gap-2 px-4 rounded-xl bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12.5px] font-semibold shadow-[0_4px_14px_rgba(26,159,255,0.28)] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.next50}</span>
                  <CaretRight weight="bold" className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToPage(0)}
                  className="hidden sm:inline-flex h-9 items-center gap-2 px-4 rounded-xl bg-white/95 hover:bg-white dark:bg-[#1e2733]/90 dark:hover:bg-[#263140] border border-slate-200/95 dark:border-white/[0.1] text-slate-800 dark:text-[#dce4ee] text-[12.5px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.backToPage1}</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
