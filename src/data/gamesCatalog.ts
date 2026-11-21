import type { GameItem, RawSheetRow, SheetCatalogData, SheetTabKey } from '../types';
import { markLatestThreeNewGames, normalizeRow } from '../utils/parsers';
import { GAMES_BATCH_1 } from './gamesBatch1';
import { GAMES_BATCH_2 } from './gamesBatch2';
import { GAMES_BATCH_3 } from './gamesBatch3';
import { GAMES_BATCH_4 } from './gamesBatch4';
import { GAMES_BATCH_5 } from './gamesBatch5';
import { GAMES_BATCH_6 } from './gamesBatch6';
import { GAMES_BATCH_7 } from './gamesBatch7';
import { GAMES_BATCH_8 } from './gamesBatch8';
import extrasSnapshotRaw from './sheetExtrasSnapshot.json';

export const GAMES_CATALOG: GameItem[] = markLatestThreeNewGames([
  ...GAMES_BATCH_1,
  ...GAMES_BATCH_2,
  ...GAMES_BATCH_3,
  ...GAMES_BATCH_4,
  ...GAMES_BATCH_5,
  ...GAMES_BATCH_6,
  ...GAMES_BATCH_7,
  ...GAMES_BATCH_8,
]);

function normalizeTabSnapshot(tab: SheetTabKey): GameItem[] {
  const map = extrasSnapshotRaw as Record<string, RawSheetRow[]>;
  const rows = Array.isArray(map[tab]) ? map[tab] : [];
  return rows.map((row, idx) => normalizeRow(row, tab, idx));
}

export const DEFAULT_CATALOG: SheetCatalogData = {
  game: GAMES_CATALOG,
  hypervisor: normalizeTabSnapshot('hypervisor'),
  steamtools: normalizeTabSnapshot('steamtools'),
  architect: normalizeTabSnapshot('architect'),
  extra: normalizeTabSnapshot('extra'),
  upcoming: normalizeTabSnapshot('upcoming'),
  steamaccounts: normalizeTabSnapshot('steamaccounts'),
  mastergift: normalizeTabSnapshot('mastergift'),
  profil: normalizeTabSnapshot('profil'),
  topgames: normalizeTabSnapshot('topgames'),
  upcominglist: normalizeTabSnapshot('upcominglist'),
  popularrepacks: normalizeTabSnapshot('popularrepacks'),
  bestgameseries: normalizeTabSnapshot('bestgameseries'),
  maintenance: normalizeTabSnapshot('maintenance'),
  upcomingtrailers: normalizeTabSnapshot('upcomingtrailers'),
  ps5: normalizeTabSnapshot('ps5'),
  onlinegames: normalizeTabSnapshot('onlinegames'),
};
