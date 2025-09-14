// DIY Service Step 2: Service Selection Component with Parts and Fluids
// Enhanced with dynamic parts and fluids data entry
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { MaintenanceCategoryPicker } from '../../common/MaintenanceCategoryPicker';
import { ServicePartsAndFluids, CostSummary } from '../../parts';
import { 
  ServiceEntryData,
  DIYStep2Data,
  EntryFactory,
  CostCalculator 
} from '../../../domain/PartsAndFluids';
import { ServiceRequirementsEngine } from '../../../domain/ServiceRequirements';
import { theme } from '../../../utils/theme';
import { WizardStepProps, DIYServicesData } from '../../../types/wizard';
import { SelectedService } from '../../../types';

export const DIYServicesStep: React.FC<WizardStepProps<DIYServicesData>> = ({
  data = {
    selectedServices: [],
    serviceConfigs: {},
    notes: '',
    servicesWithPartsAndFluids: {},
    totalPartsCart: 0,
    totalFluidsCart: 0,
    grandTotal: 0,
  },
  onDataChange,
}) => {
  const { t } = useTranslation();
  const [showCategoryPicker, setShowCategoryPicker] = useState(
    data.selectedServices.length === 0
  );

  const updateField = (field: keyof DIYServicesData, value: any) => {
    onDataChange({ [field]: value });
  };

  const handleServiceSelection = (services: SelectedService[]) => {
    updateField('selectedServices', services);
    setShowCategoryPicker(false);
  };

  const handleCancelSelection = () => {
    // Close modal, return to step - don't exit wizard
    setShowCategoryPicker(false);
  };

  const handleEditServices = () => {
    setShowCategoryPicker(true);
  };

  // Calculate DIY Step 2 data for cost summary
  const diyStep2Data: DIYStep2Data = useMemo(() => {
    const services = Object.values(data.servicesWithPartsAndFluids || {});
    const totals = CostCalculator.calculateGrandTotal(services);
    
    return {
      services,
      totalPartsCart: totals.totalPartsCart,
      totalFluidsCart: totals.totalFluidsCart,
      grandTotal: totals.grandTotal,
    };
  }, [data.servicesWithPartsAndFluids]);

  // Initialize service data when services are selected
  const initializeServiceData = (services: SelectedService[]) => {
    const updatedServicesData = { ...(data.servicesWithPartsAndFluids || {}) };
    
    // Add new services
    services.forEach(service => {
      if (!updatedServicesData[service.serviceId]) {
        // Create initial service entry
        updatedServicesData[service.serviceId] = {
          serviceId: service.serviceId,
          category: service.category || 'Unknown',
          serviceName: service.serviceName,
          partsData: undefined,
          fluidsData: undefined,
          partsSubtotal: 0,
          fluidsSubtotal: 0,
          serviceTotalCost: 0,
        };
      }
    });

    // Remove services that are no longer selected
    const selectedServiceIds = new Set(services.map(s => s.serviceId));
    Object.keys(updatedServicesData).forEach(serviceId => {
      if (!selectedServiceIds.has(serviceId)) {
        delete updatedServicesData[serviceId];
      }
    });

    return updatedServicesData;
  };

  // Handle service selection with parts/fluids initialization
  const handleServiceSelectionEnhanced = (services: SelectedService[]) => {
    const updatedServicesData = initializeServiceData(services);
    const servicesList = Object.values(updatedServicesData);
    const totals = CostCalculator.calculateGrandTotal(servicesList);
    
    updateField('selectedServices', services);
    updateField('servicesWithPartsAndFluids', updatedServicesData);
    updateField('totalPartsCart', totals.totalPartsCart);
    updateField('totalFluidsCart', totals.totalFluidsCart);
    updateField('grandTotal', totals.grandTotal);
    setShowCategoryPicker(false);
  };

  // Handle service parts and fluids data changes
  const handleServiceDataChange = (serviceId: string, updatedServiceData: ServiceEntryData) => {
    const updatedServicesData = {
      ...(data.servicesWithPartsAndFluids || {}),
      [serviceId]: updatedServiceData,
    };
    
    const servicesList = Object.values(updatedServicesData);
    const totals = CostCalculator.calculateGrandTotal(servicesList);
    
    updateField('servicesWithPartsAndFluids', updatedServicesData);
    updateField('totalPartsCart', totals.totalPartsCart);
    updateField('totalFluidsCart', totals.totalFluidsCart);
    updateField('grandTotal', totals.grandTotal);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showCategoryPicker ? (
        <View style={styles.categoryPickerContainer}>
          <MaintenanceCategoryPicker
            visible={true}
            selectedServices={data.selectedServices}
            onSelectionComplete={handleServiceSelectionEnhanced}
            onCancel={handleCancelSelection}
            serviceType="diy"
          />
        </View>
      ) : (
        <>
          {/* Service Selection Summary */}
          <View style={styles.selectedServicesContainer}>
            <Card
              title="Selected Services"
              variant="elevated"
            >
              <View style={styles.servicesList}>
                {data.selectedServices.map((service, index) => (
                  <View key={service.serviceId} style={styles.serviceItem}>
                    <Typography variant="body" style={styles.serviceName}>
                      {service.serviceName}
                    </Typography>
                    <Typography variant="caption" style={styles.serviceCategory}>
                      {service.category}
                    </Typography>
                  </View>
                ))}
              </View>

              {data.selectedServices.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Typography variant="body" style={styles.emptyStateText}>
                    No services selected yet.
                  </Typography>
                </View>
              ) : (
                <View style={styles.editButtonContainer}>
                  <Button
                    title="Edit Service Selection"
                    variant="outline"
                    size="sm"
                    onPress={handleEditServices}
                  />
                </View>
              )}
            </Card>
          </View>

          {/* Parts and Fluids Forms for Each Service */}
          {data.selectedServices.length > 0 && (
            <View style={styles.partsAndFluidsContainer}>
              {data.selectedServices.map((service) => {
                const serviceData = data.servicesWithPartsAndFluids?.[service.serviceId];
                if (!serviceData) return null;

                return (
                  <View key={service.serviceId} style={styles.serviceFormContainer}>
                    <ServicePartsAndFluids
                      category={service.category || 'Unknown'}
                      serviceName={service.serviceName}
                      data={serviceData}
                      onChange={(updatedData) => 
                        handleServiceDataChange(service.serviceId, updatedData)
                      }
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* Cost Summary */}
          {data.selectedServices.length > 0 && diyStep2Data.services.length > 0 && (
            <View style={styles.costSummaryContainer}>
              <CostSummary
                data={diyStep2Data}
                showServiceBreakdown={true}
                compact={false}
              />
            </View>
          )}

          {/* Service Notes */}
          <View style={styles.notesSection}>
            <Input
              label="Additional Notes"
              value={data.notes}
              onChangeText={(value) => updateField('notes', value)}
              placeholder="Add any additional details about the services performed..."
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
          </View>

          {/* Bottom Spacing for Scroll */}
          <View style={styles.bottomSpacing} />
        </>
      )}
    </ScrollView>
  );
};

// Validation function for this step
export const validateDIYServices = (data: DIYServicesData): string[] | null => {
  const errors = [];

  if (!data.selectedServices || data.selectedServices.length === 0) {
    errors.push('Please select at least one service to continue');
  }

  return errors.length > 0 ? errors : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryPickerContainer: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  selectedServicesContainer: {
    marginBottom: theme.spacing.md,
  },
  servicesList: {
    marginBottom: theme.spacing.sm,
  },
  serviceItem: {
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  serviceName: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 2,
  },
  serviceCategory: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  // Empty State Styles
  emptyStateContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emptyStateText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  editButtonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  partsAndFluidsContainer: {
    marginBottom: theme.spacing.lg,
  },
  serviceFormContainer: {
    marginBottom: theme.spacing.xl,
  },
  costSummaryContainer: {
    marginBottom: theme.spacing.lg,
  },
  notesSection: {
    marginBottom: theme.spacing.lg,
  },
  notesInput: {
    minHeight: 100,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});