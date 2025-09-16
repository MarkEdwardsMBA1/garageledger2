// Subcategory List Component for Advanced Program Services
// Displays maintenance subcategories when a category is expanded

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { CheckIcon } from '../icons';
import { AddCustomServiceModal } from './AddCustomServiceModal';
import { getSubcategoryKeys, getSubcategoryName, getComponents, getServiceConfigType } from '../../types/MaintenanceCategories';
import { serviceNeedsForm } from '../../domain/ServiceFormMapping';
import { AdvancedServiceConfiguration } from '../../types';

interface SubcategoryListProps {
  categoryKey: string;
  selectedServices: Set<string>;
  onToggleService: (serviceKey: string) => void;
  serviceConfigs?: Map<string, AdvancedServiceConfiguration>;
  onSaveServiceConfig?: (config: AdvancedServiceConfiguration) => void;
  onRemoveServiceConfig?: (serviceKey: string) => void;
  onConfigureService?: (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected?: boolean) => void;
  serviceFormData?: Record<string, any>; // Parts/fluids form data
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
  serviceFormData = {},
  testID = 'subcategory-list',
}) => {
  // State for custom service modal
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);

  // Get subcategories for this category
  const subcategoryKeys = getSubcategoryKeys(categoryKey);
  
  // Build service items with component details
  const baseServices: ServiceItem[] = subcategoryKeys.map(subKey => ({
    key: `${categoryKey}.${subKey}`,
    name: getSubcategoryName(categoryKey, subKey),
    components: getComponents(categoryKey, subKey),
  }));

  // Extract created custom services if this is the custom-service category
  const customServices: ServiceItem[] = [];
  const regularServices: ServiceItem[] = [];

  if (categoryKey === 'custom-service') {
    // Find all selected services that start with 'custom-service.' but aren't the base selector
    const createdCustomServices = Array.from(selectedServices)
      .filter(serviceKey => 
        serviceKey.startsWith('custom-service.') && 
        serviceKey !== 'custom-service.custom'
      )
      .sort(); // Sort alphabetically for consistent order (creation order would require timestamps)

    // Create service items for created custom services
    createdCustomServices.forEach(serviceKey => {
      const config = serviceConfigs?.get(serviceKey);
      const customServiceName = config?.displayName || 
        serviceKey.replace('custom-service.', '').replace(/-/g, ' ')
          .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      
      customServices.push({
        key: serviceKey,
        name: customServiceName,
        components: undefined, // Custom services don't have predefined components
      });
    });

    // Separate the base "Custom Service" selector from other services
    baseServices.forEach(service => {
      if (service.key === 'custom-service.custom') {
        regularServices.push(service);
      } else {
        regularServices.push(service);
      }
    });
  } else {
    regularServices.push(...baseServices);
  }

  // Combine: created custom services first, then regular services (with Custom Service selector at end)
  const services: ServiceItem[] = [...customServices, ...regularServices];

  const handleServiceToggle = (serviceKey: string, serviceName: string) => {
    console.log('[DEBUG] Service toggle clicked:', { serviceKey, serviceName, wasSelected: selectedServices.has(serviceKey) });
    
    // Special handling for the base custom service selector
    if (serviceKey === 'custom-service.custom') {
      const wasSelected = selectedServices.has(serviceKey);
      console.log('[DEBUG] Custom service selector:', { wasSelected });
      
      if (wasSelected) {
        // If already selected, deselect it (simple toggle behavior)
        console.log('[DEBUG] Deselecting custom service');
        onToggleService(serviceKey);
      } else {
        // If not selected, show custom service modal
        console.log('[DEBUG] Opening custom service modal');
        setShowCustomServiceModal(true);
      }
      return;
    }

    // Created custom services and standard services both use regular handling
    const wasSelected = selectedServices.has(serviceKey);
    console.log('[DEBUG] Standard service toggle:', { serviceKey, wasSelected });
    
    if (wasSelected) {
      // Always allow deselection by clicking selected service
      console.log('[DEBUG] Service was selected, deselecting it');
      onToggleService(serviceKey);
    } else {
      // If not selected, select it
      console.log('[DEBUG] Service was not selected, selecting it');
      onToggleService(serviceKey);
      
      // Check if this service needs parts/fluids form (consistent with MaintenanceCategoryPicker)
      if (onConfigureService && serviceNeedsForm(serviceKey)) {
        console.log('[DEBUG] Opening configuration for newly selected service:', serviceKey);
        onConfigureService(serviceKey, serviceName, categoryKey, true);
      }
    }
  };

  // Handle custom service save from modal
  const handleCustomServiceSave = (customServiceName: string) => {
    // Create unique service key
    const customServiceKey = `custom-service.${customServiceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Add to selected services
    onToggleService(customServiceKey);
    
    // Close modal
    setShowCustomServiceModal(false);
    
    // Open interval configuration with the new service name
    if (onConfigureService) {
      onConfigureService(customServiceKey, customServiceName, 'Custom Service Reminder', true);
    }
  };

  // Handle custom service cancel from modal
  const handleCustomServiceCancel = () => {
    setShowCustomServiceModal(false);
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
        const hasFormData = serviceFormData && serviceFormData[service.key];
        const isCustomServiceSelector = service.key === 'custom-service.custom';
        const isCreatedCustomService = service.key.startsWith('custom-service.') && service.key !== 'custom-service.custom';
        
        return (
          <View
            key={service.key}
            style={[
              styles.serviceItem,
              isSelected && styles.serviceItemSelected,
              isConfigured && styles.serviceItemConfigured,
            ]}
          >
            {/* Standard Service Row */}
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
                  variant="body"
                  style={[styles.serviceName, isSelected && styles.serviceNameSelected]}
                >
                  {service.name}
                </Typography>
                
                {/* Show "Custom" label for created custom services */}
                {isCreatedCustomService && (
                  <Typography variant="label" style={styles.customServiceLabel}>
                    Custom
                  </Typography>
                )}

                {/* Configuration Status */}
                {isConfigured && (
                  <Typography variant="label" style={styles.configuredText}>
                    ✓ Configured
                  </Typography>
                )}
                
                {/* Form Data Status */}
                {hasFormData && (
                  <Typography variant="label" style={styles.formCompleteText}>
                    ✓ Details Added
                  </Typography>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Custom Service Modal */}
      <AddCustomServiceModal
        visible={showCustomServiceModal}
        onSave={handleCustomServiceSave}
        onCancel={handleCustomServiceCancel}
      />
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
  },

  serviceNameSelected: {
    color: theme.colors.primary,
  },


  configuredText: {
    color: theme.colors.success,
    letterSpacing: theme.typography.letterSpacing.wide,
  },

  formCompleteText: {
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },

  customServiceLabel: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },

});