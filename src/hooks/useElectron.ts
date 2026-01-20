'use client';

import { useEffect, useState } from 'react';

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    const electronAPI = window.electronAPI;

    if (electronAPI?.isElectron) {
      setIsElectron(true);

      electronAPI.getAppVersion().then(setAppVersion);
      electronAPI.getPlatform().then(setPlatform);
    }
  }, []);

  const openExternal = async (url: string) => {
    if (window.electronAPI?.isElectron) {
      await window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return {
    isElectron,
    appVersion,
    platform,
    openExternal,
  };
}
