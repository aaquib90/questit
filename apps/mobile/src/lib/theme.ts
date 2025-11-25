import { useColorScheme } from 'react-native';
import { getDefaultTheme } from '@questit/ui';
import { useThemeManager } from '../hooks/useThemeManager';

const ACCENT_HEX: Record<string, string> = {
  emerald: '#10b981',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  lime: '#84cc16',
  slate: '#64748b'
};

export function useQuestitTheme() {
  const scheme = useColorScheme();
  const { accent, mode } = useThemeManager();
  const baseTheme = { ...getDefaultTheme(), accent, mode };
  const resolvedMode = baseTheme.mode === 'system' ? scheme || 'light' : baseTheme.mode;
  const accentHex = ACCENT_HEX[baseTheme.accent] || ACCENT_HEX.emerald;
  const palette =
    resolvedMode === 'dark'
      ? { background: '#030712', foreground: '#e2e8f0', border: '#0f172a' }
      : { background: '#f8fafc', foreground: '#0f172a', border: '#e2e8f0' };

  return {
    baseTheme,
    resolvedMode,
    accentHex,
    palette
  };
}
