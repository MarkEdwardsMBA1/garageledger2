// Floating Action Button (FAB) Component
// Reusable FAB following automotive design system standards

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';

export interface FloatingActionButtonProps {
  /** Function to call when FAB is pressed */
  onPress: () => void;

  /** Icon to display - can be text (like "+") or React component */
  icon?: React.ReactNode;

  /** Text icon as shorthand (e.g., "+", "✓") */
  iconText?: string;

  /** FAB size variant */
  size?: 'standard' | 'mini';

  /** FAB color variant */
  variant?: 'primary' | 'secondary' | 'success';

  /** Disabled state */
  disabled?: boolean;

  /** Custom style overrides */
  style?: ViewStyle;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Floating Action Button - Premium automotive-styled FAB
 * Follows Material Design principles with GarageLedger design system
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  iconText = '+',
  size = 'standard',
  variant = 'primary',
  disabled = false,
  style,
  accessibilityLabel,
  testID,
}) => {
  const fabStyles = [
    styles.fab,
    styles[size],
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const renderIcon = () => {
    if (icon) {
      return icon;
    }

    return (
      <Typography
        variant="heading"
        style={[
          styles.iconText,
          styles[`${size}IconText`],
          styles[`${variant}IconText`],
          disabled && styles.disabledIconText
        ]}
      >
        {iconText}
      </Typography>
    );
  };

  return (
    <TouchableOpacity
      style={fabStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      testID={testID}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base FAB styles
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28, // Standard FAB: half of 56px
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.floating, // iOS shadow from design system
  },

  // Size variants
  standard: {
    width: 56,
    height: 56,
  },

  mini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    bottom: 20,
    right: 20,
  },

  // Color variants - using automotive design system
  primary: {
    backgroundColor: theme.colors.primary, // Engine Blue
  },

  secondary: {
    backgroundColor: theme.colors.secondary, // Racing Green
  },

  success: {
    backgroundColor: theme.colors.success, // Racing Green
  },

  // Disabled state
  disabled: {
    backgroundColor: theme.colors.textLight,
    ...theme.shadows.sm,
  },

  // Icon text styles
  iconText: {
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  standardIconText: {
    fontSize: 24,
    lineHeight: 24,
  },

  miniIconText: {
    fontSize: 18,
    lineHeight: 18,
  },

  // Icon text colors by variant
  primaryIconText: {
    color: theme.colors.surface, // White text on Engine Blue
  },

  secondaryIconText: {
    color: theme.colors.surface, // White text on Racing Green
  },

  successIconText: {
    color: theme.colors.surface, // White text on Racing Green
  },

  disabledIconText: {
    color: theme.colors.textSecondary,
  },
});

export default FloatingActionButton;