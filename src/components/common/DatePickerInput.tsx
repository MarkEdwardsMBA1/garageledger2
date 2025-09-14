// Reusable DatePickerInput Component - DRY implementation for all date selection needs
import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from './Typography';
import { Button } from './Button';
import { theme } from '../../utils/theme';

interface DatePickerInputProps {
  /** Current selected date */
  value: Date;
  /** Called when date changes */
  onDateChange: (date: Date) => void;
  /** Input label */
  label?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Maximum selectable date */
  maximumDate?: Date;
  /** Minimum selectable date */
  minimumDate?: Date;
  /** Custom date formatting function */
  formatDate?: (date: Date) => string;
  /** Custom styles */
  style?: any;
  /** Whether the input is disabled */
  disabled?: boolean;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onDateChange,
  label,
  required = false,
  maximumDate,
  minimumDate,
  formatDate,
  style,
  disabled = false,
}) => {
  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Typography variant="body" style={styles.label}>
          {label}{required ? ' *' : ''}
        </Typography>
      )}
      
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={handleDatePickerChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});

export default DatePickerInput;