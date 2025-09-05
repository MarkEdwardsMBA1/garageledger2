// Recent Fleet Activity Component
// Displays timeline of recent maintenance across all vehicles
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';
import { FleetActivity } from '../../services/FleetAnalyticsService';

interface RecentFleetActivityProps {
  activities: FleetActivity[];
  onActivityPress?: (activity: FleetActivity) => void;
  maxItems?: number;
  style?: any;
}

/**
 * RecentFleetActivity Component
 * 
 * Shows a timeline of recent maintenance activities across the fleet.
 * Each item is tappable for navigation to detailed views.
 */
const RecentFleetActivity: React.FC<RecentFleetActivityProps> = (props) => {
  const {
    activities,
    onActivityPress,
    maxItems = 5,
    style
  } = props;
  // Ensure activities is an array and contains valid data
  if (!activities || !Array.isArray(activities) || activities.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Typography variant="bodySmall" style={styles.emptyText}>
            No recent maintenance activity
          </Typography>
          <Typography variant="caption" style={styles.emptyHint}>
            Log maintenance to see activity timeline
          </Typography>
        </View>
      </View>
    );
  }

  const displayedActivities = activities.slice(0, maxItems).filter(activity => 
    activity && 
    activity.vehicleName && 
    activity.maintenanceLog && 
    activity.maintenanceLog.title &&
    typeof activity.daysAgo === 'number'
  );

  const formatTimeAgo = (daysAgo: number) => {
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  const getActivityColor = (daysAgo: number) => {
    if (daysAgo === 0) return theme.colors.success;   // Racing Green - today
    if (daysAgo <= 7) return theme.colors.primary;    // Engine Blue - recent
    if (daysAgo <= 30) return theme.colors.info;      // Electric Blue - this month
    return theme.colors.textSecondary;                // Gray - older
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.timeline}>
        {displayedActivities.map((activity, index) => (
          <TouchableOpacity
            key={`${activity.vehicleId}-${activity.maintenanceLog.id}`}
            style={[
              styles.timelineItem,
              index < displayedActivities.length - 1 && styles.timelineItemBorder
            ]}
            onPress={() => onActivityPress?.(activity)}
            disabled={!onActivityPress}
          >
            
            <View style={styles.timelineContent}>
              <Typography variant="body" style={styles.vehicleTitle}>
                {activity.vehicleName}
              </Typography>
              
              <Typography variant="bodySmall" style={styles.serviceName}>
                {activity.maintenanceLog.title}
              </Typography>
              
              <View style={styles.activityDetails}>
                <Typography variant="caption" style={styles.timeAgo}>
                  {formatTimeAgo(activity.daysAgo)}
                </Typography>
                
                <Typography variant="caption" style={styles.separator}>
                  •
                </Typography>
                
                <Typography variant="caption" style={styles.mileage}>
                  {activity.maintenanceLog.mileage ? activity.maintenanceLog.mileage.toLocaleString() : '0'} mi
                </Typography>
                
                {activity.maintenanceLog.totalCost && activity.maintenanceLog.totalCost > 0 && (
                  <>
                    <Typography variant="caption" style={styles.separator}>
                      •
                    </Typography>
                    <Typography variant="caption" style={styles.cost}>
                      ${activity.maintenanceLog.totalCost.toFixed(0)}
                    </Typography>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {activities.length > maxItems && (
        <View style={styles.moreActivities}>
          <Typography variant="caption" style={styles.moreText}>
            +{activities.length - maxItems} more activities
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

  timeline: {
    gap: theme.spacing.sm,
  },

  timelineItem: {
    paddingBottom: theme.spacing.sm,
  },

  timelineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },

  timelineMarker: {
    alignItems: 'center',
    width: 16,
    paddingTop: 2, // Align with first line of text
  },

  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  markerLine: {
    width: 1,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.xs,
  },

  timelineContent: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },

  vehicleTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },

  serviceName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  activityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },

  timeAgo: {
    color: theme.colors.textSecondary,
  },

  separator: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },

  mileage: {
    color: theme.colors.textSecondary,
  },

  cost: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // More activities indicator
  moreActivities: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  moreText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
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

export default RecentFleetActivity;