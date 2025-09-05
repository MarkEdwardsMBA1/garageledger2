// Fleet Cost Summary Component
// Shows fleet-wide cost insights and comparisons
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import TrendIndicator from '../analytics/TrendIndicator';
import { theme } from '../../utils/theme';
import { FleetCostComparison } from '../../services/FleetAnalyticsService';

interface FleetCostSummaryProps {
  fleetCostData: {
    totalFleetCost: number;
    averageCostPerVehicle: number;
    mostExpensiveVehicle: FleetCostComparison | null;
    mostEfficientVehicle: FleetCostComparison | null;
    fleetCostTrend: 'increasing' | 'decreasing' | 'stable';
    potentialSavings: number;
  };
  style?: any;
}

/**
 * FleetCostSummary Component
 * 
 * Displays fleet-wide cost insights including totals, averages,
 * vehicle comparisons, and potential optimization opportunities.
 */
const FleetCostSummary: React.FC<FleetCostSummaryProps> = (props) => {
  const { fleetCostData, style } = props;
  // Ensure fleetCostData exists and has valid structure
  if (!fleetCostData || typeof fleetCostData !== 'object') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Typography variant="bodySmall" style={styles.emptyText}>
            No cost data available
          </Typography>
        </View>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const {
    totalFleetCost = 0,
    averageCostPerVehicle = 0,
    mostExpensiveVehicle = null,
    mostEfficientVehicle = null,
    fleetCostTrend = 'stable',
    potentialSavings = 0
  } = fleetCostData;

  if (!totalFleetCost || totalFleetCost === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Typography variant="bodySmall" style={styles.emptyText}>
            No cost data available
          </Typography>
          <Typography variant="caption" style={styles.emptyHint}>
            Add costs to maintenance logs to see fleet spending insights
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Cost Overview */}
      <View style={styles.costOverview}>
        <View style={styles.costMetric}>
          <Typography variant="heading" style={styles.totalCost}>
            {formatCurrency(totalFleetCost)}
          </Typography>
          <Typography variant="caption" style={styles.costLabel}>
            Total Fleet Cost
          </Typography>
        </View>
        
        <View style={styles.costMetric}>
          <Typography variant="body" style={styles.averageCost}>
            {formatCurrency(averageCostPerVehicle)}
          </Typography>
          <Typography variant="caption" style={styles.costLabel}>
            Average per Vehicle
          </Typography>
        </View>
      </View>

      {/* Cost Trend */}
      <TrendIndicator
        direction={fleetCostTrend}
        percentage={15} // Simplified - in real implementation, calculate actual percentage
        label="Fleet Cost Trend"
        style={styles.trendIndicator}
      />

      {/* Vehicle Comparisons */}
      {(mostExpensiveVehicle || mostEfficientVehicle) && (
        <View style={styles.comparisons}>
          {mostExpensiveVehicle && (
            <View style={styles.comparisonItem}>
              <Typography variant="bodySmall" style={styles.comparisonLabel}>
                Highest Cost:
              </Typography>
              <Typography variant="bodySmall" style={styles.comparisonVehicle}>
                {mostExpensiveVehicle.vehicleName}
              </Typography>
              <Typography variant="bodySmall" style={styles.comparisonValue}>
                {formatCurrency(mostExpensiveVehicle.totalCost)}
              </Typography>
            </View>
          )}

          {mostEfficientVehicle && mostEfficientVehicle.costPerMile && (
            <View style={styles.comparisonItem}>
              <Typography variant="bodySmall" style={styles.comparisonLabel}>
                Most Efficient:
              </Typography>
              <Typography variant="bodySmall" style={styles.comparisonVehicle}>
                {mostEfficientVehicle.vehicleName}
              </Typography>
              <Typography variant="bodySmall" style={styles.comparisonValue}>
                ${mostEfficientVehicle.costPerMile?.toFixed(2) || '0.00'}/mi
              </Typography>
            </View>
          )}
        </View>
      )}

      {/* Potential Savings */}
      {potentialSavings > 0 && (
        <View style={styles.savingsContainer}>
          <View style={styles.savingsHeader}>
            <Typography variant="caption" style={styles.savingsIcon}>
              💡
            </Typography>
            <Typography variant="bodySmall" style={styles.savingsTitle}>
              Optimization Opportunity
            </Typography>
          </View>
          <Typography variant="caption" style={styles.savingsText}>
            Synchronizing service schedules could save ~{formatCurrency(potentialSavings)} annually
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },

  // Cost Overview
  costOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  costMetric: {
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

  // Trend Indicator
  trendIndicator: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Vehicle Comparisons
  comparisons: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },

  comparisonLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
  },

  comparisonVehicle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 2,
    textAlign: 'center',
  },

  comparisonValue: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },

  // Savings Opportunity
  savingsContainer: {
    padding: theme.spacing.sm,
    backgroundColor: '#f0fdf4', // Very light green
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
    gap: theme.spacing.xs,
  },

  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  savingsIcon: {
    fontSize: 12,
  },

  savingsTitle: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },

  savingsText: {
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginLeft: 20, // Align with title
  },

  // Empty state
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  emptyHint: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FleetCostSummary;