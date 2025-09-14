// Motor Oil Entry Row Component
// Specialized component for motor oil with viscosity field

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common/Input';
import { Typography } from '../common/Typography';
import { MotorOilEntry, CostCalculator } from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface MotorOilEntryRowProps {
  /** Motor oil data */
  motorOil: MotorOilEntry;
  
  /** Called when motor oil data changes */
  onMotorOilChange: (updatedMotorOil: MotorOilEntry) => void;
  
  /** Row index for accessibility */
  index?: number;
}

const UNIT_CAPACITY_OPTIONS = ['Quarts', 'Gallons'];
const COMMON_VISCOSITIES = ['0W16', '0W20', '5W20', '5W30', '5W40', '10W30', '10W40', '15W40', '20W50'];

export const MotorOilEntryRow: React.FC<MotorOilEntryRowProps> = ({
  motorOil,
  onMotorOilChange,
  index = 0,
}) => {
  
  // Update motor oil field and recalculate subtotal
  const updateMotorOilField = (field: keyof MotorOilEntry, value: string | number) => {
    const updatedMotorOil = { ...motorOil, [field]: value };
    
    // Recalculate subtotal when quantity or unitCost changes
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = field === 'quantity' ? Number(value) : motorOil.quantity;
      const unitCost = field === 'unitCost' ? Number(value) : motorOil.unitCost;
      updatedMotorOil.subtotal = CostCalculator.calculateFluidSubtotal(quantity, unitCost);
    }
    
    onMotorOilChange(updatedMotorOil);
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  const formatNumber = (value: number): string => {
    return value.toString();
  };

  // Simple dropdown simulation for unit capacity
  const renderCapacityPicker = () => {
    return (
      <Input
        label="Unit Capacity [Select Quarts or Gallons]"
        value={motorOil.unitCapacity}
        onChangeText={(value) => updateMotorOilField('unitCapacity', value)}
        placeholder="Quarts"
        variant="outlined"
        helperText="Select 'Quarts' or 'Gallons'"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Motor Oil Header */}
      <Typography variant="subheading" style={styles.header}>
        Motor Oil Fluid Data
      </Typography>

      {/* First Row: Brand, Description */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Brand"
            value={motorOil.brand}
            onChangeText={(value) => updateMotorOilField('brand', value)}
            placeholder="Valvoline"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Description"
            value={motorOil.description}
            onChangeText={(value) => updateMotorOilField('description', value)}
            placeholder="Restore & Protect"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Second Row: Viscosity, Quantity */}
      <View style={styles.row}>
        <View style={styles.quarterWidth}>
          <Input
            label="Viscosity [XW[V]]"
            value={motorOil.viscosity}
            onChangeText={(value) => updateMotorOilField('viscosity', value)}
            placeholder="0W20"
            variant="outlined"
            autoCapitalize="characters"
            helperText="e.g., 5W30, 0W20"
          />
        </View>
        <View style={styles.quarterWidth}>
          <Input
            label="Quantity"
            value={formatNumber(motorOil.quantity)}
            onChangeText={(value) => {
              const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 1;
              updateMotorOilField('quantity', numValue);
            }}
            placeholder="1"
            variant="outlined"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfWidth}>
          {renderCapacityPicker()}
        </View>
      </View>

      {/* Third Row: Unit Cost, Retailer */}
      <View style={styles.row}>
        <View style={styles.quarterWidth}>
          <Input
            label="Unit Cost"
            value={motorOil.unitCost > 0 ? formatCurrency(motorOil.unitCost) : ''}
            onChangeText={(value) => {
              // Allow decimal input for currency
              const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
              updateMotorOilField('unitCost', numValue);
            }}
            placeholder="30.00"
            variant="outlined"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Retailer"
            value={motorOil.retailer}
            onChangeText={(value) => updateMotorOilField('retailer', value)}
            placeholder="Walmart"
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
              ${formatCurrency(motorOil.subtotal)}
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
    backgroundColor: theme.colors.background.accent, // Slightly different background for motor oil
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderStyle: 'dashed', // Visual distinction for motor oil
  },
  header: {
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
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
    color: theme.colors.primary.main, // Emphasize motor oil cost
    fontWeight: '600',
    textAlign: 'right',
  },
});