// Chips Group Component for selection options
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../utils/theme';

interface ChipOption {
  key: string;
  label: string;
}

interface ChipsGroupProps {
  options: ChipOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

export const ChipsGroup: React.FC<ChipsGroupProps> = ({
  options,
  selectedKey,
  onSelect,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.key === selectedKey;
        
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <Typography
              variant="caption"
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
              ]}
            >
              {option.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  chipTextSelected: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});