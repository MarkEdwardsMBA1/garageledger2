// DIY Service Step 1: Basic Information (Date & Mileage)
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../common/Typography';
import { Input } from '../../common/Input';
import { DatePickerInput } from '../../common/DatePickerInput';
import { WizardStepProps, DIYBasicInfoData } from '../../../types/wizard';
import { filterWholeNumbers, formatMileage } from '../../../utils/inputFilters';
import { theme } from '../../../utils/theme';

export const DIYBasicInfoStep: React.FC<WizardStepProps<DIYBasicInfoData>> = ({
  data,
  onDataChange,
  errors,
}) => {
  const handleDateChange = (date: Date) => {
    onDataChange({ date });
  };

  const handleMileageChange = (input: string) => {
    // Filter input to allow only whole numbers and commas
    const filtered = filterWholeNumbers(input);
    onDataChange({ mileage: filtered });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <DatePickerInput
          label="Service Date"
          value={data.date}
          onDateChange={handleDateChange}
          maximumDate={new Date()}
        />

        <Input
          label="Odometer"
          value={data.mileage}
          onChangeText={handleMileageChange}
          placeholder="75000"
          keyboardType="number-pad"
          error={errors.find(e => e.includes('mileage'))}
        />
      </View>
    </View>
  );
};

// Validation now handled by ValidationService - no local validation needed

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    gap: theme.spacing.lg,
  },
});