// Typography components with Inter font family
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

export interface TextProps extends RNTextProps {
  /** Text variant */
  variant?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  /** Text size */
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  /** Text color */
  color?: 'text' | 'textSecondary' | 'textLight' | 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  /** Letter spacing */
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
}

/**
 * Typography component with Inter font family
 * Automatically applies the correct font based on variant
 */
export const Text: React.FC<TextProps> = ({
  variant = 'regular',
  size = 'base',
  color = 'text',
  letterSpacing = 'normal',
  style,
  children,
  ...props
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    size === 'base' ? styles.baseFontSize : styles[size],
    styles[color],
    letterSpacing === 'normal' ? null : { letterSpacing: theme.typography.letterSpacing[letterSpacing] },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
  },

  // Font variants - Updated with new weights
  light: {
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: theme.typography.fontWeight.light,
  },
  regular: {
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: theme.typography.fontWeight.normal,
  },
  medium: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  semibold: {
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bold: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  extrabold: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.extrabold,
  },

  // Font sizes - Enhanced with new sizes
  '2xs': {
    fontSize: theme.typography.fontSize['2xs'],
  },
  xs: {
    fontSize: theme.typography.fontSize.xs,
  },
  sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  baseFontSize: {
    fontSize: theme.typography.fontSize.base,
  },
  lg: {
    fontSize: theme.typography.fontSize.lg,
  },
  xl: {
    fontSize: theme.typography.fontSize.xl,
  },
  '2xl': {
    fontSize: theme.typography.fontSize['2xl'],
  },
  '3xl': {
    fontSize: theme.typography.fontSize['3xl'],
  },
  '4xl': {
    fontSize: theme.typography.fontSize['4xl'],
  },
  '5xl': {
    fontSize: theme.typography.fontSize['5xl'],
  },
  '6xl': {
    fontSize: theme.typography.fontSize['6xl'],
  },

  // Colors
  text: {
    color: theme.colors.text,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  textLight: {
    color: theme.colors.textLight,
  },
  primary: {
    color: theme.colors.primary,
  },
  secondary: {
    color: theme.colors.secondary,
  },
  error: {
    color: theme.colors.error,
  },
  success: {
    color: theme.colors.success,
  },
  warning: {
    color: theme.colors.warning,
  },
});

// Typography variants for common text styles with enhanced hierarchy
interface TypographyProps extends RNTextProps {
  variant?: 
    | 'display'        // Hero/Display text
    | 'title'          // Page titles
    | 'heading'        // Section headings
    | 'subheading'     // Sub-section headings  
    | 'body'           // Regular body text
    | 'bodyLarge'      // Large body text
    | 'bodySmall'      // Small body text
    | 'caption'        // Small descriptive text
    | 'label'          // Form labels, UI labels
    | 'button'         // Button text
    | 'overline';      // Small caps text
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  style,
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'display':
        return {
          fontSize: theme.typography.fontSize['4xl'],
          fontWeight: theme.typography.fontWeight.bold,
          fontFamily: theme.typography.fontFamily.bold,
          lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['4xl'],
          letterSpacing: theme.typography.letterSpacing.tight,
        };
      case 'title':
        return {
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          fontFamily: theme.typography.fontFamily.bold,
          lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['2xl'],
          letterSpacing: theme.typography.letterSpacing.tight,
        };
      case 'heading':
        return {
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          fontFamily: theme.typography.fontFamily.semibold,
          lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.xl,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'subheading':
        return {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.medium,
          fontFamily: theme.typography.fontFamily.medium,
          lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.lg,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'bodyLarge':
        return {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
          lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'body':
        return {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
          lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'bodySmall':
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
          lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
      case 'caption':
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
          lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.sm,
          letterSpacing: theme.typography.letterSpacing.wide,
        };
      case 'label':
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          fontFamily: theme.typography.fontFamily.medium,
          lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
          letterSpacing: theme.typography.letterSpacing.wide,
        };
      case 'button':
        return {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          fontFamily: theme.typography.fontFamily.semibold,
          lineHeight: theme.typography.lineHeight.none * theme.typography.fontSize.base,
          letterSpacing: theme.typography.letterSpacing.wide,
        };
      case 'overline':
        return {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          fontFamily: theme.typography.fontFamily.semibold,
          lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.xs,
          letterSpacing: theme.typography.letterSpacing.wider,
          textTransform: 'uppercase' as const,
        };
      default:
        return {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
          lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
          letterSpacing: theme.typography.letterSpacing.normal,
        };
    }
  };

  return (
    <RNText style={[getVariantStyles(), { color: theme.colors.text }, style]} {...props}>
      {children}
    </RNText>
  );
};

export default Text;