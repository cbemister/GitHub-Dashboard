const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let nextServer;

// Set up database directory for SQLite
function setupDatabaseDir() {
  const userDataPath = app.getPath('userData');
  process.env.DATABASE_DIR = userDataPath;
  console.log(`Database directory set to: ${userDataPath}`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for native modules like better-sqlite3
    },
    titleBarStyle: 'default',
    show: false,
    icon: path.join(__dirname, '../public/icon.png'),
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://github.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Handle navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin !== 'http://localhost:3000') {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev) {
    // In development, connect to the Next.js dev server
    loadDevServer();
  } else {
    // In production, start the Next.js server and load
    startProductionServer();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function loadDevServer() {
  const devUrl = 'http://localhost:3000';

  // Wait for the dev server to be ready
  const waitForServer = async (url, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok || response.status === 404) {
          return true;
        }
      } catch (e) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  };

  console.log('Waiting for Next.js dev server...');
  const serverReady = await waitForServer(devUrl);

  if (serverReady) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    console.error('Failed to connect to Next.js dev server');
    mainWindow.loadFile(path.join(__dirname, 'error.html'));
  }
}

async function startProductionServer() {
  const serverPort = 3000;
  const serverUrl = `http://localhost:${serverPort}`;

  // Start the Next.js server
  const appPath = path.join(__dirname, '..');

  nextServer = spawn(process.platform === 'win32' ? 'next.cmd' : 'next', ['start', '-p', serverPort.toString()], {
    cwd: appPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DATABASE_DIR: app.getPath('userData'),
    },
    stdio: 'pipe',
  });

  nextServer.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });

  nextServer.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`);
  });

  // Wait for server to be ready
  const waitForServer = async (url, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok || response.status === 404) {
          return true;
        }
      } catch (e) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  };

  console.log('Starting Next.js production server...');
  const serverReady = await waitForServer(serverUrl);

  if (serverReady) {
    mainWindow.loadURL(serverUrl);
  } else {
    console.error('Failed to start Next.js production server');
    mainWindow.loadFile(path.join(__dirname, 'error.html'));
  }
}

// App lifecycle handlers
app.whenReady().then(() => {
  setupDatabaseDir();
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

app.on('before-quit', () => {
  // Kill the Next.js server when quitting
  if (nextServer) {
    nextServer.kill();
  }
});

// IPC handlers for renderer communication
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('get-database-path', () => {
  return path.join(app.getPath('userData'), 'github-dashboard.db');
});
