// Create Program - Step 3: Service Selection
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Keyboard,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { ProgressBar } from '../components/common/ProgressBar';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { ChipsGroup } from '../components/common/ChipsGroup';
import { QuickPicks } from '../components/common/QuickPicks';
import { programRepository } from '../repositories/SecureProgramRepository';
import { MaintenanceProgram, ProgramTask, Vehicle, AdvancedServiceConfiguration } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { CategorySearch } from '../components/common/CategorySearch';
import { CategoryGrid } from '../components/common/CategoryGrid';
import { CustomServiceBottomSheet } from '../components/programs/CustomServiceBottomSheet';
import { getOrderedCategoryData, searchCategories, CategoryDisplayData } from '../utils/CategoryIconMapping';

interface RouteParams {
  selectedVehicleIds: string[];
  selectedVehicles: (Omit<Vehicle, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  })[];
  programName: string;
  programDescription: string;
}

interface CuratedService {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultMileage: number;
  defaultTimeValue: number;
  defaultTimeUnit: 'days' | 'weeks' | 'months' | 'years';
  intervalType: 'mileage' | 'time' | 'dual';
}

interface ServiceConfiguration {
  serviceId: string;
  intervalType: 'mileage' | 'time' | 'dual';
  mileageValue?: number;
  timeValue?: number;
  timeUnit?: 'days' | 'weeks' | 'months' | 'years';
  dualCondition?: 'first' | 'last';
}

// Basic Mode: Curated common maintenance services with sensible defaults
const CURATED_SERVICES: CuratedService[] = [
  {
    id: 'oil_change',
    name: 'Oil & Filter Change',
    category: 'Engine & Powertrain',
    description: 'Replace engine oil and oil filter',
    defaultMileage: 10000,
    defaultTimeValue: 12,
    defaultTimeUnit: 'months',
    intervalType: 'dual'
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    category: 'Tires & Wheels',
    description: 'Rotate tires for even wear',
    defaultMileage: 5000,
    defaultTimeValue: 6,
    defaultTimeUnit: 'months',
    intervalType: 'mileage'
  },
  {
    id: 'engine_air_filter',
    name: 'Engine Air Filter',
    category: 'Engine & Powertrain',
    description: 'Replace engine air filter',
    defaultMileage: 20000,
    defaultTimeValue: 24,
    defaultTimeUnit: 'months',
    intervalType: 'mileage'
  },
  {
    id: 'cabin_air_filter',
    name: 'Cabin Air Filter',
    category: 'Interior Comfort & Convenience',
    description: 'Replace cabin air filter',
    defaultMileage: 15000,
    defaultTimeValue: 12,
    defaultTimeUnit: 'months',
    intervalType: 'dual'
  },
  {
    id: 'brake_fluid',
    name: 'Brake Fluid',
    category: 'Brake System',
    description: 'Replace brake fluid',
    defaultMileage: 0,
    defaultTimeValue: 2,
    defaultTimeUnit: 'years',
    intervalType: 'time'
  },
  {
    id: 'coolant_flush',
    name: 'Coolant System',
    category: 'Engine & Powertrain',
    description: 'Replace antifreeze and coolant',
    defaultMileage: 0,
    defaultTimeValue: 4,
    defaultTimeUnit: 'years',
    intervalType: 'time'
  },
  {
    id: 'spark_plugs',
    name: 'Spark Plugs',
    category: 'Engine & Powertrain',
    description: 'Replace spark plugs',
    defaultMileage: 60000,
    defaultTimeValue: 4,
    defaultTimeUnit: 'years',
    intervalType: 'mileage'
  },
  {
    id: 'brake_pads',
    name: 'Brake Pads & Rotors',
    category: 'Brake System',
    description: 'Inspect and replace brake pads and rotors',
    defaultMileage: 25000,
    defaultTimeValue: 2,
    defaultTimeUnit: 'years',
    intervalType: 'mileage'
  }
];

/**
 * Bottom Sheet for Service Configuration
 */
interface ServiceConfigBottomSheetProps {
  visible: boolean;
  service: CuratedService;
  existingConfig?: ServiceConfiguration;
  onSave: (config: ServiceConfiguration) => void;
  onCancel: () => void;
  onRemove?: () => void;
}

