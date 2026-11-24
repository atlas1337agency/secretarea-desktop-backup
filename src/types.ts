export type SheetTabKey =
  | 'game'
  | 'hypervisor'
  | 'steamtools'
  | 'architect'
  | 'extra'
  | 'upcoming'
  | 'steamaccounts'
  | 'mastergift'
  | 'profil'
  | 'topgames'
  | 'upcominglist'
  | 'popularrepacks'
  | 'bestgameseries'
  | 'maintenance'
  | 'upcomingtrailers'
  | 'ps5'
  | 'onlinegames';

export interface RawSheetRow {
  id?: string | number;
  category?: string;
  name?: string;
  title?: string;
  version?: string;
  repackSize?: string;
  originalSize?: string;
  genres?: string;
  languages?: string;
  repackBy?: string;
  coverImage?: string;
  image?: string;
  gallery?: string;
  description?: string;
  requirements?: string;
  steps?: string;
  part1?: string;
  mirror1?: string;
  part2?: string;
  mirror2?: string;
  full?: string;
  trailer?: string;
  pinned?: string | boolean;
  tools?: string;
  Free?: string | boolean;
  free?: string | boolean;
  Date?: string;
  date?: string;
  'dodi 1'?: string;
  'dodi 2'?: string;
  'dodi 3'?: string;
  'skidrow 1'?: string;
  'skidrow 2'?: string;
  'skidrow 3'?: string;
  'steamrip 1'?: string;
  'steamrip 2'?: string;
  anker1?: string;
  anker2?: string;
  'unlock 01'?: string;
  'unlock 02'?: string;
  'unlock 03'?: string;
  [key: string]: unknown;
}

export interface ParsedRequirements {
  os?: string;
  ram?: string;
  cpu?: string;
  gpu?: string;
  raw: string;
}

export interface ToolLink {
  name: string;
  url: string;
}

export interface MirrorLink {
  label: string;
  group:
    | 'Magnet Link'
    | 'Full Download'
    | 'MediaFire (Direct Link)'
    | 'Mega (Backup)'
    | 'FitGirl-Repacks'
    | 'DoDI-Repack'
    | 'Skidrow'
    | 'SteamRIP'
    | 'Direct Mirrors'
    | 'Anker'
    | 'Unlockers'
    | 'Resources';
  url: string;
  isMagnet: boolean;
}

export interface GameItem {
  id: string;
  tab: SheetTabKey;
  category: string;
  name: string;
  version: string;
  repackSize: string;
  repackSizeMB: number;
  originalSize: string;
  genreList: string[];
  genresRaw: string;
  languages: string;
  repackBy: string;
  coverImage: string;
  galleryImages: string[];
  galleryVideos: string[];
  description: string;
  parsedRequirements: ParsedRequirements;
  parsedSteps: string[];
  mirrors: MirrorLink[];
  primaryMagnet: string | null;
  trailerUrl: string;
  embedTrailerUrl: string | null;
  isPinned: boolean;
  isFree: boolean;
  isNew: boolean;
  parsedTools: ToolLink[];
  dateAdded: string;
  dateTimestamp: number;
  rawFields: Record<string, string>;
}

export type SheetCatalogData = Record<SheetTabKey, GameItem[]>;

export interface ReplyItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  reactions: {
    like: number;
    dislike: number;
    love: number;
  };
}

export interface CommentItem {
  id: string;
  itemId: string;
  author: string;
  text: string;
  tags: string[];
  reactions: {
    like: number;
    dislike: number;
    love: number;
  };
  timestamp: string;
  replies: ReplyItem[];
}

export interface ItemRequestPayload {
  id?: string;
  title: string;
  category: string;
  image?: string;
  message: string;
  timestamp?: string;
  status?: string;
  syncedToSheet?: boolean;
}

export type PrimarySection =
  | 'store'
  | 'library'
  | 'extras'
  | 'downloads'
  | 'requests'
  | 'studios'
  | 'hardware'
  | 'settings';

