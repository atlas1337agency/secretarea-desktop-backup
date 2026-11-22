import {
  AppWindow,
  ArrowCounterClockwise,
  Check,
  CursorClick,
  DownloadSimple,
  Globe,
  Laptop,
  Moon,
  MusicNotes,
  Power,
  SpeakerHigh,
  SpeakerLow,
  SpeakerSlash,
  Sun,
} from '@phosphor-icons/react';
import type { AppLanguage, LauncherSettings } from '../services/launcherSettings';
import { getTranslations, LANGUAGE_OPTIONS } from '../i18n/translations';
import { Ps5Icon } from './SectionBadge';

interface SettingsViewProps {
  settings: LauncherSettings;
  isDesktopApp: boolean;
  isUpdatingAutoLaunch?: boolean;
  onChangeLanguage: (language: AppLanguage) => void;
  onToggleStartWithComputer: (enabled: boolean) => void;
  onToggleEnableCanRunIt: (enabled: boolean) => void;
  onToggleCompactNavbar: (enabled: boolean) => void;
  onToggleLightMode: (enabled: boolean) => void;
  onToggleAlwaysPs5Theme: (enabled: boolean) => void;
  onToggleAlwaysXboxTheme: (enabled: boolean) => void;
  onToggleAmbientMusic: (enabled: boolean) => void;
  onToggleUiClickSounds: (enabled: boolean) => void;
  onChangeSoundVolume: (volume: number) => void;
  onPreviewSoundVolume?: () => void;
  onResetDefaults: () => void;
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

export function SettingsView({
  settings,
  isDesktopApp,
  isUpdatingAutoLaunch = false,
  onChangeLanguage,
  onToggleStartWithComputer,
  onToggleEnableCanRunIt,
  onToggleCompactNavbar,
  onToggleLightMode,
  onToggleAlwaysPs5Theme,
  onToggleAlwaysXboxTheme,
  onToggleAmbientMusic,
  onToggleUiClickSounds,
  onChangeSoundVolume,
  onPreviewSoundVolume,
  onResetDefaults,
}: SettingsViewProps) {
  const t = getTranslations(settings.language).settings;
  const hasConsoleTheme = settings.alwaysPs5Theme || settings.alwaysXboxTheme;

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
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.pageTitle}
            </h1>
            <p className="text-[12.5px] text-slate-600 dark:text-[#8b9bb4]">
              {t.pageSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-[#212a37] dark:hover:bg-[#2c3849] border border-slate-300 dark:border-white/[0.08] text-[12px] font-semibold text-slate-700 hover:text-slate-900 dark:text-[#c6d4df] dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            <ArrowCounterClockwise className="w-3.5 h-3.5" />
            <span>{t.resetDefaults}</span>
          </button>
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
      </div>
    </div>
  );
}

