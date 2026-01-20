const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods for renderer process to use
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Check if running in Electron
  isElectron: true,
});
