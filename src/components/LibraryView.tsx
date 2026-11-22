import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Search,
  X,
} from 'lucide-react';
import type { GameItem, LibrarySectionTab, SortOption } from '../types';
import { LIBRARY_SECTIONS } from '../utils/parsers';
import { evaluateCanRunGame } from '../services/canRunIt';
import type { SystemHardwareSpecs } from '../services/systemSpecs';
import { GameCover } from './GameCover';
import { SectionSourceBadge } from './SectionBadge';
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
  }, [activeSectionTab, games.length, sortBy, genreFilter, canRunFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(games.length / LIBRARY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const pageGames = useMemo(() => {
    const start = safePage * LIBRARY_PAGE_SIZE;
    return games.slice(start, start + LIBRARY_PAGE_SIZE);
  }, [games, safePage]);

  const sectionLabel =
    LIBRARY_SECTIONS.find((s) => s.key === activeSectionTab)?.label || 'Games';
  const hasActiveFilters =
    genreFilter !== 'all' || canRunFilter !== 'all' || searchQuery.trim() !== '';

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(bounded);
    scrollSectionRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTokens = getPageWindow(safePage, totalPages);

  return (
    <section
      ref={scrollSectionRef}
      className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-[#1f2937] via-[#1b222c] to-[#151a22] px-3.5 sm:px-5 lg:px-7 py-4 sm:py-5"
    >
      {/* Header Title Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1 className="text-[14px] sm:text-[15px] font-semibold tracking-[0.06em] uppercase text-[#e5e9f0] shrink-0">
            {sectionLabel}{' '}
            <span className="text-[#8b9bb4] font-normal font-mono-tabular">
              ({games.length}
              {games.length !== totalCount ? ` / ${totalCount}` : ''})
            </span>
          </h1>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {totalPages > 1 && (
          <span className="text-[12px] text-[#8b9bb4] font-mono-tabular shrink-0">
            {t.pageOf} {safePage + 1} / {totalPages}
          </span>
        )}
      </div>

      {/* Sort By (Smart Sort + All Genres) & Main Smart Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Smart Sort By */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowDownWideNarrow className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#8b9bb4] shrink-0">
              {t.sortBy}
            </span>
            <select
              aria-label={t.sortBy}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded bg-[#2a3340] border border-white/[0.08] text-[12px] font-medium text-[#e5e9f0] focus:outline-none focus:border-[#1a9fff] cursor-pointer"
            >
              <option value="smart">{t.sortSmart}</option>
              <option value="latest">{t.sortLatest}</option>
              <option value="alphabetical">{t.sortAz}</option>
              <option value="alphabetical-desc">{t.sortZa}</option>
              <option value="favorites">{t.sortFavorites}</option>
              <option value="size-asc">{t.sortSizeAsc}</option>
              <option value="size-desc">{t.sortSizeDesc}</option>
              <option value="mirrors">{t.sortMirrors}</option>
            </select>
          </div>

          {/* All Genres Dropdown */}
          <select
            aria-label={t.allGenres}
            value={genreFilter}
            onChange={(e) => onGenreFilterChange(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1.5 rounded bg-[#2a3340] border border-white/[0.08] text-[12px] font-medium text-[#e5e9f0] focus:outline-none focus:border-[#1a9fff] cursor-pointer"
          >
            <option value="all">{t.allGenres}</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          {/* Can Run It PC Compatibility Filter */}
          {onCanRunFilterChange && (
            <div className="sa-ps5-select-wrap inline-flex items-center gap-1.5 w-full sm:w-auto px-2.5 py-1.5 rounded bg-[#2a3340] border border-white/[0.08]">
              <Laptop className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
              <select
                aria-label={t.canRunAll}
                value={canRunFilter}
                onChange={(e) =>
                  onCanRunFilterChange(e.target.value as 'all' | 'can-run' | 'cannot-run')
                }
                className="flex-1 sm:flex-initial bg-transparent text-[12px] font-medium text-[#e5e9f0] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1b222c] text-white">
                  {t.canRunAll}
                </option>
                <option value="can-run" className="bg-[#1b222c] text-[#4ade80]">
                  {t.canRunPass}
                </option>
                <option value="cannot-run" className="bg-[#1b222c] text-[#f87171]">
                  {t.canRunFail}
                </option>
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-medium text-[#c6d4df] transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>{t.clear}</span>
            </button>
          )}
        </div>

        {/* Single Smart Search Bar */}
        <div className="relative w-full md:w-64 lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-[#677487] absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`${t.searchPlaceholder} ${sectionLabel.toLowerCase()}...`}
            className="w-full ps-8 pe-7 py-1.5 rounded bg-[#141b24] border border-white/[0.08] text-[12px] text-white placeholder-[#566376] focus:outline-none focus:border-[#1a9fff]"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label={t.clear}
              onClick={() => onSearchChange('')}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-[#677487] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Poster Grid */}
      {pageGames.length === 0 ? (
        <div className="py-20 text-center bg-[#141921]/60 border border-white/[0.06] rounded">
          <p className="text-[15px] font-semibold text-[#e5e9f0] mb-1">
            {t.emptyTitle}
          </p>
          <p className="text-[13px] text-[#8b9bb4]">
            {t.emptySubtitle}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {pageGames.map((game, index) => {
              const metaBadge = game.repackSize || game.version || game.category;
              const canRunEval = systemSpecs ? evaluateCanRunGame(game, systemSpecs) : null;
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
                  className="group relative aspect-[2/3] rounded-[3px] overflow-hidden bg-[#10151c] border border-white/[0.08] hover:border-[#1a9fff] shadow-md hover:shadow-xl hover:shadow-black/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a9fff]"
                >
                  <GameCover
                    src={game.coverImage}
                    alt={game.name}
                    priority={index < 14}
                    imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />

                  {/* New Ribbon (3 newest in games catalog) */}
                  {game.isNew && (
                    <div className="absolute inset-x-0 top-0 bg-[#1a9fff] text-white text-[9.5px] font-bold tracking-[0.07em] uppercase py-[3px] px-1.5 text-center shadow-sm">
                      {t.newToLibrary}
                    </div>
                  )}

                  {/* Source Section Badge inside Image Card (Red HV, Steam icon, PS5, Tools, Save, Game) */}
                  <SectionSourceBadge
                    tab={game.tab}
                    hasTopRibbon={game.isNew}
                    className="absolute start-1.5"
                  />

                  {/* Metadata Scrim (Always readable on small touchscreens, hover reveal on desktop) */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/90 to-transparent pt-10 pb-2.5 px-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end">
                    <p className="text-[12px] sm:text-[12.5px] font-semibold text-white leading-snug line-clamp-2">
                      {game.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[10.5px] sm:text-[11px] text-[#aeb9c7] font-mono-tabular">
                      <span className="truncate">{metaBadge}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {game.tab === 'architect' && game.isPinned && (
                          <span className="px-1 py-[1px] rounded-[2px] bg-amber-500/20 text-amber-300 text-[9.5px] font-bold uppercase">
                            {t.pinned}
                          </span>
                        )}
                        {game.tab === 'architect' && game.isFree && (
                          <span className="px-1 py-[1px] rounded-[2px] bg-emerald-500/20 text-emerald-300 text-[9.5px] font-bold uppercase">
                            {t.free}
                          </span>
                        )}
                        {game.repackBy && (
                          <span className="text-[#66c0f4]">{game.repackBy}</span>
                        )}
                      </div>
                    </div>
                    {canRunEval && canRunEval.status !== 'unknown' && (
                      <div
                        className={`mt-1 text-[10.5px] font-bold truncate ${
                          canRunEval.status === 'can-run'
                            ? 'text-[#4ade80]'
                            : 'text-[#f87171]'
                        }`}
                      >
                        {canRunEval.status === 'can-run'
                          ? t.canRunCard
                          : `✕ ${canRunEval.shortBadge}`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination when > 50 items */}
          {totalPages > 1 && (
            <div className="mt-6 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => goToPage(safePage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-white/[0.08] text-[12px] font-medium text-[#dce4ee] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{t.previous}</span>
                </button>

                {pageTokens.map((token, idx) =>
                  token === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-[12px] text-[#6b788b] select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={token}
                      type="button"
                      onClick={() => goToPage(token)}
                      className={`min-w-[34px] h-[34px] px-2 rounded text-[12px] font-mono-tabular font-semibold transition-colors cursor-pointer ${
                        token === safePage
                          ? 'bg-[#1a9fff] text-white'
                          : 'bg-[#18202b] text-[#9ca8b8] hover:bg-[#232f3e] hover:text-white border border-white/[0.06]'
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
                  className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-white/[0.08] text-[12px] font-medium text-[#dce4ee] cursor-pointer"
                >
                  <span>{t.next}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              {safePage < totalPages - 1 ? (
                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{t.next50}</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToPage(0)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#dce4ee] text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
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
