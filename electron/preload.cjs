const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('secretAreaDesktop', {
  isDesktop: true,
  platform: process.platform,
});
