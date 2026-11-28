import type {
  CloseBehaviorMode,
  EffectivePerformanceConfig,
  PerformanceAdvancedSettings,
  PerformanceMode,
} from '../types';
import {
  getAccessibleTextOnAccent,
  OS_THEME_PRESETS,
  type OsThemeColorPalette,
  type ResolvedOsTheme,
} from './themeContrast';

export type { ResolvedOsTheme, OsThemeColorPalette };

export type AppLanguage = 'en' | 'fr' | 'es' | 'ar';
export type AppThemeMode = 'default' | 'ps5' | 'xbox';
export type OsThemePreference = 'auto' | ResolvedOsTheme;
export type AppearanceMode = 'system' | 'dark' | 'light';
export type AnimationMode = 'full' | 'subtle' | 'reduced';

export type CustomThemeSurfaceStyle = 'midnight' | 'obsidian' | 'abyss' | 'daylight';
export type CustomThemeButtonStyle = 'rounded' | 'pill' | 'sharp';
export type CustomThemeCardRadius = 'sharp' | 'medium' | 'soft';

export interface CustomThemeConfig {
  enabled: boolean;
  accentColor: string;
  secondaryColor: string;
  surfaceStyle: CustomThemeSurfaceStyle;
  buttonStyle: CustomThemeButtonStyle;
  cardRadius: CustomThemeCardRadius;
  glassBlur: boolean;
}

export interface LauncherSettings {
  language: AppLanguage;
  startWithComputer: boolean;
  closeBehavior: CloseBehaviorMode;
  enableCanRunIt: boolean;
  compactNavbar: boolean;
  lightMode: boolean;
  osThemePreference: OsThemePreference;
  appearanceMode: AppearanceMode;
  animationMode: AnimationMode;
  alwaysPs5Theme: boolean;
  alwaysXboxTheme: boolean;
  ambientMusicEnabled: boolean;
  uiClickSoundsEnabled: boolean;
  customCursorEnabled: boolean;
  soundVolume: number;
  customTheme: CustomThemeConfig;
  performanceMode: PerformanceMode;
  performanceAdvanced: PerformanceAdvancedSettings;
}

export const CUSTOM_THEME_ACCENT_PRESETS: { id: string; hex: string; secondary: string }[] = [
  { id: 'sky', hex: '#1a9fff', secondary: '#38bdf8' },
  { id: 'indigo', hex: '#6366f1', secondary: '#818cf8' },
  { id: 'rose', hex: '#f43f5e', secondary: '#fb7185' },
  { id: 'emerald', hex: '#10b981', secondary: '#34d399' },
  { id: 'amber', hex: '#f59e0b', secondary: '#fbbf24' },
  { id: 'violet', hex: '#a855f7', secondary: '#c084fc' },
  { id: 'orange', hex: '#f97316', secondary: '#fb923c' },
  { id: 'teal', hex: '#14b8a6', secondary: '#2dd4bf' },
];

export const CUSTOM_THEME_SURFACE_PALETTES: Record<
  CustomThemeSurfaceStyle,
  {
    isDark: boolean;
    canvas: string;
    surface: string;
    surfaceGlass: string;
    subsurface: string;
    subsurfaceGlass: string;
    heroBg: string;
    border: string;
    borderStrong: string;
    textPrimary: string;
    textMuted: string;
    swatchTop: string;
    swatchBottom: string;
  }
