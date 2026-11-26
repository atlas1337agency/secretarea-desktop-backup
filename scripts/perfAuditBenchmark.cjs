const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Module = require('node:module');

let mockUserDataDir = os.tmpdir();
const origModuleLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'electron') {
    return {
      app: { getPath: (name) => (name === 'userData' ? mockUserDataDir : mockUserDataDir) },
      BrowserWindow: class {},
      ipcMain: { handle: () => {} },
      session: { defaultSession: { on: () => {} } },
      safeStorage: { isEncryptionAvailable: () => false },
      net: { fetch: (...args) => globalThis.fetch(...args) },
    };
  }
  return origModuleLoad.call(this, request, parent, isMain);
};

async function measureModuleLoads() {
  const modules = [
    '../electron/downloadManager.cjs',
    '../electron/hardwareMonitor.cjs',
    '../electron/hardware/gamingSessionManager.cjs',
    '../electron/hardware/openSourceToolsManager.cjs',
    '../electron/hardware/hardwareIntelligenceIpc.cjs',
  ];
  const results = [];
  for (const modPath of modules) {
    const abs = path.resolve(__dirname, modPath);
    const rssBefore = process.memoryUsage().rss;
    const heapBefore = process.memoryUsage().heapUsed;
    const t0 = performance.now();
    require(abs);
    const dt = performance.now() - t0;
    const rssAfter = process.memoryUsage().rss;
    const heapAfter = process.memoryUsage().heapUsed;
    results.push({
      module: path.basename(modPath),
      loadMs: Number(dt.toFixed(2)),
      heapDeltaKB: Number(((heapAfter - heapBefore) / 1024).toFixed(1)),
      rssDeltaKB: Number(((rssAfter - rssBefore) / 1024).toFixed(1)),
    });
  }
  return results;
}

