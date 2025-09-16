// Hierarchical Maintenance Category Picker Component
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Button } from './Button';
import { Typography } from './Typography';
import { CategoryGrid } from './CategoryGrid';
import { getOrderedCategoryData } from '../../utils/CategoryIconMapping';
import { SelectedService, AdvancedServiceConfiguration, ServiceConfiguration } from '../../types';
import { getSubcategoryName } from '../../types/MaintenanceCategories';
import { ServiceConfigBottomSheet } from './ServiceConfigBottomSheet';
import { ServiceFormRouter, ServiceFormData } from '../forms/ServiceFormRouter';
import { serviceNeedsForm } from '../../domain/ServiceFormMapping';

interface MaintenanceCategoryPickerProps {
  /** Previously selected services */
  selectedServices?: SelectedService[];
  /** Called when services are selected */
  onSelectionComplete: (services: SelectedService[], configs?: { [key: string]: AdvancedServiceConfiguration }, serviceFormData?: Record<string, ServiceFormData>) => void;
  /** Called when selection is cancelled */
  onCancel?: () => void;
  /** Whether picker is visible */
  visible: boolean;
  /** Disable interaction */
  disabled?: boolean;
  /** Whether to allow multiple service selection */
  allowMultiple?: boolean;
  /** Enable detailed configuration for parts/fluids/costs */
  enableConfiguration?: boolean;
  /** Service type for configuration UI (shop = simple, diy = advanced) */
  serviceType?: 'shop' | 'diy';
  /** Initial parts/fluids form data */
  initialServiceFormData?: Record<string, ServiceFormData>;
}

/**
 * Maintenance category picker with CategoryCard consistency
 * Uses same visual components as Create Program Advanced tab
 */
