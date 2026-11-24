import { useEffect, useState } from 'react';
import {
  AppWindow,
  ArrowCounterClockwise,
  ArrowSquareOut,
  Check,
  CheckCircle,
  CursorClick,
  DownloadSimple,
  FloppyDisk,
  FolderOpen,
  Globe,
  Info,
  Laptop,
  Magnet,
  MagnifyingGlass,
  Moon,
  MusicNotes,
  PlugsConnected,
  Power,
  Sparkle,
  SpeakerHigh,
  SpeakerLow,
  SpeakerSlash,
  Sun,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  getAppVersionString,
  type AppLanguage,
  type CustomThemeConfig,
  type LauncherSettings,
} from '../services/launcherSettings';
import type {
  CloseBehaviorMode,
  PresentMonSetupState,
  QbitSetupState,
  TorrentConnectionTestResult,
  TorrentDetectionResult,
  TorrentIntegrationConfig,
} from '../types';
import { DEFAULT_TORRENT_CONFIG, isLoopbackHost } from '../services/downloadManager';
import { getTranslations, LANGUAGE_OPTIONS } from '../i18n/translations';
import { CustomThemeBuilder } from './CustomThemeBuilder';
import { Ps5Icon } from './SectionBadge';

interface SettingsViewProps {
  settings: LauncherSettings;
  isDesktopApp: boolean;
  desktopVersion?: string | null;
  isUpdatingAutoLaunch?: boolean;
  downloadFolder?: string;
  torrentConfig?: TorrentIntegrationConfig;
  torrentConnected?: boolean;
  torrentVersion?: string | null;
  torrentWebApiVersion?: string | null;
  torrentError?: string | null;
  onChangeLanguage: (language: AppLanguage) => void;
  onToggleStartWithComputer: (enabled: boolean) => void;
  onChangeCloseBehavior?: (behavior: CloseBehaviorMode) => void;
  onExitApplication?: () => void;
  onToggleEnableCanRunIt: (enabled: boolean) => void;
  onToggleCompactNavbar: (enabled: boolean) => void;
  onToggleLightMode: (enabled: boolean) => void;
  onToggleAlwaysPs5Theme: (enabled: boolean) => void;
  onToggleAlwaysXboxTheme: (enabled: boolean) => void;
  onUpdateCustomTheme: (patch: Partial<CustomThemeConfig>) => void;
  onResetCustomTheme: () => void;
  onToggleAmbientMusic: (enabled: boolean) => void;
  onToggleUiClickSounds: (enabled: boolean) => void;
  onChangeSoundVolume: (volume: number) => void;
  onPreviewSoundVolume?: () => void;
  onResetDefaults: () => void;
  onChooseDownloadFolder?: () => void;
  onOpenDownloadFolder?: () => void;
  onOpenExternal?: (url: string) => void;
  onDetectTorrentClient?: () => Promise<TorrentDetectionResult | null>;
  onSaveTorrentConfig?: (cfg: Partial<TorrentIntegrationConfig>) => Promise<void>;
  onTestTorrentConnection?: (
    cfg?: Partial<TorrentIntegrationConfig>
  ) => Promise<TorrentConnectionTestResult | null>;
  qbitSetupState?: QbitSetupState;
  onOpenQbitSetupWizard?: () => void;
  presentMonSetupState?: PresentMonSetupState;
  onOpenPresentMonManager?: () => void;
  onCheckPresentMonUpdates?: () => Promise<void> | void;
  onStartPresentMonInstallOrUpdate?: (
    userConfirmed: boolean,
    mode?: 'auto' | 'install' | 'update' | 'repair' | 'reinstall'
  ) => Promise<void> | void;
  onReplayOnboarding?: () => void;
}

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  labelId: string;
  onLabel: string;
  offLabel: string;
  onChange: (next: boolean) => void;
}

