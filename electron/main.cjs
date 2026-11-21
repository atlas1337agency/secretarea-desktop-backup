const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const GITHUB_OWNER = 'secretarea1337';
const GITHUB_REPO = 'secretarea-desktop';

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

let mainWindow = null;

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    title: 'SecretArea',
    icon: resolveAppIcon(),
    backgroundColor: '#0e141b',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    emitUpdateState();

    if (!hasCheckedOnStartup && app.isPackaged) {
      hasCheckedOnStartup = true;
      setTimeout(() => {
        void runUpdateCheck({ manual: false });
      }, 2500);
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
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  configureAutoUpdater();
  registerUpdaterIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
