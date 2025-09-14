// Wizard component type definitions
// Consolidates step-based flows into reusable patterns

import React from 'react';

/**
 * Props passed to each wizard step component
 */
export interface WizardStepProps<T = any> {
  /** Current step data */
  data: T;
  /** Update step data */
  onDataChange: (stepData: Partial<T>) => void;
  /** Validation errors for this step */
  errors: string[];
  /** Navigate to next step */
  onNext: () => void;
  /** Navigate to previous step */
  onBack: () => void;
  /** Whether next button should be enabled */
  canGoNext: boolean;
  /** Whether back button should be enabled */
  canGoBack: boolean;
  /** Whether this step can be skipped */
  canSkip?: boolean;
  /** Skip this step */
  onSkip?: () => void;
  /** All wizard data from all steps */
  allWizardData?: Record<string, any>;
}

/**
 * Validation function for wizard steps
 */
export type WizardStepValidator<T = any> = (
  stepData: T,
  allWizardData: Record<string, any>
) => string[] | null;

/**
 * Individual wizard step definition
 */
export interface WizardStep<T = any> {
  /** Unique step identifier */
  id: string;
  /** Display title for step */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** React component for this step */
  component: React.ComponentType<WizardStepProps<T>>;
  /** Validation function for this step */
  validation?: WizardStepValidator<T>;
  /** Whether this step can be skipped */
  canSkip?: boolean;
  /** Whether this step should be shown based on previous data */
  shouldShow?: (allWizardData: Record<string, any>) => boolean;
}

/**
 * Overall wizard configuration
 */
export interface WizardConfig {
  /** All steps in the wizard */
  steps: WizardStep[];
  /** Initial data for wizard */
  initialData?: Record<string, any>;
  /** Optional wizard title */
  title?: string;
  /** Optional wizard subtitle */
  subtitle?: string;
  /** Whether wizard can be cancelled */
  allowCancel?: boolean;
  /** Whether to persist data across app sessions */
  persistData?: boolean;
  /** Unique key for data persistence */
  persistKey?: string;
}

/**
 * Wizard container component props
 */
export interface WizardContainerProps {
  /** Wizard configuration */
  config: WizardConfig;
  /** Called when wizard is completed */
  onComplete: (data: Record<string, any>) => void;
  /** Called when wizard is cancelled */
  onCancel: () => void;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional custom header */
  customHeader?: React.ReactNode;
}

/**
 * Step indicator component props
 */
export interface StepIndicatorProps {
  /** All steps with titles */
  steps: Array<{
    id: string;
    title: string;
    subtitle?: string;
  }>;
  /** Currently active step ID */
  currentStepId: string;
  /** Completed step IDs */
  completedStepIds: string[];
  /** Steps that can be navigated to directly */
  navigableStepIds?: string[];
  /** Called when step is clicked (if navigable) */
  onStepClick?: (stepId: string) => void;
}

/**
 * Wizard state for hook
 */
export interface WizardState {
  /** Current step ID */
  currentStepId: string;
  /** All wizard data by step ID */
  data: Record<string, any>;
  /** Completed step IDs */
  completedStepIds: Set<string>;
  /** Current step errors */
  errors: Record<string, string[]>;
  /** Steps that have attempted validation */
  validationAttempted: Set<string>;
  /** Whether wizard is in loading state */
  isLoading: boolean;
}

/**
 * Hook return type for useWizardState
 */
export interface UseWizardStateReturn {
  /** Current wizard state */
  state: WizardState;
  /** Current step configuration */
  currentStep: WizardStep;
  /** Current step index (0-based) */
  stepIndex: number;
  /** All visible steps (after filtering) */
  visibleSteps: WizardStep[];
  /** Whether can navigate to next step */
  canGoNext: boolean;
  /** Whether can navigate to previous step */
  canGoBack: boolean;
  /** Whether current step can be skipped */
  canSkip: boolean;
  /** Whether validation has been attempted on current step */
  hasAttemptedValidation: boolean;
  /** Current step validation errors (real-time) */
  currentStepErrors: string[];
  /** Navigate to next step */
  goNext: () => void;
  /** Navigate to previous step */
  goBack: () => void;
  /** Skip current step */
  skipStep: () => void;
  /** Navigate to specific step (if allowed) */
  goToStep: (stepId: string) => void;
  /** Update current step data */
  updateStepData: (stepData: any) => void;
  /** Update entire wizard data */
  updateAllData: (data: Record<string, any>) => void;
  /** Reset wizard to initial state */
  reset: () => void;
  /** Complete wizard - returns true if successful, false if validation failed */
  complete: () => boolean;
}

/**
 * Predefined wizard types for common flows
 */
export type WizardType = 'shop-service' | 'diy-service' | 'onboarding' | 'vehicle-setup';

/**
 * Wizard completion result
 */
export interface WizardResult<T = Record<string, any>> {
  /** Whether wizard was completed or cancelled */
  completed: boolean;
  /** Final wizard data */
  data: T;
  /** Timestamp of completion */
  completedAt: Date;
}

// Import types needed for wizard data structures
import { SelectedService, AdvancedServiceConfiguration } from './index';

// Shop Service Wizard Types
export interface ShopBasicInfoData {
  date: Date;
  mileage: string;
  totalCost: string;
}

export interface ShopServicesData {
  selectedServices: SelectedService[];
}

export interface ShopPhotosData {
  photos: string[];
}

export interface ShopNotesData {
  notes: string;
}

export interface ShopServiceWizardData {
  basicInfo: ShopBasicInfoData;
  services: ShopServicesData;
  photos: ShopPhotosData;
  notes: ShopNotesData;
}

// DIY Service Wizard Types
export interface DIYBasicInfoData {
  date: Date;
  mileage: string;
}

export interface DIYServicesData {
  selectedServices: SelectedService[];
  serviceConfigs: { [key: string]: AdvancedServiceConfiguration };
  notes: string;
  // Enhanced with parts and fluids data
  servicesWithPartsAndFluids: { [serviceId: string]: import('../domain/PartsAndFluids').ServiceEntryData };
  totalPartsCart: number;
  totalFluidsCart: number;
  grandTotal: number;
}

export interface DIYPhotosData {
  photos: string[];
}

export interface DIYReviewData {
  // Review step just displays data, no additional fields
  totalCost: number;
}

export interface DIYServiceWizardData {
  basicInfo: DIYBasicInfoData;
  services: DIYServicesData;
  photos: DIYPhotosData;
  review: DIYReviewData;
}