export type LibrarySectionTab =
  | 'game'
  | 'hypervisor'
  | 'steamtools'
  | 'ps5'
  | 'architect'
  | 'extra';

export type SortOption =
  | 'smart'
  | 'latest'
  | 'alphabetical'
  | 'alphabetical-desc'
  | 'favorites'
  | 'size-asc'
  | 'size-desc'
  | 'mirrors';

export type DownloadSourceType = 'direct' | 'mediafire' | 'mega' | 'qbittorrent' | 'browser';

export type DownloadStatus =
  | 'queued'
  | 'resolving'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface DownloadTask {
  id: string;
  title: string;
  fileName: string;
  url: string;
  resolvedUrl?: string;
  source: DownloadSourceType;
  channelGroup: string;
  coverImage?: string;
  gameId?: string;
  gameTab?: SheetTabKey;
  status: DownloadStatus;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  uploadSpeedBytesPerSec?: number;
  etaSeconds: number | null;
  savePath: string;
  canPauseResume: boolean;
  torrentHash?: string;
  torrentPeers?: number;
  torrentPeersTotal?: number;
  torrentSeeds?: number;
  torrentSeedsTotal?: number;
  torrentRatio?: number;
  torrentStateRaw?: string;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt?: number | null;
}

export interface TorrentIntegrationConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  apiKey?: string;
  hasSavedPassword?: boolean;
  hasSavedApiKey?: boolean;
  pollIntervalMs?: number;
}

export interface TorrentDetectionResult {
  installed: boolean;
  clientName: string;
  executablePath: string | null;
  openWebUiPorts: number[];
  recommendedHost: string;
  recommendedPort: number;
  isRunning: boolean;
  downloadUrl: string;
}

export interface TorrentConnectionTestResult {
  ok: boolean;
  version?: string;
  webApiVersion?: string;
  activeCount?: number;
  authMethod?: 'cookie' | 'api-key' | 'localhost-bypass';
  message: string;
  hint?: string;
}

export interface DownloadManagerSnapshot {
  tasks: DownloadTask[];
  downloadFolder: string;
  maxConcurrent: number;
  torrentConfig: TorrentIntegrationConfig;
  torrentConnected: boolean;
  torrentVersion?: string | null;
  torrentWebApiVersion?: string | null;
  torrentError?: string | null;
}

export type QbitSetupStage =
  | 'idle'
  | 'checking_dependencies'
  | 'detecting_qbit'
  | 'fetching_release'
  | 'ready'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'configuring'
  | 'waiting_for_close'
  | 'completed'
  | 'error';

export type QbitSetupActionNeeded =
  | 'install_required'
  | 'update_available'
  | 'up_to_date'
  | 'newer_installed'
  | 'close_required_for_update'
  | 'unknown_latest';

export interface QbitReleaseInfo {
  version: string;
  tagName: string;
  publishedAt: string | null;
  releaseUrl: string;
  assetName: string;
  assetUrl: string;
  assetSizeBytes: number;
  expectedSha256: string | null;
  source: 'github_api' | 'official_website' | 'unavailable';
}

export interface QbitVerificationInfo {
  sha256Actual: string | null;
  sha256Expected: string | null;
  sha256Verified: boolean;
  signatureStatus: string;
  publisher: string | null;
  signatureVerified: boolean;
}

export interface QbitWebUiConfigInfo {
  iniPath: string | null;
  configFound: boolean;
  webUiEnabled: boolean;
  address: string;
  port: number;
  username: string;
  isLoopbackOnly: boolean;
}

