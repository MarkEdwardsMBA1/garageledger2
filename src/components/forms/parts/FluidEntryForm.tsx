// Fluid Entry Form - Reusable component for fluid entry with capacity/units
// Follows existing Input, Button, and Card patterns for consistency
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Typography } from '../../common/Typography';
import { theme } from '../../../utils/theme';
import { CalculationService } from '../../../domain/CalculationService';

export interface FluidEntryData {
  brand?: string;
  partNumber?: string;
  quantity: string;
  unitCapacity: string;
  unitCapacityType: 'Ounce' | 'Quart' | 'Gallon';
  unitCost: string;
  totalCost: string;
  description?: string;
}

export interface FluidEntryFormProps {
  /** Current fluid data */
  data: FluidEntryData;
  
  /** Called when data changes */
  onChange: (data: FluidEntryData) => void;
  
  /** Form title */
  title?: string;
  
  /** Show description field (for parts + fluids forms) */
  showDescription?: boolean;
  
  /** Validation errors */
  errors?: Record<string, string>;
}

const UNIT_CAPACITY_OPTIONS: FluidEntryData['unitCapacityType'][] = ['Ounce', 'Quart', 'Gallon'];

export const FluidEntryForm: React.FC<FluidEntryFormProps> = ({
  data,
  onChange,
  title,
  showDescription = false,
  errors = {},
}) => {
  const updateField = (field: keyof FluidEntryData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateUnitCapacityType = (type: FluidEntryData['unitCapacityType']) => {
    onChange({ ...data, unitCapacityType: type });
  };

  // Calculate total cost when quantity or unit cost changes
  useEffect(() => {
    const totalCost = CalculationService.calculateFluidTotal(data.quantity, data.unitCost);
    const formattedTotal = totalCost.toFixed(2);
    
    if (data.totalCost !== formattedTotal && totalCost > 0) {
      updateField('totalCost', formattedTotal);
    }
  }, [data.quantity, data.unitCost]);

  return (
    <Card title={title} variant="default">
      <View style={styles.formContainer}>
        {showDescription && (
          <Input
            label="Description"
            value={data.description || ''}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Enter fluid description"
            error={errors.description}
            containerStyle={styles.inputContainer}
          />
        )}
        
        <Input
          label="Brand (Optional)"
          value={data.brand || ''}
          onChangeText={(value) => updateField('brand', value)}
          placeholder="Enter brand name"
          error={errors.brand}
          containerStyle={styles.inputContainer}
        />
        
        <Input
          label="Part Number (Optional)"
          value={data.partNumber || ''}
          onChangeText={(value) => updateField('partNumber', value)}
          placeholder="Enter part number"
          error={errors.partNumber}
          containerStyle={styles.inputContainer}
        />
        
        <Input
          label="Quantity"
          value={data.quantity}
          onChangeText={(value) => updateField('quantity', value)}
          placeholder="1"
          keyboardType="numeric"
          error={errors.quantity}
          required
          containerStyle={styles.inputContainer}
        />
        
        <View style={styles.unitCapacitySection}>
          <Typography variant="label" style={styles.sectionLabel}>
            Unit Capacity
          </Typography>
          
          <View style={styles.quickPicksContainer}>
            {UNIT_CAPACITY_OPTIONS.map((option) => (
              <Button
                key={option}
                title={option}
                variant={data.unitCapacityType === option ? 'primary' : 'outline'}
                size="sm"
                onPress={() => updateUnitCapacityType(option)}
                style={styles.quickPickButton}
              />
            ))}
          </View>
        </View>
        
        <Input
          label="Unit Cost"
          value={data.unitCost}
          onChangeText={(value) => updateField('unitCost', value)}
          placeholder="$0.00"
          keyboardType="numeric"
          error={errors.unitCost}
          required
          containerStyle={styles.inputContainer}
        />
        
        <Input
          label="Total Cost"
          value={`$${data.totalCost}`}
          editable={false}
          error={errors.totalCost}
          containerStyle={styles.inputContainer}
          inputStyle={styles.calculatedField}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    // No additional styling needed - Input component handles it
  },
  unitCapacitySection: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  quickPicksContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  quickPickButton: {
    flex: 0,
    minWidth: 80,
  },
  calculatedField: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textSecondary,
  },
});