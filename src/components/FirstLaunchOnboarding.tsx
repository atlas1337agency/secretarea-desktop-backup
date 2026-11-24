import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowClockwise,
  ArrowSquareOut,
  Check,
  CheckCircle,
  Desktop,
  DownloadSimple,
  Eye,
  EyeSlash,
  Gear,
  Globe,
  Key,
  Magnet,
  Moon,
  Palette,
  Play,
  Shield,
  ShieldCheck,
  Sparkle,
  SpinnerGap,
  Sun,
  WarningCircle,
} from '@phosphor-icons/react';
import type {
  QbitSetupStage,
  QbitSetupState,
  TorrentConnectionTestResult,
  TorrentIntegrationConfig,
} from '../types';
import {
  getAppVersionString,
  type AppLanguage,
  type AppThemeMode,
  type CustomThemeConfig,
  type LauncherSettings,
} from '../services/launcherSettings';
import { getTranslations, LANGUAGE_OPTIONS } from '../i18n/translations';
import { formatBytes, formatDownloadSpeed, formatEta } from '../services/downloadManager';
import { QBIT_OFFICIAL_LOGO_URL } from '../services/qbitSetup';
import { CustomThemeBuilder } from './CustomThemeBuilder';
import { Ps5Icon } from './SectionBadge';

export type OnboardingThemeChoice = 'dark' | 'light' | 'ps5' | 'xbox';
type OnboardingStepId =
  | 'welcome'
  | 'preferences'
  | 'qbit_check'
  | 'qbit_integration'
  | 'complete';

interface FirstLaunchOnboardingProps {
  isDesktopApp: boolean;
  desktopVersion?: string | null;
  settings: LauncherSettings;
  activeTheme: AppThemeMode;
  setupState: QbitSetupState;
  torrentConfig: TorrentIntegrationConfig;
  torrentConnected: boolean;
  onSelectTheme: (choice: OnboardingThemeChoice) => void;
  onUpdateCustomTheme: (patch: Partial<CustomThemeConfig>) => void;
  onResetCustomTheme: () => void;
  onChangeLanguage: (language: AppLanguage) => void;
  onRecheckQbit: () => Promise<void> | void;
  onStartQbitInstall: (userConfirmed: boolean) => Promise<void> | void;
  onLaunchQbitClient: () => Promise<void> | void;
  onOpenOfficialQbitDownload: () => void;
  onGenerateQbitPassword: () => Promise<string>;
  onSaveAndVerifyWebUi: (
    cfg: Partial<TorrentIntegrationConfig>
  ) => Promise<TorrentConnectionTestResult | null>;
  onCompleteOnboarding: (destination: 'store' | 'settings') => void;
}

const ORDERED_INSTALL_STEPS: QbitSetupStage[] = [
  'checking_dependencies',
  'detecting_qbit',
  'downloading',
  'verifying',
  'installing',
  'configuring',
  'completed',
];

function getInstallRank(stage: QbitSetupStage): number {
  switch (stage) {
    case 'checking_dependencies':
      return 0;
    case 'detecting_qbit':
    case 'fetching_release':
      return 1;
    case 'downloading':
      return 2;
    case 'verifying':
      return 3;
    case 'installing':
      return 4;
    case 'configuring':
      return 5;
    case 'completed':
      return 6;
    default:
      return -1;
  }
}

