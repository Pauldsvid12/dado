export const COLORS = {
    primary: '#8B5CF6',
    secondary: '#EC4899',
  
    bgStart: '#0F172A',
    bgEnd: '#1E293B',
  
    surface: 'rgba(255,255,255,0.03)',
    surfaceBorder: 'rgba(255,255,255,0.05)',
  
    inputBg: 'rgba(15, 23, 42, 0.65)',
    inputBorder: 'rgba(148, 163, 184, 0.18)',
  
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    textSoft: '#CBD5E1',
  
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  } as const;
  
  export const TYPOGRAPHY = {
    size: {
      title: 36,
      subtitle: 16,
      body: 16,
      small: 12,
      button: 18,
    },
    weight: {
      regular: '400',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  } as const;
  
  export const THEME = {
    colors: COLORS,
    typography: TYPOGRAPHY,
  } as const;
  
  export type AppTheme = typeof THEME;  