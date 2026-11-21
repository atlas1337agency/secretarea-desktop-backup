import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { DEFAULT_CATALOG } from './data/gamesCatalog';
import {
  fetchCatalogFromGas,
  getSavedGasUrl,
  loadCachedCatalog,
  loadFavorites,
  saveCachedCatalog,
  saveFavorites,
  saveGasUrl,
} from './services/sheetsApi';
import type {
  GameItem,
  LibrarySectionTab,
  PrimarySection,
  SheetCatalogData,
  SortOption,
} from './types';
import {
  ALL_SHEET_TABS,
  computeSmartSearchScore,
  toGameSlug,
} from './utils/parsers';
import { TopUtilityBar } from './components/TopUtilityBar';
import { Navbar } from './components/Navbar';
import { LibrarySidebar } from './components/LibrarySidebar';
import { LibraryView } from './components/LibraryView';
import { StoreView } from './components/StoreView';
import { ExtrasView } from './components/ExtrasView';
import { StudiosView } from './components/StudiosView';
import { StudioDetailModal } from './components/StudioDetailModal';
import { RequestsView } from './components/RequestsView';
import { GameDetailModal } from './components/GameDetailModal';
import { SyncModal } from './components/SyncModal';
import { DesktopAppModal } from './components/DesktopAppModal';
import {
  getConfiguredDesktopExeUrl,
  triggerExeDownload,
} from './services/desktopDownload';
import {
  playPsBackSound,
  playPsBootChime,
  playPsClickSound,
  playPsHoverSound,
  startPsAmbientSound,
  stopPsAmbientSound,
} from './utils/psSounds';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

function findItemBySlug(catalog: SheetCatalogData, slug: string): GameItem | null {
  const clean = slug.trim().toLowerCase();
  if (!clean) return null;

  const searchOrder = [
    'game' as const,
    ...ALL_SHEET_TABS.filter((t) => t !== 'game' && t !== 'profil' && t !== 'maintenance'),
  ];

  for (const tab of searchOrder) {
    const match = (catalog[tab] || []).find(
      (item) => toGameSlug(item.name) === clean || item.id.toLowerCase() === clean
    );
    if (match) return match;
  }
  return null;
}

function updateGameUrlParam(slug: string | null, replace = false) {
  const url = new URL(window.location.href);
  const current = url.searchParams.get('game');
  if (slug) {
    if (current === slug) return;
    url.searchParams.set('game', slug);
  } else {
    if (!current) return;
    url.searchParams.delete('game');
  }
  if (replace) {
    window.history.replaceState({}, '', url.toString());
  } else {
    window.history.pushState({}, '', url.toString());
  }
}

