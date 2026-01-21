// Electron detection and IPC utilities
// Provides type-safe access to Electron APIs from React components

interface FileFilter {
  name: string;
  extensions: string[];
}

interface SelectFileOptions {
  filters?: FileFilter[];
  title?: string;
}

interface SaveFileOptions {
  filters?: FileFilter[];
  defaultPath?: string;
  title?: string;
}

interface AppInfo {
  version: string;
  name: string;
  platform: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
}

interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  selectFile: (options?: SelectFileOptions) => Promise<string | null>;
  saveFile: (options?: SaveFileOptions) => Promise<string | null>;
  openExternal: (url: string) => Promise<boolean>;
  getAppInfo: () => Promise<AppInfo>;
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Check if running in Electron environment
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' &&
         typeof window.electronAPI !== 'undefined' &&
         window.electronAPI.isElectron === true;
}

/**
 * Get the current platform (win32, darwin, linux)
 * Returns 'web' if not in Electron
 */
export function getPlatform(): string {
  if (!isElectron()) return 'web';
  return window.electronAPI!.platform;
}

/**
 * Open native directory selection dialog
 * Returns null if not in Electron or user cancels
 */
export async function selectDirectory(): Promise<string | null> {
  if (!isElectron()) return null;
  return window.electronAPI!.selectDirectory();
}

/**
 * Open native file selection dialog
 * Returns null if not in Electron or user cancels
 *
 * @example
 * const file = await selectFile({
 *   title: 'Select JSON file',
 *   filters: [{ name: 'JSON', extensions: ['json'] }]
 * });
 */
export async function selectFile(options?: SelectFileOptions): Promise<string | null> {
  if (!isElectron()) return null;
  return window.electronAPI!.selectFile(options);
}

/**
 * Open native save file dialog
 * Returns null if not in Electron or user cancels
 *
 * @example
 * const path = await saveFile({
 *   title: 'Export data',
 *   defaultPath: 'export.json',
 *   filters: [{ name: 'JSON', extensions: ['json'] }]
 * });
 */
export async function saveFile(options?: SaveFileOptions): Promise<string | null> {
  if (!isElectron()) return null;
  return window.electronAPI!.saveFile(options);
}

/**
 * Open a URL in the default browser
 * Returns false if not in Electron or URL is invalid
 */
export async function openExternal(url: string): Promise<boolean> {
  if (!isElectron()) {
    // Fallback for web: open in new tab
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }
    return false;
  }
  return window.electronAPI!.openExternal(url);
}

/**
 * Get application info (version, platform, etc.)
 * Returns null if not in Electron
 */
export async function getAppInfo(): Promise<AppInfo | null> {
  if (!isElectron()) return null;
  return window.electronAPI!.getAppInfo();
}

// Re-export types
export type { FileFilter, SelectFileOptions, SaveFileOptions, AppInfo };