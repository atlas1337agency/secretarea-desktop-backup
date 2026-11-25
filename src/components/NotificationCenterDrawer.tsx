import { useEffect, useMemo, useState } from 'react';
import {
  ArrowsClockwise,
  Bell,
  CalendarBlank,
  CaretRight,
  Check,
  ClockCounterClockwise,
  Fire,
  GameController,
  MagnifyingGlass,
  ShieldCheck,
  Sparkle,
  Wrench,
  X,
} from '@phosphor-icons/react';
import type { GameItem } from '../types';
import type { AppLanguage, AppThemeMode } from '../services/launcherSettings';
import {
  IMPORTANT_NOTIFICATION_TABS,
  NEWS_NOTIFICATION_TABS,
  type CatalogNotificationItem,
  type NotificationSourceTab,
} from '../services/notificationCenter';
import { getTranslations } from '../i18n/translations';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  activeTheme?: AppThemeMode;
  language?: AppLanguage;
  feed: CatalogNotificationItem[];
  readIds: Set<string>;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  onClose: () => void;
  onSyncNow: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenGame: (item: GameItem) => void;
  onOpenNewsSection: () => void;
  onOpenUpdateHistory: () => void;
}

type GroupFilter = 'all' | 'important' | 'news';
type TabFilter = 'all' | NotificationSourceTab;

