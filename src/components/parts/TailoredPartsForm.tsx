// Tailored Parts Form Component
// Single specialized part entry (no "Add More" functionality)

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { PartsEntryRow } from './PartsEntryRow';
import { 
  TailoredPartsFormData, 
  PartEntry 
} from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface TailoredPartsFormProps {
  /** Tailored parts form data */
  data: TailoredPartsFormData;
  
  /** Called when form data changes */
  onChange: (updatedData: TailoredPartsFormData) => void;
  
  /** Service name for context */
  serviceName?: string;
  
  /** Optional specialized instructions */
  instructions?: string;
}

export const TailoredPartsForm: React.FC<TailoredPartsFormProps> = ({
  data,
  onChange,
  serviceName,
  instructions,
}) => {
  
  // Update the single part
  const updatePart = (updatedPart: PartEntry) => {
    onChange({
      part: updatedPart,
      totalCost: updatedPart.subtotal, // For single part, total = subtotal
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <Card variant="elevated" title="Tailored Part Data">
      <View style={styles.container}>
        {/* Service Context */}
        {serviceName && (
          <Typography variant="caption" style={styles.serviceContext}>
            Specialized part for {serviceName}
          </Typography>
        )}

        {/* Instructions (if provided) */}
        {instructions && (
          <View style={styles.instructionsContainer}>
            <Typography variant="body" style={styles.instructions}>
              {instructions}
            </Typography>
          </View>
        )}

        {/* Single Part Entry */}
        <PartsEntryRow
          part={data.part}
          onPartChange={updatePart}
          isOnlyPart={true}
          index={0}
        />

        {/* Part Total */}
        <View style={styles.totalContainer}>
          <Typography variant="subheading" style={styles.totalLabel}>
            Part Cost
          </Typography>
          <Typography variant="heading" style={styles.totalValue}>
            ${formatCurrency(data.totalCost)}
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    // Card handles padding
  },
  serviceContext: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsContainer: {
    backgroundColor: theme.colors.background.accent,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary.main,
  },
  instructions: {
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary.main,
    marginTop: theme.spacing.md,
  },
  totalLabel: {
    color: theme.colors.text.primary,
  },
  totalValue: {
    color: theme.colors.primary.main,
    fontWeight: 'bold',
  },
});