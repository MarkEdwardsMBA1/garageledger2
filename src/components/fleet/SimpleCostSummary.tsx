// Simple Cost Summary Component - Following VehiclesScreen patterns
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';

interface SimpleCostSummaryProps {
  costData?: any;
  style?: any;
}

/**
 * SimpleCostSummary - Defensive, proven pattern
 * Uses simple display logic without complex data processing
 */
const SimpleCostSummary: React.FC<SimpleCostSummaryProps> = ({ costData, style }) => {
  if (!costData) {
    return (
      <View style={[styles.container, style]}>
        <Typography variant="bodySmall" style={styles.emptyText}>
          No cost data available
        </Typography>
        <Typography variant="caption" style={styles.emptyHint}>
          Add costs to maintenance logs to see spending insights
        </Typography>
      </View>
    );
  }

  const formatCurrency = (amount: number = 0) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Total Fleet Cost */}
      <View style={styles.costItem}>
        <Typography variant="heading" style={styles.totalCost}>
          {formatCurrency(costData?.totalFleetCost)}
        </Typography>
        <Typography variant="caption" style={styles.costLabel}>
          Total Fleet Cost
        </Typography>
      </View>

      {/* Average per Vehicle */}
      <View style={styles.costItem}>
        <Typography variant="body" style={styles.averageCost}>
          {formatCurrency(costData?.averageCostPerVehicle)}
        </Typography>
        <Typography variant="caption" style={styles.costLabel}>
          Average per Vehicle
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  costItem: {
    alignItems: 'center',
    flex: 1,
  },

  totalCost: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 20,
  },

  averageCost: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  costLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs / 2,
  },

  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  emptyHint: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});

export default SimpleCostSummary;