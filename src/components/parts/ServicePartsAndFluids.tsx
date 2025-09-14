// Service Parts and Fluids Component
// Master orchestration component that dynamically shows relevant forms based on service requirements

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '../common/Typography';
import { ServiceRequirementsEngine } from '../../domain/ServiceRequirements';
import { 
  ServiceEntryData,
  GeneralPartsFormData,
  TailoredPartsFormData,
  BrakesPartsFormData,
  GeneralFluidsFormData,
  MotorOilFluidsFormData,
  EntryFactory,
  CostCalculator
} from '../../domain/PartsAndFluids';

// Import form components
import { GeneralPartsForm } from './GeneralPartsForm';
import { TailoredPartsForm } from './TailoredPartsForm';
import { GeneralFluidsForm } from './GeneralFluidsForm';
import { MotorOilForm } from './MotorOilForm';
import { theme } from '../../utils/theme';

export interface ServicePartsAndFluidsProps {
  /** Service category and name */
  category: string;
  serviceName: string;
  
  /** Current service data */
  data: ServiceEntryData;
  
  /** Called when service data changes */
  onChange: (updatedData: ServiceEntryData) => void;
  
  /** Compact mode for smaller displays */
  compact?: boolean;
}

export const ServicePartsAndFluids: React.FC<ServicePartsAndFluidsProps> = ({
  category,
  serviceName,
  data,
  onChange,
  compact = false,
}) => {
  
  // Get form configuration from service requirements
  const formConfig = useMemo(() => {
    return ServiceRequirementsEngine.getFormConfig(category, serviceName);
  }, [category, serviceName]);
  
  // Initialize form data if not present
  const ensureFormData = () => {
    let needsUpdate = false;
    const updatedData = { ...data };
    
    // Initialize parts data if needed
    if (formConfig.needsPartsForm && !data.partsData) {
      needsUpdate = true;
      if (formConfig.partsFormType === 'general') {
        updatedData.partsData = {
          parts: [EntryFactory.createPartEntry()],
          totalCost: 0
        } as GeneralPartsFormData;
      } else if (formConfig.partsFormType === 'tailored') {
        const part = EntryFactory.createPartEntry();
        updatedData.partsData = {
          part,
          totalCost: part.subtotal
        } as TailoredPartsFormData;
      } else if (formConfig.partsFormType === 'brakes') {
        updatedData.partsData = {
          parts: [EntryFactory.createPartEntry()],
          totalCost: 0
        } as BrakesPartsFormData;
      }
    }
    
    // Initialize fluids data if needed
    if (formConfig.needsFluidsForm && !data.fluidsData) {
      needsUpdate = true;
      if (formConfig.fluidsFormType === 'general') {
        const fluid = EntryFactory.createFluidEntry();
        updatedData.fluidsData = {
          fluid,
          totalCost: fluid.subtotal
        } as GeneralFluidsFormData;
      } else if (formConfig.fluidsFormType === 'motor-oil') {
        const motorOil = EntryFactory.createMotorOilEntry();
        updatedData.fluidsData = {
          fluid: motorOil,
          totalCost: motorOil.subtotal
        } as MotorOilFluidsFormData;
      }
    }
    
    if (needsUpdate) {
      // Recalculate totals
      const totals = CostCalculator.calculateServiceTotal(
        updatedData.partsData,
        updatedData.fluidsData
      );
      
      updatedData.partsSubtotal = totals.partsSubtotal;
      updatedData.fluidsSubtotal = totals.fluidsSubtotal;
      updatedData.serviceTotalCost = totals.serviceTotalCost;
      
      onChange(updatedData);
    }
  };
  
  // Ensure form data is initialized
  React.useEffect(() => {
    ensureFormData();
  }, [formConfig.needsPartsForm, formConfig.needsFluidsForm]);
  
  // Handle parts form changes
  const handlePartsChange = (updatedPartsData: GeneralPartsFormData | TailoredPartsFormData | BrakesPartsFormData) => {
    const updatedData = { ...data, partsData: updatedPartsData };
    
    // Recalculate totals
    const totals = CostCalculator.calculateServiceTotal(
      updatedData.partsData,
      updatedData.fluidsData
    );
    
    updatedData.partsSubtotal = totals.partsSubtotal;
    updatedData.fluidsSubtotal = totals.fluidsSubtotal;
    updatedData.serviceTotalCost = totals.serviceTotalCost;
    
    onChange(updatedData);
  };
  
  // Handle fluids form changes
  const handleFluidsChange = (updatedFluidsData: GeneralFluidsFormData | MotorOilFluidsFormData) => {
    const updatedData = { ...data, fluidsData: updatedFluidsData };
    
    // Recalculate totals
    const totals = CostCalculator.calculateServiceTotal(
      updatedData.partsData,
      updatedData.fluidsData
    );
    
    updatedData.partsSubtotal = totals.partsSubtotal;
    updatedData.fluidsSubtotal = totals.fluidsSubtotal;
    updatedData.serviceTotalCost = totals.serviceTotalCost;
    
    onChange(updatedData);
  };
  
  // Render parts form based on type
  const renderPartsForm = () => {
    if (!formConfig.needsPartsForm || !data.partsData) {
      return null;
    }
    
    switch (formConfig.partsFormType) {
      case 'general':
        return (
          <GeneralPartsForm
            data={data.partsData as GeneralPartsFormData}
            onChange={handlePartsChange}
            serviceName={serviceName}
          />
        );
      
      case 'tailored':
        return (
          <TailoredPartsForm
            data={data.partsData as TailoredPartsFormData}
            onChange={handlePartsChange}
            serviceName={serviceName}
            instructions={`Enter the specific part needed for ${serviceName}`}
          />
        );
      
      case 'brakes':
        // For now, use GeneralPartsForm for brakes (can be specialized later)
        return (
          <GeneralPartsForm
            data={data.partsData as GeneralPartsFormData}
            onChange={handlePartsChange}
            serviceName={serviceName}
          />
        );
      
      default:
        return null;
    }
  };
  
  // Render fluids form based on type
  const renderFluidsForm = () => {
    if (!formConfig.needsFluidsForm || !data.fluidsData) {
      return null;
    }
    
    switch (formConfig.fluidsFormType) {
      case 'general':
        return (
          <GeneralFluidsForm
            data={data.fluidsData as GeneralFluidsFormData}
            onChange={handleFluidsChange}
            serviceName={serviceName}
          />
        );
      
      case 'motor-oil':
        return (
          <MotorOilForm
            data={data.fluidsData as MotorOilFluidsFormData}
            onChange={handleFluidsChange}
            serviceName={serviceName}
          />
        );
      
      default:
        return null;
    }
  };
  
  // Handle selection-only services (like tire rotation)
  if (ServiceRequirementsEngine.isSelectionOnly(category, serviceName)) {
    return (
      <View style={styles.selectionOnlyContainer}>
        <Typography variant="body" style={styles.selectionOnlyText}>
          ✅ {serviceName} selected - no additional parts or fluids required.
        </Typography>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Service Header */}
      <View style={styles.header}>
        <Typography variant="heading" style={styles.serviceName}>
          {serviceName}
        </Typography>
        <Typography variant="caption" style={styles.serviceCategory}>
          {category}
        </Typography>
      </View>
      
      {/* Parts Form */}
      {renderPartsForm()}
      
      {/* Fluids Form */}
      {renderFluidsForm()}
      
      {/* Service Total (if both parts and fluids) */}
      {formConfig.needsPartsForm && formConfig.needsFluidsForm && (
        <View style={styles.serviceTotalContainer}>
          <Typography variant="subheading" style={styles.serviceTotalLabel}>
            Service Total Cost
          </Typography>
          <Typography variant="heading" style={styles.serviceTotalValue}>
            ${data.serviceTotalCost.toFixed(2)}
          </Typography>
        </View>
      )}
      
      {/* Bottom spacing for scroll */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  serviceName: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  serviceCategory: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  selectionOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  selectionOnlyText: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  serviceTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.accent,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  serviceTotalLabel: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
  serviceTotalValue: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
    fontSize: 20,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});