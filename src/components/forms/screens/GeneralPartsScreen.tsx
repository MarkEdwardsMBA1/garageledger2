// General Parts Screen - For multi-part services (Brake Pads & Rotors, etc.)
// Implements wireframe: diy_service_general_parts_wireframe.jpg
// Reuses existing components with "Add Another Part" functionality
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Button } from '../../common/Button';
import { Typography } from '../../common/Typography';
import { Card } from '../../common/Card';
import { PartEntryForm, PartEntryData } from '../parts/PartEntryForm';
import { theme } from '../../../utils/theme';
import { CalculationService } from '../../../domain/CalculationService';

export interface GeneralPartsData {
  parts: PartEntryData[];
  totalCost: number;
}

export interface GeneralPartsScreenProps {
  /** Service name for header */
  serviceName: string;
  
  /** Initial data */
  initialData?: Partial<GeneralPartsData>;
  
  /** Called when user saves */
  onSave: (data: GeneralPartsData) => void;
  
  /** Called when user cancels */
  onCancel: () => void;
  
  /** Loading state */
  loading?: boolean;
}

const createEmptyPart = (): PartEntryData => ({
  brand: '',
  partNumber: '',
  cost: '',
  quantity: '1',
  description: '',
});

export const GeneralPartsScreen: React.FC<GeneralPartsScreenProps> = ({
  serviceName,
  initialData,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [parts, setParts] = useState<PartEntryData[]>(() => {
    return initialData?.parts?.length ? initialData.parts : [createEmptyPart()];
  });
  
  const [totalCost, setTotalCost] = useState(0);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  // Calculate total cost when parts change
  useEffect(() => {
    const total = CalculationService.calculatePartsTotal(parts);
    setTotalCost(total);
  }, [parts]);

  const updatePart = (index: number, updatedPart: PartEntryData) => {
    setParts(prev => prev.map((part, i) => i === index ? updatedPart : part));
  };

  const addAnotherPart = () => {
    setParts(prev => [...prev, createEmptyPart()]);
  };

  const removePart = (index: number) => {
    if (parts.length > 1) {
      setParts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    parts.forEach((part, index) => {
      const partErrors: Record<string, string> = {};

      // Quantity is required
      if (!part.quantity || part.quantity.trim() === '') {
        partErrors.quantity = 'Quantity is required';
      } else if (isNaN(parseFloat(part.quantity))) {
        partErrors.quantity = 'Please enter a valid quantity';
      }

      // Cost is required
      if (!part.cost || part.cost.trim() === '') {
        partErrors.cost = 'Cost is required';
      } else if (isNaN(parseFloat(part.cost.replace('$', '')))) {
        partErrors.cost = 'Please enter a valid cost';
      }

      if (Object.keys(partErrors).length > 0) {
        newErrors[index.toString()] = partErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        parts,
        totalCost,
      });
    }
  };

  const canSave = parts.every(part => 
    part.quantity.trim() !== '' && part.cost.trim() !== ''
  );

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
        {parts.map((part, index) => (
          <View key={index} style={styles.partContainer}>
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
                  style={styles.removeButton}
                />
              </View>
            )}
          </View>
        ))}

        {/* Add Another Part Button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="Add Another Part"
            variant="primary"
            onPress={addAnotherPart}
            disabled={loading}
            fullWidth
          />
        </View>

        {/* Total Cost Summary */}
        {totalCost > 0 && (
          <Card variant="elevated" style={styles.totalCostCard}>
            <Typography variant="heading" style={styles.totalCostText}>
              Total Cost: ${totalCost.toFixed(2)}
            </Typography>
          </Card>
        )}
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
  partContainer: {
    marginBottom: theme.spacing.lg,
  },
  removeButtonContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  removeButton: {
    // Button component handles styling
  },
  addButtonContainer: {
    marginBottom: theme.spacing.lg,
  },
  totalCostCard: {
    marginBottom: theme.spacing.lg,
  },
  totalCostText: {
    color: theme.colors.primary,
    textAlign: 'center',
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