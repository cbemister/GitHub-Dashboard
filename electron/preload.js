// Preload script - runs before the renderer process loads
// Has access to both DOM APIs and limited Node.js environment
const { contextBridge, ipcRenderer } = require('electron')

// Expose Electron APIs to the renderer process securely
contextBridge.exposeInMainWorld('electronAPI', {
  // Directory selection dialog
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // File selection dialog
  selectFile: (options) => ipcRenderer.invoke('select-file', options),

  // Save file dialog
  saveFile: (options) => ipcRenderer.invoke('save-file', options),

  // Open URL in default browser
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Get app info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Platform detection
  platform: process.platform,

  // Check if running in Electron
  isElectron: true,
})

// Log when preload completes
console.log('Electron preload script loaded')