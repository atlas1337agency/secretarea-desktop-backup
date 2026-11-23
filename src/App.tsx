import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle,
  Info,
  WarningCircle,
  WifiHigh,
  WifiSlash,
} from '@phosphor-icons/react';
import { DEFAULT_CATALOG } from './data/gamesCatalog';
import {
  fetchCatalogFromGas,
  getSavedGasUrl,
  loadCachedCatalog,
  loadFavorites,
  saveCachedCatalog,
  saveFavorites,
} from './services/sheetsApi';
import { precacheCatalogImages } from './services/imageCache';
import type {
  DownloadManagerSnapshot,
  GameItem,
  LibrarySectionTab,
  MirrorLink,
  PrimarySection,
  QbitSetupState,
  SheetCatalogData,
  SortOption,
  TorrentConnectionTestResult,
  TorrentDetectionResult,
  TorrentIntegrationConfig,
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
import { DownloadsView } from './components/DownloadsView';
import { SettingsView } from './components/SettingsView';
import { GameDetailModal } from './components/GameDetailModal';
import { DesktopUpdaterModal } from './components/DesktopUpdaterModal';
import { QbitSetupWizardModal } from './components/QbitSetupWizardModal';
import {
  FirstLaunchOnboarding,
  type OnboardingThemeChoice,
} from './components/FirstLaunchOnboarding';
import {
  getDesktopSettingsBridge,
  getDesktopUpdaterBridge,
  getDesktopWindowBridge,
  type DesktopUpdateState,
} from './services/desktopUpdater';
import {
  buildMirrorDownloadPayload,
  createWebFallbackTask,
  EMPTY_DOWNLOAD_SNAPSHOT,
  getDesktopDownloadsBridge,
  loadWebFallbackSnapshot,
  saveWebFallbackTasks,
  saveWebFallbackTorrentConfig,
  type StartDownloadPayload,
} from './services/downloadManager';
import {
  EMPTY_QBIT_SETUP_STATE,
  getDesktopQbitSetupBridge,
  QBIT_OFFICIAL_DOWNLOAD_URL,
} from './services/qbitSetup';
import {
  applyDocumentLanguageSettings,
  applyDocumentThemeSettings,
  DEFAULT_LAUNCHER_SETTINGS,
  getActiveConsoleTheme,
  isLocalOnboardingCompleted,
  loadLauncherSettings,
  saveLauncherSettings,
  setLocalOnboardingCompleted,
  type AppLanguage,
  type LauncherSettings,
} from './services/launcherSettings';
import { getTranslations } from './i18n/translations';
import {
  playPsBackSound,
  playPsBootChime,
  playPsClickSound,
  playPsHoverSound,
  setPsVolume,
  startPsAmbientSound,
  stopPsAmbientSound,
} from './utils/psSounds';
import {
  playXboxBackSound,
  playXboxBootChime,
  playXboxClickSound,
  playXboxHoverSound,
  setXboxVolume,
  startXboxAmbientSound,
  stopXboxAmbientSound,
} from './utils/xboxSounds';
import {
  detectAutoSystemSpecs,
  detectBrowserSystemSpecs,
  loadSavedCustomSystemSpecs,
  saveCustomSystemSpecs,
  type SystemHardwareSpecs,
} from './services/systemSpecs';
import { evaluateCanRunGame } from './services/canRunIt';

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
  const catalogRef = useRef<SheetCatalogData>(catalog);
  catalogRef.current = catalog;
  const [gasUrl] = useState<string>(() => getSavedGasUrl());
  const tabSignaturesRef = useRef<Partial<Record<keyof SheetCatalogData, string>>>({});

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
  const [canRunFilter, setCanRunFilter] = useState<'all' | 'can-run' | 'cannot-run'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('smart');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [systemSpecs, setSystemSpecs] = useState<SystemHardwareSpecs>(
    () => loadSavedCustomSystemSpecs() || detectBrowserSystemSpecs()
  );
  const [isRefreshingSpecs, setIsRefreshingSpecs] = useState(false);

  const [launcherSettings, setLauncherSettings] = useState<LauncherSettings>(() =>
    loadLauncherSettings()
  );
  const [isUpdatingAutoLaunch, setIsUpdatingAutoLaunch] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updaterBridge = useMemo(() => getDesktopUpdaterBridge(), []);
  const windowBridge = useMemo(() => getDesktopWindowBridge(), []);
  const settingsBridge = useMemo(() => getDesktopSettingsBridge(), []);
  const downloadsBridge = useMemo(() => getDesktopDownloadsBridge(), []);
  const qbitSetupBridge = useMemo(() => getDesktopQbitSetupBridge(), []);
  const [desktopUpdateState, setDesktopUpdateState] = useState<DesktopUpdateState | null>(null);
  const [isUpdaterModalOpen, setIsUpdaterModalOpen] = useState(false);
  const [downloadSnapshot, setDownloadSnapshot] = useState<DownloadManagerSnapshot>(() =>
    getDesktopDownloadsBridge() ? EMPTY_DOWNLOAD_SNAPSHOT : loadWebFallbackSnapshot()
  );
  const [qbitSetupState, setQbitSetupState] = useState<QbitSetupState>(EMPTY_QBIT_SETUP_STATE);
  const [isQbitSetupModalOpen, setIsQbitSetupModalOpen] = useState(false);
  const hasAutoPromptedQbitRef = useRef(false);
  const [onboardingPhase, setOnboardingPhase] = useState<'checking' | 'active' | 'completed'>(() => {
    if (isLocalOnboardingCompleted()) return 'completed';
    return getDesktopSettingsBridge() ? 'checking' : 'active';
  });
  const onboardingPhaseRef = useRef(onboardingPhase);
  onboardingPhaseRef.current = onboardingPhase;

  const t = useMemo(() => getTranslations(launcherSettings.language), [launcherSettings.language]);

  useEffect(() => {
    applyDocumentLanguageSettings(launcherSettings.language);
  }, [launcherSettings.language]);

  useEffect(() => {
    saveLauncherSettings(launcherSettings);
  }, [launcherSettings]);

  // Sync persisted Electron desktop settings & first-launch onboarding completion state on startup
  useEffect(() => {
    if (!settingsBridge) return;
    let active = true;
    void settingsBridge
      .getDesktopSettings()
      .then((desktopSettings) => {
        if (!active) return;
        if (!desktopSettings) {
          setOnboardingPhase((prev) => (prev === 'checking' ? 'active' : prev));
          return;
        }
        setLauncherSettings((prev) =>
          prev.startWithComputer === desktopSettings.startWithComputer
            ? prev
            : { ...prev, startWithComputer: desktopSettings.startWithComputer }
        );
        if (desktopSettings.onboardingCompleted) {
          setLocalOnboardingCompleted(true);
          setOnboardingPhase('completed');
        } else if (!isLocalOnboardingCompleted()) {
          setOnboardingPhase('active');
        }
      })
      .catch(() => {
        if (active) {
          setOnboardingPhase((prev) => (prev === 'checking' ? 'active' : prev));
        }
      });
    return () => {
      active = false;
    };
  }, [settingsBridge]);

  // Sync Electron Download Manager snapshot + live progress updates
  useEffect(() => {
    if (!downloadsBridge) return;
    let active = true;
    void downloadsBridge.getState().then((snapshot) => {
      if (active && snapshot) {
        setDownloadSnapshot(snapshot);
      }
    });
    const unsubscribe = downloadsBridge.onUpdated((snapshot) => {
      if (active && snapshot) {
        setDownloadSnapshot(snapshot);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [downloadsBridge]);

  // Sync automated qBittorrent installation & version management state + first-launch wizard
  useEffect(() => {
    if (!qbitSetupBridge) return;
    let active = true;
    const applySetupState = (next: QbitSetupState | null) => {
      if (!active || !next) return;
      setQbitSetupState(next);
      if (
        next.shouldPromptOnFirstLaunch &&
        !hasAutoPromptedQbitRef.current &&
        onboardingPhaseRef.current === 'completed'
      ) {
        hasAutoPromptedQbitRef.current = true;
        setIsQbitSetupModalOpen(true);
      }
    };
    void qbitSetupBridge.getState().then(applySetupState);
    const unsubscribe = qbitSetupBridge.onStateChange(applySetupState);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [qbitSetupBridge]);

  // Automatically detect real PC/laptop specs when SecretArea.exe starts (unless custom override saved)
  useEffect(() => {
    const savedCustom = loadSavedCustomSystemSpecs();
    if (savedCustom) return;
    let active = true;
    void detectAutoSystemSpecs(false).then((detected) => {
      if (active) setSystemSpecs(detected);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRefreshSystemSpecs = useCallback(async () => {
    setIsRefreshingSpecs(true);
    try {
      saveCustomSystemSpecs(null);
      const fresh = await detectAutoSystemSpecs(true);
      setSystemSpecs(fresh);
    } finally {
      setIsRefreshingSpecs(false);
    }
  }, []);

  const handleSaveCustomSystemSpecs = useCallback((next: SystemHardwareSpecs) => {
    saveCustomSystemSpecs(next);
    setSystemSpecs({ ...next, source: 'custom', ramIsApprox: false });
  }, []);

  const handleResetSystemSpecs = useCallback(async () => {
    saveCustomSystemSpecs(null);
    setIsRefreshingSpecs(true);
    try {
      const detected = await detectAutoSystemSpecs(true);
      setSystemSpecs(detected);
    } finally {
      setIsRefreshingSpecs(false);
    }
  }, []);

  useEffect(() => {
    if (!updaterBridge) return;
    let active = true;

    void updaterBridge.getState().then((initialState) => {
      if (active && initialState) {
        setDesktopUpdateState(initialState);
      }
    });

    const unsubscribe = updaterBridge.onStateChange((nextState) => {
      if (active) {
        setDesktopUpdateState(nextState);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [updaterBridge]);

  const handleCheckForUpdates = useCallback(() => {
    if (!updaterBridge) return;
    void updaterBridge.checkForUpdates().then((nextState) => {
      if (nextState) setDesktopUpdateState(nextState);
    });
  }, [updaterBridge]);

  const handleDownloadUpdate = useCallback(() => {
    if (!updaterBridge) return;
    void updaterBridge.downloadUpdate().then((nextState) => {
      if (nextState) setDesktopUpdateState(nextState);
    });
  }, [updaterBridge]);

  const handlePostponeUpdate = useCallback(() => {
    if (!updaterBridge) return;
    void updaterBridge.postponeUpdate().then((nextState) => {
      if (nextState) setDesktopUpdateState(nextState);
    });
  }, [updaterBridge]);

  const handleInstallAndRestart = useCallback(() => {
    if (!updaterBridge) return;
    void updaterBridge.installUpdate();
  }, [updaterBridge]);

  const updateBadgeStatus: 'none' | 'checking' | 'available' | 'downloading' | 'downloaded' =
    desktopUpdateState?.status === 'checking' ||
    desktopUpdateState?.status === 'available' ||
    desktopUpdateState?.status === 'downloading' ||
    desktopUpdateState?.status === 'downloaded'
      ? desktopUpdateState.status
      : 'none';

  // Theme activates strictly from Settings (PS5, Xbox, or Default) — never forced by Fullscreen
  const activeTheme = useMemo(
    () => getActiveConsoleTheme(launcherSettings),
    [launcherSettings]
  );

  useEffect(() => {
    applyDocumentThemeSettings(launcherSettings);
  }, [launcherSettings]);

  const hasSoundVolume = launcherSettings.soundVolume > 0;

  useEffect(() => {
    const normalized = launcherSettings.soundVolume / 100;
    setPsVolume(normalized);
    setXboxVolume(normalized);
  }, [launcherSettings.soundVolume]);

  // Ambient console background music/soundscape based on active Settings theme & ambient music toggle
  useEffect(() => {
    const canPlayAmbient =
      soundEnabled && launcherSettings.ambientMusicEnabled && hasSoundVolume;
    if (activeTheme === 'ps5' && canPlayAmbient) {
      stopXboxAmbientSound();
      startPsAmbientSound();
    } else if (activeTheme === 'xbox' && canPlayAmbient) {
      stopPsAmbientSound();
      startXboxAmbientSound();
    } else {
      stopPsAmbientSound();
      stopXboxAmbientSound();
    }
    return () => {
      stopPsAmbientSound();
      stopXboxAmbientSound();
    };
  }, [activeTheme, soundEnabled, launcherSettings.ambientMusicEnabled, hasSoundVolume]);

  // Global console hover & click sound effects when PS5 or Xbox theme is active and UI sounds are enabled
  useEffect(() => {
    if (
      activeTheme === 'default' ||
      !soundEnabled ||
      !launcherSettings.uiClickSoundsEnabled ||
      !hasSoundVolume
    ) {
      return;
    }

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

      const isBackAction =
        label.includes('close') ||
        label.includes('exit') ||
        label.includes('back') ||
        label.includes('cancel');

      if (activeTheme === 'xbox') {
        if (isBackAction) {
          playXboxBackSound();
        } else {
          playXboxClickSound();
        }
      } else {
        if (isBackAction) {
          playPsBackSound();
        } else {
          playPsClickSound();
        }
      }
    };

    const handleGlobalHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, [role="button"]');
      if (!interactive) return;
      const related = e.relatedTarget as Node | null;
      if (related && interactive.contains(related)) return;
      if (activeTheme === 'xbox') {
        playXboxHoverSound();
      } else {
        playPsHoverSound();
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('mouseover', handleGlobalHover, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('mouseover', handleGlobalHover, true);
    };
  }, [activeTheme, soundEnabled, launcherSettings.uiClickSoundsEnabled, hasSoundVolume]);

  // Sync native Fullscreen changes without altering the active launcher theme
  useEffect(() => {
    if (windowBridge) {
      let active = true;
      void windowBridge.isFullscreen().then((flag) => {
        if (active) setIsFullscreen(flag);
      });
      const unsubscribe = windowBridge.onFullscreenChange((flag) => {
        setIsFullscreen(flag);
      });
      return () => {
        active = false;
        unsubscribe();
      };
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [windowBridge]);

  const handleToggleFullscreen = useCallback(async () => {
    if (windowBridge) {
      const current = await windowBridge.isFullscreen();
      const target = !current;
      await windowBridge.setFullscreen(target);
      setIsFullscreen(target);
      return;
    }

    const currentlyFullscreen = isFullscreen || Boolean(document.fullscreenElement);

    if (!currentlyFullscreen) {
      setIsFullscreen(true);
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
    }
  }, [isFullscreen, windowBridge]);

  // Allow Escape key to exit fullscreen when no modal is open
  useEffect(() => {
    if (!isFullscreen || selectedGame || selectedStudio || isUpdaterModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        void handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedGame, selectedStudio, isUpdaterModalOpen, handleToggleFullscreen]);

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

  const handleChangeLanguage = useCallback((language: AppLanguage) => {
    setLauncherSettings((prev) => ({ ...prev, language }));
  }, []);

  const handleToggleStartWithComputer = useCallback(
    async (enabled: boolean) => {
      setLauncherSettings((prev) => ({ ...prev, startWithComputer: enabled }));
      if (!settingsBridge) return;
      setIsUpdatingAutoLaunch(true);
      try {
        const res = await settingsBridge.setStartWithComputer(enabled);
        if (res) {
          setLauncherSettings((prev) => ({
            ...prev,
            startWithComputer: res.startWithComputer,
          }));
        }
      } catch {
        setLauncherSettings((prev) => ({ ...prev, startWithComputer: !enabled }));
        notify('Could not update Windows startup tray setting.', 'error');
      } finally {
        setIsUpdatingAutoLaunch(false);
      }
    },
    [notify, settingsBridge]
  );

  const handleToggleEnableCanRunIt = useCallback((enabled: boolean) => {
    setLauncherSettings((prev) => ({ ...prev, enableCanRunIt: enabled }));
    if (!enabled) {
      setCanRunFilter('all');
    }
  }, []);

  const handleToggleCompactNavbar = useCallback((enabled: boolean) => {
    setLauncherSettings((prev) => ({ ...prev, compactNavbar: enabled }));
  }, []);

  const handleToggleLightMode = useCallback((enabled: boolean) => {
    setLauncherSettings((prev) => ({
      ...prev,
      lightMode: enabled,
      alwaysPs5Theme: enabled ? false : prev.alwaysPs5Theme,
      alwaysXboxTheme: enabled ? false : prev.alwaysXboxTheme,
    }));
    if (enabled) {
      stopPsAmbientSound();
      stopXboxAmbientSound();
    }
  }, []);

  const handleToggleAlwaysPs5Theme = useCallback(
    (enabled: boolean) => {
      setLauncherSettings((prev) => ({
        ...prev,
        alwaysPs5Theme: enabled,
        alwaysXboxTheme: enabled ? false : prev.alwaysXboxTheme,
        lightMode: enabled ? false : prev.lightMode,
      }));
      if (
        enabled &&
        soundEnabled &&
        launcherSettings.uiClickSoundsEnabled &&
        launcherSettings.soundVolume > 0
      ) {
        stopXboxAmbientSound();
        playPsBootChime();
      }
    },
    [soundEnabled, launcherSettings.uiClickSoundsEnabled, launcherSettings.soundVolume]
  );

  const handleToggleAlwaysXboxTheme = useCallback(
    (enabled: boolean) => {
      setLauncherSettings((prev) => ({
        ...prev,
        alwaysXboxTheme: enabled,
        alwaysPs5Theme: enabled ? false : prev.alwaysPs5Theme,
        lightMode: enabled ? false : prev.lightMode,
      }));
      if (
        enabled &&
        soundEnabled &&
        launcherSettings.uiClickSoundsEnabled &&
        launcherSettings.soundVolume > 0
      ) {
        stopPsAmbientSound();
        playXboxBootChime();
      }
    },
    [soundEnabled, launcherSettings.uiClickSoundsEnabled, launcherSettings.soundVolume]
  );

  const handleToggleAmbientMusic = useCallback((enabled: boolean) => {
    setLauncherSettings((prev) => ({ ...prev, ambientMusicEnabled: enabled }));
  }, []);

  const handleToggleUiClickSounds = useCallback((enabled: boolean) => {
    setLauncherSettings((prev) => ({ ...prev, uiClickSoundsEnabled: enabled }));
  }, []);

  const handleChangeSoundVolume = useCallback((volume: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(volume)));
    const normalized = clamped / 100;
    setPsVolume(normalized);
    setXboxVolume(normalized);
    if (clamped > 0) {
      setSoundEnabled(true);
    }
    setLauncherSettings((prev) => ({ ...prev, soundVolume: clamped }));
  }, []);

  const handlePreviewSoundVolume = useCallback(() => {
    if (launcherSettings.soundVolume <= 0) return;
    if (activeTheme === 'xbox') {
      playXboxClickSound();
    } else {
      playPsClickSound();
    }
  }, [activeTheme, launcherSettings.soundVolume]);

  const handleResetLauncherSettings = useCallback(async () => {
    const defaults = { ...DEFAULT_LAUNCHER_SETTINGS };
    setLauncherSettings(defaults);
    if (settingsBridge) {
      try {
        await settingsBridge.setStartWithComputer(false);
      } catch {
        // Ignore desktop reset error cleanly
      }
    }
    notify(getTranslations(defaults.language).settings.resetToast, 'info');
  }, [notify, settingsBridge]);

  const handleStartDownloadPayload = useCallback(
    async (payload: StartDownloadPayload) => {
      if (downloadsBridge) {
        try {
          const task = await downloadsBridge.start(payload);
          const refreshed = await downloadsBridge.getState();
          if (refreshed) setDownloadSnapshot(refreshed);
          notify(`${t.downloads.startedToast}: ${task.title}`, 'success');
        } catch (err) {
          const msg = err instanceof Error ? err.message : t.downloads.failedToast;
          notify(msg, 'error');
        }
        return;
      }

      const fallbackTask = createWebFallbackTask(payload);
      setDownloadSnapshot((prev) => {
        const nextTasks = [fallbackTask, ...prev.tasks].slice(0, 60);
        saveWebFallbackTasks(nextTasks);
        return { ...prev, tasks: nextTasks };
      });
    },
    [downloadsBridge, notify, t.downloads.failedToast, t.downloads.startedToast]
  );

  const handleAddTorrentFile = useCallback(async () => {
    if (!downloadsBridge) return;
    try {
      const task = await downloadsBridge.addTorrentFile();
      if (!task) return;
      const refreshed = await downloadsBridge.getState();
      if (refreshed) setDownloadSnapshot(refreshed);
      notify(`${t.downloads.startedToast}: ${task.title}`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.downloads.failedToast;
      notify(msg, 'error');
    }
  }, [downloadsBridge, notify, t.downloads.failedToast, t.downloads.startedToast]);

  const handleStartMirrorDownload = useCallback(
    (mirror: MirrorLink, game: GameItem) => {
      const payload = buildMirrorDownloadPayload(mirror, game);
      void handleStartDownloadPayload(payload);
    },
    [handleStartDownloadPayload]
  );

  const handlePauseDownload = useCallback(
    async (id: string) => {
      if (!downloadsBridge) return;
      const next = await downloadsBridge.pause(id);
      if (next) setDownloadSnapshot(next);
    },
    [downloadsBridge]
  );

  const handleResumeDownload = useCallback(
    async (id: string) => {
      if (!downloadsBridge) return;
      const next = await downloadsBridge.resume(id);
      if (next) setDownloadSnapshot(next);
    },
    [downloadsBridge]
  );

  const handleCancelDownload = useCallback(
    async (id: string) => {
      if (!downloadsBridge) return;
      const next = await downloadsBridge.cancel(id);
      if (next) setDownloadSnapshot(next);
    },
    [downloadsBridge]
  );

  const handleRetryDownload = useCallback(
    async (id: string) => {
      if (!downloadsBridge) return;
      const next = await downloadsBridge.retry(id);
      if (next) setDownloadSnapshot(next);
    },
    [downloadsBridge]
  );

  const handleRemoveDownload = useCallback(
    async (id: string, deleteFiles = false) => {
      if (downloadsBridge) {
        const next = await downloadsBridge.remove(id, deleteFiles);
        if (next) setDownloadSnapshot(next);
        return;
      }
      setDownloadSnapshot((prev) => {
        const nextTasks = prev.tasks.filter((item) => item.id !== id);
        saveWebFallbackTasks(nextTasks);
        return { ...prev, tasks: nextTasks };
      });
    },
    [downloadsBridge]
  );

  const handleClearCompletedDownloads = useCallback(async () => {
    if (downloadsBridge) {
      const next = await downloadsBridge.clearCompleted();
      if (next) setDownloadSnapshot(next);
      return;
    }
    setDownloadSnapshot((prev) => {
      saveWebFallbackTasks([]);
      return { ...prev, tasks: [] };
    });
  }, [downloadsBridge]);

  const handleChooseDownloadFolder = useCallback(async () => {
    if (!downloadsBridge) return;
    const next = await downloadsBridge.chooseFolder();
    if (next) setDownloadSnapshot(next);
  }, [downloadsBridge]);

  const handleOpenDownloadFolder = useCallback(
    async (id?: string) => {
      if (!downloadsBridge) return;
      await downloadsBridge.openFolder(id);
    },
    [downloadsBridge]
  );

  const handleOpenDownloadedFile = useCallback(
    async (id: string) => {
      if (!downloadsBridge) return;
      await downloadsBridge.openFile(id);
    },
    [downloadsBridge]
  );

  const handleOpenExternalUrl = useCallback(
    async (url: string) => {
      if (downloadsBridge) {
        await downloadsBridge.openExternal(url);
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    },
    [downloadsBridge]
  );

  const handleDetectTorrentClient =
    useCallback(async (): Promise<TorrentDetectionResult | null> => {
      if (!downloadsBridge) return null;
      return downloadsBridge.detectTorrentClient();
    }, [downloadsBridge]);

  const handleSaveTorrentConfig = useCallback(
    async (cfg: Partial<TorrentIntegrationConfig>) => {
      if (downloadsBridge) {
        const next = await downloadsBridge.saveTorrentConfig(cfg);
        if (next) setDownloadSnapshot(next);
        notify(t.settings.torrentSavedToast, 'success');
        return;
      }
      saveWebFallbackTorrentConfig(cfg);
      setDownloadSnapshot((prev) => ({
        ...prev,
        torrentConfig: { ...prev.torrentConfig, ...cfg, password: '', apiKey: '' },
      }));
      notify(t.settings.torrentSavedToast, 'success');
    },
    [downloadsBridge, notify, t.settings.torrentSavedToast]
  );

  const handleTestTorrentConnection = useCallback(
    async (
      cfg?: Partial<TorrentIntegrationConfig>
    ): Promise<TorrentConnectionTestResult | null> => {
      if (!downloadsBridge) return null;
      const result = await downloadsBridge.testTorrentConnection(cfg);
      const refreshed = await downloadsBridge.getState().catch(() => null);
      if (refreshed) setDownloadSnapshot(refreshed);
      return result;
    },
    [downloadsBridge]
  );

  const handleOpenTorrentSettings = useCallback(() => {
    setActiveSection('settings');
    window.setTimeout(() => {
      document.getElementById('torrent-integration-settings')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }, []);

  const handleOpenQbitSetupWizard = useCallback(() => {
    setIsQbitSetupModalOpen(true);
    if (qbitSetupBridge) {
      void qbitSetupBridge.checkStatus().then((next) => {
        if (next) setQbitSetupState(next);
      });
    }
  }, [qbitSetupBridge]);

  const handleRecheckQbitSetup = useCallback(async () => {
    if (!qbitSetupBridge) return;
    const next = await qbitSetupBridge.checkStatus();
    if (next) setQbitSetupState(next);
  }, [qbitSetupBridge]);

  const handleStartQbitInstall = useCallback(
    async (userConfirmed: boolean) => {
      if (!qbitSetupBridge) return;
      const next = await qbitSetupBridge.startInstall(userConfirmed);
      if (next) setQbitSetupState(next);
    },
    [qbitSetupBridge]
  );

  const handleLaunchQbitClient = useCallback(async () => {
    if (!qbitSetupBridge) return;
    const res = await qbitSetupBridge.launchClient();
    if (!res?.ok && res?.error) {
      notify(res.error, 'error');
    }
  }, [qbitSetupBridge, notify]);

  const handleDismissQbitSetup = useCallback(() => {
    if (!qbitSetupBridge) return;
    void qbitSetupBridge.dismiss().then((next) => {
      if (next) setQbitSetupState(next);
    });
  }, [qbitSetupBridge]);

  const handleGenerateQbitPassword = useCallback(async (): Promise<string> => {
    if (qbitSetupBridge) {
      return qbitSetupBridge.generatePassword();
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, (b) => chars[b % chars.length]).join('');
  }, [qbitSetupBridge]);

  const handleSaveAndVerifyQbitWebUi = useCallback(
    async (cfg: Partial<TorrentIntegrationConfig>): Promise<TorrentConnectionTestResult | null> => {
      await handleSaveTorrentConfig(cfg);
      const res = await handleTestTorrentConnection(cfg);
      if (qbitSetupBridge) {
        const refreshed = await qbitSetupBridge.refreshLocal().catch(() => null);
        if (refreshed) setQbitSetupState(refreshed);
      }
      return res;
    },
    [handleSaveTorrentConfig, handleTestTorrentConnection, qbitSetupBridge]
  );

  const handleOpenOfficialQbitDownload = useCallback(() => {
    if (qbitSetupBridge) {
      void qbitSetupBridge.openOfficialDownload();
      return;
    }
    void handleOpenExternalUrl(QBIT_OFFICIAL_DOWNLOAD_URL);
  }, [qbitSetupBridge, handleOpenExternalUrl]);

  const handleSelectOnboardingTheme = useCallback(
    (choice: OnboardingThemeChoice) => {
      if (choice === 'light') {
        handleToggleLightMode(true);
      } else if (choice === 'ps5') {
        handleToggleAlwaysPs5Theme(true);
      } else if (choice === 'xbox') {
        handleToggleAlwaysXboxTheme(true);
      } else {
        setLauncherSettings((prev) => ({
          ...prev,
          lightMode: false,
          alwaysPs5Theme: false,
          alwaysXboxTheme: false,
        }));
        stopPsAmbientSound();
        stopXboxAmbientSound();
      }
    },
    [handleToggleLightMode, handleToggleAlwaysPs5Theme, handleToggleAlwaysXboxTheme]
  );

  const handleCompleteOnboarding = useCallback(
    (destination: 'store' | 'settings') => {
      setLocalOnboardingCompleted(true);
      hasAutoPromptedQbitRef.current = true;
      setOnboardingPhase('completed');
      setActiveSection(destination);
      if (settingsBridge?.completeOnboarding) {
        void settingsBridge.completeOnboarding(true);
      }
      if (qbitSetupBridge) {
        void qbitSetupBridge.dismiss().then((next) => {
          if (next) setQbitSetupState(next);
        });
      }
    },
    [settingsBridge, qbitSetupBridge]
  );

  const handleReplayOnboarding = useCallback(() => {
    setOnboardingPhase('active');
  }, []);

  const isBackgroundRefreshingRef = useRef(false);
  const lastRefreshAttemptAtRef = useRef(0);

  const applyCatalogDiffSilently = useCallback((incoming: SheetCatalogData): boolean => {
    const prev = catalogRef.current;
    let anyChanged = false;
    const merged: SheetCatalogData = { ...prev };

    for (const tab of ALL_SHEET_TABS) {
      const nextItems =
        tab === 'game' && (!incoming.game || incoming.game.length === 0)
          ? prev.game.length > 0
            ? prev.game
            : DEFAULT_CATALOG.game
          : incoming[tab] || [];

      const prevSig =
        tabSignaturesRef.current[tab] ??
        (tabSignaturesRef.current[tab] = JSON.stringify(prev[tab] || []));
      const nextSig = JSON.stringify(nextItems);

      if (nextSig !== prevSig) {
        tabSignaturesRef.current[tab] = nextSig;
        merged[tab] = nextItems;
        anyChanged = true;
      } else {
        merged[tab] = prev[tab];
      }
    }

    if (anyChanged) {
      setCatalog(merged);
      window.setTimeout(() => {
        void saveCachedCatalog(merged);
      }, 0);
    }

    return anyChanged;
  }, []);

  const refreshCatalogSilently = useCallback(
    async (url: string, force = false) => {
      const clean = url.trim();
      if (!clean || isBackgroundRefreshingRef.current) return;

      const now = Date.now();
      if (!force && now - lastRefreshAttemptAtRef.current < 60000) {
        return;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
        setConnectivityBadge('offline');
        return;
      }

      lastRefreshAttemptAtRef.current = now;
      isBackgroundRefreshingRef.current = true;
      try {
        const latest = await fetchCatalogFromGas(clean);
        hasCompletedLiveSyncRef.current = true;
        const changed = applyCatalogDiffSilently(latest);
        if (changed) {
          void precacheCatalogImages(latest);
        }
      } catch {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setIsOnline(false);
          setConnectivityBadge('offline');
        }
      } finally {
        isBackgroundRefreshingRef.current = false;
      }
    },
    [applyCatalogDiffSilently]
  );

  // Hydrate catalog from IndexedDB immediately so offline sessions retain data & warm cover cache
  useEffect(() => {
    let cancelled = false;
    void loadCachedCatalog().then((cached) => {
      if (cancelled) return;
      if (cached && !hasCompletedLiveSyncRef.current) {
        applyCatalogDiffSilently(cached);
        void precacheCatalogImages(cached);
      } else {
        void precacheCatalogImages(DEFAULT_CATALOG);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [applyCatalogDiffSilently]);

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
        void refreshCatalogSilently(gasUrl);
      } else {
        void precacheCatalogImages(catalogRef.current);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearOnlineTimer();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [gasUrl, refreshCatalogSilently]);

  // Quietly check for catalog updates in the background (without blocking startup or focus switching)
  useEffect(() => {
    if (!gasUrl || !isOnline) return;
    const initialTimer = window.setTimeout(() => {
      void refreshCatalogSilently(gasUrl, true);
    }, 1200);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshCatalogSilently(gasUrl);
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshCatalogSilently(gasUrl);
      }
    }, 180000);
    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.clearInterval(intervalId);
    };
  }, [gasUrl, isOnline, refreshCatalogSilently]);

  // Keep selectedGame and selectedStudio synchronized with live catalog updates without abruptly closing them
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
        return prev;
      }
      if (slug) {
        return findItemBySlug(catalog, slug) || prev;
      }
      return prev;
    });

    setSelectedStudio((prev) => {
      if (!prev) return null;
      const sameStudio = catalog.profil?.find((x) => x.id === prev.id);
      if (sameStudio) {
        return prev.name === sameStudio.name && prev.description === sameStudio.description
          ? prev
          : sameStudio;
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

      if (launcherSettings.enableCanRunIt && canRunFilter !== 'all') {
        const evalRes = evaluateCanRunGame(item, systemSpecs);
        if (canRunFilter === 'can-run' && evalRes.status !== 'can-run') continue;
        if (canRunFilter === 'cannot-run' && evalRes.status !== 'cannot-run') continue;
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
    canRunFilter,
    launcherSettings.enableCanRunIt,
    systemSpecs,
    sortBy,
    favorites,
  ]);

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
    setCanRunFilter('all');
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

  const effectiveSoundEnabled =
    soundEnabled &&
    launcherSettings.soundVolume > 0 &&
    (launcherSettings.ambientMusicEnabled || launcherSettings.uiClickSoundsEnabled);

  const activeDownloadsCount = useMemo(
    () =>
      downloadSnapshot.tasks.filter(
        (task) =>
          task.status === 'downloading' ||
          task.status === 'resolving' ||
          task.status === 'queued'
      ).length,
    [downloadSnapshot.tasks]
  );

  if (onboardingPhase === 'checking') {
    return (
      <div className="sa-app-shell h-dvh w-full flex items-center justify-center bg-[#f4f6f9] dark:bg-[#0e141b]">
        <div className="w-9 h-9 rounded-full border-2 border-[#0284c7] dark:border-[#38bdf8] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (onboardingPhase === 'active') {
    return (
      <FirstLaunchOnboarding
        isDesktopApp={Boolean(settingsBridge || qbitSetupBridge || downloadsBridge)}
        desktopVersion={desktopUpdateState?.currentVersion || null}
        settings={launcherSettings}
        activeTheme={activeTheme}
        setupState={qbitSetupState}
        torrentConfig={downloadSnapshot.torrentConfig}
        torrentConnected={downloadSnapshot.torrentConnected}
        onSelectTheme={handleSelectOnboardingTheme}
        onChangeLanguage={handleChangeLanguage}
        onRecheckQbit={handleRecheckQbitSetup}
        onStartQbitInstall={handleStartQbitInstall}
        onLaunchQbitClient={handleLaunchQbitClient}
        onOpenOfficialQbitDownload={handleOpenOfficialQbitDownload}
        onGenerateQbitPassword={handleGenerateQbitPassword}
        onSaveAndVerifyWebUi={handleSaveAndVerifyQbitWebUi}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  return (
    <div className="sa-app-shell h-dvh w-full overflow-hidden flex flex-col bg-[#f4f6f9] text-slate-900 dark:bg-[#141921] dark:text-[#e5e9f0]">
      <TopUtilityBar
        activeTheme={activeTheme}
        soundEnabled={effectiveSoundEnabled}
        isFullscreen={isFullscreen}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
        desktopVersion={desktopUpdateState?.currentVersion || null}
        updateBadgeStatus={updateBadgeStatus}
        onOpenUpdates={
          updaterBridge ? () => setIsUpdaterModalOpen(true) : undefined
        }
        language={launcherSettings.language}
      />

      <Navbar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        activeTheme={activeTheme}
        compactNavbar={launcherSettings.compactNavbar}
        language={launcherSettings.language}
        activeDownloadsCount={activeDownloadsCount}
      />

      {catalog.maintenance.some(
        (m) => (m.rawFields.active || '').toLowerCase() === 'yes' || m.rawFields.active === 'true'
      ) && (
        <div className="bg-amber-500/15 border-b border-amber-500/35 px-4 py-2 text-[12.5px] text-amber-900 dark:text-[#fde68a] flex items-center justify-center gap-2 shrink-0">
          <WarningCircle className="w-4 h-4 shrink-0" />
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
              language={launcherSettings.language}
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
              canRunFilter={canRunFilter}
              onCanRunFilterChange={
                launcherSettings.enableCanRunIt ? setCanRunFilter : undefined
              }
              canRunItEnabled={launcherSettings.enableCanRunIt}
              onClearAllFilters={() => {
                setSearchQuery('');
                setGenreFilter('all');
                setCanRunFilter('all');
              }}
              availableGenres={availableGenres}
              favorites={favorites}
              systemSpecs={systemSpecs}
              language={launcherSettings.language}
              onToggleFavorite={handleToggleFavorite}
              onSelectGame={(game) => handleOpenGame(game, 'overview')}
            />
          </>
        )}

        {activeSection === 'store' && (
          <StoreView
            catalog={catalog}
            favorites={favorites}
            systemSpecs={systemSpecs}
            canRunItEnabled={launcherSettings.enableCanRunIt}
            isRefreshingSpecs={isRefreshingSpecs}
            language={launcherSettings.language}
            onRefreshSpecs={handleRefreshSystemSpecs}
            onToggleFavorite={handleToggleFavorite}
            onSelectGame={handleOpenGame}
            onBrowseLatestInLibrary={handleBrowseLatestInLibrary}
            onOpenStudiosPage={handleOpenStudiosPage}
          />
        )}

        {activeSection === 'studios' && (
          <StudiosView
            studios={catalog.profil}
            language={launcherSettings.language}
            onSelectStudio={(studio) => handleOpenGame(studio, 'overview')}
            onBackHome={() => setActiveSection('store')}
          />
        )}

        {activeSection === 'extras' && (
          <ExtrasView
            catalog={catalog}
            hasLiveUrl={Boolean(gasUrl)}
            language={launcherSettings.language}
            onSelectItem={(item) => handleOpenGame(item, 'overview')}
          />
        )}

        {activeSection === 'requests' && (
          <RequestsView
            gasUrl={gasUrl}
            language={launcherSettings.language}
            activeTheme={activeTheme}
            lightMode={launcherSettings.lightMode}
            onNotify={notify}
          />
        )}

        {activeSection === 'downloads' && (
          <DownloadsView
            snapshot={downloadSnapshot}
            isDesktopApp={Boolean(downloadsBridge)}
            freeSpaceGB={systemSpecs.freeSpaceGB ?? null}
            language={launcherSettings.language}
            onStartDownload={handleStartDownloadPayload}
            onAddTorrentFile={handleAddTorrentFile}
            onPauseDownload={handlePauseDownload}
            onResumeDownload={handleResumeDownload}
            onCancelDownload={handleCancelDownload}
            onRetryDownload={handleRetryDownload}
            onRemoveDownload={handleRemoveDownload}
            onClearCompleted={handleClearCompletedDownloads}
            onChooseFolder={handleChooseDownloadFolder}
            onOpenFolder={handleOpenDownloadFolder}
            onOpenFile={handleOpenDownloadedFile}
            onOpenExternal={handleOpenExternalUrl}
            onOpenTorrentSettings={handleOpenTorrentSettings}
            onOpenQbitSetupWizard={handleOpenQbitSetupWizard}
          />
        )}

        {activeSection === 'settings' && (
          <SettingsView
            settings={launcherSettings}
            isDesktopApp={Boolean(settingsBridge || downloadsBridge)}
            isUpdatingAutoLaunch={isUpdatingAutoLaunch}
            downloadFolder={downloadSnapshot.downloadFolder}
            torrentConfig={downloadSnapshot.torrentConfig}
            torrentConnected={downloadSnapshot.torrentConnected}
            torrentVersion={downloadSnapshot.torrentVersion}
            torrentWebApiVersion={downloadSnapshot.torrentWebApiVersion}
            torrentError={downloadSnapshot.torrentError}
            onChangeLanguage={handleChangeLanguage}
            onToggleStartWithComputer={handleToggleStartWithComputer}
            onToggleEnableCanRunIt={handleToggleEnableCanRunIt}
            onToggleCompactNavbar={handleToggleCompactNavbar}
            onToggleLightMode={handleToggleLightMode}
            onToggleAlwaysPs5Theme={handleToggleAlwaysPs5Theme}
            onToggleAlwaysXboxTheme={handleToggleAlwaysXboxTheme}
            onToggleAmbientMusic={handleToggleAmbientMusic}
            onToggleUiClickSounds={handleToggleUiClickSounds}
            onChangeSoundVolume={handleChangeSoundVolume}
            onPreviewSoundVolume={handlePreviewSoundVolume}
            onResetDefaults={handleResetLauncherSettings}
            onChooseDownloadFolder={handleChooseDownloadFolder}
            onOpenDownloadFolder={() => handleOpenDownloadFolder()}
            onOpenExternal={handleOpenExternalUrl}
            onDetectTorrentClient={handleDetectTorrentClient}
            onSaveTorrentConfig={handleSaveTorrentConfig}
            onTestTorrentConnection={handleTestTorrentConnection}
            qbitSetupState={qbitSetupState}
            onOpenQbitSetupWizard={handleOpenQbitSetupWizard}
            onReplayOnboarding={handleReplayOnboarding}
          />
        )}
      </main>

      <StudioDetailModal
        studio={selectedStudio}
        catalog={catalog}
        favorites={favorites}
        language={launcherSettings.language}
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
        systemSpecs={systemSpecs}
        canRunItEnabled={launcherSettings.enableCanRunIt}
        isRefreshingSpecs={isRefreshingSpecs}
        isDesktopApp={Boolean(downloadsBridge)}
        language={launcherSettings.language}
        downloadTasks={downloadSnapshot.tasks}
        onStartDownload={handleStartMirrorDownload}
        onPauseDownload={handlePauseDownload}
        onResumeDownload={handleResumeDownload}
        onCancelDownload={handleCancelDownload}
        onOpenDownloadFolder={handleOpenDownloadFolder}
        onOpenDownloadsTab={() => setActiveSection('downloads')}
        onRefreshSpecs={handleRefreshSystemSpecs}
        onSaveCustomSpecs={handleSaveCustomSystemSpecs}
        onResetCustomSpecs={handleResetSystemSpecs}
        onToggleFavorite={handleToggleFavorite}
        onJumpToItem={(item) => handleOpenGame(item, 'overview')}
        onClose={handleCloseGame}
      />

      {updaterBridge && (
        <DesktopUpdaterModal
          isOpen={isUpdaterModalOpen}
          activeTheme={activeTheme}
          state={desktopUpdateState}
          onClose={() => setIsUpdaterModalOpen(false)}
          onCheckForUpdates={handleCheckForUpdates}
          onDownloadUpdate={handleDownloadUpdate}
          onInstallAndRestart={handleInstallAndRestart}
          onPostponeUpdate={handlePostponeUpdate}
          onOpenModal={() => setIsUpdaterModalOpen(true)}
        />
      )}

      <QbitSetupWizardModal
        isOpen={isQbitSetupModalOpen}
        isDesktopApp={Boolean(qbitSetupBridge || downloadsBridge)}
        language={launcherSettings.language}
        setupState={qbitSetupState}
        torrentConfig={downloadSnapshot.torrentConfig}
        torrentConnected={downloadSnapshot.torrentConnected}
        onClose={() => setIsQbitSetupModalOpen(false)}
        onDismissFirstLaunch={handleDismissQbitSetup}
        onRecheck={handleRecheckQbitSetup}
        onStartInstall={handleStartQbitInstall}
        onLaunchClient={handleLaunchQbitClient}
        onOpenOfficialDownload={handleOpenOfficialQbitDownload}
        onGeneratePassword={handleGenerateQbitPassword}
        onSaveAndVerifyWebUi={handleSaveAndVerifyQbitWebUi}
        onOpenSettings={handleOpenTorrentSettings}
      />

      {/* Persistent Offline Mode / Auto-hiding Online Mode Badge */}
      {connectivityBadge !== 'hidden' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-3.5 start-3.5 sm:bottom-4 sm:start-4 z-[85] pointer-events-none select-none"
        >
          {connectivityBadge === 'offline' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#7f1d1d]/95 border border-[#ef4444]/60 shadow-[0_10px_28px_rgba(0,0,0,0.45)] text-xs font-semibold text-[#fecaca] backdrop-blur-md">
              <WifiSlash className="w-4 h-4 text-[#f87171] shrink-0" />
              <span>{t.topbar.offlineMode}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#064e3b]/95 border border-[#10b981]/60 shadow-[0_10px_28px_rgba(0,0,0,0.45)] text-xs font-semibold text-[#a7f3d0] backdrop-blur-md">
              <WifiHigh className="w-4 h-4 text-[#34d399] shrink-0" />
              <span>{t.topbar.onlineMode}</span>
            </div>
          )}
        </div>
      )}

      {/* Non-blocking Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 end-4 z-[70] flex flex-col gap-2 max-w-xs pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto px-3.5 py-2.5 rounded bg-white dark:bg-[#1b222d] border border-slate-200 dark:border-white/[0.12] shadow-xl flex items-center gap-2.5 text-[12.5px] text-slate-900 dark:text-white"
            >
              {toast.type === 'success' && (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#34d399] shrink-0" />
              )}
              {toast.type === 'error' && (
                <WarningCircle className="w-4 h-4 text-rose-600 dark:text-[#f87171] shrink-0" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