export function FirstLaunchOnboarding({
  isDesktopApp,
  desktopVersion = null,
  settings,
  activeTheme,
  setupState,
  torrentConfig,
  torrentConnected,
  onSelectTheme,
  onUpdateCustomTheme,
  onResetCustomTheme,
  onChangeLanguage,
  onRecheckQbit,
  onStartQbitInstall,
  onLaunchQbitClient,
  onOpenOfficialQbitDownload,
  onGenerateQbitPassword,
  onSaveAndVerifyWebUi,
  onCompleteOnboarding,
}: FirstLaunchOnboardingProps) {
  const tr = getTranslations(settings.language);
  const t = tr.onboarding;
  const tq = tr.qbitSetup;
  const ts = tr.settings;
  const isRtl = settings.language === 'ar';
  const currentVersion = desktopVersion || getAppVersionString();

  const [step, setStep] = useState<OnboardingStepId>('welcome');
  const [brandLogoFailed, setBrandLogoFailed] = useState(false);
  const [qbitLogoFailed, setQbitLogoFailed] = useState(false);
  const [torrentSkipped, setTorrentSkipped] = useState(false);

  // qBittorrent install auto-advance tracking
  const installStartedHereRef = useRef(false);
  const [justInstalledBanner, setJustInstalledBanner] = useState(false);

  // Step 4: Integration credentials state
  const [port, setPort] = useState<number>(torrentConfig.port || 8080);
  const [username, setUsername] = useState<string>(torrentConfig.username || 'admin');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingWebUi, setIsVerifyingWebUi] = useState(false);
  const [webUiTestResult, setWebUiTestResult] = useState<TorrentConnectionTestResult | null>(null);

  // Step 5: Congratulations animated progress & smooth launch exit
  const [congratsProgress, setCongratsProgress] = useState(0);
  const [isLaunchingOut, setIsLaunchingOut] = useState(false);

  const currentThemeChoice: OnboardingThemeChoice = settings.alwaysPs5Theme
    ? 'ps5'
    : settings.alwaysXboxTheme
    ? 'xbox'
    : settings.lightMode
    ? 'light'
    : 'dark';

  const isPs5Theme = activeTheme === 'ps5';
  const isXboxTheme = activeTheme === 'xbox';
  const isConsoleTheme = isPs5Theme || isXboxTheme;

  const DirectionalArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  // Trigger a clean local + release check as soon as the user reaches Step 3
  const hasTriggeredStep3CheckRef = useRef(false);
  useEffect(() => {
    if (step !== 'qbit_check') {
      hasTriggeredStep3CheckRef.current = false;
      return;
    }
    if (hasTriggeredStep3CheckRef.current) return;
    hasTriggeredStep3CheckRef.current = true;
    setJustInstalledBanner(false);
    if (isDesktopApp) {
      void onRecheckQbit();
    }
  }, [step, isDesktopApp, onRecheckQbit]);

  // If user initiated qBittorrent install in Step 3 and it finishes cleanly, advance to Step 4 Integration
  useEffect(() => {
    if (
      step === 'qbit_check' &&
      installStartedHereRef.current &&
      setupState.installed &&
      setupState.stage === 'completed'
    ) {
      installStartedHereRef.current = false;
      setJustInstalledBanner(true);
      const timer = window.setTimeout(() => {
        setStep('qbit_integration');
      }, 1150);
      return () => window.clearTimeout(timer);
    }
  }, [step, setupState.installed, setupState.stage]);

  // Pre-fill Web UI fields from detected qBittorrent.ini / saved config on Step 4
  useEffect(() => {
    if (step !== 'qbit_integration') return;
    setPort(
      setupState.webUiConfig.configFound && setupState.webUiConfig.port
        ? setupState.webUiConfig.port
        : torrentConfig.port || 8080
    );
    setUsername(
      (setupState.webUiConfig.configFound && setupState.webUiConfig.username) ||
        torrentConfig.username ||
        'admin'
    );
  }, [
    step,
    setupState.webUiConfig.configFound,
    setupState.webUiConfig.port,
    setupState.webUiConfig.username,
    torrentConfig.port,
    torrentConfig.username,
  ]);

  // Animate Congratulations progress ring smoothly from 0 -> 100 on Step 5
  useEffect(() => {
    if (step !== 'complete') {
      setCongratsProgress(0);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCongratsProgress(100);
      return;
    }

    let rafId = 0;
    const durationMs = 1450;
    const startAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startAt;
      const ratio = Math.min(1, elapsed / durationMs);
      // Smooth easeOutCubic
      const eased = 1 - Math.pow(1 - ratio, 3);
      setCongratsProgress(Math.round(eased * 100));
      if (ratio < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [step]);

  const isBusyInstall =
    setupState.stage === 'checking_dependencies' ||
    setupState.stage === 'detecting_qbit' ||
    setupState.stage === 'fetching_release' ||
    setupState.stage === 'downloading' ||
    setupState.stage === 'verifying' ||
    setupState.stage === 'installing' ||
    setupState.stage === 'configuring';

  const isScanningOnly =
    setupState.stage === 'checking_dependencies' ||
    setupState.stage === 'detecting_qbit' ||
    setupState.stage === 'fetching_release';

  const currentRank = getInstallRank(setupState.stage);
  const isVerifiedConnected =
    torrentConnected || setupState.webUiVerifiedConnected || Boolean(webUiTestResult?.ok);

  const installStepLabels: Record<QbitSetupStage, string> = {
    idle: tq.stepChecking,
    checking_dependencies: tq.stepChecking,
    detecting_qbit: tq.stepDetecting,
    fetching_release: tq.stepDetecting,
    ready: tq.stepDetecting,
    downloading: tq.stepDownloading,
    verifying: tq.stepVerifying,
    installing: tq.stepInstalling,
    configuring: tq.stepConfiguring,
    waiting_for_close: tq.stepInstalling,
    completed: tq.stepCompleted,
    error: tq.stepChecking,
  };

  const wizardSteps: { id: OnboardingStepId; num: string; label: string }[] = [
    { id: 'welcome', num: '01', label: t.stepWelcome },
    { id: 'preferences', num: '02', label: t.stepAppearance },
    { id: 'qbit_check', num: '03', label: t.stepQbitCheck },
    { id: 'qbit_integration', num: '04', label: t.stepQbitIntegration },
    { id: 'complete', num: '05', label: t.stepReady },
  ];

  const activeStepIdx = wizardSteps.findIndex((s) => s.id === step);

  const handleInstallClick = () => {
    installStartedHereRef.current = true;
    setTorrentSkipped(false);
    void onStartQbitInstall(true);
  };

  const handleGeneratePwd = async () => {
    const generated = await onGenerateQbitPassword();
    if (generated) {
      setPassword(generated);
      setShowPassword(true);
    }
  };

  const handleVerifyWebUi = async () => {
    setIsVerifyingWebUi(true);
    setWebUiTestResult(null);
    try {
      const res = await onSaveAndVerifyWebUi({
        enabled: true,
        host: '127.0.0.1',
        port: Number(port) || 8080,
        username: username.trim() || 'admin',
        password,
      });
      if (res) {
        setWebUiTestResult(res);
      }
    } finally {
      setIsVerifyingWebUi(false);
    }
  };

  const handleLaunchIntoDesktop = (destination: 'store' | 'settings') => {
    if (isLaunchingOut) return;
    setIsLaunchingOut(true);
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(
      () => {
        onCompleteOnboarding(destination);
      },
      prefersReduced ? 40 : 360
    );
  };

  const isCustomThemeActive =
    activeTheme === 'default' && Boolean(settings.customTheme?.enabled);

  const activeThemeLabel = isCustomThemeActive
    ? `${tr.customTheme.summaryCustomPrefix} (${settings.customTheme.accentColor.toUpperCase()})`
    : currentThemeChoice === 'ps5'
    ? t.themePs5Name
    : currentThemeChoice === 'xbox'
    ? t.themeXboxName
    : currentThemeChoice === 'light'
    ? t.themeLightName
    : t.themeDarkName;

  const activeLanguageLabel =
    LANGUAGE_OPTIONS.find((l) => l.code === settings.language)?.nativeName || 'English';

  const qbitSummaryStatus = isVerifiedConnected
    ? t.summaryTorrentConnected
    : setupState.installed && !torrentSkipped
    ? t.summaryTorrentInstalled
    : t.summaryTorrentSkipped;

  const finalizingMessage =
    congratsProgress < 42
      ? t.finalizingPhase1
      : congratsProgress < 96
      ? t.finalizingPhase2
      : t.finalizingPhase3;

  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - congratsProgress / 100);

  return (
    <div
      className={`sa-app-shell h-dvh w-full overflow-y-auto flex flex-col bg-[#f4f6f9] text-slate-900 dark:bg-[#0e141b] dark:text-[#e5e9f0] ${
        isLaunchingOut ? 'sa-onboard-launch-out' : ''
      }`}
    >
      {/* Top Minimal Brand + Step Progress Header */}
      <header
        className={`relative z-20 shrink-0 border-b backdrop-blur-md transition-colors ${
          isPs5Theme
            ? 'bg-[#021233]/80 border-white/[0.12] text-white'
            : isXboxTheme
            ? 'bg-[#081a0b]/84 border-[#52e042]/20 text-[#ecfdf0]'
            : 'bg-white/90 dark:bg-[#0f141c]/90 border-slate-200 dark:border-white/[0.08]'
        }`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!brandLogoFailed ? (
              <img
                src="./img/logo01.png"
                alt="SecretArea"
                onError={() => setBrandLogoFailed(true)}
                className="h-7 sm:h-8 w-auto max-w-[120px] object-contain shrink-0"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isXboxTheme
                    ? 'bg-gradient-to-br from-[#107C10] to-[#0a520a]'
                    : 'bg-gradient-to-br from-[#0284c7] to-[#1d4ed8]'
                }`}
              >
                <Shield weight="duotone" className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-display text-[16px] sm:text-[17px] font-bold tracking-tight whitespace-nowrap">
              SecretArea
            </span>
            {desktopVersion && (
              <span
                dir="ltr"
                className="hidden sm:inline text-[11.5px] font-mono-tabular text-slate-500 dark:text-[#8b9bb4]"
              >
                · v{desktopVersion}
              </span>
            )}
          </div>

          {/* 5-Step Progress Indicator (Desktop & Tablet) */}
          <nav aria-label="Setup steps" className="hidden lg:flex items-center gap-4 min-w-0">
            {wizardSteps.map((ws, idx) => {
              const isDone = idx < activeStepIdx;
              const isCurrent = idx === activeStepIdx;
              return (
                <div key={ws.id} className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono-tabular text-[11px] font-bold w-6 h-6 rounded-full inline-flex items-center justify-center border transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? isXboxTheme
                          ? 'bg-[#107C10] border-[#6ee755] text-white'
                          : 'bg-[#0284c7] dark:bg-[#1a9fff] border-transparent text-white'
                        : 'border-slate-300 dark:border-white/[0.16] text-slate-500 dark:text-[#7f91a8]'
                    }`}
                  >
                    {isDone ? <Check weight="bold" className="w-3.5 h-3.5" /> : ws.num}
                  </span>
                  <span
                    className={`text-[12.5px] whitespace-nowrap ${
                      isCurrent
                        ? 'font-bold text-slate-900 dark:text-white'
                        : isDone
                        ? 'font-semibold text-emerald-700 dark:text-[#4ade80]'
                        : 'font-medium text-slate-500 dark:text-[#7f91a8]'
                    }`}
                  >
                    {ws.label}
                  </span>
                  {idx < wizardSteps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="text-slate-300 dark:text-white/20 ms-1"
                    >
                      /
                    </span>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Compact Language Quick-Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label={tr.nav.selectLanguage}
              className="sa-ps5-pill-group inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]"
            >
              {LANGUAGE_OPTIONS.map((opt) => {
                const selected = settings.language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => onChangeLanguage(opt.code)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold font-mono-tabular transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selected
                        ? isXboxTheme
                          ? 'bg-[#107C10] text-white'
                          : 'bg-white dark:bg-[#1a9fff] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-[#9fb0c7] dark:hover:text-white'
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Compact Step Bar */}
      <div className="lg:hidden relative z-10 px-4 pt-3 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between text-[12px] font-semibold text-slate-600 dark:text-[#9cb0c9] mb-1.5">
          <span>
            {wizardSteps[activeStepIdx]?.num} · {wizardSteps[activeStepIdx]?.label}
          </span>
          <span dir="ltr" className="font-mono-tabular">
            {activeStepIdx + 1} / {wizardSteps.length}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isXboxTheme ? 'bg-[#52e042]' : 'bg-[#0284c7] dark:bg-[#38bdf8]'
            }`}
            style={{ width: `${((activeStepIdx + 1) / wizardSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Centered Onboarding Canvas */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-center">
        {/* ======================== STEP 1: MODERN WELCOME / WHAT'S NEW ======================== */}
        {step === 'welcome' && (
          <section
            key="step-welcome"
            className="sa-onboard-step-in sa-ps5-panel relative rounded-2xl bg-white dark:bg-[#151c25] border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden"
          >
            {/* Subtle GPU-friendly radial aura */}
            <div
              aria-hidden="true"
              className="sa-welcome-aura pointer-events-none absolute -top-28 -end-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-75"
              style={{
                background: isXboxTheme
                  ? 'radial-gradient(circle, rgba(82,224,66,0.22) 0%, transparent 70%)'
                  : isCustomThemeActive
                  ? `radial-gradient(circle, ${settings.customTheme.accentColor}38 0%, transparent 70%)`
                  : 'radial-gradient(circle, rgba(26,159,255,0.22) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 p-5 sm:p-8 lg:p-11 space-y-7">
              <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-7 lg:gap-10 items-start">
                {/* Left Hero Column */}
                <div className="space-y-6">
                  <div className="sa-welcome-stagger-1 flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-[#0e141b] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center p-2.5 shrink-0 shadow-sm">
                      {!brandLogoFailed ? (
                        <img
                          src="./img/logo01.png"
                          alt="SecretArea Emblem"
                          onError={() => setBrandLogoFailed(true)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Shield
                          weight="duotone"
                          className="w-10 h-10 text-[#0284c7] dark:text-[#38bdf8]"
                        />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-semibold text-[#0284c7] dark:text-[#38bdf8]">
                        <span>{t.welcomeEyebrow}</span>
                        <span aria-hidden="true">·</span>
                        <span dir="ltr" className="font-mono-tabular">
                          v{currentVersion}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 dark:text-[#8b9bb4]">
                        {t.firstTimeNotice}
                      </p>
                    </div>
                  </div>

                  <div className="sa-welcome-stagger-2 space-y-3">
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] [text-wrap:balance]">
                      {t.welcomeTitle}
                    </h1>

                    <p className="text-[14.5px] sm:text-[15.5px] text-slate-600 dark:text-[#9cb0c9] leading-relaxed max-w-xl">
                      {t.welcomeSubtitle}
                    </p>
                  </div>

                  {/* Three Clean Setup Steps Summary */}
                  <div className="sa-welcome-stagger-3 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
                        <Palette className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
                        <span>{t.welcomeFeature1Title}</span>
                      </div>
                      <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                        {t.welcomeFeature1Desc}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
                        <DownloadSimple className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
                        <span>{t.welcomeFeature2Title}</span>
                      </div>
                      <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                        {t.welcomeFeature2Desc}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#4ade80] shrink-0" />
                        <span>{t.welcomeFeature3Title}</span>
                      </div>
                      <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                        {t.welcomeFeature3Desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: What is SecretArea? Visitor Overview */}
                <div className="sa-welcome-stagger-2 sa-ps5-subpanel rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.08] p-5 sm:p-6 space-y-4">
                  <div className="space-y-1.5 pb-3.5 border-b border-slate-200 dark:border-white/[0.07]">
                    <div className="flex items-center gap-2 text-[14.5px] font-bold text-slate-900 dark:text-white">
                      <Sparkle weight="duotone" className="w-4.5 h-4.5 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
                      <span>{t.whatIsSecretAreaTitle}</span>
                    </div>
                    <p className="text-[13px] text-slate-600 dark:text-[#9cb0c9] leading-relaxed">
                      {t.whatIsSecretAreaBody}
                    </p>
                  </div>

                  <ul className="space-y-3.5">
                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#0284c7]/10 dark:bg-[#1a9fff]/15 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center shrink-0 mt-0.5">
                        <Desktop className="w-4 h-4" />
                      </span>
                      <p className="text-[12.5px] text-slate-700 dark:text-[#cbd6e4] leading-relaxed">
                        {t.whatIsSecretAreaPoint1}
                      </p>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-[#4ade80] flex items-center justify-center shrink-0 mt-0.5">
                        <DownloadSimple className="w-4 h-4" />
                      </span>
                      <p className="text-[12.5px] text-slate-700 dark:text-[#cbd6e4] leading-relaxed">
                        {t.whatIsSecretAreaPoint2}
                      </p>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Palette className="w-4 h-4" />
                      </span>
                      <p className="text-[12.5px] text-slate-700 dark:text-[#cbd6e4] leading-relaxed">
                        {t.whatIsSecretAreaPoint3}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Visitor Step Guide */}
              <div className="p-3.5 rounded-xl bg-sky-50/80 dark:bg-[#111a26] border border-sky-200/80 dark:border-[#1a9fff]/20 text-[12.5px] text-sky-950 dark:text-[#bdd7f2] leading-relaxed">
                <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] me-1.5">
                  {t.stepGuideLabel}:
                </span>
                <span>{t.step1Guide}</span>
              </div>

              {/* Action Row */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-[#8b9bb4]">
                  <Desktop className="w-4 h-4 shrink-0 text-[#0284c7] dark:text-[#38bdf8]" />
                  <span>{t.platformHint}</span>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLaunchIntoDesktop('store')}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-slate-900 dark:text-[#9cb0c9] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t.skipAllBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('preferences')}
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[14px] font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t.getStartedBtn}</span>
                    <DirectionalArrow weight="bold" className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================== STEP 2: THEME & LANGUAGE ================== */}
        {step === 'preferences' && (
          <section
            key="step-preferences"
            className="sa-onboard-step-in sa-ps5-panel rounded-2xl bg-white dark:bg-[#151c25] border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 lg:p-10 space-y-7">
              <div className="space-y-3 border-b border-slate-200 dark:border-white/[0.08] pb-5">
                <div className="space-y-1.5">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]">
                    {t.appearanceTitle}
                  </h2>
                  <p className="text-[14px] text-slate-600 dark:text-[#9cb0c9]">
                    {t.appearanceSubtitle}
                  </p>
                </div>
                <p className="p-3 rounded-lg bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07] text-[12.5px] text-slate-700 dark:text-[#b8c7dc] leading-relaxed">
                  <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] me-1.5">
                    {t.stepGuideLabel}:
                  </span>
                  <span>{t.step2Guide}</span>
                </p>
              </div>

              {/* Theme Picker */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
                  <Palette className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
                  <span>{t.themePickerLabel}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Dark Slate */}
                  <button
                    type="button"
                    aria-pressed={currentThemeChoice === 'dark'}
                    onClick={() => onSelectTheme('dark')}
                    className={`sa-ps5-subpanel p-4 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      currentThemeChoice === 'dark'
                        ? 'bg-sky-50 dark:bg-[#162538] border-[#1a9fff] ring-1 ring-[#1a9fff]/50'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-[#11161d] dark:border-white/[0.08] dark:hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-lg bg-[#0f172a] border border-white/[0.12] text-[#38bdf8] flex items-center justify-center">
                        <Moon className="w-4.5 h-4.5" />
                      </span>
                      {currentThemeChoice === 'dark' && (
                        <Check weight="bold" className="w-4.5 h-4.5 text-[#0284c7] dark:text-[#38bdf8]" />
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900 dark:text-white">
                        {t.themeDarkName}
                      </div>
                      <div className="text-[12px] text-slate-500 dark:text-[#8b9bb4] leading-snug mt-0.5">
                        {t.themeDarkDesc}
                      </div>
                    </div>
                  </button>

                  {/* Light Mode */}
                  <button
                    type="button"
                    aria-pressed={currentThemeChoice === 'light'}
                    onClick={() => onSelectTheme('light')}
                    className={`sa-ps5-subpanel p-4 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      currentThemeChoice === 'light'
                        ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/45'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-[#11161d] dark:border-white/[0.08] dark:hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center">
                        <Sun className="w-4.5 h-4.5" />
                      </span>
                      {currentThemeChoice === 'light' && (
                        <Check weight="bold" className="w-4.5 h-4.5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900 dark:text-white">
                        {t.themeLightName}
                      </div>
                      <div className="text-[12px] text-slate-500 dark:text-[#8b9bb4] leading-snug mt-0.5">
                        {t.themeLightDesc}
                      </div>
                    </div>
                  </button>

                  {/* PS5 Theme */}
                  <button
                    type="button"
                    aria-pressed={currentThemeChoice === 'ps5'}
                    onClick={() => onSelectTheme('ps5')}
                    className={`sa-ps5-subpanel p-4 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      currentThemeChoice === 'ps5'
                        ? 'bg-[#10203a] border-[#38bdf8] ring-1 ring-[#38bdf8]/55 text-white'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-[#11161d] dark:border-white/[0.08] dark:hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-lg bg-[#0d2752] border border-[#38bdf8]/40 text-[#7cc4ff] flex items-center justify-center">
                        <Ps5Icon className="w-5 h-5" />
                      </span>
                      {currentThemeChoice === 'ps5' && (
                        <Check weight="bold" className="w-4.5 h-4.5 text-[#7cc4ff]" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-[14px] font-bold ${
                          currentThemeChoice === 'ps5' ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {t.themePs5Name}
                      </div>
                      <div
                        className={`text-[12px] leading-snug mt-0.5 ${
                          currentThemeChoice === 'ps5'
                            ? 'text-[#b7d6f2]'
                            : 'text-slate-500 dark:text-[#8b9bb4]'
                        }`}
                      >
                        {t.themePs5Desc}
                      </div>
                    </div>
                  </button>

                  {/* Xbox Nexus Theme */}
                  <button
                    type="button"
                    aria-pressed={currentThemeChoice === 'xbox'}
                    onClick={() => onSelectTheme('xbox')}
                    className={`sa-ps5-subpanel p-4 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      currentThemeChoice === 'xbox'
                        ? 'bg-[#0c2611] border-[#52e042] ring-1 ring-[#52e042]/55 text-white'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-[#11161d] dark:border-white/[0.08] dark:hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-lg bg-[#0e2e13] border border-[#52e042]/45 text-[#6ee755] flex items-center justify-center">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="w-5 h-5"
                        >
                          <circle cx="12" cy="12" r="9.2" />
                          <path d="M7.2 6.8c2.2 1.2 4.8 3.6 7.5 7.4 1 1.4 1.7 2.8 2 4" />
                          <path d="M16.8 6.8c-2.2 1.2-4.8 3.6-7.5 7.4-1 1.4-1.7 2.8-2 4" />
                        </svg>
                      </span>
                      {currentThemeChoice === 'xbox' && (
                        <Check weight="bold" className="w-4.5 h-4.5 text-[#6ee755]" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-[14px] font-bold ${
                          currentThemeChoice === 'xbox' ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {t.themeXboxName}
                      </div>
                      <div
                        className={`text-[12px] leading-snug mt-0.5 ${
                          currentThemeChoice === 'xbox'
                            ? 'text-[#b7dab9]'
                            : 'text-slate-500 dark:text-[#8b9bb4]'
                        }`}
                      >
                        {t.themeXboxDesc}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Default Theme Builder (Colors, Surface, Buttons & Cards) */}
              <CustomThemeBuilder
                compact
                language={settings.language}
                customTheme={settings.customTheme}
                hasConsoleThemeActive={isConsoleTheme}
                onUpdateCustomTheme={onUpdateCustomTheme}
                onResetCustomTheme={onResetCustomTheme}
              />

              {/* Language Picker */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 text-[13.5px] font-bold text-slate-900 dark:text-white">
                  <Globe className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
                  <span>{t.languagePickerLabel}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {LANGUAGE_OPTIONS.map((opt) => {
                    const selected = settings.language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChangeLanguage(opt.code)}
                        className={`sa-ps5-subpanel p-3.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          selected
                            ? 'bg-sky-50 dark:bg-[#162538] border-[#1a9fff] ring-1 ring-[#1a9fff]/45'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-[#11161d] dark:border-white/[0.08] dark:hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono-tabular ${
                              selected
                                ? 'bg-[#1a9fff] text-white'
                                : 'bg-slate-200 text-slate-700 dark:bg-white/[0.08] dark:text-[#9fb0c7]'
                            }`}
                          >
                            {opt.shortLabel}
                          </span>
                          <span className="text-[10.5px] font-semibold text-slate-500 dark:text-[#8b9bb4]">
                            {opt.direction === 'rtl' ? ts.rtlBadge : ts.ltrBadge}
                          </span>
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
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-slate-500 dark:text-[#8b9bb4]">
                  {t.settingsEditableNote}
                </p>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep('welcome')}
                    className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] text-[13px] font-semibold text-slate-700 dark:text-[#cbd6e4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BackArrow className="w-4 h-4 shrink-0" />
                    <span>{t.backBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('qbit_check')}
                    className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[13.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t.continueBtn}</span>
                    <DirectionalArrow weight="bold" className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================ STEP 3: QBITTORRENT CHECK / INSTALL ================ */}
        {step === 'qbit_check' && (
          <section
            key="step-qbit-check"
            className="sa-onboard-step-in sa-ps5-panel rounded-2xl bg-white dark:bg-[#151c25] border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-5">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#0e141b] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                    {!qbitLogoFailed ? (
                      <img
                        src={QBIT_OFFICIAL_LOGO_URL}
                        alt="qBittorrent logo"
                        referrerPolicy="no-referrer"
                        onError={() => setQbitLogoFailed(true)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Magnet weight="duotone" className="w-6 h-6 text-[#0284c7] dark:text-[#38bdf8]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white [text-wrap:balance]">
                      {t.qbitCheckTitle}
                    </h2>
                    <p className="text-[13.5px] text-slate-600 dark:text-[#9cb0c9]">
                      {t.qbitCheckSubtitle}
                    </p>
                  </div>
                </div>

                {isDesktopApp && (
                  <button
                    type="button"
                    disabled={isBusyInstall}
                    onClick={() => void onRecheckQbit()}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] disabled:opacity-50 text-[12.5px] font-semibold text-slate-700 dark:text-[#cbd6e4] transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <ArrowClockwise className={`w-4 h-4 ${isScanningOnly ? 'animate-spin' : ''}`} />
                    <span>{tq.recheckBtn}</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07] text-[12.5px] text-slate-700 dark:text-[#b8c7dc] leading-relaxed">
                <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] me-1.5">
                  {t.stepGuideLabel}:
                </span>
                <span>{t.step3Guide}</span>
              </div>

              {!isDesktopApp && (
                <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-[#121e2e] border border-sky-200 dark:border-[#1a9fff]/30 text-[12.5px] text-sky-900 dark:text-[#b7d6f2]">
                  {tq.webPreviewNotice}
                </div>
              )}

              {/* Environment Readout */}
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07]">
                <div>
                  <dt className="text-[11.5px] font-medium text-slate-500 dark:text-[#7f91a8]">
                    {tq.installedLabel}
                  </dt>
                  <dd className="mt-1 text-[14px] font-bold font-mono-tabular text-slate-900 dark:text-white">
                    {setupState.installed
                      ? setupState.installedVersion
                        ? `v${setupState.installedVersion}`
                        : 'qBittorrent'
                      : tq.notInstalledValue}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11.5px] font-medium text-slate-500 dark:text-[#7f91a8]">
                    {tq.latestLabel}
                  </dt>
                  <dd className="mt-1 text-[14px] font-bold font-mono-tabular text-[#0284c7] dark:text-[#38bdf8]">
                    {setupState.latestRelease?.version ? `v${setupState.latestRelease.version}` : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11.5px] font-medium text-slate-500 dark:text-[#7f91a8]">
                    {tq.processLabel}
                  </dt>
                  <dd
                    className={`mt-1 text-[14px] font-bold ${
                      setupState.isRunning
                        ? 'text-emerald-700 dark:text-[#4ade80]'
                        : 'text-slate-600 dark:text-[#9cb0c9]'
                    }`}
                  >
                    {setupState.isRunning ? tq.processRunning : tq.processStopped}
                  </dd>
                </div>
              </dl>

              {/* Scanning state */}
              {isScanningOnly && !setupState.installed && (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-[#121e2e] border border-sky-200 dark:border-[#1a9fff]/30 flex items-center gap-3 text-[13.5px] font-medium text-sky-900 dark:text-[#cbe3fb]">
                  <SpinnerGap className="w-5 h-5 animate-spin text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
                  <span>{t.scanningText}</span>
                </div>
              )}

              {/* Branch A: qBittorrent ALREADY Installed before SecretArea.exe */}
              {!isScanningOnly && setupState.installed && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-300 dark:border-emerald-500/35 flex items-start gap-3 text-emerald-950 dark:text-emerald-100">
                    <CheckCircle weight="fill" className="w-5 h-5 text-emerald-600 dark:text-[#4ade80] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-[14.5px] font-bold">
                        {justInstalledBanner ? t.installCompleteAdvanceMsg : t.alreadyInstalledTitle}
                      </div>
                      <p className="text-[13px] opacity-90 leading-relaxed">
                        {t.alreadyInstalledDesc}
                      </p>
                      {setupState.executablePath && (
                        <p dir="ltr" className="text-[11.5px] font-mono-tabular opacity-75 pt-0.5 break-all">
                          {setupState.executablePath}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isBusyInstall}
                      onClick={() => {
                        setTorrentSkipped(false);
                        setStep('qbit_integration');
                      }}
                      className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] disabled:opacity-55 text-white text-[13.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{t.goIntegrationBtn}</span>
                      <DirectionalArrow weight="bold" className="w-4 h-4 shrink-0" />
                    </button>

                    {isDesktopApp && setupState.actionNeeded === 'update_available' && (
                      <button
                        type="button"
                        disabled={isBusyInstall}
                        onClick={handleInstallClick}
                        className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] text-[13px] font-semibold text-slate-800 dark:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <DownloadSimple className="w-4 h-4" />
                        <span>{t.updateFirstBtn}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Branch B: qBittorrent NOT Installed Yet */}
              {!isScanningOnly && !setupState.installed && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      setupState.stage === 'error'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
                        : 'bg-amber-50 dark:bg-amber-950/25 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-100'
                    }`}
                  >
                    <WarningCircle weight="fill" className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-[14.5px] font-bold">
                        {setupState.stage === 'error' && setupState.error
                          ? setupState.error
                          : t.notInstalledTitle}
                      </div>
                      <p className="text-[13px] opacity-90 leading-relaxed">
                        {t.notInstalledDesc}
                      </p>
                      {setupState.latestRelease?.assetName && (
                        <p dir="ltr" className="text-[11.5px] font-mono-tabular opacity-80 pt-0.5 truncate">
                          {setupState.latestRelease.assetName}
                          {setupState.latestRelease.assetSizeBytes > 0
                            ? ` · ${formatBytes(setupState.latestRelease.assetSizeBytes)}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 7-Stage Pipeline Checklist + Download Progress */}
                  {(isBusyInstall || setupState.verification || setupState.stage === 'error') && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {ORDERED_INSTALL_STEPS.map((stepKey, idx) => {
                          const isDone =
                            setupState.stage === 'completed' ||
                            (currentRank > idx && setupState.stage !== 'error');
                          const isCurrent =
                            setupState.stage !== 'completed' &&
                            setupState.stage !== 'error' &&
                            currentRank === idx &&
                            isBusyInstall;
                          return (
                            <div
                              key={stepKey}
                              className={`flex items-center gap-2 text-[12px] ${
                                isDone
                                  ? 'text-emerald-700 dark:text-[#4ade80] font-semibold'
                                  : isCurrent
                                  ? 'text-[#0284c7] dark:text-[#38bdf8] font-semibold'
                                  : 'text-slate-500 dark:text-[#7f91a8]'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle weight="fill" className="w-4 h-4 shrink-0" />
                              ) : isCurrent ? (
                                <SpinnerGap className="w-4 h-4 shrink-0 animate-spin" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-current/40 inline-flex items-center justify-center text-[10px] font-mono-tabular shrink-0">
                                  {idx + 1}
                                </span>
                              )}
                              <span className="truncate">{installStepLabels[stepKey]}</span>
                            </div>
                          );
                        })}
                      </div>

                      {setupState.stage === 'downloading' && setupState.downloadProgress && (
                        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.07] space-y-1.5">
                          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-[#0b0f14] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-200"
                              style={{
                                width: `${Math.min(100, Math.max(0, setupState.downloadProgress.percent))}%`,
                              }}
                            />
                          </div>
                          <div
                            dir="ltr"
                            className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-mono-tabular text-slate-600 dark:text-[#9cb0c9]"
                          >
                            <span>
                              {formatBytes(setupState.downloadProgress.downloadedBytes)} /{' '}
                              {setupState.downloadProgress.totalBytes > 0
                                ? formatBytes(setupState.downloadProgress.totalBytes)
                                : '—'}
                            </span>
                            <span>
                              {setupState.downloadProgress.percent.toFixed(1)}% · ↓{' '}
                              {formatDownloadSpeed(setupState.downloadProgress.speedBytesPerSec)} · ETA{' '}
                              {formatEta(setupState.downloadProgress.etaSeconds)}
                            </span>
                          </div>
                        </div>
                      )}

                      {setupState.verification && (
                        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.07] flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-emerald-700 dark:text-[#4ade80] font-semibold">
                          {setupState.verification.sha256Verified && (
                            <span className="inline-flex items-center gap-1.5">
                              <ShieldCheck weight="fill" className="w-4 h-4 shrink-0" />
                              <span>{tq.shaVerifiedLabel}</span>
                            </span>
                          )}
                          {setupState.verification.signatureVerified ? (
                            <span className="inline-flex items-center gap-1.5">
                              <ShieldCheck weight="fill" className="w-4 h-4 shrink-0" />
                              <span>
                                {tq.sigVerifiedLabel}
                                {setupState.verification.publisher
                                  ? ` (${setupState.verification.publisher})`
                                  : ''}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-600 dark:text-[#9cb0c9] font-normal">
                              {tq.unsignedVerifiedNote}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {isDesktopApp && (
                    <p className="text-[12px] text-slate-500 dark:text-[#8b9bb4] leading-relaxed">
                      {tq.consentNote}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5">
                    {isDesktopApp ? (
                      <button
                        type="button"
                        disabled={isBusyInstall}
                        onClick={handleInstallClick}
                        className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] disabled:opacity-55 text-white text-[13.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <DownloadSimple weight="bold" className="w-4 h-4 shrink-0" />
                        <span>
                          {setupState.stage === 'error' ? tq.retryBtn : t.installAndNextBtn}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setTorrentSkipped(false);
                          setStep('qbit_integration');
                        }}
                        className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[13.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{t.goIntegrationBtn}</span>
                        <DirectionalArrow weight="bold" className="w-4 h-4 shrink-0" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onOpenOfficialQbitDownload}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-semibold text-slate-700 dark:text-[#cbd6e4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <ArrowSquareOut className="w-4 h-4" />
                      <span>{tq.officialDownloadBtn}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isBusyInstall}
                  onClick={() => setStep('preferences')}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] disabled:opacity-50 text-[13px] font-semibold text-slate-700 dark:text-[#cbd6e4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BackArrow className="w-4 h-4 shrink-0" />
                  <span>{t.backBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={isBusyInstall}
                  onClick={() => {
                    setTorrentSkipped(true);
                    setStep('complete');
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 dark:text-[#9cb0c9] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.skipTorrentBtn}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============== STEP 4: QBITTORRENT INTEGRATION SETTINGS ============== */}
        {step === 'qbit_integration' && (
          <section
            key="step-qbit-integration"
            className="sa-onboard-step-in sa-ps5-panel rounded-2xl bg-white dark:bg-[#151c25] border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-5">
                <div className="space-y-1 min-w-0 flex-1">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white [text-wrap:balance]">
                    {t.integrationTitle}
                  </h2>
                  <p className="text-[13.5px] text-slate-600 dark:text-[#9cb0c9]">
                    {t.integrationSubtitle}
                  </p>
                </div>

                {isDesktopApp && setupState.installed && (
                  <button
                    type="button"
                    onClick={() => void onLaunchQbitClient()}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-semibold text-slate-800 dark:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play weight="fill" className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4ade80]" />
                    <span>{tq.launchQbitBtn}</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07] text-[12.5px] text-slate-700 dark:text-[#b8c7dc] leading-relaxed">
                <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] me-1.5">
                  {t.stepGuideLabel}:
                </span>
                <span>{t.step4Guide}</span>
              </div>

              {isVerifiedConnected && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/35 text-[13px] font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5">
                  <CheckCircle weight="fill" className="w-5 h-5 shrink-0" />
                  <span>{tq.webUiConnectedMsg}</span>
                </div>
              )}

              {/* Quick Guide */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07] space-y-2">
                <div className="text-[13px] font-bold text-slate-900 dark:text-white">
                  {setupState.webUiConfig.webUiEnabled
                    ? tq.webUiDetectedEnabled
                    : tq.webUiNotEnabledHint}
                </div>
                <ol className="space-y-1 text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
                  <li>{tq.webUiGuide1}</li>
                  <li>{tq.webUiGuide2}</li>
                  <li>{tq.webUiGuide3}</li>
                  <li>{tq.webUiGuide4}</li>
                  <li>{tq.webUiGuide5}</li>
                </ol>
              </div>

              {/* Credentials Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-slate-700 dark:text-[#b8c6d8]">
                    {ts.torrentHostLabel}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    readOnly
                    value="127.0.0.1"
                    className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#0c1016] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-mono-tabular text-slate-600 dark:text-[#9cb0c9] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="onboard-qbit-port"
                    className="block text-[12px] font-semibold text-slate-700 dark:text-[#b8c6d8]"
                  >
                    {ts.torrentPortLabel}
                  </label>
                  <input
                    id="onboard-qbit-port"
                    type="number"
                    dir="ltr"
                    min={1}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value) || 8080)}
                    className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0c1016] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-mono-tabular text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="onboard-qbit-user"
                    className="block text-[12px] font-semibold text-slate-700 dark:text-[#b8c6d8]"
                  >
                    {ts.torrentUsernameLabel}
                  </label>
                  <input
                    id="onboard-qbit-user"
                    type="text"
                    dir="ltr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white dark:bg-[#0c1016] border border-slate-200 dark:border-white/[0.1] text-[12.5px] text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="onboard-qbit-pass"
                    className="block text-[12px] font-semibold text-slate-700 dark:text-[#b8c6d8]"
                  >
                    {ts.torrentPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="onboard-qbit-pass"
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        torrentConfig.hasSavedPassword ? ts.torrentPasswordSavedPlaceholder : '••••••••'
                      }
                      className="w-full min-h-[40px] ps-3 pe-9 py-2 rounded-lg bg-white dark:bg-[#0c1016] border border-slate-200 dark:border-white/[0.1] text-[12.5px] text-slate-900 dark:text-white focus:border-[#0284c7] dark:focus:border-[#38bdf8] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11.5px] text-slate-500 dark:text-[#8b9bb4]">
                {t.hostLoopbackHint}
              </p>

              {webUiTestResult && !webUiTestResult.ok && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-500/40 text-[12px] text-rose-800 dark:text-rose-200 space-y-0.5">
                  <p className="font-semibold">{webUiTestResult.message}</p>
                  {webUiTestResult.hint && <p className="opacity-90">{webUiTestResult.hint}</p>}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleGeneratePwd}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] text-[12.5px] font-semibold text-slate-800 dark:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4]" />
                  <span>{tq.generatePasswordBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={isVerifyingWebUi}
                  onClick={handleVerifyWebUi}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerifyingWebUi ? tq.verifyingBtn : tq.saveAndVerifyBtn}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('qbit_check')}
                  className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] text-[13px] font-semibold text-slate-700 dark:text-[#cbd6e4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BackArrow className="w-4 h-4 shrink-0" />
                  <span>{t.backBtn}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {!isVerifiedConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        setTorrentSkipped(true);
                        setStep('complete');
                      }}
                      className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 dark:text-[#9cb0c9] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{t.skipIntegrationBtn}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTorrentSkipped(false);
                      setStep('complete');
                    }}
                    className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] text-white text-[13.5px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t.finishSetupBtn}</span>
                    <DirectionalArrow weight="bold" className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============= STEP 5: ANIMATED CONGRATULATIONS & LAUNCH ============= */}
        {step === 'complete' && (
          <section
            key="step-complete"
            className="sa-onboard-step-in sa-ps5-panel rounded-2xl bg-white dark:bg-[#151c25] border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden"
          >
            <div className="p-6 sm:p-10 lg:p-12 space-y-7 text-center">
              {/* Animated Radial Progress Ring -> Checkmark Badge */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg
                    viewBox="0 0 112 112"
                    className="w-full h-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="56"
                      cy="56"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      className="text-slate-200 dark:text-white/[0.09]"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringDashOffset}
                      className={
                        congratsProgress >= 100
                          ? 'text-emerald-500 dark:text-[#4ade80]'
                          : isXboxTheme
                          ? 'text-[#52e042]'
                          : 'text-[#0284c7] dark:text-[#38bdf8]'
                      }
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {congratsProgress >= 100 ? (
                      <div className="sa-onboard-ring-pop flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-[#4ade80]">
                        <Sparkle weight="fill" className="w-8 h-8" />
                      </div>
                    ) : (
                      <span
                        dir="ltr"
                        className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white"
                      >
                        {congratsProgress}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-w-xl mx-auto">
                  <p className="text-[12.5px] font-semibold text-emerald-700 dark:text-[#4ade80]">
                    {congratsProgress >= 100 ? t.congratsEyebrow : finalizingMessage}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]">
                    {congratsProgress >= 100 ? t.congratsTitle : finalizingMessage}
                  </h2>
                  {congratsProgress >= 100 && (
                    <p className="text-[14.5px] text-slate-600 dark:text-[#9cb0c9] leading-relaxed">
                      {t.congratsSubtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Configuration Summary Grid */}
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-start p-4 rounded-xl bg-slate-50 dark:bg-[#10161e] border border-slate-200 dark:border-white/[0.07]">
                <div>
                  <dt className="text-[11.5px] font-medium text-slate-500 dark:text-[#7f91a8]">
                    {t.summaryThemeLabel}
                  </dt>
                  <dd className="mt-0.5 text-[13.5px] font-bold text-slate-900 dark:text-white">
                    {activeThemeLabel}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11.5px] font-medium text-slate-500 dark:text-[#7f91a8]">
                    {t.summaryLanguageLabel}
                  </dt>
                  <dd className="mt-0.5 text-[13.5px] font-bold text-slate-900 dark:text-white">
                    {activeLanguageLabel}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11.5px] font-medium text-slate-500 dark:text-[#7f91a8]">
                    {t.summaryTorrentLabel}
                  </dt>
                  <dd
                    className={`mt-0.5 text-[13.5px] font-bold ${
                      isVerifiedConnected
                        ? 'text-emerald-700 dark:text-[#4ade80]'
                        : 'text-slate-700 dark:text-[#cbd6e4]'
                    }`}
                  >
                    {qbitSummaryStatus}
                  </dd>
                </div>
              </dl>

              {/* Settings Reminder & Step Guide */}
              <div className="max-w-2xl mx-auto p-3.5 rounded-xl bg-sky-50 dark:bg-[#121e2e] border border-sky-200 dark:border-[#1a9fff]/25 text-[12.5px] text-sky-900 dark:text-[#b7d6f2] leading-relaxed space-y-1">
                <p>
                  <span className="font-bold text-[#0284c7] dark:text-[#38bdf8] me-1.5">
                    {t.stepGuideLabel}:
                  </span>
                  <span>{t.step5Guide}</span>
                </p>
                <p className="opacity-90">{t.changeLaterHint}</p>
              </div>

              {/* Primary Launch CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={congratsProgress < 100 || isLaunchingOut}
                  onClick={() => handleLaunchIntoDesktop('settings')}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.11] border border-slate-200 dark:border-white/[0.1] disabled:opacity-45 text-[13px] font-semibold text-slate-800 dark:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Gear className="w-4 h-4" />
                  <span>{t.openSettingsPageBtn}</span>
                </button>

                <button
                  type="button"
                  disabled={congratsProgress < 100 || isLaunchingOut}
                  onClick={() => handleLaunchIntoDesktop('store')}
                  className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff] disabled:opacity-45 text-white text-[14px] font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.enterAppBtn}</span>
                  <DirectionalArrow weight="bold" className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
