// Progress Bar component for multi-step flows
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../utils/theme';

export interface ProgressBarProps {
  /** Current step (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Optional custom text override */
  stepText?: string;
  /** Container style override */
  style?: any;
}

/**
 * Reusable Progress Bar component for multi-step flows
 * Consistent with onboarding screen design patterns
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepText,
  style,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  const defaultStepText = `Step ${currentStep} of ${totalSteps}`;

  return (
    <View style={[styles.progressContainer, style]}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
      </View>
      <Typography variant="caption" style={styles.progressText}>
        {stepText || defaultStepText}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: theme.colors.borderLight || theme.colors.border,
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
});

export default ProgressBar;