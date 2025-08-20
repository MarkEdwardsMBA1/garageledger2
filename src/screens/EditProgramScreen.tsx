// Edit Program Screen - Modify existing program details and services
import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { ChipsGroup } from '../components/common/ChipsGroup';
import { QuickPicks } from '../components/common/QuickPicks';
import { programRepository } from '../repositories/SecureProgramRepository';
import { MaintenanceProgram, ProgramTask } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface EditProgramParams {
  programId: string;
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

// Curated services - same as in CreateProgramServicesScreen
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
 * Service Configuration Bottom Sheet (same as CreateProgramServicesScreen)
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
  const insets = useSafeAreaInsets();
  
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

  const bottomSheetTranslateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setIntervalType(existingConfig?.intervalType || 'mileage');
      setMileageValue(existingConfig?.mileageValue?.toString() || "");
      setTimeValue(existingConfig?.timeValue?.toString() || "");
      setTimeUnit(existingConfig?.timeUnit || service.defaultTimeUnit);
    }
  }, [visible, service, existingConfig]);

  React.useEffect(() => {
    if (!visible) return;

    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      Animated.timing(bottomSheetTranslateY, {
        toValue: -e.endCoordinates.height * 0.4,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', (e) => {
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

  const mileageQuickPicks = [5000, 7500, 10000, 15000];
  const timeQuickPicks = intervalType === 'time' || intervalType === 'dual' ? 
    (timeUnit === 'months' ? [3, 6, 12, 18] : 
     timeUnit === 'weeks' ? [2, 4, 8, 12] : 
     timeUnit === 'days' ? [30, 60, 90, 180] : [1, 2, 3, 5]) : [];

  const intervalModeOptions = [
    { key: 'mileage', label: 'Mileage' },
    { key: 'time', label: 'Time' },
    { key: 'dual', label: 'Miles + Time' },
  ];

  const timeUnitOptions = [
    { key: 'days', label: 'Days' },
    { key: 'weeks', label: 'Weeks' },
    { key: 'months', label: 'Months' },
    { key: 'years', label: 'Years' },
  ];

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
          <View style={bottomSheetStyles.handle} />
          
          <View style={bottomSheetStyles.header}>
            <Typography variant="title" style={bottomSheetStyles.title}>
              {service.name}
            </Typography>
            <Typography variant="caption" style={bottomSheetStyles.category}>
              {service.category}
            </Typography>
          </View>

          <ScrollView 
            style={bottomSheetStyles.scrollContent}
            contentContainerStyle={bottomSheetStyles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={bottomSheetStyles.section}>
              <SegmentedControl
                options={intervalModeOptions}
                selectedKey={intervalType}
                onSelect={(key) => setIntervalType(key as 'mileage' | 'time' | 'dual')}
              />
            </View>

            <View style={bottomSheetStyles.section}>
              <Typography variant="body" style={bottomSheetStyles.sentenceIntro}>
                Configure service reminder:
              </Typography>
              
              <View style={bottomSheetStyles.sentenceContainer}>
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
                        miles
                      </Typography>
                    </View>
                    
                    <QuickPicks
                      values={mileageQuickPicks}
                      onSelect={(value) => setMileageValue(value.toString())}
                      style={bottomSheetStyles.chipsContainer}
                    />
                  </View>
                )}

                {intervalType === 'dual' && (
                  <Typography variant="body" style={bottomSheetStyles.orText}>
                    or
                  </Typography>
                )}

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
                        style={bottomSheetStyles.chipsContainer}
                      />
                    </View>
                    
                    <QuickPicks
                      values={timeQuickPicks}
                      onSelect={(value) => setTimeValue(value.toString())}
                      style={bottomSheetStyles.chipsContainer}
                      label={`Quick picks (${timeUnit}):`}
                    />
                  </View>
                )}

                {intervalType === 'dual' && (
                  <Typography variant="bodySmall" style={bottomSheetStyles.dualExplanation}>
                    Whichever comes first
                  </Typography>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={[bottomSheetStyles.actions, { paddingBottom: Math.max(theme.spacing.xl, insets.bottom + theme.spacing.md) }]}>
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

/**
 * Edit Program Screen
 */
const EditProgramScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated, user } = useAuth();
  const params = route.params as EditProgramParams;

  const [program, setProgram] = useState<MaintenanceProgram | null>(null);
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [serviceConfigurations, setServiceConfigurations] = useState<Map<string, ServiceConfiguration>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bottom sheet state
  const [selectedServiceForConfig, setSelectedServiceForConfig] = useState<CuratedService | null>(null);
  const [showConfigSheet, setShowConfigSheet] = useState(false);

  // Load program data
  const loadProgramData = async () => {
    if (!isAuthenticated || !params?.programId) return;

    setLoading(true);
    setError(null);

    try {
      const programData = await programRepository.getById(params.programId);

      if (!programData) {
        setError(t('programs.programNotFound', 'Program not found'));
        return;
      }

      setProgram(programData);
      setProgramName(programData.name);
      setProgramDescription(programData.description || '');

      // Convert existing tasks to service configurations
      const configs = new Map<string, ServiceConfiguration>();
      programData.tasks.forEach((task) => {
        // Map task back to curated service if possible
        const curatedService = CURATED_SERVICES.find(service => 
          service.name === task.name || service.id === task.name.toLowerCase().replace(/\s+/g, '_')
        );
        
        if (curatedService) {
          const config: ServiceConfiguration = {
            serviceId: curatedService.id,
            intervalType: task.intervalType,
            mileageValue: task.intervalValue || undefined,
            timeValue: task.timeIntervalValue || undefined,
            timeUnit: task.timeIntervalUnit || 'months',
            dualCondition: task.intervalType === 'dual' ? 'first' : undefined,
          };
          configs.set(curatedService.id, config);
        }
      });
      
      setServiceConfigurations(configs);

    } catch (err: any) {
      console.error('Error loading program data:', err);
      setError(err.message || 'Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgramData();
  }, [isAuthenticated, params?.programId]);

  useFocusEffect(
    React.useCallback(() => {
      loadProgramData();
    }, [isAuthenticated, params?.programId])
  );

  // Handle service card tap
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
  const validateForm = (): boolean => {
    if (!programName.trim()) {
      Alert.alert(
        t('validation.required', 'Required'),
        t('programs.nameRequired', 'Program name is required')
      );
      return false;
    }

    if (serviceConfigurations.size === 0) {
      Alert.alert(
        t('validation.required', 'Required'), 
        t('programs.tasksRequired', 'At least one service reminder is required')
      );
      return false;
    }

    return true;
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
        reminderOffset: 7,
        isActive: true,
      };

      return task;
    });
  };

  // Handle save program
  const handleSaveProgram = async () => {
    if (!validateForm() || !program || !user) return;
    
    setSaving(true);
    
    try {
      const programTasks = createProgramTasks();
      
      const updateData: Partial<MaintenanceProgram> = {
        name: programName.trim(),
        description: programDescription.trim(),
        tasks: programTasks,
        updatedAt: new Date(),
      };

      await programRepository.update(program.id, updateData);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('programs.programUpdated', 'Program updated successfully!'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating program:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.updateError', 'Failed to update program. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('programs.loadingProgram', 'Loading program...')} />
      </View>
    );
  }

  if (error || !program) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('common.error', 'Error')}
          message={error || t('programs.programNotFound', 'Program not found')}
          icon="⚠️"
          primaryAction={{
            title: t('common.back', 'Back'),
            onPress: () => navigation.goBack(),
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Program Info Section */}
        <Card variant="outlined" style={styles.infoCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('programs.programInfo', 'Program Information')}
          </Typography>
          
          <Input
            label={t('programs.programName', 'Program Name')}
            value={programName}
            onChangeText={setProgramName}
            placeholder={t('programs.programNamePlaceholder', 'e.g., Basic Maintenance, Performance Package')}
            style={styles.input}
          />
          
          <Input
            label={t('programs.programDescription', 'Description (Optional)')}
            value={programDescription}
            onChangeText={setProgramDescription}
            placeholder={t('programs.programDescriptionPlaceholder', 'Describe this maintenance program...')}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Card>

        {/* Services Section */}
        <Card variant="outlined" style={styles.servicesCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('programs.services', 'Services')} ({serviceConfigurations.size})
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
        </Card>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <Button
          title={t('common.cancel', 'Cancel')}
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        />
        <Button
          title={t('programs.saveChanges', 'Save Changes')}
          variant="primary"
          onPress={handleSaveProgram}
          loading={saving}
          disabled={serviceConfigurations.size === 0}
          style={styles.saveButton}
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
  
  // Info Card
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  
  // Services Card
  servicesCard: {
    marginBottom: theme.spacing.lg,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
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
    backgroundColor: `${theme.colors.primary}10`,
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
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});

// Bottom Sheet Styles (same as CreateProgramServicesScreen)
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
    maxHeight: '85%',
    paddingBottom: 0, // Remove fixed padding, let actions handle it
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
  scrollContent: {
    flex: 1,
    maxHeight: 400, // Maximum scroll area height
  },
  scrollContentContainer: {
    paddingBottom: theme.spacing.md,
  },
  actions: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl, // Add proper bottom padding for safe area
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
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

export default EditProgramScreen;