> = {
  midnight: {
    isDark: true,
    canvas: '#0e141b',
    surface: '#161e29',
    surfaceGlass: 'rgba(22, 30, 41, 0.78)',
    subsurface: '#10161f',
    subsurfaceGlass: 'rgba(16, 22, 31, 0.74)',
    heroBg: '#0b1017',
    border: 'rgba(255, 255, 255, 0.09)',
    borderStrong: 'rgba(255, 255, 255, 0.18)',
    textPrimary: '#f1f5f9',
    textMuted: '#94a3b8',
    swatchTop: '#1c2635',
    swatchBottom: '#0e141b',
  },
  obsidian: {
    isDark: true,
    canvas: '#07090d',
    surface: '#11141c',
    surfaceGlass: 'rgba(17, 20, 28, 0.78)',
    subsurface: '#0b0e14',
    subsurfaceGlass: 'rgba(11, 14, 20, 0.74)',
    heroBg: '#06080c',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    textPrimary: '#f8fafc',
    textMuted: '#9ca3af',
    swatchTop: '#161a24',
    swatchBottom: '#07090d',
  },
  abyss: {
    isDark: true,
    canvas: '#071124',
    surface: '#0d1b36',
    surfaceGlass: 'rgba(13, 27, 54, 0.76)',
    subsurface: '#09152b',
    subsurfaceGlass: 'rgba(9, 21, 43, 0.72)',
    heroBg: '#050d1c',
    border: 'rgba(147, 197, 253, 0.15)',
    borderStrong: 'rgba(147, 197, 253, 0.28)',
    textPrimary: '#eff6ff',
    textMuted: '#93c5fd',
    swatchTop: '#12284e',
    swatchBottom: '#071124',
  },
  daylight: {
    isDark: false,
    canvas: '#f4f6f9',
    surface: '#ffffff',
    surfaceGlass: 'rgba(255, 255, 255, 0.80)',
    subsurface: '#f8fafc',
    subsurfaceGlass: 'rgba(241, 245, 249, 0.78)',
    heroBg: '#e8eef7',
    border: 'rgba(15, 23, 42, 0.11)',
    borderStrong: 'rgba(15, 23, 42, 0.2)',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    swatchTop: '#ffffff',
    swatchBottom: '#e2e8f0',
  },
};

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  enabled: false,
  accentColor: '#1a9fff',
  secondaryColor: '#38bdf8',
  surfaceStyle: 'midnight',
  buttonStyle: 'rounded',
  cardRadius: 'medium',
  glassBlur: true,
};

const STORAGE_KEY = 'secretarea_launcher_settings_v1';

export const DEFAULT_PERFORMANCE_ADVANCED: PerformanceAdvancedSettings = {
  pauseBackgroundWhenMinimized: true,
  reduceVisualEffects: false,
  hardwareMonitorIntervalMs: 'auto',
  downloadUiThrottleMs: 'auto',
  adaptiveTorrentPolling: true,
  deferBackgroundChecks: false,
};

export const DEFAULT_LAUNCHER_SETTINGS: LauncherSettings = {
  language: 'en',
  startWithComputer: false,
  closeBehavior: 'exit',
  enableCanRunIt: true,
  compactNavbar: false,
  lightMode: false,
  osThemePreference: 'auto',
  appearanceMode: 'system',
  animationMode: 'full',
  alwaysPs5Theme: false,
  alwaysXboxTheme: false,
  ambientMusicEnabled: true,
  uiClickSoundsEnabled: true,
  customCursorEnabled: true,
  soundVolume: 70,
  customTheme: { ...DEFAULT_CUSTOM_THEME },
  performanceMode: 'balanced',
  performanceAdvanced: { ...DEFAULT_PERFORMANCE_ADVANCED },
};

export function detectRuntimePlatform(): 'win32' | 'linux' | 'darwin' {
  if (typeof window !== 'undefined') {
    const desktopPlatform = (
      window as unknown as { secretAreaDesktop?: { platform?: string } }
    ).secretAreaDesktop?.platform;
    if (desktopPlatform === 'darwin' || desktopPlatform === 'linux' || desktopPlatform === 'win32') {
      return desktopPlatform;
    }
  }
  if (typeof navigator !== 'undefined') {
    const navPlatform = (navigator.platform || '').toLowerCase();
    const userAgent = (navigator.userAgent || '').toLowerCase();
    if (navPlatform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('darwin')) {
      return 'darwin';
    }
    if (navPlatform.includes('linux') || navPlatform.includes('x11') || userAgent.includes('linux')) {
      return 'linux';
    }
  }
  return 'win32';
}

