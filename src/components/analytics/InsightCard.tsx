// Insight Card Component
// Displays analytical insights with appropriate icons and styling
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';
import { theme } from '../../utils/theme';
import { InsightMessage } from '../../services/VehicleAnalyticsService';

interface InsightCardProps {
  insight: InsightMessage;
  onPress?: () => void;
  style?: any;
}

/**
 * InsightCard Component
 * 
 * Displays predictive insights and recommendations with automotive-themed styling.
 * Uses different colors and icons based on insight type.
 */
const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onPress,
  style
}) => {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'tip':
        return '💡';
      case 'warning':
        return '⚠️';
      case 'opportunity':
        return '🎯';
      case 'achievement':
        return '🏆';
      default:
        return 'ℹ️';
    }
  };

  const getInsightColor = () => {
    switch (insight.type) {
      case 'tip':
        return theme.colors.info; // Electric Blue
      case 'warning':
        return theme.colors.warning; // Signal Orange
      case 'opportunity':
        return theme.colors.secondary; // Racing Green
      case 'achievement':
        return theme.colors.success; // Racing Green
      default:
        return theme.colors.primary; // Engine Blue
    }
  };

  const getInsightBackgroundColor = () => {
    const color = getInsightColor();
    // Return a very light version of the color for background
    switch (insight.type) {
      case 'tip':
        return '#eff6ff'; // Very light blue
      case 'warning':
        return '#fff7ed'; // Very light orange
      case 'opportunity':
      case 'achievement':
        return '#f0fdf4'; // Very light green
      default:
        return '#eff6ff'; // Very light blue
    }
  };

  const getPriorityIndicator = () => {
    switch (insight.priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  const content = (
    <View style={[
      styles.container, 
      { 
        backgroundColor: getInsightBackgroundColor(),
        borderLeftColor: getInsightColor()
      },
      style
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Typography variant="body" style={styles.icon}>
            {getInsightIcon()}
          </Typography>
        </View>
        
        <View style={styles.titleContainer}>
          <Typography variant="body" style={[styles.title, { color: getInsightColor() }]}>
            {insight.title}
          </Typography>
          {insight.priority === 'high' && (
            <Typography variant="caption" style={styles.priorityIndicator}>
              {getPriorityIndicator()}
            </Typography>
          )}
        </View>
      </View>
      
      <Typography variant="bodySmall" style={styles.message}>
        {insight.message}
      </Typography>
      
      {insight.priority !== 'low' && (
        <View style={styles.priorityContainer}>
          <Typography variant="caption" style={[styles.priorityText, { color: getInsightColor() }]}>
            {insight.priority.toUpperCase()} PRIORITY
          </Typography>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: theme.borderRadius.md,
  },
  
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    gap: theme.spacing.sm,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  icon: {
    fontSize: 18,
  },
  
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  title: {
    flex: 1,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  priorityIndicator: {
    fontSize: 12,
  },
  
  message: {
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginLeft: 44, // Align with title (icon width + gap)
  },
  
  priorityContainer: {
    alignSelf: 'flex-end',
  },
  
  priorityText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});

export default InsightCard;