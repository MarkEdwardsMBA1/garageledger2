// Automotive-themed error state component following GarageLedger design system
import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Card } from './Card';
import { 
  AlertTriangleIcon, 
  Car91Icon, 
  LockIcon, 
  SearchIcon,
  ActivityIcon 
} from '../icons';

export interface AutomotiveErrorStateProps {
  /** Error title */
  title?: string;
  
  /** Error message */
  message?: string;
  
  /** Error type - determines icon and styling */
  type?: 'error' | 'empty' | 'network' | 'not-found' | 'unauthorized' | 'maintenance';
  
  /** Show retry button */
  showRetry?: boolean;
  
  /** Retry button text */
  retryText?: string;
  
  /** Retry button handler */
  onRetry?: () => void;
  
  /** Custom icon component (overrides type-based icon) */
  customIcon?: React.ReactNode;
  
  /** Primary action button */
  primaryAction?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  
  /** Secondary action button */
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
  
  /** Container style */
  style?: ViewStyle;
  
  /** Use card layout for more prominent errors */
  useCard?: boolean;
}

/**
 * Automotive-themed error state component
 * Uses professional automotive language and iconography
 */
export const AutomotiveErrorState: React.FC<AutomotiveErrorStateProps> = ({
  title,
  message,
  type = 'error',
  showRetry = false,
  retryText,
  onRetry,
  customIcon,
  primaryAction,
  secondaryAction,
  style,
  useCard = false,
}) => {
  const { t } = useTranslation();

  // Get automotive-themed content based on error type
  const getAutomotiveContent = () => {
    switch (type) {
      case 'empty':
        return {
          title: t('errors.empty.title', 'No Vehicles Added'),
          message: t('errors.empty.message', 'Your garage is ready for its first vehicle. Start building your digital maintenance record.'),
          icon: <Car91Icon 
            size={80} 
            color={theme.colors.textSecondary}
            bodyColor={theme.colors.secondary}
            windowColor={theme.colors.chrome}
            outlineColor={theme.colors.textSecondary}
          />,
          color: theme.colors.textSecondary,
        };
      case 'network':
        return {
          title: t('errors.network.title', 'Connection Issue'),
          message: t('errors.network.message', 'Unable to sync your vehicle data. Check your connection and try again.'),
          icon: <ActivityIcon size={40} color={theme.colors.warning} />,
          color: theme.colors.warning,
        };
      case 'not-found':
        return {
          title: t('errors.notFound.title', 'Vehicle Not Found'),
          message: t('errors.notFound.message', 'The vehicle you\'re looking for is no longer in your garage.'),
          icon: <SearchIcon size={40} color={theme.colors.textSecondary} />,
          color: theme.colors.textSecondary,
        };
      case 'unauthorized':
        return {
          title: t('errors.unauthorized.title', 'Account Access Required'),
          message: t('errors.unauthorized.message', 'Please sign in to access your vehicle data and maintenance records.'),
          icon: <LockIcon size={40} color={theme.colors.info} />,
          color: theme.colors.info,
        };
      case 'maintenance':
        return {
          title: t('errors.maintenance.title', 'Service Temporarily Unavailable'),
          message: t('errors.maintenance.message', 'We\'re performing maintenance on our systems. Please try again in a few minutes.'),
          icon: <AlertTriangleIcon size={40} color={theme.colors.warning} />,
          color: theme.colors.warning,
        };
      default:
        return {
          title: t('errors.generic.title', 'System Error'),
          message: t('errors.generic.message', 'An unexpected error occurred while accessing your vehicle data. Please try again.'),
          icon: <AlertTriangleIcon size={40} color={theme.colors.error} />,
          color: theme.colors.error,
        };
    }
  };

  const automotiveContent = getAutomotiveContent();
  const displayTitle = title || automotiveContent.title;
  const displayMessage = message || automotiveContent.message;
  const displayRetryText = retryText || t('common.retry', 'Try Again');
  const displayIcon = customIcon || automotiveContent.icon;

  const Content = () => (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        {displayIcon}
      </View>

      {/* Title */}
      <Typography variant="heading" style={styles.title}>
        {displayTitle}
      </Typography>

      {/* Message */}
      <Typography variant="body" style={styles.message}>
        {displayMessage}
      </Typography>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {primaryAction && (
          <Button
            title={primaryAction.title}
            onPress={primaryAction.onPress}
            variant={primaryAction.variant || 'primary'}
            style={styles.primaryButton}
          />
        )}
        
        {showRetry && onRetry && (
          <Button
            title={displayRetryText}
            onPress={onRetry}
            variant={primaryAction ? 'outline' : 'primary'}
            style={styles.actionButton}
          />
        )}
        
        {secondaryAction && (
          <Button
            title={secondaryAction.title}
            onPress={secondaryAction.onPress}
            variant="text"
            style={styles.secondaryButton}
          />
        )}
      </View>
    </View>
  );

  // Wrap in card for prominent errors
  if (useCard) {
    return (
      <View style={styles.cardContainer}>
        <Card variant="elevated" style={styles.card}>
          <Content />
        </Card>
      </View>
    );
  }

  return <Content />;
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: theme.spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    // Card styles handled by Card component
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  message: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.xl,
    maxWidth: 320,
  },
  actionsContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    width: '100%',
  },
  actionButton: {
    minWidth: 140,
  },
  secondaryButton: {
    // Text button styles handled by Button component
  },
});

export default AutomotiveErrorState;