import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  Gamepad2,
  Globe,
  Gpu,
  HardDrive,
  Hash,
  ListChecks,
  Magnet,
  MemoryStick,
  Monitor,
  PackageCheck,
  Pin,
  Play,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Tag,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import type { GameItem, MirrorLink, SheetCatalogData } from '../types';
import { isTruthyFlag } from '../utils/parsers';
import { evaluateCanRunGame } from '../services/canRunIt';
import type { SystemHardwareSpecs } from '../services/systemSpecs';
import { CanRunItHeroBadge, CanRunItPanel } from './CanRunItPanel';
import { GameCover } from './GameCover';
import { resolveSheetRefItem } from './ExtrasView';
import { HypervisorGuideModal } from './HypervisorGuideModal';
import { SectionSourceBadge } from './SectionBadge';
import type { AppLanguage } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface GameDetailModalProps {
  game: GameItem | null;
  catalog?: SheetCatalogData;
  language?: AppLanguage;
  initialViewMode?: 'overview' | 'trailer' | 'downloads';
  favorites?: Set<string>;
  systemSpecs?: SystemHardwareSpecs;
  isRefreshingSpecs?: boolean;
  onRefreshSpecs?: () => void;
  onSaveCustomSpecs?: (next: SystemHardwareSpecs) => void;
  onResetCustomSpecs?: () => void;
  onToggleFavorite: (id: string) => void;
  onJumpToItem?: (item: GameItem) => void;
  onClose: () => void;
}

type MediaSlide =
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string }
  | { kind: 'trailer'; url: string };

const TOOL_TITLE_STOP_WORDS = new Set([
  'for',
  'the',
  'and',
  'with',
  'all',
  'pro',
  'plus',
  'edition',
  'version',
  'build',
  'update',
  'patch',
  'fix',
  'pack',
  'suite',
  'studio',
  'windows',
  'win',
  'mac',
  'x64',
  'x86',
  '64bit',
  '32bit',
  'multilingual',
  'multi',
  'crack',
  'repack',
  'full',
  'free',
  'portable',
  'enterprise',
]);

function extractToolTitleTokens(name: string): string[] {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[™®©:'"`\-_/.,!?()[\]+]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(
      (t) =>
        t.length >= 2 &&
        !TOOL_TITLE_STOP_WORDS.has(t) &&
        !/^\d+$/.test(t) &&
        !/^v\d+$/i.test(t)
    );
}

