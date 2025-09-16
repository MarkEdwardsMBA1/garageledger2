// Step Indicator Component
// Visual progress indicator for multi-step wizards

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../utils/theme';
import { StepIndicatorProps } from '../../types/wizard';

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStepId,
  completedStepIds,
  navigableStepIds = [],
  onStepClick,
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);

  const getStepStatus = (stepId: string, index: number): 'upcoming' | 'current' | 'completed' => {
    if (completedStepIds.includes(stepId)) return 'completed';
    if (stepId === currentStepId) return 'current';
    if (index < currentIndex) return 'completed';
    return 'upcoming';
  };

  const isNavigable = (stepId: string) => {
    return navigableStepIds.includes(stepId) && onStepClick;
  };

  const handleStepPress = (stepId: string) => {
    if (isNavigable(stepId)) {
      onStepClick?.(stepId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const navigable = isNavigable(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepContainer}>
                <TouchableOpacity
                  style={[
                    styles.stepCircle,
                    status === 'upcoming' && styles.stepCircleUpcoming,
                    status === 'current' && styles.stepCircleCurrent,
                    status === 'completed' && styles.stepCircleCompleted,
                    navigable && styles.stepCircleNavigable,
                  ]}
                  onPress={() => handleStepPress(step.id)}
                  disabled={!navigable}
                  activeOpacity={navigable ? 0.7 : 1}
                >
                  {status === 'completed' ? (
                    <View style={styles.checkmarkContainer}>
                      <Typography variant="caption" style={styles.checkmark}>
                        ✓
                      </Typography>
                    </View>
                  ) : (
                    <Typography 
                      variant="caption" 
                      style={[
                        styles.stepNumber,
                        status === 'upcoming' && styles.stepNumberUpcoming,
                        status === 'current' && styles.stepNumberCurrent,
                        status === 'completed' && styles.stepNumberCompleted,
                      ]}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </TouchableOpacity>
                
                <View style={styles.stepLabelContainer}>
                  <Typography
                    variant="caption"
                    style={[
                      styles.stepLabel,
                      status === 'upcoming' && styles.stepLabelUpcoming,
                      status === 'current' && styles.stepLabelCurrent,
                      status === 'completed' && styles.stepLabelCompleted,
                    ]}
                    numberOfLines={2}
                  >
                    {step.title}
                  </Typography>
                  {step.subtitle && (
                    <Typography
                      variant="caption"
                      style={[
                        styles.stepSubtitle,
                        status === 'upcoming' && styles.stepSubtitleUpcoming,
                        status === 'current' && styles.stepSubtitleCurrent,
                        status === 'completed' && styles.stepSubtitleCompleted,
                      ]}
                      numberOfLines={1}
                    >
                      {step.subtitle}
                    </Typography>
                  )}
                </View>
              </View>
              
              {/* Connection line between steps */}
              {index < steps.length - 1 && (
                <View 
                  style={[
                    styles.connectionLine,
                    (status === 'completed' || getStepStatus(steps[index + 1].id, index + 1) === 'completed')
                      ? styles.connectionLineCompleted
                      : styles.connectionLineUpcoming
                  ]} 
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 80, // Prevent steps from getting too wide
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    borderWidth: 2,
  },
  stepCircleUpcoming: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  stepCircleCurrent: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  stepCircleNavigable: {
    // Add subtle shadow for navigable steps
    ...theme.shadows.sm,
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: theme.colors.background,
  },
  stepNumber: {
    color: theme.colors.text,
  },
  stepNumberUpcoming: {
    color: theme.colors.textSecondary,
  },
  stepNumberCurrent: {
    color: theme.colors.background,
  },
  stepNumberCompleted: {
    color: theme.colors.background,
  },
  stepLabelContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  stepLabel: {
    textAlign: 'center',
  },
  stepLabelUpcoming: {
    color: theme.colors.textSecondary,
  },
  stepLabelCurrent: {
    color: theme.colors.primary,
  },
  stepLabelCompleted: {
    color: theme.colors.success,
  },
  stepSubtitle: {
    textAlign: 'center',
    marginTop: 2,
  },
  stepSubtitleUpcoming: {
    color: theme.colors.textTertiary,
  },
  stepSubtitleCurrent: {
    color: theme.colors.primary,
    opacity: 0.8,
  },
  stepSubtitleCompleted: {
    color: theme.colors.success,
    opacity: 0.8,
  },
  connectionLine: {
    position: 'absolute',
    top: 16, // Center vertically with step circles
    height: 2,
    left: '50%',
    right: '50%',
    zIndex: -1,
  },
  connectionLineUpcoming: {
    backgroundColor: theme.colors.border,
  },
  connectionLineCompleted: {
    backgroundColor: theme.colors.success,
  },
});

export default StepIndicator;