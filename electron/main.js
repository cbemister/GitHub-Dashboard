const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')

let mainWindow = null

const createWindow = () => {
  const isDev = process.env.NODE_ENV === 'development'

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false, // Don't show until ready (prevents white flash)
    backgroundColor: '#0d1117', // Match app dark background
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  // Show window only when content is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Register DevTools shortcut (F12 or Ctrl+Shift+I)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' ||
        (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools()
    }
  })

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://github.com') || url.startsWith('http')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    // Auto-open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the error page as fallback
    // For full production builds, consider using electron-serve
    mainWindow.loadFile(path.join(__dirname, 'error.html'))
  }

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
    if (isDev) {
      // In dev, the Next.js server might not be ready yet
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000')
      }, 2000)
    } else {
      mainWindow.loadFile(path.join(__dirname, 'error.html'))
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Initialize app
app.whenReady().then(() => {
  createWindow()

  // macOS: Re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============================================
// IPC Handlers - Native functionality
// ============================================

// Native folder selection dialog
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Directory'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

// Native file selection dialog
ipcMain.handle('select-file', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [],
    title: options.title || 'Select File'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

// Native save file dialog
ipcMain.handle('save-file', async (event, options = {}) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: options.filters || [],
    defaultPath: options.defaultPath,
    title: options.title || 'Save File'
  })

  if (result.canceled) {
    return null
  }

  return result.filePath
})

// Open URL in default browser
ipcMain.handle('open-external', async (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url)
    return true
  }
  return false
})

// Get app info
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
  }
})