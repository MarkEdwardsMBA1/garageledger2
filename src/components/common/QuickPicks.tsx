// Quick Picks Component for common interval values
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../utils/theme';

interface QuickPicksProps {
  values: number[];
  onSelect: (value: number) => void;
  style?: ViewStyle;
  label?: string;
}

export const QuickPicks: React.FC<QuickPicksProps> = ({
  values,
  onSelect,
  style,
  label = "Quick picks:",
}) => {
  const formatValue = (value: number): string => {
    return value.toLocaleString();
  };

  return (
    <View style={[styles.container, style]}>
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>
      
      <View style={styles.picksContainer}>
        {values.map((value, index) => (
          <TouchableOpacity
            key={value}
            style={styles.pick}
            onPress={() => onSelect(value)}
            activeOpacity={0.7}
          >
            <Typography variant="caption" style={styles.pickText}>
              {formatValue(value)}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  picksContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pick: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface, // White background
    borderWidth: 1,
    borderColor: theme.colors.primary, // Blue outline
  },
  pickText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});