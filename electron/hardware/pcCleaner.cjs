const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const crypto = require('crypto');

const BLOCKED_SEGMENTS = [
  'system32',
  'syswow64',
  'winsxs',
  'program files',
  'program files (x86)',
  'programdata',
  'documents',
  'desktop',
  'downloads',
  'pictures',
  'videos',
  'music',
  'saved games',
  'my games',
  'steamapps',
  'epic games',
  'gog galaxy',
  'riot games',
  'ubisoft game launcher',
  'battle.net',
  'xboxgames',
];

const SAFE_ONLY_FILENAMES_TO_SKIP = new Set([
  'launcher-settings.json',
  'gaming-sessions.json',
  'download-tasks.json',
  'favorites.json',
  'bookmarks',
  'bookmarks.bak',
  'cookies',
  'login data',
  'history',
  'preferences',
  'secure preferences',
  'web data',
]);

function normalizePathForCheck(p) {
  return path.resolve(String(p || '')).replace(/[\\/]+$/, '').toLowerCase();
}

/**
 * Strictly ensures PC Cleaner NEVER scans or deletes personal folders,
 * OS system files, game installations, saves, mods, or browser profiles.
 */
function isPathSafeForCleaner(targetPath, allowedRoots) {
  if (!targetPath || typeof targetPath !== 'string') return false;
  const resolved = normalizePathForCheck(targetPath);
  if (!resolved || resolved === '/' || /^[a-z]:$/.test(resolved)) return false;

  const segments = resolved.split(/[\\/]+/).filter(Boolean);
  for (const blocked of BLOCKED_SEGMENTS) {
    if (segments.includes(blocked)) {
      return false;
    }
  }

  const baseName = path.basename(resolved);
  if (SAFE_ONLY_FILENAMES_TO_SKIP.has(baseName)) {
    return false;
  }

  if (!Array.isArray(allowedRoots) || allowedRoots.length === 0) {
    return false;
  }

  return allowedRoots.some((root) => {
    const cleanRoot = normalizePathForCheck(root);
    if (!cleanRoot) return false;
    return resolved === cleanRoot || resolved.startsWith(`${cleanRoot}${path.sep.toLowerCase()}`) || resolved.startsWith(`${cleanRoot}/`) || resolved.startsWith(`${cleanRoot}\\`);
  });
}

function runExec(cmd, args, timeoutMs = 4500) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(typeof stdout === 'string' ? stdout.trim() : '');
    });
  });
}

async function scanDirectoryTargets(targets, options = {}) {
  const {
    minAgeMs = 0,
    filePattern = null,
    allowedRoots = [],
    maxDepth = 5,
    maxFiles = 4000,
    cancelledRef = { current: false },
  } = options;

  let totalBytes = 0;
  let fileCount = 0;
  const matchedPaths = [];
  const scannedDirs = [];

  async function walk(dirPath, depth) {
    if (cancelledRef.current || fileCount >= maxFiles || depth > maxDepth) return;
    if (!isPathSafeForCleaner(dirPath, allowedRoots)) return;

    let entries = [];
    try {
      entries = await fsp.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (cancelledRef.current || fileCount >= maxFiles) return;
      const fullPath = path.join(dirPath, entry.name);
      if (!isPathSafeForCleaner(fullPath, allowedRoots)) continue;

      if (entry.isSymbolicLink()) continue;

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        if (filePattern && !filePattern.test(entry.name)) continue;
        try {
          const stat = await fsp.lstat(fullPath);
          if (stat.isSymbolicLink()) continue;
          if (minAgeMs > 0 && Date.now() - stat.mtimeMs < minAgeMs) continue;
          totalBytes += stat.size;
          fileCount += 1;
          matchedPaths.push({ path: fullPath, size: stat.size });
        } catch {
          // ignore inaccessible file
        }
      }
    }
  }

  for (const targetDir of targets) {
    if (!targetDir || !fs.existsSync(targetDir)) continue;
    if (!isPathSafeForCleaner(targetDir, allowedRoots)) continue;
    scannedDirs.push(targetDir);
    await walk(targetDir, 0);
  }

  return {
    scannedDirs,
    totalBytes,
    fileCount,
    matchedPaths,
  };
}

