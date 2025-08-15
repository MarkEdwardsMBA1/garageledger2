// Create Program - Step 2: Program Details
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { TrashIcon } from '../components/icons';
import { AddServiceReminderModal } from '../components/common/AddServiceReminderModal';
import { programRepository } from '../repositories/SecureProgramRepository';
import { MaintenanceProgram, ProgramTask, Vehicle } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RouteParams {
  selectedVehicleIds: string[];
  selectedVehicles: Vehicle[];
}

/**
 * Create Program - Step 2: Program Details Screen
 * Second step in the two-screen Create Program flow
 */
const CreateProgramDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuth();
  const { selectedVehicleIds, selectedVehicles } = route.params as RouteParams;
  
  // Program form state
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [serviceReminders, setServiceReminders] = useState<ProgramTask[]>([]);
  
  // UI state
  const [loading, setSaving] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Auto-suggest program name based on selected vehicles
  useEffect(() => {
    updateProgramNameSuggestion();
  }, [selectedVehicles]);

  const updateProgramNameSuggestion = () => {
    if (selectedVehicles.length === 1) {
      const vehicle = selectedVehicles[0];
      const vehicleName = getVehicleDisplayName(vehicle);
      setProgramName(`${vehicleName} Maintenance`);
    } else {
      setProgramName(t('programs.multiVehicleProgram', 'Multi-Vehicle Maintenance Program'));
    }
  };

  // Get display name for vehicle
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Handle adding service reminder from modal
  const handleAddServiceReminder = (serviceReminder: ProgramTask) => {
    setServiceReminders([...serviceReminders, serviceReminder]);
    setShowAddServiceModal(false);
  };

  // Handle service reminder removal
  const handleRemoveService = (reminderId: string) => {
    setServiceReminders(serviceReminders.filter(reminder => reminder.id !== reminderId));
  };

  // Form validation
  const validateProgram = (): boolean => {
    if (!programName.trim()) {
      Alert.alert(t('validation.required', 'Required'), t('programs.nameRequired', 'Program name is required'));
      return false;
    }
    
    if (serviceReminders.length === 0) {
      Alert.alert(t('validation.required', 'Required'), t('programs.tasksRequired', 'At least one service reminder is required'));
      return false;
    }

    return true;
  };

  // Handle program save
  const handleSaveProgram = async () => {
    if (!validateProgram() || !user) return;
    
    setSaving(true);
    try {
      const programId = `program_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Build program object, excluding undefined fields for Firestore compatibility
      const programData: Partial<MaintenanceProgram> = {
        id: programId,
        userId: user.uid,
        name: programName.trim(),
        tasks: serviceReminders as ProgramTask[],
        assignedVehicleIds: selectedVehicleIds,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Only add description if it has content
      const trimmedDescription = programDescription.trim();
      if (trimmedDescription) {
        programData.description = trimmedDescription;
      }
      
      // Also ensure all task fields are Firestore-compatible
      const cleanedTasks = serviceReminders.map(task => {
        const cleanedTask: any = {
          id: task.id,
          name: task.name,
          category: task.category,
          intervalType: task.intervalType,
          reminderOffset: task.reminderOffset || 7,
          isActive: task.isActive ?? true,
        };
        
        // Add required interval values based on type
        if (task.intervalValue !== undefined) {
          cleanedTask.intervalValue = task.intervalValue;
        }
        if (task.timeIntervalValue !== undefined) {
          cleanedTask.timeIntervalValue = task.timeIntervalValue;
        }
        if (task.timeIntervalUnit) {
          cleanedTask.timeIntervalUnit = task.timeIntervalUnit;
        }
        
        // Only add optional fields if they have values
        if (task.description?.trim()) {
          cleanedTask.description = task.description.trim();
        }
        if (task.estimatedCost !== undefined && task.estimatedCost > 0) {
          cleanedTask.estimatedCost = task.estimatedCost;
        }
        
        return cleanedTask;
      });
      
      programData.tasks = cleanedTasks;

      await programRepository.create(programData as MaintenanceProgram);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('programs.programCreated', 'Program created successfully!'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Programs'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating program:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.createError', 'Failed to create program. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };


  // Render service reminder item
  const renderServiceItem = (reminder: ProgramTask, index: number) => (
    <Card key={reminder.id} variant="outlined" style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Typography variant="heading" style={styles.serviceName}>
            {reminder.name}
          </Typography>
          {reminder.description && (
            <Typography variant="body" style={styles.serviceDescription}>
              {reminder.description}
            </Typography>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => handleRemoveService(reminder.id)}
          style={styles.removeButton}
        >
          <TrashIcon size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.serviceDetails}>
        <Typography variant="caption" style={styles.serviceDetail}>
          {reminder.intervalType === 'mileage' && `${reminder.intervalValue} ${t('vehicles.miles', 'miles')}`}
          {reminder.intervalType === 'time' && `${reminder.timeIntervalValue} ${reminder.timeIntervalUnit}`}
          {reminder.intervalType === 'either' && `${reminder.intervalValue} ${t('vehicles.miles', 'miles')} OR ${reminder.timeIntervalValue} ${reminder.timeIntervalUnit}`}
        </Typography>
        
        {reminder.estimatedCost && (
          <Typography variant="caption" style={styles.serviceDetail}>
            ${reminder.estimatedCost}
          </Typography>
        )}
      </View>
    </Card>
  );

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
      <ProgressBar currentStep={2} totalSteps={2} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Main form card */}
        <Card variant="elevated" style={styles.formCard}>
          <Typography variant="title" style={styles.screenTitle}>
            {t('programs.createProgram', 'Create Program')}
          </Typography>
          <Typography variant="body" style={styles.screenSubtitle}>
            {t('programs.createDescription', 'Build a comprehensive maintenance program with service reminders.')}
          </Typography>

          {/* Section 1: Program Name */}
          <View style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.programName', 'Program Name')}
            </Typography>
          
          <Input
            label={t('programs.name', 'Name')}
            placeholder={t('programs.programNameAutoSuggest', 'Auto-suggested based on selected vehicles')}
            value={programName}
            onChangeText={setProgramName}
            required
          />
          
          <Input
            label={t('programs.programDescription', 'Description (Optional)')}
            placeholder={t('programs.programDescriptionPlaceholder', 'Describe this maintenance program...')}
            value={programDescription}
            onChangeText={setProgramDescription}
            multiline
            numberOfLines={3}
          />
          </View>

          {/* Section 2: Service Reminders */}
          <View style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.addServices', 'Add Services')}
            </Typography>
          
          {/* Helper text to encourage comprehensive programs */}
          <Typography variant="body" style={styles.helperText}>
            Build a comprehensive maintenance program by adding multiple service reminders. Each reminder will notify you when it's time to perform specific maintenance.
          </Typography>
          
          {/* Add Service Reminder Button */}
          <Button
            title={t('programs.addServiceReminder', 'Add Service Reminder')}
            onPress={() => setShowAddServiceModal(true)}
            style={styles.addServiceButton}
            variant="primary"
          />
          
          {/* Show added services */}
          {serviceReminders.length > 0 && (
            <View style={styles.servicesContainer}>
              <Typography variant="subheading" style={styles.servicesTitle}>
                {t('programs.addedServices', 'Added Services')} ({serviceReminders.length})
              </Typography>
              {serviceReminders.map(renderServiceItem)}
            </View>
          )}
          </View>
        </Card>

      </ScrollView>

      {/* Add Service Reminder Modal */}
      <AddServiceReminderModal
        visible={showAddServiceModal}
        onCancel={() => setShowAddServiceModal(false)}
        onAddService={handleAddServiceReminder}
      />

      {/* Save Button */}
      <View style={styles.actionBar}>
        <Button
          title={t('programs.saveProgram', 'Save Program')}
          onPress={handleSaveProgram}
          disabled={!programName.trim() || serviceReminders.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for footer
  },
  
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  
  section: {
    marginBottom: theme.spacing.xl,
  },
  
  screenTitle: {
    marginBottom: theme.spacing.sm,
  },
  
  screenSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  
  helperText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  
  addServiceButton: {
    marginTop: theme.spacing.md,
  },
  
  servicesContainer: {
    marginTop: theme.spacing.lg,
  },
  
  servicesTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  // Service Item Styles
  serviceCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  
  serviceInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  
  serviceName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  serviceDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  removeButton: {
    padding: theme.spacing.xs,
  },
  
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  
  serviceDetail: {
    color: theme.colors.textSecondary,
  },
  
  
  
  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateProgramDetailsScreen;