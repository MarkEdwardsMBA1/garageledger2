// Fluids Entry Row Component
// Reusable component for general fluids using existing Input components

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common/Input';
import { Typography } from '../common/Typography';
import { FluidEntry, CostCalculator } from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface FluidsEntryRowProps {
  /** Fluid data */
  fluid: FluidEntry;
  
  /** Called when fluid data changes */
  onFluidChange: (updatedFluid: FluidEntry) => void;
  
  /** Row index for accessibility */
  index?: number;
}

const UNIT_CAPACITY_OPTIONS = ['Quarts', 'Gallons'];

export const FluidsEntryRow: React.FC<FluidsEntryRowProps> = ({
  fluid,
  onFluidChange,
  index = 0,
}) => {
  
  // Update fluid field and recalculate subtotal
  const updateFluidField = (field: keyof FluidEntry, value: string | number) => {
    const updatedFluid = { ...fluid, [field]: value };
    
    // Recalculate subtotal when quantity or unitCost changes
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = field === 'quantity' ? Number(value) : fluid.quantity;
      const unitCost = field === 'unitCost' ? Number(value) : fluid.unitCost;
      updatedFluid.subtotal = CostCalculator.calculateFluidSubtotal(quantity, unitCost);
    }
    
    onFluidChange(updatedFluid);
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  const formatNumber = (value: number): string => {
    return value.toString();
  };

  // Simple dropdown simulation - could be enhanced with proper picker
  const renderCapacityPicker = () => {
    return (
      <Input
        label="Unit Capacity [Select Quarts or Quarts]"
        value={fluid.unitCapacity}
        onChangeText={(value) => updateFluidField('unitCapacity', value)}
        placeholder="Quarts"
        variant="outlined"
        helperText="Select 'Quarts' or 'Gallons'"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* First Row: Brand, Description */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Brand"
            value={fluid.brand}
            onChangeText={(value) => updateFluidField('brand', value)}
            placeholder="Red Line"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Description"
            value={fluid.description}
            onChangeText={(value) => updateFluidField('description', value)}
            placeholder="DCTF"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Second Row: Quantity, Unit Capacity */}
      <View style={styles.row}>
        <View style={styles.quarterWidth}>
          <Input
            label="Quantity"
            value={formatNumber(fluid.quantity)}
            onChangeText={(value) => {
              const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 1;
              updateFluidField('quantity', numValue);
            }}
            placeholder="7"
            variant="outlined"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfWidth}>
          {renderCapacityPicker()}
        </View>
        <View style={styles.quarterWidth}>
          <Input
            label="Unit Cost"
            value={fluid.unitCost > 0 ? formatCurrency(fluid.unitCost) : ''}
            onChangeText={(value) => {
              // Allow decimal input for currency
              const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
              updateFluidField('unitCost', numValue);
            }}
            placeholder="19.99"
            variant="outlined"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Third Row: Retailer, Subtotal */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Retailer"
            value={fluid.retailer}
            onChangeText={(value) => updateFluidField('retailer', value)}
            placeholder="Bimmerworld.com"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.quarterWidth}>
          {/* Subtotal Display - Read-only */}
          <Typography variant="label" style={styles.subtotalLabel}>
            Sub-Total [Calculated]
          </Typography>
          <View style={styles.subtotalContainer}>
            <Typography variant="body" style={styles.subtotalValue}>
              ${formatCurrency(fluid.subtotal)}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  quarterWidth: {
    flex: 0.5,
  },
  subtotalLabel: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  subtotalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    justifyContent: 'center',
    minHeight: 48, // Match input height
  },
  subtotalValue: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
});