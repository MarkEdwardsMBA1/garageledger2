// General Parts Form Component
// Supports multiple parts with "Add More" functionality

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Typography } from '../common/Typography';
import { PartsEntryRow } from './PartsEntryRow';
import { 
  GeneralPartsFormData, 
  PartEntry, 
  EntryFactory, 
  CostCalculator 
} from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface GeneralPartsFormProps {
  /** Parts form data */
  data: GeneralPartsFormData;
  
  /** Called when form data changes */
  onChange: (updatedData: GeneralPartsFormData) => void;
  
  /** Service name for context */
  serviceName?: string;
}

export const GeneralPartsForm: React.FC<GeneralPartsFormProps> = ({
  data,
  onChange,
  serviceName,
}) => {
  
  // Add a new part entry
  const addPart = () => {
    const newPart = EntryFactory.createPartEntry();
    const updatedParts = [...data.parts, newPart];
    const totalCost = CostCalculator.calculatePartsTotal(updatedParts);
    
    onChange({
      parts: updatedParts,
      totalCost,
    });
  };
  
  // Remove a part entry
  const removePart = (partIndex: number) => {
    const updatedParts = data.parts.filter((_, index) => index !== partIndex);
    const totalCost = CostCalculator.calculatePartsTotal(updatedParts);
    
    onChange({
      parts: updatedParts,
      totalCost,
    });
  };
  
  // Update a specific part
  const updatePart = (partIndex: number, updatedPart: PartEntry) => {
    const updatedParts = data.parts.map((part, index) => 
      index === partIndex ? updatedPart : part
    );
    const totalCost = CostCalculator.calculatePartsTotal(updatedParts);
    
    onChange({
      parts: updatedParts,
      totalCost,
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <Card variant="elevated" title="General Part Data">
      <View style={styles.container}>
        {/* Service Context */}
        {serviceName && (
          <Typography variant="caption" style={styles.serviceContext}>
            Parts for {serviceName}
          </Typography>
        )}

        {/* Parts Entries */}
        {data.parts.map((part, index) => (
          <PartsEntryRow
            key={part.id}
            part={part}
            onPartChange={(updatedPart) => updatePart(index, updatedPart)}
            onRemovePart={() => removePart(index)}
            isOnlyPart={data.parts.length === 1}
            index={index}
          />
        ))}

        {/* Add More Button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="+ Add Another Part"
            variant="outline"
            size="md"
            onPress={addPart}
            style={styles.addButton}
          />
        </View>

        {/* Parts Total */}
        <View style={styles.totalContainer}>
          <Typography variant="subheading" style={styles.totalLabel}>
            Parts Sub-Total
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
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  addButton: {
    minWidth: 200,
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