function buildCleanerCategories({ getUserDataPath }) {
  const userDataDir = typeof getUserDataPath === 'function' ? getUserDataPath() : '';
  const localAppData = process.env.LOCALAPPDATA || '';
  const winDir = process.env.SystemRoot || 'C:\\Windows';
  const homeDir = os.homedir();
  const sysTemp = os.tmpdir();

  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const categories = [];

  // 1. Old Temporary Files (> 24h in Windows\Temp or /tmp)
  const oldTempRoots = isWin
    ? [path.join(winDir, 'Temp')]
    : isMac
    ? Array.from(new Set([sysTemp, '/tmp'].filter(Boolean)))
    : [sysTemp];
  categories.push({
    id: 'old_temp',
    defaultSelected: true,
    optInWarning: false,
    roots: oldTempRoots.filter(Boolean),
    minAgeMs: 24 * 60 * 60 * 1000,
    filePattern: null,
  });

  // 2. User Temporary Files
  const userTempRoots = [];
  if (sysTemp && !oldTempRoots.includes(sysTemp)) {
    userTempRoots.push(sysTemp);
  }
  if (isMac && sysTemp && !userTempRoots.includes(sysTemp)) {
    userTempRoots.push(sysTemp);
  }
  if (isWin && localAppData) {
    const p = path.join(localAppData, 'Temp');
    if (!userTempRoots.includes(p)) userTempRoots.push(p);
  }
  categories.push({
    id: 'user_temp',
    defaultSelected: true,
    optInWarning: false,
    roots: userTempRoots.filter(Boolean),
    minAgeMs: 60 * 60 * 1000, // skip active <1h temp locks
    filePattern: null,
  });

  // 3. Application Crash & Telemetry Temp Cache (Win CrashDumps / macOS DiagnosticReports / Linux thumbnails)
  const appCacheRoots =
    isWin && localAppData
      ? [path.join(localAppData, 'CrashDumps')]
      : isMac
      ? [
          path.join(homeDir, 'Library', 'Logs', 'DiagnosticReports'),
          path.join(homeDir, 'Library', 'Logs', 'CrashReporter'),
        ]
      : [path.join(homeDir, '.cache', 'thumbnails')];
  categories.push({
    id: 'app_cache',
    defaultSelected: true,
    optInWarning: false,
    roots: appCacheRoots.filter(Boolean),
    minAgeMs: 0,
    filePattern: null,
  });

  // 4. SecretArea Application Cache (ONLY GPUCache, Code Cache, Cache — NEVER user settings JSON)
  const saCacheRoots = userDataDir
    ? [
        path.join(userDataDir, 'Cache'),
        path.join(userDataDir, 'Code Cache'),
        path.join(userDataDir, 'GPUCache'),
      ]
    : [];
  categories.push({
    id: 'secretarea_cache',
    defaultSelected: true,
    optInWarning: false,
    roots: saCacheRoots.filter(Boolean),
    minAgeMs: 0,
    filePattern: null,
  });

  // 5. Windows Thumbnail Cache
  const thumbRoots = isWin && localAppData
    ? [path.join(localAppData, 'Microsoft', 'Windows', 'Explorer')]
    : [];
  categories.push({
    id: 'thumbnail_cache',
    defaultSelected: true,
    optInWarning: false,
    roots: thumbRoots,
    minAgeMs: 0,
    filePattern: /^thumbcache_.*\.(db|idx)$/i,
  });

  // 6. DirectX / GPU Shader Cache (OPT-IN — unchecked by default)
  const dxShaderRoots = isWin && localAppData
    ? [
        path.join(localAppData, 'D3DSCache'),
        path.join(localAppData, 'NVIDIA', 'DXCache'),
        path.join(localAppData, 'NVIDIA', 'GLCache'),
        path.join(localAppData, 'AMD', 'DxCache'),
        path.join(localAppData, 'AMD', 'GLCache'),
        path.join(localAppData, 'Intel', 'ShaderCache'),
      ]
    : isMac
    ? []
    : [path.join(homeDir, '.cache', 'mesa_shader_cache')];
  categories.push({
    id: 'dx_shader_cache',
    defaultSelected: false,
    optInWarning: true,
    roots: dxShaderRoots.filter(Boolean),
    minAgeMs: 0,
    filePattern: null,
  });

  // 7. Recycle Bin (OPT-IN — unchecked by default; disabled on macOS so TCC privacy prompt never triggers on ~/.Trash)
  categories.push({
    id: 'recycle_bin',
    defaultSelected: false,
    optInWarning: true,
    isRecycleBin: true,
    roots: [],
    minAgeMs: 0,
    filePattern: null,
  });

  // 8. Browser Cache ONLY (OPT-IN — strictly Cache / Code Cache / cache2 directories; NEVER Safari on macOS to avoid TCC prompts)
  const browserCacheRoots = isWin && localAppData
    ? [
        path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
        path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'Code Cache'),
        path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache'),
        path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default', 'Code Cache'),
        path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'User Data', 'Default', 'Cache'),
        path.join(localAppData, 'Mozilla', 'Firefox', 'Profiles'),
      ]
    : isMac
    ? [
        path.join(homeDir, 'Library', 'Caches', 'Google', 'Chrome', 'Default', 'Cache'),
        path.join(homeDir, 'Library', 'Caches', 'Google', 'Chrome', 'Default', 'Code Cache'),
        path.join(homeDir, 'Library', 'Caches', 'Microsoft Edge', 'Default', 'Cache'),
        path.join(homeDir, 'Library', 'Caches', 'BraveSoftware', 'Brave-Browser', 'Default', 'Cache'),
        path.join(homeDir, 'Library', 'Caches', 'Firefox', 'Profiles'),
      ]
    : [
        path.join(homeDir, '.cache', 'google-chrome', 'Default', 'Cache'),
        path.join(homeDir, '.cache', 'chromium', 'Default', 'Cache'),
      ];
  categories.push({
    id: 'browser_cache',
    defaultSelected: false,
    optInWarning: true,
    roots: browserCacheRoots.filter(Boolean),
    minAgeMs: 0,
    filePattern: null,
  });

  return categories;
}

