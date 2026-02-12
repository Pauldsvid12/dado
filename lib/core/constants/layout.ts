import { Platform } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 32,
} as const;

export const SIZES = {
  inputHeight: 52,
  buttonHeight: 56,
  borderWidth: 1,
  icon: { sm: 18, md: 24, lg: 32, xl: 80 },
  headerHeight: Platform.select({ ios: 44, android: 56, default: 56 }),
} as const;

export const SCREEN = {
  padding: SPACING.xl,     
  cardPadding: SPACING.lg, 
  maxWidth: 520,          
} as const;

export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 } as const;