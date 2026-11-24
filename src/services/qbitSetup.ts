import type { QbitSetupState } from '../types';

export const QBIT_OFFICIAL_DOWNLOAD_URL = 'https://www.qbittorrent.org/download';
export const QBIT_OFFICIAL_LOGO_URL =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/New_qBittorrent_Logo.svg/500px-New_qBittorrent_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail';

export interface SecretAreaQbitSetupBridge {
  getState: () => Promise<QbitSetupState | null>;
  checkStatus: () => Promise<QbitSetupState | null>;
  refreshLocal: () => Promise<QbitSetupState | null>;
  startInstall: (userConfirmed: boolean) => Promise<QbitSetupState | null>;
  launchClient: () => Promise<{ ok: boolean; executablePath?: string; error?: string }>;
  dismiss: () => Promise<QbitSetupState | null>;
  generatePassword: () => Promise<string>;
  openOfficialDownload: () => Promise<boolean>;
  onStateChange: (callback: (state: QbitSetupState) => void) => () => void;
}

interface SecretAreaDesktopWithQbitSetup {
  isDesktop?: boolean;
  qbitSetup?: SecretAreaQbitSetupBridge;
}

export function getDesktopQbitSetupBridge(): SecretAreaQbitSetupBridge | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    secretAreaDesktop?: SecretAreaDesktopWithQbitSetup;
  };
  if (!win.secretAreaDesktop?.isDesktop || !win.secretAreaDesktop?.qbitSetup) {
    return null;
  }
  return win.secretAreaDesktop.qbitSetup;
}

export const EMPTY_QBIT_SETUP_STATE: QbitSetupState = {
  stage: 'idle',
  actionNeeded: null,
  platformSupported: false,
  installed: false,
  installedVersion: null,
  executablePath: null,
  isRunning: false,
  latestRelease: null,
  releaseError: null,
  releaseErrorCode: null,
  downloadProgress: null,
  verification: null,
  webUiConfig: {
    iniPath: null,
    configFound: false,
    webUiEnabled: false,
    address: '127.0.0.1',
    port: 8080,
    username: 'admin',
    isLoopbackOnly: true,
  },
  webUiVerifiedConnected: false,
  error: null,
  statusMessage: '',
  officialDownloadUrl: QBIT_OFFICIAL_DOWNLOAD_URL,
  shouldPromptOnFirstLaunch: false,
  firstLaunchDismissed: false,
  lastCheckedAt: null,
};