async function benchmarkDownloadManager() {
  const { createDownloadManager } = require('../electron/downloadManager.cjs');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-perf-dl-'));
  mockUserDataDir = tmpDir;
  const stateFile = path.join(tmpDir, 'downloads-state.json');

  // Intercept synchronous writeFileSync & async writeFile calls inside tmpDir during benchmark
  const origWriteFileSync = fs.writeFileSync;
  const origWriteFile = fs.promises.writeFile;
  let syncWritesToState = 0;
  let asyncWritesToState = 0;
  let totalSyncWriteMs = 0;

  fs.writeFileSync = function patchedSync(target, ...rest) {
    if (String(target).startsWith(tmpDir)) {
      syncWritesToState += 1;
      const t0 = performance.now();
      const out = origWriteFileSync.call(fs, target, ...rest);
      totalSyncWriteMs += performance.now() - t0;
      return out;
    }
    return origWriteFileSync.call(fs, target, ...rest);
  };

  fs.promises.writeFile = async function patchedAsync(target, ...rest) {
    if (String(target).startsWith(tmpDir)) {
      asyncWritesToState += 1;
    }
    return origWriteFile.call(fs.promises, target, ...rest);
  };

  let ipcSendCount = 0;
  const fakeWindow = {
    isDestroyed: () => false,
    isMinimized: () => false,
    isVisible: () => true,
    webContents: {
      send: (channel) => {
        if (channel === 'downloads:updated') ipcSendCount += 1;
      },
    },
  };

  // Populate 60 realistic tasks as JSON array (matching readPersistedTasks format)
  const seedTasks = Array.from({ length: 60 }, (_, idx) => ({
    id: `dl-seed-${idx}`,
    title: `Game Archive Part ${idx + 1}`,
    fileName: `game_part_${idx + 1}.rar`,
    url: `https://example.com/file_${idx + 1}.rar`,
    source: idx < 5 ? 'qbittorrent' : 'direct',
    channelGroup: idx < 5 ? 'Magnet Link' : 'Direct Mirrors',
    status: idx === 0 ? 'downloading' : 'completed',
    progress: idx === 0 ? 15 : 100,
    downloadedBytes: idx === 0 ? 150_000_000 : 1_000_000_000,
    totalBytes: 1_000_000_000,
    speedBytesPerSec: idx === 0 ? 12_500_000 : 0,
    etaSeconds: idx === 0 ? 68 : 0,
    savePath: path.join(tmpDir, `game_part_${idx + 1}.rar`),
    canPauseResume: true,
    torrentHash: idx < 5 ? `hash${idx}`.padStart(40, '0').toUpperCase() : undefined,
    createdAt: Date.now() - 86_400_000,
    updatedAt: Date.now() - 10_000,
  }));
  origWriteFileSync.call(fs, stateFile, JSON.stringify(seedTasks, null, 2));

  try {
    const ipcHandlers = new Map();
    const fakeIpcMain = {
      handle: (channel, fn) => ipcHandlers.set(channel, fn),
    };

    const dm = createDownloadManager({
      app: {
        getPath: () => tmpDir,
      },
      shell: {},
      dialog: {},
      getMainWindow: () => fakeWindow,
    });
    dm.registerIpc(fakeIpcMain, () => true);
    dm.init();

    await new Promise((r) => setTimeout(r, 40));

    // Mock local qBittorrent WebUI HTTP server
    const http = require('node:http');
    let progressTick = 0;
    let simulateIdle = false;
    let httpPollRequests = 0;
    const server = http.createServer((req, res) => {
      if (req.url === '/api/v2/auth/login') {
        res.writeHead(200, { 'Set-Cookie': 'SID=test-sid; Path=/', 'Content-Type': 'text/plain' });
        res.end('Ok.');
        return;
      }
      if (req.url === '/api/v2/app/version') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('v5.0.0');
        return;
      }
      if (req.url === '/api/v2/app/webapiVersion') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('2.11.0');
        return;
      }
      if (req.url === '/api/v2/torrents/info') {
        httpPollRequests += 1;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const list = Array.from({ length: 5 }, (_, i) => {
          const isAct = i === 0 && !simulateIdle;
          const prog = isAct ? Math.min(0.99, 0.1 + progressTick * 0.02) : 1;
          return {
            hash: `hash${i}`.padStart(40, '0'),
            name: `game_part_${i + 1}.rar`,
            progress: prog,
            size: 1_000_000_000,
            downloaded: Math.round(prog * 1_000_000_000),
            dlspeed: isAct ? 15_000_000 : 0,
            upspeed: 0,
            eta: isAct ? 120 : 0,
            state: isAct ? 'downloading' : 'pausedUP',
            save_path: tmpDir,
            content_path: path.join(tmpDir, `game_part_${i + 1}.rar`),
            num_seeds: 5,
            num_complete: 20,
            num_leechs: 3,
            num_incomplete: 8,
            ratio: 1.2,
            added_on: 1700000000,
          };
        });
        res.end(JSON.stringify(list));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    try {
      const saveTorrent = ipcHandlers.get('downloads:save-torrent-config');
      const cfgSnap = await saveTorrent(
        { sender: null },
        {
          enabled: true,
          host: '127.0.0.1',
          port,
          username: '',
          password: '',
        }
      );
      if (!cfgSnap?.torrentConnected) {
        console.error('[bench] torrentError:', cfgSnap?.torrentError);
      }

      syncWritesToState = 0;
      asyncWritesToState = 0;
      totalSyncWriteMs = 0;
      ipcSendCount = 0;
      httpPollRequests = 0;

      // Phase A: 3.3s with active downloading torrent advancing each second
      const phaseAStart = performance.now();
      for (let i = 0; i < 6; i++) {
        progressTick += 1;
        await new Promise((r) => setTimeout(r, 550));
      }
      const phaseADur = performance.now() - phaseAStart;
      const phaseARes = {
        durationMs: Number(phaseADur.toFixed(1)),
        httpPollRequests,
        ipcBroadcasts: ipcSendCount,
        syncDiskWrites: syncWritesToState,
        asyncDiskWrites: asyncWritesToState,
        syncWriteMs: Number(totalSyncWriteMs.toFixed(2)),
      };

      // Phase B: All torrents paused/completed + zero changes for 3.3s
      simulateIdle = true;
      await new Promise((r) => setTimeout(r, 1650)); // let completion settle cleanly
      syncWritesToState = 0;
      asyncWritesToState = 0;
      totalSyncWriteMs = 0;
      ipcSendCount = 0;
      httpPollRequests = 0;

      const phaseBStart = performance.now();
      await new Promise((r) => setTimeout(r, 3300));
      const phaseBDur = performance.now() - phaseBStart;
      const phaseBRes = {
        durationMs: Number(phaseBDur.toFixed(1)),
        httpPollRequestsWhenIdle: httpPollRequests,
        ipcBroadcastsWhenUnchanged: ipcSendCount,
        syncDiskWritesWhenUnchanged: syncWritesToState,
      };

      dm.shutdown();
      return { activePhase: phaseARes, unchangedPhase: phaseBRes };
    } finally {
      server.close();
    }
  } finally {
    fs.writeFileSync = origWriteFileSync;
    fs.promises.writeFile = origWriteFile;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function benchmarkHardwareMonitor() {
  const { createHardwareMonitor } = require('../electron/hardwareMonitor.cjs');
  let sent = 0;
  const hw = createHardwareMonitor({
    getMainWindow: () => ({
      isDestroyed: () => false,
      webContents: {
        send: () => {
          sent += 1;
        },
      },
    }),
  });

  const t0 = performance.now();
  const snap1 = await hw.getSnapshot();
  const coldMs = performance.now() - t0;

  const t1 = performance.now();
  const snap2 = await hw.getSnapshot();
  const cachedMs = performance.now() - t1;

  // Start & immediate hide pause
  await hw.start(1500);
  const activeBeforeHide = hw.isActive();
  hw.pauseForHidden();
  const activeAfterHide = hw.isActive();
  hw.stop();

  return {
    coldSnapshotMs: Number(coldMs.toFixed(2)),
    cachedSnapshotMs: Number(cachedMs.toFixed(2)),
    hasCpu: Boolean(snap1?.cpu),
    hasRam: Boolean(snap2?.ram),
    activeBeforeHide,
    activeAfterHide,
    emittedEvents: sent,
  };
}

function measureNotificationPayloadSize() {
  const sampleGame = {
    id: '42',
    tab: 'game',
    category: 'PC Games',
    name: 'Cyber Odyssey Ultra Deluxe',
    version: 'v1.4.2',
    repackSize: '42.3 GB',
    repackSizeMB: 43315,
    originalSize: '88.0 GB',
    genreList: ['Action', 'RPG', 'Open World'],
    genresRaw: 'Action, RPG, Open World',
    languages: 'English, French, Spanish, Arabic',
    repackBy: 'FitGirl',
    coverImage: 'https://cdn.example.com/covers/cyber42.jpg',
    galleryImages: Array.from({ length: 8 }, (_, i) => `https://cdn.example.com/gal/${i}.jpg`),
    galleryVideos: [],
    description: 'L'.repeat(650),
    parsedRequirements: { os: 'Windows 11', ram: '16 GB', cpu: 'Ryzen 5', gpu: 'RTX 3060', raw: 'R'.repeat(250) },
    parsedSteps: ['Step 1', 'Step 2', 'Step 3'],
    mirrors: Array.from({ length: 12 }, (_, m) => ({
      label: `Mirror ${m + 1}`,
      group: 'Direct Mirrors',
      url: `https://dl.example.com/part${m + 1}.rar`,
      isMagnet: false,
    })),
    primaryMagnet: 'magnet:?xt=urn:btih:' + 'a'.repeat(40),
    trailerUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    embedTrailerUrl: 'https://youtube.com/embed/dQw4w9WgXcQ',
    isPinned: false,
    isFree: true,
    isNew: true,
    parsedTools: [],
    dateAdded: '2026-11-20',
    dateTimestamp: Date.now(),
    rawFields: { a: '1', b: '2', c: '3' },
  };

  const fullEvents = Array.from({ length: 80 }, (_, idx) => ({
    id: `ev-${idx}`,
    kind: 'new-release',
    title: sampleGame.name,
    message: 'New release added',
    timestamp: Date.now() - idx * 60000,
    section: 'library',
    targetItem: { ...sampleGame, id: String(idx + 1) },
  }));

  const leanEvents = Array.from({ length: 80 }, (_, idx) => ({
    id: `ev-${idx}`,
    kind: 'new-release',
    title: sampleGame.name,
    message: 'New release added',
    timestamp: Date.now() - idx * 60000,
    section: 'library',
    targetRef: { tab: sampleGame.tab, id: String(idx + 1) },
  }));

  return {
    full80EventsKB: Number((Buffer.byteLength(JSON.stringify(fullEvents), 'utf8') / 1024).toFixed(2)),
    lean80EventsKB: Number((Buffer.byteLength(JSON.stringify(leanEvents), 'utf8') / 1024).toFixed(2)),
  };
}

function measureDistBundle() {
  const assetsDir = path.resolve(__dirname, '../dist/assets');
  if (!fs.existsSync(assetsDir)) return { exists: false };
  const files = fs.readdirSync(assetsDir);
  let totalJsBytes = 0;
  let totalCssBytes = 0;
  let jsFiles = 0;
  let largestJsName = '';
  let largestJsBytes = 0;
  for (const f of files) {
    const stat = fs.statSync(path.join(assetsDir, f));
    if (f.endsWith('.js')) {
      jsFiles += 1;
      totalJsBytes += stat.size;
      if (stat.size > largestJsBytes) {
        largestJsBytes = stat.size;
        largestJsName = f;
      }
    } else if (f.endsWith('.css')) {
      totalCssBytes += stat.size;
    }
  }
  return {
    exists: true,
    jsChunkCount: jsFiles,
    totalJsKB: Number((totalJsBytes / 1024).toFixed(2)),
    totalCssKB: Number((totalCssBytes / 1024).toFixed(2)),
    largestJsChunk: largestJsName,
    largestJsKB: Number((largestJsBytes / 1024).toFixed(2)),
  };
}

async function main() {
  const modules = await measureModuleLoads();
  const downloadManager = await benchmarkDownloadManager();
  const hardwareMonitor = await benchmarkHardwareMonitor();
  const notifications = measureNotificationPayloadSize();
  const distBundle = measureDistBundle();

  console.log(
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        nodeVersion: process.version,
        modules,
        downloadManager,
        hardwareMonitor,
        notifications,
        distBundle,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
