export type AppLanguage = 'en' | 'fr' | 'es' | 'ar';
export type AppThemeMode = 'default' | 'ps5' | 'xbox';

export interface LauncherSettings {
  language: AppLanguage;
  startWithComputer: boolean;
  enableCanRunIt: boolean;
  compactNavbar: boolean;
  lightMode: boolean;
  alwaysPs5Theme: boolean;
  alwaysXboxTheme: boolean;
  ambientMusicEnabled: boolean;
  uiClickSoundsEnabled: boolean;
  soundVolume: number;
}

const STORAGE_KEY = 'secretarea_launcher_settings_v1';

export const DEFAULT_LAUNCHER_SETTINGS: LauncherSettings = {
  language: 'en',
  startWithComputer: false,
  enableCanRunIt: true,
  compactNavbar: false,
  lightMode: false,
  alwaysPs5Theme: false,
  alwaysXboxTheme: false,
  ambientMusicEnabled: true,
  uiClickSoundsEnabled: true,
  soundVolume: 70,
};

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

export function getActiveConsoleTheme(settings: LauncherSettings): AppThemeMode {
  if (settings.lightMode) return 'default';
  if (settings.alwaysXboxTheme) return 'xbox';
  if (settings.alwaysPs5Theme) return 'ps5';
  return 'default';
}

export function loadLauncherSettings(): LauncherSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_LAUNCHER_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<LauncherSettings>;
    const alwaysXboxTheme = Boolean(parsed.alwaysXboxTheme);
    const alwaysPs5Theme = alwaysXboxTheme ? false : Boolean(parsed.alwaysPs5Theme);
    const lightMode = alwaysXboxTheme || alwaysPs5Theme ? false : Boolean(parsed.lightMode);
    return {
      language: normalizeLanguage(parsed.language),
      startWithComputer: Boolean(parsed.startWithComputer),
      enableCanRunIt:
        typeof parsed.enableCanRunIt === 'boolean'
          ? parsed.enableCanRunIt
          : DEFAULT_LAUNCHER_SETTINGS.enableCanRunIt,
      compactNavbar: Boolean(parsed.compactNavbar),
      lightMode,
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
      soundVolume: normalizeVolume(parsed.soundVolume),
    };
  } catch {
    return { ...DEFAULT_LAUNCHER_SETTINGS };
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

export function applyDocumentThemeSettings(settings: LauncherSettings): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const consoleTheme = getActiveConsoleTheme(settings);
  const isDark = consoleTheme !== 'default' || !settings.lightMode;
  html.classList.toggle('dark', isDark);
  html.classList.toggle('theme-ps5', consoleTheme === 'ps5');
  html.classList.toggle('theme-xbox', consoleTheme === 'xbox');
  html.style.colorScheme = isDark ? 'dark' : 'light';
}
