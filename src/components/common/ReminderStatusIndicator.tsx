// Reminder Status Indicator Components
import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { ReminderItem } from '../../services/ReminderCalculationService';

interface ReminderStatusBadgeProps {
  status: 'upcoming' | 'due' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

interface ReminderStatusIndicatorProps {
  reminder: ReminderItem;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

interface ReminderSummaryBarProps {
  summary: {
    total: number;
    overdue: number;
    due: number;
    upcoming: number;
    critical: number;
  };
  style?: ViewStyle;
}

/**
 * Simple status badge for reminder status
 */
export const ReminderStatusBadge: React.FC<ReminderStatusBadgeProps> = ({
  status,
  priority,
  count,
  size = 'md',
  style,
}) => {
  const getStatusColor = () => {
    if (priority === 'critical') return theme.colors.error;
    
    switch (status) {
      case 'overdue':
        return theme.colors.error;
      case 'due':
        return theme.colors.warning;
      case 'upcoming':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = () => {
    if (priority === 'critical') return 'Critical';
    
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due':
        return 'Due';
      case 'upcoming':
        return 'Soon';
      default:
        return '';
    }
  };

  const badgeStyle = [
    styles.badge,
    styles[`badge${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    { backgroundColor: getStatusColor() },
    style,
  ] as ViewStyle[];

  const textStyle = [
    styles.badgeText,
    styles[`badgeText${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
  ] as TextStyle[];

  return (
    <View style={badgeStyle}>
      <Typography variant="caption" style={textStyle}>
        {count ? `${count} ${getStatusText()}` : getStatusText()}
      </Typography>
    </View>
  );
};

/**
 * Detailed reminder status indicator with context
 */
export const ReminderStatusIndicator: React.FC<ReminderStatusIndicatorProps> = ({
  reminder,
  showDetails = true,
  size = 'md',
  style,
}) => {
  const getStatusColor = () => {
    if (reminder.priority === 'critical') return theme.colors.error;
    
    switch (reminder.status) {
      case 'overdue':
        return theme.colors.error;
      case 'due':
        return theme.colors.warning;
      case 'upcoming':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusMessage = () => {
    const { status, daysOverdue, dueDate, dueMileage, currentMileage, mileageOverdue } = reminder;
    
    if (status === 'overdue') {
      if (reminder.dueType === 'mileage' && mileageOverdue) {
        return `${mileageOverdue.toLocaleString()} miles overdue`;
      } else if (reminder.dueType === 'time' && daysOverdue) {
        return `${daysOverdue} days overdue`;
      } else if (reminder.dueType === 'both') {
        if (mileageOverdue && daysOverdue) {
          return `${Math.max(mileageOverdue, 0).toLocaleString()} miles, ${daysOverdue} days overdue`;
        } else if (mileageOverdue) {
          return `${mileageOverdue.toLocaleString()} miles overdue`;
        } else if (daysOverdue) {
          return `${daysOverdue} days overdue`;
        }
      }
      return 'Overdue';
    }
    
    if (status === 'due') {
      if (reminder.dueType === 'mileage' && dueMileage && currentMileage) {
        const remaining = Math.max(0, dueMileage - currentMileage);
        return remaining > 0 ? `Due in ${remaining.toLocaleString()} miles` : 'Due now';
      } else if (reminder.dueType === 'time' && dueDate) {
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        return daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : 'Due now';
      }
      return 'Due soon';
    }
    
    if (status === 'upcoming') {
      if (reminder.estimatedDueDate) {
        const today = new Date();
        const daysUntilDue = Math.ceil((reminder.estimatedDueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        return `Due in ~${daysUntilDue} days`;
      }
      return 'Upcoming';
    }
    
    return '';
  };

  return (
    <View style={[styles.indicator, style]}>
      <View style={[
        styles.indicatorDot, 
        styles[`indicatorDot${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
        { backgroundColor: getStatusColor() }
      ] as ViewStyle[]} />
      
      {showDetails && (
        <View style={styles.indicatorContent}>
          <Typography 
            variant={size === 'lg' ? 'bodySmall' : 'caption'} 
            style={[styles.indicatorText, { color: getStatusColor() }]}
          >
            {getStatusMessage()}
          </Typography>
        </View>
      )}
    </View>
  );
};

/**
 * Summary bar showing overall reminder status
 */
export const ReminderSummaryBar: React.FC<ReminderSummaryBarProps> = ({
  summary,
  style,
}) => {
  const { overdue, due, upcoming, critical } = summary;
  const hasReminders = overdue + due + upcoming > 0;

  if (!hasReminders) {
    return (
      <View style={[styles.summaryBar, styles.summaryBarGood, style]}>
        <View style={[styles.summaryDot, { backgroundColor: theme.colors.success }]} />
        <Typography variant="bodySmall" style={[styles.summaryText, { color: theme.colors.success }]}>
          All maintenance up to date
        </Typography>
      </View>
    );
  }

  const getPrimaryColor = () => {
    if (critical > 0 || overdue > 0) return theme.colors.error;
    if (due > 0) return theme.colors.warning;
    return theme.colors.info;
  };

  const getPrimaryMessage = () => {
    if (critical > 0) {
      return `${critical} critical item${critical > 1 ? 's' : ''} need attention`;
    }
    if (overdue > 0) {
      return `${overdue} overdue item${overdue > 1 ? 's' : ''}`;
    }
    if (due > 0) {
      return `${due} item${due > 1 ? 's' : ''} due soon`;
    }
    if (upcoming > 0) {
      return `${upcoming} upcoming reminder${upcoming > 1 ? 's' : ''}`;
    }
    return '';
  };

  return (
    <View style={[styles.summaryBar, style]}>
      <View style={[styles.summaryDot, { backgroundColor: getPrimaryColor() }]} />
      <Typography variant="bodySmall" style={[styles.summaryText, { color: getPrimaryColor() }]}>
        {getPrimaryMessage()}
      </Typography>
      
      {/* Additional context badges */}
      <View style={styles.summaryBadges}>
        {overdue > 0 && (
          <ReminderStatusBadge status="overdue" priority="high" count={overdue} size="sm" />
        )}
        {due > 0 && (
          <ReminderStatusBadge status="due" priority="medium" count={due} size="sm" />
        )}
        {upcoming > 0 && overdue === 0 && due === 0 && (
          <ReminderStatusBadge status="upcoming" priority="low" count={upcoming} size="sm" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Badge styles
  badge: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  badgeLg: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  
  badgeText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextSm: {
    fontSize: 10,
  },
  badgeTextMd: {
    fontSize: theme.typography.fontSize.xs,
  },
  badgeTextLg: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  // Indicator styles
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  indicatorDot: {
    borderRadius: theme.borderRadius.full,
  },
  indicatorDotSm: {
    width: 6,
    height: 6,
  },
  indicatorDotMd: {
    width: 8,
    height: 8,
  },
  indicatorDotLg: {
    width: 12,
    height: 12,
  },
  
  indicatorContent: {
    flex: 1,
  },
  
  indicatorText: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Summary bar styles
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.border,
  },
  
  summaryBarGood: {
    borderLeftColor: theme.colors.success,
    backgroundColor: `${theme.colors.success}10`,
  },
  
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  
  summaryText: {
    flex: 1,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  summaryBadges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});

export default {
  ReminderStatusBadge,
  ReminderStatusIndicator,
  ReminderSummaryBar,
};