export function resolveDefaultOsThemeForPlatform(platform?: string | null): ResolvedOsTheme {
  const clean = (platform || detectRuntimePlatform()).toLowerCase();
  if (clean === 'darwin' || clean.includes('mac')) return 'macos';
  if (clean === 'linux') return 'linux';
  return 'windows';
}

export function normalizeOsThemePreference(value: unknown): OsThemePreference {
  if (value === 'windows' || value === 'linux' || value === 'macos' || value === 'auto') {
    return value;
  }
  return 'auto';
}

export function normalizeAppearanceMode(
  value: unknown,
  fallback: AppearanceMode = 'system'
): AppearanceMode {
  if (value === 'system' || value === 'dark' || value === 'light') {
    return value;
  }
  return fallback;
}

export function normalizeAnimationMode(value: unknown): AnimationMode {
  if (value === 'subtle' || value === 'reduced' || value === 'full') {
    return value;
  }
  return 'full';
}

export function detectSystemPrefersDark(fallback = true): boolean {
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      if (typeof mql?.matches === 'boolean') {
        return mql.matches;
      }
    }
  } catch {
    // ignore matchMedia unavailability
  }
  return fallback;
}

export function resolveActiveOsTheme(
  settings: Pick<LauncherSettings, 'osThemePreference'>,
  platform?: string | null
): ResolvedOsTheme {
  const pref = normalizeOsThemePreference(settings?.osThemePreference);
  if (pref !== 'auto') return pref;
  return resolveDefaultOsThemeForPlatform(platform);
}

export function resolveEffectiveLightMode(
  settings: Pick<
    LauncherSettings,
    'alwaysPs5Theme' | 'alwaysXboxTheme' | 'customTheme' | 'appearanceMode' | 'lightMode'
  >,
  systemPrefersDark?: boolean
): boolean {
  if (settings.alwaysXboxTheme || settings.alwaysPs5Theme) return false;
  if (settings.customTheme?.enabled) {
    return settings.customTheme.surfaceStyle === 'daylight';
  }
  if (settings.appearanceMode === 'light') return true;
  if (settings.appearanceMode === 'dark') return false;
  if (typeof systemPrefersDark === 'boolean') return !systemPrefersDark;
  return Boolean(settings.lightMode);
}

export function getActiveOsPalette(
  osTheme: ResolvedOsTheme,
  isDark: boolean
): OsThemeColorPalette {
  return OS_THEME_PRESETS[osTheme][isDark ? 'dark' : 'light'];
}

export function restoreOsDefaultCustomColors(
  osTheme: ResolvedOsTheme,
  isDark: boolean
): Partial<CustomThemeConfig> {
  const palette = getActiveOsPalette(osTheme, isDark);
  return {
    accentColor: palette.accent,
    secondaryColor: palette.secondary,
    surfaceStyle: isDark ? 'midnight' : 'daylight',
  };
}

export function restoreDefaultThemeSettings(
  current: LauncherSettings,
  systemPrefersDark?: boolean
): LauncherSettings {
  const prefersDark =
    typeof systemPrefersDark === 'boolean' ? systemPrefersDark : detectSystemPrefersDark(true);
  return {
    ...current,
    osThemePreference: 'auto',
    appearanceMode: 'system',
    animationMode: 'full',
    lightMode: !prefersDark,
    alwaysPs5Theme: false,
    alwaysXboxTheme: false,
    customTheme: { ...DEFAULT_CUSTOM_THEME, enabled: false },
  };
}

export function getAppVersionString(): string {
  try {
    if (typeof __APP_VERSION__ === 'string' && __APP_VERSION__.trim()) {
      return __APP_VERSION__.trim();
    }
  } catch {
    // ignore undefined define during isolated tests
  }
  return '1.0.12';
}

