// Typography components with Inter font family
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';

export interface TextProps extends RNTextProps {
  /** Text variant */
  variant?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Text size */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Text color */
  color?: 'text' | 'textSecondary' | 'textLight' | 'primary' | 'secondary' | 'error' | 'success' | 'warning';
}

/**
 * Typography component with Inter font family
 * Automatically applies the correct font based on variant
 */
export const Text: React.FC<TextProps> = ({
  variant = 'regular',
  size = 'base',
  color = 'text',
  style,
  children,
  ...props
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    size === 'base' ? styles.baseFontSize : styles[size],
    styles[color],
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

  // Font variants
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

  // Font sizes
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

// Typography variants for common text styles
interface TypographyProps extends RNTextProps {
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'label';
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
      case 'title':
        return {
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          fontFamily: theme.typography.fontFamily.bold,
        };
      case 'heading':
        return {
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          fontFamily: theme.typography.fontFamily.semibold,
        };
      case 'body':
        return {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
        };
      case 'caption':
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
        };
      case 'label':
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          fontFamily: theme.typography.fontFamily.medium,
        };
      default:
        return {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
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