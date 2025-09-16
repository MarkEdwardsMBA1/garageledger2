// Parts + Fluids Wizard - 2-step flow for complex services (Transmission, etc.)
// Implements wireframe: diy_service_parts_fluids_wireframe.jpg
// Combines GeneralPartsScreen and FluidsScreen patterns
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from '../../common/Button';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { PartEntryForm, PartEntryData } from '../parts/PartEntryForm';
import { FluidEntryForm, FluidEntryData } from '../parts/FluidEntryForm';
import { theme } from '../../../utils/theme';
import { CalculationService } from '../../../domain/CalculationService';

export interface PartsAndFluidsData {
  parts: PartEntryData[];
  fluids: FluidEntryData[];
  totalPartsCost: number;
  totalFluidsCost: number;
  totalCost: number;
}

export interface PartsAndFluidsWizardProps {
  /** Service name for header */
  serviceName: string;
  
  /** Initial data */
  initialData?: Partial<PartsAndFluidsData>;
  
  /** Called when user saves */
  onSave: (data: PartsAndFluidsData) => void;
  
  /** Called when user cancels */
  onCancel: () => void;
  
  /** Loading state */
  loading?: boolean;
}

type WizardStep = 'parts' | 'fluids';

const createEmptyPart = (): PartEntryData => ({
  brand: '',
  partNumber: '',
  cost: '', // Keep for backwards compatibility
  unitCost: '', // New field
  totalCost: '0.00', // New field
  quantity: '1',
  description: '',
});

const createEmptyFluid = (): FluidEntryData => ({
  brand: '',
  partNumber: '',
  quantity: '1',
  unitCapacity: '',
  unitCapacityType: 'Quart',
  unitCost: '',
  totalCost: '0.00',
  description: '',
});

