// Service Configuration Bottom Sheet
// Handles detailed parts, fluids, costs configuration for maintenance services

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { SettingsIcon, TrashIcon, CheckIcon } from '../icons';
import { ServiceConfiguration, AdvancedServiceConfiguration } from '../../types';
import { getComponents, getServiceConfigType, ServiceConfigType } from '../../types/MaintenanceCategories';

interface CuratedService {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultMileage: number;
  defaultTimeValue: number;
  defaultTimeUnit: string;
  intervalType: string;
}

interface ServiceConfigBottomSheetProps {
  visible: boolean;
  service: CuratedService;
  existingConfig?: ServiceConfiguration;
  onSave: (config: ServiceConfiguration) => void;
  onCancel: () => void;
  serviceType?: 'shop' | 'diy'; // Determines UI complexity
}

// Simple interface for Shop Service
interface SimplePartItem {
  name: string;
  cost: string;
  notes: string;
}

interface SimpleFluidItem {
  name: string;
  quantity: string;
  cost: string;
  notes: string;
}

// Detailed interfaces for DIY Service (matching original structure)
interface DetailedPartItem {
  name: string;
  brand: string;
  partNumber: string;
  quantity: string;
  unitCost: string;
  supplier: string;
}

interface DetailedFluidItem {
  name: string;
  type: string;
  brand: string;
  viscosity: string;
  capacity: string;
  unit: string;
  cost: string;
}

/**
 * ServiceConfigBottomSheet - Modal for configuring detailed service information
 * Allows users to add parts, fluids, labor costs, and notes for maintenance services
 */
