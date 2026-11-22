import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Building2, ChevronLeft, ChevronRight, Layers, X } from 'lucide-react';
import type { GameItem, SheetCatalogData } from '../types';
import { GameCover } from './GameCover';
import { SectionSourceBadge } from './SectionBadge';
import { resolveSheetRefItem } from './ExtrasView';
import type { AppLanguage } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface StudioDetailModalProps {
  studio: GameItem | null;
  catalog: SheetCatalogData;
  favorites: Set<string>;
  language?: AppLanguage;
  disableEscape?: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: GameItem) => void;
  onClose: () => void;
}

type StudioCategoryTab = 'all' | 'game' | 'hypervisor' | 'steamtools' | 'architect';

interface CategorizedStudioItem {
  categoryKey: Exclude<StudioCategoryTab, 'all'>;
  categoryLabel: string;
  item: GameItem;
}

const STUDIO_ITEMS_PER_PAGE = 20;

export function StudioDetailModal({
  studio,
  catalog,
  language = 'en',
  disableEscape = false,
  onSelectItem,
  onClose,
}: StudioDetailModalProps) {
  const t = getTranslations(language).studios;
  const [activeCategory, setActiveCategory] = useState<StudioCategoryTab>('all');
  const [page, setPage] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveCategory('all');
    setPage(0);
    setLogoFailed(false);
  }, [studio?.id]);

  useEffect(() => {
    setPage(0);
  }, [activeCategory]);

  useEffect(() => {
    if (!studio || disableEscape) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [studio, disableEscape, onClose]);

  const categorizedItems = useMemo(() => {
    if (!studio) {
      return {
        all: [] as CategorizedStudioItem[],
        game: [] as CategorizedStudioItem[],
        hypervisor: [] as CategorizedStudioItem[],
        steamtools: [] as CategorizedStudioItem[],
        architect: [] as CategorizedStudioItem[],
      };
    }

    const resolveGroup = (
      rawField: string | undefined,
      categoryKey: Exclude<StudioCategoryTab, 'all'>,
      categoryLabel: string
    ): CategorizedStudioItem[] => {
      if (!rawField) return [];
      const seen = new Set<string>();
      const out: CategorizedStudioItem[] = [];
      for (const tok of rawField.split(',')) {
        const resolved = resolveSheetRefItem(tok, catalog);
        if (resolved && !seen.has(`${resolved.tab}:${resolved.id}`)) {
          seen.add(`${resolved.tab}:${resolved.id}`);
          out.push({ categoryKey, categoryLabel, item: resolved });
        }
      }
      return out;
    };

    const game = resolveGroup(studio.rawFields['Games ID'], 'game', 'Games');
    const hypervisor = resolveGroup(studio.rawFields['Hypervisor ID'], 'hypervisor', 'Hypervisor');
    const steamtools = resolveGroup(studio.rawFields['SteamTools ID'], 'steamtools', 'SteamTools');
    const architect = resolveGroup(studio.rawFields['Tools ID'], 'architect', 'Tools');

    return {
      all: [...game, ...hypervisor, ...steamtools, ...architect],
      game,
      hypervisor,
      steamtools,
      architect,
    };
  }, [studio, catalog]);

  if (!studio) return null;

  const tabs: { key: StudioCategoryTab; label: string; count: number }[] = [
    { key: 'all', label: t.all, count: categorizedItems.all.length },
    { key: 'game', label: 'Games', count: categorizedItems.game.length },
    { key: 'hypervisor', label: 'Hypervisor', count: categorizedItems.hypervisor.length },
    { key: 'steamtools', label: 'SteamTools', count: categorizedItems.steamtools.length },
  ];

  if (categorizedItems.architect.length > 0) {
    tabs.push({
      key: 'architect',
      label: 'Tools',
      count: categorizedItems.architect.length,
    });
  }

  const displayedItems = categorizedItems[activeCategory];
  const totalPages = Math.max(1, Math.ceil(displayedItems.length / STUDIO_ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = displayedItems.slice(
    safePage * STUDIO_ITEMS_PER_PAGE,
    (safePage + 1) * STUDIO_ITEMS_PER_PAGE
  );

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPages - 1));
    setPage(bounded);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={studio.name}
      className="sa-ps5-modal fixed inset-0 z-40 w-screen h-screen bg-[#141921] flex flex-col overflow-hidden"
    >
      {/* Top Studio Header */}
      <header className="sa-ps5-modal-header px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 bg-[#171a21] border-b border-white/[0.08] shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-[#232b36] hover:bg-[#2d3847] border border-white/[0.08] text-[12px] font-semibold text-[#e5e9f0] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span className="hidden xs:inline sm:inline">{t.back}</span>
            </button>

            <div className="w-12 h-9 sm:w-16 sm:h-11 rounded-[3px] bg-[#f4f6f9] flex items-center justify-center p-1.5 sm:p-2 shrink-0 overflow-hidden">
              {studio.coverImage && !logoFailed ? (
                <img
                  src={studio.coverImage}
                  alt={studio.name}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#475569]" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-xl font-bold text-white truncate">
                {studio.name}
              </h2>
              <p className="text-[11px] sm:text-[12px] text-[#8b9bb4] font-mono-tabular">
                {categorizedItems.all.length}{' '}
                {categorizedItems.all.length === 1 ? t.totalTitleSingular : t.totalTitlePlural}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close studio popup"
            className="p-2 rounded bg-[#252f3d] hover:bg-[#313e50] text-[#aeb9c7] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scrollable Full-Screen Content */}
      <div
        ref={scrollContainerRef}
        className="sa-ps5-modal-scroll flex-1 overflow-y-auto bg-gradient-to-b from-[#1a2330] via-[#151b24] to-[#10141b]"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* About This Studio */}
          <section className="sa-ps5-panel p-4 sm:p-5 rounded bg-[#12171f] border border-white/[0.06] space-y-1.5">
            <h3 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#66c0f4]">
              {t.aboutStudio}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[#d4dde7] whitespace-pre-line">
              {studio.description || t.noOverview}
            </p>
          </section>

          {/* Category Filter Tabs */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
              <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => {
                  const isActive = activeCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveCategory(tab.key)}
                      className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#1a9fff] text-white'
                          : 'bg-[#12171f] text-[#9ca8b8] hover:bg-[#212a37] hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`ms-1.5 font-mono-tabular text-[11px] ${
                          isActive ? 'text-white/90' : 'text-[#66c0f4]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="text-[12px] text-[#8b9bb4] font-mono-tabular whitespace-nowrap">
                  {t.pageOf} {safePage + 1} / {totalPages}
                </div>
              )}
            </div>

            {pageItems.length === 0 ? (
              <div className="sa-ps5-panel py-12 rounded bg-[#12171f] border border-white/[0.06] text-center space-y-2">
                <Layers className="w-8 h-8 text-[#4b5c73] mx-auto" />
                <p className="text-[13px] text-[#8b9bb4]">
                  {t.noItemsInCategory}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5 lg:gap-4">
                  {pageItems.map(({ categoryKey, categoryLabel, item }) => {
                    const metaLine = [categoryLabel, item.repackSize || item.version]
                      .filter(Boolean)
                      .join(' · ');

                    return (
                      <div
                        key={`${categoryKey}-${item.tab}-${item.id}`}
                        onClick={() => onSelectItem(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectItem(item);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="group bg-[#18202b] hover:bg-[#212b3a] border border-white/[0.06] hover:border-[#1a9fff]/60 rounded overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a9fff]"
                      >
                        <div className="relative aspect-[2/3] bg-[#0f141b] overflow-hidden">
                          <GameCover
                            src={item.coverImage}
                            alt={item.name}
                            imgClassName="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />

                          {item.isNew && (
                            <div className="absolute inset-x-0 top-0 bg-[#1a9fff] text-white text-[9.5px] font-bold tracking-[0.07em] uppercase py-[3px] text-center">
                              NEW
                            </div>
                          )}

                          <SectionSourceBadge
                            tab={item.tab}
                            hasTopRibbon={item.isNew}
                            className="absolute start-1.5"
                          />
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                          <h4 className="text-[12.5px] font-semibold text-[#e5e9f0] group-hover:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-[#8b9bb4] font-mono-tabular truncate">
                            {metaLine}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls when > 20 items */}
                {totalPages > 1 && (
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07]">
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
                        <span>{t.next}</span>
                        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </div>

                    {safePage < totalPages - 1 && (
                      <button
                        type="button"
                        onClick={() => goToPage(safePage + 1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>{t.next20Games}</span>
                        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