export interface QbitSetupState {
  stage: QbitSetupStage;
  actionNeeded: QbitSetupActionNeeded | null;
  platformSupported: boolean;
  installed: boolean;
  installedVersion: string | null;
  executablePath: string | null;
  isRunning: boolean;
  latestRelease: QbitReleaseInfo | null;
  releaseError: string | null;
  releaseErrorCode: 'offline' | 'rate_limited' | 'asset_missing' | 'http_error' | null;
  downloadProgress: {
    percent: number;
    downloadedBytes: number;
    totalBytes: number;
    speedBytesPerSec: number;
    etaSeconds: number | null;
  } | null;
  verification: QbitVerificationInfo | null;
  webUiConfig: QbitWebUiConfigInfo;
  webUiVerifiedConnected: boolean;
  error: string | null;
  statusMessage: string;
  officialDownloadUrl: string;
  shouldPromptOnFirstLaunch: boolean;
  firstLaunchDismissed: boolean;
  lastCheckedAt: number | null;
}

export type PresentMonSetupStage =
  | 'idle'
  | 'checking'
  | 'ready'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'waiting_for_close'
  | 'completed'
  | 'error'
  | 'cancelled';

export type PresentMonSetupActionNeeded =
  | 'install_required'
  | 'update_available'
  | 'repair_required'
  | 'up_to_date'
  | 'newer_installed'
  | 'close_required_for_update';

export interface PresentMonReleaseInfo {
  version: string;
  tagName: string;
  publishedAt: string | null;
  releaseUrl: string;
  assetName: string;
  assetUrl: string;
  assetKind: 'exe' | 'zip' | 'msi';
  assetSizeBytes: number;
  expectedSha256: string | null;
  releaseNotes?: string;
  source: 'github_api' | 'unavailable';
}

export interface PresentMonVerificationInfo {
  sha256Actual: string | null;
  sha256Expected: string | null;
  sha256Verified: boolean;
  signatureStatus: string;
  publisher: string | null;
  signatureVerified: boolean;
}

export interface PresentMonCliCapabilities {
  functional: boolean;
  doubleDash: boolean;
  supportsProcessId: boolean;
  supportsOutputStdout: boolean;
  supportsNoTop: boolean;
  supportsTerminateOnExit: boolean;
  supportsV1Metrics: boolean;
}

export interface PresentMonSetupState {
  stage: PresentMonSetupStage;
  actionNeeded: PresentMonSetupActionNeeded | null;
  platformSupported: boolean;
  installed: boolean;
  healthy: boolean;
  healthIssue: string | null;
  installSource: 'managed' | 'bundled' | 'system_msi' | 'system_path' | null;
  installedVersion: string | null;
  executablePath: string | null;
  installDirectory: string | null;
  cliCapabilities: PresentMonCliCapabilities | null;
  isRunning: boolean;
  latestRelease: PresentMonReleaseInfo | null;
  releaseError: string | null;
  releaseErrorCode: 'offline' | 'rate_limited' | 'asset_missing' | 'http_error' | null;
  downloadProgress: {
    percent: number;
    downloadedBytes: number;
    totalBytes: number;
    speedBytesPerSec: number;
    etaSeconds: number | null;
  } | null;
  verification: PresentMonVerificationInfo | null;
  error: string | null;
  statusMessage: string;
  officialReleasesUrl: string;
  shouldPrompt: boolean;
  declinedForVersion: string | null;
  dismissedForVersion: string | null;
  lastCheckedAt: number | null;
}

export type CloseBehaviorMode = 'minimize-to-tray' | 'exit';

export type HardwareTechStatus =
  | 'supported'
  | 'detected'
  | 'active'
  | 'unsupported'
  | 'unavailable'
  | 'requires_game_integration'
  | 'requires_driver_or_sdk';

export interface GpuTechnologyFeature {
  id: string;
  name: string;
  vendor: 'NVIDIA' | 'AMD' | 'Intel' | string;
  status: HardwareTechStatus;
  hardwareSupported: boolean;
  activeState: boolean | null;
  detail: string;
}

export interface GpuCapabilitiesProfile {
  gpuId: string;
  model: string | null;
  vendor: string;
  architecture: string | null;
  driverVersion: string | null;
  resizableBarActive: boolean | null;
  isIntegrated: boolean;
  features: GpuTechnologyFeature[];
}