export const MaintenanceCategoryPicker: React.FC<MaintenanceCategoryPickerProps> = ({
  selectedServices = [],
  onSelectionComplete,
  onCancel,
  visible,
  disabled = false,
  allowMultiple = true,
  enableConfiguration = false,
  serviceType = 'diy',
  initialServiceFormData = {},
}) => {
  const { t } = useTranslation();
  
  // Convert SelectedService[] to Set<string> for compatibility with CategoryGrid
  const initialSelectedSet = new Set(
    selectedServices.map(service => `${service.categoryKey}.${service.subcategoryKey}`)
  );
  
  const [selectedServiceKeys, setSelectedServiceKeys] = useState<Set<string>>(initialSelectedSet);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Configuration state (only when enableConfiguration is true)
  const [serviceConfigs, setServiceConfigs] = useState<Map<string, AdvancedServiceConfiguration>>(new Map());
  const [showConfigSheet, setShowConfigSheet] = useState(false);
  const [configService, setConfigService] = useState<{
    serviceKey: string;
    serviceName: string;
    categoryName: string;
    wasJustSelected?: boolean;
  } | null>(null);

  // Parts/fluids form state (for DIY serviceType)
  const [serviceFormData, setServiceFormData] = useState<Record<string, ServiceFormData>>(initialServiceFormData);
  const [activeService, setActiveService] = useState<SelectedService | null>(null);

  // Handle category expand/collapse
  const handleToggleExpand = (categoryKey: string) => {
    const updated = new Set(expandedCategories);
    if (updated.has(categoryKey)) {
      updated.delete(categoryKey);
    } else {
      updated.add(categoryKey);
    }
    setExpandedCategories(updated);
  };

  // Handle service selection/deselection
  const handleToggleService = (serviceKey: string) => {
    console.log('[DEBUG] MaintenanceCategoryPicker handleToggleService:', { 
      serviceKey, 
      currentlySelected: selectedServiceKeys.has(serviceKey),
      allowMultiple,
      selectedServiceKeys: Array.from(selectedServiceKeys)
    });
    
    const updated = new Set(selectedServiceKeys);
    
    if (allowMultiple) {
      // Multiple selection: toggle the service
      if (updated.has(serviceKey)) {
        console.log('[DEBUG] Removing service from selection');
        updated.delete(serviceKey);
      } else {
        console.log('[DEBUG] Adding service to selection');
        updated.add(serviceKey);
      }
    } else {
      // Single selection: replace with new selection
      console.log('[DEBUG] Single selection mode, replacing selection');
      updated.clear();
      updated.add(serviceKey);
    }
    
    console.log('[DEBUG] Updated selection:', Array.from(updated));
    setSelectedServiceKeys(updated);
  };

  // Convert selected service keys back to SelectedService objects
  const convertToSelectedServices = (): SelectedService[] => {
    return Array.from(selectedServiceKeys).map(serviceKey => {
      const [categoryKey, subcategoryKey] = serviceKey.split('.');
      const serviceName = getSubcategoryName(categoryKey, subcategoryKey);
      
      return {
        categoryKey,
        subcategoryKey,
        serviceName,
        serviceId: serviceKey, // categoryKey.subcategoryKey
      };
    });
  };

  // Handle service configuration
  const handleConfigureService = (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected: boolean = false) => {
    console.log('[DEBUG] handleConfigureService:', { serviceKey, serviceName, serviceType, wasJustSelected });
    console.log('[DEBUG] serviceNeedsForm check:', serviceNeedsForm(serviceKey));
    
    // For DIY services, check if service needs parts/fluids form
    if (serviceType === 'diy' && serviceNeedsForm(serviceKey)) {
      console.log('[DEBUG] Opening parts/fluids form for DIY service');
      
      // Convert serviceKey back to SelectedService format
      const [categoryKey, subcategoryKey] = serviceKey.split('.');
      const selectedService: SelectedService = {
        categoryKey,
        subcategoryKey, 
        serviceName,
        serviceId: serviceKey,
      };
      
      console.log('[DEBUG] Setting activeService:', selectedService);
      setActiveService(selectedService);
      return;
    }
    
    console.log('[DEBUG] Not opening parts/fluids form - serviceType:', serviceType, 'needsForm:', serviceNeedsForm(serviceKey));
    
    // Fall back to original configuration for non-DIY or services without forms
    if (!enableConfiguration) return;
    
    setConfigService({ serviceKey, serviceName, categoryName, wasJustSelected });
    setShowConfigSheet(true);
  };

  // Handle configuration save
  const handleConfigurationSave = (config: ServiceConfiguration) => {
    if (configService) {
      // Since ServiceConfigBottomSheet returns AdvancedServiceConfiguration, cast it
      const advancedConfig = config as AdvancedServiceConfiguration;
      setServiceConfigs(prev => new Map(prev).set(configService.serviceKey, advancedConfig));
    }
    setShowConfigSheet(false);
    setConfigService(null);
  };

  // Handle configuration cancel
  const handleConfigurationCancel = () => {
    // If this was a service that was just selected, deselect it
    if (configService?.wasJustSelected) {
      setSelectedServiceKeys(prev => {
        const updated = new Set(prev);
        updated.delete(configService.serviceKey);
        return updated;
      });
    }
    
    setShowConfigSheet(false);
    setConfigService(null);
  };

  // Handle service form save (parts/fluids data)
  const handleServiceFormSave = (serviceId: string, formData: ServiceFormData) => {
    console.log('[DEBUG] Service form saved:', { serviceId, formData });
    
    // Store the form data
    setServiceFormData(prev => ({
      ...prev,
      [serviceId]: formData,
    }));
    
    // Close the form modal (return to service picker)
    setActiveService(null);
  };

  // Handle service form cancel
  const handleServiceFormCancel = () => {
    console.log('[DEBUG] Service form cancelled');
    
    // If this was a newly selected service, deselect it
    if (activeService) {
      const serviceKey = activeService.serviceId;
      setSelectedServiceKeys(prev => {
        const updated = new Set(prev);
        updated.delete(serviceKey);
        return updated;
      });
    }
    
    // Close the form modal
    setActiveService(null);
  };

  // Create adapter for ServiceConfigBottomSheet
  const createServiceAdapter = (serviceKey: string, serviceName: string, categoryName: string) => {
    return {
      id: serviceKey,
      name: serviceName,
      category: categoryName,
      description: `${serviceName} maintenance`,
      defaultMileage: 10000,
      defaultTimeValue: 12,
      defaultTimeUnit: 'months',
      intervalType: 'dual'
    };
  };

  // Handle save - convert selections and close
  const handleSave = () => {
    console.log('[DEBUG] MaintenanceCategoryPicker handleSave:', { 
      selectedServiceKeys: Array.from(selectedServiceKeys),
      serviceFormData,
      serviceType
    });
    
    const services = convertToSelectedServices();
    // Convert Map to plain object for navigation serialization
    const configs = enableConfiguration ? Object.fromEntries(serviceConfigs) : undefined;
    
    // Include serviceFormData for DIY services
    onSelectionComplete(services, configs, serviceFormData);
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset to initial state
    setSelectedServiceKeys(initialSelectedSet);
    setExpandedCategories(new Set());
    if (onCancel) {
      onCancel();
    }
  };

  // Get category display data for CategoryGrid
  const categoryData = getOrderedCategoryData();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Button
            title={t('common.cancel', 'Cancel')}
            variant="text"
            onPress={handleCancel}
            style={styles.headerButton}
          />
          <Typography variant="title" style={styles.modalTitle}>
            {serviceType === 'shop' 
              ? t('maintenance.selectShopServices', 'Select Shop Services')
              : t('maintenance.selectDIYServices', 'Select DIY Services')
            }
          </Typography>
          <View style={styles.headerButton} />
        </View>

        <View style={styles.content}>
          <ScrollView 
            style={styles.categoryContainer} 
            showsVerticalScrollIndicator={false}
          >
            <CategoryGrid
              categories={categoryData}
              expandedCategories={expandedCategories}
              onToggleExpand={handleToggleExpand}
              selectedServices={selectedServiceKeys}
              onToggleService={handleToggleService}
              serviceConfigs={enableConfiguration ? serviceConfigs : undefined}
              onConfigureService={enableConfiguration ? handleConfigureService : undefined}
              serviceFormData={serviceFormData}
            />
          </ScrollView>
        </View>
        
        {/* Bottom Button Bar */}
        <View style={styles.bottomButtonBar}>
          <Button
            title={t('common.cancel', 'Cancel')}
            variant="text"
            onPress={handleCancel}
            style={styles.bottomButton}
          />
          <Button
            title={t('common.save', 'Save')}
            variant="primary"
            onPress={handleSave}
            disabled={selectedServiceKeys.size === 0}
            style={styles.bottomButton}
          />
        </View>
      </View>

      {/* Service Configuration Bottom Sheet */}
      {enableConfiguration && configService && (
        <ServiceConfigBottomSheet
          visible={showConfigSheet}
          service={createServiceAdapter(
            configService.serviceKey,
            configService.serviceName,
            configService.categoryName
          )}
          existingConfig={serviceConfigs.get(configService.serviceKey)}
          onSave={handleConfigurationSave}
          onCancel={handleConfigurationCancel}
          serviceType={serviceType}
        />
      )}

      {/* Service Parts/Fluids Form Router (DIY Services) */}
      {serviceType === 'diy' && activeService && (
        <ServiceFormRouter
          service={activeService}
          visible={!!activeService}
          initialData={serviceFormData[activeService.serviceId]?.data}
          onSave={handleServiceFormSave}
          onCancel={handleServiceFormCancel}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    width: 80, // Fixed width instead of minWidth for perfect centering
  },
  modalTitle: {
    color: theme.colors.surface,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categoryContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  bottomButtonBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
});

export default MaintenanceCategoryPicker;