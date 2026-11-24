import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Laptop,
  MagnifyingGlass,
  PushPin,
  SealCheck,
  SortDescending,
  Sparkle,
  Tag,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import type { GameItem, LibrarySectionTab, SortOption } from '../types';
import { LIBRARY_SECTIONS } from '../utils/parsers';
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

export function LibraryView({
  activeSectionTab,
  games,
  totalCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  genreFilter,
  onGenreFilterChange,
  canRunFilter = 'all',
  onCanRunFilterChange,
  canRunItEnabled = true,
  onClearAllFilters,
  availableGenres,
  systemSpecs,
  language = 'en',
  onSelectGame,
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

  const sectionLabel =
    LIBRARY_SECTIONS.find((s) => s.key === activeSectionTab)?.label || 'Games';
  const sectionVisual = getSectionVisualMeta(activeSectionTab);
  const SectionIcon = sectionVisual.icon;
  const hasActiveFilters =
    genreFilter !== 'all' ||
    (canRunItEnabled && canRunFilter !== 'all') ||
    searchQuery.trim() !== '';

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(bounded);
    scrollSectionRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      {/* Sort By (Smart Sort + All Genres) & Main Smart Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Smart Sort By */}
          <div className="flex items-center gap-2 w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2a3340] border border-slate-300 dark:border-white/[0.08]">
            <SortDescending className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
            <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500 dark:text-[#8b9bb4] shrink-0">
              {t.sortBy}
            </span>
            <select
              aria-label={t.sortBy}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="flex-1 sm:flex-initial bg-transparent text-[12px] font-medium text-slate-900 dark:text-[#e5e9f0] focus:outline-none cursor-pointer"
            >
              <option value="smart" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortSmart}</option>
              <option value="latest" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortLatest}</option>
              <option value="alphabetical" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortAz}</option>
              <option value="alphabetical-desc" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortZa}</option>
              <option value="favorites" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortFavorites}</option>
              <option value="size-asc" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortSizeAsc}</option>
              <option value="size-desc" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortSizeDesc}</option>
              <option value="mirrors" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.sortMirrors}</option>
            </select>
          </div>

          {/* All Genres Dropdown */}
          <div className="inline-flex items-center gap-1.5 w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2a3340] border border-slate-300 dark:border-white/[0.08]">
            <Tag className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
            <select
              aria-label={t.allGenres}
              value={genreFilter}
              onChange={(e) => onGenreFilterChange(e.target.value)}
              className="flex-1 sm:flex-initial bg-transparent text-[12px] font-medium text-slate-900 dark:text-[#e5e9f0] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">{t.allGenres}</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre} className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Can Run It PC Compatibility Filter */}
          {canRunItEnabled && onCanRunFilterChange && (
            <div className="sa-ps5-select-wrap inline-flex items-center gap-1.5 w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#2a3340] border border-slate-300 dark:border-white/[0.08]">
              <Laptop className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
              <select
                aria-label={t.canRunAll}
                value={canRunFilter}
                onChange={(e) =>
                  onCanRunFilterChange(e.target.value as 'all' | 'can-run' | 'cannot-run')
                }
                className="flex-1 sm:flex-initial bg-transparent text-[12px] font-medium text-slate-900 dark:text-[#e5e9f0] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white text-slate-900 dark:bg-[#1b222c] dark:text-white">
                  {t.canRunAll}
                </option>
                <option value="can-run" className="bg-white text-emerald-700 dark:bg-[#1b222c] dark:text-[#4ade80]">
                  {t.canRunPass}
                </option>
                <option value="cannot-run" className="bg-white text-rose-700 dark:bg-[#1b222c] dark:text-[#f87171]">
                  {t.canRunFail}
                </option>
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[11.5px] font-medium text-slate-700 dark:text-[#c6d4df] transition-colors cursor-pointer"
            >
              <X weight="bold" className="w-3 h-3" />
              <span>{t.clear}</span>
            </button>
          )}
        </div>

        {/* Single Smart Search Bar */}
        <div className="relative w-full md:w-64 lg:w-72 shrink-0">
          <MagnifyingGlass className="w-4 h-4 text-slate-400 dark:text-[#7a8ca5] absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`${t.searchPlaceholder} ${sectionLabel.toLowerCase()}...`}
            className="w-full ps-8.5 pe-7 py-1.5 rounded-lg bg-white dark:bg-[#141b24] border border-slate-300 dark:border-white/[0.08] text-[12px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#566376] focus:outline-none focus:border-[#1a9fff]"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label={t.clear}
              onClick={() => onSearchChange('')}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:text-[#677487] dark:hover:text-white cursor-pointer"
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
            <div className="mt-6 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-white/[0.07]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => goToPage(safePage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-[#212a37] dark:hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-slate-300 dark:border-white/[0.08] text-[12px] font-medium text-slate-800 dark:text-[#dce4ee] cursor-pointer"
                >
                  <CaretLeft weight="bold" className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{t.previous}</span>
                </button>

                {pageTokens.map((token, idx) =>
                  token === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-[12px] text-slate-500 dark:text-[#6b788b] select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={token}
                      type="button"
                      onClick={() => goToPage(token)}
                      className={`min-w-[34px] h-[34px] px-2 rounded-lg text-[12px] font-mono-tabular font-semibold transition-colors cursor-pointer ${
                        token === safePage
                          ? 'bg-[#1a9fff] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-300 dark:bg-[#18202b] dark:text-[#9ca8b8] dark:hover:bg-[#232f3e] dark:hover:text-white dark:border-white/[0.06]'
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
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-[#212a37] dark:hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-slate-300 dark:border-white/[0.08] text-[12px] font-medium text-slate-800 dark:text-[#dce4ee] cursor-pointer"
                >
                  <span>{t.next}</span>
                  <CaretRight weight="bold" className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              {safePage < totalPages - 1 ? (
                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{t.next50}</span>
                  <CaretRight weight="bold" className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToPage(0)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.08] text-slate-800 dark:text-[#dce4ee] text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
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
