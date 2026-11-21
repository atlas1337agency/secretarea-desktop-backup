import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Building2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { GameItem } from '../types';
import { getStudioTotalCount, sortStudiosByTop } from '../utils/parsers';

interface StudiosViewProps {
  studios: GameItem[];
  onSelectStudio: (studio: GameItem) => void;
  onBackHome: () => void;
}

const STUDIOS_PER_PAGE = 30;

export function StudioEmblem({ studio }: { studio: GameItem }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [studio.coverImage]);

  if (!studio.coverImage || failed) {
    return (
      <div className="h-24 w-full rounded-[3px] bg-[#10161e] border border-white/[0.06] flex flex-col items-center justify-center p-3 gap-1.5 text-center">
        <Building2 className="w-6 h-6 text-[#5b697c]" />
        <span className="text-[11px] font-medium text-[#8b9bb4] line-clamp-1">{studio.name}</span>
      </div>
    );
  }

  return (
    <div className="h-24 w-full rounded-[3px] bg-[#f4f6f9] flex items-center justify-center p-3.5 overflow-hidden">
      <img
        src={studio.coverImage}
        alt={studio.name}
        title={studio.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="max-h-full max-w-full object-contain group-hover:scale-[1.04] transition-transform duration-200"
      />
    </div>
  );
}

export function StudiosView({ studios, onSelectStudio, onBackHome }: StudiosViewProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement | null>(null);

  const sortedStudios = useMemo(() => {
    const ordered = sortStudiosByTop(studios);
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter((s) => s.name.toLowerCase().includes(q));
  }, [studios, query]);

  const totalPages = Math.max(1, Math.ceil(sortedStudios.length / STUDIOS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const pageItems = useMemo(() => {
    const start = safePage * STUDIOS_PER_PAGE;
    return sortedStudios.slice(start, start + STUDIOS_PER_PAGE);
  }, [sortedStudios, safePage]);

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(bounded);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-[#1a2330] via-[#151b24] to-[#10141b]">
      <div
        ref={topRef}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7 space-y-6"
      >
        {/* Header Bar with Back to Home & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[12px] sm:text-[12.5px] font-semibold text-[#e5e9f0] hover:text-white transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <h1 className="font-display text-lg lg:text-xl font-bold text-white tracking-tight truncate">
              Top Studios
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-[#677487] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search studios..."
                className="w-full sm:w-64 pl-8 pr-3 py-2 rounded bg-[#10151c] border border-white/[0.1] text-[12.5px] text-white placeholder-[#566376] focus:outline-none focus:border-[#1a9fff]"
              />
            </div>

            <span className="text-[12px] text-[#8b9bb4] font-mono-tabular whitespace-nowrap shrink-0">
              Page {safePage + 1} / {totalPages}
            </span>
          </div>
        </div>

        {/* Studios Grid: Logo + Total Games */}
        {pageItems.length === 0 ? (
          <div className="py-16 text-center rounded bg-[#141921] border border-white/[0.06] text-[13px] text-[#8b9bb4]">
            No studios match your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4">
            {pageItems.map((studio) => {
              const totalGames = getStudioTotalCount(studio);
              return (
                <button
                  key={`studio-page-${studio.id}`}
                  type="button"
                  title={studio.name}
                  aria-label={`${studio.name} (${totalGames} Games)`}
                  onClick={() => onSelectStudio(studio)}
                  className="group p-3 rounded bg-[#18202b] hover:bg-[#212b3a] border border-white/[0.06] hover:border-[#1a9fff]/60 transition-all duration-200 hover:-translate-y-0.5 flex flex-col items-center gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]"
                >
                  <StudioEmblem studio={studio} />
                  <span className="text-[12px] font-semibold font-mono-tabular text-[#c6d4df] group-hover:text-white">
                    {totalGames} {totalGames === 1 ? 'Game' : 'Games'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07]">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => goToPage(safePage - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-white/[0.08] text-[12px] font-medium text-[#dce4ee] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToPage(idx)}
                  className={`min-w-[34px] h-[34px] px-2 rounded text-[12px] font-mono-tabular font-semibold transition-colors cursor-pointer ${
                    idx === safePage
                      ? 'bg-[#1a9fff] text-white'
                      : 'bg-[#18202b] text-[#9ca8b8] hover:bg-[#232f3e] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                onClick={() => goToPage(safePage + 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-white/[0.08] text-[12px] font-medium text-[#dce4ee] cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[12px] font-semibold text-[#e5e9f0] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
