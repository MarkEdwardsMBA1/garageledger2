import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../utils/theme';

interface OnboardingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgressIndicator: React.FC<OnboardingProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      {/* Welcome header */}
      <View style={styles.headerContainer}>
        <Typography variant="body" style={styles.welcomeText}>
          Welcome to
        </Typography>
        <Typography variant="title" style={styles.appName}>
          GarageLedger
        </Typography>
      </View>

      {/* Circle progress indicators */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <View key={step} style={styles.circleContainer}>
              <View style={[
                styles.circle,
                isActive && styles.circleActive,
                isCompleted && styles.circleCompleted,
              ]}>
                {isCompleted && (
                  <View style={styles.circleInner} />
                )}
              </View>
              {step < totalSteps && <View style={styles.connector} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginBottom: 1, // Further reduced spacing
    fontWeight: theme.typography.fontWeight.normal,
  },
  appName: {
    fontSize: theme.typography.fontSize['2xl'], // Increased from xl to 2xl
    color: theme.colors.primary, // Engine blue
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDark,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  circleCompleted: {
    borderColor: theme.colors.borderDark,
    backgroundColor: 'transparent',
  },
  circleInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface, // White dot inside
  },
  connector: {
    width: theme.spacing.md,
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.xs,
  },
});

export default OnboardingProgressIndicator;