// Parts Entry Row Component
// Reusable component for all parts forms using existing Input components

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Typography } from '../common/Typography';
import { PartEntry, CostCalculator } from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface PartsEntryRowProps {
  /** Part data */
  part: PartEntry;
  
  /** Called when part data changes */
  onPartChange: (updatedPart: PartEntry) => void;
  
  /** Called when part should be removed (for multi-part forms) */
  onRemovePart?: () => void;
  
  /** Whether this is the only part (hide remove button) */
  isOnlyPart?: boolean;
  
  /** Row index for accessibility */
  index?: number;
}

export const PartsEntryRow: React.FC<PartsEntryRowProps> = ({
  part,
  onPartChange,
  onRemovePart,
  isOnlyPart = false,
  index = 0,
}) => {
  
  // Update part field and recalculate subtotal
  const updatePartField = (field: keyof PartEntry, value: string | number) => {
    const updatedPart = { ...part, [field]: value };
    
    // Recalculate subtotal when quantity or unitCost changes
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = field === 'quantity' ? Number(value) : part.quantity;
      const unitCost = field === 'unitCost' ? Number(value) : part.unitCost;
      updatedPart.subtotal = CostCalculator.calculatePartSubtotal(quantity, unitCost);
    }
    
    onPartChange(updatedPart);
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  const formatNumber = (value: number): string => {
    return value.toString();
  };

  return (
    <View style={styles.container}>
      {/* Part Header - only show for multiple parts */}
      {index > 0 && (
        <View style={styles.header}>
          <Typography variant="subheading" style={styles.partNumber}>
            Part {index + 1}
          </Typography>
          {onRemovePart && !isOnlyPart && (
            <Button
              title="Remove"
              variant="ghost"
              size="sm"
              onPress={onRemovePart}
            />
          )}
        </View>
      )}

      {/* First Row: Brand, Description */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Brand"
            value={part.brand}
            onChangeText={(value) => updatePartField('brand', value)}
            placeholder="Toyota"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.halfWidth}>
          <Input
            label="Description"
            value={part.description}
            onChangeText={(value) => updatePartField('description', value)}
            placeholder="Thingamajig for my car"
            variant="outlined"
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Second Row: Part Number, Quantity */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Input
            label="Part #"
            value={part.partNumber}
            onChangeText={(value) => updatePartField('partNumber', value)}
            placeholder="17801-38051"
            variant="outlined"
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.quarterWidth}>
          <Input
            label="Quantity"
            value={formatNumber(part.quantity)}
            onChangeText={(value) => {
              const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 1;
              updatePartField('quantity', numValue);
            }}
            placeholder="1"
            variant="outlined"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.quarterWidth}>
          <Input
            label="Unit Cost"
            value={part.unitCost > 0 ? formatCurrency(part.unitCost) : ''}
            onChangeText={(value) => {
              // Allow decimal input for currency
              const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
              updatePartField('unitCost', numValue);
            }}
            placeholder="39.08"
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
            value={part.retailer}
            onChangeText={(value) => updatePartField('retailer', value)}
            placeholder="Toyota Dealer"
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
              ${formatCurrency(part.subtotal)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  partNumber: {
    color: theme.colors.text.primary,
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