export interface DisplayMonitorInfo {
  id: string;
  model: string;
  isPrimary: boolean;
  width: number | null;
  height: number | null;
  resolutionText: string | null;
  refreshRateHz: number | null;
  connectionType: string | null;
  builtin: boolean;
}

export interface DisplayCapabilitiesProfile {
  monitors: DisplayMonitorInfo[];
  primaryMonitor: DisplayMonitorInfo | null;
  activeRenderingGpu: string | null;
  directXVersion: string | null;
  hagsStatus: string | null;
  windowsGameMode: string | null;
  hdrSupported: boolean | null;
  hdrActive: boolean | null;
  vrrSupported: boolean | null;
  vrrActive: boolean | null;
}

export interface LaptopCapabilitiesProfile {
  isLaptopOrBatteryDevice: boolean;
  batteryPercent: number | null;
  acConnected: boolean | null;
  isCharging: boolean | null;
  batteryHealthPercent: number | null;
  powerPlan: string | null;
  hybridGpuMode: string | null;
}

export interface HardwareCpuMetrics {
  model: string | null;
  manufacturer: string | null;
  series?: string | null;
  generation?: string | null;
  usagePercent: number | null;
  temperatureCelsius: number | null;
  clockSpeedGhz: number | null;
  physicalCores: number | null;
  logicalThreads: number | null;
  powerWatts: number | null;
  coreLoads: number[];
}

export interface HardwareGpuMetrics {
  id: string;
  model: string | null;
  manufacturer: string | null;
  utilizationPercent: number | null;
  temperatureCelsius: number | null;
  vramUsedMB: number | null;
  vramTotalMB: number | null;
  clockSpeedMhz: number | null;
  fanSpeedPercent: number | null;
  fanSpeedRpm: number | null;
  powerWatts: number | null;
}

export interface HardwareRamMetrics {
  totalBytes: number | null;
  usedBytes: number | null;
  availableBytes: number | null;
  usagePercent: number | null;
  memoryType: string | null;
  speedMhz: number | null;
  populatedSlots?: number | null;
  channelMode?: string | null;
}

export interface HardwareStorageDriveMetrics {
  id: string;
  name: string;
  model: string | null;
  mount: string | null;
  driveType: string | null;
  totalBytes: number | null;
  usedBytes: number | null;
  freeBytes: number | null;
  usagePercent: number | null;
  readBytesPerSec: number | null;
  writeBytesPerSec: number | null;
  temperatureCelsius: number | null;
}

export interface HardwareNetworkInterfaceMetrics {
  iface: string;
  displayName: string;
  type: string | null;
  operstate: string | null;
  downloadBytesPerSec: number | null;
  uploadBytesPerSec: number | null;
  totalRxBytes: number | null;
  totalTxBytes: number | null;
  speedMbps: number | null;
  isActive: boolean;
}

export interface HardwareMonitorSnapshot {
  timestamp: number;
  platform: string;
  hostname: string | null;
  uptimeSeconds: number | null;
  isMonitoring: boolean;
  intervalMs: number;
  cpu: HardwareCpuMetrics;
  gpus: HardwareGpuMetrics[];
  ram: HardwareRamMetrics;
  storage: HardwareStorageDriveMetrics[];
  storageTotals: {
    totalBytes: number | null;
    usedBytes: number | null;
    freeBytes: number | null;
    usagePercent: number | null;
    readBytesPerSec: number | null;
    writeBytesPerSec: number | null;
  };
  network: {
    activeInterface: HardwareNetworkInterfaceMetrics | null;
    interfaces: HardwareNetworkInterfaceMetrics[];
    totalDownloadBytesPerSec: number | null;
    totalUploadBytesPerSec: number | null;
  };
  capabilities?: {
    gpuTechnologies: GpuCapabilitiesProfile[];
    display: DisplayCapabilitiesProfile | null;
    laptop: LaptopCapabilitiesProfile | null;
  } | null;
}

