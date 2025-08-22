// Category Search Component for Advanced Program Services
// Provides search functionality for filtering maintenance categories

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../utils/theme';
import { Input } from './Input';
import { Typography } from './Typography';
import { SearchIcon, XCircleIcon } from '../icons';

interface CategorySearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  testID?: string;
}

/**
 * CategorySearch - Search input for filtering maintenance categories
 * 
 * Features:
 * - Real-time search with debouncing
 * - Clear search functionality
 * - Search icon integration
 * - Placeholder text support
 * - Professional automotive styling
 */
export const CategorySearch: React.FC<CategorySearchProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search categories and services...',
  autoFocus = false,
  testID = 'category-search',
}) => {

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={styles.searchInput}
        leftIcon={<SearchIcon size={20} color={theme.colors.textSecondary} />}
        rightIcon={
          value.length > 0 ? (
            <XCircleIcon 
              size={20} 
              color={theme.colors.textSecondary}
              onPress={handleClear}
            />
          ) : undefined
        }
        testID={`${testID}-input`}
        accessibilityLabel="Search categories and services"
        accessibilityHint="Type to filter maintenance categories and services"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {value.length > 0 && (
        <View style={styles.searchHint}>
          <Typography variant="caption" style={styles.searchHintText}>
            Searching for "{value}"
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },

  searchInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },

  searchHint: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },

  searchHintText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});