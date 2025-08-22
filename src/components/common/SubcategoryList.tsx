// Subcategory List Component for Advanced Program Services
// Displays maintenance subcategories when a category is expanded

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { CheckIcon } from '../icons';
import { getSubcategoryKeys, getSubcategoryName, getComponents } from '../../types/MaintenanceCategories';
import { AdvancedServiceConfiguration } from '../../types';

interface SubcategoryListProps {
  categoryKey: string;
  selectedServices: Set<string>;
  onToggleService: (serviceKey: string) => void;
  serviceConfigs?: Map<string, AdvancedServiceConfiguration>;
  onSaveServiceConfig?: (config: AdvancedServiceConfiguration) => void;
  onRemoveServiceConfig?: (serviceKey: string) => void;
  onConfigureService?: (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected?: boolean) => void;
  testID?: string;
}

interface ServiceItem {
  key: string;
  name: string;
  components?: {
    parts?: string[];
    fluids?: string[];
    labor?: string[];
  };
}

/**
 * SubcategoryList - Displays maintenance subcategories within an expanded category
 * 
 * Features:
 * - Lists all subcategories for a given category
 * - Shows component details (parts, fluids, labor)
 * - Service selection with checkboxes
 * - Professional automotive styling
 * - Integration with MaintenanceCategories system
 */
export const SubcategoryList: React.FC<SubcategoryListProps> = ({
  categoryKey,
  selectedServices,
  onToggleService,
  serviceConfigs = new Map(),
  onSaveServiceConfig,
  onRemoveServiceConfig,
  onConfigureService,
  testID = 'subcategory-list',
}) => {

  // Get subcategories for this category
  const subcategoryKeys = getSubcategoryKeys(categoryKey);
  
  // Build service items with component details
  const services: ServiceItem[] = subcategoryKeys.map(subKey => ({
    key: `${categoryKey}.${subKey}`,
    name: getSubcategoryName(categoryKey, subKey),
    components: getComponents(categoryKey, subKey),
  }));

  const handleServiceToggle = (serviceKey: string, serviceName: string) => {
    const wasSelected = selectedServices.has(serviceKey);
    
    if (wasSelected) {
      // If already selected, open config to reconfigure
      if (onConfigureService) {
        onConfigureService(serviceKey, serviceName, categoryKey, false);
      }
    } else {
      // If not selected, select it and open config
      onToggleService(serviceKey);
      if (onConfigureService) {
        onConfigureService(serviceKey, serviceName, categoryKey, true);
      }
    }
  };

  const formatComponents = (components: ServiceItem['components']): string => {
    const parts = components?.parts || [];
    const fluids = components?.fluids || [];
    const labor = components?.labor || [];
    
    const allComponents = [...parts, ...fluids, ...labor];
    
    if (allComponents.length === 0) return '';
    if (allComponents.length <= 2) return allComponents.join(', ');
    
    return `${allComponents.slice(0, 2).join(', ')} +${allComponents.length - 2} more`;
  };

  if (services.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Typography variant="caption" style={styles.emptyText}>
          No services available in this category
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {services.map((service, index) => {
        const isSelected = selectedServices.has(service.key);
        const isConfigured = serviceConfigs.has(service.key);
        const componentText = formatComponents(service.components);
        
        return (
          <View
            key={service.key}
            style={[
              styles.serviceItem,
              isSelected && styles.serviceItemSelected,
              isConfigured && styles.serviceItemConfigured,
            ]}
          >
            {/* Main Service Row */}
            <TouchableOpacity
              style={styles.serviceContent}
              onPress={() => handleServiceToggle(service.key, service.name)}
              testID={`${testID}-service-${index}`}
              accessibilityRole="button"
              accessibilityLabel={isSelected ? `Tap to reconfigure ${service.name}` : `Tap to select and configure ${service.name}`}
            >
              {/* Checkbox */}
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <CheckIcon size={16} color={theme.colors.surface} />
                )}
              </View>

              {/* Service Details */}
              <View style={styles.serviceDetails}>
                <Typography 
                  variant="subheading" 
                  style={[styles.serviceName, isSelected && styles.serviceNameSelected]}
                >
                  {service.name}
                </Typography>
                
                {componentText && (
                  <Typography variant="caption" style={styles.componentText}>
                    {componentText}
                  </Typography>
                )}

                {/* Configuration Status */}
                {isConfigured && (
                  <Typography variant="caption" style={styles.configuredText}>
                    ✓ Configured
                  </Typography>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  emptyContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },

  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  serviceItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },

  serviceItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
  },

  serviceItemConfigured: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },

  serviceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, // Align with text
  },

  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },

  serviceDetails: {
    flex: 1,
  },

  serviceName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },

  serviceNameSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  componentText: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },

  configuredText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: theme.typography.letterSpacing.wide,
  },

});