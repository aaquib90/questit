export type QuestitThemeToken = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'lime' | 'slate';

export interface QuestitColorModeConfig {
  mode: 'light' | 'dark' | 'system';
  accent: QuestitThemeToken;
}

const defaultTheme: QuestitColorModeConfig = {
  mode: 'system',
  accent: 'emerald'
};

export function getDefaultTheme(): QuestitColorModeConfig {
  return defaultTheme;
}

export * from './theme/tokens';
export * from './native';
