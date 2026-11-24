import type { SheetCatalogData } from '../types';
import { ALL_SHEET_TABS } from '../utils/parsers';

export const IMAGE_CACHE_NAME = 'secretarea-images-v1';

let isPrecaching = false;

export function collectCatalogImageUrls(catalog: SheetCatalogData): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const pushUrl = (raw?: string) => {
    if (!raw || typeof raw !== 'string') return;
    const clean = raw.trim();
    if (!/^https?:\/\//i.test(clean)) return;
    if (!seen.has(clean)) {
      seen.add(clean);
      urls.push(clean);
    }
  };

  const pushItemMedia = (item: SheetCatalogData[keyof SheetCatalogData][number]) => {
    pushUrl(item.coverImage);
    if (item.galleryImages?.[0]) {
      pushUrl(item.galleryImages[0]);
    }
    pushUrl(item.rawFields?.background);
    pushUrl(item.rawFields?.banner);
    pushUrl(item.rawFields?.logo);
    if (item.rawFields?.images) {
      for (const token of item.rawFields.images.split(/[\n,|]+/)) {
        pushUrl(token);
      }
    }
  };

  // Prioritize Home/Store/Extras/Studio sections first so visible pages are cached fastest
  const priorityTabs: (keyof SheetCatalogData)[] = [
    'popularrepacks',
    'onlinegames',
    'profil',
    'upcomingtrailers',
    'bestgameseries',
    'topgames',
    'upcoming',
    'ps5',
    'game',
    'hypervisor',
    'steamtools',
    'architect',
    'extra',
  ];

  const orderedTabs = [
    ...priorityTabs,
    ...ALL_SHEET_TABS.filter((tab) => !priorityTabs.includes(tab)),
  ];

  for (const tab of orderedTabs) {
    const items = catalog[tab] || [];
    for (const item of items) {
      pushItemMedia(item);
    }
  }

  return urls;
}

function yieldToIdle(ms = 180): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    const timer = window.setTimeout(() => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback;
      if (typeof ric === 'function') {
        ric(() => resolve(), { timeout: 300 });
      } else {
        resolve();
      }
    }, ms);
    void timer;
  });
}

/**
 * Quietly pre-caches all catalog cover & backdrop images into CacheStorage
 * while online so every tab, page, and card displays images in Offline Mode.
 */
export async function precacheCatalogImages(catalog: SheetCatalogData): Promise<void> {
  if (
    isPrecaching ||
    typeof window === 'undefined' ||
    !('caches' in window) ||
    !navigator.onLine
  ) {
    return;
  }

  isPrecaching = true;
  try {
    // Let initial UI interactions and animations settle before background image caching
    await yieldToIdle(2000);
    if (!navigator.onLine) return;

    const allUrls = collectCatalogImageUrls(catalog);
    if (allUrls.length === 0) return;

    const cache = await window.caches.open(IMAGE_CACHE_NAME);
    const existingKeys = await cache.keys();
    const cachedSet = new Set(existingKeys.map((req) => req.url));

    const missing = allUrls.filter((u) => !cachedSet.has(u));
    if (missing.length === 0) return;

    const BATCH_SIZE = 2;
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      if (!navigator.onLine) break;

      const batch = missing.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (url) => {
          try {
            const response = await fetch(url, {
              method: 'GET',
              mode: 'no-cors',
              referrerPolicy: 'no-referrer',
            });
            if (response && (response.ok || response.type === 'opaque')) {
              await cache.put(url, response);
            }
          } catch {
            // Skip unreachable image hosts gracefully
          }
        })
      );

      await yieldToIdle(180);
    }
  } catch {
    // Ignore storage quota or browser cache errors cleanly
  } finally {
    isPrecaching = false;
  }
}
