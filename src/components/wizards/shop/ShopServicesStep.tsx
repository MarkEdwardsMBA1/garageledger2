// Shop Service Step 2: Service Selection Component
// Extracted from ShopServiceStep2Screen for wizard consolidation

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { MaintenanceCategoryPicker } from '../../common/MaintenanceCategoryPicker';
import { theme } from '../../../utils/theme';
import { WizardStepProps } from '../../../types/wizard';
import { SelectedService } from '../../../types';

export interface ShopServicesData {
  selectedServices: SelectedService[];
  notes: string;
}

export const ShopServicesStep: React.FC<WizardStepProps<ShopServicesData>> = ({
  data = {
    selectedServices: [],
    notes: '',
  },
  onDataChange,
}) => {
  const { t } = useTranslation();
  const [showCategoryPicker, setShowCategoryPicker] = useState(
    data.selectedServices.length === 0
  );

  const updateField = (field: keyof ShopServicesData, value: any) => {
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

  return (
    <View style={styles.container}>
      {showCategoryPicker ? (
        <View style={styles.categoryPickerContainer}>
          <MaintenanceCategoryPicker
            visible={true}
            selectedServices={data.selectedServices}
            onSelectionComplete={handleServiceSelection}
            onCancel={handleCancelSelection}
            serviceType="shop"
          />
        </View>
      ) : (
        <View style={styles.selectedServicesContainer}>
          <Card
            title="Selected Services"
            variant="elevated"
            onPress={handleEditServices}
          >
            <View style={styles.servicesList}>
              {data.selectedServices.map((service, index) => (
                <View key={service.serviceId} style={styles.serviceItem}>
                  <Typography variant="caption" style={styles.serviceName}>
                    {service.serviceName}
                  </Typography>
                  {service.cost && (
                    <Typography variant="caption" style={styles.serviceCost}>
                      ${service.cost}
                    </Typography>
                  )}
                </View>
              ))}
            </View>

            {data.selectedServices.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Typography variant="body" style={styles.emptyStateText}>
                  Click here to select services to continue.
                </Typography>
              </View>
            )}
          </Card>
        </View>
      )}

      <View style={styles.notesSection}>
        <Input
          label="Service Notes"
          value={data.notes}
          onChangeText={(value) => updateField('notes', value)}
          placeholder="Add any additional details about the services performed..."
          multiline
          numberOfLines={4}
          style={styles.notesInput}
        />
      </View>
    </View>
  );
};

// Validation function for this step
export const validateShopServices = (data: ShopServicesData): string[] | null => {
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
    marginBottom: theme.spacing.lg,
  },
  servicesList: {
    // Remove gap to match Programs screen exactly
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  serviceName: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  serviceCost: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'right',
  },
  // Empty State Styles
  emptyStateContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'flex-start', // Left align
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginBottom: theme.spacing.md,
  },
  notesSection: {
    marginBottom: theme.spacing.lg,
  },
  notesInput: {
    minHeight: 100,
  },
});

export default ShopServicesStep;