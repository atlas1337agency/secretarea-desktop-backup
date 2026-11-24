import type { PresentMonSetupState } from '../types';

export const PRESENTMON_OFFICIAL_RELEASES_URL =
  'https://github.com/GameTechDev/PresentMon/releases/latest';

export interface SecretAreaPresentMonSetupBridge {
  getState: () => Promise<PresentMonSetupState | null>;
  checkStatus: (opts?: { force?: boolean }) => Promise<PresentMonSetupState | null>;
  startInstall: (
    userConfirmed: boolean,
    mode?: 'auto' | 'install' | 'update' | 'repair' | 'reinstall'
  ) => Promise<PresentMonSetupState | null>;
  cancel: () => Promise<PresentMonSetupState | null>;
  dismiss: (declinePermanently?: boolean) => Promise<PresentMonSetupState | null>;
  openOfficialReleases: () => Promise<boolean>;
  onStateChange: (callback: (state: PresentMonSetupState) => void) => () => void;
}

interface SecretAreaDesktopWithPresentMon {
  isDesktop?: boolean;
  presentMonSetup?: SecretAreaPresentMonSetupBridge;
}

export function getDesktopPresentMonSetupBridge(): SecretAreaPresentMonSetupBridge | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    secretAreaDesktop?: SecretAreaDesktopWithPresentMon;
  };
  if (!win.secretAreaDesktop?.isDesktop || !win.secretAreaDesktop?.presentMonSetup) {
    return null;
  }
  return win.secretAreaDesktop.presentMonSetup;
}

export const EMPTY_PRESENTMON_SETUP_STATE: PresentMonSetupState = {
  stage: 'idle',
  actionNeeded: null,
  platformSupported: false,
  installed: false,
  healthy: false,
  healthIssue: null,
  installSource: null,
  installedVersion: null,
  executablePath: null,
  installDirectory: null,
  cliCapabilities: null,
  isRunning: false,
  latestRelease: null,
  releaseError: null,
  releaseErrorCode: null,
  downloadProgress: null,
  verification: null,
  error: null,
  statusMessage: '',
  officialReleasesUrl: PRESENTMON_OFFICIAL_RELEASES_URL,
  shouldPrompt: false,
  declinedForVersion: null,
  dismissedForVersion: null,
  lastCheckedAt: null,
};
