import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Star,
  Tag,
} from 'lucide-react';
import type { GameItem, LibrarySectionTab } from '../types';
import { LIBRARY_SECTIONS } from '../utils/parsers';
import { GameCover } from './GameCover';
import { getSectionVisualMeta } from './SectionBadge';
import type { AppLanguage } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface LibrarySidebarProps {
  activeSectionTab: LibrarySectionTab;
  onSelectSectionTab: (tab: LibrarySectionTab) => void;
  sectionCounts: Record<LibrarySectionTab, number>;
  games: GameItem[];
  selectedGameId: string | null;
  genreFilter: string;
  onGenreFilterChange: (value: string) => void;
  availableGenres: string[];
  favorites: Set<string>;
  language?: AppLanguage;
  onSelectGame: (game: GameItem) => void;
}

export function LibrarySidebar({
  activeSectionTab,
  onSelectSectionTab,
  sectionCounts,
  games,
  selectedGameId,
  genreFilter,
  onGenreFilterChange,
  availableGenres,
  favorites,
  language = 'en',
  onSelectGame,
}: LibrarySidebarProps) {
  const t = getTranslations(language).library;
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSectionMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSectionMenuOpen(false);
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sectionMenuOpen]);

  // Sidebar ALL list: New games ALWAYS first, no pagination
  const sidebarItems = useMemo(() => {
    return [...games].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }, [games]);

  const activeSection =
    LIBRARY_SECTIONS.find((s) => s.key === activeSectionTab) || LIBRARY_SECTIONS[0];
  const activeVisual = getSectionVisualMeta(activeSectionTab);
  const ActiveIcon = activeVisual.icon;

  return (
    <aside className="w-full lg:w-[272px] xl:w-[288px] shrink-0 bg-[#171d25] border-b lg:border-b-0 lg:border-e border-white/[0.06] flex flex-col lg:h-full select-none">
      {/* Section Dropdown (with Icons) + Genres Dropdown Only */}
      <div className="p-3 space-y-3 border-b border-white/[0.05]">
        {/* Section Switcher Dropdown with Icons */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8b9bb4]">
            <FolderKanban className="w-3 h-3 text-[#66c0f4]" />
            <span>{t.sectionLabel}</span>
          </span>

          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={sectionMenuOpen}
            aria-label={t.sectionLabel}
            onClick={() => setSectionMenuOpen((prev) => !prev)}
            className={`w-full px-2.5 py-2 rounded bg-[#232b36] hover:bg-[#2a3441] border transition-colors flex items-center justify-between gap-2 text-start cursor-pointer ${
              sectionMenuOpen ? 'border-[#1a9fff]' : 'border-white/[0.08]'
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <ActiveIcon className={`w-4 h-4 shrink-0 ${activeVisual.iconColorClass}`} />
              <span className="text-[12.5px] font-semibold text-[#e5e9f0] truncate">
                {activeSection.label}
              </span>
              <span className="text-[11.5px] text-[#8b9bb4] font-mono-tabular">
                ({sectionCounts[activeSectionTab] || 0})
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#8b9bb4] shrink-0 transition-transform duration-150 ${
                sectionMenuOpen ? 'rotate-180 text-[#66c0f4]' : ''
              }`}
            />
          </button>

          {sectionMenuOpen && (
            <div
              role="listbox"
              aria-label={t.sectionLabel}
              className="absolute inset-x-0 top-full mt-1 z-30 rounded bg-[#1b222c] border border-white/[0.12] shadow-2xl py-1 overflow-hidden"
            >
              {LIBRARY_SECTIONS.map((sec) => {
                const isSelected = sec.key === activeSectionTab;
                const visual = getSectionVisualMeta(sec.key);
                const SecIcon = visual.icon;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectSectionTab(sec.key);
                      setSectionMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between gap-2 text-start text-[12.5px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2a394b] text-white font-semibold'
                        : 'text-[#c6d4df] hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <SecIcon className={`w-4 h-4 shrink-0 ${visual.iconColorClass}`} />
                      <span className="truncate">{sec.label}</span>
                      <span className="text-[11px] text-[#8b9bb4] font-mono-tabular">
                        ({sectionCounts[sec.key] || 0})
                      </span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1a9fff] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Genres Dropdown Inside Active Section */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8b9bb4]">
              <Tag className="w-3 h-3 text-[#66c0f4]" />
              <span>{t.genresIn} {activeSection.label}</span>
            </span>
            {genreFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onGenreFilterChange('all')}
                className="text-[10.5px] text-[#66c0f4] hover:text-white cursor-pointer"
              >
                {t.reset}
              </button>
            )}
          </div>

          <select
            aria-label={t.allGenres}
            value={genreFilter}
            onChange={(e) => onGenreFilterChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-[#1f2733] border border-white/[0.08] text-[12px] text-[#dce4ee] focus:outline-none focus:border-[#1a9fff] cursor-pointer"
          >
            <option value="all">{t.allGenres} ({availableGenres.length})</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category List Header (interactive toggle on small screens, fixed header on desktop) */}
      <button
        type="button"
        onClick={() => setMobileListOpen((prev) => !prev)}
        className="lg:pointer-events-none w-full px-3 py-2 bg-[#202936]/80 border-b border-white/[0.05] flex items-center justify-between text-start cursor-pointer lg:cursor-default"
      >
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#c6d4df]">
          {t.allCountLabel}{' '}
          <span className="text-[#66c0f4] font-mono-tabular">({sidebarItems.length})</span>
        </span>
        <span className="lg:hidden inline-flex items-center gap-1 text-[11px] text-[#8b9bb4]">
          <span>{mobileListOpen ? t.hide : t.show}</span>
          {mobileListOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </span>
      </button>

      {/* Full Scrollable Sidebar List (New games first, no pagination) */}
      <div
        className={`${
          mobileListOpen ? 'block max-h-64' : 'hidden lg:block'
        } flex-1 overflow-y-auto py-1`}
      >
        {sidebarItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-[12px] text-[#677487]">
            {t.noMatchingTitles}
          </div>
        ) : (
          sidebarItems.map((game) => {
            const isSelected = selectedGameId === game.id;
            const isFav = favorites.has(game.id);
            return (
              <button
                key={`${game.tab}-${game.id}`}
                type="button"
                onClick={() => onSelectGame(game)}
                className={`w-full px-3 py-1.5 flex items-center gap-2.5 text-start transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2d3e52] text-white'
                    : 'text-[#aeb9c7] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="w-[18px] h-[24px] rounded-[2px] overflow-hidden shrink-0 bg-[#10151c]">
                  <GameCover src={game.coverImage} alt={game.name} compact />
                </div>
                <span className="flex-1 truncate text-[12.5px] leading-tight">
                  {game.name}
                </span>
                {game.isNew && (
                  <span className="px-1.5 py-[1px] rounded-[2px] bg-[#1a9fff] text-white text-[9px] font-bold tracking-wider uppercase shrink-0">
                    NEW
                  </span>
                )}
                {isFav && (
                  <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b] shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
