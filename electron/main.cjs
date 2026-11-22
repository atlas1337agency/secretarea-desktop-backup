const { app, BrowserWindow, ipcMain, Menu, shell, session, Tray, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');

const GITHUB_OWNER = 'secretarea1337';
const GITHUB_REPO = 'secretarea-desktop';

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

let mainWindow = null;
let appTray = null;
let isQuitting = false;

function readPackageVersion() {
  if (app.isPackaged) {
    return app.getVersion();
  }
  try {
    const pkgPath = path.join(__dirname, '../package.json');
    const parsed = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return typeof parsed.version === 'string' && parsed.version.trim()
      ? parsed.version.trim()
      : app.getVersion();
  } catch {
    return app.getVersion();
  }
}

function stripHtmlNotes(rawNotes) {
  if (!rawNotes) return null;

  let combined = '';
  if (typeof rawNotes === 'string') {
    combined = rawNotes;
  } else if (Array.isArray(rawNotes)) {
    combined = rawNotes
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry.note === 'string') {
          const prefix = entry.version ? `v${entry.version}: ` : '';
          return `${prefix}${entry.note}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');
  }

  const text = combined
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text || null;
}

const updateState = {
  status: 'idle',
  currentVersion: readPackageVersion(),
  availableVersion: null,
  releaseName: null,
  releaseNotes: null,
  releaseDate: null,
  progress: null,
  error: null,
  isManualCheck: false,
  postponed: false,
  lastCheckedAt: null,
};

let hasCheckedOnStartup = false;
let activeCheckPromise = null;
let activeDownloadPromise = null;
let lastProgressEmitAt = 0;

function emitUpdateState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', { ...updateState });
  }
}

function patchUpdateState(patch) {
  Object.assign(updateState, patch);
  emitUpdateState();
}

function isTrustedSender(event) {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  if (event.sender !== mainWindow.webContents) return false;
  const senderUrl = event.senderFrame?.url || '';
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl && senderUrl.startsWith(devServerUrl)) {
    return true;
  }
  return senderUrl.startsWith('file://');
}

function configureAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.allowDowngrade = false;

  const devConfigPath = path.join(__dirname, '../dev-app-update.yml');
  if (!app.isPackaged && fs.existsSync(devConfigPath)) {
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.updateConfigPath = devConfigPath;
  }

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    releaseType: 'release',
  });

  autoUpdater.on('checking-for-update', () => {
    patchUpdateState({
      status: 'checking',
      error: null,
      progress: null,
    });
  });

  autoUpdater.on('update-available', (info) => {
    patchUpdateState({
      status: 'available',
      availableVersion: info?.version || null,
      releaseName: info?.releaseName || null,
      releaseNotes: stripHtmlNotes(info?.releaseNotes),
      releaseDate: info?.releaseDate || null,
      progress: null,
      error: null,
      postponed: false,
      lastCheckedAt: new Date().toISOString(),
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    patchUpdateState({
      status: 'not-available',
      availableVersion: info?.version || updateState.currentVersion,
      releaseName: null,
      releaseNotes: null,
      releaseDate: null,
      progress: null,
      error: null,
      postponed: false,
      lastCheckedAt: new Date().toISOString(),
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const now = Date.now();
    const percent = Math.max(0, Math.min(100, Math.round((progressObj?.percent || 0) * 10) / 10));
    if (percent < 100 && now - lastProgressEmitAt < 120) {
      return;
    }
    lastProgressEmitAt = now;
    patchUpdateState({
      status: 'downloading',
      progress: {
        percent,
        bytesPerSecond: Math.round(progressObj?.bytesPerSecond || 0),
        transferred: Math.round(progressObj?.transferred || 0),
        total: Math.round(progressObj?.total || 0),
      },
      error: null,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    patchUpdateState({
      status: 'downloaded',
      availableVersion: info?.version || updateState.availableVersion,
      releaseName: info?.releaseName || updateState.releaseName,
      releaseNotes: stripHtmlNotes(info?.releaseNotes) || updateState.releaseNotes,
      releaseDate: info?.releaseDate || updateState.releaseDate,
      progress: {
        percent: 100,
        bytesPerSecond: 0,
        transferred: updateState.progress?.total || 0,
        total: updateState.progress?.total || 0,
      },
      error: null,
      postponed: false,
    });
  });

  autoUpdater.on('error', (err) => {
    const rawMsg = err instanceof Error ? err.message : String(err || 'Update check failed.');
    const friendlyMsg = rawMsg.includes('ERR_INTERNET_DISCONNECTED') || rawMsg.includes('ENOTFOUND')
      ? 'Unable to reach GitHub Releases. Please check your internet connection.'
      : rawMsg.split('\n')[0].slice(0, 220);

    patchUpdateState({
      status: 'error',
      progress: null,
      error: friendlyMsg,
      lastCheckedAt: new Date().toISOString(),
    });
  });
}

async function runUpdateCheck({ manual }) {
  if (updateState.status === 'downloading' || updateState.status === 'downloaded') {
    return { ...updateState };
  }

  if (activeCheckPromise) {
    if (manual && !updateState.isManualCheck) {
      patchUpdateState({ isManualCheck: true });
    }
    await activeCheckPromise;
    return { ...updateState };
  }

  const devConfigExists = fs.existsSync(path.join(__dirname, '../dev-app-update.yml'));
  if (!app.isPackaged && !devConfigExists) {
    if (manual) {
      patchUpdateState({
        status: 'error',
        isManualCheck: true,
        error: 'Update checking is enabled in packaged Windows builds (.exe).',
        lastCheckedAt: new Date().toISOString(),
      });
    }
    return { ...updateState };
  }

  updateState.isManualCheck = Boolean(manual);
  if (manual) {
    updateState.postponed = false;
  }

  activeCheckPromise = (async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch {
      // Error state is handled cleanly by autoUpdater 'error' listener
    } finally {
      activeCheckPromise = null;
    }
  })();

  await activeCheckPromise;
  return { ...updateState };
}

async function runUpdateDownload() {
  if (updateState.status === 'downloaded') {
    return { ...updateState };
  }
  if (activeDownloadPromise) {
    await activeDownloadPromise;
    return { ...updateState };
  }
  if (updateState.status !== 'available' && updateState.status !== 'error') {
    return { ...updateState };
  }

  lastProgressEmitAt = 0;
  patchUpdateState({
    status: 'downloading',
    error: null,
    postponed: false,
    progress: {
      percent: 0,
      bytesPerSecond: 0,
      transferred: 0,
      total: 0,
    },
  });

  activeDownloadPromise = (async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch {
      // Error state handled by autoUpdater 'error' listener
    } finally {
      activeDownloadPromise = null;
    }
  })();

  await activeDownloadPromise;
  return { ...updateState };
}

function registerUpdaterIpc() {
  ipcMain.handle('updater:get-version', (event) => {
    if (!isTrustedSender(event)) return '';
    return updateState.currentVersion;
  });

  ipcMain.handle('updater:get-state', (event) => {
    if (!isTrustedSender(event)) return null;
    return { ...updateState };
  });

  ipcMain.handle('updater:check', async (event) => {
    if (!isTrustedSender(event)) return null;
    return runUpdateCheck({ manual: true });
  });

  ipcMain.handle('updater:download', async (event) => {
    if (!isTrustedSender(event)) return null;
    return runUpdateDownload();
  });

  ipcMain.handle('updater:postpone', (event) => {
    if (!isTrustedSender(event)) return null;
    patchUpdateState({ postponed: true });
    return { ...updateState };
  });

  ipcMain.handle('updater:install', (event) => {
    if (!isTrustedSender(event)) return;
    if (updateState.status !== 'downloaded') return;
    setImmediate(() => {
      autoUpdater.quitAndInstall(false, true);
    });
  });

  ipcMain.handle('window:is-fullscreen', (event) => {
    if (!isTrustedSender(event) || !mainWindow || mainWindow.isDestroyed()) return false;
    return mainWindow.isFullScreen();
  });

  ipcMain.handle('window:set-fullscreen', (event, flag) => {
    if (!isTrustedSender(event) || !mainWindow || mainWindow.isDestroyed()) return false;
    mainWindow.setFullScreen(Boolean(flag));
    return mainWindow.isFullScreen();
  });

  ipcMain.handle('system:get-specs', async (event, forceRefresh) => {
    if (!isTrustedSender(event)) return null;
    return getSystemSpecs(Boolean(forceRefresh));
  });

  ipcMain.handle('settings:get-desktop', (event) => {
    if (!isTrustedSender(event)) return null;
    return getDesktopSettingsPayload();
  });

  ipcMain.handle('settings:set-start-with-computer', (event, enabled) => {
    if (!isTrustedSender(event)) return null;
    return applyStartWithComputerSetting(Boolean(enabled));
  });
}

function getLauncherSettingsPath() {
  return path.join(app.getPath('userData'), 'launcher-settings.json');
}

function readDesktopLauncherSettings() {
  try {
    const filePath = getLauncherSettingsPath();
    if (!fs.existsSync(filePath)) {
      return { startWithComputer: false };
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      startWithComputer: Boolean(parsed?.startWithComputer),
    };
  } catch {
    return { startWithComputer: false };
  }
}

function writeDesktopLauncherSettings(next) {
  try {
    const filePath = getLauncherSettingsPath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ startWithComputer: Boolean(next.startWithComputer) }, null, 2), 'utf8');
  } catch {
    // ignore disk write errors
  }
}

function isTrayLaunchRequested() {
  if (process.argv.includes('--tray')) return true;
  if (process.platform === 'darwin') {
    try {
      return Boolean(app.getLoginItemSettings().wasOpenedAsHidden);
    } catch {
      return false;
    }
  }
  return false;
}

function showAndFocusMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow({ startHidden: false });
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function ensureSystemTray() {
  if (appTray && !appTray.isDestroyed()) return appTray;
  const iconPath = resolveAppIcon();
  let trayImg = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  if (!trayImg.isEmpty()) {
    trayImg = trayImg.resize({ width: 16, height: 16 });
  }
  appTray = new Tray(trayImg);
  appTray.setToolTip('SecretArea');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open SecretArea',
      click: () => showAndFocusMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit SecretArea',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  appTray.setContextMenu(contextMenu);
  appTray.on('click', () => showAndFocusMainWindow());
  appTray.on('double-click', () => showAndFocusMainWindow());
  return appTray;
}

function destroySystemTray() {
  if (appTray && !appTray.isDestroyed()) {
    appTray.destroy();
  }
  appTray = null;
}

function syncLoginItemWithOs(enabled) {
  if (!app.isPackaged) return false;
  if (process.platform !== 'win32' && process.platform !== 'darwin') return false;
  try {
    app.setLoginItemSettings({
      openAtLogin: Boolean(enabled),
      openAsHidden: true,
      path: process.execPath,
      args: enabled ? ['--tray'] : [],
    });
    return true;
  } catch {
    return false;
  }
}

function getDesktopSettingsPayload() {
  const persisted = readDesktopLauncherSettings();
  let startWithComputer = persisted.startWithComputer;
  if (app.isPackaged && (process.platform === 'win32' || process.platform === 'darwin')) {
    try {
      const loginSettings = app.getLoginItemSettings({
        path: process.execPath,
        args: ['--tray'],
      });
      if (typeof loginSettings?.openAtLogin === 'boolean') {
        startWithComputer = loginSettings.openAtLogin || persisted.startWithComputer;
      }
    } catch {
      // fallback to persisted setting
    }
  }
  return {
    startWithComputer,
    isPackaged: app.isPackaged,
    platform: process.platform,
    trayActive: Boolean(appTray && !appTray.isDestroyed()),
  };
}

function applyStartWithComputerSetting(enabled) {
  writeDesktopLauncherSettings({ startWithComputer: enabled });
  syncLoginItemWithOs(enabled);
  if (enabled) {
    ensureSystemTray();
  } else if (!isTrayLaunchRequested()) {
    destroySystemTray();
  }
  return getDesktopSettingsPayload();
}

let cachedHardwareProfile = null;
let pendingHardwarePromise = null;

function execFileAsync(cmd, args, timeoutMs = 4500) {
  return new Promise((resolve) => {
    execFile(
      cmd,
      args,
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 },
      (err, stdout) => {
        if (err || !stdout) {
          resolve('');
          return;
        }
        resolve(String(stdout).trim());
      }
    );
  });
}

function cleanHardwareLabel(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/\(R\)/gi, '')
    .replace(/\(TM\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreGpuAdapterPriority(name) {
  const n = name.toLowerCase();
  if (!n) return -100;
  if (
    n.includes('microsoft basic') ||
    n.includes('virtual') ||
    n.includes('parsec') ||
    n.includes('vnc') ||
    n.includes('citrix') ||
    n.includes('mirage')
  ) {
    return -50;
  }
  if (n.includes('nvidia') || n.includes('geforce') || n.includes('rtx') || n.includes('gtx') || n.includes('quadro')) {
    return 100;
  }
  if (n.includes('radeon rx') || n.includes('radeon pro')) {
    return 90;
  }
  if (n.includes('intel') && n.includes('arc')) {
    return 80;
  }
  if (n.includes('amd') || n.includes('radeon')) {
    return 45;
  }
  if (n.includes('iris') || n.includes('uhd') || n.includes('hd graphics') || n.includes('intel')) {
    return 25;
  }
  return 10;
}

function getFriendlyOsName() {
  const platform = process.platform;
  const rel = os.release();
  if (platform === 'win32') {
    const parts = rel.split('.');
    const major = Number(parts[0] || 10);
    const build = Number(parts[2] || 0);
    if (major >= 10 && build >= 22000) {
      return `Windows 11 (${os.arch()})`;
    }
    if (major >= 10) {
      return `Windows 10 (${os.arch()})`;
    }
    return `Windows ${rel} (${os.arch()})`;
  }
  if (platform === 'darwin') {
    return `macOS (${os.arch()})`;
  }
  return `Linux ${rel} (${os.arch()})`;
}

function getDiskSpaceInfo() {
  let targetPath = process.cwd();
  try {
    targetPath = app.getPath('downloads') || app.getPath('userData') || process.cwd();
  } catch {
    // fallback cwd
  }
  const parsedRoot = path.parse(targetPath).root || targetPath;
  const spaceDrive =
    process.platform === 'win32'
      ? parsedRoot.replace(/[\\/]+$/, '') || 'C:'
      : parsedRoot;

  try {
    if (typeof fs.statfsSync === 'function') {
      const stat = fs.statfsSync(targetPath);
      const bsize = Number(stat.bsize || 0);
      const bavail = Number(stat.bavail || 0);
      const blocks = Number(stat.blocks || 0);
      if (bsize > 0) {
        return {
          spaceDrive,
          freeSpaceGB: Number(((bavail * bsize) / (1024 ** 3)).toFixed(1)),
          totalSpaceGB: Math.round((blocks * bsize) / (1024 ** 3)),
        };
      }
    }
  } catch {
    // ignore statfs error
  }

  return {
    spaceDrive,
    freeSpaceGB: null,
    totalSpaceGB: null,
  };
}

async function detectWindowsHardwareDetails() {
  const psScript = [
    '$ErrorActionPreference = "SilentlyContinue";',
    '$osObj = Get-CimInstance Win32_OperatingSystem | Select-Object -First 1 Caption;',
    '$cpuObj = Get-CimInstance Win32_Processor | Select-Object -First 1 Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed;',
    '$gpus = @(Get-CimInstance Win32_VideoController | ForEach-Object {',
    '  [PSCustomObject]@{ Name = $_.Name; AdapterRAM = $_.AdapterRAM }',
    '});',
    '@{ osCaption = $osObj.Caption; cpu = $cpuObj; gpus = $gpus } | ConvertTo-Json -Depth 4 -Compress',
  ].join(' ');

  const out = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    psScript,
  ]);

  if (!out) return null;
  try {
    return JSON.parse(out);
  } catch {
    return null;
  }
}

async function detectStaticHardwareProfile() {
  const cpus = os.cpus() || [];
  let cpuName = cleanHardwareLabel(cpus[0]?.model || '') || 'Desktop Processor';
  let cpuCores = cpus.length || 0;
  let cpuSpeedGhz = cpus[0]?.speed ? Number((cpus[0].speed / 1000).toFixed(2)) : 0;
  let osName = getFriendlyOsName();
  const ramGB = Math.max(1, Math.round(os.totalmem() / (1024 ** 3)));
  let allGpus = [];
  let gpuName = '';
  let gpuVramGB = null;

  if (process.platform === 'win32') {
    const winInfo = await detectWindowsHardwareDetails();
    if (winInfo) {
      if (winInfo.osCaption && typeof winInfo.osCaption === 'string') {
        osName = cleanHardwareLabel(winInfo.osCaption).replace(/^Microsoft\s+/i, '');
      }
      if (winInfo.cpu?.Name) {
        cpuName = cleanHardwareLabel(winInfo.cpu.Name);
      }
      if (winInfo.cpu?.NumberOfLogicalProcessors) {
        cpuCores = Number(winInfo.cpu.NumberOfLogicalProcessors) || cpuCores;
      }
      if (winInfo.cpu?.MaxClockSpeed) {
        cpuSpeedGhz = Number((Number(winInfo.cpu.MaxClockSpeed) / 1000).toFixed(2)) || cpuSpeedGhz;
      }
      const gpuList = Array.isArray(winInfo.gpus)
        ? winInfo.gpus
        : winInfo.gpus
        ? [winInfo.gpus]
        : [];
      const cleaned = gpuList
        .map((g) => ({
          name: cleanHardwareLabel(g?.Name || ''),
          vramBytes: Number(g?.AdapterRAM || 0),
        }))
        .filter((g) => g.name.length > 0)
        .sort((a, b) => scoreGpuAdapterPriority(b.name) - scoreGpuAdapterPriority(a.name));

      allGpus = cleaned.map((g) => g.name);
      if (cleaned[0]) {
        gpuName = cleaned[0].name;
        if (cleaned[0].vramBytes > 0) {
          gpuVramGB = Number((cleaned[0].vramBytes / (1024 ** 3)).toFixed(1));
        }
      }
    }
  }

  if (!gpuName) {
    try {
      const basicGpu = await app.getGPUInfo('basic');
      const devices = Array.isArray(basicGpu?.gpuDevice) ? basicGpu.gpuDevice : [];
      const names = devices
        .map((d) => cleanHardwareLabel(d?.description || d?.driverVendor || ''))
        .filter(Boolean);
      if (names.length > 0) {
        allGpus = names;
        gpuName = names.sort((a, b) => scoreGpuAdapterPriority(b) - scoreGpuAdapterPriority(a))[0];
      }
    } catch {
      // ignore fallback error
    }
  }

  return {
    source: 'electron',
    osName,
    cpuName,
    cpuCores,
    cpuSpeedGhz,
    gpuName: gpuName || 'Integrated / Standard GPU',
    gpuVramGB,
    allGpus,
    ramGB,
    ramIsApprox: false,
  };
}

async function getSystemSpecs(forceRefresh = false) {
  if (!cachedHardwareProfile || forceRefresh) {
    if (!pendingHardwarePromise || forceRefresh) {
      pendingHardwarePromise = detectStaticHardwareProfile()
        .then((profile) => {
          cachedHardwareProfile = profile;
          return profile;
        })
        .finally(() => {
          pendingHardwarePromise = null;
        });
    }
    await pendingHardwarePromise;
  }

  const disk = getDiskSpaceInfo();
  return {
    ...(cachedHardwareProfile || {
      source: 'electron',
      osName: getFriendlyOsName(),
      cpuName: 'Processor',
      cpuCores: os.cpus()?.length || 0,
      cpuSpeedGhz: 0,
      gpuName: 'Graphics Adapter',
      gpuVramGB: null,
      allGpus: [],
      ramGB: Math.max(1, Math.round(os.totalmem() / (1024 ** 3))),
      ramIsApprox: false,
    }),
    ...disk,
    detectedAt: new Date().toISOString(),
  };
}

function resolveAppIcon() {
  const distIcon = path.join(__dirname, '../dist/img/logo01.png');
  if (fs.existsSync(distIcon)) return distIcon;
  const publicIcon = path.join(__dirname, '../public/img/logo01.png');
  if (fs.existsSync(publicIcon)) return publicIcon;
  return undefined;
}

function isExternalUrl(targetUrl) {
  return (
    targetUrl.startsWith('http://') ||
    targetUrl.startsWith('https://') ||
    targetUrl.startsWith('magnet:') ||
    targetUrl.startsWith('tg:')
  );
}

function createWindow(options = {}) {
  const startHidden = Boolean(options.startHidden);
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    title: 'SecretArea',
    icon: resolveAppIcon(),
    backgroundColor: '#0e141b',
    autoHideMenuBar: true,
    fullScreenable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.on('enter-full-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:fullscreen-changed', true);
    }
  });

  mainWindow.on('leave-full-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:fullscreen-changed', false);
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (!startHidden) {
      mainWindow?.show();
    }
    emitUpdateState();

    if (!hasCheckedOnStartup && app.isPackaged) {
      hasCheckedOnStartup = true;
      setTimeout(() => {
        void runUpdateCheck({ manual: false });
      }, 2500);
    }
  });

  mainWindow.on('close', (event) => {
    const persisted = readDesktopLauncherSettings();
    if (!isQuitting && persisted.startWithComputer && appTray && !appTray.isDestroyed()) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) {
      void shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl && url.startsWith(devServerUrl)) {
      return;
    }
    if (url.startsWith('file://')) {
      return;
    }
    if (isExternalUrl(url)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('second-instance', () => {
  showAndFocusMainWindow();
});

function configureYouTubeEmbedHeaders() {
  const embedReferer = 'https://www.secretarea.site/';
  const embedOrigin = 'https://www.secretarea.site';
  const filter = {
    urls: [
      '*://*.youtube.com/*',
      '*://*.youtube-nocookie.com/*',
      '*://*.ytimg.com/*',
      '*://*.googlevideo.com/*',
    ],
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headers = { ...details.requestHeaders };
    const existingReferer = headers.Referer || headers.referer || '';
    const existingOrigin = headers.Origin || headers.origin || '';

    if (
      !existingReferer ||
      existingReferer.startsWith('file://') ||
      existingReferer.startsWith('app://') ||
      existingReferer === 'null'
    ) {
      delete headers.referer;
      headers.Referer = embedReferer;
    }

    if (
      existingOrigin &&
      (existingOrigin === 'null' ||
        existingOrigin.startsWith('file://') ||
        existingOrigin.startsWith('app://'))
    ) {
      delete headers.origin;
      headers.Origin = embedOrigin;
    }

    callback({ requestHeaders: headers });
  });
}

app.whenReady().then(() => {
  configureYouTubeEmbedHeaders();
  configureAutoUpdater();
  registerUpdaterIpc();

  const persisted = readDesktopLauncherSettings();
  const launchInTray = isTrayLaunchRequested();
  if (persisted.startWithComputer || launchInTray) {
    ensureSystemTray();
  }

  createWindow({ startHidden: launchInTray });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow({ startHidden: false });
    } else {
      showAndFocusMainWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !(appTray && !appTray.isDestroyed())) {
    app.quit();
  }
});
