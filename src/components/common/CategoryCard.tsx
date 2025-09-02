// Category Card Component for Advanced Program Services
// Displays maintenance categories with icons, service counts, and expand functionality

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { CategoryDisplayData } from '../../utils/CategoryIconMapping';
import { ChevronDownIcon, ChevronRightIcon } from '../icons';
import { SubcategoryList } from './SubcategoryList';
import { AdvancedServiceConfiguration } from '../../types';

interface CategoryCardProps {
  category: CategoryDisplayData;
  isExpanded?: boolean;
  onPress?: (categoryKey: string) => void;
  onToggleExpand?: (categoryKey: string) => void;
  selectedServices?: Set<string>;
  onToggleService?: (serviceKey: string) => void;
  serviceConfigs?: Map<string, AdvancedServiceConfiguration>;
  onSaveServiceConfig?: (config: AdvancedServiceConfiguration) => void;
  onRemoveServiceConfig?: (serviceKey: string) => void;
  onConfigureService?: (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected?: boolean) => void;
  showServices?: boolean;
  testID?: string;
}

/**
 * CategoryCard - Displays a maintenance category with professional automotive theming
 * 
 * Features:
 * - Custom icon with strategic color coding
 * - Service count display
 * - Expandable functionality
 * - Professional shadows and depth
 * - Accessibility support
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded = false,
  onPress,
  onToggleExpand,
  selectedServices = new Set(),
  onToggleService,
  serviceConfigs,
  onSaveServiceConfig,
  onRemoveServiceConfig,
  onConfigureService,
  showServices = true,
  testID,
}) => {
  const { config, totalServices, key } = category;
  const IconComponent = config.icon;

  const handlePress = () => {
    if (onPress) {
      onPress(key);
    }
    // Also handle expansion when the entire card is pressed
    if (onToggleExpand) {
      onToggleExpand(key);
    }
  };

  const handleExpandToggle = () => {
    if (onToggleExpand) {
      onToggleExpand(key);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isExpanded && styles.cardExpanded,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${config.name} category with ${totalServices} services`}
    >
      {/* Main Card Content */}
      <View style={styles.cardContent}>
        {/* Icon Section */}
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <IconComponent 
            size={24} 
            color={config.color}
          />
        </View>

        {/* Category Info */}
        <View style={styles.categoryInfo}>
          <Typography variant="subheading" style={[styles.categoryName, { color: config.color }]}>
            {config.name}
          </Typography>
          
          {showServices && (
            <Typography variant="caption" style={styles.serviceCount}>
              {totalServices} {totalServices === 1 ? 'service' : 'services'}
            </Typography>
          )}
        </View>

        {/* Expand Indicator */}
        {onToggleExpand && (
          <View style={styles.expandButton}>
            {isExpanded ? (
              <ChevronDownIcon size={20} color={theme.colors.textSecondary} />
            ) : (
              <ChevronRightIcon size={20} color={theme.colors.textSecondary} />
            )}
          </View>
        )}
      </View>

      {/* Category Accent Line */}
      <View style={[styles.accentLine, { backgroundColor: config.color }]} />
      
      {/* Expanded Subcategories */}
      {isExpanded && onToggleService && (
        <SubcategoryList
          categoryKey={key}
          selectedServices={selectedServices}
          onToggleService={onToggleService}
          serviceConfigs={serviceConfigs}
          onSaveServiceConfig={onSaveServiceConfig}
          onRemoveServiceConfig={onRemoveServiceConfig}
          onConfigureService={onConfigureService}
          testID={`${testID}-subcategories`}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  cardExpanded: {
    borderColor: theme.colors.primary,
    ...theme.shadows.md,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },

  categoryInfo: {
    flex: 1,
  },

  categoryName: {
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
    letterSpacing: theme.typography.letterSpacing.wide,
  },

  serviceCount: {
    color: theme.colors.textSecondary,
    letterSpacing: theme.typography.letterSpacing.normal,
  },

  expandButton: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },

  accentLine: {
    height: 3,
    width: '100%',
    opacity: 0.3,
  },
});