import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuestitThemeToken } from '@questit/ui';

const THEME_STORAGE_KEY = 'questit-theme-key';
const COLOR_MODE_STORAGE_KEY = 'questit-color-mode';

type ColorMode = 'light' | 'dark' | 'system';

export function useThemeManager() {
  const [accent, setAccent] = useState<QuestitThemeToken>('emerald');
  const [mode, setMode] = useState<ColorMode>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_STORAGE_KEY, COLOR_MODE_STORAGE_KEY])
      .then((entries) => {
        const themeEntry = entries.find(([key]) => key === THEME_STORAGE_KEY)?.[1];
        const modeEntry = entries.find(([key]) => key === COLOR_MODE_STORAGE_KEY)?.[1];
        if (themeEntry) {
          setAccent(themeEntry as QuestitThemeToken);
        }
        if (modeEntry === 'light' || modeEntry === 'dark' || modeEntry === 'system') {
          setMode(modeEntry);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateAccent = useCallback(async (next: QuestitThemeToken) => {
    setAccent(next);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const updateMode = useCallback(async (next: ColorMode) => {
    setMode(next);
    await AsyncStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
  }, []);

  return {
    accent,
    mode,
    setAccent: updateAccent,
    setMode: updateMode,
    loading
  };
}
