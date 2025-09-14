// Motor Oil Form Component
// Specialized motor oil with viscosity

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { MotorOilEntryRow } from './MotorOilEntryRow';
import { 
  MotorOilFluidsFormData, 
  MotorOilEntry 
} from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface MotorOilFormProps {
  /** Motor oil form data */
  data: MotorOilFluidsFormData;
  
  /** Called when form data changes */
  onChange: (updatedData: MotorOilFluidsFormData) => void;
  
  /** Service name for context */
  serviceName?: string;
}

export const MotorOilForm: React.FC<MotorOilFormProps> = ({
  data,
  onChange,
  serviceName,
}) => {
  
  // Update the motor oil
  const updateMotorOil = (updatedMotorOil: MotorOilEntry) => {
    onChange({
      fluid: updatedMotorOil,
      totalCost: updatedMotorOil.subtotal, // For single fluid, total = subtotal
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <Card variant="elevated" title="Motor Oil Data">
      <View style={styles.container}>
        {/* Service Context */}
        {serviceName && (
          <Typography variant="caption" style={styles.serviceContext}>
            Motor oil for {serviceName}
          </Typography>
        )}

        {/* Motor Oil Instructions */}
        <View style={styles.instructionsContainer}>
          <Typography variant="body" style={styles.instructions}>
            Motor oil requires viscosity specification. Check your owner's manual for the recommended viscosity (e.g., 0W20, 5W30).
          </Typography>
        </View>

        {/* Motor Oil Entry */}
        <MotorOilEntryRow
          motorOil={data.fluid}
          onMotorOilChange={updateMotorOil}
          index={0}
        />

        {/* Motor Oil Total */}
        <View style={styles.totalContainer}>
          <Typography variant="subheading" style={styles.totalLabel}>
            Motor Oil Cost
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
    backgroundColor: theme.colors.accent.light,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.main,
  },
  instructions: {
    color: theme.colors.text.primary,
    lineHeight: 20,
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.accent.main,
    marginTop: theme.spacing.md,
  },
  totalLabel: {
    color: theme.colors.text.primary,
  },
  totalValue: {
    color: theme.colors.accent.main,
    fontWeight: 'bold',
  },
});