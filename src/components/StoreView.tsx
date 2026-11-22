import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  EyeOff,
  Gpu,
  HardDrive,
  Laptop,
  Layers,
  MemoryStick,
  Play,
  RefreshCw,
  Users,
} from 'lucide-react';
import type { GameItem, SheetCatalogData } from '../types';
import { getStudioTotalCount, sortStudiosByTop } from '../utils/parsers';
import { evaluateCanRunGame, type CanRunEvaluation } from '../services/canRunIt';
import type { SystemHardwareSpecs } from '../services/systemSpecs';
import { GameCover } from './GameCover';
import { resolveSheetRefItem } from './ExtrasView';
import { SectionSourceBadge } from './SectionBadge';
import { StudioEmblem } from './StudiosView';
import type { AppLanguage } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface StoreViewProps {
  catalog: SheetCatalogData;
  favorites: Set<string>;
  systemSpecs?: SystemHardwareSpecs;
  isRefreshingSpecs?: boolean;
  language?: AppLanguage;
  onRefreshSpecs?: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectGame: (game: GameItem, initialTab?: 'overview' | 'trailer' | 'downloads') => void;
  onBrowseLatestInLibrary?: () => void;
  onOpenStudiosPage: () => void;
}

const POPULAR_PAGE_SIZE = 20;
type PopularFilterMode = 'all' | 'hide-hv' | 'hide-games';
type PopularSortMode = 'newest' | 'az';

interface HorizontalSlideProps {
  title: string;
  items: GameItem[];
  onSelectGame: (game: GameItem) => void;
  actionLabel?: string;
  onAction?: () => void;
  isUpcoming?: boolean;
  autoSlide?: boolean;
  autoSlideIntervalMs?: number;
}

