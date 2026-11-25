import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowsClockwise,
  ClockCounterClockwise,
  Lightning,
  MagnifyingGlass,
  Sparkle,
  Wrench,
  X,
} from '@phosphor-icons/react';
import {
  buildMergedReleaseHistory,
  compareReleaseVersions,
  fetchPublicReleaseHistory,
  type ChangelogCategory,
  type ReleaseChangelogEntry,
} from '../data/releaseChangelog';
import type {
  DesktopReleaseHistoryEntry,
  SecretAreaUpdaterBridge,
} from '../services/desktopUpdater';
import {
  getAppVersionString,
  type AppLanguage,
  type AppThemeMode,
} from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface UpdateHistoryModalProps {
  isOpen: boolean;
  activeTheme?: AppThemeMode;
  language?: AppLanguage;
  currentVersion?: string | null;
  updaterBridge?: SecretAreaUpdaterBridge | null;
  onClose: () => void;
  onCheckForUpdates?: () => void;
}

type CategoryFilter = 'all' | ChangelogCategory;

export function UpdateHistoryModal({
  isOpen,
  activeTheme = 'default',
  language = 'en',
  currentVersion,
  updaterBridge = null,
  onClose,
  onCheckForUpdates,
}: UpdateHistoryModalProps) {
  const tr = getTranslations(language);
  const t = tr.updateHistory;
  const tu = tr.updater;

  const isPs5Theme = activeTheme === 'ps5';
  const isXboxTheme = activeTheme === 'xbox';
  const installedVersion = (currentVersion || getAppVersionString()).replace(/^v/i, '').trim();

  const [remoteReleases, setRemoteReleases] = useState<DesktopReleaseHistoryEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const loadHistory = useCallback(
    async (forceRefresh = false) => {
      setIsRefreshing(true);
      try {
        const entries = updaterBridge?.getReleaseHistory
          ? await updaterBridge.getReleaseHistory(forceRefresh)
          : await fetchPublicReleaseHistory();
        if (Array.isArray(entries)) {
          setRemoteReleases(entries);
        }
      } catch {
        // Keep merged local archive cleanly if GitHub is offline or rate-limited
      } finally {
        setIsRefreshing(false);
      }
    },
    [updaterBridge]
  );

  useEffect(() => {
    if (!isOpen) return;
    void loadHistory(false);
  }, [isOpen, loadHistory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allReleases = useMemo<ReleaseChangelogEntry[]>(
    () => buildMergedReleaseHistory({ language, remoteReleases }),
    [language, remoteReleases]
  );

  const latestVersion = allReleases[0]?.version || installedVersion;

  const filteredReleases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allReleases
      .map((release) => {
        const items = release.items.filter((item) => {
          if (categoryFilter !== 'all' && item.category !== categoryFilter) {
            return false;
          }
          if (!q) return true;
          const versionHit =
            release.version.toLowerCase().includes(q) ||
            `v${release.version}`.toLowerCase().includes(q) ||
            release.releaseTitle.toLowerCase().includes(q) ||
            release.summary.toLowerCase().includes(q);
          if (versionHit) return true;
          return (
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
          );
        });

        const releaseMatchesQuery =
          !q ||
          release.version.toLowerCase().includes(q) ||
          `v${release.version}`.toLowerCase().includes(q) ||
          release.releaseTitle.toLowerCase().includes(q) ||
          release.summary.toLowerCase().includes(q);

        if (categoryFilter === 'all' && releaseMatchesQuery && items.length === 0) {
          return release;
        }
        if (items.length === 0) return null;
        return { ...release, items };
      })
      .filter((entry): entry is ReleaseChangelogEntry => Boolean(entry));
  }, [allReleases, searchQuery, categoryFilter]);

  if (!isOpen) return null;

  const formatPublishDate = (iso?: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(tr.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categoryOptions: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'feature', label: t.filterFeature },
    { id: 'improvement', label: t.filterImprovement },
    { id: 'fix', label: t.filterFix },
  ];

  return (
    <div
      className="fixed inset-0 z-[99] bg-slate-900/55 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-3xl max-h-[88dvh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${
          isPs5Theme
            ? 'bg-[#031333]/96 border-white/[0.16] text-white'
            : isXboxTheme
            ? 'bg-[#081b0c]/96 border-[#52e042]/30 text-[#ecfdf0]'
            : 'bg-white border-slate-200 text-slate-900 dark:bg-[#141a23] dark:border-white/[0.1] dark:text-[#e5e9f0]'
        }`}
      >
        {/* Header */}
        <header
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            isPs5Theme || isXboxTheme
              ? 'border-white/[0.08]'
              : 'bg-slate-50/90 border-slate-200 dark:bg-[#11161e] dark:border-white/[0.07]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                isXboxTheme
                  ? 'bg-[#107C10]/20 border-[#52e042]/40 text-[#6ee755]'
                  : 'bg-sky-500/10 border-sky-500/25 text-[#0284c7] dark:bg-[#1a9fff]/15 dark:border-[#1a9fff]/30 dark:text-[#66c0f4]'
              }`}
            >
              <ClockCounterClockwise className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15.5px] font-bold tracking-tight truncate">
                {t.title}
              </h2>
              <p
                className={`text-[12px] truncate ${
                  isPs5Theme || isXboxTheme
                    ? 'text-[#9fb0c7]'
                    : 'text-slate-500 dark:text-[#8b9bb4]'
                }`}
              >
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void loadHistory(true)}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors cursor-pointer disabled:opacity-55 ${
                isPs5Theme || isXboxTheme
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.12] text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/[0.1] dark:text-[#dce4ee]'
              }`}
            >
              <ArrowsClockwise
                className={`w-3.5 h-3.5 ${isRefreshing ? 'motion-safe:animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? t.refreshingBtn : t.refreshBtn}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPs5Theme || isXboxTheme
                  ? 'text-[#9fb0c7] hover:text-white hover:bg-white/[0.08]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-[#8b9bb4] dark:hover:text-white dark:hover:bg-white/[0.08]'
              }`}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Search & Category Filter Toolbar */}
        <div
          className={`px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 ${
            isPs5Theme || isXboxTheme
              ? 'bg-black/20 border-white/[0.07]'
              : 'bg-slate-50/50 border-slate-200 dark:bg-[#0f141c] dark:border-white/[0.06]'
          }`}
        >
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlass className="w-4 h-4 text-slate-400 dark:text-[#7f91ab] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className={`w-full ps-9 pe-3 py-1.5 rounded-lg border text-[12.5px] focus:outline-none transition-colors ${
                isPs5Theme || isXboxTheme
                  ? 'bg-black/30 border-white/[0.1] text-white placeholder:text-[#7f91ab] focus:border-white/35'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] dark:bg-[#171e29] dark:border-white/[0.1] dark:text-white dark:placeholder:text-[#70829b] dark:focus:border-[#38bdf8]'
              }`}
            />
          </div>

          <div
            role="tablist"
            aria-label="Changelog category filter"
            className={`inline-flex items-center gap-1 p-1 rounded-lg border shrink-0 overflow-x-auto ${
              isPs5Theme || isXboxTheme
                ? 'bg-black/30 border-white/[0.09]'
                : 'bg-slate-100 border-slate-200 dark:bg-[#171e29] dark:border-white/[0.08]'
            }`}
          >
            {categoryOptions.map((cat) => {
              const isSelected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? isXboxTheme
                        ? 'bg-[#107C10] text-white'
                        : 'bg-[#0284c7] dark:bg-[#1a9fff] text-white shadow-sm'
                      : isPs5Theme || isXboxTheme
                      ? 'text-[#9fb0c7] hover:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#9cb0c9] dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Version Timeline Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {filteredReleases.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <ClockCounterClockwise className="w-8 h-8 mx-auto text-slate-400 dark:text-[#66778f]" />
              <p className="text-[13px] text-slate-500 dark:text-[#8b9bb4]">
                {t.emptyState}
              </p>
            </div>
          ) : (
            filteredReleases.map((release) => {
              const isInstalled = compareReleaseVersions(release.version, installedVersion) === 0;
              const isLatest = compareReleaseVersions(release.version, latestVersion) === 0;
              const dateText = formatPublishDate(release.publishedAt);

              return (
                <article
                  key={release.version}
                  className={`rounded-xl border p-4 sm:p-5 space-y-3.5 transition-colors ${
                    isPs5Theme
                      ? 'bg-[#061b44]/75 border-white/[0.12]'
                      : isXboxTheme
                      ? 'bg-[#0c2411]/80 border-[#52e042]/22'
                      : 'bg-slate-50/75 border-slate-200 dark:bg-[#18202c] dark:border-white/[0.08]'
                  }`}
                >
                  {/* Release Header & Typographic Metadata */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.07]">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span
                          dir="ltr"
                          className="text-[16px] font-bold font-mono-tabular tracking-tight text-slate-900 dark:text-white"
                        >
                          v{release.version}
                        </span>
                        {isInstalled && (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-[#4ade80]">
                            · {t.currentBadge}
                          </span>
                        )}
                        {isLatest && !isInstalled && (
                          <span className="text-[11px] font-semibold text-[#0284c7] dark:text-[#38bdf8]">
                            · {t.latestBadge}
                          </span>
                        )}
                        {dateText && (
                          <span
                            className={`text-[11.5px] font-mono-tabular ${
                              isPs5Theme || isXboxTheme
                                ? 'text-[#9fb0c7]'
                                : 'text-slate-500 dark:text-[#8b9bb4]'
                            }`}
                          >
                            · {dateText}
                          </span>
                        )}
                        <span
                          className={`text-[11.5px] ${
                            isPs5Theme || isXboxTheme
                              ? 'text-[#8ea2be]'
                              : 'text-slate-500 dark:text-[#7f91ab]'
                          }`}
                        >
                          · <span className="font-mono-tabular">{release.items.length}</span>{' '}
                          {t.changesSuffix}
                        </span>
                      </div>

                      <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white leading-snug">
                        {release.releaseTitle}
                      </h3>
                      {release.summary && (
                        <p
                          className={`text-[12.5px] leading-relaxed ${
                            isPs5Theme || isXboxTheme
                              ? 'text-[#b8c7dc]'
                              : 'text-slate-600 dark:text-[#9cb0c9]'
                          }`}
                        >
                          {release.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Categorized Changes List */}
                  <ul className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                    {release.items.map((item, idx) => {
                      const Icon =
                        item.category === 'fix'
                          ? Wrench
                          : item.category === 'improvement'
                          ? Lightning
                          : Sparkle;
                      const catLabel =
                        item.category === 'fix'
                          ? tu.categoryFix
                          : item.category === 'improvement'
                          ? tu.categoryImprovement
                          : tu.categoryFeature;
                      const catColor =
                        item.category === 'fix'
                          ? 'text-amber-700 dark:text-amber-300'
                          : item.category === 'improvement'
                          ? 'text-emerald-700 dark:text-[#4ade80]'
                          : isXboxTheme
                          ? 'text-[#6ee755]'
                          : 'text-[#0284c7] dark:text-[#38bdf8]';

                      return (
                        <li
                          key={`${release.version}-${item.title}-${idx}`}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5"
                        >
                          <Icon
                            weight="duotone"
                            className={`w-4 h-4 mt-0.5 shrink-0 ${catColor}`}
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span
                                className={`text-[10.5px] font-bold uppercase tracking-wider ${catColor}`}
                              >
                                {catLabel}
                              </span>
                              <span className="text-[13px] font-semibold text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                            </div>
                            {item.description && item.description !== item.title && (
                              <p
                                className={`text-[12px] leading-relaxed ${
                                  isPs5Theme || isXboxTheme
                                    ? 'text-[#b8c7dc]'
                                    : 'text-slate-600 dark:text-[#9cb0c9]'
                                }`}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer
          className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isPs5Theme || isXboxTheme
              ? 'border-white/[0.08] bg-black/25'
              : 'bg-slate-50 border-slate-200 dark:bg-[#11161e] dark:border-white/[0.07]'
          }`}
        >
          <span
            dir="ltr"
            className={`text-[12px] font-mono-tabular ${
              isPs5Theme || isXboxTheme
                ? 'text-[#9fb0c7]'
                : 'text-slate-500 dark:text-[#8b9bb4]'
            }`}
          >
            {tu.installedVersionLabel}: v{installedVersion}
          </span>

          <div className="flex items-center gap-2">
            {onCheckForUpdates && (
              <button
                type="button"
                onClick={onCheckForUpdates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors cursor-pointer"
              >
                <ArrowsClockwise className="w-3.5 h-3.5" />
                <span>{t.checkUpdatesBtn}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors cursor-pointer ${
                isPs5Theme || isXboxTheme
                  ? 'bg-white/[0.08] hover:bg-white/[0.15] border-white/[0.12] text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:border-white/[0.1] dark:text-[#dce4ee]'
              }`}
            >
              {t.closeBtn}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
