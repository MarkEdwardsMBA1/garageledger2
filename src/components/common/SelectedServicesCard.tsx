// Selected Services Card - Unified component for Shop and DIY modes
// Displays services with calculated costs using CalculationService

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../utils/theme';
import { Card } from './Card';
import { Typography } from './Typography';
import { CalculationService } from '../../domain/CalculationService';
import { SelectedService, AdvancedServiceConfiguration } from '../../types';
import { ServiceFormData } from '../forms/ServiceFormRouter';

export interface SelectedServicesCardProps {
  /** Selected services to display */
  services: SelectedService[];

  /** Service configurations containing parts/fluids data (DIY mode) */
  serviceConfigs?: Map<string, AdvancedServiceConfiguration>;

  /** Service form data containing detailed parts/fluids information (DIY mode) */
  serviceFormData?: Record<string, ServiceFormData>;

  /** Mode determines cost calculation method */
  mode: 'shop' | 'diy';

  /** Total cost for shop mode (user-entered) */
  shopTotalCost?: string;

  /** Custom styling */
  style?: ViewStyle;

  /** Optional title override */
  title?: string;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Unified Selected Services Card
 * Shows consistent service list with calculated costs for both Shop and DIY modes
 */
export const SelectedServicesCard: React.FC<SelectedServicesCardProps> = ({
  services,
  serviceConfigs,
  serviceFormData,
  mode,
  shopTotalCost = '0',
  style,
  title = 'Services Selected',
  testID = 'selected-services-card',
}) => {
  console.log('🔧 SelectedServicesCard rendered with mode:', mode, 'services:', services.length);

  /**
   * Calculate cost for individual service based on mode
   */
  const calculateServiceCost = (service: SelectedService): number => {
    if (mode === 'shop') {
      // Shop mode: divide total cost equally among services
      const totalCost = CalculationService.parseCurrencyString(shopTotalCost);
      return services.length > 0 ? totalCost / services.length : 0;
    } else {
      // DIY mode: calculate from parts/fluids data
      const serviceId = service.serviceId || `${service.categoryKey}.${service.subcategoryKey}`;
      const formData = serviceFormData?.[serviceId];

      if (!formData) return 0;

      let partsTotal = 0;
      let fluidsTotal = 0;

      // Calculate based on form data type
      if (formData.type === 'parts' && 'parts' in formData.data) {
        partsTotal = CalculationService.calculatePartsTotal(formData.data.parts || []);
      } else if (formData.type === 'fluids' && 'fluids' in formData.data) {
        const fluids = formData.data.fluids as any[];
        fluidsTotal = fluids?.reduce((sum: number, fluid: any) => {
          return sum + CalculationService.calculateFluidTotal(
            fluid.quantity || '0',
            fluid.unitCost || '0'
          );
        }, 0) || 0;
      } else if (formData.type === 'parts_and_fluids' && 'parts' in formData.data && 'fluids' in formData.data) {
        partsTotal = CalculationService.calculatePartsTotal(formData.data.parts || []);
        const fluids = formData.data.fluids as any[];
        fluidsTotal = fluids?.reduce((sum: number, fluid: any) => {
          return sum + CalculationService.calculateFluidTotal(
            fluid.quantity || '0',
            fluid.unitCost || '0'
          );
        }, 0) || 0;
      }

      return partsTotal + fluidsTotal;
    }
  };

  /**
   * Calculate total cost across all services
   */
  const calculateTotalCost = (): number => {
    if (mode === 'shop') {
      // Shop mode: use user-entered total cost
      return CalculationService.parseCurrencyString(shopTotalCost);
    } else {
      // DIY mode: sum all service costs
      return services.reduce((sum, service) => {
        return sum + calculateServiceCost(service);
      }, 0);
    }
  };

  /**
   * Format service cost for display
   */
  const formatServiceCost = (service: SelectedService): string => {
    const cost = calculateServiceCost(service);

    if (cost === 0 && mode === 'diy') {
      return 'No parts/fluids';
    }

    return CalculationService.formatCurrency(cost);
  };

  const totalCost = calculateTotalCost();
  const hasServices = services.length > 0;

  if (!hasServices) {
    return null;
  }

  return (
    <Card variant="elevated" style={{...styles.card, ...style}} testID={testID}>
      <View style={styles.header}>
        <Typography variant="heading" style={styles.title}>
          {title} ({services.length})
        </Typography>

        {mode === 'shop' && (
          <Typography variant="bodySmall" style={styles.modeIndicator}>
            Cost distributed equally
          </Typography>
        )}

        {mode === 'diy' && (
          <Typography variant="bodySmall" style={styles.modeIndicator}>
            Calculated from parts & fluids
          </Typography>
        )}
      </View>

      <View style={styles.servicesList}>
        {services.map((service, index) => {
          const serviceCost = calculateServiceCost(service);

          return (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Typography variant="body" style={styles.serviceName}>
                  • {service.serviceName}
                </Typography>
              </View>

              <View style={styles.serviceCost}>
                <Typography
                  variant="body"
                  style={serviceCost === 0 ? styles.zeroCostText : styles.costText}
                >
                  {formatServiceCost(service)}
                </Typography>
              </View>
            </View>
          );
        })}
      </View>

      {/* Total Cost Summary */}
      <View style={styles.totalSection}>
        <View style={styles.totalDivider} />
        <View style={styles.totalRow}>
          <Typography variant="bodyLarge" style={styles.totalLabel}>
            Total Cost:
          </Typography>
          <Typography variant="bodyLarge" style={styles.totalAmount}>
            {CalculationService.formatCurrency(totalCost)}
          </Typography>
        </View>

        {mode === 'diy' && services.length > 1 && (
          <Typography variant="bodySmall" style={styles.calculationNote}>
            Sum of all service costs
          </Typography>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
  },

  header: {
    marginBottom: theme.spacing.md,
  },

  title: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  modeIndicator: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  servicesList: {
    marginBottom: theme.spacing.md,
  },

  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  serviceInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },

  serviceName: {
    color: theme.colors.text,
    lineHeight: 20,
  },

  serviceCost: {
    alignItems: 'flex-end',
    minWidth: 80,
  },

  costText: {
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'right',
  },

  zeroCostText: {
    color: theme.colors.textSecondary,
    fontWeight: '400',
    fontSize: theme.typography.fontSize.sm,
  },

  totalSection: {
    marginTop: theme.spacing.sm,
  },

  totalDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },

  totalLabel: {
    color: theme.colors.text,
    fontWeight: '600',
  },

  totalAmount: {
    color: theme.colors.primary, // Engine Blue for total
    fontWeight: '700',
    fontSize: theme.typography.fontSize.lg,
  },

  calculationNote: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