export function NotificationCenterDrawer({
  isOpen,
  activeTheme = 'default',
  language = 'en',
  feed,
  readIds,
  lastSyncedAt,
  isSyncing,
  onClose,
  onSyncNow,
  onMarkRead,
  onMarkAllRead,
  onOpenGame,
  onOpenNewsSection,
  onOpenUpdateHistory,
}: NotificationCenterDrawerProps) {
  const tr = getTranslations(language);
  const t = tr.notificationCenter;

  const isPs5Theme = activeTheme === 'ps5';
  const isXboxTheme = activeTheme === 'xbox';

  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const counts = useMemo(() => {
    let totalUnread = 0;
    let importantTotal = 0;
    let importantUnread = 0;
    let newsTotal = 0;
    let newsUnread = 0;

    for (const item of feed) {
      const isUnread = !readIds.has(item.id);
      if (isUnread) totalUnread += 1;
      if (item.importance === 'important') {
        importantTotal += 1;
        if (isUnread) importantUnread += 1;
      } else {
        newsTotal += 1;
        if (isUnread) newsUnread += 1;
      }
    }

    return {
      total: feed.length,
      totalUnread,
      importantTotal,
      importantUnread,
      newsTotal,
      newsUnread,
    };
  }, [feed, readIds]);

  const availableTabs = useMemo<NotificationSourceTab[]>(() => {
    if (groupFilter === 'important') return [...IMPORTANT_NOTIFICATION_TABS];
    if (groupFilter === 'news') return [...NEWS_NOTIFICATION_TABS];
    return [...IMPORTANT_NOTIFICATION_TABS, ...NEWS_NOTIFICATION_TABS];
  }, [groupFilter]);

  useEffect(() => {
    if (tabFilter !== 'all' && !availableTabs.includes(tabFilter)) {
      setTabFilter('all');
    }
  }, [availableTabs, tabFilter]);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return feed.filter((item) => {
      if (groupFilter !== 'all' && item.importance !== groupFilter) return false;
      if (tabFilter !== 'all' && item.tab !== tabFilter) return false;
      if (!q) return true;
      const tabLabel = (t.tabLabels[item.tab] || item.tab).toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.versionLabel || '').toLowerCase().includes(q) ||
        tabLabel.includes(q)
      );
    });
  }, [feed, groupFilter, tabFilter, searchQuery, t.tabLabels]);

  if (!isOpen) return null;

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString(tr.locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : t.neverSynced;

  const getTabFallbackIcon = (tab: NotificationSourceTab) => {
    if (tab === 'upcoming' || tab === 'upcominglist') return CalendarBlank;
    if (tab === 'popularrepacks') return Fire;
    if (tab === 'hypervisor' || tab === 'steamtools') return ShieldCheck;
    if (tab === 'architect' || tab === 'extra') return Wrench;
    return GameController;
  };

  const getKindLabel = (item: CatalogNotificationItem): string => {
    if (item.isLiveDiff) {
      return item.kind === 'version_update' ? t.updatedBadge : t.liveBadge;
    }
    if (item.kind === 'new_addition') return t.newBadge;
    if (item.kind === 'version_update') return t.updatedBadge;
    if (item.kind === 'upcoming_announcement' || item.kind === 'upcoming_queue') {
      return t.upcomingBadge;
    }
    if (item.kind === 'popular_repack') return t.popularBadge;
    return '';
  };

  const handleSelectRow = (item: CatalogNotificationItem) => {
    onMarkRead(item.id);
    if (item.tab === 'upcoming' || item.tab === 'upcominglist' || !item.targetItem) {
      onOpenNewsSection();
      onClose();
      return;
    }
    onOpenGame(item.targetItem);
    onClose();
  };

  const groupTabs: { id: GroupFilter; label: string; unread: number; total: number }[] = [
    { id: 'all', label: t.filterAll, unread: counts.totalUnread, total: counts.total },
    {
      id: 'important',
      label: t.filterImportant,
      unread: counts.importantUnread,
      total: counts.importantTotal,
    },
    { id: 'news', label: t.filterNews, unread: counts.newsUnread, total: counts.newsTotal },
  ];

  return (
    <div
      className="fixed inset-0 z-[97] bg-slate-900/45 dark:bg-black/65 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className={`w-full max-w-[470px] h-dvh flex flex-col border-s shadow-2xl overflow-hidden ${
          isPs5Theme
            ? 'bg-[#031333]/96 border-white/[0.16] text-white'
            : isXboxTheme
            ? 'bg-[#081b0c]/96 border-[#52e042]/30 text-[#ecfdf0]'
            : 'bg-white border-slate-200 text-slate-900 dark:bg-[#141a23] dark:border-white/[0.1] dark:text-[#e5e9f0]'
        }`}
      >
        {/* Header */}
        <header
          className={`px-4 sm:px-5 py-4 border-b space-y-3 shrink-0 ${
            isPs5Theme || isXboxTheme
              ? 'border-white/[0.08]'
              : 'bg-slate-50/90 border-slate-200 dark:bg-[#11161e] dark:border-white/[0.07]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                  isXboxTheme
                    ? 'bg-[#107C10]/20 border-[#52e042]/40 text-[#6ee755]'
                    : 'bg-sky-500/10 border-sky-500/25 text-[#0284c7] dark:bg-[#1a9fff]/15 dark:border-[#1a9fff]/30 dark:text-[#66c0f4]'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-bold tracking-tight truncate">
                    {t.title}
                  </h2>
                  {counts.totalUnread > 0 && (
                    <span className="font-mono-tabular text-[11px] font-bold text-[#0284c7] dark:text-[#38bdf8]">
                      ({counts.totalUnread})
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11.5px] truncate ${
                    isPs5Theme || isXboxTheme
                      ? 'text-[#9fb0c7]'
                      : 'text-slate-500 dark:text-[#8b9bb4]'
                  }`}
                >
                  {t.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isPs5Theme || isXboxTheme
                  ? 'text-[#9fb0c7] hover:text-white hover:bg-white/[0.08]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-[#8b9bb4] dark:hover:text-white dark:hover:bg-white/[0.08]'
              }`}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Action Strip & Sync Timestamp */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`text-[11px] font-mono-tabular ${
                isPs5Theme || isXboxTheme
                  ? 'text-[#8ea2be]'
                  : 'text-slate-500 dark:text-[#7f91ab]'
              }`}
            >
              {t.lastSyncedPrefix} · {formattedSyncTime}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenUpdateHistory}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  isPs5Theme || isXboxTheme
                    ? 'bg-white/[0.06] hover:bg-white/[0.14] border-white/[0.12] text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.11] dark:border-white/[0.1] dark:text-[#c7d5e8]'
                }`}
              >
                <ClockCounterClockwise className="w-3.5 h-3.5" />
                <span>{t.updateHistoryBtn}</span>
              </button>

              {counts.totalUnread > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-white/[0.06] hover:bg-white/[0.14] border-white/[0.12] text-white'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.11] dark:border-white/[0.1] dark:text-[#c7d5e8]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.markAllReadBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-55 ${
                  isXboxTheme
                    ? 'bg-[#107C10] hover:bg-[#159315] text-white'
                    : 'bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white'
                }`}
              >
                <ArrowsClockwise
                  className={`w-3.5 h-3.5 ${isSyncing ? 'motion-safe:animate-spin' : ''}`}
                />
                <span>{isSyncing ? t.syncingBtn : t.syncNowBtn}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Primary Segmented Group Tabs (All / Important Tabs / Just News) + Sub-Tab Strip */}
        <div
          className={`px-4 sm:px-5 py-3 border-b space-y-2.5 shrink-0 ${
            isPs5Theme || isXboxTheme
              ? 'bg-black/20 border-white/[0.07]'
              : 'bg-slate-50/50 border-slate-200 dark:bg-[#0f141c] dark:border-white/[0.06]'
          }`}
        >
          <div
            role="tablist"
            aria-label="Notification category groups"
            className={`grid grid-cols-3 gap-1 p-1 rounded-lg border ${
              isPs5Theme || isXboxTheme
                ? 'bg-black/30 border-white/[0.09]'
                : 'bg-slate-100 border-slate-200 dark:bg-[#171e29] dark:border-white/[0.08]'
            }`}
          >
            {groupTabs.map((tab) => {
              const isSelected = groupFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setGroupFilter(tab.id)}
                  className={`px-2 py-1.5 rounded-md text-[11.5px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    isSelected
                      ? isXboxTheme
                        ? 'bg-[#107C10] text-white'
                        : 'bg-[#0284c7] dark:bg-[#1a9fff] text-white shadow-sm'
                      : isPs5Theme || isXboxTheme
                      ? 'text-[#9fb0c7] hover:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#9cb0c9] dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  <span className="font-mono-tabular text-[10.5px] opacity-85">
                    {tab.unread > 0 ? tab.unread : tab.total}
                  </span>
                </button>
              );
            })}
          </div>

          {groupFilter !== 'all' && (
            <p
              className={`text-[11px] leading-snug ${
                isPs5Theme || isXboxTheme
                  ? 'text-[#9fb0c7]'
                  : 'text-slate-500 dark:text-[#8b9bb4]'
              }`}
            >
              {groupFilter === 'important' ? t.importantHint : t.newsHint}
            </p>
          )}

          {/* Individual Google Sheet Tab Filter Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setTabFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                tabFilter === 'all'
                  ? isXboxTheme
                    ? 'bg-[#107C10]/25 border-[#52e042]/50 text-[#6ee755]'
                    : 'bg-sky-500/12 border-sky-500/35 text-[#0284c7] dark:bg-[#1a9fff]/18 dark:border-[#38bdf8]/40 dark:text-[#38bdf8]'
                  : isPs5Theme || isXboxTheme
                  ? 'bg-white/[0.04] border-white/[0.08] text-[#9fb0c7] hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/[0.03] dark:border-white/[0.07] dark:text-[#9cb0c9] dark:hover:text-white'
              }`}
            >
              {t.tabLabels.all}
            </button>
            {availableTabs.map((tabKey) => {
              const isSelected = tabFilter === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setTabFilter(tabKey)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
                    isSelected
                      ? isXboxTheme
                        ? 'bg-[#107C10]/25 border-[#52e042]/50 text-[#6ee755]'
                        : 'bg-sky-500/12 border-sky-500/35 text-[#0284c7] dark:bg-[#1a9fff]/18 dark:border-[#38bdf8]/40 dark:text-[#38bdf8]'
                      : isPs5Theme || isXboxTheme
                      ? 'bg-white/[0.04] border-white/[0.08] text-[#9fb0c7] hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/[0.03] dark:border-white/[0.07] dark:text-[#9cb0c9] dark:hover:text-white'
                  }`}
                >
                  {t.tabLabels[tabKey]}
                </button>
              );
            })}
          </div>

          {/* Search Filter */}
          <div className="relative">
            <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 dark:text-[#7f91ab] absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className={`w-full ps-8 pe-3 py-1.5 rounded-lg border text-[12px] focus:outline-none transition-colors ${
                isPs5Theme || isXboxTheme
                  ? 'bg-black/30 border-white/[0.1] text-white placeholder:text-[#7f91ab] focus:border-white/35'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] dark:bg-[#171e29] dark:border-white/[0.1] dark:text-white dark:placeholder:text-[#70829b] dark:focus:border-[#38bdf8]'
              }`}
            />
          </div>
        </div>

        {/* Feed Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200/80 dark:divide-white/[0.06]">
          {visibleItems.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-2">
              <Sparkle className="w-8 h-8 mx-auto text-slate-400 dark:text-[#66778f]" />
              <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white">
                {t.emptyTitle}
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-[#8b9bb4] leading-relaxed">
                {t.emptyDesc}
              </p>
            </div>
          ) : (
            visibleItems.map((item) => {
              const isUnread = !readIds.has(item.id);
              const FallbackIcon = getTabFallbackIcon(item.tab);
              const kindLabel = getKindLabel(item);
              const tabDisplay = t.tabLabels[item.tab] || item.tab;
              const subCatLabel =
                item.upcomingSubCategory &&
                item.upcomingSubCategory in t.tabLabels
                  ? t.tabLabels[item.upcomingSubCategory as NotificationSourceTab]
                  : item.upcomingSubCategory;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectRow(item)}
                  className={`w-full text-start px-4 sm:px-5 py-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                    isUnread
                      ? isPs5Theme
                        ? 'bg-white/[0.05] hover:bg-white/[0.09]'
                        : isXboxTheme
                        ? 'bg-[#107C10]/12 hover:bg-[#107C10]/20'
                        : 'bg-sky-50/55 hover:bg-sky-100/55 dark:bg-[#1a9fff]/[0.06] dark:hover:bg-[#1a9fff]/[0.11]'
                      : isPs5Theme || isXboxTheme
                      ? 'hover:bg-white/[0.04]'
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className={`w-11 h-14 rounded-md overflow-hidden border flex items-center justify-center shrink-0 ${
                      isPs5Theme || isXboxTheme
                        ? 'bg-black/35 border-white/[0.1]'
                        : 'bg-slate-100 border-slate-200 dark:bg-[#1a222f] dark:border-white/[0.08]'
                    }`}
                  >
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FallbackIcon
                        className={`w-5 h-5 ${
                          item.importance === 'news'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-[#0284c7] dark:text-[#66c0f4]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content & Unboxed Typographic Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 text-[11px] font-semibold">
                        {isUnread && (
                          <span
                            aria-hidden="true"
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isXboxTheme
                                ? 'bg-[#6ee755]'
                                : 'bg-[#0284c7] dark:bg-[#38bdf8]'
                            }`}
                          />
                        )}
                        <span
                          className={
                            item.importance === 'important'
                              ? isXboxTheme
                                ? 'text-[#6ee755]'
                                : 'text-[#0284c7] dark:text-[#38bdf8]'
                              : 'text-amber-700 dark:text-amber-300'
                          }
                        >
                          {tabDisplay}
                        </span>
                        {subCatLabel && (
                          <span className="text-slate-500 dark:text-[#8b9bb4] truncate">
                            · {subCatLabel}
                          </span>
                        )}
                        {kindLabel && (
                          <span
                            className={
                              item.isLiveDiff
                                ? 'text-emerald-700 dark:text-[#4ade80]'
                                : 'text-slate-500 dark:text-[#8b9bb4]'
                            }
                          >
                            · {kindLabel}
                          </span>
                        )}
                      </div>

                      {item.dateLabel && (
                        <span className="text-[10.5px] font-mono-tabular text-slate-400 dark:text-[#6f829c] shrink-0">
                          {item.dateLabel}
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-[13.5px] leading-snug line-clamp-1 ${
                        isUnread
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-700 dark:text-[#cbd5e1]'
                      }`}
                    >
                      {item.title}
                    </div>

                    {(item.versionLabel || item.subtitle) && (
                      <div
                        className={`text-[11.5px] truncate font-mono-tabular ${
                          isPs5Theme || isXboxTheme
                            ? 'text-[#9fb0c7]'
                            : 'text-slate-500 dark:text-[#8b9bb4]'
                        }`}
                      >
                        {[
                          item.versionLabel ? item.versionLabel : '',
                          item.subtitle && item.subtitle !== item.upcomingSubCategory
                            ? item.subtitle
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    )}
                  </div>

                  <CaretRight className="w-4 h-4 mt-1 shrink-0 text-slate-400 group-hover:text-slate-700 dark:text-[#66778f] dark:group-hover:text-white rtl:rotate-180 transition-colors" />
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
