// Step Progress Indicator - For 2-step flows (Oil & Oil Filter, Parts + Fluids)
// Follows existing StepIndicator and Typography patterns
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../common/Typography';
import { theme } from '../../../utils/theme';

export interface StepProgressIndicatorProps {
  /** Current step (1-based) */
  currentStep: number;
  
  /** Total number of steps */
  totalSteps: number;
  
  /** Step labels */
  stepLabels: string[];
  
  /** Optional overall title */
  title?: string;
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  title,
}) => {
  return (
    <View style={styles.container}>
      {title && (
        <Typography variant="title" style={styles.title}>
          {title}
        </Typography>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.indicatorContainer}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <View key={stepNumber} style={styles.stepContainer}>
                <View style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isActive && styles.stepCircleActive,
                ]}>
                  <Typography 
                    variant="caption" 
                    style={[
                      styles.stepNumber,
                      (isCompleted || isActive) && styles.stepNumberActive,
                    ]}
                  >
                    {stepNumber}
                  </Typography>
                </View>
                
                {stepLabels[index] && (
                  <Typography 
                    variant="caption" 
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                    ]}
                  >
                    {stepLabels[index]}
                  </Typography>
                )}
                
                {stepNumber < totalSteps && (
                  <View style={[
                    styles.stepConnector,
                    isCompleted && styles.stepConnectorCompleted,
                  ]} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  stepContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  stepNumber: {
    color: theme.colors.textSecondary,
  },
  stepNumberActive: {
    color: theme.colors.surface,
  },
  stepLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    minWidth: 60,
  },
  stepLabelActive: {
    color: theme.colors.primary,
  },
  stepConnector: {
    position: 'absolute',
    top: 16,
    left: 32,
    width: 40,
    height: 2,
    backgroundColor: theme.colors.border,
    zIndex: -1,
  },
  stepConnectorCompleted: {
    backgroundColor: theme.colors.success,
  },
});