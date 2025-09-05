// Fleet Status Component
// Shows fleet-wide service status summary similar to Vehicle Status
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';
import { FleetStatusSummary } from '../../services/FleetAnalyticsService';

interface FleetStatusProps {
  fleetStatus: FleetStatusSummary;
  style?: any;
}

/**
 * FleetStatus Component
 * 
 * Displays fleet-wide service status with color-coded indicators
 * for overdue, due, and upcoming services across all vehicles.
 */
const FleetStatus: React.FC<FleetStatusProps> = ({
  fleetStatus,
  style
}) => {
  const {
    totalServicesOverdue,
    totalServicesDue,
    totalServicesUpcoming,
    vehiclesWithOverdueServices,
    vehiclesUpToDate
  } = fleetStatus;

  return (
    <View style={[styles.container, style]}>
      {/* Services Status Overview */}
      <View style={styles.statusGrid}>
        {/* Services Overdue */}
        <View style={styles.statusItem}>
          <View style={styles.statusRow}>
            <Typography variant="bodySmall" style={styles.statusLabel}>
              Services Overdue:
            </Typography>
            <Typography 
              variant="body" 
              style={[
                styles.statusCount,
                { color: totalServicesOverdue > 0 ? theme.colors.error : theme.colors.success }
              ]}
            >
              {totalServicesOverdue}
            </Typography>
          </View>
        </View>

        {/* Services Due Soon */}
        {totalServicesDue > 0 && (
          <View style={styles.statusItem}>
            <View style={styles.statusRow}>
              <Typography variant="bodySmall" style={styles.statusLabel}>
                Services Due Soon:
              </Typography>
              <Typography 
                variant="body" 
                style={[styles.statusCount, { color: theme.colors.warning }]}
              >
                {totalServicesDue}
              </Typography>
            </View>
          </View>
        )}

        {/* Services Upcoming */}
        {totalServicesUpcoming > 0 && (
          <View style={styles.statusItem}>
            <View style={styles.statusRow}>
              <Typography variant="bodySmall" style={styles.statusLabel}>
                Services Upcoming:
              </Typography>
              <Typography 
                variant="body" 
                style={[styles.statusCount, { color: theme.colors.info }]}
              >
                {totalServicesUpcoming}
              </Typography>
            </View>
          </View>
        )}
      </View>

      {/* Fleet Summary */}
      {fleetStatus.vehiclesWithOverdueServices + fleetStatus.vehiclesUpToDate > 1 && (
        <View style={styles.fleetSummary}>
          <View style={styles.summaryRow}>
            <Typography variant="caption" style={styles.summaryText}>
              {vehiclesUpToDate > 0 && (
                <>
                  {vehiclesUpToDate} vehicle{vehiclesUpToDate > 1 ? 's' : ''} up to date
                  {vehiclesWithOverdueServices > 0 ? ', ' : ''}
                </>
              )}
              {vehiclesWithOverdueServices > 0 && (
                <Typography variant="caption" style={styles.overdueVehiclesText}>
                  {vehiclesWithOverdueServices} need{vehiclesWithOverdueServices === 1 ? 's' : ''} attention
                </Typography>
              )}
            </Typography>
          </View>
        </View>
      )}

      {/* All Up to Date State */}
      {totalServicesOverdue === 0 && totalServicesDue === 0 && totalServicesUpcoming === 0 && (
        <View style={styles.upToDateState}>
          <Typography variant="bodySmall" style={styles.upToDateText}>
            ✅ All vehicles are up to date
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },

  // Status Grid
  statusGrid: {
    gap: theme.spacing.sm,
  },

  statusItem: {
    // Minimal spacing for compact display
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusLabel: {
    color: theme.colors.text,
    flex: 1,
  },

  statusCount: {
    fontWeight: theme.typography.fontWeight.semibold,
    minWidth: 24,
    textAlign: 'right',
  },

  // Fleet Summary
  fleetSummary: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryText: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  overdueVehiclesText: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Up to Date State
  upToDateState: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#f0fdf4', // Very light green
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },

  upToDateText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default FleetStatus;