const LAST_SEEN_VERSION_KEY = 'secretarea_last_seen_app_version_v1';

export function getLastSeenAppVersion(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

export function setLastSeenAppVersion(version: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const clean = version.trim();
    if (!clean) return;
    localStorage.setItem(LAST_SEEN_VERSION_KEY, clean);
  } catch {
    // ignore localStorage failures
  }
}

export function compareAppVersions(a: string, b: string): number {
  const parse = (val: string) =>
    val
      .replace(/^v/i, '')
      .trim()
      .split('-')[0]
      .split('.')
      .map((n) => parseInt(n, 10) || 0);
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function normalizeLanguage(value: unknown): AppLanguage {
  if (value === 'fr' || value === 'es' || value === 'ar' || value === 'en') {
    return value;
  }
  return 'en';
}

function normalizeVolume(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  return DEFAULT_LAUNCHER_SETTINGS.soundVolume;
}

export function sanitizeHexColor(value: unknown, fallback = '#1a9fff'): string {
  if (typeof value === 'string') {
    const clean = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      return clean.toLowerCase();
    }
  }
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = sanitizeHexColor(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function mixHex(hex: string, target: number, ratio: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mr = Math.round(r + (target - r) * ratio);
  const mg = Math.round(g + (target - g) * ratio);
  const mb = Math.round(b + (target - b) * ratio);
  return `#${mr.toString(16).padStart(2, '0')}${mg.toString(16).padStart(2, '0')}${mb.toString(16).padStart(2, '0')}`;
}

export function normalizeCustomTheme(value: unknown): CustomThemeConfig {
  const raw =
    value && typeof value === 'object' ? (value as Partial<CustomThemeConfig>) : {};
  const surfaceStyle: CustomThemeSurfaceStyle =
    raw.surfaceStyle === 'obsidian' ||
    raw.surfaceStyle === 'abyss' ||
    raw.surfaceStyle === 'daylight' ||
    raw.surfaceStyle === 'midnight'
      ? raw.surfaceStyle
      : DEFAULT_CUSTOM_THEME.surfaceStyle;
  const buttonStyle: CustomThemeButtonStyle =
    raw.buttonStyle === 'pill' ||
    raw.buttonStyle === 'sharp' ||
    raw.buttonStyle === 'rounded'
      ? raw.buttonStyle
      : DEFAULT_CUSTOM_THEME.buttonStyle;
  const cardRadius: CustomThemeCardRadius =
    raw.cardRadius === 'sharp' ||
    raw.cardRadius === 'soft' ||
    raw.cardRadius === 'medium'
      ? raw.cardRadius
      : DEFAULT_CUSTOM_THEME.cardRadius;

  return {
    enabled: Boolean(raw.enabled),
    accentColor: sanitizeHexColor(raw.accentColor, DEFAULT_CUSTOM_THEME.accentColor),
    secondaryColor: sanitizeHexColor(raw.secondaryColor, DEFAULT_CUSTOM_THEME.secondaryColor),
    surfaceStyle,
    buttonStyle,
    cardRadius,
    glassBlur:
      typeof raw.glassBlur === 'boolean' ? raw.glassBlur : DEFAULT_CUSTOM_THEME.glassBlur,
  };
}

export function getActiveConsoleTheme(settings: LauncherSettings): AppThemeMode {
  if (settings.alwaysXboxTheme) return 'xbox';
  if (settings.alwaysPs5Theme) return 'ps5';
  return 'default';
}

export function normalizePerformanceMode(value: unknown): PerformanceMode {
  if (value === 'eco' || value === 'balanced' || value === 'performance') {
    return value;
  }
  return 'balanced';
}

export function normalizePerformanceAdvanced(
  value: unknown,
  mode: PerformanceMode = 'balanced'
): PerformanceAdvancedSettings {
  const raw =
    value && typeof value === 'object' ? (value as Partial<PerformanceAdvancedSettings>) : {};
  const hwRaw = raw.hardwareMonitorIntervalMs;
  const hardwareMonitorIntervalMs: PerformanceAdvancedSettings['hardwareMonitorIntervalMs'] =
    hwRaw === 1000 || hwRaw === 1500 || hwRaw === 2000 || hwRaw === 3000 || hwRaw === 5000
      ? hwRaw
      : 'auto';
  const dlRaw = raw.downloadUiThrottleMs;
  const downloadUiThrottleMs: PerformanceAdvancedSettings['downloadUiThrottleMs'] =
    dlRaw === 200 || dlRaw === 350 || dlRaw === 750 ? dlRaw : 'auto';

  return {
    pauseBackgroundWhenMinimized:
      typeof raw.pauseBackgroundWhenMinimized === 'boolean'
        ? raw.pauseBackgroundWhenMinimized
        : DEFAULT_PERFORMANCE_ADVANCED.pauseBackgroundWhenMinimized,
    reduceVisualEffects:
      typeof raw.reduceVisualEffects === 'boolean'
        ? raw.reduceVisualEffects
        : mode === 'eco',
    hardwareMonitorIntervalMs,
    downloadUiThrottleMs,
    adaptiveTorrentPolling:
      typeof raw.adaptiveTorrentPolling === 'boolean'
        ? raw.adaptiveTorrentPolling
        : DEFAULT_PERFORMANCE_ADVANCED.adaptiveTorrentPolling,
    deferBackgroundChecks:
      typeof raw.deferBackgroundChecks === 'boolean'
        ? raw.deferBackgroundChecks
        : mode === 'eco',
  };
}

export function getEffectivePerformanceConfig(
  settings: Pick<LauncherSettings, 'performanceMode' | 'performanceAdvanced'>
): EffectivePerformanceConfig {
  const mode = normalizePerformanceMode(settings?.performanceMode);
  const adv = normalizePerformanceAdvanced(settings?.performanceAdvanced, mode);

  const isEco = mode === 'eco';
  const isPerf = mode === 'performance';

  const hardwarePollIntervalMs =
    adv.hardwareMonitorIntervalMs === 'auto'
      ? isEco
        ? 3000
        : isPerf
        ? 1000
        : 1500
      : adv.hardwareMonitorIntervalMs;

  const topBarTelemetryIntervalMs = isEco ? 8000 : isPerf ? 2500 : 4000;

  const downloadUiThrottleMs =
    adv.downloadUiThrottleMs === 'auto'
      ? isEco
        ? 750
        : isPerf
        ? 200
        : 350
      : adv.downloadUiThrottleMs;

  const torrentActivePollMs = isEco ? 3000 : isPerf ? 1000 : 1500;
  const torrentIdlePollMs = adv.adaptiveTorrentPolling
    ? isEco
      ? 20000
      : isPerf
      ? 6000
      : 12000
    : torrentActivePollMs;

  const reduceVisualEffects = isEco || adv.reduceVisualEffects;
  const deferBackgroundChecks = isEco || adv.deferBackgroundChecks;

  return {
    mode,
    pauseBackgroundWhenMinimized: adv.pauseBackgroundWhenMinimized,
    reduceVisualEffects,
    hardwarePollIntervalMs,
    topBarTelemetryIntervalMs,
    downloadUiThrottleMs,
    torrentActivePollMs,
    torrentIdlePollMs,
    adaptiveTorrentPolling: adv.adaptiveTorrentPolling,
    deferBackgroundChecks,
    disableHeavyAnimations: reduceVisualEffects,
    maxImageCacheEntries: isEco ? 140 : isPerf ? 360 : 240,
  };
}

export function loadLauncherSettings(
  storageOverride?: Pick<Storage, 'getItem'> | null,
  _platformOverride?: string | null,
  systemPrefersDarkOverride?: boolean
): LauncherSettings {
  const prefersDark =
    typeof systemPrefersDarkOverride === 'boolean'
      ? systemPrefersDarkOverride
      : detectSystemPrefersDark(true);
  try {
    const store = storageOverride !== undefined ? storageOverride : localStorage;
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) {
      // Fresh startup with no saved user preferences: auto-follow OS theme & appearance
      return {
        ...DEFAULT_LAUNCHER_SETTINGS,
        osThemePreference: 'auto',
        appearanceMode: 'system',
        animationMode: 'full',
        lightMode: !prefersDark,
        customTheme: { ...DEFAULT_CUSTOM_THEME },
        performanceAdvanced: { ...DEFAULT_PERFORMANCE_ADVANCED },
      };
    }
    const parsed = JSON.parse(raw) as Partial<LauncherSettings>;
    const alwaysXboxTheme = Boolean(parsed.alwaysXboxTheme);
    const alwaysPs5Theme = alwaysXboxTheme ? false : Boolean(parsed.alwaysPs5Theme);
    const customTheme = normalizeCustomTheme(parsed.customTheme);
    const osThemePreference = normalizeOsThemePreference(parsed.osThemePreference);
    const inferredLegacyAppearance: AppearanceMode = parsed.lightMode ? 'light' : 'dark';
    const appearanceMode = normalizeAppearanceMode(
      parsed.appearanceMode,
      inferredLegacyAppearance
    );
    const animationMode = normalizeAnimationMode(parsed.animationMode);

    const lightMode =
      alwaysXboxTheme || alwaysPs5Theme
        ? false
        : customTheme.enabled
        ? customTheme.surfaceStyle === 'daylight'
        : appearanceMode === 'light'
        ? true
        : appearanceMode === 'dark'
        ? false
        : !prefersDark;

    const performanceMode = normalizePerformanceMode(parsed.performanceMode);
    const performanceAdvanced = normalizePerformanceAdvanced(
      parsed.performanceAdvanced,
      performanceMode
    );

    return {
      language: normalizeLanguage(parsed.language),
      startWithComputer: Boolean(parsed.startWithComputer),
      closeBehavior:
        parsed.closeBehavior === 'minimize-to-tray' || parsed.closeBehavior === 'exit'
          ? parsed.closeBehavior
          : Boolean(parsed.startWithComputer)
          ? 'minimize-to-tray'
          : 'exit',
      enableCanRunIt:
        typeof parsed.enableCanRunIt === 'boolean'
          ? parsed.enableCanRunIt
          : DEFAULT_LAUNCHER_SETTINGS.enableCanRunIt,
      compactNavbar: Boolean(parsed.compactNavbar),
      lightMode,
      osThemePreference,
      appearanceMode,
      animationMode,
      alwaysPs5Theme,
      alwaysXboxTheme,
      ambientMusicEnabled:
        typeof parsed.ambientMusicEnabled === 'boolean'
          ? parsed.ambientMusicEnabled
          : DEFAULT_LAUNCHER_SETTINGS.ambientMusicEnabled,
      uiClickSoundsEnabled:
        typeof parsed.uiClickSoundsEnabled === 'boolean'
          ? parsed.uiClickSoundsEnabled
          : DEFAULT_LAUNCHER_SETTINGS.uiClickSoundsEnabled,
      customCursorEnabled:
        typeof parsed.customCursorEnabled === 'boolean'
          ? parsed.customCursorEnabled
          : DEFAULT_LAUNCHER_SETTINGS.customCursorEnabled,
      soundVolume: normalizeVolume(parsed.soundVolume),
      customTheme,
      performanceMode,
      performanceAdvanced,
    };
  } catch {
    return {
      ...DEFAULT_LAUNCHER_SETTINGS,
      lightMode: !prefersDark,
      customTheme: { ...DEFAULT_CUSTOM_THEME },
      performanceAdvanced: { ...DEFAULT_PERFORMANCE_ADVANCED },
    };
  }
}

export function saveLauncherSettings(settings: LauncherSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota / private mode failures cleanly
  }
}

