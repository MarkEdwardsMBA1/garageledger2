// Error state component for displaying errors and empty states
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  
  /** Error message */
  message?: string;
  
  /** Error type */
  type?: 'error' | 'empty' | 'network' | 'not-found' | 'unauthorized';
  
  /** Show retry button */
  showRetry?: boolean;
  
  /** Retry button text */
  retryText?: string;
  
  /** Retry button handler */
  onRetry?: () => void;
  
  /** Custom icon component */
  icon?: React.ReactNode;
  
  /** Additional action button */
  action?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  
  /** Container style */
  style?: ViewStyle;
  
  /** Title style */
  titleStyle?: TextStyle;
  
  /** Message style */
  messageStyle?: TextStyle;
}

/**
 * Reusable Error State component for errors and empty states
 * Supports internationalization and different error types
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'error',
  showRetry = false,
  retryText,
  onRetry,
  icon,
  action,
  style,
  titleStyle,
  messageStyle,
}) => {
  const { t } = useTranslation();

  // Get default content based on error type
  const getDefaultContent = () => {
    switch (type) {
      case 'empty':
        return {
          title: t('errors.empty.title', 'No Data'),
          message: t('errors.empty.message', 'No items found.'),
          emoji: '📭',
        };
      case 'network':
        return {
          title: t('errors.network.title', 'Connection Error'),
          message: t('errors.network.message', 'Please check your internet connection and try again.'),
          emoji: '📡',
        };
      case 'not-found':
        return {
          title: t('errors.notFound.title', 'Not Found'),
          message: t('errors.notFound.message', 'The item you\'re looking for could not be found.'),
          emoji: '🔍',
        };
      case 'unauthorized':
        return {
          title: t('errors.unauthorized.title', 'Access Denied'),
          message: t('errors.unauthorized.message', 'You don\'t have permission to access this content.'),
          emoji: '🔒',
        };
      default:
        return {
          title: t('errors.generic.title', 'Something went wrong'),
          message: t('errors.generic.message', 'An unexpected error occurred. Please try again.'),
          emoji: '⚠️',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayRetryText = retryText || t('common.retry', 'Try Again');

  const containerStyle = [
    styles.container,
    style,
  ];

  const titleStyles = [
    styles.title,
    titleStyle,
  ];

  const messageStyles = [
    styles.message,
    messageStyle,
  ];

  return (
    <View style={containerStyle}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        {icon || (
          <Text style={styles.emoji}>
            {defaultContent.emoji}
          </Text>
        )}
      </View>

      {/* Title */}
      <Text style={titleStyles}>
        {displayTitle}
      </Text>

      {/* Message */}
      <Text style={messageStyles}>
        {displayMessage}
      </Text>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {showRetry && onRetry && (
          <Button
            title={displayRetryText}
            onPress={onRetry}
            variant="primary"
            style={styles.actionButton}
          />
        )}
        
        {action && (
          <Button
            title={action.title}
            onPress={action.onPress}
            variant={action.variant || 'outline'}
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
  );
};

// Empty state specific component
export interface EmptyStateProps extends Omit<ErrorStateProps, 'type'> {
  /** Empty state illustration */
  illustration?: React.ReactNode;
  
  /** Primary action for empty state */
  primaryAction?: {
    title: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  primaryAction,
  ...props
}) => {
  return (
    <ErrorState
      {...props}
      type="empty"
      icon={illustration}
      action={primaryAction ? {
        title: primaryAction.title,
        onPress: primaryAction.onPress,
        variant: 'primary',
      } : undefined}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    minHeight: 200,
  },

  iconContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },

  message: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.xl,
    maxWidth: 300,
  },

  actionsContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: 200,
  },

  actionButton: {
    minWidth: 120,
  },
});

export default ErrorState;