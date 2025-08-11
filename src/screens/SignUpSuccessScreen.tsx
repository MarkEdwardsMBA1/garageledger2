import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// TEMP: removed i18n import
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { CarIcon } from '../components/icons';
import { theme } from '../utils/theme';
import { vehicleRepository } from '../repositories/VehicleRepository';

interface SignUpSuccessProps {
  navigation: any;
}

export const SignUpSuccessScreen: React.FC<SignUpSuccessProps> = ({ navigation }) => {
  const t = (key: string, fallback?: string) => fallback || key.split('.').pop() || key;
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingVehicles, setHasExistingVehicles] = useState(false);
  const hasAutoNavigatedRef = useRef(false);

  // Check if user already has vehicles (only on first load)
  useFocusEffect(
    React.useCallback(() => {
      const checkExistingVehicles = async () => {
        try {
          const vehicles = await vehicleRepository.getAll();
          const hasVehicles = vehicles.length > 0;
          setHasExistingVehicles(hasVehicles);
          
          // If user has vehicles and we haven't auto-navigated yet, do it once
          if (hasVehicles && !hasAutoNavigatedRef.current) {
            hasAutoNavigatedRef.current = true;
            setTimeout(() => {
              navigation.navigate('MainApp');
            }, 1500); // Show welcome message briefly before navigating
          }
        } catch (error) {
          console.error('Failed to check existing vehicles:', error);
          // On error, assume no vehicles to be safe
          setHasExistingVehicles(false);
        } finally {
          setIsLoading(false);
        }
      };

      // Reset loading state and check vehicles
      setIsLoading(true);
      checkExistingVehicles();
    }, [])
  );

  const handleAddFirstVehicle = () => {
    navigation.navigate('FirstVehicleWizard');
  };

  const handleSkip = () => {
    // Navigate to main app with empty state
    navigation.navigate('MainApp');
  };

  // Show loading state while checking vehicles
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center' }]}>
          <Loading size="large" />
          <Typography variant="body" style={{ textAlign: 'center', marginTop: 16 }}>
            {t('signupSuccess.loading', 'Setting up your account...')}
          </Typography>
        </View>
      </View>
    );
  }

  // Show different content for returning users (only if we're auto-navigating)
  if (hasExistingVehicles && !hasAutoNavigatedRef.current) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        
        <View style={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + theme.spacing.lg, theme.spacing.xl) }
        ]}>
          {/* Welcome Icon */}
          <View style={styles.iconContainer}>
            <CarIcon size={80} color={theme.colors.primary} />
          </View>

          {/* Welcome Back Message */}
          <View style={styles.messageContainer}>
            <Typography variant="title" style={styles.title}>
              {t('signupSuccess.welcomeBack', 'Welcome back to the Garage!')}
            </Typography>
            
            <Typography variant="body" style={styles.message}>
              {t('signupSuccess.returningUser', 'Taking you to your vehicles...')}
            </Typography>
          </View>

          <Loading size="small" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={[
        styles.content,
        { 
          paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl),
          paddingBottom: Math.max(insets.bottom + theme.spacing.lg, theme.spacing.xl) 
        }
      ]}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 5 Complete! 🎉
          </Typography>
        </View>

        {/* Celebration Icon */}
        <View style={styles.iconContainer}>
          <Typography variant="title" style={styles.celebrationIcon}>
            🎉
          </Typography>
          <CarIcon size={60} color={theme.colors.primary} />
        </View>

        {/* Welcome Message */}
        <View style={styles.messageContainer}>
          <Typography variant="title" style={styles.title}>
            {t('signupSuccess.title', 'You\'re all set!')}
          </Typography>
          
          <Typography variant="body" style={styles.message}>
            {t('signupSuccess.message', 'Your GarageLedger account is ready. Let\'s add your first vehicle and start tracking.')}
          </Typography>
        </View>

        {/* Action Card */}
        <Card style={styles.actionCard}>
          <Typography variant="heading" style={styles.cardTitle}>
            {t('signupSuccess.readyToStart', 'Ready to start tracking?')}
          </Typography>
          
          <Typography variant="body" style={styles.cardDescription}>
            {t('signupSuccess.addVehicleDescription', 'Adding your first vehicle takes just a minute and unlocks all the features of GarageLedger.')}
          </Typography>

          <Button
            title={t('signupSuccess.addFirstVehicle', 'Add my first vehicle')}
            variant="primary"
            onPress={handleAddFirstVehicle}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
            fullWidth
          />
        </Card>

        {/* Skip Option */}
        <Button
          title={t('signupSuccess.skip', 'Maybe later')}
          variant="text"
          onPress={handleSkip}
          style={styles.skipButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
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
    backgroundColor: theme.colors.success,
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  celebrationIcon: {
    fontSize: 40,
    position: 'absolute',
    top: -20,
    right: -10,
    zIndex: 1,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  message: {
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing.md,
  },
  actionCard: {
    width: '100%',
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  cardDescription: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  primaryButton: {
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  skipButton: {
    alignSelf: 'center',
  },
});

export default SignUpSuccessScreen;