export function applyDocumentLanguageSettings(language: AppLanguage): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const isRtl = language === 'ar';
  html.lang = language;
  html.dir = isRtl ? 'rtl' : 'ltr';
  html.classList.toggle('lang-rtl', isRtl);
}

const CUSTOM_CSS_VAR_KEYS = [
  '--sa-accent',
  '--sa-accent-hover',
  '--sa-accent-soft',
  '--sa-accent-ring',
  '--sa-accent-fg',
  '--sa-secondary',
  '--sa-secondary-soft',
  '--sa-secondary-fg',
  '--sa-bg-canvas',
  '--sa-bg-surface',
  '--sa-bg-surface-solid',
  '--sa-bg-surface-glass',
  '--sa-bg-subsurface',
  '--sa-bg-hero',
  '--sa-border-subtle',
  '--sa-border-strong',
  '--sa-text-primary',
  '--sa-text-muted',
  '--sa-btn-radius',
  '--sa-card-radius',
  '--sa-card-inner-radius',
  '--sa-input-radius',
  '--sa-panel-blur',
];

export function applyDocumentThemeSettings(
  settings: LauncherSettings,
  systemPrefersDark?: boolean,
  platformOverride?: string | null
): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const consoleTheme = getActiveConsoleTheme(settings);
  const custom = settings.customTheme || DEFAULT_CUSTOM_THEME;
  const useCustom = Boolean(custom.enabled);
  const surfacePalette =
    CUSTOM_THEME_SURFACE_PALETTES[custom.surfaceStyle] || CUSTOM_THEME_SURFACE_PALETTES.midnight;
  const osTheme = resolveActiveOsTheme(settings, platformOverride);

  const isDark = !resolveEffectiveLightMode(settings, systemPrefersDark);

  html.classList.toggle('dark', isDark);
  html.classList.toggle('theme-ps5', consoleTheme === 'ps5');
  html.classList.toggle('theme-xbox', consoleTheme === 'xbox');
  html.classList.toggle('theme-custom', useCustom);

  const osThemeActive = consoleTheme === 'default';
  html.classList.toggle('theme-os-windows', osThemeActive && osTheme === 'windows');
  html.classList.toggle('theme-os-linux', osThemeActive && osTheme === 'linux');
  html.classList.toggle('theme-os-macos', osThemeActive && osTheme === 'macos');

  html.classList.toggle('sa-motion-subtle', settings.animationMode === 'subtle');
  html.classList.toggle('sa-motion-reduced', settings.animationMode === 'reduced');

  html.style.colorScheme = isDark ? 'dark' : 'light';

  if (useCustom) {
    const accent = sanitizeHexColor(custom.accentColor);
    const secondary = sanitizeHexColor(custom.secondaryColor, accent);
    const { r, g, b } = hexToRgb(accent);
    const secRgb = hexToRgb(secondary);
    const effectiveDarkSurface = consoleTheme !== 'default' ? true : surfacePalette.isDark;
    const accentHover = effectiveDarkSurface
      ? mixHex(accent, 255, 0.16)
      : mixHex(accent, 0, 0.14);
    const accentFg = getAccessibleTextOnAccent(accent);
    const secondaryFg = getAccessibleTextOnAccent(secondary);
    const btnRadius =
      custom.buttonStyle === 'pill'
        ? '9999px'
        : custom.buttonStyle === 'sharp'
        ? '4px'
        : '10px';
    const inputRadius =
      custom.buttonStyle === 'pill'
        ? '14px'
        : custom.buttonStyle === 'sharp'
        ? '5px'
        : '10px';
    const cardRadius =
      custom.cardRadius === 'sharp'
        ? '6px'
        : custom.cardRadius === 'soft'
        ? '20px'
        : '12px';
    const cardInnerRadius =
      custom.cardRadius === 'sharp'
        ? '4px'
        : custom.cardRadius === 'soft'
        ? '14px'
        : '8px';

    html.style.setProperty('--sa-accent', accent);
    html.style.setProperty('--sa-accent-hover', accentHover);
    html.style.setProperty(
      '--sa-accent-soft',
      `rgba(${r}, ${g}, ${b}, ${effectiveDarkSurface ? 0.18 : 0.12})`
    );
    html.style.setProperty('--sa-accent-ring', `rgba(${r}, ${g}, ${b}, 0.46)`);
    html.style.setProperty('--sa-accent-fg', accentFg);
    html.style.setProperty('--sa-secondary', secondary);
    html.style.setProperty(
      '--sa-secondary-soft',
      `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, ${effectiveDarkSurface ? 0.18 : 0.12})`
    );
    html.style.setProperty('--sa-secondary-fg', secondaryFg);
    html.style.setProperty('--sa-bg-canvas', surfacePalette.canvas);
    html.style.setProperty(
      '--sa-bg-surface',
      custom.glassBlur ? surfacePalette.surfaceGlass : surfacePalette.surface
    );
    html.style.setProperty('--sa-bg-surface-solid', surfacePalette.surface);
    html.style.setProperty('--sa-bg-surface-glass', surfacePalette.surfaceGlass);
    html.style.setProperty(
      '--sa-bg-subsurface',
      custom.glassBlur ? surfacePalette.subsurfaceGlass : surfacePalette.subsurface
    );
    html.style.setProperty('--sa-bg-hero', surfacePalette.heroBg);
    html.style.setProperty('--sa-border-subtle', surfacePalette.border);
    html.style.setProperty('--sa-border-strong', surfacePalette.borderStrong);
    html.style.setProperty('--sa-text-primary', surfacePalette.textPrimary);
    html.style.setProperty('--sa-text-muted', surfacePalette.textMuted);
    html.style.setProperty('--sa-btn-radius', btnRadius);
    html.style.setProperty('--sa-card-radius', cardRadius);
    html.style.setProperty('--sa-card-inner-radius', cardInnerRadius);
    html.style.setProperty('--sa-input-radius', inputRadius);
    html.style.setProperty(
      '--sa-panel-blur',
      custom.glassBlur ? 'blur(18px) saturate(155%)' : 'none'
    );
  } else {
    for (const key of CUSTOM_CSS_VAR_KEYS) {
      html.style.removeProperty(key);
    }
  }
}

