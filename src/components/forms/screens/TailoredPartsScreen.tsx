// Tailored Parts Screen - For single part services (Air Filter, Spark Plugs, etc.)
// Implements wireframe: diy_tailored_part_wireframe.jpg
// Reuses existing components for maximum consistency
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from '../../common/Button';
import { Typography } from '../../common/Typography';
import { PartEntryForm, PartEntryData } from '../parts/PartEntryForm';
import { theme } from '../../../utils/theme';

export interface TailoredPartsScreenProps {
  /** Service name for header */
  serviceName: string;
  
  /** Initial data */
  initialData?: Partial<PartEntryData>;
  
  /** Called when user saves */
  onSave: (data: PartEntryData) => void;
  
  /** Called when user cancels */
  onCancel: () => void;
  
  /** Loading state */
  loading?: boolean;
}

export const TailoredPartsScreen: React.FC<TailoredPartsScreenProps> = ({
  serviceName,
  initialData,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<PartEntryData>({
    brand: initialData?.brand || '',
    partNumber: initialData?.partNumber || '',
    cost: initialData?.cost || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Cost is required for tailored parts
    if (!formData.cost || formData.cost.trim() === '') {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(parseFloat(formData.cost.replace('$', '')))) {
      newErrors.cost = 'Please enter a valid cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const canSave = formData.cost.trim() !== '';

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
        <PartEntryForm
          data={formData}
          onChange={setFormData}
          errors={errors}
          costRequired={true}
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