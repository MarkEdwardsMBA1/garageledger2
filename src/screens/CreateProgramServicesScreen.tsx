// Create Program - Step 3: Service Selection
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { ProgressBar } from '../components/common/ProgressBar';
import { programRepository } from '../repositories/SecureProgramRepository';
import { MaintenanceProgram, ProgramTask, Vehicle } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RouteParams {
  selectedVehicleIds: string[];
  selectedVehicles: Vehicle[];
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
  intervalType: 'mileage' | 'time' | 'either';
}

interface ServiceConfiguration {
  serviceId: string;
  intervalType: 'mileage' | 'time' | 'either';
  mileageValue?: number;
  timeValue?: number;
  timeUnit?: 'days' | 'weeks' | 'months' | 'years';
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
    intervalType: 'either'
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
    intervalType: 'either'
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
  
  // Form state
  const [intervalType, setIntervalType] = useState<'mileage' | 'time' | 'either'>(
    existingConfig?.intervalType || service.intervalType
  );
  const [mileageValue, setMileageValue] = useState(
    existingConfig?.mileageValue?.toString() || service.defaultMileage.toString()
  );
  const [timeValue, setTimeValue] = useState(
    existingConfig?.timeValue?.toString() || service.defaultTimeValue.toString()
  );
  const [timeUnit, setTimeUnit] = useState<'days' | 'weeks' | 'months' | 'years'>(
    existingConfig?.timeUnit || service.defaultTimeUnit
  );

  // Reset form when service changes
  React.useEffect(() => {
    if (visible) {
      setIntervalType(existingConfig?.intervalType || service.intervalType);
      setMileageValue(existingConfig?.mileageValue?.toString() || service.defaultMileage.toString());
      setTimeValue(existingConfig?.timeValue?.toString() || service.defaultTimeValue.toString());
      setTimeUnit(existingConfig?.timeUnit || service.defaultTimeUnit);
    }
  }, [visible, service, existingConfig]);

  const handleSave = () => {
    const config: ServiceConfiguration = {
      serviceId: service.id,
      intervalType,
      mileageValue: intervalType !== 'time' ? parseInt(mileageValue) || 0 : undefined,
      timeValue: intervalType !== 'mileage' ? parseInt(timeValue) || 0 : undefined,
      timeUnit: intervalType !== 'mileage' ? timeUnit : undefined,
    };
    onSave(config);
  };

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
        
        <View style={bottomSheetStyles.bottomSheet}>
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

              {/* Interval Type Selection */}
              <View style={bottomSheetStyles.section}>
                <Typography variant="heading" style={bottomSheetStyles.sectionTitle}>
                  {t('programs.reminderType', 'Reminder Type')}
                </Typography>
                
                <View style={bottomSheetStyles.radioGroup}>
                  {(['mileage', 'time', 'either'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        bottomSheetStyles.radioOption,
                        intervalType === type && bottomSheetStyles.radioOptionSelected
                      ]}
                      onPress={() => setIntervalType(type)}
                    >
                      <View style={bottomSheetStyles.radioContent}>
                        <Typography
                          variant="body"
                          style={[
                            bottomSheetStyles.radioText,
                            intervalType === type && bottomSheetStyles.radioTextSelected
                          ]}
                        >
                          {type === 'mileage' && t('programs.mileageOnly', 'Mileage Only')}
                          {type === 'time' && t('programs.timeOnly', 'Time Only')}
                          {type === 'either' && t('programs.eitherFirst', 'Whichever Comes First')}
                        </Typography>
                        <View style={[
                          bottomSheetStyles.radioCircle,
                          intervalType === type && bottomSheetStyles.radioCircleSelected
                        ]} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Mileage Input */}
              {(intervalType === 'mileage' || intervalType === 'either') && (
                <View style={bottomSheetStyles.section}>
                  <Input
                    label={t('programs.mileageInterval', 'Miles')}
                    value={mileageValue}
                    onChangeText={setMileageValue}
                    placeholder={formatNumber(service.defaultMileage)}
                    keyboardType="numeric"
                    style={bottomSheetStyles.input}
                  />
                </View>
              )}

