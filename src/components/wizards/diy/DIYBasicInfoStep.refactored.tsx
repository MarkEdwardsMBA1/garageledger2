// DIY Service Step 1: Basic Information Component - Schema-Driven Version
// Example of how wizard components become "dumb" UI that consumes ValidationService results

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../common/Typography';
import { Input } from '../../common/Input';
import { DatePickerInput } from '../../common/DatePickerInput';
import { WizardStepProps } from '../../../types/wizard';
import { ValidationService } from '../../../services/ValidationService';
import { filterWholeNumbers } from '../../../utils/inputFilters';
import { type DIYBasicInfoData } from '../../../schemas';
import { theme } from '../../../utils/theme';

/**
 * Schema-Driven DIY Basic Info Step
 * 
 * Benefits of new approach:
 * - Component is "dumb" - just renders data and consumes validation results
 * - No validation logic mixed in with UI code
 * - ValidationService handles all business rules via schemas
 * - Same validation logic works frontend and backend
 * - Easy to test - validation logic is separate from UI
 */
export const DIYBasicInfoStepRefactored: React.FC<WizardStepProps<DIYBasicInfoData>> = ({
  data,
  onDataChange,
}) => {
  
  // ✅ NEW: Get validation results from schema-driven ValidationService
  // This is the only validation code needed in the component!
  const validation = ValidationService.validateDIYBasicInfo(data);
  
  const handleDateChange = (date: Date) => {
    onDataChange({ date });
  };

  const handleMileageChange = (input: string) => {
    // ✅ NEW: Filter input to prevent decimals and invalid characters
    const filtered = filterWholeNumbers(input);
    onDataChange({ mileage: filtered });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        
        {/* Date Input - schema validation handles all date rules */}
        <DatePickerInput
          label="Service Date"
          value={data.date}
          onDateChange={handleDateChange}
          maximumDate={new Date()}
          error={validation.errors.date} // ✅ Direct error from schema
        />

        {/* Mileage Input - schema validation handles all mileage rules */}
        <Input
          label="Odometer"
          value={data.mileage}
          onChangeText={handleMileageChange}
          placeholder="75000"
          keyboardType="number-pad" // ✅ NEW: No decimal point on keyboard
          error={validation.errors.mileage} // ✅ Direct error from schema
        />
        
        {/* Optional: Debug info during development */}
        {__DEV__ && !validation.isValid && (
          <View style={styles.debugContainer}>
            <Typography variant="caption" style={styles.debugText}>
              Debug - Validation Errors:
            </Typography>
            {ValidationService.getAllErrors(validation).map((error, index) => (
              <Typography key={index} variant="caption" style={styles.debugText}>
                • {error}
              </Typography>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ✅ NEW: Export validation function for wizard system
// This replaces the old inline validation function
export const validateDIYBasicInfo = (data: unknown) => {
  return ValidationService.validateDIYBasicInfo(data);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    gap: theme.spacing.lg,
  },
  debugContainer: {
    backgroundColor: theme.colors.warning + '10',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  debugText: {
    color: theme.colors.warning,
    fontSize: 11,
  },
});

/**
 * ✅ COMPARISON: Old vs New Approach
 * 
 * OLD APPROACH (before schema-driven):
 * ```typescript
 * export const validateDIYBasicInfo = (data: DIYBasicInfoData): string[] | null => {
 *   const errors = [];
 *   
 *   // ❌ Validation logic mixed with UI
 *   if (!data.mileage || !data.mileage.trim()) {
 *     errors.push('Enter the odometer reading...');
 *   } else if (isNaN(parseInt(data.mileage.replace(/,/g, '')))) {
 *     errors.push('Odometer reading must be a valid number.');
 *   }
 *   // ... more validation logic duplicated across components
 *   
 *   return errors.length > 0 ? errors : null;
 * };
 * ```
 * 
 * NEW APPROACH (schema-driven):
 * ```typescript
 * // ✅ Component just calls ValidationService
 * const validation = ValidationService.validateDIYBasicInfo(data);
 * 
 * // ✅ ValidationService uses shared schema 
 * // ✅ Same schema works frontend AND backend
 * // ✅ No validation logic duplication
 * // ✅ Easy to test validation separately from UI
 * ```
 * 
 * BENEFITS:
 * 1. **Single Source of Truth**: Schema defines rules once
 * 2. **No Validation Drift**: Frontend/backend use identical rules
 * 3. **Testable**: Validation logic separate from UI components
 * 4. **Maintainable**: Update rules in one place (schema)
 * 5. **Type Safety**: Zod generates TypeScript types automatically
 * 6. **Performance**: Validation happens only when needed
 * 7. **Composable**: Can reuse validation across different forms
 */