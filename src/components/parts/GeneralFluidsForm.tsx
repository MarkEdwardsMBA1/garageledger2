// General Fluids Form Component
// Single general fluid entry

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { FluidsEntryRow } from './FluidsEntryRow';
import { 
  GeneralFluidsFormData, 
  FluidEntry 
} from '../../domain/PartsAndFluids';
import { theme } from '../../utils/theme';

export interface GeneralFluidsFormProps {
  /** General fluids form data */
  data: GeneralFluidsFormData;
  
  /** Called when form data changes */
  onChange: (updatedData: GeneralFluidsFormData) => void;
  
  /** Service name for context */
  serviceName?: string;
}

export const GeneralFluidsForm: React.FC<GeneralFluidsFormProps> = ({
  data,
  onChange,
  serviceName,
}) => {
  
  // Update the single fluid
  const updateFluid = (updatedFluid: FluidEntry) => {
    onChange({
      fluid: updatedFluid,
      totalCost: updatedFluid.subtotal, // For single fluid, total = subtotal
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <Card variant="elevated" title="General Fluid Data">
      <View style={styles.container}>
        {/* Service Context */}
        {serviceName && (
          <Typography variant="caption" style={styles.serviceContext}>
            Fluid for {serviceName}
          </Typography>
        )}

        {/* Single Fluid Entry */}
        <FluidsEntryRow
          fluid={data.fluid}
          onFluidChange={updateFluid}
          index={0}
        />

        {/* Fluid Total */}
        <View style={styles.totalContainer}>
          <Typography variant="subheading" style={styles.totalLabel}>
            Fluid Cost
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.secondary.main,
    marginTop: theme.spacing.md,
  },
  totalLabel: {
    color: theme.colors.text.primary,
  },
  totalValue: {
    color: theme.colors.secondary.main,
    fontWeight: 'bold',
  },
});