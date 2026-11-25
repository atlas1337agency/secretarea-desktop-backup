import type {
  CleanerCleanResult,
  CleanerProgressEvent,
  CleanerScanResult,
  GamingProcessCandidate,
  GamingSessionHistoryItem,
  GamingSessionState,
  HardwareGpuMetrics,
  HardwareMonitorSnapshot,
  HardwareNetworkInterfaceMetrics,
  HardwareStorageDriveMetrics,
} from '../types';

export interface DesktopHardwareMonitorBridge {
  getSnapshot: () => Promise<HardwareMonitorSnapshot | null>;
  start: (intervalMs?: number) => Promise<HardwareMonitorSnapshot | null>;
  stop: () => Promise<{ ok: boolean; isMonitoring: boolean } | null>;
  setInterval: (intervalMs: number) => Promise<{ ok: boolean; intervalMs: number } | null>;
  onUpdate: (callback: (snapshot: HardwareMonitorSnapshot) => void) => () => void;
}

export interface DesktopGamingMonitorBridge {
  listProcesses: () => Promise<GamingProcessCandidate[]>;
  checkPresentMon: () => Promise<{ available: boolean; path: string | null }>;
  getState: () => Promise<GamingSessionState | null>;
  startSession: (opts?: { pid?: number | null; processName?: string; pingHost?: string }) => Promise<GamingSessionState | null>;
  stopSession: () => Promise<{ state: GamingSessionState; savedSummary: GamingSessionHistoryItem | null } | null>;
  getHistory: () => Promise<GamingSessionHistoryItem[]>;
  clearHistory: () => Promise<GamingSessionHistoryItem[]>;
  setPingHost: (host: string) => Promise<{ ok: boolean; pingHost: string }>;
  onUpdate: (callback: (state: GamingSessionState) => void) => () => void;
}

export interface DesktopPcCleanerBridge {
  scan: () => Promise<CleanerScanResult | null>;
  clean: (payload: { categoryIds: string[]; confirmationToken: string }) => Promise<CleanerCleanResult | null>;
  cancel: () => Promise<{ ok: boolean }>;
  onProgress: (callback: (event: CleanerProgressEvent) => void) => () => void;
}

export function getDesktopHardwareMonitorBridge(): DesktopHardwareMonitorBridge | null {
  if (typeof window === 'undefined') return null;
  const desktop = (
    window as unknown as {
      secretAreaDesktop?: {
        hardwareMonitor?: DesktopHardwareMonitorBridge;
      };
    }
  ).secretAreaDesktop;
  return desktop?.hardwareMonitor || null;
}

export function getDesktopGamingMonitorBridge(): DesktopGamingMonitorBridge | null {
  if (typeof window === 'undefined') return null;
  const desktop = (
    window as unknown as {
      secretAreaDesktop?: {
        gamingMonitor?: DesktopGamingMonitorBridge;
      };
    }
  ).secretAreaDesktop;
  return desktop?.gamingMonitor || null;
}

export function getDesktopPcCleanerBridge(): DesktopPcCleanerBridge | null {
  if (typeof window === 'undefined') return null;
  const desktop = (
    window as unknown as {
      secretAreaDesktop?: {
        pcCleaner?: DesktopPcCleanerBridge;
      };
    }
  ).secretAreaDesktop;
  return desktop?.pcCleaner || null;
}

export const EMPTY_HARDWARE_SNAPSHOT: HardwareMonitorSnapshot = {
  timestamp: 0,
  platform: 'web',
  hostname: null,
  uptimeSeconds: null,
  isMonitoring: false,
  intervalMs: 1500,
  cpu: {
    model: null,
    manufacturer: null,
    series: null,
    generation: null,
    usagePercent: null,
    temperatureCelsius: null,
    clockSpeedGhz: null,
    physicalCores: null,
    logicalThreads: null,
    powerWatts: null,
    coreLoads: [],
  },
  gpus: [],
  ram: {
    totalBytes: null,
    usedBytes: null,
    availableBytes: null,
    usagePercent: null,
    memoryType: null,
    speedMhz: null,
    populatedSlots: null,
    channelMode: null,
  },
  storage: [],
  storageTotals: {
    totalBytes: null,
    usedBytes: null,
    freeBytes: null,
    usagePercent: null,
    readBytesPerSec: null,
    writeBytesPerSec: null,
  },
  network: {
    activeInterface: null,
    interfaces: [],
    totalDownloadBytesPerSec: null,
    totalUploadBytesPerSec: null,
  },
  capabilities: null,
};

