import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { authService, AuthError } from '../services/AuthService';
import { theme } from '../utils/theme';

interface SignUpFormData {
  email: string;
  password: string;
  displayName: string;
}

interface SignUpFormErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: SignUpFormErrors = {};

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation - simplified for better UX
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear global error message
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.signUp({
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.displayName.trim(),
      });

      // Navigate to legal agreements screen (integrated, not blocking)
      navigation.navigate('LegalAgreements' as never);
    } catch (error) {
      let message = error instanceof AuthError ? error.message : 'An unexpected error occurred';
      
      // Use friendly message for email already exists error
      if (error instanceof AuthError && error.code === 'auth/email-already-in-use') {
        message = 'Oops! An account with this email already exists. Please sign in.';
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  if (isLoading) {
    return <Loading />;
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
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 3 of 5
          </Typography>
        </View>

        <View style={styles.header}>
          <Typography variant="title" style={styles.title}>
            Create Your Account
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Just a few details to get you started
          </Typography>
        </View>

        <Card style={styles.form}>
          <Input
            label="Display Name"
            value={formData.displayName}
            onChangeText={(value) => handleInputChange('displayName', value)}
            placeholder="Enter your name"
            autoCapitalize="words"
            autoComplete="name"
            error={errors.displayName}
            testID="display-name-input"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            testID="email-input"
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Create a password"
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            passwordRules="minlength: 6; maxlength: 128;"
            error={errors.password}
            testID="password-input"
          />

          <View style={styles.passwordRequirements}>
            <Typography variant="caption" style={styles.requirementsText}>
              • Password must be at least 6 characters
            </Typography>
          </View>

          {/* Error Message Display */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Typography variant="body" style={styles.errorText}>
                ⚠️ {errorMessage}
              </Typography>
            </View>
          )}
          

          <Button
            title="Create Account"
            onPress={handleSignUp}
            disabled={isLoading}
            style={styles.signUpButton}
            testID="sign-up-button"
          />
        </Card>

        <View style={styles.footer}>
          <Typography variant="body" style={styles.footerText}>
            Already have an account?
          </Typography>
          <Button
            title="Sign In"
            onPress={navigateToLogin}
            variant="text"
            style={styles.signInButton}
            testID="navigate-login-button"
          />
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
  },
  progressContainer: {
    marginBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  form: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  passwordRequirements: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  requirementsText: {
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '10', // 10% opacity
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error + '30', // 30% opacity
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  signUpButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    color: theme.colors.textSecondary,
  },
  signInButton: {
    marginLeft: theme.spacing.xs,
  },
});