export interface GamingProcessCandidate {
  pid: number;
  name: string;
  windowTitle: string | null;
  memoryMB: number | null;
}

export interface GamingFpsSummary {
  currentFps: number | null;
  averageFps: number | null;
  low1PercentFps: number | null;
  low01PercentFps: number | null;
  maxFps: number | null;
  currentFrameTimeMs: number | null;
  avgFrameTimeMs: number | null;
  minFrameTimeMs: number | null;
  maxFrameTimeMs: number | null;
  p95FrameTimeMs: number | null;
  spikeCount: number;
  stutterCount: number;
  framePacingStabilityPercent: number | null;
  droppedFrames: number;
}

export interface GamingBottleneckFinding {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: 'high' | 'medium';
  title: string;
  cause: string;
  recommendations: string[];
}

export interface GamingBottleneckAnalysis {
  ready: boolean;
  sampleCount: number;
  requiredSamples: number;
  thermalThrottlingDetected: boolean;
  findings: GamingBottleneckFinding[];
}

export interface GamingSessionState {
  isActive: boolean;
  sessionId: string | null;
  processName: string | null;
  pid: number | null;
  startedAt: number | null;
  durationSeconds: number;
  presentMonAvailable: boolean;
  presentMonPath: string | null;
  fpsTelemetryStatus: 'ready' | 'waiting_frames' | 'active' | 'requires_presentmon' | 'unavailable_on_os';
  fps: GamingFpsSummary;
  frameTimeHistory: number[];
  inputLatencyMs: number | null;
  inputLatencyNote: string;
  pingMs: number | null;
  packetLossPercent: number | null;
  pingHost: string;
  thermalThrottlingDetected: boolean;
  bottleneckAnalysis: GamingBottleneckAnalysis;
  sessionAverages: {
    avgCpuPercent: number | null;
    avgGpuPercent: number | null;
    avgRamPercent: number | null;
    peakCpuTempC: number | null;
    peakGpuTempC: number | null;
    peakVramUsedMB: number | null;
  };
}

export interface GamingSessionHistoryItem {
  sessionId: string;
  processName: string | null;
  startedAt: number | null;
  endedAt: number;
  durationSeconds: number;
  averageFps: number | null;
  low1PercentFps: number | null;
  low01PercentFps: number | null;
  maxFps: number | null;
  avgFrameTimeMs: number | null;
  stutterCount: number;
  avgCpuPercent: number | null;
  avgGpuPercent: number | null;
  avgRamPercent: number | null;
  peakCpuTempC: number | null;
  peakGpuTempC: number | null;
  pingMs: number | null;
  packetLossPercent: number | null;
  bottleneckIds: string[];
  thermalThrottlingDetected: boolean;
}

export interface CleanerCategoryScan {
  id:
    | 'old_temp'
    | 'user_temp'
    | 'app_cache'
    | 'secretarea_cache'
    | 'thumbnail_cache'
    | 'dx_shader_cache'
    | 'recycle_bin'
    | 'browser_cache';
  defaultSelected: boolean;
  optInWarning: boolean;
  supported: boolean;
  paths: string[];
  fileCount: number;
  estimatedBytes: number;
}

export interface CleanerScanResult {
  confirmationToken: string;
  scannedAt: number;
  totalEstimatedBytes: number;
  categories: CleanerCategoryScan[];
}

export interface CleanerCleanResult {
  cleanedAt: number;
  cleanedBytes: number;
  cleanedFiles: number;
  skippedLockedCount: number;
  cancelled: boolean;
  categoryResults: Array<{
    id: string;
    cleanedBytes: number;
    cleanedFiles: number;
    skippedLockedCount: number;
  }>;
}

export interface CleanerProgressEvent {
  phase: 'scanning' | 'scan_complete' | 'cleaning' | 'clean_complete';
  categoryId: string | null;
  percent: number;
  currentPath: string | null;
}

