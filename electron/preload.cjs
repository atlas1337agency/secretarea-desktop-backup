const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('secretAreaDesktop', {
  isDesktop: true,
  platform: process.platform,
  updater: {
    getVersion: () => ipcRenderer.invoke('updater:get-version'),
    getState: () => ipcRenderer.invoke('updater:get-state'),
    checkForUpdates: () => ipcRenderer.invoke('updater:check'),
    downloadUpdate: () => ipcRenderer.invoke('updater:download'),
    postponeUpdate: () => ipcRenderer.invoke('updater:postpone'),
    installUpdate: () => ipcRenderer.invoke('updater:install'),
    onStateChange: (callback) => {
      if (typeof callback !== 'function') {
        return () => {};
      }
      const listener = (_event, state) => {
        callback(state);
      };
      ipcRenderer.on('updater:status', listener);
      return () => {
        ipcRenderer.removeListener('updater:status', listener);
      };
    },
  },
  windowControls: {
    isFullscreen: () => ipcRenderer.invoke('window:is-fullscreen'),
    setFullscreen: (flag) => ipcRenderer.invoke('window:set-fullscreen', Boolean(flag)),
    onFullscreenChange: (callback) => {
      if (typeof callback !== 'function') {
        return () => {};
      }
      const listener = (_event, isFullscreen) => {
        callback(Boolean(isFullscreen));
      };
      ipcRenderer.on('window:fullscreen-changed', listener);
      return () => {
        ipcRenderer.removeListener('window:fullscreen-changed', listener);
      };
    },
  },
  system: {
    getSpecs: (forceRefresh) => ipcRenderer.invoke('system:get-specs', Boolean(forceRefresh)),
  },
  settings: {
    getDesktopSettings: () => ipcRenderer.invoke('settings:get-desktop'),
    setStartWithComputer: (enabled) =>
      ipcRenderer.invoke('settings:set-start-with-computer', Boolean(enabled)),
  },
});
