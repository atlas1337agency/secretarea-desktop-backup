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

export type PrimarySection = 'store' | 'library' | 'extras' | 'requests' | 'studios';

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

