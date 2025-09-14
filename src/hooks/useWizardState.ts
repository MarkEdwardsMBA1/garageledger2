// Wizard state management hook
// Handles step navigation, data management, and validation

import React, { useState, useCallback, useMemo } from 'react';
import { 
  WizardConfig, 
  WizardState, 
  WizardStep, 
  UseWizardStateReturn 
} from '../types/wizard';

/**
 * Custom hook for managing wizard state and navigation
 */
export const useWizardState = (config: WizardConfig): UseWizardStateReturn => {
  // Initialize wizard state
  const [state, setState] = useState<WizardState>(() => ({
    currentStepId: config.steps[0]?.id || '',
    data: config.initialData || {},
    completedStepIds: new Set(),
    errors: {},
    validationAttempted: new Set(),
    isLoading: false,
  }));

  // Don't run initial validation - only validate when user tries to proceed
  // This provides better UX by not showing errors immediately on load

  // Filter steps based on shouldShow conditions
  const visibleSteps = useMemo(() => {
    return config.steps.filter(step => 
      !step.shouldShow || step.shouldShow(state.data)
    );
  }, [config.steps, state.data]);

  // Get current step configuration
  const currentStep = useMemo(() => {
    return visibleSteps.find(step => step.id === state.currentStepId) || visibleSteps[0];
  }, [visibleSteps, state.currentStepId]);

  // Get current step index
  const stepIndex = useMemo(() => {
    return visibleSteps.findIndex(step => step.id === state.currentStepId);
  }, [visibleSteps, state.currentStepId]);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    if (!currentStep?.validation) return [];
    
    const stepData = state.data[currentStep.id] || {};
    const errors = currentStep.validation(stepData, state.data) || [];
    
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [currentStep.id]: errors,
      }
    }));
    
    return errors;
  }, [currentStep, state.data]);

  // Check if can navigate to next step OR complete wizard (for last step)
  const canGoNext = useMemo(() => {
    // Run real-time validation to check current step validity
    if (currentStep?.validation) {
      const stepData = state.data[state.currentStepId] || {};
      const errors = currentStep.validation(stepData, state.data) || [];
      
      // Enable button if no validation errors (works for both next and complete)
      return errors.length === 0;
    }
    
    // If no validation function, allow progression/completion
    return true;
  }, [stepIndex, visibleSteps.length, currentStep, state.data, state.currentStepId]);

  // Check if can navigate to previous step
  const canGoBack = useMemo(() => {
    return stepIndex > 0;
  }, [stepIndex]);

  // Check if current step can be skipped
  const canSkip = useMemo(() => {
    return currentStep?.canSkip === true;
  }, [currentStep]);

  // Check if validation has been attempted (for error display timing)
  const hasAttemptedValidation = useMemo(() => {
    return state.validationAttempted.has(state.currentStepId);
  }, [state.validationAttempted, state.currentStepId]);

  // Get current step validation errors
  const currentStepErrors = useMemo(() => {
    if (!currentStep?.validation) return [];
    
    const stepData = state.data[state.currentStepId] || {};
    return currentStep.validation(stepData, state.data) || [];
  }, [currentStep, state.data, state.currentStepId]);

  // Navigate to next step
  const goNext = useCallback(() => {
    // Always validate and mark as attempted
    const errors = currentStep?.validation 
      ? currentStep.validation(state.data[state.currentStepId] || {}, state.data) || []
      : [];

    // Mark validation as attempted and store errors
    setState(prev => ({
      ...prev,
      validationAttempted: new Set([...prev.validationAttempted, state.currentStepId]),
      errors: {
        ...prev.errors,
        [state.currentStepId]: errors,
      },
    }));

    // If validation failed, stop here (errors will now be displayed)
    if (errors.length > 0) {
      return;
    }

    // Proceed to next step
    const nextIndex = stepIndex + 1;
    if (nextIndex < visibleSteps.length) {
      const nextStep = visibleSteps[nextIndex];
      
      setState(prev => ({
        ...prev,
        currentStepId: nextStep.id,
        completedStepIds: new Set([...prev.completedStepIds, state.currentStepId]),
      }));
    }
  }, [stepIndex, visibleSteps, currentStep, state.data, state.currentStepId]);

  // Navigate to previous step
  const goBack = useCallback(() => {
    if (!canGoBack) return;

    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      const prevStep = visibleSteps[prevIndex];
      
      setState(prev => ({
        ...prev,
        currentStepId: prevStep.id,
        // Remove current step from completed if going back
        completedStepIds: new Set([...prev.completedStepIds].filter(id => id !== state.currentStepId)),
      }));
    }
  }, [canGoBack, stepIndex, visibleSteps, state.currentStepId]);

  // Skip current step
  const skipStep = useCallback(() => {
    if (!canSkip) return;
    
    // Same as goNext but without validation
    const nextIndex = stepIndex + 1;
    if (nextIndex < visibleSteps.length) {
      const nextStep = visibleSteps[nextIndex];
      
      setState(prev => ({
        ...prev,
        currentStepId: nextStep.id,
        completedStepIds: new Set([...prev.completedStepIds, state.currentStepId]),
      }));
    }
  }, [canSkip, stepIndex, visibleSteps, state.currentStepId]);

  // Navigate to specific step (if allowed)
  const goToStep = useCallback((stepId: string) => {
    const targetStep = visibleSteps.find(step => step.id === stepId);
    if (!targetStep) return;

    const targetIndex = visibleSteps.findIndex(step => step.id === stepId);
    const currentIndex = stepIndex;

    // Only allow navigation to completed steps or the next immediate step
    const isCompleted = state.completedStepIds.has(stepId);
    const isNextStep = targetIndex === currentIndex + 1 && canGoNext;
    const isPreviousStep = targetIndex < currentIndex;

    if (isCompleted || isNextStep || isPreviousStep) {
      setState(prev => ({
        ...prev,
        currentStepId: stepId,
      }));
    }
  }, [visibleSteps, stepIndex, state.completedStepIds, canGoNext]);

  // Update current step data
  const updateStepData = useCallback((stepData: any) => {
    setState(prev => {
      const newData = {
        ...prev.data,
        [state.currentStepId]: {
          ...prev.data[state.currentStepId],
          ...stepData,
        },
      };

      // Don't clear errors automatically - they should persist until validation passes
      // This prevents users from bypassing validation by just touching form fields
      return {
        ...prev,
        data: newData,
        // Keep existing errors - they'll be cleared only when validation passes
      };
    });
  }, [state.currentStepId]);

  // Update entire wizard data
  const updateAllData = useCallback((data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...data,
      },
    }));
  }, []);

  // Reset wizard to initial state
  const reset = useCallback(() => {
    setState({
      currentStepId: visibleSteps[0]?.id || '',
      data: config.initialData || {},
      completedStepIds: new Set(),
      errors: {},
      validationAttempted: new Set(),
      isLoading: false,
    });
  }, [config.initialData, visibleSteps]);

  // Complete wizard
  const complete = useCallback(() => {
    // Validate all steps before completion
    let hasErrors = false;
    const allErrors: Record<string, string[]> = {};

    visibleSteps.forEach(step => {
      if (step.validation) {
        const stepData = state.data[step.id] || {};
        const errors = step.validation(stepData, state.data) || [];
        if (errors.length > 0) {
          allErrors[step.id] = errors;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setState(prev => ({
        ...prev,
        errors: allErrors,
      }));
      return false;
    }

    // Mark all steps as completed
    setState(prev => ({
      ...prev,
      completedStepIds: new Set(visibleSteps.map(step => step.id)),
    }));

    return true;
  }, [visibleSteps, state.data]);

  return {
    state,
    currentStep,
    stepIndex,
    visibleSteps,
    canGoNext,
    canGoBack,
    canSkip,
    hasAttemptedValidation,
    currentStepErrors,
    goNext,
    goBack,
    skipStep,
    goToStep,
    updateStepData,
    updateAllData,
    reset,
    complete,
  };
};