const ServiceConfigBottomSheet: React.FC<ServiceConfigBottomSheetProps> = ({
  visible,
  service,
  existingConfig,
  onSave,
  onCancel,
  onRemove,
}) => {
  const { t } = useTranslation();
  
  // Form state - updated for polished UX
  const [intervalType, setIntervalType] = useState<'mileage' | 'time' | 'dual'>(
    existingConfig?.intervalType || 'mileage'
  );
  const [mileageValue, setMileageValue] = useState(
    existingConfig?.mileageValue?.toString() || ""
  );
  const [timeValue, setTimeValue] = useState(
    existingConfig?.timeValue?.toString() || ""
  );
  const [timeUnit, setTimeUnit] = useState<'days' | 'weeks' | 'months' | 'years'>(
    existingConfig?.timeUnit || service.defaultTimeUnit
  );

  // Animation for keyboard avoidance
  const bottomSheetTranslateY = React.useRef(new Animated.Value(0)).current;

  // Reset form when service changes
  React.useEffect(() => {
    if (visible) {
      setIntervalType(existingConfig?.intervalType || 'mileage');
      setMileageValue(existingConfig?.mileageValue?.toString() || "");
      setTimeValue(existingConfig?.timeValue?.toString() || "");
      setTimeUnit(existingConfig?.timeUnit || service.defaultTimeUnit);
    }
  }, [visible, service, existingConfig]);

  // Keyboard animation listeners
  React.useEffect(() => {
    if (!visible) return;

    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      // More aggressive lift for single modes, moderate for dual mode
      const liftPercentage = intervalType === 'dual' ? 0.6 : 0.8; // 80% for single modes, 60% for dual
      
      Animated.timing(bottomSheetTranslateY, {
        toValue: -e.endCoordinates.height * liftPercentage,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', (e) => {
      // Animate back to original position
      Animated.timing(bottomSheetTranslateY, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [visible, bottomSheetTranslateY]);

  const handleSave = () => {
    const config: ServiceConfiguration = {
      serviceId: service.id,
      intervalType,
      mileageValue: intervalType !== 'time' ? parseInt(mileageValue) || 0 : undefined,
      timeValue: intervalType !== 'mileage' ? parseInt(timeValue) || 0 : undefined,
      timeUnit: intervalType !== 'mileage' ? timeUnit : undefined,
      dualCondition: intervalType === 'dual' ? 'first' : undefined,
    };
    onSave(config);
  };

  // Quick pick values for common intervals
  const mileageQuickPicks = [5000, 7500, 10000, 15000];
  const timeQuickPicks = intervalType === 'time' || intervalType === 'dual' ? 
    (timeUnit === 'months' ? [3, 6, 12, 18] : 
     timeUnit === 'weeks' ? [2, 4, 8, 12] : 
     timeUnit === 'days' ? [30, 60, 90, 180] : [1, 2, 3, 5]) : [];

  // Options for segmented control
  const intervalModeOptions = [
    { key: 'mileage', label: 'Mileage' },
    { key: 'time', label: 'Time' },
    { key: 'dual', label: 'Miles + Time' },
  ];

  // Options for time unit chips
  const timeUnitOptions = [
    { key: 'days', label: 'Days' },
    { key: 'weeks', label: 'Weeks' },
    { key: 'months', label: 'Months' },
    { key: 'years', label: 'Years' },
  ];

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={bottomSheetStyles.overlay}>
        <TouchableOpacity 
          style={bottomSheetStyles.backdrop} 
          onPress={onCancel}
          activeOpacity={1}
        />
        
        <Animated.View 
          style={[
            bottomSheetStyles.bottomSheet,
            { transform: [{ translateY: bottomSheetTranslateY }] }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => Keyboard.dismiss()}
        >
          {/* Handle */}
          <View style={bottomSheetStyles.handle} />
          
          
          {/* Header */}
          <View style={bottomSheetStyles.header}>
            <Typography variant="title" style={bottomSheetStyles.title}>
              {service.name}
            </Typography>
            <Typography variant="caption" style={bottomSheetStyles.category}>
              {service.category}
            </Typography>
          </View>

          {/* Segmented Control for Mode Selection */}
          <View style={bottomSheetStyles.section}>
            <SegmentedControl
              options={intervalModeOptions}
              selectedKey={intervalType}
              onSelect={(key) => setIntervalType(key as 'mileage' | 'time' | 'dual')}
            />
          </View>

          {/* Contextual Input Sections */}
          <View style={bottomSheetStyles.section}>
            <Typography variant="body" style={bottomSheetStyles.sentenceIntro}>
              Configure service reminder:
            </Typography>
            
            <View style={[
              bottomSheetStyles.sentenceContainer,
              intervalType === 'dual' && bottomSheetStyles.sentenceContainerCompact
            ]}>
              {/* Mileage Section */}
              {(intervalType === 'mileage' || intervalType === 'dual') && (
                <View>
                  <View style={bottomSheetStyles.sentenceRow}>
                    <Typography variant="body" style={bottomSheetStyles.sentenceText}>
                      Every
                    </Typography>
                    <Input
                      value={mileageValue}
                      onChangeText={setMileageValue}
                      keyboardType="numeric"
                      style={bottomSheetStyles.inlineInput}
                      placeholder="5,000"
                    />
                    <Typography variant="body" style={bottomSheetStyles.sentenceText}>
                      miles{intervalType === 'dual' ? ' or' : ''}
                    </Typography>
                  </View>
                  
                  <QuickPicks
                    values={mileageQuickPicks}
                    onSelect={(value) => setMileageValue(value.toString())}
                    style={intervalType === 'dual' 
                      ? bottomSheetStyles.chipsContainerCompact 
                      : bottomSheetStyles.chipsContainer
                    }
                  />
                </View>
              )}


              {/* Time Section */}
              {(intervalType === 'time' || intervalType === 'dual') && (
                <View>
                  <View style={bottomSheetStyles.sentenceRow}>
                    <Typography variant="body" style={bottomSheetStyles.sentenceText}>
                      Every
                    </Typography>
                    <Input
                      value={timeValue}
                      onChangeText={setTimeValue}
                      keyboardType="numeric"
                      style={bottomSheetStyles.inlineInput}
                      placeholder="6"
                    />
                    <ChipsGroup
                      options={timeUnitOptions}
                      selectedKey={timeUnit}
                      onSelect={(key) => setTimeUnit(key as 'days' | 'weeks' | 'months' | 'years')}
                      style={intervalType === 'dual' 
                        ? bottomSheetStyles.chipsContainerCompact 
                        : bottomSheetStyles.chipsContainer
                      }
                    />
                  </View>
                  
                  <QuickPicks
                    values={timeQuickPicks}
                    onSelect={(value) => setTimeValue(value.toString())}
                    style={intervalType === 'dual' 
                      ? bottomSheetStyles.chipsContainerCompact 
                      : bottomSheetStyles.chipsContainer
                    }
                    label={`Quick picks (${timeUnit}):`}
                  />
                </View>
              )}

              {/* Dual Mode Explanation */}
              {intervalType === 'dual' && (
                <Typography variant="bodySmall" style={bottomSheetStyles.dualExplanationCompact}>
                  Whichever comes first
                </Typography>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={bottomSheetStyles.actions}>
            {existingConfig && onRemove && (
              <Button
                title={t('common.remove', 'Remove')}
                variant="outline"
                onPress={() => {
                  onRemove();
                  onCancel();
                }}
                style={bottomSheetStyles.removeButton}
              />
            )}
            
            <View style={bottomSheetStyles.mainActions}>
              <Button
                title={t('common.cancel', 'Cancel')}
                variant="outline"
                onPress={onCancel}
                style={bottomSheetStyles.cancelButton}
              />
              <Button
                title={t('common.save', 'Save')}
                variant="primary"
                onPress={handleSave}
                style={bottomSheetStyles.saveButton}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

type ServiceTab = 'basic' | 'advanced';

/**
 * Create Program - Step 3: Service Selection Screen
 * Final step for selecting maintenance services and intervals
 */
const CreateProgramServicesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;
  const { selectedVehicleIds, programName, programDescription } = params;
  
  // Convert date strings back to Date objects for selectedVehicles
  const selectedVehicles = params.selectedVehicles.map(vehicle => ({
    ...vehicle,
    createdAt: new Date(vehicle.createdAt),
    updatedAt: new Date(vehicle.updatedAt),
  }));
  
  // Tab state
  const [activeTab, setActiveTab] = useState<ServiceTab>('basic');
  
  // Service configuration state (Basic Mode)
  const [serviceConfigurations, setServiceConfigurations] = useState<Map<string, ServiceConfiguration>>(new Map());
  const [loading, setLoading] = useState(false);
  
  // Advanced mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [advancedServiceConfigs, setAdvancedServiceConfigs] = useState<Map<string, AdvancedServiceConfiguration>>(new Map());
  
  // Bottom sheet state
  const [selectedServiceForConfig, setSelectedServiceForConfig] = useState<CuratedService | null>(null);
  const [showConfigSheet, setShowConfigSheet] = useState(false);
  
  // Advanced tab bottom sheet state
  const [advancedConfigService, setAdvancedConfigService] = useState<{
    serviceKey: string;
    serviceName: string;
    categoryName: string;
    wasJustSelected: boolean;  // Track if this was just selected or was already selected
  } | null>(null);
  
  // Custom service bottom sheet state
  const [showCustomServiceSheet, setShowCustomServiceSheet] = useState(false);
  const [pendingCustomServiceKey, setPendingCustomServiceKey] = useState<string | null>(null);

  // Handle service card tap (opens bottom sheet for configuration)
  const handleServiceCardTap = (service: CuratedService) => {
    setSelectedServiceForConfig(service);
    setShowConfigSheet(true);
  };

  // Handle service configuration save
  const handleConfigurationSave = (config: ServiceConfiguration) => {
    if (advancedConfigService) {
      // This is an advanced service configuration
      const advancedConfig = convertBasicToAdvancedConfig(
        config, 
        advancedConfigService.serviceKey, 
        advancedConfigService.serviceName, 
        advancedConfigService.categoryName
      );
      setAdvancedServiceConfigs(prev => {
        const updated = new Map(prev);
        updated.set(advancedConfig.serviceId, advancedConfig);
        return updated;
      });
      setAdvancedConfigService(null);
    } else {
      // This is a basic service configuration
      setServiceConfigurations(prev => {
        const updated = new Map(prev);
        updated.set(config.serviceId, config);
        return updated;
      });
      setSelectedServiceForConfig(null);
    }
    setShowConfigSheet(false);
  };

  // Handle service removal
  const handleServiceRemove = (serviceId: string) => {
    if (advancedConfigService && serviceId === advancedConfigService.serviceKey) {
      // This is an advanced service removal
      setAdvancedServiceConfigs(prev => {
        const updated = new Map(prev);
        updated.delete(serviceId);
        return updated;
      });
      setSelectedServices(prev => {
        const updated = new Set(prev);
        updated.delete(serviceId);
        return updated;
      });
      setAdvancedConfigService(null);
    } else {
      // This is a basic service removal
      setServiceConfigurations(prev => {
        const updated = new Map(prev);
        updated.delete(serviceId);
        return updated;
      });
      setSelectedServiceForConfig(null);
    }
    setShowConfigSheet(false);
  };

  // Advanced mode handlers
  const handleToggleExpand = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const updated = new Set(prev);
      if (updated.has(categoryKey)) {
        updated.delete(categoryKey);
      } else {
        updated.add(categoryKey);
      }
      return updated;
    });
  };

  const handleServiceToggle = (serviceKey: string) => {
    setSelectedServices(prev => {
      const updated = new Set(prev);
      if (updated.has(serviceKey)) {
        updated.delete(serviceKey);
        // Also remove configuration when service is deselected
        setAdvancedServiceConfigs(configPrev => {
          const configUpdated = new Map(configPrev);
          configUpdated.delete(serviceKey);
          return configUpdated;
        });
      } else {
        updated.add(serviceKey);
      }
      return updated;
    });
  };

  // Advanced service configuration handlers
  const handleAdvancedServiceConfigSave = (config: AdvancedServiceConfiguration) => {
    setAdvancedServiceConfigs(prev => {
      const updated = new Map(prev);
      updated.set(config.serviceId, config);
      return updated;
    });
  };

  const handleAdvancedServiceConfigRemove = (serviceKey: string) => {
    setAdvancedServiceConfigs(prev => {
      const updated = new Map(prev);
      updated.delete(serviceKey);
      return updated;
    });
    // Also remove from selected services
    setSelectedServices(prev => {
      const updated = new Set(prev);
      updated.delete(serviceKey);
      return updated;
    });
  };

  // Handle advanced service configuration (using Basic tab's bottom sheet)
  const handleAdvancedServiceConfigure = (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected: boolean = false) => {
    // Check if this is a custom service that needs special handling
    if (serviceKey === 'custom-service.custom') {
      setPendingCustomServiceKey(serviceKey);
      setShowCustomServiceSheet(true);
      return;
    }
    
    setAdvancedConfigService({ serviceKey, serviceName, categoryName, wasJustSelected });
    setShowConfigSheet(true);
  };

  // Handle custom service name creation
  const handleCustomServiceSaved = (serviceName: string) => {
    if (!pendingCustomServiceKey) return;
    
    // Create a unique service ID using the custom service name
    const customServiceKey = `custom-service.${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Add to selected services
    setSelectedServices(prev => {
      const updated = new Set(prev);
      // Remove the original pending key and add the new custom key
      updated.delete(pendingCustomServiceKey);
      updated.add(customServiceKey);
      return updated;
    });
    
    // Now open the interval configuration for this custom service
    setAdvancedConfigService({ 
      serviceKey: customServiceKey, 
      serviceName: serviceName, 
      categoryName: 'Custom Service Reminder', 
      wasJustSelected: true 
    });
    setShowConfigSheet(true);
    
    // Reset custom service state
    setPendingCustomServiceKey(null);
  };

  // Handle custom service cancellation
  const handleCustomServiceCanceled = () => {
    if (pendingCustomServiceKey) {
      // Remove from selected services since user canceled
      setSelectedServices(prev => {
        const updated = new Set(prev);
        updated.delete(pendingCustomServiceKey);
        return updated;
      });
      setPendingCustomServiceKey(null);
    }
  };

  // Create adapter to convert advanced service to Basic tab format
  const createAdvancedServiceAdapter = (serviceKey: string, serviceName: string, categoryName: string): CuratedService => {
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

  // Convert AdvancedServiceConfiguration to Basic ServiceConfiguration
  const convertAdvancedToBasicConfig = (advancedConfig: AdvancedServiceConfiguration): ServiceConfiguration => {
    return {
      serviceId: advancedConfig.serviceId,
      intervalType: advancedConfig.intervalType,
      mileageValue: advancedConfig.mileageValue,
      timeValue: advancedConfig.timeValue,
      timeUnit: advancedConfig.timeUnit,
      dualCondition: advancedConfig.intervalType === 'dual' ? 'first' : undefined,
    };
  };

  // Convert Basic ServiceConfiguration to AdvancedServiceConfiguration
  const convertBasicToAdvancedConfig = (basicConfig: ServiceConfiguration, serviceKey: string, serviceName: string, categoryName: string): AdvancedServiceConfiguration => {
    return {
      serviceId: basicConfig.serviceId,
      categoryKey: serviceKey.split('.')[0],
      subcategoryKey: serviceKey.split('.')[1],
      displayName: serviceName,
      intervalType: basicConfig.intervalType,
      mileageValue: basicConfig.mileageValue,
      timeValue: basicConfig.timeValue,
      timeUnit: basicConfig.timeUnit,
      reminderOffset: 7,
      criticalityLevel: 'medium',
      isCustomService: false,
    };
  };

  // Form validation
  const validateServices = (): boolean => {
    const hasBasicServices = serviceConfigurations.size > 0;
    const hasAdvancedServices = advancedServiceConfigs.size > 0;
    
    if (!hasBasicServices && !hasAdvancedServices) {
      Alert.alert(
        t('validation.required', 'Required'), 
        t('programs.servicesRequired', 'Please configure at least one service for this program')
      );
      return false;
    }

    return true;
  };

  // Format number with commas (e.g., 10,000)
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Create program tasks from configured services
  const createProgramTasks = (): ProgramTask[] => {
    const tasks: ProgramTask[] = [];

    // Add tasks from Basic tab configurations
    Array.from(serviceConfigurations.values()).forEach(config => {
      const service = CURATED_SERVICES.find(s => s.id === config.serviceId);
      if (!service) throw new Error(`Basic service not found: ${config.serviceId}`);

      const task: ProgramTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: service.name,
        description: service.description,
        category: service.category,
        intervalType: config.intervalType,
        intervalValue: config.mileageValue || 0,
        timeIntervalValue: config.timeValue || 0,
        timeIntervalUnit: config.timeUnit || 'months',
        reminderOffset: 7, // Remind 7 days before due
        isActive: true,
      };

      tasks.push(task);
    });

    // Add tasks from Advanced tab configurations
    Array.from(advancedServiceConfigs.values()).forEach(config => {
      const task: ProgramTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: config.displayName,
        description: config.description || `${config.displayName} maintenance`,
        category: config.categoryKey,
        intervalType: config.intervalType,
        intervalValue: config.mileageValue || 0,
        timeIntervalValue: config.timeValue || 0,
        timeIntervalUnit: config.timeUnit || 'months',
        reminderOffset: config.reminderOffset || 7,
        isActive: true,
      };

      tasks.push(task);
    });

    return tasks;
  };

  // Handle program creation
  const handleCreateProgram = async () => {
    if (!validateServices() || !user) return;
    
    setLoading(true);
    
    try {
      const programTasks = createProgramTasks();
      
      const programData: Omit<MaintenanceProgram, 'id'> = {
        userId: user.uid,
        name: programName,
        description: programDescription,
        tasks: programTasks,
        assignedVehicleIds: selectedVehicleIds,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdProgram = await programRepository.create(programData);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('programs.programCreated', 'Maintenance program created successfully!'),
        [
          {
            text: t('programs.assignToVehicles', 'Assign to Vehicles'),
            onPress: () => navigation.navigate('AssignProgramToVehicles', { 
              programId: createdProgram.id,
              programName: createdProgram.name 
            })
          },
          {
            text: t('common.done', 'Done'),
            onPress: () => navigation.navigate('ProgramsList'),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error creating program:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.createError', 'Failed to create program. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Tab options configuration
  const tabOptions = [
    { key: 'basic', label: t('programs.basic', 'Basic') },
    { key: 'advanced', label: t('programs.advanced', 'Advanced') },
  ];

  // Get display name for vehicle
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('programs.creating', 'Creating program...')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <ProgressBar currentStep={3} totalSteps={3} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Program Summary Card */}
        <Card variant="outlined" style={styles.summaryCard}>
          <Typography variant="subheading" style={styles.summaryTitle}>
            {programName}
          </Typography>
          <Typography variant="caption" style={styles.summarySubtitle}>
            {selectedVehicles.map(getVehicleDisplayName).join(', ')}
          </Typography>
        </Card>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <SegmentedControl
            options={tabOptions}
            selectedKey={activeTab}
            onSelect={(key) => setActiveTab(key as ServiceTab)}
            style={styles.segmentedControl}
          />
        </View>

        {/* Tab Content */}
        {activeTab === 'basic' ? (
          // Basic Mode: Existing Curated Service Cards
          <View style={styles.servicesContainer}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.selectServices', 'Select Services')}
            </Typography>
            <Typography variant="caption" style={styles.sectionSubtitle}>
              {t('programs.tapToConfigureService', 'Tap a service card to configure reminders')}
            </Typography>
            
            <View style={styles.serviceGrid}>
              {CURATED_SERVICES.map((service) => {
                const isConfigured = serviceConfigurations.has(service.id);
                const config = serviceConfigurations.get(service.id);
                
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      isConfigured && styles.serviceCardConfigured
                    ]}
                    onPress={() => handleServiceCardTap(service)}
                  >
                    <View style={styles.serviceCardContent}>
                      <Typography variant="subheading" style={styles.serviceCardTitle}>
                        {service.name}
                      </Typography>
                      <Typography variant="caption" style={styles.serviceCardCategory}>
                        {service.category}
                      </Typography>
                      
                      {isConfigured ? (
                        <View style={styles.serviceCardSummary}>
                          <Typography variant="caption" style={styles.serviceCardConfigText}>
                            {config?.intervalType === 'mileage' && `Every ${formatNumber(config.mileageValue || 0)} miles`}
                            {config?.intervalType === 'time' && `Every ${config.timeValue} ${config.timeUnit}`}
                            {config?.intervalType === 'dual' && `Every ${formatNumber(config.mileageValue || 0)} miles or ${config.timeValue} ${config.timeUnit}`}
                          </Typography>
                        </View>
                      ) : (
                        <View style={styles.serviceCardDefault}>
                          <Typography variant="caption" style={styles.serviceCardDefaultText}>
                            Tap to configure
                          </Typography>
                        </View>
                      )}
                    </View>
                    
                    {isConfigured && (
                      <View style={styles.serviceCardCheck}>
                        <View style={styles.checkMark} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          // Advanced Mode: Category-Based Service Selection
          <AdvancedCategoryMode 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedCategories={expandedCategories}
            onToggleExpand={handleToggleExpand}
            selectedServices={selectedServices}
            onToggleService={handleServiceToggle}
            serviceConfigs={advancedServiceConfigs}
            onSaveServiceConfig={handleAdvancedServiceConfigSave}
            onRemoveServiceConfig={handleAdvancedServiceConfigRemove}
            onConfigureService={handleAdvancedServiceConfigure}
          />
        )}

      </ScrollView>

      {/* Create Program Button */}
      <View style={styles.footer}>
        <Button
          title={t('programs.createProgram', 'Create Program')}
          onPress={handleCreateProgram}
          disabled={serviceConfigurations.size === 0 && advancedServiceConfigs.size === 0}
          style={styles.createButton}
        />
      </View>

      {/* Bottom Sheet for Service Configuration */}
      {(selectedServiceForConfig || advancedConfigService) && (
        <ServiceConfigBottomSheet
          visible={showConfigSheet}
          service={
            selectedServiceForConfig || 
            createAdvancedServiceAdapter(
              advancedConfigService!.serviceKey, 
              advancedConfigService!.serviceName, 
              advancedConfigService!.categoryName
            )
          }
          existingConfig={
            selectedServiceForConfig 
              ? serviceConfigurations.get(selectedServiceForConfig.id)
              : advancedConfigService && advancedServiceConfigs.get(advancedConfigService.serviceKey)
                ? convertAdvancedToBasicConfig(advancedServiceConfigs.get(advancedConfigService.serviceKey)!)
                : undefined
          }
          onSave={handleConfigurationSave}
          onCancel={() => {
            // If this was an advanced service that was just selected, deselect it
            if (advancedConfigService?.wasJustSelected) {
              setSelectedServices(prev => {
                const updated = new Set(prev);
                updated.delete(advancedConfigService.serviceKey);
                return updated;
              });
            }
            
            setShowConfigSheet(false);
            setSelectedServiceForConfig(null);
            setAdvancedConfigService(null);
          }}
          onRemove={() => {
            const serviceId = selectedServiceForConfig?.id || advancedConfigService?.serviceKey;
            if (serviceId) handleServiceRemove(serviceId);
          }}
        />
      )}

      {/* Custom Service Bottom Sheet */}
      <CustomServiceBottomSheet
        isVisible={showCustomServiceSheet}
        onServiceSaved={handleCustomServiceSaved}
        onClose={() => {
          setShowCustomServiceSheet(false);
          handleCustomServiceCanceled();
        }}
      />
    </View>
  );
};

// Format number with commas (helper function)
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Advanced Category Mode Component
 * Handles category-based service selection using the new UI components
 */
interface AdvancedCategoryModeProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedCategories: Set<string>;
  onToggleExpand: (categoryKey: string) => void;
  selectedServices: Set<string>;
  onToggleService: (serviceKey: string) => void;
  serviceConfigs: Map<string, AdvancedServiceConfiguration>;
  onSaveServiceConfig: (config: AdvancedServiceConfiguration) => void;
  onRemoveServiceConfig: (serviceKey: string) => void;
  onConfigureService: (serviceKey: string, serviceName: string, categoryName: string, wasJustSelected?: boolean) => void;
}

const AdvancedCategoryMode: React.FC<AdvancedCategoryModeProps> = ({
  searchQuery,
  onSearchChange,
  expandedCategories,
  onToggleExpand,
  selectedServices,
  onToggleService,
  serviceConfigs,
  onSaveServiceConfig,
  onRemoveServiceConfig,
  onConfigureService,
}) => {
  const { t } = useTranslation();

  // Get categories data
  const allCategories = getOrderedCategoryData();
  const filteredCategories = searchQuery ? searchCategories(searchQuery) : allCategories;

  const handleCategoryPress = (categoryKey: string) => {
    // For now, just expand/collapse the category
    onToggleExpand(categoryKey);
  };

  return (
    <View style={advancedModeStyles.container}>
      <Typography variant="heading" style={advancedModeStyles.sectionTitle}>
        {t('programs.advancedServices', 'Advanced Services')}
      </Typography>
      <Typography variant="caption" style={advancedModeStyles.sectionSubtitle}>
        {t('programs.selectCategoriesServices', 'Select from comprehensive maintenance categories')}
      </Typography>

      {/* Search Bar */}
      <CategorySearch
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder={t('programs.searchCategoriesServices', 'Search categories and services...')}
        testID="advanced-category-search"
      />

      {/* Category Grid */}
      <CategoryGrid
        categories={filteredCategories}
        expandedCategories={expandedCategories}
        selectedServices={selectedServices}
        onCategoryPress={handleCategoryPress}
        onToggleExpand={onToggleExpand}
        onToggleService={onToggleService}
        serviceConfigs={serviceConfigs}
        onSaveServiceConfig={onSaveServiceConfig}
        onRemoveServiceConfig={onRemoveServiceConfig}
        onConfigureService={onConfigureService}
        searchQuery={searchQuery}
        testID="advanced-category-grid"
      />

      {/* Selection Summary */}
      {selectedServices.size > 0 && (
        <View style={advancedModeStyles.selectionSummary}>
          <Typography variant="caption" style={advancedModeStyles.selectionText}>
            {selectedServices.size} {selectedServices.size === 1 ? 'service' : 'services'} selected
          </Typography>
        </View>
      )}
    </View>
  );
};

const advancedModeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  sectionSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  selectionSummary: {
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },

  selectionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for footer
  },
  
  // Summary Card
  summaryCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  
  summaryTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  summarySubtitle: {
    color: theme.colors.textSecondary,
  },
  
  // Tab Container
  tabContainer: {
    marginBottom: theme.spacing.lg,
  },
  segmentedControl: {
    // Tab styling handled by SegmentedControl component
  },
  
  // Coming Soon Card for Advanced Tab
  comingSoonCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  comingSoonTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  comingSoonDescription: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  // Services Container
  servicesContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  
  // Service Grid
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  
  // Service Cards
  serviceCard: {
    width: '48%', // 2 cards per row with gap
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    minHeight: 120,
    position: 'relative',
  },
  
  serviceCardConfigured: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}10`,
  },
  
  serviceCardContent: {
    flex: 1,
  },
  
  serviceCardTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  serviceCardCategory: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  
  serviceCardSummary: {
    marginTop: 'auto',
  },
  
  serviceCardConfigText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  serviceCardDefault: {
    marginTop: 'auto',
  },
  
  serviceCardDefaultText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  serviceCardCheck: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  
  checkMark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  createButton: {
    width: '100%',
  },
});

// Bottom Sheet Styles
const bottomSheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  backdrop: {
    flex: 1,
  },
  
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 20, // Extra padding for safe area
    maxHeight: '80%',
  },
  
  handle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  
  header: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  category: {
    color: theme.colors.textSecondary,
  },
  
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  // Radio Button Group
  radioGroup: {
    gap: theme.spacing.sm,
  },
  
  radioOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  
  radioOptionSelected: {
    borderColor: theme.colors.primary,
  },
  
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  
  radioText: {
    color: theme.colors.text,
    flex: 1,
  },
  
  radioTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  
  // Input Fields
  input: {
    marginTop: theme.spacing.sm,
  },
  
  timeInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-end',
  },
  
  timeValueInput: {
    flex: 1,
    marginTop: theme.spacing.sm,
  },
  
  timeUnitContainer: {
    flex: 1,
  },
  
  timeUnitLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  
  timeUnitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  
  timeUnitOption: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  
  timeUnitOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  
  timeUnitText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
  },
  
  timeUnitTextSelected: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Actions
  actions: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  
  removeButton: {
    marginBottom: theme.spacing.md,
  },
  
  mainActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  saveButton: {
    flex: 2,
  },

  // New contextual sentence-style inputs
  sentenceIntro: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  sentenceContainer: {
    gap: theme.spacing.md,
  },
  
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  
  sentenceText: {
    color: theme.colors.text,
  },
  
  inlineInput: {
    minWidth: 80,
    maxWidth: 120,
    textAlign: 'center',
  },
  
  chipsContainer: {
    marginTop: theme.spacing.xs,
  },
  
  orText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    marginVertical: theme.spacing.sm,
  },
  
  dualExplanation: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },

  // Compact styles for dual mode
  sentenceContainerCompact: {
    gap: theme.spacing.sm, // Reduced from md to sm
  },

  chipsContainerCompact: {
    marginTop: 4, // Reduced from theme.spacing.xs (8px) to 4px
  },


  dualExplanationCompact: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4, // Reduced from theme.spacing.xs (8px) to 4px
  },
});

export default CreateProgramServicesScreen;