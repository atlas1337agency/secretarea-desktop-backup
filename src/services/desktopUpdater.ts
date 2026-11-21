export type DesktopUpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface DesktopUpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface DesktopUpdateState {
  status: DesktopUpdateStatus;
  currentVersion: string;
  availableVersion: string | null;
  releaseName: string | null;
  releaseNotes: string | null;
  releaseDate: string | null;
  progress: DesktopUpdateProgress | null;
  error: string | null;
  isManualCheck: boolean;
  postponed: boolean;
  lastCheckedAt: string | null;
}

interface SecretAreaUpdaterBridge {
  getVersion: () => Promise<string>;
  getState: () => Promise<DesktopUpdateState | null>;
  checkForUpdates: () => Promise<DesktopUpdateState | null>;
  downloadUpdate: () => Promise<DesktopUpdateState | null>;
  postponeUpdate: () => Promise<DesktopUpdateState | null>;
  installUpdate: () => Promise<void>;
  onStateChange: (callback: (state: DesktopUpdateState) => void) => () => void;
}

interface SecretAreaDesktopGlobal {
  isDesktop?: boolean;
  platform?: string;
  updater?: SecretAreaUpdaterBridge;
}

export function getDesktopUpdaterBridge(): SecretAreaUpdaterBridge | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    secretAreaDesktop?: SecretAreaDesktopGlobal;
  };
  if (!win.secretAreaDesktop?.isDesktop || !win.secretAreaDesktop?.updater) {
    return null;
  }
  return win.secretAreaDesktop.updater;
}

export function formatByteSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 100) return `${mb.toFixed(0)} MB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

export function formatTransferSpeed(bytesPerSecond: number): string {
  if (!bytesPerSecond || bytesPerSecond <= 0) return '';
  const mbps = bytesPerSecond / (1024 * 1024);
  if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
  const kbps = bytesPerSecond / 1024;
  return `${Math.max(1, Math.round(kbps))} KB/s`;
}