export function applyDocumentPerformanceSettings(settings: LauncherSettings): EffectivePerformanceConfig {
  const effective = getEffectivePerformanceConfig(settings);
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    html.classList.toggle('sa-perf-eco', effective.mode === 'eco');
    html.classList.toggle('sa-perf-balanced', effective.mode === 'balanced');
    html.classList.toggle('sa-perf-performance', effective.mode === 'performance');
    html.classList.toggle('sa-reduce-effects', effective.reduceVisualEffects);
  }
  return effective;
}

export function buildPerformancePayloadForDesktop(
  settings: Pick<LauncherSettings, 'performanceMode' | 'performanceAdvanced'>
): EffectivePerformanceConfig {
  return getEffectivePerformanceConfig(settings);
}

const ONBOARDING_STORAGE_KEY = 'secretarea_onboarding_completed_v1';
const ONBOARDED_VERSION_STORAGE_KEY = 'secretarea_last_onboarded_version_v1';

export function isLocalOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setLocalOnboardingCompleted(completed: boolean): void {
  try {
    if (completed) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures cleanly
  }
}

export function getLocalOnboardedVersion(): string | null {
  try {
    const val = localStorage.getItem(ONBOARDED_VERSION_STORAGE_KEY);
    return val && val.trim() ? val.trim() : null;
  } catch {
    return null;
  }
}

export function setLocalOnboardedVersion(version: string | null): void {
  try {
    if (version && version.trim()) {
      localStorage.setItem(ONBOARDED_VERSION_STORAGE_KEY, version.trim());
    } else {
      localStorage.removeItem(ONBOARDED_VERSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures cleanly
  }
}