function ToggleSwitch({
  checked,
  disabled = false,
  labelId,
  onLabel,
  offLabel,
  onChange,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 shrink-0 cursor-pointer disabled:opacity-50 group focus:outline-none"
    >
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap ${
          checked
            ? 'text-[#0284c7] dark:text-[#66c0f4]'
            : 'text-slate-500 dark:text-[#8b9bb4]'
        }`}
      >
        {checked ? onLabel : offLabel}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200 ${
          checked
            ? 'bg-[#1a9fff] border-[#38adff]'
            : 'bg-slate-200 border-slate-300 group-hover:border-slate-400 dark:bg-[#0e131b] dark:border-white/[0.14] dark:group-hover:border-white/[0.28]'
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

function ExitAppInlineConfirmButton({
  label,
  confirmLabel,
  cancelLabel,
  onConfirmExit,
}: {
  label: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirmExit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-700 dark:text-rose-300 text-[12px] font-semibold transition-colors shrink-0 inline-flex items-center gap-1.5"
      >
        <Power className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          onConfirmExit();
        }}
        className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[12px] font-bold transition-colors inline-flex items-center gap-1.5"
      >
        <Power className="w-3.5 h-3.5" />
        <span>{confirmLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-[#1e2633] hover:bg-slate-300 dark:hover:bg-[#273142] text-slate-700 dark:text-[#cbd5e1] text-[12px] font-semibold transition-colors"
      >
        {cancelLabel}
      </button>
    </div>
  );
}

export function SettingsView({
  settings,
  isDesktopApp,
  desktopVersion = null,
  isUpdatingAutoLaunch = false,
  downloadFolder = '',
  torrentConfig = DEFAULT_TORRENT_CONFIG,
  torrentConnected = false,
  torrentVersion = null,
  torrentWebApiVersion = null,
  torrentError = null,
  onChangeLanguage,
  onToggleStartWithComputer,
  onChangeCloseBehavior,
  onExitApplication,
  onToggleEnableCanRunIt,
  onToggleCompactNavbar,
  onToggleLightMode,
  onToggleAlwaysPs5Theme,
  onToggleAlwaysXboxTheme,
  onUpdateCustomTheme,
  onResetCustomTheme,
  onToggleAmbientMusic,
  onToggleUiClickSounds,
  onChangeSoundVolume,
  onPreviewSoundVolume,
  onResetDefaults,
  onChooseDownloadFolder,
  onOpenDownloadFolder,
  onOpenExternal,
  onDetectTorrentClient,
  onSaveTorrentConfig,
  onTestTorrentConnection,
  qbitSetupState,
  onOpenQbitSetupWizard,
  presentMonSetupState,
  onOpenPresentMonManager,
  onCheckPresentMonUpdates,
  onStartPresentMonInstallOrUpdate,
  onReplayOnboarding,
}: SettingsViewProps) {
  const tr = getTranslations(settings.language);
  const t = tr.settings;
  const tp = tr.presentMonSetup;
  const hasConsoleTheme = settings.alwaysPs5Theme || settings.alwaysXboxTheme;
  const currentVersion = desktopVersion || getAppVersionString();

  const [draftTorrent, setDraftTorrent] = useState<TorrentIntegrationConfig>(torrentConfig);
  const [isDetectingTorrent, setIsDetectingTorrent] = useState(false);
  const [isTestingTorrent, setIsTestingTorrent] = useState(false);
  const [isSavingTorrent, setIsSavingTorrent] = useState(false);
  const [detectionResult, setDetectionResult] = useState<TorrentDetectionResult | null>(null);
  const [testResult, setTestResult] = useState<TorrentConnectionTestResult | null>(null);
  const [hostError, setHostError] = useState<string | null>(null);
  const [showTorrentGuide, setShowTorrentGuide] = useState(!torrentConnected);

  useEffect(() => {
    setDraftTorrent((prev) => ({
      ...torrentConfig,
      password: prev.password,
      apiKey: prev.apiKey || '',
    }));
  }, [
    torrentConfig.enabled,
    torrentConfig.host,
    torrentConfig.port,
    torrentConfig.username,
    torrentConfig.hasSavedPassword,
    torrentConfig.hasSavedApiKey,
  ]);

  const handleAutoDetectTorrent = async () => {
    setIsDetectingTorrent(true);
    setTestResult(null);
    setHostError(null);
    try {
      if (!isDesktopApp || !onDetectTorrentClient) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        setTestResult({
          ok: false,
          message: t.torrentTestingWebPreviewMsg,
          hint: t.torrentTestingWebPreviewHint,
        });
        return;
      }
      const detected = await onDetectTorrentClient();
      setDetectionResult(detected);
      if (detected) {
        setDraftTorrent((prev) => ({
          ...prev,
          enabled: detected.installed ? true : prev.enabled,
          host: detected.recommendedHost || '127.0.0.1',
          port: detected.recommendedPort || prev.port || 8080,
        }));
      }
    } finally {
      setIsDetectingTorrent(false);
    }
  };

  const handleTestTorrent = async () => {
    if (!isLoopbackHost(draftTorrent.host)) {
      setHostError(t.torrentLoopbackError);
      return;
    }
    setHostError(null);
    setIsTestingTorrent(true);
    try {
      if (!isDesktopApp || !onTestTorrentConnection) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setTestResult({
          ok: false,
          message: t.torrentTestingWebPreviewMsg,
          hint: t.torrentTestingWebPreviewHint,
        });
        return;
      }
      const result = await onTestTorrentConnection(draftTorrent);
      setTestResult(
        result || {
          ok: false,
          message: t.torrentStatusDisconnected,
        }
      );
    } finally {
      setIsTestingTorrent(false);
    }
  };

  const handleSaveTorrent = async () => {
    if (!onSaveTorrentConfig) return;
    if (!isLoopbackHost(draftTorrent.host)) {
      setHostError(t.torrentLoopbackError);
      return;
    }
    setHostError(null);
    setIsSavingTorrent(true);
    try {
      await onSaveTorrentConfig(draftTorrent);
      setDraftTorrent((prev) => ({ ...prev, password: '', apiKey: '' }));
    } finally {
      setIsSavingTorrent(false);
    }
  };

  const handleToggleTorrentEnabled = async (nextEnabled: boolean) => {
    const safeHost = isLoopbackHost(draftTorrent.host) ? draftTorrent.host.trim() : '127.0.0.1';
    const nextCfg = { ...draftTorrent, host: safeHost, enabled: nextEnabled };
    setHostError(null);
    setDraftTorrent(nextCfg);
    if (onSaveTorrentConfig) {
      await onSaveTorrentConfig(nextCfg);
    }
  };

  const isVerifiedTorrentConnected =
    isDesktopApp &&
    !isTestingTorrent &&
    (testResult?.ok === true || (torrentConnected && testResult?.ok !== false));

  const effectiveTorrentVersion = testResult?.ok
    ? testResult.version || torrentVersion
    : torrentVersion;
  const effectiveTorrentWebApiVersion = testResult?.ok
    ? testResult.webApiVersion || torrentWebApiVersion
    : torrentWebApiVersion;

  const VolumeIcon =
    settings.soundVolume <= 0
      ? SpeakerSlash
      : settings.soundVolume < 50
      ? SpeakerLow
      : SpeakerHigh;

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-[#f4f6f9] to-slate-100 dark:from-[#1d2633] dark:via-[#171d26] dark:to-[#12161d]">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.pageTitle}
              </h1>
              <span
                dir="ltr"
                className="text-[11.5px] font-mono-tabular font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-white/[0.07] border border-slate-300/70 dark:border-white/[0.1] text-slate-700 dark:text-[#9cb0c9]"
              >
                v{currentVersion}
              </span>
            </div>
            <p className="text-[12.5px] text-slate-600 dark:text-[#8b9bb4]">
              {t.pageSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!isDesktopApp && onReplayOnboarding && (
              <button
                type="button"
                onClick={onReplayOnboarding}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-50 hover:bg-sky-100 dark:bg-[#1a9fff]/15 dark:hover:bg-[#1a9fff]/25 border border-sky-200 dark:border-[#1a9fff]/35 text-[12px] font-semibold text-[#0284c7] dark:text-[#66c0f4] transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                <Sparkle className="w-3.5 h-3.5" />
                <span>{t.replaySetupBtn}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.08] text-[12px] font-semibold text-slate-700 hover:text-slate-900 dark:text-[#c6d4df] dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <ArrowCounterClockwise className="w-3.5 h-3.5" />
              <span>{t.resetDefaults}</span>
            </button>
          </div>
        </div>

        {/* 1. Language */}
        <section className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-sky-500/10 dark:bg-[#1a9fff]/15 border border-sky-500/25 dark:border-[#1a9fff]/35 text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0">
                <Globe className="w-4.5 h-4.5" />
              </span>
              <div className="space-y-0.5">
                <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.languageSectionTitle}
                </h2>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4]">
                  {t.languageSectionDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {LANGUAGE_OPTIONS.map((opt) => {
              const selected = settings.language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChangeLanguage(opt.code)}
                  className={`sa-ps5-subpanel relative p-3.5 rounded-lg border text-start transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    selected
                      ? 'bg-sky-50 dark:bg-[#162538] border-[#1a9fff] ring-1 ring-[#1a9fff]/45 shadow-[0_0_20px_rgba(26,159,255,0.16)]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 dark:bg-[#12171f] dark:border-white/[0.07] dark:hover:border-white/[0.2] dark:hover:bg-[#171e29]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono-tabular tracking-wider ${
                        selected
                          ? 'bg-[#1a9fff] text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-white/[0.08] dark:text-[#9fb0c7]'
                      }`}
                    >
                      {opt.shortLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b9bb4]">
                        {opt.direction === 'rtl' ? t.rtlBadge : t.ltrBadge}
                      </span>
                      {selected && (
                        <Check
                          weight="bold"
                          className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4]"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[14px] font-bold text-slate-900 dark:text-white">
                      {opt.nativeName}
                    </div>
                    <div className="text-[11.5px] text-slate-500 dark:text-[#8b9bb4]">
                      {opt.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Starting and closing */}
        <section className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-sm dark:shadow-lg">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
            <Power className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
            <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
              {t.startingSectionTitle}
            </h2>
          </div>

          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <DownloadSimple className="w-4 h-4" />
              </span>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    id="setting-start-with-computer"
                    className="text-[13.5px] font-semibold text-slate-900 dark:text-white"
                  >
                    {t.startWithComputerTitle}
                  </span>
                  {isDesktopApp && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-semibold text-emerald-700 dark:text-[#4ade80]">
                      {t.desktopSupportedBadge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.startWithComputerDesc}
                </p>
                {!isDesktopApp ? (
                  <p className="text-[11px] text-[#0284c7] dark:text-[#66c0f4]/85">
                    {t.webNotice}
                  </p>
                ) : (
                  settings.startWithComputer && (
                    <p className="text-[11px] text-emerald-700 dark:text-[#4ade80]/90">
                      {t.trayActiveHint}
                    </p>
                  )
                )}
              </div>
            </div>

            <ToggleSwitch
              checked={settings.startWithComputer}
              disabled={isUpdatingAutoLaunch}
              labelId="setting-start-with-computer"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleStartWithComputer}
            />
          </div>

          {/* Application Closing Behavior */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <AppWindow className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  {t.closeBehaviorTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.closeBehaviorDesc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onChangeCloseBehavior?.('minimize-to-tray')}
                className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-colors text-start flex items-center gap-2 ${
                  settings.closeBehavior === 'minimize-to-tray'
                    ? 'bg-[#0284c7]/15 dark:bg-[#66c0f4]/15 border-[#0284c7] dark:border-[#66c0f4] text-[#0369a1] dark:text-white'
                    : 'bg-white dark:bg-[#161c26] border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-[#b8c4d4] hover:bg-slate-100 dark:hover:bg-[#1d2532]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    settings.closeBehavior === 'minimize-to-tray'
                      ? 'bg-[#0284c7] dark:bg-[#66c0f4]'
                      : 'bg-slate-400 dark:bg-[#5c6b7f]'
                  }`}
                />
                <span>{t.closeBehaviorMinimizeTray}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeCloseBehavior?.('exit')}
                className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-colors text-start flex items-center gap-2 ${
                  settings.closeBehavior === 'exit'
                    ? 'bg-[#0284c7]/15 dark:bg-[#66c0f4]/15 border-[#0284c7] dark:border-[#66c0f4] text-[#0369a1] dark:text-white'
                    : 'bg-white dark:bg-[#161c26] border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-[#b8c4d4] hover:bg-slate-100 dark:hover:bg-[#1d2532]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    settings.closeBehavior === 'exit'
                      ? 'bg-[#0284c7] dark:bg-[#66c0f4]'
                      : 'bg-slate-400 dark:bg-[#5c6b7f]'
                  }`}
                />
                <span>{t.closeBehaviorExit}</span>
              </button>
            </div>
          </div>

          {/* Explicit Full Application Shutdown */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Power className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span className="block text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  {t.exitAppTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.exitAppDesc}
                </p>
                {!isDesktopApp && (
                  <p className="text-[11px] text-[#0284c7] dark:text-[#66c0f4]/85">
                    {t.exitAppWebHint}
                  </p>
                )}
              </div>
            </div>

            {isDesktopApp && onExitApplication ? (
              <ExitAppInlineConfirmButton
                label={t.exitAppBtn}
                confirmLabel={t.exitAppConfirmBtn}
                cancelLabel={t.exitAppCancelBtn}
                onConfirmExit={onExitApplication}
              />
            ) : (
              <button
                type="button"
                disabled
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-500/60 text-[12px] font-semibold cursor-not-allowed shrink-0"
              >
                {t.exitAppBtn}
              </button>
            )}
          </div>

          {/* Can Run It Toggle */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <Laptop className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span
                  id="setting-enable-can-run-it"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.canRunItTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.canRunItDesc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.enableCanRunIt}
              labelId="setting-enable-can-run-it"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleEnableCanRunIt}
            />
          </div>
        </section>

        {/* 3. Window */}
        <section className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-sm dark:shadow-lg">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
            <AppWindow className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
            <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
              {t.windowSectionTitle}
            </h2>
          </div>

          {/* Compact Navbar */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <AppWindow className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span
                  id="setting-compact-navbar"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.compactNavbarTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.compactNavbarDesc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.compactNavbar}
              labelId="setting-compact-navbar"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleCompactNavbar}
            />
          </div>

          {/* Light / Dark Mode */}
          <div
            className={`sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
              settings.lightMode
                ? 'bg-amber-50/75 border-amber-400/50 dark:bg-[#12171f] dark:border-white/[0.07]'
                : 'bg-slate-50 border-slate-200 dark:bg-[#12171f] dark:border-white/[0.07]'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                  settings.lightMode
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-slate-200/80 dark:bg-[#1a2433] border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4]'
                }`}
              >
                {settings.lightMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </span>
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    id="setting-light-mode"
                    className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                  >
                    {t.lightModeTitle}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                      settings.lightMode
                        ? 'bg-amber-500/15 border-amber-500/35 text-amber-800'
                        : 'bg-slate-200/80 dark:bg-white/[0.06] border-slate-300 dark:border-white/[0.1] text-slate-700 dark:text-[#9fb0c7]'
                    }`}
                  >
                    {settings.lightMode ? t.lightModeBadge : t.darkModeBadge}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.lightModeDesc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.lightMode}
              labelId="setting-light-mode"
              onLabel={t.lightModeBadge}
              offLabel={t.darkModeBadge}
              onChange={onToggleLightMode}
            />
          </div>

          {/* Always run app with PS5 theme */}
          <div
            className={`sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
              settings.alwaysPs5Theme
                ? 'bg-[#10203a] border-[#38bdf8]/55'
                : 'bg-slate-50 border-slate-200 dark:bg-[#12171f] dark:border-white/[0.07]'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#0d2752] border border-[#38bdf8]/35 text-[#7cc4ff] flex items-center justify-center shrink-0 mt-0.5">
                <Ps5Icon className="w-4.5 h-4.5" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span
                  id="setting-always-ps5"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.alwaysPs5Title}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.alwaysPs5Desc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.alwaysPs5Theme}
              labelId="setting-always-ps5"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleAlwaysPs5Theme}
            />
          </div>

          {/* Always run app with Xbox theme */}
          <div
            className={`sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
              settings.alwaysXboxTheme
                ? 'bg-[#0c2611] border-[#52e042]/60'
                : 'bg-slate-50 border-slate-200 dark:bg-[#12171f] dark:border-white/[0.07]'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#0e2e13] border border-[#52e042]/45 text-[#6ee755] flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="w-4.5 h-4.5"
                >
                  <circle cx="12" cy="12" r="9.2" />
                  <path d="M7.2 6.8c2.2 1.2 4.8 3.6 7.5 7.4 1 1.4 1.7 2.8 2 4" />
                  <path d="M16.8 6.8c-2.2 1.2-4.8 3.6-7.5 7.4-1 1.4-1.7 2.8-2 4" />
                </svg>
              </span>
              <div className="space-y-0.5 min-w-0">
                <span
                  id="setting-always-xbox"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.alwaysXboxTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.alwaysXboxDesc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.alwaysXboxTheme}
              labelId="setting-always-xbox"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleAlwaysXboxTheme}
            />
          </div>

          {/* Custom Default Theme Builder */}
          <CustomThemeBuilder
            language={settings.language}
            customTheme={settings.customTheme}
            hasConsoleThemeActive={hasConsoleTheme}
            onUpdateCustomTheme={onUpdateCustomTheme}
            onResetCustomTheme={onResetCustomTheme}
          />
        </section>

        {/* 4. Audio & Soundscape */}
        <section className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-sm dark:shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-start gap-2.5">
              <SpeakerHigh className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.audioSectionTitle}
                </h2>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4]">
                  {t.audioSectionDesc}
                </p>
              </div>
            </div>
          </div>

          {!hasConsoleTheme && (
            <div className="px-3 py-2 rounded-lg bg-sky-50 dark:bg-[#121a26] border border-sky-200 dark:border-[#1a9fff]/25 text-[11.5px] text-sky-800 dark:text-[#9fb0c7]">
              {t.consoleThemeAudioHint}
            </div>
          )}

          {/* Ambient PS5 / Xbox Background Music Toggle */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <MusicNotes className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span
                  id="setting-ambient-music"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.ambientMusicTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.ambientMusicDesc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.ambientMusicEnabled}
              labelId="setting-ambient-music"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleAmbientMusic}
            />
          </div>

          {/* UI Click & Hover Sounds Toggle */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <CursorClick className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <span
                  id="setting-ui-sounds"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.uiSoundsTitle}
                </span>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.uiSoundsDesc}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.uiClickSoundsEnabled}
              labelId="setting-ui-sounds"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={onToggleUiClickSounds}
            />
          </div>

          {/* Master Sound Volume Slider */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-[#1a2433] border border-slate-300/70 dark:border-white/[0.08] text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0 mt-0.5">
                <VolumeIcon className="w-4 h-4" />
              </span>
              <div className="space-y-0.5 min-w-0">
                <label
                  htmlFor="setting-sound-volume"
                  className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
                >
                  {t.volumeTitle}
                </label>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.volumeDesc}
                </p>
              </div>
            </div>

            <div dir="ltr" className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <input
                id="setting-sound-volume"
                type="range"
                min={0}
                max={100}
                step={1}
                value={settings.soundVolume}
                onChange={(e) => onChangeSoundVolume(Number(e.target.value))}
                onPointerUp={() => onPreviewSoundVolume?.()}
                onKeyUp={(e) => {
                  if (
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowDown' ||
                    e.key === 'Home' ||
                    e.key === 'End' ||
                    e.key === 'PageUp' ||
                    e.key === 'PageDown'
                  ) {
                    onPreviewSoundVolume?.();
                  }
                }}
                aria-label={t.volumeTitle}
                className="flex-1 sm:w-48 h-2 rounded-full cursor-pointer bg-slate-200 dark:bg-[#0e131b] accent-[#1a9fff]"
              />
              <span className="w-12 text-end text-[12.5px] font-bold font-mono-tabular text-slate-800 dark:text-[#66c0f4] shrink-0">
                {settings.soundVolume}%
              </span>
            </div>
          </div>
        </section>

        {/* 5. Downloads & Storage */}
        <section className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-sm dark:shadow-lg">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
            <FolderOpen className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
            <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
              {t.downloadSectionTitle}
            </h2>
          </div>

          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                {t.downloadFolderTitle}
              </div>
              <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                {t.downloadFolderDesc}
              </p>
              {downloadFolder && (
                <p
                  dir="ltr"
                  className="pt-1 text-[12px] font-mono-tabular text-[#0284c7] dark:text-[#66c0f4] break-all"
                >
                  {downloadFolder}
                </p>
              )}
            </div>

            {isDesktopApp && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onChooseDownloadFolder?.()}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{t.chooseFolderBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDownloadFolder?.()}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#1c2430] dark:hover:bg-[#253040] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-[#dce4ee] text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowSquareOut className="w-4 h-4" />
                  <span>{t.openFolderBtn}</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 6. qBittorrent Integration (Web UI API v2) */}
        <section
          id="torrent-integration-settings"
          className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-lg"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="w-9 h-9 rounded-lg bg-sky-500/10 dark:bg-[#1a9fff]/15 border border-sky-500/25 dark:border-[#1a9fff]/35 text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0">
                <Magnet className="w-4.5 h-4.5" />
              </span>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                    {t.torrentSectionTitle}
                  </h2>

                  <span
                    role="status"
                    aria-live="polite"
                    className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold ${
                      isTestingTorrent
                        ? 'text-[#0284c7] dark:text-[#66c0f4]'
                        : isVerifiedTorrentConnected
                        ? 'text-emerald-700 dark:text-[#4ade80]'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full ${
                        isTestingTorrent
                          ? 'bg-[#0284c7] dark:bg-[#38bdf8] animate-pulse'
                          : isVerifiedTorrentConnected
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                          : 'bg-amber-500 dark:bg-amber-400'
                      }`}
                    />
                    <span>
                      {isTestingTorrent
                        ? t.torrentStatusTesting
                        : isVerifiedTorrentConnected
                        ? t.torrentStatusConnected
                        : t.torrentStatusDisconnected}
                    </span>
                    {isVerifiedTorrentConnected && effectiveTorrentVersion && (
                      <span dir="ltr" className="font-mono-tabular opacity-85">
                        · {effectiveTorrentVersion}
                        {effectiveTorrentWebApiVersion
                          ? ` (API ${effectiveTorrentWebApiVersion})`
                          : ''}
                      </span>
                    )}
                  </span>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-[#9cb0c9]">
                    {isDesktopApp ? t.modeDesktopBadge : t.modeWebPreviewBadge}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {t.torrentSectionDesc}
                </p>
              </div>
            </div>

            {onOpenQbitSetupWizard && (
              <button
                type="button"
                onClick={onOpenQbitSetupWizard}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <DownloadSimple className="w-4 h-4" />
                <span>{t.torrentManageSetupBtn}</span>
                {qbitSetupState?.actionNeeded === 'update_available' && qbitSetupState.latestRelease?.version && (
                  <span dir="ltr" className="font-mono-tabular opacity-90">
                    (v{qbitSetupState.latestRelease.version})
                  </span>
                )}
              </button>
            )}
          </div>

          {!isDesktopApp && (
            <div className="px-3.5 py-2.5 rounded-lg bg-sky-50 dark:bg-[#121a26] border border-sky-200 dark:border-[#1a9fff]/25 text-[12px] text-sky-900 dark:text-[#9fb0c7]">
              {t.torrentWebNotice}
            </div>
          )}

          {/* Enable Toggle */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <span
                id="setting-torrent-sync"
                className="block text-[13.5px] font-semibold text-slate-900 dark:text-white"
              >
                {t.torrentEnableTitle}
              </span>
              <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                {t.torrentEnableDesc}
              </p>
              {isDesktopApp && torrentConfig.enabled && (
                <p
                  className={`pt-1 text-[11.5px] font-medium ${
                    torrentConnected
                      ? 'text-emerald-700 dark:text-[#4ade80]'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {torrentConnected
                    ? `✓ qBittorrent Web UI (${torrentConfig.host}:${torrentConfig.port})${
                        torrentVersion ? ` · ${torrentVersion}` : ''
                      }`
                    : torrentError || `Waiting for qBittorrent Web UI (${torrentConfig.host}:${torrentConfig.port})`}
                </p>
              )}
            </div>

            <ToggleSwitch
              checked={draftTorrent.enabled}
              labelId="setting-torrent-sync"
              onLabel={t.activeLabel}
              offLabel={t.inactiveLabel}
              onChange={handleToggleTorrentEnabled}
            />
          </div>

          {/* Auto-Detect Feedback Banner */}
          {detectionResult && (
            <div
              className={`p-3.5 rounded-lg border text-[12px] space-y-2 ${
                detectionResult.installed
                  ? 'bg-sky-50 dark:bg-[#122030] border-sky-200 dark:border-[#1a9fff]/35 text-slate-800 dark:text-[#d5e4f5]'
                  : 'bg-amber-50 dark:bg-[#1e1a12] border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>
                      {detectionResult.installed
                        ? detectionResult.clientName
                        : t.torrentNotInstalledTitle}
                      {detectionResult.installed && detectionResult.openWebUiPorts.length > 0 && (
                        <span dir="ltr" className="ms-2 font-mono-tabular">
                          (Open Web UI port: {detectionResult.openWebUiPorts.join(', ')})
                        </span>
                      )}
                    </span>
                  </div>
                  {detectionResult.executablePath && (
                    <div dir="ltr" className="font-mono-tabular text-[11.5px] opacity-80 break-all">
                      {detectionResult.executablePath}
                    </div>
                  )}
                  {!detectionResult.installed && (
                    <p className="opacity-90 leading-relaxed">{t.torrentNotInstalledDesc}</p>
                  )}
                </div>

                {!detectionResult.installed && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isDesktopApp && onOpenQbitSetupWizard && (
                      <button
                        type="button"
                        onClick={onOpenQbitSetupWizard}
                        className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <DownloadSimple className="w-3.5 h-3.5" />
                        <span>{t.torrentManageSetupBtn}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onOpenExternal?.(
                          detectionResult.downloadUrl || 'https://www.qbittorrent.org/download'
                        )
                      }
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.1] text-slate-800 dark:text-white text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <ArrowSquareOut className="w-3.5 h-3.5" />
                      <span>{t.torrentDownloadBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Connection Result Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg border text-[12px] space-y-1 ${
                testResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="font-semibold flex items-center gap-2">
                {testResult.ok ? (
                  <CheckCircle weight="fill" className="w-4 h-4 shrink-0" />
                ) : (
                  <WarningCircle weight="fill" className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {testResult.message}
                  {testResult.version ? ` (${testResult.version})` : ''}
                  {testResult.webApiVersion ? ` · WebAPI ${testResult.webApiVersion}` : ''}
                  {typeof testResult.activeCount === 'number'
                    ? ` · ${testResult.activeCount} torrents`
                    : ''}
                </span>
              </div>
              {testResult.hint && <p className="opacity-90 leading-relaxed">{testResult.hint}</p>}
            </div>
          )}

          {/* qBittorrent WebUI Credentials Form */}
          <div className="sa-ps5-subpanel p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="torrent-host-input"
                  className="block text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]"
                >
                  {t.torrentHostLabel}
                </label>
                <input
                  id="torrent-host-input"
                  type="text"
                  dir="ltr"
                  value={draftTorrent.host}
                  onChange={(e) => {
                    const nextHost = e.target.value;
                    setDraftTorrent((prev) => ({ ...prev, host: nextHost }));
                    if (hostError && isLoopbackHost(nextHost)) {
                      setHostError(null);
                    }
                  }}
                  placeholder="127.0.0.1"
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0e131b] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-mono-tabular text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="torrent-port-input"
                  className="block text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]"
                >
                  {t.torrentPortLabel}
                </label>
                <input
                  id="torrent-port-input"
                  type="number"
                  dir="ltr"
                  min={1}
                  max={65535}
                  value={draftTorrent.port}
                  onChange={(e) =>
                    setDraftTorrent((prev) => ({
                      ...prev,
                      port: Number(e.target.value) || 8080,
                    }))
                  }
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0e131b] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-mono-tabular text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="torrent-username-input"
                  className="block text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]"
                >
                  {t.torrentUsernameLabel}
                </label>
                <input
                  id="torrent-username-input"
                  type="text"
                  dir="ltr"
                  value={draftTorrent.username}
                  onChange={(e) =>
                    setDraftTorrent((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="admin"
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0e131b] border border-slate-200 dark:border-white/[0.1] text-[12.5px] text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="torrent-password-input"
                  className="block text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]"
                >
                  {t.torrentPasswordLabel}
                </label>
                <input
                  id="torrent-password-input"
                  type="password"
                  dir="ltr"
                  value={draftTorrent.password}
                  onChange={(e) =>
                    setDraftTorrent((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder={
                    torrentConfig.hasSavedPassword ? t.torrentPasswordSavedPlaceholder : '••••••••'
                  }
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0e131b] border border-slate-200 dark:border-white/[0.1] text-[12.5px] text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 space-y-1.5">
                <label
                  htmlFor="torrent-apikey-input"
                  className="block text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]"
                >
                  {t.torrentApiKeyLabel}
                </label>
                <input
                  id="torrent-apikey-input"
                  type="password"
                  dir="ltr"
                  value={draftTorrent.apiKey || ''}
                  onChange={(e) =>
                    setDraftTorrent((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder={
                    torrentConfig.hasSavedApiKey
                      ? t.torrentApiKeySavedPlaceholder
                      : t.torrentApiKeyPlaceholder
                  }
                  className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0e131b] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-mono-tabular text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
            </div>

            {hostError ? (
              <p className="text-[12px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <WarningCircle className="w-4 h-4 shrink-0" />
                <span>{hostError}</span>
              </p>
            ) : (
              <p className="text-[11.5px] text-slate-500 dark:text-[#8b9bb4]">
                {t.torrentLoopbackNotice}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowTorrentGuide((prev) => !prev)}
                className="text-[12px] font-semibold text-[#0284c7] dark:text-[#66c0f4] hover:underline cursor-pointer"
              >
                {t.torrentGuideTitle}
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isDetectingTorrent}
                  onClick={handleAutoDetectTorrent}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.1] text-[12.5px] font-semibold text-slate-800 dark:text-white disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MagnifyingGlass className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4]" />
                  <span>
                    {isDetectingTorrent ? t.torrentDetectingBtn : t.torrentAutoDetectBtn}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isTestingTorrent}
                  onClick={handleTestTorrent}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12.5px] font-semibold disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <PlugsConnected className="w-4 h-4" />
                  <span>{isTestingTorrent ? t.torrentTestingBtn : t.torrentTestBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingTorrent}
                  onClick={handleSaveTorrent}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FloppyDisk className="w-4 h-4" />
                  <span>{isSavingTorrent ? t.torrentSavingBtn : t.torrentSaveBtn}</span>
                </button>
              </div>
            </div>

            {showTorrentGuide && (
              <ol className="pt-2 border-t border-slate-200 dark:border-white/[0.08] space-y-1.5 text-[12px] text-slate-600 dark:text-[#9cb0c9] leading-relaxed">
                <li>{t.torrentGuideStep1}</li>
                <li>{t.torrentGuideStep2}</li>
                <li>{t.torrentGuideStep3}</li>
                <li>{t.torrentGuideStep4}</li>
                <li>{t.torrentGuideStep5}</li>
              </ol>
            )}
          </div>
        </section>

        {/* 7. Intel PresentMon (FPS & Frame Time Engine) */}
        <section
          id="presentmon-dependency-settings"
          className="sa-ps5-panel rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-lg"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="w-9 h-9 rounded-lg bg-sky-500/10 dark:bg-[#1a9fff]/15 border border-sky-500/25 dark:border-[#1a9fff]/35 text-[#0284c7] dark:text-[#66c0f4] flex items-center justify-center shrink-0">
                <Sparkle className="w-4.5 h-4.5" />
              </span>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                    {tp.sectionTitle}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-0.5 rounded-md border ${
                      presentMonSetupState?.installed && presentMonSetupState.healthy
                        ? presentMonSetupState.actionNeeded === 'update_available'
                          ? 'bg-sky-500/12 border-sky-500/30 text-[#0284c7] dark:text-[#38bdf8]'
                          : 'bg-emerald-500/12 border-emerald-500/30 text-emerald-700 dark:text-[#4ade80]'
                        : presentMonSetupState?.actionNeeded === 'repair_required'
                        ? 'bg-rose-500/12 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-500/12 border-amber-500/30 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {presentMonSetupState?.stage === 'checking'
                      ? tp.statusChecking
                      : presentMonSetupState?.actionNeeded === 'repair_required'
                      ? tp.statusRepairRequired
                      : presentMonSetupState?.actionNeeded === 'update_available'
                      ? tp.statusUpdateAvailable
                      : presentMonSetupState?.installed && presentMonSetupState.healthy
                      ? presentMonSetupState.actionNeeded === 'newer_installed'
                        ? tp.statusNewerInstalled
                        : tp.statusReady
                      : presentMonSetupState?.declinedForVersion
                      ? tp.statusDeclined
                      : tp.statusNotInstalled}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  {tp.sectionSubtitle}
                </p>
              </div>
            </div>

            {onOpenPresentMonManager && (
              <button
                type="button"
                onClick={onOpenPresentMonManager}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <DownloadSimple className="w-4 h-4" />
                <span>{tp.managePresentMonBtn}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sa-ps5-subpanel p-3 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07]">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-[#8b9bb4]">
                {tp.installedVersionLabel}
              </div>
              <div dir="ltr" className="mt-0.5 text-[13.5px] font-bold font-mono-tabular text-slate-900 dark:text-white">
                {presentMonSetupState?.installedVersion
                  ? `v${presentMonSetupState.installedVersion}`
                  : tp.notInstalledValue}
              </div>
            </div>

            <div className="sa-ps5-subpanel p-3 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07]">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-[#8b9bb4]">
                {tp.latestVersionLabel}
              </div>
              <div dir="ltr" className="mt-0.5 text-[13.5px] font-bold font-mono-tabular text-[#0284c7] dark:text-[#38bdf8]">
                {presentMonSetupState?.latestRelease?.version
                  ? `v${presentMonSetupState.latestRelease.version}`
                  : tr.hardware.naValue}
              </div>
            </div>

            <div className="sa-ps5-subpanel p-3 rounded-lg bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.07] min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-[#8b9bb4]">
                {tp.installPathLabel}
              </div>
              <div
                dir="ltr"
                title={presentMonSetupState?.executablePath || undefined}
                className="mt-0.5 text-[12px] font-mono-tabular text-slate-700 dark:text-[#cbd5e1] truncate"
              >
                {presentMonSetupState?.executablePath || tp.notInstalledValue}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() =>
                onOpenExternal?.(
                  presentMonSetupState?.officialReleasesUrl ||
                    'https://github.com/GameTechDev/PresentMon/releases/latest'
                )
              }
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0284c7] dark:text-[#66c0f4] hover:underline cursor-pointer"
            >
              <ArrowSquareOut className="w-3.5 h-3.5" />
              <span>{tp.officialReleasesBtn}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {isDesktopApp && onCheckPresentMonUpdates && (
                <button
                  type="button"
                  disabled={presentMonSetupState?.stage === 'checking'}
                  onClick={() => void onCheckPresentMonUpdates()}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.1] text-[12px] font-semibold text-slate-800 dark:text-white disabled:opacity-55 transition-colors cursor-pointer"
                >
                  <ArrowCounterClockwise
                    className={`w-3.5 h-3.5 ${
                      presentMonSetupState?.stage === 'checking' ? 'motion-safe:animate-spin' : ''
                    }`}
                  />
                  <span>
                    {presentMonSetupState?.stage === 'checking'
                      ? tp.checkingBtn
                      : tp.checkUpdatesBtn}
                  </span>
                </button>
              )}

              {isDesktopApp &&
                onStartPresentMonInstallOrUpdate &&
                presentMonSetupState?.actionNeeded === 'update_available' && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPresentMonManager?.();
                      void onStartPresentMonInstallOrUpdate(true, 'update');
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    <DownloadSimple className="w-3.5 h-3.5" />
                    <span>{tp.updateNowBtn}</span>
                  </button>
                )}

              {isDesktopApp &&
                onStartPresentMonInstallOrUpdate &&
                presentMonSetupState?.actionNeeded === 'repair_required' && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPresentMonManager?.();
                      void onStartPresentMonInstallOrUpdate(true, 'repair');
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    <span>{tp.repairBtn}</span>
                  </button>
                )}

              {isDesktopApp &&
                onStartPresentMonInstallOrUpdate &&
                presentMonSetupState?.installed && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPresentMonManager?.();
                      void onStartPresentMonInstallOrUpdate(true, 'reinstall');
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.1] text-[12px] font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
                  >
                    <span>{tp.reinstallBtn}</span>
                  </button>
                )}

              {isDesktopApp &&
                onStartPresentMonInstallOrUpdate &&
                !presentMonSetupState?.installed && (
                  <button
                    type="button"
                    onClick={() => onOpenPresentMonManager?.()}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    <DownloadSimple className="w-3.5 h-3.5" />
                    <span>{tp.enablePresentMonBtn}</span>
                  </button>
                )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

