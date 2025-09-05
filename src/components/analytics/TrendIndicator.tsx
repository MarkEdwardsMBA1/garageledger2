// Trend Indicator Component
// Visual indicator for cost trends with automotive-themed styling
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';

interface TrendIndicatorProps {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  label: string;
  style?: any;
}

/**
 * TrendIndicator Component
 * 
 * Shows trend direction with automotive color coding:
 * - Green: Decreasing costs (good)
 * - Orange: Increasing costs (attention needed)  
 * - Blue: Stable costs (neutral)
 */
const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  direction,
  percentage,
  label,
  style
}) => {
  const getTrendColor = () => {
    switch (direction) {
      case 'decreasing':
        return theme.colors.success; // Racing Green - good trend
      case 'increasing':
        return theme.colors.warning; // Signal Orange - attention needed
      case 'stable':
        return theme.colors.info; // Electric Blue - neutral
    }
  };

  const getTrendIcon = () => {
    switch (direction) {
      case 'decreasing':
        return '↓';
      case 'increasing':
        return '↑';
      case 'stable':
        return '→';
    }
  };

  const getTrendMessage = () => {
    if (direction === 'stable' || percentage < 5) {
      return 'Stable costs';
    }
    
    const directionText = direction === 'increasing' ? 'Higher' : 'Lower';
    return `${directionText} by ${percentage.toFixed(0)}%`;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.indicatorRow}>
        <View style={[styles.iconContainer, { backgroundColor: getTrendColor() }]}>
          <Typography variant="body" style={styles.icon}>
            {getTrendIcon()}
          </Typography>
        </View>
        
        <View style={styles.textContainer}>
          <Typography variant="bodySmall" style={styles.label}>
            {label}
          </Typography>
          <Typography variant="caption" style={[styles.trendText, { color: getTrendColor() }]}>
            {getTrendMessage()}
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xs,
  },
  
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  icon: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 14,
  },
  
  textContainer: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  
  label: {
    color: theme.colors.textSecondary,
  },
  
  trendText: {
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
  },
});

export default TrendIndicator;