// Fleet Summary Metrics Component
// Displays key fleet-wide metrics in a clean grid layout
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';
import { FleetOverview } from '../../services/FleetAnalyticsService';

interface FleetSummaryMetricsProps {
  fleetData: FleetOverview;
  style?: any;
}

/**
 * FleetSummaryMetrics Component
 * 
 * Displays the most important fleet metrics in a grid layout.
 * Follows automotive design patterns with proper color coding.
 */
const FleetSummaryMetrics: React.FC<FleetSummaryMetricsProps> = ({
  fleetData,
  style
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success; // Racing Green
    if (score >= 60) return theme.colors.info;    // Electric Blue
    if (score >= 40) return theme.colors.warning; // Signal Orange
    return theme.colors.error;                     // Critical Red
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.metricsGrid}>
        {/* Total Vehicles */}
        <View style={styles.metricItem}>
          <Typography variant="heading" style={[styles.metricValue, { color: theme.colors.primary }]}>
            {fleetData.totalVehicles}
          </Typography>
          <Typography variant="caption" style={styles.metricLabel}>
            {fleetData.totalVehicles === 1 ? 'Vehicle' : 'Vehicles'}
          </Typography>
        </View>

        {/* Health Score */}
        <View style={styles.metricItem}>
          <Typography 
            variant="heading" 
            style={[
              styles.metricValue, 
              { color: getHealthScoreColor(fleetData.averageHealthScore) }
            ]}
          >
            {fleetData.averageHealthScore.toFixed(0)}
          </Typography>
          <Typography variant="caption" style={styles.metricLabel}>
            Avg Health
          </Typography>
        </View>

        {/* Total Cost */}
        <View style={styles.metricItem}>
          <Typography variant="heading" style={[styles.metricValue, { color: theme.colors.text }]}>
            {formatCurrency(fleetData.totalCostAllTime)}
          </Typography>
          <Typography variant="caption" style={styles.metricLabel}>
            Total Spent
          </Typography>
        </View>

        {/* Recent Activity (conditional fourth metric) */}
        {fleetData.totalMaintenanceRecords > 0 && (
          <View style={styles.metricItem}>
            <Typography variant="heading" style={[styles.metricValue, { color: theme.colors.secondary }]}>
              {fleetData.totalMaintenanceRecords}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Services
            </Typography>
          </View>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },

  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },

  metricItem: {
    alignItems: 'center',
    minWidth: 60,
    flex: 1,
  },

  metricValue: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 24,
    lineHeight: 28,
  },

  metricLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs / 2,
    fontSize: 11,
  },

  // Health Trend Indicator
  healthTrendContainer: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  healthTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },

  trendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  healthTrendText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default FleetSummaryMetrics;