export const ServiceConfigBottomSheet: React.FC<ServiceConfigBottomSheetProps> = ({
  visible,
  service,
  existingConfig,
  onSave,
  onCancel,
  serviceType = 'diy', // Default to DIY for backward compatibility
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Configuration state
  const [mileageInterval, setMileageInterval] = useState<string>('');
  const [timeInterval, setTimeInterval] = useState<string>('');
  const [reminderAdvanceDays, setReminderAdvanceDays] = useState<string>('30');
  const [notes, setNotes] = useState<string>('');
  
  // Parts and fluids state (type depends on serviceType)
  const [parts, setParts] = useState<SimplePartItem[] | DetailedPartItem[]>([]);
  const [fluids, setFluids] = useState<SimpleFluidItem[] | DetailedFluidItem[]>([]);
  const [laborCost, setLaborCost] = useState<string>('');
  const [shopNotes, setShopNotes] = useState<string>('');

  // Get service configuration type
  const getConfigType = (): ServiceConfigType => {
    const [categoryKey, subcategoryKey] = service.id.includes('.') 
      ? service.id.split('.') 
      : [service.id, ''];
    return getServiceConfigType(categoryKey, subcategoryKey);
  };

  // Initialize form with existing config
  useEffect(() => {
    if (existingConfig) {
      setMileageInterval(existingConfig.mileageValue?.toString() || '');
      setTimeInterval(existingConfig.timeValue?.toString() || '');
      if ('reminderOffset' in existingConfig) {
        setReminderAdvanceDays(existingConfig.reminderOffset?.toString() || '30');
      }
      if ('description' in existingConfig) {
        setNotes(existingConfig.description || '');
      }
      
      if ('components' in existingConfig && existingConfig.components?.parts) {
        setParts(existingConfig.components.parts.map(partName => ({
          name: partName,
          cost: '',
          notes: ''
        })));
      }
      
      if ('components' in existingConfig && existingConfig.components?.fluids) {
        setFluids(existingConfig.components.fluids.map(fluidName => ({
          name: fluidName,
          quantity: '',
          cost: '',
          notes: ''
        })));
      }
      
      if ('costEstimate' in existingConfig && existingConfig.costEstimate) {
        setLaborCost(existingConfig.costEstimate.toString());
      }
    } else {
      // Initialize with service defaults
      setMileageInterval(service.defaultMileage?.toString() || '');
      setTimeInterval(service.defaultTimeValue?.toString() || '');
      setReminderAdvanceDays('30');
      setNotes('');
      
      // Initialize with predefined components if available
      const serviceKey = service.id;
      const [categoryKey, subcategoryKey] = serviceKey.includes('.') 
        ? serviceKey.split('.') 
        : [serviceKey, ''];
        
      if (categoryKey && subcategoryKey) {
        const components = getComponents(categoryKey, subcategoryKey);
        if (components) {
          if (components.parts) {
            setParts(components.parts.map(partName => ({
              name: partName,
              cost: '',
              notes: ''
            })));
          }
          if (components.fluids) {
            setFluids(components.fluids.map(fluidName => ({
              name: fluidName,
              quantity: '',
              cost: '',
              notes: ''
            })));
          }
        }
      }
    }
  }, [existingConfig, service, visible]);

  // Handle adding new part
  const addPart = () => {
    if (serviceType === 'diy') {
      const newDetailedPart: DetailedPartItem = {
        name: '',
        brand: '',
        partNumber: '',
        quantity: '1',
        unitCost: '',
        supplier: ''
      };
      setParts(prev => [...(prev as DetailedPartItem[]), newDetailedPart]);
    } else {
      const newSimplePart: SimplePartItem = {
        name: '',
        cost: '',
        notes: ''
      };
      setParts(prev => [...(prev as SimplePartItem[]), newSimplePart]);
    }
  };

  // Handle removing part
  const removePart = (index: number) => {
    setParts(prev => prev.filter((_, i) => i !== index));
  };

  // Handle adding new fluid
  const addFluid = () => {
    if (serviceType === 'diy') {
      const newDetailedFluid: DetailedFluidItem = {
        name: '',
        type: '',
        brand: '',
        viscosity: '',
        capacity: '',
        unit: 'quarts',
        cost: ''
      };
      setFluids(prev => [...(prev as DetailedFluidItem[]), newDetailedFluid]);
    } else {
      const newSimpleFluid: SimpleFluidItem = {
        name: '',
        quantity: '',
        cost: '',
        notes: ''
      };
      setFluids(prev => [...(prev as SimpleFluidItem[]), newSimpleFluid]);
    }
  };

  // Handle removing fluid
  const removeFluid = (index: number) => {
    setFluids(prev => prev.filter((_, i) => i !== index));
  };

  // Render Shop Service Form (Simple)
  const renderShopServiceForm = () => (
    <>
      {/* Shop Information */}
      <Card style={styles.section}>
        <Typography variant="subheading" style={styles.sectionTitle}>
          Shop Information
        </Typography>
        
        <Input
          label="Shop Name"
          value={shopNotes} // Using shopNotes as shop name for now
          onChangeText={setShopNotes}
          placeholder="e.g., Jiffy Lube, Local Auto Shop"
        />
        
        <Input
          label="Contact Info (Optional)"
          value={notes} // Using notes field for contact info
          onChangeText={setNotes}
          placeholder="Address, phone number, email"
          multiline
          numberOfLines={2}
          style={styles.inputSpacing}
        />
      </Card>

      {/* Service Information */}
      <Card style={styles.section}>
        <Typography variant="subheading" style={styles.sectionTitle}>
          Service Information
        </Typography>
        
        <Input
          label="Total Cost ($)"
          value={laborCost}
          onChangeText={setLaborCost}
          keyboardType="numeric"
          placeholder="89.99"
        />
        
        <Input
          label="Notes (Optional)"
          value={mileageInterval} // Using mileageInterval field for service notes
          onChangeText={setMileageInterval}
          placeholder="Service details, warranty info, recommendations..."
          multiline
          numberOfLines={3}
          style={styles.inputSpacing}
        />
      </Card>
    </>
  );

  // Render DIY Service Form (Three variants based on service type)
  const renderDIYServiceForm = () => {
    const configType = getConfigType();
    
    return (
      <>
        {/* Parts Section - Show for parts-only and parts-fluids */}
        {(configType === 'parts-only' || configType === 'parts-fluids') && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="subheading" style={styles.sectionTitle}>
                Parts Used
              </Typography>
              <TouchableOpacity onPress={addPart} style={styles.addButton}>
                <CheckIcon size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            {parts.map((part, index) => {
              const detailedPart = part as DetailedPartItem;
              return (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Typography variant="label" style={styles.itemNumber}>
                      Part {index + 1}
                    </Typography>
                    <TouchableOpacity onPress={() => removePart(index)} style={styles.removeButton}>
                      <TrashIcon size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <Input
                    label="Part Name"
                    value={detailedPart.name}
                    onChangeText={(text) => setParts(prev => (prev as DetailedPartItem[]).map((p, i) => 
                      i === index ? { ...p, name: text } : p
                    ))}
                    placeholder="e.g., Oil Filter"
                  />
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Brand"
                      value={detailedPart.brand}
                      onChangeText={(text) => setParts(prev => (prev as DetailedPartItem[]).map((p, i) => 
                        i === index ? { ...p, brand: text } : p
                      ))}
                      placeholder="Mobil 1"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Part Number"
                      value={detailedPart.partNumber}
                      onChangeText={(text) => setParts(prev => (prev as DetailedPartItem[]).map((p, i) => 
                        i === index ? { ...p, partNumber: text } : p
                      ))}
                      placeholder="M1-110A"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Quantity"
                      value={detailedPart.quantity}
                      onChangeText={(text) => setParts(prev => (prev as DetailedPartItem[]).map((p, i) => 
                        i === index ? { ...p, quantity: text } : p
                      ))}
                      placeholder="1"
                      keyboardType="numeric"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Unit Cost ($)"
                      value={detailedPart.unitCost}
                      onChangeText={(text) => setParts(prev => (prev as DetailedPartItem[]).map((p, i) => 
                        i === index ? { ...p, unitCost: text } : p
                      ))}
                      placeholder="12.99"
                      keyboardType="numeric"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <Input
                    label="Supplier (Optional)"
                    value={detailedPart.supplier}
                    onChangeText={(text) => setParts(prev => (prev as DetailedPartItem[]).map((p, i) => 
                      i === index ? { ...p, supplier: text } : p
                    ))}
                    placeholder="AutoZone, Amazon, etc."
                    style={styles.inputSpacing}
                  />
                </View>
              );
            })}
            
            {parts.length === 0 && (
              <Typography variant="body" style={styles.emptyText}>
                No parts added. Tap + to add parts for this service.
              </Typography>
            )}
          </Card>
        )}

        {/* Fluids Section - Show for fluids-only and parts-fluids */}
        {(configType === 'fluids-only' || configType === 'parts-fluids') && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="subheading" style={styles.sectionTitle}>
                Fluids Used
              </Typography>
              <TouchableOpacity onPress={addFluid} style={styles.addButton}>
                <CheckIcon size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            {fluids.map((fluid, index) => {
              const detailedFluid = fluid as DetailedFluidItem;
              return (
                <View key={index} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Typography variant="label" style={styles.itemNumber}>
                      Fluid {index + 1}
                    </Typography>
                    <TouchableOpacity onPress={() => removeFluid(index)} style={styles.removeButton}>
                      <TrashIcon size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <Input
                    label="Fluid Name"
                    value={detailedFluid.name}
                    onChangeText={(text) => setFluids(prev => (prev as DetailedFluidItem[]).map((f, i) => 
                      i === index ? { ...f, name: text } : f
                    ))}
                    placeholder="e.g., Motor Oil"
                  />
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Brand"
                      value={detailedFluid.brand}
                      onChangeText={(text) => setFluids(prev => (prev as DetailedFluidItem[]).map((f, i) => 
                        i === index ? { ...f, brand: text } : f
                      ))}
                      placeholder="Mobil 1"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Viscosity"
                      value={detailedFluid.viscosity}
                      onChangeText={(text) => setFluids(prev => (prev as DetailedFluidItem[]).map((f, i) => 
                        i === index ? { ...f, viscosity: text } : f
                      ))}
                      placeholder="5W-30"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <View style={styles.partFluidRow}>
                    <Input
                      label="Capacity"
                      value={detailedFluid.capacity}
                      onChangeText={(text) => setFluids(prev => (prev as DetailedFluidItem[]).map((f, i) => 
                        i === index ? { ...f, capacity: text } : f
                      ))}
                      placeholder="5"
                      keyboardType="numeric"
                      style={styles.partFluidInput}
                    />
                    <Input
                      label="Unit"
                      value={detailedFluid.unit}
                      onChangeText={(text) => setFluids(prev => (prev as DetailedFluidItem[]).map((f, i) => 
                        i === index ? { ...f, unit: text } : f
                      ))}
                      placeholder="quarts"
                      style={styles.partFluidInput}
                    />
                  </View>
                  
                  <Input
                    label="Cost ($)"
                    value={detailedFluid.cost}
                    onChangeText={(text) => setFluids(prev => (prev as DetailedFluidItem[]).map((f, i) => 
                      i === index ? { ...f, cost: text } : f
                    ))}
                    placeholder="24.99"
                    keyboardType="numeric"
                    style={styles.inputSpacing}
                  />
                </View>
              );
            })}
            
            {fluids.length === 0 && (
              <Typography variant="body" style={styles.emptyText}>
                No fluids added. Tap + to add fluids for this service.
              </Typography>
            )}
          </Card>
        )}
      </>
    );
  };

  // Calculate total cost
  const getTotalCost = (): number => {
    let partsTotal = 0;
    let fluidsTotal = 0;
    
    if (serviceType === 'diy') {
      // DIY: Calculate from quantity * unitCost for parts, cost for fluids
      partsTotal = parts.reduce((sum, part) => {
        const detailedPart = part as DetailedPartItem;
        const quantity = parseFloat(detailedPart.quantity) || 1;
        const unitCost = parseFloat(detailedPart.unitCost) || 0;
        return sum + (quantity * unitCost);
      }, 0);
      
      fluidsTotal = fluids.reduce((sum, fluid) => {
        const detailedFluid = fluid as DetailedFluidItem;
        return sum + (parseFloat(detailedFluid.cost) || 0);
      }, 0);
    } else {
      // Shop: Use direct cost values
      partsTotal = parts.reduce((sum, part) => {
        const simplePart = part as SimplePartItem;
        return sum + (parseFloat(simplePart.cost) || 0);
      }, 0);
      
      fluidsTotal = fluids.reduce((sum, fluid) => {
        const simpleFluid = fluid as SimpleFluidItem;
        return sum + (parseFloat(simpleFluid.cost) || 0);
      }, 0);
    }
    
    const labor = parseFloat(laborCost) || 0;
    return partsTotal + fluidsTotal + labor;
  };

  // Handle save
  const handleSave = () => {
    // Validate required fields
    if (!mileageInterval && !timeInterval) {
      Alert.alert('Validation Error', 'Please set at least one interval (mileage or time).');
      return;
    }

    // Parse service key to get category and subcategory
    const [categoryKey, subcategoryKey] = service.id.includes('.') 
      ? service.id.split('.') 
      : [service.id, service.id];

    const config: AdvancedServiceConfiguration = {
      serviceId: service.id,
      categoryKey,
      subcategoryKey,
      displayName: service.name,
      description: notes.trim() || undefined,
      intervalType: mileageInterval && timeInterval ? 'dual' : mileageInterval ? 'mileage' : 'time',
      mileageValue: mileageInterval ? parseInt(mileageInterval) : undefined,
      timeValue: timeInterval ? parseInt(timeInterval) : undefined,
      timeUnit: 'months',
      dualCondition: 'first',
      reminderOffset: parseInt(reminderAdvanceDays),
      components: {
        parts: parts.length > 0 ? parts.map(part => part.name.trim()).filter(name => name) : undefined,
        fluids: fluids.length > 0 ? fluids.map(fluid => fluid.name.trim()).filter(name => name) : undefined,
      },
      costEstimate: getTotalCost() || undefined,
    };

    onSave(config);
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <View style={styles.headerTitle}>
            <Typography variant="heading" style={styles.serviceTitle} numberOfLines={1}>
              {service.name}
            </Typography>
            <Typography variant="caption" style={styles.categoryTitle}>
              {service.category}
            </Typography>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Conditional Content Based on Service Type */}
          {serviceType === 'shop' ? renderShopServiceForm() : renderDIYServiceForm()}

          {/* Total Cost Summary */}
          {getTotalCost() > 0 && (
            <Card style={styles.totalCard}>
              <View style={styles.totalContainer}>
                <Typography variant="subheading" style={styles.totalLabel}>
                  Estimated Total Cost
                </Typography>
                <Typography variant="heading" style={styles.totalAmount}>
                  ${getTotalCost().toFixed(2)}
                </Typography>
              </View>
            </Card>
          )}
        </ScrollView>
        
        {/* Bottom Button Bar */}
        <View style={[styles.bottomButtonBar, { paddingBottom: insets.bottom }]}>
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
            style={styles.bottomButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
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
    minWidth: 60,
  },

  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },

  serviceTitle: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },

  categoryTitle: {
    color: theme.colors.surface,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },

  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  section: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },

  sectionTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  addButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}10`,
  },

  inputSpacing: {
    marginTop: theme.spacing.md,
  },

  itemContainer: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },

  itemNumber: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  removeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.error}10`,
  },

  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: theme.spacing.md,
  },

  totalCard: {
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
    marginBottom: theme.spacing.xl,
  },

  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  totalAmount: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },

  partFluidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: theme.spacing.md,
  },

  partFluidInput: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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

export default ServiceConfigBottomSheet;