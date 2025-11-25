export const questitTheme = {
  colors: {
    background: '#f8fafc',
    foreground: '#0f172a',
    muted: '#475569',
    primary: '#0ea5e9',
    primaryForeground: '#f0f9ff',
    border: '#e2e8f0',
    card: '#ffffff',
    cardMuted: '#0b1120',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e'
  },
  radii: {
    full: 999,
    xl: 32,
    lg: 20,
    md: 14,
    sm: 8
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    family: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6
    }
  }
} as const;

export type QuestitTheme = typeof questitTheme;
