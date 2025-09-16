// Category Grid Component for Advanced Program Services
// Manages layout and display of category cards with search and filtering

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { CategoryCard } from './CategoryCard';
import { EmptyState } from './ErrorState';
import { CategoryDisplayData } from '../../utils/CategoryIconMapping';
import { AdvancedServiceConfiguration } from '../../types';
import { ServiceFormData } from '../forms/ServiceFormRouter';

interface CategoryGridProps {
  categories: CategoryDisplayData[];
  expandedCategories?: Set<string>;
  selectedServices?: Set<string>;
  onCategoryPress?: (categoryKey: string) => void;
  onToggleExpand?: (categoryKey: string) => void;
  onToggleService?: (serviceKey: string) => void;
  serviceConfigs?: Map<string, AdvancedServiceConfiguration>;
  onSaveServiceConfig?: (config: AdvancedServiceConfiguration) => void;
  onRemoveServiceConfig?: (serviceKey: string) => void;
  onConfigureService?: (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected?: boolean) => void;
  serviceFormData?: Record<string, ServiceFormData>;
  loading?: boolean;
  searchQuery?: string;
  showEmptyState?: boolean;
  testID?: string;
}

/**
 * CategoryGrid - Displays maintenance categories in a responsive grid layout
 * 
 * Features:
 * - Responsive 2-column grid on larger screens
 * - Single column on smaller screens  
 * - Empty state handling
 * - Search result feedback
 * - Loading state support
 * - Accessibility support
 */
export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  expandedCategories = new Set(),
  selectedServices = new Set(),
  onCategoryPress,
  onToggleExpand,
  onToggleService,
  serviceConfigs,
  onSaveServiceConfig,
  onRemoveServiceConfig,
  onConfigureService,
  serviceFormData,
  loading = false,
  searchQuery,
  showEmptyState = true,
  testID = 'category-grid',
}) => {

  // Calculate total services across all categories
  const totalServices = categories.reduce((sum, category) => sum + category.totalServices, 0);

  // Empty state when no categories
  if (!loading && categories.length === 0 && showEmptyState) {
    return (
      <View style={styles.container} testID={`${testID}-empty`}>
        <EmptyState
          title={searchQuery ? 'No Categories Found' : 'No Categories Available'}
          message={
            searchQuery 
              ? `No categories match "${searchQuery}". Try a different search term.`
              : 'Categories will appear here when available.'
          }
        />
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.container} testID={`${testID}-loading`}>
        <Typography variant="body" style={styles.loadingText}>
          Loading categories...
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Search Results Summary */}
      {searchQuery && (
        <View style={styles.searchSummary}>
          <Typography variant="caption" style={styles.searchSummaryText}>
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} found
            {totalServices > 0 && ` • ${totalServices} total services`}
          </Typography>
        </View>
      )}

      {/* Category Statistics */}
      {!searchQuery && categories.length > 0 && (
        <View style={styles.statsContainer}>
          <Typography variant="caption" style={styles.statsText}>
            {categories.length} categories • {totalServices} services available
          </Typography>
        </View>
      )}

      {/* Category Cards */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        testID={`${testID}-scroll`}
      >
        <View style={styles.grid}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.key}
              category={category}
              isExpanded={expandedCategories.has(category.key)}
              onPress={onCategoryPress}
              onToggleExpand={onToggleExpand}
              selectedServices={selectedServices}
              onToggleService={onToggleService}
              serviceConfigs={serviceConfigs}
              onSaveServiceConfig={onSaveServiceConfig}
              onRemoveServiceConfig={onRemoveServiceConfig}
              onConfigureService={onConfigureService}
              serviceFormData={serviceFormData}
              testID={`${testID}-card-${index}`}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchSummary: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },

  searchSummaryText: {
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },

  statsContainer: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },

  statsText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.normal,
  },

  loadingText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },

  scrollContainer: {
    flex: 1,
  },

  grid: {
    paddingBottom: theme.spacing.lg,
  },
});