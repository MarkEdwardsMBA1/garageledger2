// Simple Recent Activity Component - Following VehiclesScreen patterns
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';

interface SimpleRecentActivityProps {
  activities?: any[];
  style?: any;
}

/**
 * SimpleRecentActivity - Defensive, proven pattern
 * Uses simple display logic without complex data processing
 */
const SimpleRecentActivity: React.FC<SimpleRecentActivityProps> = ({ activities = [], style }) => {
  if (!activities || activities.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Typography variant="bodySmall" style={styles.emptyText}>
          No recent maintenance activity
        </Typography>
        <Typography variant="caption" style={styles.emptyHint}>
          Log maintenance to see your activity timeline
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {activities.slice(0, 3).map((activity, index) => (
        <View key={index} style={styles.activityItem}>
          <Typography variant="body" style={styles.vehicleName}>
            {activity?.vehicleName || 'Unknown Vehicle'}
          </Typography>
          <Typography variant="bodySmall" style={styles.serviceName}>
            {activity?.maintenanceLog?.title || 'Service'}
          </Typography>
          <Typography variant="caption" style={styles.details}>
            {activity?.daysAgo === 0 ? 'Today' : 
             activity?.daysAgo === 1 ? 'Yesterday' : 
             `${activity?.daysAgo || 0} days ago`} • {activity?.maintenanceLog?.mileage || 0} mi
          </Typography>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },

  activityItem: {
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.xs / 2,
  },

  vehicleName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },

  serviceName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  details: {
    color: theme.colors.textSecondary,
  },

  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },

  emptyHint: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SimpleRecentActivity;