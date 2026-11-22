export type AppLanguage = 'en' | 'fr' | 'es' | 'ar';
export type AppThemeMode = 'default' | 'ps5' | 'xbox';

export interface LauncherSettings {
  language: AppLanguage;
  startWithComputer: boolean;
  compactNavbar: boolean;
  alwaysPs5Theme: boolean;
  alwaysXboxTheme: boolean;
}

const STORAGE_KEY = 'secretarea_launcher_settings_v1';

export const DEFAULT_LAUNCHER_SETTINGS: LauncherSettings = {
  language: 'en',
  startWithComputer: false,
  compactNavbar: false,
  alwaysPs5Theme: false,
  alwaysXboxTheme: false,
};

function normalizeLanguage(value: unknown): AppLanguage {
  if (value === 'fr' || value === 'es' || value === 'ar' || value === 'en') {
    return value;
  }
  return 'en';
}

export function getActiveConsoleTheme(settings: LauncherSettings): AppThemeMode {
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
    return {
      language: normalizeLanguage(parsed.language),
      startWithComputer: Boolean(parsed.startWithComputer),
      compactNavbar: Boolean(parsed.compactNavbar),
      alwaysPs5Theme,
      alwaysXboxTheme,
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
