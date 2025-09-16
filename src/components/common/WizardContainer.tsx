// Wizard Container Component
// Reusable container for multi-step wizard flows

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { showCancelConfirmation } from './CancelConfirmationModal';
import { theme } from '../../utils/theme';
import { useWizardState } from '../../hooks/useWizardState';
import { WizardContainerProps, WizardStepProps } from '../../types/wizard';

export const WizardContainer: React.FC<WizardContainerProps> = ({
  config,
  onComplete,
  onCancel,
  isLoading = false,
  customHeader,
}) => {
  const wizard = useWizardState(config);

  // Handle wizard completion
  const handleComplete = () => {
    const canComplete = wizard.complete();
    if (canComplete) {
      onComplete(wizard.state.data);
    }
  };

  // Handle cancel with simple confirmation
  const handleCancel = () => {
    showCancelConfirmation({
      onCancel
    });
  };

  // Prepare props for current step component
  const stepProps: WizardStepProps = {
    data: wizard.state.data[wizard.currentStep.id] || {},
    onDataChange: wizard.updateStepData,
    errors: wizard.hasAttemptedValidation 
      ? wizard.state.errors[wizard.currentStep.id] || [] 
      : [], // Only show stored errors after validation attempt
    onNext: wizard.goNext,
    onBack: wizard.goBack,
    canGoNext: wizard.canGoNext,
    canGoBack: wizard.canGoBack,
    canSkip: wizard.canSkip,
    onSkip: wizard.skipStep,
    allWizardData: wizard.state.data,
  };

  // Check if this is the last step
  const isLastStep = wizard.stepIndex === wizard.visibleSteps.length - 1;
  
  // Check if we should show the complete button
  // On the last step, show complete button if validation passes
  const showCompleteButton = isLastStep && wizard.canGoNext;

  // Determine Next button variant based on validation state
  const getNextButtonVariant = () => {
    // If can proceed: blue (primary variant)
    // If cannot proceed: gray (outline variant) initially, then blue (primary) after validation attempt
    if (wizard.canGoNext) {
      return 'primary'; // Blue enabled
    } else if (wizard.hasAttemptedValidation) {
      return 'primary'; // Blue disabled (after attempt)
    } else {
      return 'outline'; // Gray disabled (initial state)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Custom header or default header - hide if no title/subtitle */}
        {customHeader || (config.title || config.subtitle) && (
          <View style={styles.header}>
            {config.title && (
              <Typography variant="title" style={styles.title}>
                {config.title}
              </Typography>
            )}
            {config.subtitle && (
              <Typography variant="body" style={styles.subtitle}>
                {config.subtitle}
              </Typography>
            )}
          </View>
        )}

        {/* Progress Bar */}
        <ProgressBar
          currentStep={wizard.stepIndex + 1}
          totalSteps={wizard.visibleSteps.length}
        />

        {/* Step Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepContent}>
            {/* Current Step Title */}
            <View style={styles.stepHeader}>
              <Typography variant="heading" style={styles.stepTitle}>
                {wizard.currentStep.title}
              </Typography>
              {wizard.currentStep.subtitle && (
                <Typography variant="body" style={styles.stepSubtitle}>
                  {wizard.currentStep.subtitle}
                </Typography>
              )}
            </View>

            {/* Error Display */}
            {stepProps.errors.length > 0 && (
              <View style={styles.errorContainer}>
                {stepProps.errors.map((error, index) => (
                  <Typography key={index} variant="body" style={styles.errorText}>
                    {error}
                  </Typography>
                ))}
              </View>
            )}

            {/* Current Step Component */}
            <wizard.currentStep.component {...stepProps} />
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            {/* Cancel Button */}
            {config.allowCancel !== false && (
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isLoading}
              />
            )}

            {/* Back Button */}
            {wizard.canGoBack && (
              <Button
                title="Back"
                variant="outline"
                onPress={wizard.goBack}
                style={styles.backButton}
                disabled={isLoading}
              />
            )}


            {/* Next/Complete Button */}
            {showCompleteButton ? (
              <Button
                title="Save"
                variant="primary"
                onPress={handleComplete}
                style={styles.primaryButton}
                disabled={isLoading}
                loading={isLoading}
              />
            ) : (
              <Button
                title="Next"
                variant={getNextButtonVariant()}
                onPress={wizard.goNext}
                style={styles.primaryButton}
                disabled={!wizard.canGoNext || isLoading}
                loading={isLoading}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.primary,
  },
  title: {
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.surface,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  stepHeader: {
    marginBottom: theme.spacing.lg,
  },
  stepTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stepSubtitle: {
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '10', // 10% opacity
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  errorText: {
    color: theme.colors.error,
  },
  navigationContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  backButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
});

export default WizardContainer;