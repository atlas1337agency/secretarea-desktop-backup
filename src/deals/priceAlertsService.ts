import { CheapSharkProvider } from './providers/cheapSharkProvider';
import { SteamDataProvider } from './providers/steamDataProvider';
import type {
  NormalizedDealGame,
  PriceAlertEvent,
  PriceAlertRule,
  SteamLiveRankEntry,
} from './types';

const RULES_STORAGE_KEY = 'secretarea_deals_price_alert_rules_v1';
const EVENTS_STORAGE_KEY = 'secretarea_deals_price_alert_events_v1';
const MAX_ALERT_EVENTS = 60;

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function loadPriceAlertRules(): PriceAlertRule[] {
  const list = safeReadJson<PriceAlertRule[]>(RULES_STORAGE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function savePriceAlertRules(rules: PriceAlertRule[]): void {
  safeWriteJson(RULES_STORAGE_KEY, rules);
}

export function loadPriceAlertEvents(): PriceAlertEvent[] {
  const list = safeReadJson<PriceAlertEvent[]>(EVENTS_STORAGE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function savePriceAlertEvents(events: PriceAlertEvent[]): void {
  safeWriteJson(EVENTS_STORAGE_KEY, events.slice(0, MAX_ALERT_EVENTS));
}

export function createRuleFromDealGame(
  game: NormalizedDealGame,
  targetPriceUsd: number | null = null
): PriceAlertRule {
  return {
    id: `rule:${game.canonicalKey}`,
    canonicalKey: game.canonicalKey,
    title: game.title,
    steamAppId: game.steamAppId,
    cheapsharkGameId: game.cheapsharkGameId,
    thumbUrl: game.thumbUrl,
    targetPriceUsd,
    lastKnownPriceUsd: game.bestOffer.salePrice,
    lastCheckedAt: Date.now(),
    createdAt: Date.now(),
  };
}

export function createRuleFromLiveEntry(
  entry: SteamLiveRankEntry,
  targetPriceUsd: number | null = null
): PriceAlertRule {
  return {
    id: `rule:steam:${entry.appId}:base`,
    canonicalKey: `steam:${entry.appId}:base`,
    title: entry.title,
    steamAppId: entry.appId,
    cheapsharkGameId: null,
    thumbUrl: entry.headerImage,
    targetPriceUsd,
    lastKnownPriceUsd: entry.salePriceUsd ?? entry.normalPriceUsd ?? null,
    lastCheckedAt: Date.now(),
    createdAt: Date.now(),
  };
}

export function followPriceAlertRule(rule: PriceAlertRule): PriceAlertRule[] {
  const existing = loadPriceAlertRules();
  const idx = existing.findIndex(
    (r) =>
      r.canonicalKey === rule.canonicalKey ||
      (rule.steamAppId && r.steamAppId === rule.steamAppId)
  );
  if (idx >= 0) {
    const next = [...existing];
    next[idx] = {
      ...next[idx],
      targetPriceUsd: rule.targetPriceUsd,
      cheapsharkGameId: rule.cheapsharkGameId || next[idx].cheapsharkGameId,
      thumbUrl: rule.thumbUrl || next[idx].thumbUrl,
    };
    savePriceAlertRules(next);
    return next;
  }
  const next = [rule, ...existing];
  savePriceAlertRules(next);
  return next;
}

export function unfollowPriceAlertRule(canonicalKeyOrRuleId: string): PriceAlertRule[] {
  const existing = loadPriceAlertRules();
  const next = existing.filter(
    (r) => r.canonicalKey !== canonicalKeyOrRuleId && r.id !== canonicalKeyOrRuleId
  );
  savePriceAlertRules(next);
  return next;
}

export function updateAlertTargetPrice(
  ruleId: string,
  targetPriceUsd: number | null
): PriceAlertRule[] {
  const existing = loadPriceAlertRules();
  const next = existing.map((r) =>
    r.id === ruleId ? { ...r, targetPriceUsd } : r
  );
  savePriceAlertRules(next);
  return next;
}

export function markAllPriceAlertEventsRead(): PriceAlertEvent[] {
  const events = loadPriceAlertEvents().map((e) => ({ ...e, read: true }));
  savePriceAlertEvents(events);
  return events;
}

export function clearPriceAlertEvents(): PriceAlertEvent[] {
  savePriceAlertEvents([]);
  return [];
}

/**
 * Evaluates all followed games against live CheapShark & SteamData prices.
 * Returns updated rules, full alert event feed, and newly triggered events.
 */
export async function checkFollowedPriceAlerts(forceRefresh = false): Promise<{
  rules: PriceAlertRule[];
  events: PriceAlertEvent[];
  newEvents: PriceAlertEvent[];
}> {
  const rules = loadPriceAlertRules();
  if (rules.length === 0) {
    return { rules, events: loadPriceAlertEvents(), newEvents: [] };
  }

  const stores = await CheapSharkProvider.getStores(forceRefresh).catch(() => []);
  const storesMap = new Map(stores.map((s) => [s.storeId, s]));
  const existingEvents = loadPriceAlertEvents();
  const newEvents: PriceAlertEvent[] = [];
  const updatedRules: PriceAlertRule[] = [];

  for (const rule of rules) {
    let csGameId = rule.cheapsharkGameId;
    let bestPriceUsd: number | null = null;
    let savingsPercent = 0;
    let storeName = 'PC Store';
    let dealUrl = rule.steamAppId
      ? `https://store.steampowered.com/app/${rule.steamAppId}/`
      : 'https://www.cheapshark.com/';

    try {
      if (!csGameId) {
        const searchMatches = await CheapSharkProvider.searchGamesMaster(
          rule.title,
          6,
          forceRefresh
        );
        const match =
          (rule.steamAppId &&
            searchMatches.find((m) => String(m.steamAppID || '') === rule.steamAppId)) ||
          searchMatches[0];
        if (match?.gameID) {
          csGameId = String(match.gameID);
        }
      }

      if (csGameId) {
        const comparison = await CheapSharkProvider.fetchGameComparison(
          csGameId,
          storesMap,
          forceRefresh
        );
        if (comparison?.bestOffer) {
          bestPriceUsd = comparison.bestOffer.salePrice;
          savingsPercent = comparison.bestOffer.savingsPercent;
          storeName = comparison.bestOffer.storeName;
          dealUrl = comparison.bestOffer.dealUrl;
        }
      }

      if (bestPriceUsd === null && rule.steamAppId) {
        const sdDetail = await SteamDataProvider.fetchAppDetail(rule.steamAppId, forceRefresh);
        const latestSale = sdDetail?.priceHistory[sdDetail.priceHistory.length - 1];
        if (latestSale) {
          bestPriceUsd = latestSale.priceUsd;
          savingsPercent = latestSale.discountPercent;
          storeName = 'Steam';
        }
      }
    } catch {
      // Keep previous baseline gracefully if provider throttles
    }

    const now = Date.now();
    if (bestPriceUsd !== null && Number.isFinite(bestPriceUsd)) {
      const prevPrice = rule.lastKnownPriceUsd;
      const droppedBelowPrevious = prevPrice !== null && bestPriceUsd < prevPrice - 0.01;
      const hitTarget =
        rule.targetPriceUsd !== null &&
        bestPriceUsd <= rule.targetPriceUsd + 0.01 &&
        (prevPrice === null || prevPrice > rule.targetPriceUsd + 0.01 || droppedBelowPrevious);

      if (droppedBelowPrevious || hitTarget) {
        const eventId = `drop:${rule.id}:${bestPriceUsd.toFixed(2)}:${Math.floor(
          now / (6 * 60 * 60 * 1000)
        )}`;
        const alreadyRecorded =
          existingEvents.some((e) => e.id === eventId) ||
          newEvents.some((e) => e.id === eventId);
        if (!alreadyRecorded) {
          newEvents.push({
            id: eventId,
            ruleId: rule.id,
            canonicalKey: rule.canonicalKey,
            title: rule.title,
            oldPriceUsd: prevPrice,
            newPriceUsd: bestPriceUsd,
            savingsPercent,
            storeName,
            dealUrl,
            triggeredAt: now,
            read: false,
          });
        }
      }

      updatedRules.push({
        ...rule,
        cheapsharkGameId: csGameId,
        lastKnownPriceUsd: bestPriceUsd,
        lastCheckedAt: now,
      });
    } else {
      updatedRules.push({
        ...rule,
        cheapsharkGameId: csGameId,
        lastCheckedAt: now,
      });
    }
  }

  savePriceAlertRules(updatedRules);
  const mergedEvents = [...newEvents, ...existingEvents].slice(0, MAX_ALERT_EVENTS);
  if (newEvents.length > 0) {
    savePriceAlertEvents(mergedEvents);
  }

  return {
    rules: updatedRules,
    events: mergedEvents,
    newEvents,
  };
}
