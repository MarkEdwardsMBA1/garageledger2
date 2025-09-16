// DIY Service Step 2: Service Selection Component
// Clean implementation for service selection and notes
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { MaintenanceCategoryPicker } from '../../common/MaintenanceCategoryPicker';
import { theme } from '../../../utils/theme';
import { WizardStepProps, DIYServicesData } from '../../../types/wizard';
import { SelectedService } from '../../../types';

export const DIYServicesStep: React.FC<WizardStepProps<DIYServicesData>> = ({
  data = {
    selectedServices: [],
    notes: '',
    serviceFormData: {},
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

  const handleServiceSelection = (services: SelectedService[], configs?: any, serviceFormData?: any) => {
    console.log('[DEBUG] DIYServicesStep handleServiceSelection:', { services, serviceFormData });
    
    updateField('selectedServices', services);
    if (serviceFormData) {
      updateField('serviceFormData', serviceFormData);
    }
    setShowCategoryPicker(false);
  };

  const handleCancelSelection = () => {
    // Close modal, return to step - don't exit wizard
    setShowCategoryPicker(false);
  };

  const handleEditServices = () => {
    setShowCategoryPicker(true);
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showCategoryPicker ? (
        <View style={styles.categoryPickerContainer}>
          <MaintenanceCategoryPicker
            visible={true}
            selectedServices={data.selectedServices}
            onSelectionComplete={handleServiceSelection}
            onCancel={handleCancelSelection}
            serviceType="diy"
            enableConfiguration={true}
            initialServiceFormData={data.serviceFormData}
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
                {data.selectedServices.map((service, index) => {
                  const hasFormData = data.serviceFormData && data.serviceFormData[service.serviceId];
                  
                  return (
                    <View key={service.serviceId} style={styles.serviceItem}>
                      <Typography variant="body" style={styles.serviceName}>
                        {service.serviceName}
                      </Typography>
                      <Typography variant="caption" style={styles.serviceCategory}>
                        {service.categoryKey}
                      </Typography>
                      {hasFormData && (
                        <Typography variant="caption" style={styles.serviceStatus}>
                          ✓ Details Added
                        </Typography>
                      )}
                    </View>
                  );
                })}
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
    borderBottomColor: theme.colors.borderLight,
  },
  serviceName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 2,
  },
  serviceCategory: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  serviceStatus: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  // Empty State Styles
  emptyStateContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  editButtonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
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