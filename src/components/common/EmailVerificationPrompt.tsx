import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ViewStyle,
} from 'react-native';
import { Card } from './Card';
import { Typography } from './Typography';
import { Button } from './Button';
import { authService } from '../../services/AuthService';
import { theme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';

export type VerificationPromptVariant = 
  | 'security'      // 🔐 Secure your vehicle data with account recovery
  | 'backup'        // ☁️ Protect your garage's digital memory  
  | 'reminders'     // 📧 Get notified about maintenance reminders
  | 'completion';   // ✓ Complete your account setup

interface EmailVerificationPromptProps {
  variant?: VerificationPromptVariant;
  onDismiss?: () => void;
  onVerificationSent?: () => void;
  style?: ViewStyle;
}

interface PromptConfig {
  icon: string;
  title: string;
  description: string;
  actionText: string;
}

const PROMPT_CONFIGS: Record<VerificationPromptVariant, PromptConfig> = {
  security: {
    icon: '🔐',
    title: 'Secure Your Account',
    description: 'Verify your email to enable password recovery and protect your vehicle data.',
    actionText: 'Verify Email',
  },
  backup: {
    icon: '☁️',
    title: 'Protect Your Data',
    description: 'Secure your garage\'s digital memory with verified cloud backup.',
    actionText: 'Verify Email',
  },
  reminders: {
    icon: '📧',
    title: 'Stay Updated', 
    description: 'Get maintenance reminders and important notifications.',
    actionText: 'Enable Notifications',
  },
  completion: {
    icon: '✓',
    title: 'Almost Done!',
    description: 'Complete your account setup by verifying your email address.',
    actionText: 'Complete Setup',
  },
};

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  variant = 'security',
  onDismiss,
  onVerificationSent,
  style,
}) => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const config = PROMPT_CONFIGS[variant];

  // Don't show if email is already verified
  if (user?.emailVerified) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      await authService.sendEmailVerification();
      onVerificationSent?.();
      
      Alert.alert(
        '📧 Verification Email Sent!',
        'Check your email inbox for the verification link. Don\'t forget to check your spam folder!',
        [{ text: 'Got it!' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to Send Verification',
        error.message || 'Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await refreshUser();
      if (user?.emailVerified) {
        Alert.alert(
          '✅ Email Verified!',
          'Your email has been successfully verified.',
          [{ text: 'Great!' }]
        );
      }
    } catch (error) {
      // Silent fail for refresh
    }
  };

  return (
    <Card variant="outlined" style={[styles.container, style] as any}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Typography variant="body" style={styles.icon}>
              {config.icon}
            </Typography>
          </View>
          <View style={styles.textContainer}>
            <Typography variant="subheading" style={styles.title}>
              {config.title}
            </Typography>
            <Typography variant="body" style={styles.description}>
              {config.description}
            </Typography>
          </View>
          {onDismiss && (
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.dismissButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Typography variant="body" style={styles.dismissText}>
                ×
              </Typography>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.actions}>
          <Button
            title={config.actionText}
            onPress={handleSendVerification}
            disabled={isLoading}
            style={styles.primaryAction}
            variant="primary"
          />
          <TouchableOpacity
            onPress={handleRefreshStatus}
            style={styles.secondaryAction}
          >
            <Typography variant="body" style={styles.secondaryActionText}>
              Already verified? Refresh
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: theme.colors.warning, // Signal Orange
    backgroundColor: theme.colors.backgroundSecondary, // Light automotive background
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
    marginTop: 2, // Slight vertical alignment
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  description: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  dismissButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  dismissText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  primaryAction: {
    // Primary button styles already defined in Button component
  },
  secondaryAction: {
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    textDecorationLine: 'underline',
  },
});