export const EMPTY_GAMING_SESSION_STATE: GamingSessionState = {
  isActive: false,
  sessionId: null,
  processName: null,
  pid: null,
  startedAt: null,
  durationSeconds: 0,
  presentMonAvailable: false,
  presentMonPath: null,
  fpsTelemetryStatus: 'requires_presentmon',
  fps: {
    currentFps: null,
    averageFps: null,
    low1PercentFps: null,
    low01PercentFps: null,
    maxFps: null,
    currentFrameTimeMs: null,
    avgFrameTimeMs: null,
    minFrameTimeMs: null,
    maxFrameTimeMs: null,
    p95FrameTimeMs: null,
    spikeCount: 0,
    stutterCount: 0,
    framePacingStabilityPercent: null,
    droppedFrames: 0,
  },
  frameTimeHistory: [],
  inputLatencyMs: null,
  inputLatencyNote: 'Requires game integration or PresentMon ETW telemetry',
  pingMs: null,
  packetLossPercent: null,
  pingHost: '1.1.1.1',
  thermalThrottlingDetected: false,
  bottleneckAnalysis: {
    ready: false,
    sampleCount: 0,
    requiredSamples: 5,
    thermalThrottlingDetected: false,
    findings: [],
  },
  sessionAverages: {
    avgCpuPercent: null,
    avgGpuPercent: null,
    avgRamPercent: null,
    peakCpuTempC: null,
    peakGpuTempC: null,
    peakVramUsedMB: null,
  },
};

export function isValidMetric(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatPercent(value: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(value)) return naLabel;
  const clamped = Math.max(0, Math.min(100, value));
  return `${clamped.toFixed(clamped >= 100 || clamped === 0 ? 0 : 1)}%`;
}

export function formatFps(value: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(value) || value <= 0) return naLabel;
  return `${Math.round(value)} FPS`;
}

export function formatFrameTimeMs(value: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(value) || value <= 0) return naLabel;
  return `${value.toFixed(1)} ms`;
}

export function formatPingMs(value: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(value) || value < 0) return naLabel;
  return `${Math.round(value)} ms`;
}

export function formatTemperatureC(celsius: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(celsius) || celsius <= 0) return naLabel;
  return `${Math.round(celsius)} °C`;
}

export function formatClockGhz(ghz: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(ghz) || ghz <= 0) return naLabel;
  return `${ghz.toFixed(2)} GHz`;
}

export function formatClockMhz(mhz: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(mhz) || mhz <= 0) return naLabel;
  return `${Math.round(mhz)} MHz`;
}

export function formatPowerWatts(watts: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(watts) || watts < 0) return naLabel;
  return `${watts.toFixed(1)} W`;
}