function HorizontalGameSlide({
  title,
  items,
  onSelectGame,
  actionLabel,
  onAction,
  isUpcoming = false,
  autoSlide = false,
  autoSlideIntervalMs = 4500,
}: HorizontalSlideProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollByViewport = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 4) return;
    const step = Math.max(300, Math.floor(el.clientWidth * 0.78));

    if (dir === 1) {
      if (el.scrollLeft >= maxScrollLeft - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 12) {
        el.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (!autoSlide || isPaused || items.length <= 2) return;
    const timer = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 4) return;
      const step = Math.max(300, Math.floor(el.clientWidth * 0.72));
      if (el.scrollLeft >= maxScrollLeft - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, autoSlideIntervalMs);
    return () => window.clearInterval(timer);
  }, [autoSlide, autoSlideIntervalMs, isPaused, items.length]);

  if (items.length === 0) return null;

  return (
    <section
      className="space-y-3.5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h2 className="font-display text-[15px] lg:text-[17px] font-bold tracking-tight text-white shrink-0">
            {title}
          </h2>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="text-[12px] font-medium text-[#66c0f4] hover:text-white transition-colors me-1 whitespace-nowrap cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
          <div dir="ltr" className="inline-flex items-center gap-2">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scrollByViewport(-1)}
              className="p-1.5 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#c6d4df] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scrollByViewport(1)}
              className="p-1.5 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#c6d4df] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        dir="ltr"
        ref={scrollerRef}
        className="no-scrollbar flex gap-3 sm:gap-3.5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
      >
        {items.map((game) => {
          if (isUpcoming) {
            return (
              <div
                key={`${game.tab}-${game.id}`}
                className="snap-start shrink-0 w-[138px] sm:w-[162px] md:w-[172px] lg:w-[180px] xl:w-[190px] 2xl:w-[206px] bg-[#18202b] border border-white/[0.06] rounded overflow-hidden select-none"
              >
                <div className="relative aspect-[2/3] bg-[#0f141b] overflow-hidden pointer-events-none">
                  <GameCover
                    src={game.coverImage}
                    alt={game.name}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          }

          const metaLine = game.repackSize || 'Repack';

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
              className="snap-start shrink-0 w-[138px] sm:w-[162px] md:w-[172px] lg:w-[180px] xl:w-[190px] 2xl:w-[206px] group bg-[#18202b] hover:bg-[#212b3a] border border-white/[0.06] hover:border-[#1a9fff]/60 rounded overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]"
            >
              <div className="relative aspect-[2/3] bg-[#0f141b] overflow-hidden">
                <GameCover
                  src={game.coverImage}
                  alt={game.name}
                  imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />

                {game.isNew && (
                  <div className="absolute inset-x-0 top-0 bg-[#1a9fff] text-white text-[9.5px] font-bold tracking-[0.07em] uppercase py-[3px] text-center">
                    NEW
                  </div>
                )}
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                <h3 className="text-[12.5px] font-semibold text-[#e5e9f0] group-hover:text-white line-clamp-1">
                  {game.name}
                </h3>
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#8b9bb4] font-mono-tabular">
                  <span className="truncate">{metaLine}</span>
                  {game.originalSize && (
                    <span className="line-through text-[#59677b] shrink-0">
                      {game.originalSize}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function StoreView({
  catalog,
  systemSpecs,
  isRefreshingSpecs = false,
  language = 'en',
  onRefreshSpecs,
  onSelectGame,
  onOpenStudiosPage,
}: StoreViewProps) {
  const tr = getTranslations(language);
  const t = tr.store;
  const games = catalog.game;
  const [slideIndex, setSlideIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [popularPage, setPopularPage] = useState(0);
  const [popularFilter, setPopularFilter] = useState<PopularFilterMode>('all');
  const [popularSort, setPopularSort] = useState<PopularSortMode>('newest');
  const [pcCompatTab, setPcCompatTab] = useState<'can-run' | 'cannot-run'>('can-run');
  const [pcCompatScope, setPcCompatScope] = useState<
    'all' | 'game' | 'hypervisor' | 'steamtools' | 'ps5' | 'architect'
  >('all');
  const popularSectionRef = useRef<HTMLElement | null>(null);
  const pcCompatScrollerRef = useRef<HTMLDivElement | null>(null);

  // Featured Hero Slides: prioritize latest releases with rich landscape screenshots
  const featuredGames = useMemo(() => {
    const pinned = games.filter((g) => g.isPinned);
    const byRecent = [...games].sort(
      (a, b) => b.dateTimestamp - a.dateTimestamp || Number(b.id) - Number(a.id)
    );
    const pool = [...pinned];
    for (const g of byRecent) {
      if (pool.length >= 6) break;
      if (!pool.some((p) => p.id === g.id) && g.galleryImages.length > 0 && g.coverImage) {
        pool.push(g);
      }
    }
    return pool.length > 0 ? pool.slice(0, 6) : games.slice(0, 6);
  }, [games]);

  // Smooth Hero Auto-Rotation (respects hover pause)
  useEffect(() => {
    if (heroPaused || featuredGames.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % featuredGames.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [heroPaused, featuredGames.length]);

  // Upcoming Games from Google Sheet `upcoming` tab — newest first
  const upcomingGames = useMemo(
    () =>
      [...(catalog.upcoming || [])].sort(
        (a, b) => b.dateTimestamp - a.dateTimestamp
      ),
    [catalog.upcoming]
  );

  // Recent Games: newest first (`isNew` / `dateTimestamp` desc / `id` desc)
  const recentGames = useMemo(
    () =>
      [...games]
        .sort(
          (a, b) =>
            Number(b.isNew) - Number(a.isNew) ||
            b.dateTimestamp - a.dateTimestamp ||
            Number(b.id) - Number(a.id)
        )
        .slice(0, 24),
    [games]
  );

  // Can Run It — evaluate all catalog sections with hardware requirements against real PC specs
  const pcCompatibilityData = useMemo(() => {
    const emptyCounts = {
      all: 0,
      game: 0,
      hypervisor: 0,
      steamtools: 0,
      ps5: 0,
      architect: 0,
    };

    if (!systemSpecs) {
      return {
        canRun: [] as { item: GameItem; evalRes: CanRunEvaluation }[],
        cannotRun: [] as { item: GameItem; evalRes: CanRunEvaluation }[],
        scopeCounts: emptyCounts,
      };
    }

    const combinedPool = [
      ...(catalog.game || []),
      ...(catalog.hypervisor || []),
      ...(catalog.steamtools || []),
      ...(catalog.ps5 || []),
      ...(catalog.architect || []),
    ];

    const scopeCounts = { ...emptyCounts };
    const canRun: { item: GameItem; evalRes: CanRunEvaluation }[] = [];
    const cannotRun: { item: GameItem; evalRes: CanRunEvaluation }[] = [];

    for (const item of combinedPool) {
      const evalRes = evaluateCanRunGame(item, systemSpecs);
      if (!evalRes.hasRequirements || evalRes.status === 'unknown') continue;

      scopeCounts.all += 1;
      if (item.tab in scopeCounts) {
        scopeCounts[item.tab as keyof typeof scopeCounts] += 1;
      }

      if (pcCompatScope !== 'all' && item.tab !== pcCompatScope) continue;

      if (evalRes.status === 'can-run') {
        canRun.push({ item, evalRes });
      } else if (evalRes.status === 'cannot-run') {
        cannotRun.push({ item, evalRes });
      }
    }

    const sortNewestFirst = (
      a: { item: GameItem; evalRes: CanRunEvaluation },
      b: { item: GameItem; evalRes: CanRunEvaluation }
    ) =>
      Number(b.item.isNew) - Number(a.item.isNew) ||
      Number(b.item.isPinned) - Number(a.item.isPinned) ||
      b.item.dateTimestamp - a.item.dateTimestamp ||
      Number(b.item.id) - Number(a.item.id);

    canRun.sort(sortNewestFirst);
    cannotRun.sort(sortNewestFirst);

    return { canRun, cannotRun, scopeCounts };
  }, [catalog, pcCompatScope, systemSpecs]);

  const activePcCompatList =
    pcCompatTab === 'can-run'
      ? pcCompatibilityData.canRun.slice(0, 30)
      : pcCompatibilityData.cannotRun.slice(0, 30);

  useEffect(() => {
    pcCompatScrollerRef.current?.scrollTo({ left: 0 });
  }, [pcCompatScope, pcCompatTab]);

  const scrollPcCompat = (dir: -1 | 1) => {
    const el = pcCompatScrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 4) return;
    const step = Math.max(280, Math.floor(el.clientWidth * 0.78));
    if (dir === 1) {
      if (el.scrollLeft >= maxScrollLeft - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 12) {
        el.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  // Most Popular Games resolved from ALL tokens inside Google Sheet `PopularRepacks`
  // Deduplicated by `tab:id` so `g#` (Games) and `h#` (Hypervisor) remain distinct entries (e.g. 174 + 29 = 203)
  const popularEntries = useMemo(() => {
    const rows = catalog.popularrepacks || [];
    const byKey = new Map<string, { item: GameItem; isHypervisor: boolean; sheetOrder: number }>();

    rows.forEach((row, rowIdx) => {
      const tokens = (row.rawFields['Game ID'] || '')
        .split(/[,\s|]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      for (const tok of tokens) {
        const target = resolveSheetRefItem(tok, catalog);
        if (!target) continue;

        const key = `${target.tab}:${target.id}`;
        const existing = byKey.get(key);
        if (!existing) {
          byKey.set(key, {
            item: target,
            isHypervisor: target.tab === 'hypervisor',
            sheetOrder: rowIdx,
          });
        } else {
          existing.sheetOrder = Math.max(existing.sheetOrder, rowIdx);
        }
      }
    });

    return Array.from(byKey.values());
  }, [catalog]);

  const popularFilterCounts = useMemo(() => {
    let all = popularEntries.length;
    let gamesOnly = 0;
    let hvOnly = 0;
    for (const entry of popularEntries) {
      if (entry.isHypervisor) hvOnly++;
      else gamesOnly++;
    }
    return { all, gamesOnly, hvOnly };
  }, [popularEntries]);

  const popularGames = useMemo(() => {
    const filtered = popularEntries.filter((entry) => {
      if (popularFilter === 'hide-hv') return !entry.isHypervisor;
      if (popularFilter === 'hide-games') return entry.isHypervisor;
      return true;
    });

    return [...filtered]
      .map((entry) => ({
        item: entry.item,
        hasHypervisor: entry.isHypervisor,
        sheetOrder: entry.sheetOrder,
      }))
      .sort((a, b) => {
        if (popularSort === 'az') {
          return (
            a.item.name.localeCompare(b.item.name) ||
            Number(a.hasHypervisor) - Number(b.hasHypervisor)
          );
        }
        return (
          Number(b.item.isNew) - Number(a.item.isNew) ||
          b.item.dateTimestamp - a.item.dateTimestamp ||
          b.sheetOrder - a.sheetOrder ||
          Number(b.item.id) - Number(a.item.id)
        );
      });
  }, [popularEntries, popularFilter, popularSort]);

  const totalPopularPages = Math.max(1, Math.ceil(popularGames.length / POPULAR_PAGE_SIZE));
  const safePopularPage = Math.min(popularPage, totalPopularPages - 1);
  const visiblePopularGames = useMemo(() => {
    const start = safePopularPage * POPULAR_PAGE_SIZE;
    return popularGames.slice(start, start + POPULAR_PAGE_SIZE);
  }, [popularGames, safePopularPage]);
  const nextPopularPageCount = Math.min(
    POPULAR_PAGE_SIZE,
    Math.max(0, popularGames.length - (safePopularPage + 1) * POPULAR_PAGE_SIZE)
  );

  // Top 10 Studios from Google Sheet `profil` tab
  const topStudios = useMemo(
    () => sortStudiosByTop(catalog.profil || []).slice(0, 10),
    [catalog.profil]
  );

  // Best games For Two Players from Google Sheet `onlinegames` tab (supports multi-ID CSV like "g123,g74,g12")
  const twoPlayerGames = useMemo(() => {
    const seen = new Set<string>();
    const results: GameItem[] = [];
    for (const row of catalog.onlinegames || []) {
      const refRaw = row.rawFields.id || '';
      for (const token of refRaw.split(',')) {
        const cleanToken = token.trim();
        if (!cleanToken) continue;
        const resolved = resolveSheetRefItem(cleanToken, catalog);
        if (resolved) {
          const key = `${resolved.tab}:${resolved.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push(resolved);
          }
        }
      }
    }
    return results;
  }, [catalog]);

  const twoPlayersScrollerRef = useRef<HTMLDivElement | null>(null);
  const [twoPlayersPaused, setTwoPlayersPaused] = useState(false);

  const scrollTwoPlayers = (dir: -1 | 1) => {
    const el = twoPlayersScrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 4) return;
    const step = Math.max(260, Math.floor(el.clientWidth * 0.78));
    if (dir === 1) {
      if (el.scrollLeft >= maxScrollLeft - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 12) {
        el.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (twoPlayersPaused || twoPlayerGames.length <= 2) return;
    const timer = window.setInterval(() => {
      const el = twoPlayersScrollerRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 4) return;
      const step = Math.max(260, Math.floor(el.clientWidth * 0.72));
      if (el.scrollLeft >= maxScrollLeft - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 4600);
    return () => window.clearInterval(timer);
  }, [twoPlayersPaused, twoPlayerGames.length]);

  const activeFeatured =
    featuredGames[slideIndex % Math.max(1, featuredGames.length)] || games[0];

  if (!activeFeatured) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1b222c] text-[#8b9bb4]">
        {t.noCatalogLoaded}
      </div>
    );
  }

  const backdropSrc = activeFeatured.galleryImages[0] || activeFeatured.coverImage;

  const goToPopularPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPopularPages - 1));
    setPopularPage(bounded);
    popularSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-[#1a2330] via-[#151b24] to-[#10141b]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7 space-y-8 sm:space-y-10">
        {/* 1. Modern Animated Hero Spotlight */}
        <section
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
          className="sa-ps5-hero relative rounded-md overflow-hidden border border-white/[0.08] bg-[#0e131a] shadow-2xl"
        >
          <div className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[370px] lg:min-h-[400px] 2xl:min-h-[450px] flex items-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeatured.id}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                {backdropSrc && (
                  <img
                    src={backdropSrc}
                    alt={activeFeatured.name}
                    referrerPolicy="no-referrer"
                    className="sa-ps5-hero-img w-full h-full object-cover object-center opacity-55"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="sa-hero-scrim-x sa-ps5-hero-scrim-x absolute inset-0 bg-gradient-to-r from-[#0c1016] via-[#0c1016]/85 to-[#0c1016]/25 pointer-events-none" />
            <div className="sa-ps5-hero-scrim-y absolute inset-0 bg-gradient-to-t from-[#0c1016] via-transparent to-[#0c1016]/35 pointer-events-none" />

            <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 sm:gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatured.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-end gap-4 sm:gap-5 max-w-3xl"
                >
                  <div className="hidden sm:block w-28 lg:w-32 2xl:w-36 aspect-[2/3] rounded overflow-hidden border border-white/[0.15] shadow-2xl shrink-0 bg-[#141921]">
                    <GameCover src={activeFeatured.coverImage} alt={activeFeatured.name} priority />
                  </div>

                  <div className="space-y-2.5 min-w-0">
                    <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#66c0f4]">
                      {[
                        activeFeatured.isPinned ? t.featuredSpotlight : t.latestRelease,
                        activeFeatured.repackBy,
                        activeFeatured.dateAdded
                          ? new Date(activeFeatured.dateAdded).toLocaleDateString(tr.locale)
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>

                    <h1
                      style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)', textWrap: 'balance' }}
                      className="font-display font-bold text-white tracking-tight leading-[1.12]"
                    >
                      {activeFeatured.name}
                    </h1>

                    <p className="text-[12.5px] text-[#aeb9c7]">
                      {[...activeFeatured.genreList.slice(0, 4), activeFeatured.version]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>

                    <p className="text-[13px] lg:text-[13.5px] text-[#c6d4df] leading-relaxed line-clamp-2 lg:line-clamp-3 max-w-2xl">
                      {activeFeatured.description}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectGame(activeFeatured, 'downloads')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[13px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t.download}</span>
                      </button>

                      {activeFeatured.embedTrailerUrl && (
                        <button
                          type="button"
                          onClick={() => onSelectGame(activeFeatured, 'trailer')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#2a3441]/90 hover:bg-[#344050] border border-white/[0.1] text-[#e5e9f0] text-[13px] font-medium transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{t.watchTrailer}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* End Column: Size Comparison + Animated Carousel Selector */}
              <div className="flex flex-wrap sm:flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 shrink-0">
                <div className="bg-[#0d1117]/85 backdrop-blur-md border border-white/[0.08] rounded px-3.5 py-2.5 text-start lg:text-end">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[#8b9bb4]">
                    {t.repackVsOriginal}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-2.5 font-mono-tabular">
                    <span className="text-base lg:text-lg font-bold text-[#66c0f4]">
                      {activeFeatured.repackSize || 'N/A'}
                    </span>
                    {activeFeatured.originalSize && (
                      <span className="text-[12px] text-[#6b788b] line-through">
                        {activeFeatured.originalSize}
                      </span>
                    )}
                  </div>
                </div>

                {featuredGames.length > 1 && (
                  <div dir="ltr" className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous featured game"
                      onClick={() =>
                        setSlideIndex(
                          (prev) => (prev - 1 + featuredGames.length) % featuredGames.length
                        )
                      }
                      className="p-1.5 rounded bg-black/55 hover:bg-black/85 border border-white/[0.1] text-white cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {featuredGames.map((item, idx) => {
                        const isActive = idx === slideIndex % featuredGames.length;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Spotlight ${item.name}`}
                            onClick={() => setSlideIndex(idx)}
                            className={`h-1.5 rounded-sm transition-all cursor-pointer ${
                              isActive
                                ? 'w-7 bg-[#1a9fff]'
                                : 'w-2.5 bg-white/30 hover:bg-white/55'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      aria-label="Next featured game"
                      onClick={() =>
                        setSlideIndex((prev) => (prev + 1) % featuredGames.length)
                      }
                      className="p-1.5 rounded bg-black/55 hover:bg-black/85 border border-white/[0.1] text-white cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Upcoming Games Slide (Google Sheet: upcoming) */}
        <HorizontalGameSlide
          title={t.upcomingGames}
          items={upcomingGames}
          onSelectGame={(game) => onSelectGame(game, 'overview')}
          isUpcoming
          autoSlide
          autoSlideIntervalMs={4500}
        />

        {/* 3. Recent Games Slide (Newest first in catalog) */}
        <HorizontalGameSlide
          title={t.recentGames}
          items={recentGames}
          onSelectGame={(game) => onSelectGame(game, 'overview')}
          autoSlide
          autoSlideIntervalMs={5200}
        />

        {/* 3.5 Can Run It? — Real PC Compatibility Scanner (All Catalog Sections) */}
        {systemSpecs && (
          <section className="sa-ps5-panel rounded-xl bg-gradient-to-br from-[#131b26] via-[#10161f] to-[#0d1118] border border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-[#1a9fff]/15 border border-[#1a9fff]/35 text-[#66c0f4] flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-[15px] lg:text-[17px] font-bold tracking-tight text-white">
                    {t.canRunTitle}
                  </h2>
                  <p className="text-[11.5px] text-[#8b9bb4]">{t.canRunSubtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Scope Filter: All / Games / Hypervisor / SteamTools / PS5 / Tools */}
                <div className="sa-ps5-pill-group inline-flex flex-wrap items-center p-0.5 rounded bg-[#141a23] border border-white/[0.08]">
                  {(
                    [
                      { key: 'all', label: t.scopeAll },
                      { key: 'game', label: t.scopeGames },
                      { key: 'hypervisor', label: t.scopeHypervisor },
                      { key: 'steamtools', label: t.scopeSteamTools },
                      { key: 'ps5', label: t.scopePs5 },
                      { key: 'architect', label: t.scopeTools },
                    ] as const
                  ).map((opt) => {
                    const count = pcCompatibilityData.scopeCounts[opt.key];
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setPcCompatScope(opt.key)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-[11.5px] font-semibold transition-colors cursor-pointer ${
                          pcCompatScope === opt.key
                            ? 'bg-[#1a9fff] text-white'
                            : 'text-[#9fb0c7] hover:text-white'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {count > 0 && (
                          <span className="text-[10.5px] font-mono-tabular opacity-80">
                            ({count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Can Run (Green) vs Can't Run (Red) Toggle */}
                <div className="sa-ps5-pill-group inline-flex items-center p-0.5 rounded bg-[#141a23] border border-white/[0.08]">
                  <button
                    type="button"
                    data-active={pcCompatTab === 'can-run' ? 'true' : 'false'}
                    onClick={() => setPcCompatTab('can-run')}
                    className={`sa-ps5-toggle-pass inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11.5px] font-bold transition-colors cursor-pointer ${
                      pcCompatTab === 'can-run'
                        ? 'bg-emerald-600/85 text-white shadow-sm'
                        : 'text-[#4ade80] hover:bg-emerald-500/10'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.canRunBtn}</span>
                    <span className="font-mono-tabular opacity-90">
                      ({pcCompatibilityData.canRun.length})
                    </span>
                  </button>
                  <button
                    type="button"
                    data-active={pcCompatTab === 'cannot-run' ? 'true' : 'false'}
                    onClick={() => setPcCompatTab('cannot-run')}
                    className={`sa-ps5-toggle-fail inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11.5px] font-bold transition-colors cursor-pointer ${
                      pcCompatTab === 'cannot-run'
                        ? 'bg-rose-600/85 text-white shadow-sm'
                        : 'text-[#f87171] hover:bg-rose-500/10'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t.cannotRunBtn}</span>
                    <span className="font-mono-tabular opacity-90">
                      ({pcCompatibilityData.cannotRun.length})
                    </span>
                  </button>
                </div>

                <div dir="ltr" className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Scroll compatibility list left"
                    onClick={() => scrollPcCompat(-1)}
                    className="p-1.5 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#c6d4df] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll compatibility list right"
                    onClick={() => scrollPcCompat(1)}
                    className="p-1.5 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#c6d4df] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Detected PC Specs Ribbon */}
            <div className="sa-ps5-subpanel flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-[#0d1219] border border-white/[0.06] text-[11.5px]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[#cbd5e1]">
                <span className="inline-flex items-center gap-1.5">
                  <Gpu className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
                  <span className="text-[#8b9bb4]">{t.gpuLabel}:</span>
                  <strong className="text-white font-semibold">{systemSpecs.gpuName}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
                  <span className="text-[#8b9bb4]">{t.cpuLabel}:</span>
                  <strong className="text-white font-semibold">{systemSpecs.cpuName}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MemoryStick className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
                  <span className="text-[#8b9bb4]">{t.ramLabel}:</span>
                  <strong className="text-white font-semibold font-mono-tabular">
                    {systemSpecs.ramIsApprox ? `${systemSpecs.ramGB} GB+` : `${systemSpecs.ramGB} GB`}
                  </strong>
                </span>
                {systemSpecs.freeSpaceGB !== null && (
                  <span className="inline-flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#66c0f4] shrink-0" />
                    <span className="text-[#8b9bb4]">
                      {t.freeDriveLabel} ({systemSpecs.spaceDrive}):
                    </span>
                    <strong className="text-white font-semibold font-mono-tabular">
                      {systemSpecs.freeSpaceGB.toFixed(1)} GB
                    </strong>
                  </span>
                )}
              </div>

              {onRefreshSpecs && (
                <button
                  type="button"
                  onClick={onRefreshSpecs}
                  disabled={isRefreshingSpecs}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a222d] hover:bg-[#243040] border border-white/[0.08] text-[11px] font-semibold text-[#66c0f4] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingSpecs ? 'animate-spin' : ''}`} />
                  <span>{t.scanPc}</span>
                </button>
              )}
            </div>

            {/* Matching Cards Row */}
            {activePcCompatList.length === 0 ? (
              <div className="sa-ps5-subpanel py-8 text-center rounded bg-[#0e131b] border border-white/[0.05] text-[13px] text-[#8b9bb4]">
                {pcCompatTab === 'cannot-run' ? t.canRunEmptyFail : t.canRunEmptyPass}
              </div>
            ) : (
              <div
                dir="ltr"
                ref={pcCompatScrollerRef}
                className="no-scrollbar flex gap-3 sm:gap-3.5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
              >
                {activePcCompatList.map(({ item, evalRes }) => {
                  const isPass = evalRes.status === 'can-run';
                  return (
                    <div
                      key={`compat-${item.tab}-${item.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectGame(item, 'overview')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectGame(item, 'overview');
                        }
                      }}
                      className={`snap-start shrink-0 w-[142px] sm:w-[164px] md:w-[176px] lg:w-[186px] group bg-[#18202b] hover:bg-[#212b3a] border rounded overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff] ${
                        isPass
                          ? 'sa-ps5-card-pass border-emerald-500/25 hover:border-emerald-400/60'
                          : 'sa-ps5-card-fail border-rose-500/35 hover:border-rose-400/75'
                      }`}
                    >
                      <div className="relative aspect-[2/3] bg-[#0f141b] overflow-hidden">
                        <GameCover
                          src={item.coverImage}
                          alt={item.name}
                          imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />

                        {(item.tab === 'hypervisor' ||
                          item.tab === 'architect' ||
                          item.tab === 'steamtools' ||
                          item.tab === 'ps5') && (
                          <SectionSourceBadge tab={item.tab} className="absolute left-1.5" />
                        )}
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                        <h3 className="text-[12.5px] font-semibold text-[#e5e9f0] group-hover:text-white line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold truncate ${
                              isPass ? 'text-[#4ade80]' : 'text-[#f87171]'
                            }`}
                          >
                            {isPass ? (
                              <>
                                <Check className="w-3 h-3 shrink-0" />
                                <span>{t.canRunCardPass}</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span className="truncate">{evalRes.shortBadge}</span>
                              </>
                            )}
                          </span>
                          <span className="text-[10.5px] text-[#8b9bb4] font-mono-tabular shrink-0">
                            {item.repackSize || item.tab}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 4. Most Popular Games (Google Sheet: PopularRepacks — all games, dynamic counter, HV/Game filter & pagination) */}
        {popularEntries.length > 0 && (
          <section ref={popularSectionRef} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <h2 className="font-display text-[15px] lg:text-[17px] font-bold tracking-tight text-white shrink-0">
                  {t.mostPopularGames}
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#18202b] border border-white/[0.08] text-[12px] font-mono-tabular font-semibold text-[#66c0f4] shrink-0">
                  {popularGames.length}
                </span>
                <div className="h-px flex-1 bg-white/[0.07] hidden sm:block" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Visibility Filter: Show All / Hide HV / Hide Games */}
                <div
                  role="group"
                  aria-label={t.mostPopularGames}
                  className="sa-ps5-pill-group inline-flex items-center p-0.5 rounded bg-[#141a23] border border-white/[0.08]"
                >
                  <button
                    type="button"
                    aria-pressed={popularFilter === 'all'}
                    onClick={() => {
                      setPopularFilter('all');
                      setPopularPage(0);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11.5px] font-semibold transition-colors cursor-pointer ${
                      popularFilter === 'all'
                        ? 'bg-[#1a9fff] text-white shadow-sm'
                        : 'text-[#9fb0c7] hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>{t.showAll}</span>
                    <span className="font-mono-tabular opacity-80">({popularFilterCounts.all})</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={popularFilter === 'hide-hv'}
                    onClick={() => {
                      setPopularFilter('hide-hv');
                      setPopularPage(0);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11.5px] font-semibold transition-colors cursor-pointer ${
                      popularFilter === 'hide-hv'
                        ? 'bg-[#1a9fff] text-white shadow-sm'
                        : 'text-[#9fb0c7] hover:text-white'
                    }`}
                  >
                    <EyeOff className="w-3 h-3 shrink-0" />
                    <span>{t.hideHv}</span>
                    <span className="font-mono-tabular opacity-80">({popularFilterCounts.gamesOnly})</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={popularFilter === 'hide-games'}
                    data-active={popularFilter === 'hide-games' ? 'true' : 'false'}
                    onClick={() => {
                      setPopularFilter('hide-games');
                      setPopularPage(0);
                    }}
                    className={`sa-ps5-toggle-fail inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11.5px] font-semibold transition-colors cursor-pointer ${
                      popularFilter === 'hide-games'
                        ? 'bg-[#dc2626] text-white shadow-sm'
                        : 'text-[#9fb0c7] hover:text-white'
                    }`}
                  >
                    <EyeOff className="w-3 h-3 shrink-0" />
                    <span>{t.hideGames}</span>
                    <span className="font-mono-tabular opacity-80">({popularFilterCounts.hvOnly})</span>
                  </button>
                </div>

                {/* Organization / Sort Selector */}
                <div className="sa-ps5-pill-group inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141a23] border border-white/[0.08] text-[11.5px] text-[#c6d4df]">
                  <ArrowUpDown className="w-3 h-3 text-[#66c0f4] shrink-0" />
                  <select
                    aria-label={t.mostPopularGames}
                    value={popularSort}
                    onChange={(e) => {
                      setPopularSort(e.target.value as PopularSortMode);
                      setPopularPage(0);
                    }}
                    className="bg-transparent text-[#e5e9f0] font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="newest" className="bg-[#141a23] text-white">
                      {t.newestFirst}
                    </option>
                    <option value="az" className="bg-[#141a23] text-white">
                      {t.nameAz}
                    </option>
                  </select>
                </div>

                <div className="text-[12px] text-[#8b9bb4] font-mono-tabular whitespace-nowrap ps-1">
                  {t.pageOf} {safePopularPage + 1} / {totalPopularPages}
                </div>
              </div>
            </div>

            {/* Responsive 20-game grid: 2 cols mobile, 4 cols small laptop, 5 cols standard/big laptop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 lg:gap-4">
              {visiblePopularGames.map(({ item: game, hasHypervisor }) => (
                <div
                  key={`${game.tab}-${game.id}`}
                  onClick={() => onSelectGame(game, 'overview')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectGame(game, 'overview');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group bg-[#18202b] hover:bg-[#212b3a] border border-white/[0.06] hover:border-[#1a9fff]/60 rounded overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]"
                >
                  <div className="relative aspect-[2/3] bg-[#0f141b] overflow-hidden">
                    <GameCover
                      src={game.coverImage}
                      alt={game.name}
                      imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    {game.isNew && (
                      <div className="absolute inset-x-0 top-0 bg-[#1a9fff] text-white text-[9.5px] font-bold tracking-[0.07em] uppercase py-[3px] text-center">
                        NEW
                      </div>
                    )}
                    {hasHypervisor && (
                      <SectionSourceBadge
                        tab="hypervisor"
                        hasTopRibbon={game.isNew}
                        className="absolute start-1.5"
                      />
                    )}
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                    <h3 className="text-[12.5px] font-semibold text-[#e5e9f0] group-hover:text-white line-clamp-1">
                      {game.name}
                    </h3>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#8b9bb4] font-mono-tabular">
                      <span className="truncate">{game.repackSize || game.tab}</span>
                      {game.originalSize && (
                        <span className="line-through text-[#59677b] shrink-0">
                          {game.originalSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination & See More Controls */}
            {totalPopularPages > 1 && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePopularPage === 0}
                    onClick={() => goToPopularPage(safePopularPage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-white/[0.08] text-[12px] font-medium text-[#dce4ee] cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{t.previous}</span>
                  </button>

                  {Array.from({ length: totalPopularPages }, (_, pageIdx) => (
                    <button
                      key={pageIdx}
                      type="button"
                      onClick={() => goToPopularPage(pageIdx)}
                      className={`min-w-[34px] h-[34px] px-2 rounded text-[12px] font-mono-tabular font-semibold transition-colors cursor-pointer ${
                        pageIdx === safePopularPage
                          ? 'bg-[#1a9fff] text-white'
                          : 'bg-[#18202b] text-[#9ca8b8] hover:bg-[#232f3e] hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePopularPage >= totalPopularPages - 1}
                    onClick={() => goToPopularPage(safePopularPage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] disabled:opacity-40 disabled:pointer-events-none border border-white/[0.08] text-[12px] font-medium text-[#dce4ee] cursor-pointer"
                  >
                    <span>{t.next}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>

                {safePopularPage < totalPopularPages - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToPopularPage(safePopularPage + 1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>
                      {t.seeMoreNext} {nextPopularPageCount}{' '}
                      {nextPopularPageCount === 1 ? t.gameSingular : t.gamePlural}
                    </span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => goToPopularPage(0)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#dce4ee] text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>{t.backToPage1}</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* 5. Top Studios (Google Sheet: profil — top 10, logo + total games count) */}
        {topStudios.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h2 className="font-display text-[15px] lg:text-[17px] font-bold tracking-tight text-white shrink-0">
                  {t.topStudios}
                </h2>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              <button
                type="button"
                onClick={onOpenStudiosPage}
                className="text-[12px] font-medium text-[#66c0f4] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.viewAllStudios}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-3.5">
              {topStudios.map((studio) => {
                const totalGames = getStudioTotalCount(studio);

                return (
                  <button
                    key={`studio-${studio.id}`}
                    type="button"
                    title={studio.name}
                    aria-label={`${studio.name} (${totalGames} ${t.gamePlural})`}
                    onClick={() => onSelectGame(studio, 'overview')}
                    className="group p-3 rounded bg-[#18202b] hover:bg-[#212b3a] border border-white/[0.06] hover:border-[#1a9fff]/55 transition-all duration-200 hover:-translate-y-0.5 flex flex-col items-center gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]"
                  >
                    <StudioEmblem studio={studio} />
                    <span className="text-[12px] font-semibold font-mono-tabular text-[#c6d4df] group-hover:text-white">
                      {totalGames} {totalGames === 1 ? t.gameSingular : t.gamePlural}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Best games For Two Players (Google Sheet: onlinegames — flush slide, non-clickable images only) */}
        {twoPlayerGames.length > 0 && (
          <section
            onMouseEnter={() => setTwoPlayersPaused(true)}
            onMouseLeave={() => setTwoPlayersPaused(false)}
            onFocus={() => setTwoPlayersPaused(true)}
            onBlur={() => setTwoPlayersPaused(false)}
            className="sa-ps5-panel rounded-xl bg-gradient-to-br from-[#141d29] via-[#101721] to-[#0d121a] border border-white/[0.08] p-3.5 sm:p-5 space-y-3.5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1a9fff]/15 border border-[#1a9fff]/35 text-[#66c0f4] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </span>
                <h2 className="font-display text-[15px] sm:text-[16px] lg:text-[17px] font-bold tracking-tight text-white truncate">
                  {t.bestTwoPlayers}
                </h2>
                <div className="h-px flex-1 bg-white/[0.07] hidden sm:block" />
              </div>

              <div dir="ltr" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  aria-label="Scroll Best games For Two Players left"
                  onClick={() => scrollTwoPlayers(-1)}
                  className="p-1.5 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#c6d4df] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll Best games For Two Players right"
                  onClick={() => scrollTwoPlayers(1)}
                  className="p-1.5 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#c6d4df] hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              dir="ltr"
              ref={twoPlayersScrollerRef}
              className="sa-ps5-subpanel no-scrollbar flex gap-0 overflow-x-auto scroll-smooth snap-x snap-mandatory rounded-lg overflow-hidden border border-white/[0.08] bg-[#0b0e14]"
            >
              {twoPlayerGames.map((game) => (
                <div
                  key={`two-player-${game.tab}-${game.id}`}
                  className="snap-start shrink-0 w-[44vw] sm:w-[162px] md:w-[176px] lg:w-[190px] xl:w-[204px] 2xl:w-[218px] bg-[#0f141b] border-r border-white/[0.06] last:border-r-0 overflow-hidden select-none pointer-events-none"
                >
                  <div className="relative aspect-[2/3] w-full bg-[#0f141b] overflow-hidden">
                    <GameCover
                      src={game.coverImage}
                      alt={game.name}
                      imgClassName="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
