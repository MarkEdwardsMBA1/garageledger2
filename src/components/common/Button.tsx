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

  const textStyles = [
    styles.textStyle,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress({} as any);
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
          <Text style={textStyles}>{title}</Text>
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return <Text style={textStyles}>{title}</Text>;
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

  // Variant styles
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    ...theme.shadows.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.colors.error,
    ...theme.shadows.sm,
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

  // Text styles
  textStyle: {
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },

  // Text size variants
  smText: {
    fontSize: theme.components.button.fontSize.sm,
  },
  mdText: {
    fontSize: theme.components.button.fontSize.md,
  },
  lgText: {
    fontSize: theme.components.button.fontSize.lg,
  },

  // Text color variants
  primaryText: {
    color: theme.colors.surface,
  },
  secondaryText: {
    color: theme.colors.surface,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.surface,
  },
  textText: {
    color: theme.colors.primary,
  },

  // Disabled text
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default Button;