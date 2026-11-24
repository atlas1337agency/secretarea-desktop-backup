import {
  ArrowCounterClockwise,
  Check,
  Drop,
  Sparkle,
  Swatches,
} from '@phosphor-icons/react';
import {
  CUSTOM_THEME_ACCENT_PRESETS,
  CUSTOM_THEME_SURFACE_PALETTES,
  type AppLanguage,
  type CustomThemeButtonStyle,
  type CustomThemeCardRadius,
  type CustomThemeConfig,
  type CustomThemeSurfaceStyle,
} from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface CustomThemeBuilderProps {
  language: AppLanguage;
  customTheme: CustomThemeConfig;
  hasConsoleThemeActive: boolean;
  onUpdateCustomTheme: (patch: Partial<CustomThemeConfig>) => void;
  onResetCustomTheme: () => void;
  compact?: boolean;
}

export function CustomThemeBuilder({
  language,
  customTheme,
  hasConsoleThemeActive,
  onUpdateCustomTheme,
  onResetCustomTheme,
  compact = false,
}: CustomThemeBuilderProps) {
  const tr = getTranslations(language);
  const t = tr.customTheme;
  const ts = tr.settings;

  const surfaceOptions: { id: CustomThemeSurfaceStyle; label: string }[] = [
    { id: 'midnight', label: t.surfaceMidnight },
    { id: 'obsidian', label: t.surfaceObsidian },
    { id: 'abyss', label: t.surfaceAbyss },
    { id: 'daylight', label: t.surfaceDaylight },
  ];

  const buttonOptions: { id: CustomThemeButtonStyle; label: string; radiusClass: string }[] = [
    { id: 'rounded', label: t.btnRounded, radiusClass: 'rounded-lg' },
    { id: 'pill', label: t.btnPill, radiusClass: 'rounded-full' },
    { id: 'sharp', label: t.btnSharp, radiusClass: 'rounded-[4px]' },
  ];

  const cardOptions: { id: CustomThemeCardRadius; label: string; previewRadius: string }[] = [
    { id: 'sharp', label: t.cardSharp, previewRadius: '6px' },
    { id: 'medium', label: t.cardMedium, previewRadius: '12px' },
    { id: 'soft', label: t.cardSoft, previewRadius: '20px' },
  ];

  const activeSurface = CUSTOM_THEME_SURFACE_PALETTES[customTheme.surfaceStyle];
  const previewBtnRadius =
    customTheme.buttonStyle === 'pill'
      ? '9999px'
      : customTheme.buttonStyle === 'sharp'
      ? '4px'
      : '10px';
  const previewCardRadius =
    customTheme.cardRadius === 'sharp'
      ? '6px'
      : customTheme.cardRadius === 'soft'
      ? '20px'
      : '12px';

  return (
    <div
      className={`rounded-xl border transition-colors ${
        customTheme.enabled && !hasConsoleThemeActive
          ? 'bg-slate-50/90 dark:bg-[#111824] border-sky-400/50 dark:border-white/[0.14]'
          : 'bg-slate-50 dark:bg-[#11161f] border-slate-200 dark:border-white/[0.08]'
      } ${compact ? 'p-4 sm:p-5 space-y-4' : 'p-4 sm:p-5 space-y-5'}`}
    >
      {/* Header & Enable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ backgroundColor: customTheme.accentColor }}
          >
            <Swatches weight="duotone" className="w-4.5 h-4.5" />
          </span>
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-[14px] sm:text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
              {t.sectionTitle}
            </h3>
            <p className="text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
              {t.sectionSubtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onResetCustomTheme}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-[11.5px] font-semibold text-slate-700 dark:text-[#c6d4df] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowCounterClockwise className="w-3.5 h-3.5" />
            <span>{t.resetBtn}</span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={customTheme.enabled}
            onClick={() => onUpdateCustomTheme({ enabled: !customTheme.enabled })}
            className="inline-flex items-center gap-2.5 min-h-[36px] shrink-0 cursor-pointer group focus:outline-none"
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap ${
                customTheme.enabled
                  ? 'text-[#0284c7] dark:text-[#66c0f4]'
                  : 'text-slate-500 dark:text-[#8b9bb4]'
              }`}
            >
              {customTheme.enabled ? ts.activeLabel : ts.inactiveLabel}
            </span>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200 ${
                customTheme.enabled
                  ? 'border-transparent'
                  : 'bg-slate-200 border-slate-300 dark:bg-[#0e131b] dark:border-white/[0.14]'
              }`}
              style={
                customTheme.enabled
                  ? { backgroundColor: customTheme.accentColor }
                  : undefined
              }
            >
              <span
                className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  customTheme.enabled ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {hasConsoleThemeActive && (
        <p className="text-[11.5px] text-amber-700 dark:text-amber-300">
          {t.consoleOverrideNote}
        </p>
      )}

      {/* Surface Palette Picker + Accent Color Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Base Surface */}
        <div className="space-y-2">
          <div className="text-[12.5px] font-semibold text-slate-800 dark:text-[#dce4ee]">
            {t.surfaceLabel}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
            {surfaceOptions.map((surf) => {
              const palette = CUSTOM_THEME_SURFACE_PALETTES[surf.id];
              const selected = customTheme.enabled && customTheme.surfaceStyle === surf.id;
              return (
                <button
                  key={surf.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onUpdateCustomTheme({
                      enabled: true,
                      surfaceStyle: surf.id,
                    })
                  }
                  className={`p-2.5 rounded-lg border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                    selected
                      ? 'bg-white dark:bg-[#172231] border-[#1a9fff] ring-1 ring-[#1a9fff]/45'
                      : 'bg-white/75 dark:bg-[#0e141c] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2]'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-md border border-black/15 dark:border-white/15 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${palette.swatchTop} 0%, ${palette.swatchBottom} 100%)`,
                    }}
                  />
                  <span className="text-[12px] font-semibold text-slate-800 dark:text-white truncate">
                    {surf.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Swatches + Native Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-semibold text-slate-800 dark:text-[#dce4ee]">
              {t.accentColorLabel}
            </span>
            <span
              dir="ltr"
              className="text-[11.5px] font-mono-tabular font-semibold text-slate-500 dark:text-[#8b9bb4]"
            >
              {customTheme.accentColor.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CUSTOM_THEME_ACCENT_PRESETS.map((preset) => {
              const selected =
                customTheme.enabled &&
                customTheme.accentColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-label={preset.id}
                  onClick={() =>
                    onUpdateCustomTheme({
                      enabled: true,
                      accentColor: preset.hex,
                      secondaryColor: preset.secondary,
                    })
                  }
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border ${
                    selected
                      ? 'border-slate-900 dark:border-white ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#11161f] ring-sky-400/60'
                      : 'border-black/15 dark:border-white/15'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {selected && <Check weight="bold" className="w-4 h-4 text-white drop-shadow" />}
                </button>
              );
            })}

            <label className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#0e141c] border border-slate-200 dark:border-white/[0.1] text-[11.5px] font-semibold text-slate-700 dark:text-[#c6d4df] cursor-pointer hover:border-slate-300 dark:hover:border-white/[0.22]">
              <input
                type="color"
                value={customTheme.accentColor}
                onChange={(e) =>
                  onUpdateCustomTheme({
                    enabled: true,
                    accentColor: e.target.value,
                    secondaryColor: e.target.value,
                  })
                }
                aria-label={t.customHexLabel}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
              <span>{t.customHexLabel}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Geometry Controls: Button Style + Card Radius + Glass Blur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {/* Button Style */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]">
            {t.buttonStyleLabel}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {buttonOptions.map((opt) => {
              const selected = customTheme.buttonStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onUpdateCustomTheme({
                      enabled: true,
                      buttonStyle: opt.id,
                    })
                  }
                  className={`min-h-[38px] px-2 py-1.5 ${opt.radiusClass} border text-[11.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selected
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#0e141c] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#b8c6d8] hover:border-slate-300 dark:hover:border-white/[0.2]'
                  }`}
                  style={
                    selected ? { backgroundColor: customTheme.accentColor } : undefined
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Radius */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]">
            {t.cardRadiusLabel}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {cardOptions.map((opt) => {
              const selected = customTheme.cardRadius === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onUpdateCustomTheme({
                      enabled: true,
                      cardRadius: opt.id,
                    })
                  }
                  style={{
                    borderRadius: opt.previewRadius,
                    ...(selected ? { backgroundColor: customTheme.accentColor } : {}),
                  }}
                  className={`min-h-[38px] px-2 py-1.5 border text-[11.5px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selected
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#0e141c] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-[#b8c6d8] hover:border-slate-300 dark:hover:border-white/[0.2]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Frosted Glass Blur */}
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700 dark:text-[#c6d4df]">
            {t.glassBlurLabel}
          </div>
          <button
            type="button"
            aria-pressed={customTheme.glassBlur}
            onClick={() =>
              onUpdateCustomTheme({
                enabled: true,
                glassBlur: !customTheme.glassBlur,
              })
            }
            className={`w-full min-h-[38px] px-3 py-1.5 rounded-lg border flex items-center justify-between gap-2 text-[12px] font-semibold transition-colors cursor-pointer ${
              customTheme.glassBlur
                ? 'bg-white dark:bg-[#172231] border-sky-400/60 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-[#0e141c] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#9cb0c9]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 truncate">
              <Drop className="w-4 h-4 shrink-0" style={{ color: customTheme.accentColor }} />
              <span className="truncate">{t.glassBlurDesc}</span>
            </span>
            <span className="font-mono-tabular text-[11px] shrink-0">
              {customTheme.glassBlur ? ts.activeLabel : ts.inactiveLabel}
            </span>
          </button>
        </div>
      </div>

      {/* Live Miniature Theme Preview */}
      <div
        className="p-3.5 sm:p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          backgroundColor: activeSurface.surface,
          borderColor: activeSurface.border,
          borderRadius: previewCardRadius,
          color: activeSurface.isDark ? '#f1f5f9' : '#0f172a',
        }}
      >
        <div className="space-y-0.5 min-w-0">
          <div
            className="text-[10.5px] font-bold uppercase tracking-[0.08em]"
            style={{ color: customTheme.accentColor }}
          >
            {t.previewLabel}
          </div>
          <div className="text-[13.5px] font-bold flex items-center gap-1.5">
            <Sparkle weight="fill" className="w-4 h-4 shrink-0" style={{ color: customTheme.accentColor }} />
            <span className="truncate">{t.previewTitle}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center justify-center min-h-[34px] px-3.5 py-1 text-[12px] font-semibold text-white whitespace-nowrap"
            style={{
              backgroundColor: customTheme.accentColor,
              borderRadius: previewBtnRadius,
            }}
          >
            {t.previewPrimaryBtn}
          </span>
          <span
            className="inline-flex items-center justify-center min-h-[34px] px-3.5 py-1 border text-[12px] font-semibold whitespace-nowrap"
            style={{
              borderColor: activeSurface.border,
              backgroundColor: activeSurface.subsurface,
              borderRadius: previewBtnRadius,
              color: activeSurface.isDark ? '#cbd5e1' : '#334155',
            }}
          >
            {t.previewSecondaryBtn}
          </span>
        </div>
      </div>
    </div>
  );
}
