// Part Entry Form - Reusable component for single part entry
// Follows existing Input and Card patterns for consistency
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../common/Input';
import { Card } from '../../common/Card';
import { theme } from '../../../utils/theme';

export interface PartEntryData {
  brand?: string;
  partNumber?: string;
  cost: string;
  quantity?: string;
  description?: string;
}

export interface PartEntryFormProps {
  /** Current part data */
  data: PartEntryData;
  
  /** Called when data changes */
  onChange: (data: PartEntryData) => void;
  
  /** Form title */
  title?: string;
  
  /** Show quantity field (for multi-part forms) */
  showQuantity?: boolean;
  
  /** Show description field (for parts + fluids forms) */
  showDescription?: boolean;
  
  /** Validation errors */
  errors?: Record<string, string>;
  
  /** Whether cost is required */
  costRequired?: boolean;
}

export const PartEntryForm: React.FC<PartEntryFormProps> = ({
  data,
  onChange,
  title,
  showQuantity = false,
  showDescription = false,
  errors = {},
  costRequired = true,
}) => {
  const updateField = (field: keyof PartEntryData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card title={title} variant="default">
      <View style={styles.formContainer}>
        {showDescription && (
          <Input
            label="Description"
            value={data.description || ''}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Enter part description"
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
        
        {showQuantity && (
          <Input
            label="Quantity"
            value={data.quantity || ''}
            onChangeText={(value) => updateField('quantity', value)}
            placeholder="1"
            keyboardType="numeric"
            error={errors.quantity}
            required
            containerStyle={styles.inputContainer}
          />
        )}
        
        <Input
          label={costRequired ? "Cost" : "Cost (Optional)"}
          value={data.cost}
          onChangeText={(value) => updateField('cost', value)}
          placeholder="$0.00"
          keyboardType="numeric"
          error={errors.cost}
          required={costRequired}
          containerStyle={styles.inputContainer}
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
});