export const PartsAndFluidsWizard: React.FC<PartsAndFluidsWizardProps> = ({
  serviceName,
  initialData,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('parts');
  
  const [parts, setParts] = useState<PartEntryData[]>(() => {
    return initialData?.parts?.length ? initialData.parts : [createEmptyPart()];
  });
  
  const [fluids, setFluids] = useState<FluidEntryData[]>(() => {
    return initialData?.fluids?.length ? initialData.fluids : [createEmptyFluid()];
  });

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Calculate costs
  // Calculate costs using CalculationService
  const breakdown = CalculationService.calculateCostBreakdown(parts, fluids);
  const totalPartsCost = breakdown.partsTotal;
  const totalFluidsCost = breakdown.fluidsTotal;
  const totalCost = breakdown.grandTotal;

  const updatePart = (index: number, updatedPart: PartEntryData) => {
    setParts(prev => prev.map((part, i) => i === index ? updatedPart : part));
  };

  const updateFluid = (index: number, updatedFluid: FluidEntryData) => {
    setFluids(prev => prev.map((fluid, i) => i === index ? updatedFluid : fluid));
  };

  const addAnotherPart = () => {
    setParts(prev => [...prev, createEmptyPart()]);
  };

  const addAnotherFluid = () => {
    setFluids(prev => [...prev, createEmptyFluid()]);
  };

  const removePart = (index: number) => {
    if (parts.length > 1) {
      setParts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeFluid = (index: number) => {
    if (fluids.length > 1) {
      setFluids(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    if (currentStep === 'parts') {
      parts.forEach((part, index) => {
        const partErrors: Record<string, string> = {};

        if (!part.quantity || part.quantity.trim() === '') {
          partErrors.quantity = 'Quantity is required';
        }
        if (!part.unitCost || part.unitCost.trim() === '') {
          partErrors.unitCost = 'Unit cost is required';
        }

        if (Object.keys(partErrors).length > 0) {
          newErrors[index.toString()] = partErrors;
          hasErrors = true;
        }
      });
    } else if (currentStep === 'fluids') {
      fluids.forEach((fluid, index) => {
        const fluidErrors: Record<string, string> = {};

        if (!fluid.quantity || fluid.quantity.trim() === '') {
          fluidErrors.quantity = 'Quantity is required';
        }
        if (!fluid.unitCost || fluid.unitCost.trim() === '') {
          fluidErrors.unitCost = 'Unit cost is required';
        }

        if (Object.keys(fluidErrors).length > 0) {
          newErrors[index.toString()] = fluidErrors;
          hasErrors = true;
        }
      });
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep('fluids');
    }
  };

  const handleSave = () => {
    if (validateCurrentStep()) {
      onSave({
        parts,
        fluids,
        totalPartsCost,
        totalFluidsCost,
        totalCost,
      });
    }
  };

  const canProceed = () => {
    if (currentStep === 'parts') {
      return parts.every(part =>
        part.quantity.trim() !== '' && part.unitCost && part.unitCost.trim() !== ''
      );
    } else {
      return fluids.every(fluid =>
        fluid.quantity.trim() !== '' && fluid.unitCost.trim() !== ''
      );
    }
  };

  const stepLabels = ['Parts', 'Fluids'];
  const currentStepIndex = currentStep === 'parts' ? 1 : 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Engine Blue Header */}
      <View style={styles.header}>
        <Typography variant="title" style={styles.headerTitle}>
          {serviceName}
        </Typography>
        <Typography variant="body" style={styles.headerSubtitle}>
          Step {currentStepIndex} of 2: {stepLabels[currentStepIndex - 1]}
        </Typography>
      </View>

      {/* Form Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'parts' ? (
          <>
            {parts.map((part, index) => (
              <View key={index} style={styles.itemContainer}>
                <PartEntryForm
                  data={part}
                  onChange={(updatedPart) => updatePart(index, updatedPart)}
                  title={parts.length > 1 ? `Part ${index + 1}` : undefined}
                  showQuantity={true}
                  showDescription={true}
                  errors={errors[index.toString()] || {}}
                  costRequired={true}
                />
                
                {parts.length > 1 && (
                  <View style={styles.removeButtonContainer}>
                    <Button
                      title="Remove Part"
                      variant="text"
                      size="sm"
                      onPress={() => removePart(index)}
                    />
                  </View>
                )}
              </View>
            ))}

            <View style={styles.addButtonContainer}>
              <Button
                title="Add Another Part"
                variant="primary"
                onPress={addAnotherPart}
                disabled={loading}
                fullWidth
              />
            </View>
          </>
        ) : (
          <>
            {fluids.map((fluid, index) => (
              <View key={index} style={styles.itemContainer}>
                <FluidEntryForm
                  data={fluid}
                  onChange={(updatedFluid) => updateFluid(index, updatedFluid)}
                  title={fluids.length > 1 ? `Fluid ${index + 1}` : undefined}
                  showDescription={true}
                  errors={errors[index.toString()] || {}}
                />
                
                {fluids.length > 1 && (
                  <View style={styles.removeButtonContainer}>
                    <Button
                      title="Remove Fluid"
                      variant="text"
                      size="sm"
                      onPress={() => removeFluid(index)}
                    />
                  </View>
                )}
              </View>
            ))}

            <View style={styles.addButtonContainer}>
              <Button
                title="Add Another Fluid"
                variant="primary"
                onPress={addAnotherFluid}
                disabled={loading}
                fullWidth
              />
            </View>
          </>
        )}

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
          disabled={loading}
        />
        
        {currentStep === 'parts' ? (
          <Button
            title="Next"
            variant="primary"
            onPress={handleNext}
            style={styles.nextButton}
            disabled={!canProceed() || loading}
          />
        ) : (
          <Button
            title="Save"
            variant="primary"
            onPress={handleSave}
            style={styles.saveButton}
            loading={loading}
            disabled={!canProceed() || loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.surface,
    textAlign: 'center',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  itemContainer: {
    marginBottom: theme.spacing.lg,
  },
  removeButtonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  addButtonContainer: {
    marginBottom: theme.spacing.lg,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});