              {/* Time Input */}
              {(intervalType === 'time' || intervalType === 'either') && (
                <View style={bottomSheetStyles.section}>
                  <View style={bottomSheetStyles.timeInputRow}>
                    <Input
                      label={t('programs.timeInterval', 'Every')}
                      value={timeValue}
                      onChangeText={setTimeValue}
                      placeholder={service.defaultTimeValue.toString()}
                      keyboardType="numeric"
                      style={bottomSheetStyles.timeValueInput}
                    />
                    
                    <View style={bottomSheetStyles.timeUnitContainer}>
                      <Typography variant="caption" style={bottomSheetStyles.timeUnitLabel}>
                        {t('programs.timeUnit', 'Unit')}
                      </Typography>
                      <View style={bottomSheetStyles.timeUnitSelector}>
                        {(['months', 'years', 'weeks', 'days'] as const).map((unit) => (
                          <TouchableOpacity
                            key={unit}
                            style={[
                              bottomSheetStyles.timeUnitOption,
                              timeUnit === unit && bottomSheetStyles.timeUnitOptionSelected
                            ]}
                            onPress={() => setTimeUnit(unit)}
                          >
                            <Typography
                              variant="caption"
                              style={[
                                bottomSheetStyles.timeUnitText,
                                timeUnit === unit && bottomSheetStyles.timeUnitTextSelected
                              ]}
                            >
                              {unit}
                            </Typography>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}

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
        </View>
      </View>
    </Modal>
  );
};

/**
 * Create Program - Step 3: Service Selection Screen
 * Final step for selecting maintenance services and intervals
 */
const CreateProgramServicesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuth();
  const { selectedVehicleIds, selectedVehicles, programName, programDescription } = route.params as RouteParams;
  
  // Service configuration state (Basic Mode)
  const [serviceConfigurations, setServiceConfigurations] = useState<Map<string, ServiceConfiguration>>(new Map());
  const [loading, setLoading] = useState(false);
  
  // Bottom sheet state
  const [selectedServiceForConfig, setSelectedServiceForConfig] = useState<CuratedService | null>(null);
  const [showConfigSheet, setShowConfigSheet] = useState(false);

  // Handle service card tap (opens bottom sheet for configuration)
  const handleServiceCardTap = (service: CuratedService) => {
    setSelectedServiceForConfig(service);
    setShowConfigSheet(true);
  };

  // Handle service configuration save
  const handleConfigurationSave = (config: ServiceConfiguration) => {
    setServiceConfigurations(prev => {
      const updated = new Map(prev);
      updated.set(config.serviceId, config);
      return updated;
    });
    setShowConfigSheet(false);
    setSelectedServiceForConfig(null);
  };

  // Handle service removal
  const handleServiceRemove = (serviceId: string) => {
    setServiceConfigurations(prev => {
      const updated = new Map(prev);
      updated.delete(serviceId);
      return updated;
    });
  };

  // Form validation
  const validateServices = (): boolean => {
    if (serviceConfigurations.size === 0) {
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
    return Array.from(serviceConfigurations.values()).map(config => {
      const service = CURATED_SERVICES.find(s => s.id === config.serviceId);
      if (!service) throw new Error(`Service not found: ${config.serviceId}`);

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

      return task;
    });
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

      await programRepository.create(programData);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('programs.programCreated', 'Maintenance program created successfully!'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Programs')
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

        {/* Basic Mode: Curated Service Cards */}
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
                          {config?.intervalType === 'either' && `Every ${formatNumber(config.mileageValue || 0)} miles or ${config.timeValue} ${config.timeUnit}`}
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
      </ScrollView>

      {/* Create Program Button */}
      <View style={styles.footer}>
        <Button
          title={t('programs.createProgram', 'Create Program')}
          onPress={handleCreateProgram}
          disabled={serviceConfigurations.size === 0}
          style={styles.createButton}
        />
      </View>

      {/* Bottom Sheet for Service Configuration */}
      {selectedServiceForConfig && (
        <ServiceConfigBottomSheet
          visible={showConfigSheet}
          service={selectedServiceForConfig}
          existingConfig={serviceConfigurations.get(selectedServiceForConfig.id)}
          onSave={handleConfigurationSave}
          onCancel={() => setShowConfigSheet(false)}
          onRemove={() => handleServiceRemove(selectedServiceForConfig.id)}
        />
      )}
    </View>
  );
};

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
});

export default CreateProgramServicesScreen;