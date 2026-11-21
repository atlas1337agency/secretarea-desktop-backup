import type { GameItem, RawSheetRow } from '../types';
import { normalizeRow } from '../utils/parsers';

export const DEFAULT_STEPS =
  'Please if use Method "Master File Magnet" need to Download "qBittorrent" | if use "DataNodes (Speed & Usability)" or "FuckingFast (REALLY Fucking Fast)" need "JDownloader" this method not recomended because so slow and have more parts.';

export const DEFAULT_TOOLS =
  'qBittorrent^https://www.qbittorrent.org | JDownloader^https://jdownloader.org';

const DEFAULT_TRACKERS = [
  'udp%3A%2F%2Fopentor.net%3A6969%2Fannounce',
  'udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce',
  'udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce',
  'udp%3A%2F%2Ftracker.qu.ax%3A6969%2Fannounce',
  'udp%3A%2F%2Ftracker.fnix.net%3A6969%2Fannounce',
  'udp%3A%2F%2Fevan.im%3A6969%2Fannounce',
  'udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce',
  'udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce',
]
  .map((t) => `&tr=${t}`)
  .join('');

export function expandMagnet(rawOrHashes: string | undefined, name: string): string {
  if (!rawOrHashes || !rawOrHashes.trim()) return '';
  const parts = rawOrHashes
    .split(/\s+\|\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const dn = encodeURIComponent(name);
  return parts
    .map((p) => {
      if (p.startsWith('magnet:?')) return p;
      return `magnet:?xt=urn:btih:${p}&dn=${dn}${DEFAULT_TRACKERS}`;
    })
    .join(' ');
}

export interface CompactExtras {
  part2?: string;
  mirror2?: string;
  steps?: string;
  tools?: string;
  dodi?: string[];
  skidrow?: string[];
  steamrip?: string[];
  anker?: string[];
  unlock?: string[];
  pinned?: boolean;
  free?: boolean;
}

export function g(
  id: number | string,
  name: string,
  version: string,
  repackSize: string,
  originalSize: string,
  genres: string,
  languages: string,
  repackBy: string,
  coverImage: string,
  gallery: string,
  description: string,
  requirements: string,
  part1: string,
  mirror1: string,
  full: string,
  trailer: string,
  Date: string,
  extras?: CompactExtras
): GameItem {
  const normalizedRepackBy =
    repackBy.trim().toLowerCase() === 'fitgirl' ? 'FitGirl' : repackBy.trim();

  const row: RawSheetRow = {
    id,
    category: 'game',
    name,
    version,
    repackSize,
    originalSize,
    genres,
    languages,
    repackBy: normalizedRepackBy,
    coverImage,
    gallery,
    description,
    requirements,
    steps: extras?.steps ?? DEFAULT_STEPS,
    part1,
    mirror1,
    part2: extras?.part2 ?? '',
    mirror2: extras?.mirror2 ?? '',
    full: expandMagnet(full, name),
    trailer,
    pinned: extras?.pinned ?? false,
    tools: extras?.tools ?? DEFAULT_TOOLS,
    Free: extras?.free ?? false,
    Date,
    'dodi 1': extras?.dodi?.[0] ?? '',
    'dodi 2': extras?.dodi?.[1] ?? '',
    'dodi 3': extras?.dodi?.[2] ?? '',
    'skidrow 1': extras?.skidrow?.[0] ?? '',
    'skidrow 2': extras?.skidrow?.[1] ?? '',
    'skidrow 3': extras?.skidrow?.[2] ?? '',
    'steamrip 1': extras?.steamrip?.[0] ?? '',
    'steamrip 2': extras?.steamrip?.[1] ?? '',
    anker1: extras?.anker?.[0] ?? '',
    anker2: extras?.anker?.[1] ?? '',
    'unlock 01': extras?.unlock?.[0] ?? '',
    'unlock 02': extras?.unlock?.[1] ?? '',
    'unlock 03': extras?.unlock?.[2] ?? '',
  };

  return normalizeRow(row, 'game', Number(id) || 0);
}
