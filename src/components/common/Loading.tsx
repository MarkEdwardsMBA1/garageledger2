// Loading component with different variants
import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';

export interface LoadingProps {
  /** Loading message */
  message?: string;
  
  /** Loading variant */
  variant?: 'spinner' | 'overlay' | 'inline' | 'fullscreen';
  
  /** Loading size */
  size?: 'small' | 'large';
  
  /** Loading color */
  color?: string;
  
  /** Show loading message */
  showMessage?: boolean;
  
  /** Custom container style */
  style?: ViewStyle;
  
  /** Custom text style */
  textStyle?: TextStyle;
  
  /** Background color for overlay variant */
  overlayColor?: string;
}

/**
 * Reusable Loading component with multiple variants
 * Supports internationalization and different display modes
 */
export const Loading: React.FC<LoadingProps> = ({
  message,
  variant = 'spinner',
  size = 'large',
  color = theme.colors.primary,
  showMessage = true,
  style,
  textStyle,
  overlayColor = theme.colors.overlay,
}) => {
  const { t } = useTranslation();
  
  const defaultMessage = message || t('common.loading', 'Loading...');

  const containerStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  const messageTextStyle = [
    styles.message,
    textStyle,
  ];

  const renderContent = () => (
    <>
      <ActivityIndicator
        size={size}
        color={color}
        style={styles.indicator}
      />
      {showMessage && (
        <Text style={messageTextStyle}>
          {defaultMessage}
        </Text>
      )}
    </>
  );

  if (variant === 'overlay' || variant === 'fullscreen') {
    return (
      <View style={[
        containerStyle,
        { backgroundColor: overlayColor }
      ]}>
        <View style={styles.overlayContent}>
          {renderContent()}
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
    </View>
  );
};

// Loading dots animation component
export interface LoadingDotsProps {
  /** Dot color */
  color?: string;
  
  /** Dot size */
  size?: number;
  
  /** Container style */
  style?: ViewStyle;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  color = theme.colors.primary,
  size = 8,
  style,
}) => {
  return (
    <View style={[styles.dotsContainer, style]}>
      <View style={[styles.dot, { backgroundColor: color, width: size, height: size }]} />
      <View style={[styles.dot, { backgroundColor: color, width: size, height: size }]} />
      <View style={[styles.dot, { backgroundColor: color, width: size, height: size }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variant styles
  spinner: {
    padding: theme.spacing.lg,
  },
  inline: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullscreen: {
    flex: 1,
  },

  // Overlay content
  overlayContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.xl,
    ...theme.shadows.lg,
  },

  // Indicator styles
  indicator: {
    marginBottom: theme.spacing.md,
  },

  // Text styles
  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  // Loading dots styles
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  dot: {
    borderRadius: theme.borderRadius.full,
    opacity: 0.7,
  },
});

export default Loading;