export default function App() {
  const [catalog, setCatalog] = useState<SheetCatalogData>(DEFAULT_CATALOG);
  const [gasUrl, setGasUrl] = useState<string>(() => getSavedGasUrl());
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [desktopDownloadStarted, setDesktopDownloadStarted] = useState(false);

  const [activeSection, setActiveSection] = useState<PrimarySection>('store');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(() => {
    const slug = new URLSearchParams(window.location.search).get('game');
    return slug ? findItemBySlug(DEFAULT_CATALOG, slug) : null;
  });
  const [selectedStudio, setSelectedStudio] = useState<GameItem | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'overview' | 'trailer' | 'downloads'>('overview');

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectivityBadge, setConnectivityBadge] = useState<
    'offline' | 'online-restored' | 'hidden'
  >(() => (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'hidden'));
  const onlineBadgeTimerRef = useRef<number | null>(null);
  const hasCompletedLiveSyncRef = useRef(false);

  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(loadFavorites()));
  const [libraryTab, setLibraryTab] = useState<LibrarySectionTab>('game');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('smart');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PS5 Theme activates directly with Fullscreen mode
  const isPs5Theme = isFullscreen;

  useEffect(() => {
    document.documentElement.classList.toggle('theme-ps5', isPs5Theme);
  }, [isPs5Theme]);

  // Ambient PS5 background music/soundscape while in Fullscreen PS5 mode
  useEffect(() => {
    if (isPs5Theme && soundEnabled) {
      startPsAmbientSound();
    } else {
      stopPsAmbientSound();
    }
    return () => {
      stopPsAmbientSound();
    };
  }, [isPs5Theme, soundEnabled]);

  // Global PlayStation hover & click sound effects while in Fullscreen PS5 mode
  useEffect(() => {
    if (!isPs5Theme || !soundEnabled) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, [role="button"], select');
      if (!interactive) return;

      const label = (
        interactive.getAttribute('aria-label') ||
        interactive.getAttribute('title') ||
        interactive.textContent ||
        ''
      ).toLowerCase();

      if (
        label.includes('close') ||
        label.includes('exit') ||
        label.includes('back') ||
        label.includes('cancel')
      ) {
        playPsBackSound();
      } else {
        playPsClickSound();
      }
    };

    const handleGlobalHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, [role="button"]');
      if (!interactive) return;
      const related = e.relatedTarget as Node | null;
      if (related && interactive.contains(related)) return;
      playPsHoverSound();
    };

    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('mouseover', handleGlobalHover, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('mouseover', handleGlobalHover, true);
    };
  }, [isPs5Theme, soundEnabled]);

  // Sync native Fullscreen changes (e.g., Escape key restores Default theme & stops background sound)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const nativeFull = Boolean(document.fullscreenElement);
      setIsFullscreen(nativeFull);
      if (!nativeFull) {
        stopPsAmbientSound();
        if (soundEnabled) playPsBackSound();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [soundEnabled]);

  const handleToggleFullscreen = useCallback(async () => {
    const currentlyFullscreen = isFullscreen || Boolean(document.fullscreenElement);

    if (!currentlyFullscreen) {
      setIsFullscreen(true);
      if (soundEnabled) {
        playPsBootChime();
        startPsAmbientSound();
      }

      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Fallback cleanly to full-viewport presentation if browser/iframe blocks native Fullscreen API
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }
      setIsFullscreen(false);
      stopPsAmbientSound();
      if (soundEnabled) playPsBackSound();
    }
  }, [isFullscreen, soundEnabled]);

  const notify = useCallback(
    (message: string, type: 'success' | 'info' | 'error' = 'info') => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3400);
    },
    []
  );

  const isBackgroundSyncingRef = useRef(false);

  const handleSyncUrl = useCallback(
    async (url: string, options: { silent?: boolean } = {}) => {
      const clean = url.trim();
      if (!clean || isBackgroundSyncingRef.current) return;

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        setConnectivityBadge('offline');
        if (!options.silent) {
          const offlineMsg = 'Offline Mode — using cached catalog.';
          setSyncError(offlineMsg);
          notify(offlineMsg, 'info');
        }
        return;
      }

      isBackgroundSyncingRef.current = true;
      if (!options.silent) {
        setIsSyncing(true);
        setSyncError(null);
      }
      try {
        const synced = await fetchCatalogFromGas(clean);
        hasCompletedLiveSyncRef.current = true;
        saveGasUrl(clean);
        setGasUrl(clean);
        const nextCatalog: SheetCatalogData = {
          ...synced,
          game: synced.game.length > 0 ? synced.game : DEFAULT_CATALOG.game,
        };
        setCatalog(nextCatalog);
        void saveCachedCatalog(nextCatalog);
        setLastSyncedAt(new Date().toISOString());
        setSyncError(null);
        if (!options.silent) {
          notify(`Synced ${synced.game.length} games from Google Sheet`, 'success');
        }
      } catch (err) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsOnline(false);
          setConnectivityBadge('offline');
        }
        const msg = err instanceof Error ? err.message : 'Unable to sync Google Sheet.';
        if (!options.silent) {
          setSyncError(msg);
          notify(msg, 'error');
        }
      } finally {
        isBackgroundSyncingRef.current = false;
        if (!options.silent) {
          setIsSyncing(false);
        }
      }
    },
    [notify]
  );

  // Hydrate catalog from IndexedDB immediately so offline sessions retain synced data
  useEffect(() => {
    let cancelled = false;
    void loadCachedCatalog().then((cached) => {
      if (!cancelled && cached && !hasCompletedLiveSyncRef.current) {
        setCatalog({
          ...cached,
          game: cached.game.length > 0 ? cached.game : DEFAULT_CATALOG.game,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Monitor WiFi / network state transitions
  useEffect(() => {
    const clearOnlineTimer = () => {
      if (onlineBadgeTimerRef.current !== null) {
        window.clearTimeout(onlineBadgeTimerRef.current);
        onlineBadgeTimerRef.current = null;
      }
    };

    const handleOffline = () => {
      clearOnlineTimer();
      setIsOnline(false);
      setConnectivityBadge('offline');
    };

    const handleOnline = () => {
      clearOnlineTimer();
      setIsOnline(true);
      setConnectivityBadge('online-restored');
      onlineBadgeTimerRef.current = window.setTimeout(() => {
        setConnectivityBadge('hidden');
        onlineBadgeTimerRef.current = null;
      }, 4000);
      if (gasUrl) {
        void handleSyncUrl(gasUrl, { silent: true });
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearOnlineTimer();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [gasUrl, handleSyncUrl]);

  // Sync automatically on mount and every 5 seconds in the background when online
  useEffect(() => {
    if (!gasUrl || !isOnline) return;
    handleSyncUrl(gasUrl, { silent: true });
    const intervalId = window.setInterval(() => {
      handleSyncUrl(gasUrl, { silent: true });
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [gasUrl, isOnline, handleSyncUrl]);

  // Keep selectedGame synchronized with live catalog updates and URL ?game=<slug>
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('game');
    setSelectedGame((prev) => {
      if (prev) {
        const sameEntry = catalog[prev.tab]?.find((x) => x.id === prev.id);
        if (sameEntry) {
          const isUnchanged =
            prev.name === sameEntry.name &&
            prev.version === sameEntry.version &&
            prev.description === sameEntry.description &&
            prev.mirrors.length === sameEntry.mirrors.length &&
            prev.parsedSteps.length === sameEntry.parsedSteps.length &&
            prev.parsedTools.length === sameEntry.parsedTools.length &&
            prev.rawFields.gameId === sameEntry.rawFields.gameId &&
            prev.rawFields.ratingPositive === sameEntry.rawFields.ratingPositive &&
            prev.rawFields.ratingNegative === sameEntry.rawFields.ratingNegative &&
            prev.rawFields.denuvo === sameEntry.rawFields.denuvo &&
            prev.rawFields.launcher === sameEntry.rawFields.launcher;
          return isUnchanged ? prev : sameEntry;
        }
      }
      if (slug) {
        return findItemBySlug(catalog, slug) || prev;
      }
      return prev;
    });
  }, [catalog]);

  useEffect(() => {
    const handlePopState = () => {
      const slug = new URLSearchParams(window.location.search).get('game');
      setSelectedGame(slug ? findItemBySlug(catalog, slug) : null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [catalog]);

  useEffect(() => {
    document.title = selectedGame
      ? `${selectedGame.name} — SecretArea`
      : 'SecretArea — Desktop Game Launcher & Catalog';
  }, [selectedGame]);

  const handleResetBuiltin = () => {
    saveGasUrl('');
    setGasUrl('');
    setCatalog(DEFAULT_CATALOG);
    setLastSyncedAt(null);
    setSyncError(null);
    setIsSyncModalOpen(false);
    notify('Restored built-in offline catalog', 'info');
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFavorites(Array.from(next));
      return next;
    });
  };

  const allGames = catalog.game;
  const activeSectionItems = catalog[libraryTab] || [];

  const sectionCounts = useMemo<Record<LibrarySectionTab, number>>(
    () => ({
      game: catalog.game?.length || 0,
      hypervisor: catalog.hypervisor?.length || 0,
      steamtools: catalog.steamtools?.length || 0,
      ps5: catalog.ps5?.length || 0,
      architect: catalog.architect?.length || 0,
      extra: catalog.extra?.length || 0,
    }),
    [catalog]
  );

  const availableGenres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of activeSectionItems) {
      const tags =
        item.genreList.length > 0
          ? item.genreList
          : item.category && item.category.toLowerCase() !== item.tab.toLowerCase()
          ? [item.category]
          : [];
      for (const genre of tags) {
        counts.set(genre, (counts.get(genre) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([genre]) => genre);
  }, [activeSectionItems]);

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim();

    const scoredMatches: { item: GameItem; score: number }[] = [];

    for (const item of activeSectionItems) {
      const score = q ? computeSmartSearchScore(item, q) : 1;
      if (score <= 0) continue;

      if (genreFilter !== 'all') {
        const target = genreFilter.toLowerCase();
        const matchesSelectedGenre =
          item.genreList.some((g) => g.toLowerCase() === target) ||
          item.category.toLowerCase() === target;
        if (!matchesSelectedGenre) continue;
      }

      scoredMatches.push({ item, score });
    }

    scoredMatches.sort((a, b) => {
      if (sortBy === 'smart') {
        if (q) {
          return (
            b.score - a.score ||
            Number(b.item.isNew) - Number(a.item.isNew) ||
            Number(b.item.isPinned) - Number(a.item.isPinned) ||
            b.item.dateTimestamp - a.item.dateTimestamp ||
            a.item.name.localeCompare(b.item.name)
          );
        }
        return (
          Number(b.item.isNew) - Number(a.item.isNew) ||
          (favorites.has(b.item.id) ? 1 : 0) - (favorites.has(a.item.id) ? 1 : 0) ||
          Number(b.item.isPinned) - Number(a.item.isPinned) ||
          b.item.dateTimestamp - a.item.dateTimestamp ||
          Number(b.item.id) - Number(a.item.id)
        );
      }
      if (sortBy === 'latest') {
        return (
          Number(b.item.isNew) - Number(a.item.isNew) ||
          b.item.dateTimestamp - a.item.dateTimestamp ||
          Number(b.item.id) - Number(a.item.id)
        );
      }
      if (sortBy === 'alphabetical') {
        return a.item.name.localeCompare(b.item.name);
      }
      if (sortBy === 'alphabetical-desc') {
        return b.item.name.localeCompare(a.item.name);
      }
      if (sortBy === 'favorites') {
        return (
          (favorites.has(b.item.id) ? 1 : 0) - (favorites.has(a.item.id) ? 1 : 0) ||
          Number(b.item.isNew) - Number(a.item.isNew) ||
          a.item.name.localeCompare(b.item.name)
        );
      }
      if (sortBy === 'size-asc') {
        return (a.item.repackSizeMB || 999999) - (b.item.repackSizeMB || 999999);
      }
      if (sortBy === 'size-desc') {
        return b.item.repackSizeMB - a.item.repackSizeMB;
      }
      if (sortBy === 'mirrors') {
        return (
          b.item.mirrors.length - a.item.mirrors.length ||
          Number(b.item.isNew) - Number(a.item.isNew)
        );
      }
      return 0;
    });

    return scoredMatches.map((entry) => entry.item);
  }, [
    activeSectionItems,
    searchQuery,
    genreFilter,
    sortBy,
    favorites,
  ]);

  const extrasCount = useMemo(
    () =>
      ALL_SHEET_TABS.filter((t) => t !== 'game').reduce(
        (acc, tab) => acc + (catalog[tab]?.length || 0),
        0
      ),
    [catalog]
  );

  const handleOpenGame = useCallback(
    (game: GameItem, mode: 'overview' | 'trailer' | 'downloads' = 'overview') => {
      if (game.tab === 'profil') {
        setSelectedStudio(game);
        return;
      }
      setModalViewMode(mode);
      setSelectedGame(game);
      updateGameUrlParam(toGameSlug(game.name) || game.id);
    },
    []
  );

  const handleCloseGame = useCallback(() => {
    setSelectedGame(null);
    updateGameUrlParam(null);
  }, []);

  const handleSelectLibraryTab = useCallback((tab: LibrarySectionTab) => {
    setLibraryTab(tab);
    setGenreFilter('all');
  }, []);

  const handleBrowseLatestInLibrary = () => {
    setLibraryTab('game');
    setGenreFilter('all');
    setSortBy('latest');
    setActiveSection('library');
  };

  const handleOpenStudiosPage = () => {
    setActiveSection('studios');
  };

  const handleOpenDesktopApp = useCallback(() => {
    const exeUrl = getConfiguredDesktopExeUrl();
    if (exeUrl) {
      triggerExeDownload(exeUrl);
      setDesktopDownloadStarted(true);
      notify('Starting SecretArea.exe download...', 'success');
    } else {
      setDesktopDownloadStarted(false);
    }
    setIsDesktopModalOpen(true);
  }, [notify]);

  return (
    <div
      className={`sa-app-shell h-screen w-screen overflow-hidden flex flex-col bg-[#141921] text-[#e5e9f0] ${
        isFullscreen ? 'fixed inset-0 z-[90]' : ''
      }`}
    >
      <TopUtilityBar
        isPs5Theme={isPs5Theme}
        soundEnabled={soundEnabled}
        isFullscreen={isFullscreen}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
      />

      <Navbar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenDesktopApp={handleOpenDesktopApp}
        isPs5Theme={isPs5Theme}
      />

      {catalog.maintenance.some(
        (m) => (m.rawFields.active || '').toLowerCase() === 'yes' || m.rawFields.active === 'true'
      ) && (
        <div className="bg-[#f59e0b]/15 border-b border-[#f59e0b]/30 px-4 py-2 text-[12.5px] text-[#fde68a] flex items-center justify-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{catalog.maintenance[0]?.description || catalog.maintenance[0]?.name}</span>
        </div>
      )}

      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {activeSection === 'library' && (
          <>
            <LibrarySidebar
              activeSectionTab={libraryTab}
              onSelectSectionTab={handleSelectLibraryTab}
              sectionCounts={sectionCounts}
              games={filteredGames}
              selectedGameId={selectedGame?.id || null}
              genreFilter={genreFilter}
              onGenreFilterChange={setGenreFilter}
              availableGenres={availableGenres}
              favorites={favorites}
              onSelectGame={(game) => handleOpenGame(game, 'overview')}
            />
            <LibraryView
              activeSectionTab={libraryTab}
              games={filteredGames}
              totalCount={activeSectionItems.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              genreFilter={genreFilter}
              onGenreFilterChange={setGenreFilter}
              onClearAllFilters={() => {
                setSearchQuery('');
                setGenreFilter('all');
              }}
              availableGenres={availableGenres}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectGame={(game) => handleOpenGame(game, 'overview')}
            />
          </>
        )}

        {activeSection === 'store' && (
          <StoreView
            catalog={catalog}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectGame={handleOpenGame}
            onBrowseLatestInLibrary={handleBrowseLatestInLibrary}
            onOpenStudiosPage={handleOpenStudiosPage}
          />
        )}

        {activeSection === 'studios' && (
          <StudiosView
            studios={catalog.profil}
            onSelectStudio={(studio) => handleOpenGame(studio, 'overview')}
            onBackHome={() => setActiveSection('store')}
          />
        )}

        {activeSection === 'extras' && (
          <ExtrasView
            catalog={catalog}
            hasLiveUrl={Boolean(gasUrl)}
            onSelectItem={(item) => handleOpenGame(item, 'overview')}
            onOpenSync={() => setIsSyncModalOpen(true)}
          />
        )}

        {activeSection === 'requests' && <RequestsView gasUrl={gasUrl} onNotify={notify} />}
      </main>

      <StudioDetailModal
        studio={selectedStudio}
        catalog={catalog}
        favorites={favorites}
        disableEscape={Boolean(selectedGame)}
        onToggleFavorite={handleToggleFavorite}
        onSelectItem={(item) => handleOpenGame(item, 'overview')}
        onClose={() => setSelectedStudio(null)}
      />

      <GameDetailModal
        game={selectedGame}
        catalog={catalog}
        initialViewMode={modalViewMode}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onJumpToItem={(item) => handleOpenGame(item, 'overview')}
        onClose={handleCloseGame}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUrl={gasUrl}
        lastSyncedAt={lastSyncedAt}
        totalGames={allGames.length}
        extrasCount={extrasCount}
        isSyncing={isSyncing}
        syncError={syncError}
        onSyncUrl={handleSyncUrl}
        onResetBuiltin={handleResetBuiltin}
      />

      <DesktopAppModal
        isOpen={isDesktopModalOpen}
        downloadStarted={desktopDownloadStarted}
        onClose={() => setIsDesktopModalOpen(false)}
        onNotify={notify}
      />

      {/* Persistent Offline Mode / Auto-hiding Online Mode Badge */}
      {connectivityBadge !== 'hidden' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 z-[85] pointer-events-none select-none"
        >
          {connectivityBadge === 'offline' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#7f1d1d]/95 border border-[#ef4444]/60 shadow-[0_10px_28px_rgba(0,0,0,0.55)] text-xs font-semibold text-[#fecaca] backdrop-blur-md">
              <WifiOff className="w-4 h-4 text-[#f87171] shrink-0" />
              <span>Offline Mode</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#064e3b]/95 border border-[#10b981]/60 shadow-[0_10px_28px_rgba(0,0,0,0.55)] text-xs font-semibold text-[#a7f3d0] backdrop-blur-md">
              <Wifi className="w-4 h-4 text-[#34d399] shrink-0" />
              <span>Online Mode</span>
            </div>
          )}
        </div>
      )}

      {/* Non-blocking Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-xs pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto px-3.5 py-2.5 rounded bg-[#1b222d] border border-white/[0.12] shadow-xl flex items-center gap-2.5 text-[12.5px] text-white"
            >
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
              )}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#66c0f4] shrink-0" />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
