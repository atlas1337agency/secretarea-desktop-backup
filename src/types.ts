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

