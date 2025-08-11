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

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.signIn({
        email: formData.email.trim(),
        password: formData.password,
      });
      // Navigation will be handled by auth state change
    } catch (error) {
      let message = error instanceof AuthError ? error.message : 'An unexpected error occurred';
      
      // Provide more helpful messages for common errors
      if (error instanceof AuthError && error.code === 'auth/invalid-credential') {
        message = 'Email or password is incorrect. Please check your credentials or create a new account.';
      }
      
      Alert.alert('Sign In Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      Alert.alert('Reset Password', 'Please enter your email address first');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Reset Password', 'Please enter a valid email address');
      return;
    }

    try {
      await authService.resetPassword(formData.email.trim());
      Alert.alert(
        'Reset Password',
        'Password reset email sent. Please check your inbox and follow the instructions.'
      );
    } catch (error) {
      const message = error instanceof AuthError ? error.message : 'An unexpected error occurred';
      Alert.alert('Reset Password Failed', message);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp' as never);
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logos/garageledger_logo_transparent.png')} 
            style={styles.logo}
            resizeMode="contain"
            testID="garage-ledger-logo"
          />
          <Typography variant="title" style={styles.title}>
            Welcome Back
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Sign in to access your vehicle data
          </Typography>
        </View>

        <Card style={styles.form}>
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
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
            error={errors.password}
            testID="password-input"
          />

          <Button
            title="Sign In"
            onPress={handleSignIn}
            disabled={isLoading}
            style={styles.signInButton}
            testID="sign-in-button"
          />

          <Button
            title="Forgot Password?"
            onPress={handleForgotPassword}
            variant="text"
            style={styles.forgotButton}
            testID="forgot-password-button"
          />
        </Card>

        <View style={styles.footer}>
          <Typography variant="body" style={styles.footerText}>
            Don't have an account?
          </Typography>
          <Button
            title="Sign Up"
            onPress={navigateToSignUp}
            variant="text"
            style={styles.signUpButton}
            testID="navigate-sign-up-button"
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
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
  signInButton: {
    marginTop: theme.spacing.md,
  },
  forgotButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'center',
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
  signUpButton: {
    marginLeft: theme.spacing.xs,
  },
});