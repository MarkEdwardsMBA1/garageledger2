// Button component with multiple variants and states
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button text content */
  title: string;
  
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'text';
  
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Loading state */
  loading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Custom button style */
  style?: ViewStyle;
  
  /** Custom text style */
  textStyle?: TextStyle;
  
  /** Icon component (optional) */
  icon?: React.ReactNode;
  
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

/**
 * Reusable Button component with multiple variants
 * Supports loading states, icons, and bilingual text
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`${variant}Disabled`],
    style,
  ];


  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress({} as any);
    }
  };

  const getButtonTextStyle = () => {
    return {
      color: getTextColor(),
      textAlign: 'center' as const,
      // Typography variant="button" handles fontSize, fontWeight, fontFamily, letterSpacing
    };
  };

  const getTextColor = () => {
    if (isDisabled) {
      return theme.colors.textSecondary;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return theme.colors.surface;
      case 'outline':
      case 'ghost':
      case 'text':
        return theme.colors.primary;
      default:
        return theme.colors.surface;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.surface}
        />
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          <Typography variant="button" style={getButtonTextStyle()}>{title}</Typography>
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return <Typography variant="button" style={getButtonTextStyle()}>{title}</Typography>;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.components.button.borderRadius,
    borderWidth: 0,
    gap: theme.spacing.sm,
  },

  // Size variants
  sm: {
    height: theme.components.button.height.sm,
    paddingHorizontal: theme.components.button.paddingHorizontal.sm,
  },
  md: {
    height: theme.components.button.height.md,
    paddingHorizontal: theme.components.button.paddingHorizontal.md,
  },
  lg: {
    height: theme.components.button.height.lg,
    paddingHorizontal: theme.components.button.paddingHorizontal.lg,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },

  // Variant styles - Enhanced with premium automotive shadows
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm, // Engine Blue with premium shadow
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    ...theme.shadows.sm, // Racing Green with premium shadow
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.xs, // Subtle shadow for outlined buttons
  },
  ghost: {
    backgroundColor: 'transparent',
    // No shadow for ghost buttons
  },
  danger: {
    backgroundColor: theme.colors.error,
    ...theme.shadows.sm, // Critical Red with premium shadow
  },
  text: {
    backgroundColor: 'transparent',
  },

  // Disabled states
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  secondaryDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  outlineDisabled: {
    borderColor: theme.colors.textLight,
  },
  ghostDisabled: {},
  dangerDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  textDisabled: {},

  // Typography handled by Typography variant="button"
  // Colors handled by getButtonTextStyle() function
});

export default Button;