async function queryRecycleBinStats() {
  if (process.platform !== 'win32') {
    return { itemCount: 0, totalBytes: 0, supported: false };
  }
  const script = [
    '$ErrorActionPreference = "SilentlyContinue";',
    '$shell = New-Object -ComObject Shell.Application;',
    '$rb = $shell.NameSpace(0x0a);',
    '$items = $rb.Items();',
    '$count = $items.Count;',
    '$size = 0;',
    'foreach ($it in $items) { try { $size += [int64]$it.Size } catch {} };',
    '@{ itemCount = $count; totalBytes = $size } | ConvertTo-Json -Compress',
  ].join(' ');
  const out = await runExec(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
    3500
  );
  if (!out) return { itemCount: 0, totalBytes: 0, supported: true };
  try {
    const parsed = JSON.parse(out);
    return {
      itemCount: Number(parsed?.itemCount) || 0,
      totalBytes: Number(parsed?.totalBytes) || 0,
      supported: true,
    };
  } catch {
    return { itemCount: 0, totalBytes: 0, supported: true };
  }
}

function createPcCleaner({ getMainWindow, getUserDataPath }) {
  let activeScanToken = null;
  let cachedScannedItemsByCategory = new Map();
  const cancelledRef = { current: false };
  let isBusy = false;

  function emitProgress(payload) {
    const win = typeof getMainWindow === 'function' ? getMainWindow() : null;
    if (win && !win.isDestroyed()) {
      win.webContents.send('cleaner:progress', payload);
    }
  }

  async function scan() {
    if (isBusy) {
      return null;
    }
    isBusy = true;
    cancelledRef.current = false;
    cachedScannedItemsByCategory = new Map();

    try {
      const defs = buildCleanerCategories({ getUserDataPath });
      const results = [];
      let totalEstimatedBytes = 0;

      for (let i = 0; i < defs.length; i++) {
        if (cancelledRef.current) break;
        const cat = defs[i];
        emitProgress({
          phase: 'scanning',
          categoryId: cat.id,
          percent: Math.round(((i + 0.5) / defs.length) * 100),
          currentPath: cat.roots[0] || cat.id,
        });

        if (cat.isRecycleBin) {
          const rb = await queryRecycleBinStats();
          cachedScannedItemsByCategory.set(cat.id, { isRecycleBin: true, estimatedBytes: rb.totalBytes, itemCount: rb.itemCount });
          totalEstimatedBytes += rb.totalBytes;
          results.push({
            id: cat.id,
            defaultSelected: cat.defaultSelected,
            optInWarning: cat.optInWarning,
            supported: rb.supported,
            paths: rb.supported ? ['Windows Recycle Bin ($Recycle.Bin)'] : [],
            fileCount: rb.itemCount,
            estimatedBytes: rb.totalBytes,
          });
          continue;
        }

        // For Firefox Profiles on Windows & macOS, scope strictly to .../cache2 so bookmarks/passwords are untouched
        let effectiveRoots = cat.roots;
        if (cat.id === 'browser_cache' && (process.platform === 'win32' || process.platform === 'darwin')) {
          const expanded = [];
          for (const r of cat.roots) {
            if (r.endsWith('Profiles') && fs.existsSync(r)) {
              try {
                const profs = await fsp.readdir(r, { withFileTypes: true });
                for (const p of profs) {
                  if (p.isDirectory()) {
                    expanded.push(path.join(r, p.name, 'cache2'));
                  }
                }
              } catch {
                // ignore
              }
            } else {
              expanded.push(r);
            }
          }
          effectiveRoots = expanded;
        }

        const isCategorySupported =
          cat.id === 'thumbnail_cache'
            ? process.platform === 'win32'
            : cat.id === 'dx_shader_cache'
            ? process.platform !== 'darwin'
            : true;

        const scanRes = isCategorySupported
          ? await scanDirectoryTargets(effectiveRoots, {
              minAgeMs: cat.minAgeMs,
              filePattern: cat.filePattern,
              allowedRoots: effectiveRoots,
              cancelledRef,
            })
          : { scannedDirs: [], totalBytes: 0, fileCount: 0, matchedPaths: [] };

        cachedScannedItemsByCategory.set(cat.id, {
          isRecycleBin: false,
          allowedRoots: effectiveRoots,
          matchedPaths: scanRes.matchedPaths,
        });

        totalEstimatedBytes += scanRes.totalBytes;
        results.push({
          id: cat.id,
          defaultSelected: cat.defaultSelected,
          optInWarning: cat.optInWarning,
          supported: isCategorySupported,
          paths: scanRes.scannedDirs.length > 0 ? scanRes.scannedDirs : effectiveRoots.filter((r) => fs.existsSync(r)),
          fileCount: scanRes.fileCount,
          estimatedBytes: scanRes.totalBytes,
        });
      }

      const token = crypto.randomBytes(12).toString('hex');
      activeScanToken = token;

      emitProgress({
        phase: 'scan_complete',
        categoryId: null,
        percent: 100,
        currentPath: null,
      });

      return {
        confirmationToken: token,
        scannedAt: Date.now(),
        totalEstimatedBytes,
        categories: results,
      };
    } finally {
      isBusy = false;
    }
  }

  async function clean({ categoryIds, confirmationToken } = {}) {
    if (isBusy) {
      throw new Error('Cleaner operation already in progress.');
    }
    if (!activeScanToken || confirmationToken !== activeScanToken) {
      throw new Error('Scan confirmation token invalid or expired. Please run Scan again.');
    }
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      throw new Error('Select at least one category to clean.');
    }

    isBusy = true;
    cancelledRef.current = false;
    activeScanToken = null; // Single-use confirmation token

    let cleanedBytes = 0;
    let cleanedFiles = 0;
    let skippedLockedCount = 0;
    const categoryResults = [];

    try {
      for (let idx = 0; idx < categoryIds.length; idx++) {
        if (cancelledRef.current) break;
        const catId = categoryIds[idx];
        const cached = cachedScannedItemsByCategory.get(catId);
        if (!cached) continue;

        emitProgress({
          phase: 'cleaning',
          categoryId: catId,
          percent: Math.round(((idx + 0.3) / categoryIds.length) * 100),
          currentPath: catId,
        });

        if (cached.isRecycleBin) {
          if (process.platform === 'win32') {
            await runExec(
              'powershell.exe',
              ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', 'Clear-RecycleBin -Force -ErrorAction SilentlyContinue'],
              10000
            );
            const afterRb = await queryRecycleBinStats();
            const freed = Math.max(0, (cached.estimatedBytes || 0) - (afterRb.totalBytes || 0));
            const deletedItems = Math.max(0, (cached.itemCount || 0) - (afterRb.itemCount || 0));
            cleanedBytes += freed;
            cleanedFiles += deletedItems;
            categoryResults.push({ id: catId, cleanedBytes: freed, cleanedFiles: deletedItems, skippedLockedCount: afterRb.itemCount || 0 });
          } else {
            categoryResults.push({ id: catId, cleanedBytes: 0, cleanedFiles: 0, skippedLockedCount: 0 });
          }
          continue;
        }

        let catBytes = 0;
        let catFiles = 0;
        let catSkipped = 0;
        const files = cached.matchedPaths || [];

        for (let fIdx = 0; fIdx < files.length; fIdx++) {
          if (cancelledRef.current) break;
          const item = files[fIdx];
          if (!isPathSafeForCleaner(item.path, cached.allowedRoots)) {
            catSkipped += 1;
            continue;
          }
          try {
            const st = await fsp.lstat(item.path);
            if (st.isSymbolicLink() || !st.isFile()) {
              catSkipped += 1;
              continue;
            }
            await fsp.unlink(item.path);
            catBytes += item.size;
            catFiles += 1;
          } catch {
            // Skip files currently locked (EBUSY / EPERM / EACCES) without crashing or misreporting freed space
            catSkipped += 1;
          }

          if (fIdx % 60 === 0) {
            emitProgress({
              phase: 'cleaning',
              categoryId: catId,
              percent: Math.min(99, Math.round(((idx + fIdx / Math.max(1, files.length)) / categoryIds.length) * 100)),
              currentPath: item.path,
            });
          }
        }

        cleanedBytes += catBytes;
        cleanedFiles += catFiles;
        skippedLockedCount += catSkipped;
        categoryResults.push({
          id: catId,
          cleanedBytes: catBytes,
          cleanedFiles: catFiles,
          skippedLockedCount: catSkipped,
        });
      }

      emitProgress({
        phase: 'clean_complete',
        categoryId: null,
        percent: 100,
        currentPath: null,
      });

      return {
        cleanedAt: Date.now(),
        cleanedBytes,
        cleanedFiles,
        skippedLockedCount,
        cancelled: cancelledRef.current,
        categoryResults,
      };
    } finally {
      isBusy = false;
    }
  }

  function cancel() {
    cancelledRef.current = true;
    return { ok: true };
  }

  function registerIpc(ipcMain, isTrustedSender) {
    ipcMain.handle('cleaner:scan', async (event) => {
      if (!isTrustedSender(event)) return null;
      return scan();
    });

    ipcMain.handle('cleaner:clean', async (event, payload) => {
      if (!isTrustedSender(event)) return null;
      return clean(payload);
    });

    ipcMain.handle('cleaner:cancel', (event) => {
      if (!isTrustedSender(event)) return { ok: false };
      return cancel();
    });
  }

  return {
    registerIpc,
    scan,
    clean,
    cancel,
  };
}

module.exports = {
  createPcCleaner,
  isPathSafeForCleaner,
  buildCleanerCategories,
};
