const DESKTOP_URL_STORAGE_KEY = 'secretarea_desktop_exe_url';

export type PlatformDownloadTarget =
  | 'win64'
  | 'macos-arm64'
  | 'macos-x64'
  | 'linux-appimage'
  | 'linux-deb';

export const PLATFORM_ASSET_FILENAMES: Record<PlatformDownloadTarget, string> = {
  win64: 'SecretArea.exe',
  'macos-arm64': 'SecretArea-macOS-AppleSilicon.dmg',
  'macos-x64': 'SecretArea-macOS-Intel.dmg',
  'linux-appimage': 'SecretArea-linux-x86_64.AppImage',
  'linux-deb': 'SecretArea-linux-amd64.deb',
};

export function isRunningInDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    secretAreaDesktop?: { isDesktop?: boolean };
  };
  return Boolean(win.secretAreaDesktop?.isDesktop);
}

export function detectClientPlatformTarget(): PlatformDownloadTarget {
  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      secretAreaDesktop?: { platform?: string; arch?: string };
    };
    const bridgePlatform = win.secretAreaDesktop?.platform;
    const bridgeArch = win.secretAreaDesktop?.arch;
    if (bridgePlatform === 'darwin') {
      return bridgeArch === 'x64' ? 'macos-x64' : 'macos-arm64';
    }
    if (bridgePlatform === 'linux') {
      return 'linux-appimage';
    }
    if (bridgePlatform === 'win32') {
      return 'win64';
    }
  }

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    const plat = navigator.platform || '';
    if (/Mac/i.test(plat) || /Macintosh|Mac OS X/i.test(ua)) {
      const uaArch = (
        navigator as unknown as { userAgentData?: { architecture?: string } }
      ).userAgentData?.architecture;
      if (uaArch && /x86/i.test(uaArch)) {
        return 'macos-x64';
      }
      return 'macos-arm64';
    }
    if (/Linux/i.test(plat) || (/Linux/i.test(ua) && !/Android/i.test(ua))) {
      return /Ubuntu|Debian/i.test(ua) ? 'linux-deb' : 'linux-appimage';
    }
  }

  return 'win64';
}

function isSafePublicHttpsUrl(rawUrl: string): boolean {
  if (!rawUrl || /[\x00-\x1f\x7f]/.test(rawUrl)) return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (
      !host ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.localhost')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a GitHub repository URL/slug or GitHub latest-release asset URL
 * into the requested OS/architecture permanent release asset URL:
 * https://github.com/<user>/<repo>/releases/latest/download/<PLATFORM_ASSET_FILENAME>
 */
export function resolvePlatformInstallerUrl(
  input: string,
  target: PlatformDownloadTarget = 'win64'
): string {
  const trimmed = input.trim();
  if (!trimmed || /[\x00-\x1f\x7f]/.test(trimmed)) return '';

  const targetAsset = PLATFORM_ASSET_FILENAMES[target] || PLATFORM_ASSET_FILENAMES.win64;

  // Rewrite GitHub Releases permanent /latest/download/<asset> links to the requested target asset
  const latestMatch = trimmed.match(
    /^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/releases\/latest\/download\/[^/?#]+(?:\?.*)?$/i
  );
  if (latestMatch) {
    return `https://github.com/${latestMatch[1]}/${latestMatch[2]}/releases/latest/download/${targetAsset}`;
  }

  // Direct HTTPS installer / release asset URL (.exe, .msi, .dmg, .zip, .AppImage, .deb)
  if (
    /^https:\/\/.+\.(exe|msi|dmg|zip|AppImage|deb)(\?.*)?$/i.test(trimmed) &&
    isSafePublicHttpsUrl(trimmed)
  ) {
    return trimmed;
  }

  // GitHub repository URL -> latest release asset
  const ghUrlMatch = trimmed.match(
    /^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git|\/.*)?$/i
  );
  if (ghUrlMatch) {
    return `https://github.com/${ghUrlMatch[1]}/${ghUrlMatch[2]}/releases/latest/download/${targetAsset}`;
  }

  // Short "owner/repo" slug
  const slugMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (slugMatch) {
    return `https://github.com/${slugMatch[1]}/${slugMatch[2]}/releases/latest/download/${targetAsset}`;
  }

  if (isSafePublicHttpsUrl(trimmed)) {
    return trimmed;
  }

  return '';
}

/**
 * Accepts a direct HTTPS SecretArea.exe URL OR a GitHub repo URL/slug (e.g. https://github.com/user/repo)
 * and resolves it to the direct GitHub Releases installer link:
 * https://github.com/<user>/<repo>/releases/latest/download/SecretArea.exe
 */
export function resolveInstallerUrl(input: string): string {
  return resolvePlatformInstallerUrl(input, 'win64');
}

export function getConfiguredDesktopExeUrl(): string {
  const envUrl = import.meta.env.VITE_DESKTOP_DOWNLOAD_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return resolveInstallerUrl(envUrl);
  }

  try {
    const saved = localStorage.getItem(DESKTOP_URL_STORAGE_KEY);
    if (saved && saved.trim()) {
      return resolveInstallerUrl(saved);
    }
  } catch {
    // ignore storage errors
  }

  // Auto-detect GitHub Pages hosting: <owner>.github.io/<repo>/
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    const owner = window.location.hostname.replace(/\.github\.io$/i, '');
    const pathPart = window.location.pathname.split('/').filter(Boolean)[0];
    if (owner && pathPart) {
      return `https://github.com/${owner}/${pathPart}/releases/latest/download/SecretArea.exe`;
    }
  }

  return '';
}

export function saveDesktopExeUrl(rawInput: string): string {
  const resolved = resolveInstallerUrl(rawInput);
  try {
    if (resolved) {
      localStorage.setItem(DESKTOP_URL_STORAGE_KEY, resolved);
    } else {
      localStorage.removeItem(DESKTOP_URL_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
  return resolved;
}

export function triggerExeDownload(
  exeUrl: string,
  target: PlatformDownloadTarget = 'win64'
): void {
  const safeUrl = resolvePlatformInstallerUrl(exeUrl, target);
  if (!safeUrl || typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.href = safeUrl;
  link.download = PLATFORM_ASSET_FILENAMES[target] || 'SecretArea.exe';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
