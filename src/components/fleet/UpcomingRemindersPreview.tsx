// Upcoming Reminders Preview Component
// Shows next services due across the fleet with priority indicators
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';
import { FleetReminder } from '../../services/FleetAnalyticsService';

interface UpcomingRemindersPreviewProps {
  reminders: FleetReminder[];
  onReminderPress?: (reminder: FleetReminder) => void;
  maxItems?: number;
  style?: any;
}

/**
 * UpcomingRemindersPreview Component
 * 
 * Shows a preview of upcoming maintenance reminders across all vehicles.
 * Color-coded by priority with clear visual hierarchy.
 */
const UpcomingRemindersPreview: React.FC<UpcomingRemindersPreviewProps> = ({
  reminders,
  onReminderPress,
  maxItems = 4,
  style
}) => {
  if (reminders.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Typography variant="bodySmall" style={styles.emptyText}>
            No upcoming maintenance reminders
          </Typography>
          <Typography variant="caption" style={styles.emptyHint}>
            All vehicles are up to date
          </Typography>
        </View>
      </View>
    );
  }

  const displayedReminders = reminders.slice(0, maxItems);

  const getPriorityColor = (priority: 'overdue' | 'due' | 'upcoming') => {
    switch (priority) {
      case 'overdue':
        return theme.colors.error;   // Critical Red
      case 'due':
        return theme.colors.warning; // Signal Orange
      case 'upcoming':
        return theme.colors.info;    // Electric Blue
    }
  };

  const getPriorityIcon = (priority: 'overdue' | 'due' | 'upcoming') => {
    switch (priority) {
      case 'overdue':
        return '🔴';
      case 'due':
        return '🟡';
      case 'upcoming':
        return '🔵';
    }
  };

  const formatDueDate = (reminder: FleetReminder) => {
    const { daysUntilDue, dueDate } = reminder;
    
    if (daysUntilDue < 0) {
      const overdueDays = Math.abs(daysUntilDue);
      return `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
    }
    
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue < 7) return `Due in ${daysUntilDue} days`;
    if (daysUntilDue < 30) return `Due in ${Math.ceil(daysUntilDue / 7)} weeks`;
    
    return `Due ${dueDate.toLocaleDateString()}`;
  };

  const priorityOrder = { overdue: 0, due: 1, upcoming: 2 };
  const sortedReminders = displayedReminders.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.remindersList}>
        {sortedReminders.map((reminder, index) => (
          <TouchableOpacity
            key={`${reminder.vehicleId}-${reminder.serviceName}`}
            style={[
              styles.reminderItem,
              { borderLeftColor: getPriorityColor(reminder.priority) }
            ]}
            onPress={() => onReminderPress?.(reminder)}
            disabled={!onReminderPress}
          >
            <View style={styles.reminderHeader}>
              <View style={styles.priorityRow}>
                <Typography variant="caption" style={styles.priorityIcon}>
                  {getPriorityIcon(reminder.priority)}
                </Typography>
                <Typography variant="body" style={styles.serviceName}>
                  {reminder.serviceName}
                </Typography>
              </View>
              
              <Typography 
                variant="bodySmall" 
                style={[
                  styles.dueDate, 
                  { color: getPriorityColor(reminder.priority) }
                ]}
              >
                {formatDueDate(reminder)}
              </Typography>
            </View>
            
            <Typography variant="bodySmall" style={styles.vehicleName}>
              {reminder.vehicleName}
            </Typography>
            
            {reminder.dueMileage && (
              <Typography variant="caption" style={styles.mileageInfo}>
                Due at {reminder.dueMileage.toLocaleString()} miles
              </Typography>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {reminders.length > maxItems && (
        <View style={styles.moreReminders}>
          <Typography variant="caption" style={styles.moreText}>
            +{reminders.length - maxItems} more reminders
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

  remindersList: {
    gap: theme.spacing.sm,
  },

  reminderItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },

  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },

  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },

  priorityIcon: {
    fontSize: 12,
  },

  serviceName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },

  dueDate: {
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'right',
  },

  vehicleName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: 20, // Align with service name (icon + gap)
  },

  mileageInfo: {
    color: theme.colors.textSecondary,
    marginLeft: 20, // Align with service name
    fontStyle: 'italic',
  },

  // More reminders indicator
  moreReminders: {
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
    color: theme.colors.success,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default UpcomingRemindersPreview;