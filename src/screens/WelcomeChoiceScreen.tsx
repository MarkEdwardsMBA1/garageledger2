import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { GoogleContinueButton } from '../components/auth/GoogleContinueButton';
import { Loading } from '../components/common/Loading';
import { theme } from '../utils/theme';
import { useAuth } from '../contexts/AuthContext';
import { AuthError } from '../services/AuthService';

export const WelcomeChoiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signInWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      
      await signInWithGoogle();
      
      // After successful Google OAuth, navigate to consents (Step 2 of 2)
      navigation.navigate('LegalAgreements' as never);
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      let message = 'Failed to sign in with Google. Please try again.';
      if (error instanceof AuthError) {
        if (error.code === 'auth/cancelled') {
          message = 'Sign in was cancelled. Please try again if you want to continue.';
        } else if (error.code === 'auth/play-services-unavailable') {
          message = 'Google Play services are not available on this device.';
        } else {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isGoogleLoading) {
    return (
      <Loading message="Connecting with Google..." />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(theme.spacing.xl, 60) } // Account for status bar + safe area
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 1 of 2
          </Typography>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Typography variant="title" style={styles.title}>
            Welcome! Let's get your GarageLedger setup
          </Typography>
        </View>

        {/* Authentication Options */}
        <View style={styles.authOptionsContainer}>
          {/* Email/Password Option */}
          <Button
            title="Continue"
            onPress={handleEmailSignUp}
            variant="primary"
            style={styles.emailButton}
            fullWidth
            testID="email-continue-button"
          />

          {/* OR Divider */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Typography variant="body" style={styles.orText}>
              OR
            </Typography>
            <View style={styles.orLine} />
          </View>

          {/* Google Sign-In Option */}
          <GoogleContinueButton
            onPress={handleGoogleSignIn}
            loading={isGoogleLoading}
            fullWidth
            style={styles.googleButton}
            testID="google-continue-button"
          />

          {/* Error Message Display */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Typography variant="body" style={styles.errorText}>
                ⚠️ {errorMessage}
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: theme.spacing['2xl'],
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  authOptionsContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  emailButton: {
    marginBottom: theme.spacing.lg,
    minHeight: 48,
    backgroundColor: theme.colors.primary, // Engine blue
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  orText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 1, // Slightly spaced for emphasis
  },
  googleButton: {
    marginTop: theme.spacing.md,
    // Google button styling is handled in GoogleContinueButton component
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '10', // 10% opacity
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error + '30', // 30% opacity
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
});