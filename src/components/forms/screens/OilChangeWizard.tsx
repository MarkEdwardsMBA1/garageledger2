// Oil Change Wizard - 2-step flow for Oil & Oil Filter Change
// Implements wireframe: diy_service_oil_oil_filter_change_wireframe.jpg
// Reuses WizardContainer pattern for step management
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from '../../common/Button';
import { Typography } from '../../common/Typography';
import { PartEntryForm, PartEntryData } from '../parts/PartEntryForm';
import { MotorOilForm, MotorOilData } from '../parts/MotorOilForm';
import { theme } from '../../../utils/theme';

export interface OilChangeData {
  oilFilter: PartEntryData;
  motorOil: MotorOilData;
  totalCost: number;
}

export interface OilChangeWizardProps {
  /** Initial data */
  initialData?: Partial<OilChangeData>;
  
  /** Called when user saves */
  onSave: (data: OilChangeData) => void;
  
  /** Called when user cancels */
  onCancel: () => void;
  
  /** Loading state */
  loading?: boolean;
}

type WizardStep = 'oil-filter' | 'motor-oil';

export const OilChangeWizard: React.FC<OilChangeWizardProps> = ({
  initialData,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('oil-filter');
  
  const [oilFilterData, setOilFilterData] = useState<PartEntryData>({
    brand: initialData?.oilFilter?.brand || '',
    partNumber: initialData?.oilFilter?.partNumber || '',
    cost: initialData?.oilFilter?.cost || '',
  });
  
  const [motorOilData, setMotorOilData] = useState<MotorOilData>({
    brand: initialData?.motorOil?.brand || '',
    partNumber: initialData?.motorOil?.partNumber || '',
    viscosityCold: initialData?.motorOil?.viscosityCold || '',
    viscosityHot: initialData?.motorOil?.viscosityHot || '',
    quantity: initialData?.motorOil?.quantity || '1',
    unitCapacity: initialData?.motorOil?.unitCapacity || '',
    unitCapacityType: initialData?.motorOil?.unitCapacityType || 'Quart',
    unitCost: initialData?.motorOil?.unitCost || '',
    totalCost: initialData?.motorOil?.totalCost || '0.00',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'oil-filter') {
      // Oil filter cost is required
      if (!oilFilterData.cost || oilFilterData.cost.trim() === '') {
        newErrors.cost = 'Cost is required';
      } else if (isNaN(parseFloat(oilFilterData.cost.replace('$', '')))) {
        newErrors.cost = 'Please enter a valid cost';
      }
    } else if (currentStep === 'motor-oil') {
      // Motor oil quantity and unit cost are required
      if (!motorOilData.quantity || motorOilData.quantity.trim() === '') {
        newErrors.quantity = 'Quantity is required';
      } else if (isNaN(parseFloat(motorOilData.quantity))) {
        newErrors.quantity = 'Please enter a valid quantity';
      }

      if (!motorOilData.unitCost || motorOilData.unitCost.trim() === '') {
        newErrors.unitCost = 'Unit cost is required';
      } else if (isNaN(parseFloat(motorOilData.unitCost.replace('$', '')))) {
        newErrors.unitCost = 'Please enter a valid unit cost';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep('motor-oil');
    }
  };

  const handleSave = () => {
    if (validateCurrentStep()) {
      const oilFilterCost = parseFloat(oilFilterData.cost.replace('$', '')) || 0;
      const motorOilCost = parseFloat(motorOilData.totalCost) || 0;
      const totalCost = oilFilterCost + motorOilCost;

      onSave({
        oilFilter: oilFilterData,
        motorOil: motorOilData,
        totalCost,
      });
    }
  };

  const canProceed = () => {
    if (currentStep === 'oil-filter') {
      return oilFilterData.cost.trim() !== '';
    } else {
      return motorOilData.quantity.trim() !== '' && motorOilData.unitCost.trim() !== '';
    }
  };

  const stepLabels = ['Oil Filter', 'Motor Oil'];
  const currentStepIndex = currentStep === 'oil-filter' ? 1 : 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Engine Blue Header */}
      <View style={styles.header}>
        <Typography variant="title" style={styles.headerTitle}>
          Oil & Oil Filter Change
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
        {currentStep === 'oil-filter' ? (
          <PartEntryForm
            data={oilFilterData}
            onChange={setOilFilterData}
            title="Oil Filter"
            errors={errors}
            costRequired={true}
          />
        ) : (
          <MotorOilForm
            data={motorOilData}
            onChange={setMotorOilData}
            errors={errors}
          />
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
        
        {currentStep === 'oil-filter' ? (
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