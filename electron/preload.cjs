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
});
