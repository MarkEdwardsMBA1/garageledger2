// Card component for displaying data and content
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../utils/theme';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  
  /** Card title */
  title?: string;
  
  /** Card subtitle */
  subtitle?: string | React.ReactNode;
  
  /** Card variant */
  variant?: 'default' | 'elevated' | 'floating' | 'outlined' | 'filled';
  
  /** Card size/padding */
  size?: 'sm' | 'md' | 'lg';
  
  /** Make card pressable */
  pressable?: boolean;
  
  /** Press handler (makes card pressable automatically) */
  onPress?: () => void;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Custom container style */
  style?: ViewStyle;
  
  /** Custom content style */
  contentStyle?: ViewStyle;
  
  /** Custom title style */
  titleStyle?: TextStyle;
  
  /** Custom subtitle style */
  subtitleStyle?: TextStyle;
  
  /** Header content (replaces title/subtitle if provided) */
  header?: React.ReactNode;
  
  /** Footer content */
  footer?: React.ReactNode;
  
  /** Right side content */
  rightContent?: React.ReactNode;
  
  /** Test ID for testing */
  testID?: string;
}

/**
 * Reusable Card component for displaying data
 * Supports titles, pressable states, and different variants
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'md',
  pressable = false,
  onPress,
  disabled = false,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  header,
  footer,
  rightContent,
  testID,
}) => {
  const isPressable = pressable || !!onPress;
  const isDisabled = disabled && isPressable;

  const cardStyle = [
    styles.base,
    styles[variant],
    styles[size],
    isPressable && styles.pressable,
    isDisabled && styles.disabled,
    style,
  ];

  const contentStyles = [
    styles.content,
    contentStyle,
  ];

  const titleStyles = [
    styles.title,
    styles[`${size}Title`],
    isDisabled && styles.disabledText,
    titleStyle,
  ];

  const subtitleStyles = [
    styles.subtitle,
    styles[`${size}Subtitle`],
    isDisabled && styles.disabledText,
    subtitleStyle,
  ];

  const renderHeader = () => {
    if (header) {
      return <View style={styles.headerContainer}>{header}</View>;
    }

    if (title || subtitle) {
      return (
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            {title && <Text style={titleStyles}>{title}</Text>}
            {subtitle && <Text style={subtitleStyles}>{subtitle}</Text>}
          </View>
          {rightContent && (
            <View style={styles.rightContentContainer}>
              {rightContent}
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  const renderContent = () => (
    <>
      {renderHeader()}
      <View style={contentStyles}>
        {children}
      </View>
      {footer && (
        <View style={styles.footerContainer}>
          {footer}
        </View>
      )}
    </>
  );

  if (isPressable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        testID={testID}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: theme.components.card.borderRadius,
    backgroundColor: theme.colors.surface,
    marginVertical: theme.components.card.marginVertical,
  },

  // Variant styles - Enhanced automotive-inspired cards
  default: {
    borderWidth: 0,
    ...theme.shadows.xs, // Subtle shadow for all cards
  },
  elevated: {
    ...theme.shadows.md, // Medium shadow for elevated cards
    backgroundColor: theme.colors.surface,
  },
  floating: {
    ...theme.shadows.floating, // Special floating shadow
    backgroundColor: theme.colors.surface,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.xs, // Subtle shadow even for outlined
  },
  filled: {
    backgroundColor: theme.colors.backgroundSecondary, // Subtle tinted background
    ...theme.shadows.sm, // Light shadow for depth
  },

  // Size styles
  sm: {
    padding: theme.spacing.md,
  },
  md: {
    padding: theme.components.card.padding,
  },
  lg: {
    padding: theme.spacing.xl,
  },

  // State styles
  pressable: {
    // Enhanced pressable interaction with automotive-style feedback
    transform: [{ scale: 1 }], // Base scale for smooth transitions
  },
  disabled: {
    opacity: 0.6,
  },

  // Layout styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  rightContentContainer: {
    marginLeft: theme.spacing.md,
    alignItems: 'flex-end',
  },
  content: {
    // Content area styling
  },
  footerContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },

  // Text styles
  title: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  smTitle: {
    fontSize: theme.typography.fontSize.base,
  },
  mdTitle: {
    fontSize: theme.typography.fontSize.lg,
  },
  lgTitle: {
    fontSize: theme.typography.fontSize.xl,
  },

  subtitle: {
    color: theme.colors.textSecondary,
  },
  smSubtitle: {
    fontSize: theme.typography.fontSize.sm,
  },
  mdSubtitle: {
    fontSize: theme.typography.fontSize.base,
  },
  lgSubtitle: {
    fontSize: theme.typography.fontSize.lg,
  },

  disabledText: {
    color: theme.colors.textLight,
  },
});

export default Card;