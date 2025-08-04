// Design system theme configuration
// Based on README.md design system specifications

export const colors = {
  // Primary colors
  primary: '#2563eb',      // Blue
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',
  
  // Secondary colors  
  secondary: '#059669',    // Green
  secondaryLight: '#10b981',
  secondaryDark: '#047857',
  
  // Accent colors
  accent: '#dc2626',       // Red
  accentLight: '#f87171',
  accentDark: '#b91c1c',
  
  // Neutral colors
  background: '#f8fafc',   // Light Gray
  backgroundSecondary: '#f1f5f9', // Slightly darker than background
  surface: '#ffffff',
  text: '#1e293b',         // Dark Gray
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  primaryText: '#1e293b',  // Alias for main text color
  
  // State colors
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#2563eb',
  
  // Border colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',  // Will fall back to system font
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold', 
    bold: 'Inter-Bold',
    mono: 'JetBrainsMono-Regular',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Component-specific theme values
export const components = {
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    },
    borderRadius: borderRadius.lg,
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
    },
  },
  
  input: {
    height: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
  },
  
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
} as const;

// Export theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;

export default theme;