export type ResolvedOsTheme = 'windows' | 'linux' | 'macos';

export interface OsThemeColorPalette {
  accent: string;
  accentHover: string;
  secondary: string;
  canvas: string;
  surface: string;
  subsurface: string;
  border: string;
  accessibleFg: string;
}

export interface ThemeContrastEvaluation {
  ratioVsSurface: number;
  ratioVsWhiteText: number;
  ratioVsDarkText: number;
  recommendedFg: '#ffffff' | '#0f172a';
  buttonTextContrast: number;
  passesAA: boolean;
  passesLargeText: boolean;
}

function normalizeHex(hex: unknown, fallback = '#1a9fff'): string {
  if (typeof hex === 'string') {
    const clean = hex.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      return clean.toLowerCase();
    }
  }
  return fallback;
}

export function parseHexRgb(hex: string): { r: number; g: number; b: number } {
  const clean = normalizeHex(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function toLinearChannel(channel8: number): number {
  const s = channel8 / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG 2.1 relative luminance in range [0, 1]. */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = parseHexRgb(hex);
  const R = toLinearChannel(r);
  const G = toLinearChannel(g);
  const B = toLinearChannel(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** WCAG 2.1 contrast ratio in range [1, 21]. */
export function getContrastRatio(hexA: string, hexB: string): number {
  const l1 = getRelativeLuminance(hexA);
  const l2 = getRelativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/** Selects the highest-contrast readable text color (#ffffff or #0f172a) on an accent fill. */
export function getAccessibleTextOnAccent(accentHex: string): '#ffffff' | '#0f172a' {
  const whiteRatio = getContrastRatio(accentHex, '#ffffff');
  const darkRatio = getContrastRatio(accentHex, '#0f172a');
  return darkRatio > whiteRatio ? '#0f172a' : '#ffffff';
}

export function evaluateThemeContrast(
  accentHex: string,
  surfaceHex: string
): ThemeContrastEvaluation {
  const safeAccent = normalizeHex(accentHex, '#1a9fff');
  const safeSurface = normalizeHex(surfaceHex, '#161e29');
  const ratioVsSurface = getContrastRatio(safeAccent, safeSurface);
  const ratioVsWhiteText = getContrastRatio(safeAccent, '#ffffff');
  const ratioVsDarkText = getContrastRatio(safeAccent, '#0f172a');
  const recommendedFg = ratioVsDarkText > ratioVsWhiteText ? '#0f172a' : '#ffffff';
  const buttonTextContrast = Math.max(ratioVsWhiteText, ratioVsDarkText);

  return {
    ratioVsSurface,
    ratioVsWhiteText,
    ratioVsDarkText,
    recommendedFg,
    buttonTextContrast,
    passesAA: ratioVsSurface >= 3.0 && buttonTextContrast >= 4.5,
    passesLargeText: ratioVsSurface >= 2.5 && buttonTextContrast >= 3.0,
  };
}

export const OS_THEME_PRESETS: Record<
  ResolvedOsTheme,
  {
    dark: OsThemeColorPalette;
    light: OsThemeColorPalette;
  }
> = {
  windows: {
    dark: {
      accent: '#1a9fff',
      accentHover: '#38adff',
      secondary: '#38bdf8',
      canvas: '#0e141b',
      surface: '#171d25',
      subsurface: '#11161d',
      border: 'rgba(255, 255, 255, 0.08)',
      accessibleFg: '#0f172a',
    },
    light: {
      accent: '#0284c7',
      accentHover: '#0369a1',
      secondary: '#0ea5e9',
      canvas: '#f4f6f9',
      surface: '#ffffff',
      subsurface: '#f8fafc',
      border: 'rgba(15, 23, 42, 0.1)',
      accessibleFg: '#ffffff',
    },
  },
  linux: {
    dark: {
      accent: '#88c0d0',
      accentHover: '#8fbcbb',
      secondary: '#5e81ac',
      canvas: '#242933',
      surface: '#2e3440',
      subsurface: '#3b4252',
      border: 'rgba(216, 222, 233, 0.11)',
      accessibleFg: '#0f172a',
    },
    light: {
      accent: '#4c6f9c',
      accentHover: '#3d5c85',
      secondary: '#5e81ac',
      canvas: '#e5e9f0',
      surface: '#ffffff',
      subsurface: '#eceff4',
      border: 'rgba(46, 52, 64, 0.13)',
      accessibleFg: '#ffffff',
    },
  },
  macos: {
    dark: {
      accent: '#2563eb',
      accentHover: '#3b82f6',
      secondary: '#38bdf8',
      canvas: '#11132e',
      surface: 'rgba(22, 26, 62, 0.72)',
      subsurface: 'rgba(30, 36, 82, 0.68)',
      border: 'rgba(255, 255, 255, 0.15)',
      accessibleFg: '#ffffff',
    },
    light: {
      accent: '#0066cc',
      accentHover: '#0055b3',
      secondary: '#38bdf8',
      canvas: '#eef2f9',
      surface: 'rgba(255, 255, 255, 0.78)',
      subsurface: 'rgba(241, 245, 255, 0.78)',
      border: 'rgba(15, 23, 42, 0.10)',
      accessibleFg: '#ffffff',
    },
  },
};