export function formatStorageBytes(bytes: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(bytes) || bytes < 0) return naLabel;
  if (bytes === 0) return '0 B';
  const tb = bytes / (1024 ** 4);
  if (tb >= 1) {
    return `${tb.toFixed(2)} TB`;
  }
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) {
    return `${gb.toFixed(gb >= 100 ? 0 : 1)} GB`;
  }
  const mb = bytes / (1024 ** 2);
  if (mb >= 1) {
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export function formatVramMB(mb: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(mb) || mb < 0) return naLabel;
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${Math.round(mb)} MB`;
}

export function formatDiskSpeed(bytesPerSec: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(bytesPerSec) || bytesPerSec < 0) return naLabel;
  const mbPerSec = bytesPerSec / (1024 * 1024);
  if (mbPerSec >= 1) {
    return `${mbPerSec.toFixed(mbPerSec >= 100 ? 0 : 1)} MB/s`;
  }
  const kbPerSec = bytesPerSec / 1024;
  return `${kbPerSec.toFixed(kbPerSec >= 10 ? 0 : 1)} KB/s`;
}

export function formatNetworkSpeed(bytesPerSec: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(bytesPerSec) || bytesPerSec < 0) return naLabel;
  const mbPerSec = bytesPerSec / (1024 * 1024);
  if (mbPerSec >= 1) {
    return `${mbPerSec.toFixed(2)} MB/s`;
  }
  const kbPerSec = bytesPerSec / 1024;
  return `${kbPerSec.toFixed(kbPerSec >= 100 ? 0 : 1)} KB/s`;
}

export function formatUptime(seconds: number | null | undefined, naLabel = 'N/A'): string {
  if (!isValidMetric(seconds) || seconds < 0) return naLabel;
  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatFanSpeed(
  rpm: number | null | undefined,
  percent: number | null | undefined,
  naLabel = 'N/A'
): string {
  const hasRpm = isValidMetric(rpm) && rpm >= 0;
  const hasPct = isValidMetric(percent) && percent >= 0;
  if (hasRpm && hasPct) return `${Math.round(rpm)} RPM (${Math.round(percent)}%)`;
  if (hasRpm) return `${Math.round(rpm)} RPM`;
  if (hasPct) return `${Math.round(percent)}%`;
  return naLabel;
}

export function getPrimaryDriveSummary(
  drives: HardwareStorageDriveMetrics[]
): HardwareStorageDriveMetrics | null {
  if (!drives || drives.length === 0) return null;
  return drives[0];
}

export function getActiveNetworkLabel(
  iface: HardwareNetworkInterfaceMetrics | null,
  naLabel = 'N/A'
): string {
  if (!iface) return naLabel;
  return iface.displayName || iface.iface || naLabel;
}

export function selectPrimaryGpu(
  gpus: HardwareGpuMetrics[] | null | undefined
): HardwareGpuMetrics | null {
  if (!gpus || gpus.length === 0) return null;
  if (gpus.length === 1) return gpus[0];

  const scoreGpu = (gpu: HardwareGpuMetrics): number => {
    const model = String(gpu.model || '').toLowerCase();
    const mfg = String(gpu.manufacturer || '').toLowerCase();
    let score = 0;

    if (
      model.includes('microsoft basic') ||
      model.includes('virtual') ||
      model.includes('parsec') ||
      model.includes('vnc') ||
      model.includes('citrix') ||
      model.includes('mirage')
    ) {
      score -= 100;
    } else if (
      mfg.includes('nvidia') ||
      model.includes('geforce') ||
      model.includes('rtx') ||
      model.includes('gtx') ||
      model.includes('quadro')
    ) {
      score += 100;
    } else if (
      /\brx\s*\d{3,4}/i.test(model) ||
      model.includes('radeon pro') ||
      (mfg.includes('intel') && /\barc\b.*\b[ab]\d{3}/i.test(model))
    ) {
      score += 90;
    } else if (mfg.includes('amd') || model.includes('radeon')) {
      const isIgpu =
        model.includes('radeon(tm) graphics') ||
        model.includes('radeon graphics') ||
        /\b[678]\d0m\b/.test(model);
      score += isIgpu ? 30 : 55;
    } else if (mfg.includes('intel') || model.includes('uhd') || model.includes('iris')) {
      score += 25;
    } else {
      score += 10;
    }

    if (isValidMetric(gpu.temperatureCelsius) && gpu.temperatureCelsius > 0) score += 15;
    if (isValidMetric(gpu.vramTotalMB) && gpu.vramTotalMB >= 2048) score += 12;
    if (isValidMetric(gpu.utilizationPercent)) score += 6;
    if (isValidMetric(gpu.powerWatts)) score += 4;
    return score;
  };

  let best = gpus[0];
  let bestScore = scoreGpu(best);
  for (let i = 1; i < gpus.length; i++) {
    const s = scoreGpu(gpus[i]);
    if (s > bestScore) {
      best = gpus[i];
      bestScore = s;
    }
  }
  return best;
}