export function GameDetailModal({
  game,
  catalog,
  language = 'en',
  initialViewMode = 'overview',
  favorites,
  systemSpecs,
  isRefreshingSpecs = false,
  onRefreshSpecs,
  onSaveCustomSpecs,
  onResetCustomSpecs,
  onJumpToItem,
  onClose,
}: GameDetailModalProps) {
  const t = getTranslations(language).detail;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(() => new Set());
  const [isRecPaused, setIsRecPaused] = useState(false);
  const [isHvGuideOpen, setIsHvGuideOpen] = useState(false);
  const [copiedGameId, setCopiedGameId] = useState(false);

  const pageScrollRef = useRef<HTMLDivElement | null>(null);
  const mediaSectionRef = useRef<HTMLElement | null>(null);
  const requirementsSectionRef = useRef<HTMLElement | null>(null);
  const downloadsSectionRef = useRef<HTMLElement | null>(null);
  const recommendedSliderRef = useRef<HTMLDivElement | null>(null);

  const canRunEvaluation = useMemo(
    () => (game && systemSpecs ? evaluateCanRunGame(game, systemSpecs) : null),
    [game, systemSpecs]
  );

  const mediaSlides = useMemo<MediaSlide[]>(() => {
    if (!game) return [];
    const slides: MediaSlide[] = [];
    if (game.embedTrailerUrl && initialViewMode === 'trailer') {
      slides.push({ kind: 'trailer', url: game.embedTrailerUrl });
    }
    for (const vid of game.galleryVideos) {
      slides.push({ kind: 'video', url: vid });
    }
    for (const img of game.galleryImages) {
      slides.push({ kind: 'image', url: img });
    }
    if (game.embedTrailerUrl && initialViewMode !== 'trailer') {
      slides.push({ kind: 'trailer', url: game.embedTrailerUrl });
    }
    if (slides.length === 0 && game.coverImage) {
      slides.push({ kind: 'image', url: game.coverImage });
    }
    return slides;
  }, [game, initialViewMode]);

  const groupedMirrors = useMemo(() => {
    if (!game) return [];
    const order: MirrorLink['group'][] = [
      'Magnet Link',
      'Full Download',
      'MediaFire (Direct Link)',
      'Mega (Backup)',
      'FitGirl-Repacks',
      'DoDI-Repack',
      'Skidrow',
      'SteamRIP',
      'Direct Mirrors',
      'Anker',
      'Unlockers',
      'Resources',
    ];
    return order
      .map((groupName) => ({
        groupName,
        links: game.mirrors.filter((m) => m.group === groupName),
      }))
      .filter((entry) => entry.links.length > 0);
  }, [game]);

  const linkedCatalogItems = useMemo(() => {
    if (!game || !catalog) return [];
    const refsRaw = [
      game.rawFields['Game ID'],
      game.rawFields['Games ID'],
      game.rawFields['Hypervisor ID'],
      game.rawFields['SteamTools ID'],
      game.tab === 'onlinegames' ? game.rawFields.id : '',
    ]
      .filter(Boolean)
      .join(',');
    if (!refsRaw) return [];
    const seen = new Set<string>();
    const results: GameItem[] = [];
    for (const token of refsRaw.split(',')) {
      const resolved = resolveSheetRefItem(token, catalog);
      if (resolved && !seen.has(`${resolved.tab}:${resolved.id}`)) {
        seen.add(`${resolved.tab}:${resolved.id}`);
        results.push(resolved);
      }
    }
    return results;
  }, [game, catalog]);

  const recommendedGames = useMemo(() => {
    if (!game || !catalog || game.tab === 'steamtools') return [];

    if (game.tab === 'architect') {
      const toolsPool = (catalog.architect || []).filter((g) => g.id !== game.id);
      if (toolsPool.length === 0) return [];

      const targetTokens = extractToolTitleTokens(game.name);
      if (targetTokens.length === 0) return [];
      const targetLead = targetTokens[0];
      const targetTokenSet = new Set(targetTokens);

      const sameTitleMatches = toolsPool
        .map((candidate) => {
          const candTokens = extractToolTitleTokens(candidate.name);
          const shared = candTokens.filter((tok) => targetTokenSet.has(tok));
          if (shared.length === 0) {
            return { candidate, score: 0 };
          }
          let score = shared.length * 8;
          if (candTokens[0] === targetLead) {
            score += 12;
          } else if (candTokens.includes(targetLead)) {
            score += 6;
          }
          if (candidate.isPinned) score += 1;
          return { candidate, score };
        })
        .filter((entry) => entry.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            Number(b.candidate.isPinned) - Number(a.candidate.isPinned) ||
            Number(b.candidate.isFree) - Number(a.candidate.isFree) ||
            b.candidate.dateTimestamp - a.candidate.dateTimestamp ||
            Number(b.candidate.id) - Number(a.candidate.id)
        )
        .map((entry) => entry.candidate);

      return sameTitleMatches.slice(0, 16);
    }

    const pool = game.tab === 'hypervisor' ? catalog.hypervisor || [] : catalog.game || [];
    if (pool.length === 0) return [];

    const targetGenres = new Set(game.genreList.map((g) => g.toLowerCase()));
    const candidates = pool.filter((g) => g.id !== game.id);
    const scored = candidates.map((candidate) => {
      let overlap = 0;
      for (const cg of candidate.genreList) {
        if (targetGenres.has(cg.toLowerCase())) overlap++;
      }
      return { candidate, overlap };
    });

    const genreMatches = scored
      .filter((entry) => entry.overlap > 0)
      .sort(
        (a, b) =>
          b.overlap - a.overlap ||
          (b.candidate.coverImage ? 1 : 0) - (a.candidate.coverImage ? 1 : 0) ||
          b.candidate.dateTimestamp - a.candidate.dateTimestamp ||
          Number(b.candidate.id) - Number(a.candidate.id)
      )
      .map((entry) => entry.candidate);

    if (genreMatches.length >= 16) {
      return genreMatches.slice(0, 16);
    }

    const pickedIds = new Set(genreMatches.map((g) => g.id));
    const fallback = candidates
      .filter((g) => !pickedIds.has(g.id))
      .sort(
        (a, b) =>
          b.dateTimestamp - a.dateTimestamp || Number(b.id) - Number(a.id)
      );

    return [...genreMatches, ...fallback].slice(0, 16);
  }, [game, catalog]);

  useEffect(() => {
    setActiveSlideIndex(0);
    setCheckedSteps(new Set());
    setIsHvGuideOpen(false);
    setCopiedGameId(false);
    recommendedSliderRef.current?.scrollTo({ left: 0 });
    if (initialViewMode === 'downloads') {
      const timer = window.setTimeout(() => {
        downloadsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
      return () => window.clearTimeout(timer);
    }
    pageScrollRef.current?.scrollTo({ top: 0 });
  }, [game?.id, game?.tab, initialViewMode]);

  useEffect(() => {
    if (!game || isHvGuideOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [game, isHvGuideOpen, onClose]);

  useEffect(() => {
    if (!game || isRecPaused || recommendedGames.length <= 2) return;
    const timer = window.setInterval(() => {
      const el = recommendedSliderRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 4) return;
      const step = Math.max(260, Math.round(el.clientWidth * 0.72));
      if (el.scrollLeft >= maxScrollLeft - 12) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 4200);
    return () => window.clearInterval(timer);
  }, [game, isRecPaused, recommendedGames.length]);

  if (!game) return null;

  const activeSlide = mediaSlides[activeSlideIndex] || mediaSlides[0];
  const heroBackdrop = game.galleryImages[0] || game.coverImage;
  const trailerSlideIdx = mediaSlides.findIndex((s) => s.kind === 'trailer');

  const handleWatchTrailer = () => {
    if (trailerSlideIdx >= 0) {
      setActiveSlideIndex(trailerSlideIdx);
      mediaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (game.trailerUrl) {
      window.open(game.trailerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const scrollRecommended = (direction: -1 | 1) => {
    const el = recommendedSliderRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 4) return;
    const step = Math.max(260, Math.round(el.clientWidth * 0.78));

    if (direction === 1) {
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

  const toggleStepDone = (idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const { os, cpu, ram, gpu, raw } = game.parsedRequirements;
  const hasStructuredReqs = Boolean(os || cpu || ram || gpu);
  const rawToolsFallback = !game.parsedTools.length && game.rawFields.tools ? game.rawFields.tools : '';
  const hasSecondarySidebar = linkedCatalogItems.length > 0 && Boolean(onJumpToItem);

  const isSteamTools = game.tab === 'steamtools';
  const isTools = game.tab === 'architect';
  const steamGameId = (game.rawFields.gameId || '').trim();
  const ratingPositiveRaw = (game.rawFields.ratingPositive || '').trim();
  const ratingNegativeRaw = (game.rawFields.ratingNegative || '').trim();
  const ratingPositiveNum = Number(ratingPositiveRaw);
  const ratingNegativeNum = Number(ratingNegativeRaw);
  const hasDenuvo = isSteamTools && isTruthyFlag(game.rawFields.denuvo);
  const hasExternalLauncher = isSteamTools && isTruthyFlag(game.rawFields.launcher);

  const handleCopyGameId = async () => {
    if (!steamGameId) return;
    try {
      await navigator.clipboard.writeText(steamGameId);
      setCopiedGameId(true);
      setTimeout(() => setCopiedGameId(false), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const completedRatio =
    game.parsedSteps.length > 0
      ? Math.round((checkedSteps.size / game.parsedSteps.length) * 100)
      : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.name}
      className="sa-ps5-modal fixed inset-0 z-50 w-screen h-screen bg-[#141921] flex flex-col overflow-hidden"
    >
      {/* Top Game Page Navigation Header */}
      <header className="sa-ps5-modal-header px-4 sm:px-6 lg:px-8 py-3 bg-[#171a21] border-b border-white/[0.08] shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#232b36] hover:bg-[#2d3847] border border-white/[0.08] text-[12px] font-semibold text-[#e5e9f0] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t.back}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#8b9bb4] min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {t.home}
              </button>
              <span className="text-[#4b5b70]">/</span>
              <span className="text-white font-semibold truncate">{game.name}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 rounded bg-[#252f3d] hover:bg-[#313e50] text-[#aeb9c7] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scrollable Full-Screen Game Page */}
      <div
        ref={pageScrollRef}
        className="sa-ps5-modal-scroll flex-1 overflow-y-auto bg-gradient-to-b from-[#18202c] via-[#131922] to-[#0f131a]"
      >
        {/* Game Page Hero Header */}
        <section className="sa-ps5-modal-hero relative border-b border-white/[0.07] overflow-hidden bg-[#10151d]">
          {heroBackdrop && (
            <img
              src={heroBackdrop}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-25 blur-[2px] scale-105 pointer-events-none"
            />
          )}
          <div
            aria-hidden="true"
            className="sa-ps5-modal-scrim-y absolute inset-0 bg-gradient-to-t from-[#131922] via-[#131922]/85 to-[#10151d]/70"
          />
          <div
            aria-hidden="true"
            className="sa-modal-scrim-x sa-ps5-modal-scrim-x absolute inset-0 bg-gradient-to-r from-[#10151d]/95 via-[#10151d]/75 to-transparent"
          />

          <div className="relative max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-9">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-7 items-start">
              {/* Portrait coverImage + SteamTools Ratings below coverImage */}
              <div className="w-36 sm:w-44 lg:w-52 shrink-0 flex flex-col gap-2.5">
                <div className="w-full aspect-[2/3] rounded bg-[#0c1016] border border-white/[0.12] shadow-2xl overflow-hidden">
                  <GameCover
                    src={game.coverImage}
                    alt={game.name}
                    imgClassName="w-full h-full object-cover"
                  />
                </div>

                {isSteamTools && (ratingPositiveRaw || ratingNegativeRaw) && (
                  <div className="grid grid-cols-2 gap-2">
                    {ratingPositiveRaw && (
                      <div className="p-2 sm:p-2.5 rounded bg-[#141b24]/95 border border-white/[0.08] text-center">
                        <div
                          className={`flex items-center justify-center gap-1 text-[13px] sm:text-[14px] font-bold font-mono-tabular ${
                            !Number.isNaN(ratingPositiveNum) && ratingPositiveNum >= 70
                              ? 'text-[#4ade80]'
                              : !Number.isNaN(ratingPositiveNum) && ratingPositiveNum >= 50
                              ? 'text-[#facc15]'
                              : 'text-[#f87171]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {ratingPositiveRaw.endsWith('%')
                              ? ratingPositiveRaw
                              : `${ratingPositiveRaw}%`}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[#8b9bb4]">
                          {t.positive}
                        </div>
                      </div>
                    )}

                    {ratingNegativeRaw && (
                      <div className="p-2 sm:p-2.5 rounded bg-[#141b24]/95 border border-white/[0.08] text-center">
                        <div className="flex items-center justify-center gap-1 text-[13px] sm:text-[14px] font-bold font-mono-tabular text-[#f87171]">
                          <ThumbsDown className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {!Number.isNaN(ratingNegativeNum)
                              ? ratingNegativeNum.toLocaleString()
                              : ratingNegativeRaw}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[#8b9bb4]">
                          {t.negative}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Game Title, Genres, Core Specs & Quick Actions */}
              <div className="flex-1 min-w-0 w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-[#66c0f4]">
                    <SectionSourceBadge tab={game.tab} />
                    {game.isNew && (
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-[#1a9fff] text-white font-bold tracking-[0.08em]">
                        NEW
                      </span>
                    )}
                    {isTools && game.isPinned && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold tracking-[0.08em]">
                        <Pin className="w-3 h-3" />
                        <span>{t.pinned}</span>
                      </span>
                    )}
                    {isTools && game.isFree && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold tracking-[0.08em]">
                        <BadgeCheck className="w-3 h-3" />
                        <span>{t.free}</span>
                      </span>
                    )}
                    <span className="text-[#4b5b70]">·</span>
                    <span>{isTools ? t.tools : game.category || game.tab}</span>
                    {game.repackBy && (
                      <>
                        <span className="text-[#4b5b70]">·</span>
                        <span className="text-[#9cb1c9]">{game.repackBy}</span>
                      </>
                    )}
                    {game.dateAdded && (
                      <>
                        <span className="text-[#4b5b70]">·</span>
                        <span className="text-[#8b9bb4] font-mono-tabular">{game.dateAdded}</span>
                      </>
                    )}
                  </div>

                  <h1 className="font-display text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight text-balance">
                    {game.name}
                  </h1>

                  <div className="text-[13px] sm:text-[14px] text-[#9cb4cc]">
                    {game.genreList.length > 0
                      ? game.genreList.join(' · ')
                      : isTools
                      ? [
                          game.isFree ? 'Free Software' : 'Software Tool',
                          game.isPinned ? 'Pinned Release' : '',
                          game.version ? `v${game.version.replace(/^v/i, '')}` : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : game.genresRaw || 'PC Release'}
                  </div>
                </div>

                {/* Key Release Numbers Strip + Compact Your PC Can Run It Badge */}
                <div
                  className={`grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 ${
                    canRunEvaluation ? 'sm:grid-cols-5 max-w-3xl' : 'sm:grid-cols-4 max-w-2xl'
                  }`}
                >
                  {isSteamTools ? (
                    <div className="p-2.5 sm:p-3 rounded bg-[#141b24]/90 border border-white/[0.08]">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-[#8b9bb4] font-semibold">
                        {t.gameId}
                      </div>
                      {steamGameId ? (
                        <button
                          type="button"
                          onClick={handleCopyGameId}
                          title={t.gameId}
                          className="mt-0.5 inline-flex items-center gap-1.5 text-[12.5px] sm:text-[13px] font-semibold font-mono-tabular text-[#66c0f4] hover:text-white transition-colors cursor-pointer max-w-full"
                        >
                          <span className="truncate">{steamGameId}</span>
                          {copiedGameId ? (
                            <Check className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          )}
                        </button>
                      ) : (
                        <div className="mt-0.5 text-[12.5px] sm:text-[13px] font-semibold text-white">
                          —
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 sm:p-3 rounded bg-[#141b24]/90 border border-white/[0.08]">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-[#8b9bb4] font-semibold">
                        {t.version}
                      </div>
                      <div className="mt-0.5 text-[12.5px] sm:text-[13px] font-semibold text-white truncate">
                        {game.version || 'Latest'}
                      </div>
                    </div>
                  )}
                  <div className="p-2.5 sm:p-3 rounded bg-[#141b24]/90 border border-white/[0.08]">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-[#8b9bb4] font-semibold">
                      {t.originalSize}
                    </div>
                    <div className="mt-0.5 text-[12.5px] sm:text-[13px] font-semibold text-[#e5e9f0] font-mono-tabular truncate">
                      {game.originalSize || '—'}
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded bg-[#141b24]/90 border border-white/[0.08]">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-[#8b9bb4] font-semibold">
                      {isTools ? t.downloadSize : t.repackSize}
                    </div>
                    <div className="mt-0.5 text-[12.5px] sm:text-[13px] font-semibold text-[#66c0f4] font-mono-tabular truncate">
                      {game.repackSize || '—'}
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded bg-[#141b24]/90 border border-white/[0.08]">
                    <div className="text-[10px] uppercase tracking-[0.08em] text-[#8b9bb4] font-semibold">
                      {t.downloadChannels}
                    </div>
                    <div className="mt-0.5 text-[12.5px] sm:text-[13px] font-semibold text-white font-mono-tabular">
                      {groupedMirrors.length}{' '}
                      {groupedMirrors.length === 1 ? t.channelSingular : t.channelPlural}
                    </div>
                  </div>
                  {canRunEvaluation && (
                    <CanRunItHeroBadge
                      evaluation={canRunEvaluation}
                      language={language}
                      onClick={() =>
                        requirementsSectionRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        })
                      }
                    />
                  )}
                </div>

                {/* Primary Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      downloadsSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[13px] font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.downloadChannels}</span>
                  </button>

                  {(game.embedTrailerUrl || game.trailerUrl) && (
                    <button
                      type="button"
                      onClick={handleWatchTrailer}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#232b36] hover:bg-[#2d3847] border border-white/[0.1] text-[#e5e9f0] hover:text-white text-[13px] font-semibold transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-[#66c0f4] fill-current" />
                      <span>{t.watchTrailer}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Body Content */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8 space-y-7 sm:space-y-8">
          {/* Telegram Community Banner (Tools / Architect pages only, above Release Details) */}
          {isTools && (
            <a
              href="https://t.me/secretarea1337"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 rounded-xl bg-[#0d1824] hover:bg-[#112131] border border-[#24a1de]/30 hover:border-[#24a1de]/65 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="w-10 h-10 rounded-full bg-[#24a1de] text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5 -translate-x-[1px]"
                  >
                    <path d="M21.93 3.29a1.5 1.5 0 0 0-1.56-.21L2.74 10.1a1.45 1.45 0 0 0 .08 2.71l4.41 1.48 1.66 5.26a1.15 1.15 0 0 0 1.91.47l2.54-2.5 4.4 3.24a1.45 1.45 0 0 0 2.27-.87l3.01-14.92a1.5 1.5 0 0 0-.09-1.68ZM9.65 13.79l8.22-6.66-6.37 7.6-.47 3.1-1.38-4.04Z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-[#8b9bb4] leading-tight">
                    Join our community
                  </div>
                  <div className="mt-0.5 text-[14.5px] sm:text-[15.5px] font-bold text-[#24a1de] group-hover:text-[#4cc2ff] transition-colors truncate">
                    Get it on Telegram
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#24a1de] group-hover:text-[#4cc2ff] shrink-0 transition-colors" />
            </a>
          )}

          {/* Release Details Section (Above Trailer & Gallery) */}
          <section className="p-4 sm:p-5 rounded bg-[#12171f] border border-white/[0.06] space-y-3.5">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#66c0f4]" />
              <h2 className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-[#66c0f4]">
                {t.releaseDetails}
              </h2>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-[12.5px]">
              {isSteamTools ? (
                <div className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                    <Hash className="w-3.5 h-3.5 text-[#66c0f4]" />
                    <span>{t.gameId}</span>
                  </dt>
                  <dd className="text-white font-semibold font-mono-tabular">
                    {steamGameId ? (
                      <button
                        type="button"
                        onClick={handleCopyGameId}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1b2430] hover:bg-[#243040] border border-white/[0.08] text-[#66c0f4] hover:text-white transition-colors cursor-pointer"
                      >
                        <span>{steamGameId}</span>
                        {copiedGameId ? (
                          <Check className="w-3 h-3 text-[#34d399]" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-80" />
                        )}
                      </button>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              ) : (
                <div className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                    <Tag className="w-3.5 h-3.5 text-[#66c0f4]" />
                    <span>{t.version}</span>
                  </dt>
                  <dd className="text-white font-semibold">{game.version || '—'}</dd>
                </div>
              )}
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                  <HardDrive className="w-3.5 h-3.5 text-[#66c0f4]" />
                  <span>{t.originalSize}</span>
                </dt>
                <dd className="text-[#e5e9f0] font-mono-tabular font-medium">
                  {game.originalSize || '—'}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                  <Download className="w-3.5 h-3.5 text-[#66c0f4]" />
                  <span>{isTools ? t.downloadSize : t.repackSize}</span>
                </dt>
                <dd className="font-semibold text-[#66c0f4] font-mono-tabular">
                  {game.repackSize || '—'}
                </dd>
              </div>
              {isTools ? (
                <>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#66c0f4]" />
                      <span>{t.license}</span>
                    </dt>
                    <dd>
                      {game.isFree ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/45 text-emerald-300 text-[11.5px] font-semibold">
                          {t.free}
                        </span>
                      ) : (
                        <span className="text-[#e5e9f0] font-medium">Full Package</span>
                      )}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                      <Pin className="w-3.5 h-3.5 text-[#66c0f4]" />
                      <span>{t.pinned}</span>
                    </dt>
                    <dd>
                      {game.isPinned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/45 text-amber-300 text-[11.5px] font-semibold">
                          {t.pinned}
                        </span>
                      ) : (
                        <span className="text-[#8b9bb4]">{t.standard}</span>
                      )}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                      <Calendar className="w-3.5 h-3.5 text-[#66c0f4]" />
                      <span>{t.dateAdded}</span>
                    </dt>
                    <dd className="text-[#e5e9f0] font-mono-tabular">
                      {game.dateAdded || '—'}
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                      <UserCheck className="w-3.5 h-3.5 text-[#66c0f4]" />
                      <span>{t.repacker}</span>
                    </dt>
                    <dd className="text-[#e5e9f0] font-medium">{game.repackBy || '—'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                      <Globe className="w-3.5 h-3.5 text-[#66c0f4]" />
                      <span>{t.languages}</span>
                    </dt>
                    <dd className="text-[#e5e9f0]">{game.languages || '—'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8b9bb4]">
                      <Gamepad2 className="w-3.5 h-3.5 text-[#66c0f4]" />
                      <span>{t.genres}</span>
                    </dt>
                    <dd className="text-[#e5e9f0]">{game.genreList.join(' · ') || '—'}</dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {/* Trailer & Gallery Media Carousel */}
          {(mediaSlides.length > 0 || game.trailerUrl) && (
            <section ref={mediaSectionRef} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#8b9bb4]">
                  {t.trailerGallery}
                </h2>
                <div className="flex items-center gap-2">
                  {trailerSlideIdx >= 0 && activeSlideIndex !== trailerSlideIdx && (
                    <button
                      type="button"
                      onClick={() => setActiveSlideIndex(trailerSlideIdx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#232b36] hover:bg-[#2d3847] border border-white/[0.08] text-[12px] font-medium text-[#66c0f4] hover:text-white transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.switchToTrailer}</span>
                    </button>
                  )}
                  {game.trailerUrl && !game.embedTrailerUrl && (
                    <a
                      href={game.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#232b36] hover:bg-[#2d3847] border border-white/[0.08] text-[12px] font-medium text-[#66c0f4] hover:text-white transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.openTrailer}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {mediaSlides.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 items-start">
                  <div
                    dir="ltr"
                    className="lg:col-span-3 relative aspect-video bg-[#0b0e14] rounded overflow-hidden border border-white/[0.08]"
                  >
                    {activeSlide?.kind === 'trailer' && (
                      <iframe
                        key={activeSlide.url}
                        src={activeSlide.url}
                        title={`${game.name} Trailer`}
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    )}
                    {activeSlide?.kind === 'video' && (
                      <video
                        key={activeSlide.url}
                        src={activeSlide.url}
                        autoPlay
                        controls
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                    {activeSlide?.kind === 'image' && (
                      <img
                        src={activeSlide.url}
                        alt={`${game.name} screenshot`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {mediaSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous media"
                          onClick={() =>
                            setActiveSlideIndex(
                              (prev) => (prev - 1 + mediaSlides.length) % mediaSlides.length
                            )
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/65 hover:bg-black/90 text-white border border-white/10 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next media"
                          onClick={() =>
                            setActiveSlideIndex((prev) => (prev + 1) % mediaSlides.length)
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/65 hover:bg-black/90 text-white border border-white/10 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {mediaSlides.length > 1 && (
                    <div className="no-scrollbar flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[420px] pb-1 lg:pb-0 lg:pe-1">
                      {mediaSlides.map((slide, idx) => {
                        const active = idx === activeSlideIndex;
                        return (
                          <button
                            key={`${slide.kind}-${idx}`}
                            type="button"
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`relative w-32 lg:w-full aspect-video rounded overflow-hidden shrink-0 border transition-all cursor-pointer bg-[#10151c] ${
                              active
                                ? 'border-[#1a9fff] ring-1 ring-[#1a9fff]'
                                : 'border-white/[0.08] opacity-70 hover:opacity-100'
                            }`}
                          >
                            {slide.kind === 'image' ? (
                              <img
                                src={slide.url}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#1e2633] text-[#66c0f4]">
                                <Play className="w-4 h-4 fill-current" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">
                                  {slide.kind === 'trailer' ? 'Official Trailer' : 'Gameplay Clip'}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Description, Download Channels, Requirements, Steps & Tools */}
          <div
            className={`grid grid-cols-1 gap-6 lg:gap-8 ${
              hasSecondarySidebar ? 'lg:grid-cols-3' : ''
            }`}
          >
            <div className={`${hasSecondarySidebar ? 'lg:col-span-2' : ''} space-y-7`}>
              {/* Description with Icon */}
              <section className="p-4 sm:p-5 rounded bg-[#12171f] border border-white/[0.06] space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#66c0f4]" />
                  <h2 className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-[#66c0f4]">
                    {t.description}
                  </h2>
                </div>
                <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#d4dde7] whitespace-pre-line">
                  {game.description || t.noDescription}
                </p>
              </section>

              {/* System Requirements + Can Run It? Hardware Comparison */}
              <section ref={requirementsSectionRef} className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#66c0f4]" />
                  <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#8b9bb4]">
                    {t.requirementsAndCanRun}
                  </h2>
                </div>

                {canRunEvaluation && systemSpecs && (
                  <CanRunItPanel
                    evaluation={canRunEvaluation}
                    specs={systemSpecs}
                    language={language}
                    isRefreshingSpecs={isRefreshingSpecs}
                    onRefreshAutoSpecs={onRefreshSpecs}
                    onSaveCustomSpecs={onSaveCustomSpecs}
                    onResetCustomSpecs={onResetCustomSpecs}
                  />
                )}

                {hasStructuredReqs ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {os && (
                      <div className="p-3.5 rounded bg-[#12171f] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-2 rounded bg-[#1a222e] text-[#66c0f4] shrink-0">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10.5px] uppercase tracking-wider text-[#66c0f4] font-semibold">
                            {t.osLabel}
                          </div>
                          <div className="mt-1 text-[13px] text-[#dce4ee]">{os}</div>
                        </div>
                      </div>
                    )}
                    {ram && (
                      <div className="p-3.5 rounded bg-[#12171f] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-2 rounded bg-[#1a222e] text-[#66c0f4] shrink-0">
                          <MemoryStick className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10.5px] uppercase tracking-wider text-[#66c0f4] font-semibold">
                            {t.ramLabel}
                          </div>
                          <div className="mt-1 text-[13px] text-[#dce4ee]">{ram}</div>
                        </div>
                      </div>
                    )}
                    {cpu && (
                      <div className="p-3.5 rounded bg-[#12171f] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-2 rounded bg-[#1a222e] text-[#66c0f4] shrink-0">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10.5px] uppercase tracking-wider text-[#66c0f4] font-semibold">
                            {t.cpuLabel}
                          </div>
                          <div className="mt-1 text-[13px] text-[#dce4ee]">{cpu}</div>
                        </div>
                      </div>
                    )}
                    {gpu && (
                      <div className="p-3.5 rounded bg-[#12171f] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-2 rounded bg-[#1a222e] text-[#66c0f4] shrink-0">
                          <Gpu className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10.5px] uppercase tracking-wider text-[#66c0f4] font-semibold">
                            {t.gpuLabel}
                          </div>
                          <div className="mt-1 text-[13px] text-[#dce4ee]">{gpu}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded bg-[#12171f] border border-white/[0.06] flex items-start gap-3 text-[13px] text-[#c6d4df]">
                    <div className="p-2 rounded bg-[#1a222e] text-[#66c0f4] shrink-0">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div className="pt-0.5">
                      {raw || t.noReqsListed}
                    </div>
                  </div>
                )}
              </section>

              {/* Tools & Steps (Steps directly below Tools) */}
              {(game.parsedTools.length > 0 ||
                rawToolsFallback ||
                game.parsedSteps.length > 0) && (
                <div className="space-y-6">
                  {(game.parsedTools.length > 0 || rawToolsFallback) && (
                    <section className="p-5 rounded bg-[#12171f] border border-white/[0.07] space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#66c0f4]" />
                        <h2 className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-[#66c0f4]">
                          {t.tools}
                        </h2>
                      </div>
                      {game.parsedTools.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {game.parsedTools.map((tool, i) => (
                            <a
                              key={i}
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-[#232b36] hover:bg-[#2d3847] border border-white/[0.08] text-[12px] font-medium text-[#66c0f4] hover:text-white transition-colors"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>{tool.name}</span>
                              <ExternalLink className="w-3 h-3 text-[#8b9bb4]" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 text-[13px] text-[#c6d4df]">
                          <Wrench className="w-4 h-4 text-[#66c0f4] shrink-0 mt-0.5" />
                          <p className="whitespace-pre-line">{rawToolsFallback}</p>
                        </div>
                      )}
                    </section>
                  )}

                  {game.parsedSteps.length > 0 && (
                    <section className="p-5 rounded bg-[#12171f] border border-white/[0.07] space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-[#66c0f4]" />
                          <h2 className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-[#66c0f4]">
                            {t.steps}
                          </h2>
                        </div>
                        <span className="text-[11px] font-mono-tabular text-[#8b9bb4]">
                          {checkedSteps.size}/{game.parsedSteps.length} {t.completed}
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="h-1 w-full rounded bg-[#1d2532] overflow-hidden">
                        <motion.div
                          className="h-full bg-[#1a9fff]"
                          initial={{ width: 0 }}
                          animate={{ width: `${completedRatio}%` }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>

                      <ol className="relative space-y-2.5">
                        {game.parsedSteps.map((step, i) => {
                          const isDone = checkedSteps.has(i);
                          const isLast = i === game.parsedSteps.length - 1;
                          return (
                            <motion.li
                              key={`${game.id}-step-${i}`}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.28,
                                delay: Math.min(i * 0.06, 0.4),
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              whileHover={{ x: 3 }}
                              onClick={() => toggleStepDone(i)}
                              className={`relative p-3 rounded border transition-colors cursor-pointer flex items-start gap-3 ${
                                isDone
                                  ? 'bg-[#152436] border-[#1a9fff]/50'
                                  : 'bg-[#171e29] hover:bg-[#1d2635] border-white/[0.06]'
                              }`}
                            >
                              {!isLast && (
                                <span
                                  aria-hidden="true"
                                  className="absolute start-[23px] top-10 bottom-[-14px] w-px bg-white/[0.09] pointer-events-none"
                                />
                              )}

                              <motion.span
                                animate={{ scale: isDone ? [1, 1.15, 1] : 1 }}
                                transition={{ duration: 0.25 }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono-tabular shrink-0 mt-0.5 transition-colors ${
                                  isDone
                                    ? 'bg-[#1a9fff] text-white'
                                    : 'bg-[#222c3c] text-[#66c0f4] border border-white/[0.1]'
                                }`}
                              >
                                {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                              </motion.span>

                              <span
                                className={`text-[13px] leading-relaxed transition-colors ${
                                  isDone ? 'text-white' : 'text-[#d4dde7]'
                                }`}
                              >
                                {step}
                              </span>
                            </motion.li>
                          );
                        })}
                      </ol>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Optional Right Sidebar for Linked Items */}
            {hasSecondarySidebar && (
              <aside className="space-y-4">
                {linkedCatalogItems.length > 0 && onJumpToItem && (
                  <div className="p-4 rounded bg-[#12171f] border border-white/[0.06] space-y-2.5">
                    <h2 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#66c0f4]">
                      {t.linkedEntries} ({linkedCatalogItems.length})
                    </h2>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {linkedCatalogItems.map((linked) => (
                        <button
                          key={`${linked.tab}-${linked.id}`}
                          type="button"
                          onClick={() => onJumpToItem(linked)}
                          className="w-full p-2 rounded bg-[#1a222d] hover:bg-[#243040] border border-white/[0.06] flex items-center gap-2.5 text-start transition-colors cursor-pointer"
                        >
                          <div className="w-7 h-9 rounded-[2px] overflow-hidden bg-[#0b0e14] shrink-0">
                            <GameCover src={linked.coverImage} alt={linked.name} compact />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-semibold text-white truncate">
                              {linked.name}
                            </div>
                            <div className="text-[10.5px] text-[#66c0f4] font-mono-tabular uppercase">
                              {linked.tab} {linked.repackSize ? `· ${linked.repackSize}` : ''}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>

          {/* What is a Hypervisor Bypass? Section (Hypervisor pages only, directly above Download Channels) */}
          {game.tab === 'hypervisor' && (
            <section className="p-5 rounded bg-[#1d1418] border border-[#dc2626]/45 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#f87171] shrink-0" />
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#fca5a5]">
                  {t.hvWarningTitle}
                </h2>
              </div>
              <p className="text-[13.5px] text-[#e5e9f0] leading-relaxed">
                {t.hvWarningBody}
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setIsHvGuideOpen(true)}
                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#66c0f4] hover:text-white underline underline-offset-4 break-all text-start cursor-pointer"
                >
                  <span>https://fitgirl-repacks.site/hypervisor-guide/</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </section>
          )}

          {/* SteamTools Denuvo & Launcher Notices (Directly Above Download Channels) */}
          {isSteamTools && (hasDenuvo || hasExternalLauncher) && (
            <section className="space-y-3" aria-label="DRM and launcher compatibility warnings">
              {hasDenuvo && (
                <div className="p-4 sm:p-5 rounded bg-[#2a161b] border border-[#ef4444]/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
                  <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-[#e5e9f0]">
                    <strong className="text-white">Denuvo DRM Detected:</strong>{' '}
                    This game uses Denuvo Anti-Tampering DRM. There is currently no known public bypass for Denuvo, meaning you likely will NOT be able to play this game. However, there&apos;s a slight chance it might be available in the{' '}
                    <a
                      href="https://depotbox.lol/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#60a5fa] hover:text-white underline underline-offset-2 font-semibold"
                    >
                      DepotBox Launcher
                    </a>{' '}
                    with a bypass. Download at your own risk.
                  </p>
                </div>
              )}

              {hasExternalLauncher && (
                <div className="p-4 sm:p-5 rounded bg-[#262216] border border-[#eab308]/60 flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-[#facc15] shrink-0 mt-0.5" />
                  <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-[#e5e9f0]">
                    <strong className="text-white">Third-Party Account/Launcher Required:</strong>{' '}
                    This game requires an external launcher or account verification.
                    {hasDenuvo
                      ? ' As this game also has Denuvo, it might be impossible to play in any case. Download at your own risk.'
                      : ' Please make sure you have the required third-party launcher or account setup before launching.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Download Channels Section (Directly Above Recommended For You) */}
          <section ref={downloadsSectionRef} id="download-channels" className="pt-2 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CloudDownload className="w-4 h-4 text-[#66c0f4]" />
                <h2 className="text-[13px] font-bold tracking-[0.08em] uppercase text-[#8b9bb4]">
                  {t.downloadChannels}
                </h2>
              </div>

              {isTools && (game.isPinned || game.isFree) && (
                <div className="flex flex-wrap items-center gap-2">
                  {game.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10.5px] font-bold uppercase tracking-[0.06em]">
                      <Pin className="w-3 h-3" />
                      <span>{t.pinned}</span>
                    </span>
                  )}
                  {game.isFree && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10.5px] font-bold uppercase tracking-[0.06em]">
                      <BadgeCheck className="w-3 h-3" />
                      <span>{t.free}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {groupedMirrors.length === 0 ? (
              <div className="p-4 rounded bg-[#12171f] border border-white/[0.06] text-[13px] text-[#8b9bb4]">
                {t.noChannels}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupedMirrors.map(({ groupName, links }) => {
                  const isMagnetChannel = groupName === 'Magnet Link';
                  const isFullDownloadChannel = groupName === 'Full Download';
                  const isFeaturedDirect =
                    isMagnetChannel ||
                    isFullDownloadChannel ||
                    groupName === 'MediaFire (Direct Link)';
                  return (
                    <div
                      key={groupName}
                      className={`p-4 rounded border space-y-3 ${
                        isFeaturedDirect
                          ? 'md:col-span-2 bg-[#121a26] border-[#1a9fff]/40'
                          : 'bg-[#12171f] border-white/[0.07]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {isMagnetChannel ? (
                            <Magnet className="w-4 h-4 text-[#1a9fff]" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-[#66c0f4]" />
                          )}
                          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66c0f4]">
                            {groupName}
                          </span>
                          {isFeaturedDirect && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#1a9fff]/20 border border-[#1a9fff]/45 text-[#66c0f4] text-[10px] font-bold uppercase tracking-[0.06em]">
                              <Sparkles className="w-3 h-3" />
                              <span>{t.recommendedTag}</span>
                            </span>
                          )}
                          {isTools && isFullDownloadChannel && game.isFree && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-emerald-500/20 border border-emerald-400/45 text-emerald-300 text-[10px] font-bold uppercase tracking-[0.06em]">
                              <BadgeCheck className="w-3 h-3" />
                              <span>{t.free}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono-tabular text-[#7a8ba3]">
                          {links.length} {links.length === 1 ? 'link' : 'links'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {links.map((mirror, idx) => {
                          const key = `${groupName}-${idx}`;
                          if (mirror.isMagnet) {
                            return (
                              <a
                                key={key}
                                href={mirror.url}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors"
                              >
                                <Magnet className="w-3.5 h-3.5" />
                                <span>{mirror.label}</span>
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            );
                          }

                          return (
                            <a
                              key={key}
                              href={mirror.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#232b36] hover:bg-[#2e3948] border border-white/[0.08] text-[#e5e9f0] text-[12px] font-medium transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-[#66c0f4]" />
                              <span>{mirror.label}</span>
                              <ExternalLink className="w-3 h-3 text-[#8b9bb4]" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommended For You: Same Genres Auto-Slide (No Scrollbar, Button + Auto Controls; omitted on SteamTools) */}
          {!isSteamTools && recommendedGames.length > 0 && (
            <section
              onMouseEnter={() => setIsRecPaused(true)}
              onMouseLeave={() => setIsRecPaused(false)}
              onFocus={() => setIsRecPaused(true)}
              onBlur={() => setIsRecPaused(false)}
              className="pt-4 border-t border-white/[0.08] space-y-4"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-bold tracking-[0.06em] uppercase text-white">
                    {t.recommendedForYou}
                  </h2>
                  <p className="text-[12px] text-[#8b9bb4] mt-0.5">
                    {isTools
                      ? game.name
                      : game.genreList.length > 0
                      ? game.genreList.slice(0, 3).join(' · ')
                      : game.category || 'SecretArea'}
                  </p>
                </div>

                <div dir="ltr" className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Slide recommended games left"
                    onClick={() => scrollRecommended(-1)}
                    className="p-2 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#dce4ee] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Slide recommended games right"
                    onClick={() => scrollRecommended(1)}
                    className="p-2 rounded bg-[#212a37] hover:bg-[#2c3849] border border-white/[0.08] text-[#dce4ee] hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={recommendedSliderRef}
                dir="ltr"
                className="no-scrollbar flex gap-3 sm:gap-3.5 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory"
              >
                {recommendedGames.map((rec) => {
                  const recEval = systemSpecs ? evaluateCanRunGame(rec, systemSpecs) : null;
                  const metaLine = [
                    rec.tab === 'architect'
                      ? [rec.isFree ? t.free : '', rec.isPinned ? t.pinned : '', rec.version]
                          .filter(Boolean)
                          .join(' · ') || t.tools
                      : rec.genreList.slice(0, 2).join(' · ') || rec.category,
                    rec.repackSize || (rec.tab !== 'architect' ? rec.version : ''),
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <div
                      key={`${rec.tab}-${rec.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onJumpToItem?.(rec)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onJumpToItem?.(rec);
                        }
                      }}
                      className="group w-[138px] sm:w-[168px] md:w-[184px] lg:w-[196px] 2xl:w-[210px] shrink-0 snap-start bg-[#18202b] hover:bg-[#212b3a] border border-white/[0.06] hover:border-[#1a9fff]/60 rounded overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]"
                    >
                      <div className="relative aspect-[2/3] bg-[#0f141b] overflow-hidden">
                        <GameCover
                          src={rec.coverImage}
                          alt={rec.name}
                          imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />

                        {rec.isNew && (
                          <div className="absolute inset-x-0 top-0 bg-[#1a9fff] text-white text-[9.5px] font-bold tracking-[0.07em] uppercase py-[3px] text-center">
                            NEW
                          </div>
                        )}

                        {(rec.tab === 'hypervisor' ||
                          rec.tab === 'architect' ||
                          rec.tab === 'ps5' ||
                          rec.tab === 'steamtools') && (
                          <SectionSourceBadge
                            tab={rec.tab}
                            hasTopRibbon={rec.isNew}
                            className="absolute start-1.5"
                          />
                        )}
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                        <h3 className="text-[12.5px] font-semibold text-[#e5e9f0] group-hover:text-white line-clamp-1">
                          {rec.name}
                        </h3>
                        <div className="text-[11px] text-[#8b9bb4] truncate">{metaLine}</div>
                        {recEval && recEval.status !== 'unknown' && (
                          <div
                            className={`text-[10.5px] font-bold truncate ${
                              recEval.status === 'can-run'
                                ? 'text-[#4ade80]'
                                : 'text-[#f87171]'
                            }`}
                          >
                            {recEval.status === 'can-run'
                              ? `✓ ${t.runsWell}`
                              : `✕ ${recEval.shortBadge}`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <HypervisorGuideModal
        isOpen={isHvGuideOpen}
        onClose={() => setIsHvGuideOpen(false)}
      />
    </div>
  );
}
