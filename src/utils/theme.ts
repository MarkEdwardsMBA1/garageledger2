// Design system theme configuration
// Based on README.md design system specifications

export const colors = {
  // Primary colors - Engine Blue (trust, reliability, precision)
  primary: '#1e40af',           // Engine Blue
  primaryLight: '#3b82f6',      // Lighter Engine Blue
  primaryDark: '#1e3a8a',       // Darker Engine Blue
  
  // Secondary colors - Racing Green (efficiency, eco-friendly)
  secondary: '#166534',         // Racing Green
  secondaryLight: '#22c55e',    // Lighter Racing Green
  secondaryDark: '#14532d',     // Darker Racing Green
  
  // Performance colors - Performance Red (action, power, excitement)
  accent: '#dc2626',            // Performance Red
  accentLight: '#f87171',       // Lighter Performance Red
  accentDark: '#b91c1c',        // Darker Performance Red
  
  // Premium Automotive Neutrals
  background: '#f8fafc',        // Clean White
  backgroundSecondary: '#f1f5f9', // Slightly tinted background
  surface: '#ffffff',           // Pure White
  text: '#111827',              // Oil Black (deep, premium)
  textSecondary: '#374151',     // Titanium Gray
  textTertiary: '#9ca3af',      // Chrome Silver (subtle text)
  textLight: '#9ca3af',         // Chrome Silver
  primaryText: '#111827',       // Alias for main text color
  
  // Automotive-Inspired State Colors
  success: '#166534',           // Racing Green (achievements, completed)
  warning: '#ea580c',           // Signal Orange (maintenance alerts, warnings)
  error: '#b91c1c',             // Critical Red (errors, failures)
  info: '#0284c7',              // Electric Blue (information, modern tech)
  
  // Enhanced Border System
  border: '#e5e7eb',            // Subtle Gray
  borderLight: '#f3f4f6',       // Very Light Gray
  borderDark: '#d1d5db',        // Medium Gray
  
  // Premium Overlays
  overlay: 'rgba(17, 24, 39, 0.75)',      // Oil Black overlay
  overlayLight: 'rgba(17, 24, 39, 0.25)', // Subtle Oil Black overlay
  
  // Additional Automotive Colors
  performance: '#dc2626',       // Performance Red (alias for accent)
  luxury: '#374151',            // Titanium Gray for premium elements
  chrome: '#9ca3af',            // Chrome Silver for accents
  carbon: '#111827',            // Carbon Black for premium text
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
  
  // Font sizes - Enhanced scale with more granular options
  fontSize: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line heights - More precise values for better readability
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Letter spacing for better text appearance
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
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
  // Subtle automotive-inspired shadows for premium depth
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#111827', // Oil Black shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#111827', // Oil Black shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#111827', // Oil Black shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#111827', // Oil Black shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#111827', // Oil Black shadow
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 12,
  },
  // Special automotive shadows
  floating: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  pressed: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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