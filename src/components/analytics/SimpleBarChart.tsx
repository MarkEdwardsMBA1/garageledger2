// Simple Bar Chart Component
// Custom chart implementation using native React Native components
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../utils/theme';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
  subtitle?: string;
}

interface SimpleBarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  maxHeight?: number;
  showValues?: boolean;
  onBarPress?: (dataPoint: BarChartDataPoint, index: number) => void;
  style?: any;
}

/**
 * SimpleBarChart Component
 * 
 * Native React Native bar chart implementation with automotive theming.
 * Perfect for cost analytics and service frequency visualization.
 */
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  maxHeight = 120,
  showValues = true,
  onBarPress,
  style
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {title && (
          <Typography variant="body" style={styles.title}>
            {title}
          </Typography>
        )}
        <View style={styles.emptyState}>
          <Typography variant="caption" style={styles.emptyText}>
            No data available
          </Typography>
        </View>
      </View>
    );
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;
  
  // Ensure we have a minimum range for visualization
  const effectiveRange = valueRange === 0 ? maxValue : valueRange;
  const effectiveMax = valueRange === 0 ? maxValue * 1.2 : maxValue;

  const getBarHeight = (value: number) => {
    if (effectiveRange === 0) return maxHeight * 0.5;
    return Math.max((value / effectiveMax) * maxHeight, 4); // Minimum 4px height
  };

  const getDefaultColor = (index: number) => {
    const colors = [
      theme.colors.primary,    // Engine Blue
      theme.colors.secondary,  // Racing Green  
      theme.colors.warning,    // Signal Orange
      theme.colors.info,       // Electric Blue
      '#8B5CF6', // Purple
      '#F59E0B', // Amber
    ];
    return colors[index % colors.length];
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Typography variant="body" style={styles.title}>
          {title}
        </Typography>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartContainer}
      >
        <View style={styles.barsContainer}>
          {/* Value labels (if showing values) */}
          {showValues && (
            <View style={[styles.valuesRow, { height: 20 }]}>
              {data.map((dataPoint, index) => (
                <View key={`value-${index}`} style={styles.valueContainer}>
                  <Typography variant="caption" style={styles.valueText}>
                    {formatValue(dataPoint.value)}
                  </Typography>
                </View>
              ))}
            </View>
          )}
          
          {/* Bars */}
          <View style={[styles.barsRow, { height: maxHeight }]}>
            {data.map((dataPoint, index) => {
              const barHeight = getBarHeight(dataPoint.value);
              const barColor = dataPoint.color || getDefaultColor(index);
              
              return (
                <TouchableOpacity
                  key={`bar-${index}`}
                  style={[
                    styles.barContainer,
                    { height: maxHeight }
                  ]}
                  onPress={() => onBarPress?.(dataPoint, index)}
                  disabled={!onBarPress}
                >
                  <View style={styles.barColumn}>
                    <View style={{ flex: 1 }} />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                        }
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Labels */}
          <View style={styles.labelsRow}>
            {data.map((dataPoint, index) => (
              <View key={`label-${index}`} style={styles.labelContainer}>
                <Typography variant="caption" style={styles.labelText} numberOfLines={2}>
                  {dataPoint.label}
                </Typography>
                {dataPoint.subtitle && (
                  <Typography variant="caption" style={styles.subtitleText} numberOfLines={1}>
                    {dataPoint.subtitle}
                  </Typography>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
  },
  
  title: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  
  chartContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  
  barsContainer: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  
  valueContainer: {
    minWidth: 50,
    alignItems: 'center',
  },
  
  valueText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
  },
  
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  
  barContainer: {
    minWidth: 50,
    justifyContent: 'flex-end',
  },
  
  barColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  
  bar: {
    width: 36,
    borderRadius: theme.borderRadius.sm,
    minHeight: 4,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  
  labelsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  
  labelContainer: {
    minWidth: 50,
    alignItems: 'center',
    gap: 2,
  },
  
  labelText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
  
  subtitleText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 9,
    opacity: 0.7,
  },
  
  // Empty state
  emptyState: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default SimpleBarChart;