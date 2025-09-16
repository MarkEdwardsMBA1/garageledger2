// Fluids Screen - For fluid-only services (Power Steering, Coolant, etc.)
// Implements wireframe: diy_service_fluid_wireframe.jpg
// Reuses existing components with fluid capacity/cost calculations
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from '../../common/Button';
import { Typography } from '../../common/Typography';
import { FluidEntryForm, FluidEntryData } from '../parts/FluidEntryForm';
import { theme } from '../../../utils/theme';

export interface FluidsScreenProps {
  /** Service name for header */
  serviceName: string;
  
  /** Initial data */
  initialData?: Partial<FluidEntryData>;
  
  /** Called when user saves */
  onSave: (data: FluidEntryData) => void;
  
  /** Called when user cancels */
  onCancel: () => void;
  
  /** Loading state */
  loading?: boolean;
}

export const FluidsScreen: React.FC<FluidsScreenProps> = ({
  serviceName,
  initialData,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FluidEntryData>({
    brand: initialData?.brand || '',
    partNumber: initialData?.partNumber || '',
    quantity: initialData?.quantity || '1',
    unitCapacity: initialData?.unitCapacity || '',
    unitCapacityType: initialData?.unitCapacityType || 'Quart',
    unitCost: initialData?.unitCost || '',
    totalCost: initialData?.totalCost || '0.00',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Quantity is required
    if (!formData.quantity || formData.quantity.trim() === '') {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseFloat(formData.quantity))) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    // Unit cost is required
    if (!formData.unitCost || formData.unitCost.trim() === '') {
      newErrors.unitCost = 'Unit cost is required';
    } else if (isNaN(parseFloat(formData.unitCost.replace('$', '')))) {
      newErrors.unitCost = 'Please enter a valid unit cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const canSave = formData.quantity.trim() !== '' && formData.unitCost.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="title" style={styles.headerTitle}>
          {serviceName}
        </Typography>
      </View>

      {/* Form Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FluidEntryForm
          data={formData}
          onChange={setFormData}
          errors={errors}
        />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title="Cancel"
          variant="text"
          onPress={onCancel}
          style={styles.cancelButton}
          disabled={loading}
        />
        
        <Button
          title="Save"
          variant="primary"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          disabled={!canSave || loading}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  cancelButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
});