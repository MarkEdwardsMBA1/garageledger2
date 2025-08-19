// Add Program screen for creating new maintenance programs
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { MaintenanceIcon, TrashIcon } from '../components/icons';
import { programRepository } from '../repositories/SecureProgramRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { MaintenanceProgram, ProgramTask, Vehicle } from '../types';
import { MAINTENANCE_CATEGORIES, getCategoryName, getSubcategoryName } from '../types/MaintenanceCategories';
import { useAuth } from '../contexts/AuthContext';

/**
 * Add Program screen - create new maintenance programs with tasks
 * Implements comprehensive program creation flow with form validation
 */
const AddProgramScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Vehicle data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  
  // Program form state
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [serviceReminders, setServiceReminders] = useState<Partial<ProgramTask>[]>([]);
  
  // Service reminder form state
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [selectedIntervalType, setSelectedIntervalType] = useState<'mileage' | 'time' | 'dual'>('mileage');
  const [newReminder, setNewReminder] = useState<Partial<ProgramTask>>({
    name: '',
    description: '',
    category: '',
    intervalType: 'mileage',
    intervalValue: undefined,
    timeIntervalUnit: 'months',
    timeIntervalValue: undefined,
    estimatedCost: undefined,
    reminderOffset: 7,
    isActive: true,
  });
  
  // UI state
  const [loading, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Load user vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    if (!user) return;
    
    try {
      setVehiclesLoading(true);
      setVehiclesError(null);
      const userVehicles = await vehicleRepository.getUserVehicles();
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehiclesError(t('vehicles.loadError', 'Failed to load vehicles'));
    } finally {
      setVehiclesLoading(false);
    }
  };

  // Handle vehicle selection
  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      const newSelection = prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)  // Remove if already selected
        : [...prev, vehicleId];                // Add if not selected
      
      // Auto-suggest program name based on new selection
      updateProgramNameSuggestion(newSelection);
      
      return newSelection;
    });
  };

  // Update program name suggestion based on selected vehicles
  const updateProgramNameSuggestion = (vehicleIds: string[]) => {
    // Only auto-suggest if the user hasn't manually edited the name
    if (programName && !isDefaultSuggestedName(programName)) {
      return; // User has customized the name, don't override
    }
    
    if (vehicleIds.length === 0) {
      setProgramName('');
      return;
    }
    
    const selectedVehicles = vehicles.filter(v => vehicleIds.includes(v.id));
    
    if (selectedVehicles.length === 1) {
      // Single vehicle: use vehicle name or make/model/year
      const vehicle = selectedVehicles[0];
      const vehicleName = getVehicleDisplayName(vehicle);
      setProgramName(`${vehicleName} Maintenance`);
    } else {
      // Multiple vehicles: generic multi-vehicle name
      setProgramName(t('programs.multiVehicleProgram', 'Multi-Vehicle Maintenance Program'));
    }
  };

  // Check if current name is a default suggested name (to avoid overriding user edits)
  const isDefaultSuggestedName = (name: string): boolean => {
    if (!name) return true;
    if (name.endsWith(' Maintenance')) return true;
    if (name === t('programs.multiVehicleProgram', 'Multi-Vehicle Maintenance Program')) return true;
    return false;
  };

  // Get display name for vehicle
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Handle interval type selection (progressive disclosure)
  const handleIntervalTypeChange = (type: 'mileage' | 'time' | 'dual') => {
    setSelectedIntervalType(type);
    
    // Update newReminder state based on selected interval type
    setNewReminder(prev => ({
      ...prev,
      intervalType: type,
      // Reset values when changing types to avoid confusion
      intervalValue: undefined,
      timeIntervalValue: undefined,
      timeIntervalUnit: type === 'time' || type === 'dual' ? 'months' : prev.timeIntervalUnit,
    }));
  };

  // Form validation
  const validateProgram = (): boolean => {
    if (selectedVehicleIds.length === 0) {
      Alert.alert(t('validation.required', 'Required'), t('programs.vehicleRequired', 'Please select at least one vehicle for this program'));
      return false;
    }
    
    if (!programName.trim()) {
      Alert.alert(t('validation.required', 'Required'), t('programs.nameRequired', 'Program name is required'));
      return false;
    }
    
    if (serviceReminders.length === 0) {
      Alert.alert(t('validation.required', 'Required'), t('programs.tasksRequired', 'At least one service reminder is required'));
      return false;
    }

    // Validate each service reminder
    for (const reminder of serviceReminders) {
      if (!reminder.name?.trim()) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskNameRequired', 'All service reminders must have a name'));
        return false;
      }
      if (!reminder.category) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskCategoryRequired', 'All service reminders must have a category'));
        return false;
      }
      // Validate intervals based on interval type
      if (reminder.intervalType === 'mileage') {
        if (!reminder.intervalValue || reminder.intervalValue <= 0) {
          Alert.alert(t('validation.required', 'Required'), t('programs.taskIntervalRequired', 'All service reminders must have a valid interval'));
          return false;
        }
      } else if (reminder.intervalType === 'time') {
        if (!reminder.timeIntervalValue || reminder.timeIntervalValue <= 0) {
          Alert.alert(t('validation.required', 'Required'), t('programs.taskIntervalRequired', 'All service reminders must have a valid interval'));
          return false;
        }
      } else if (reminder.intervalType === 'dual') {
        if (!reminder.intervalValue || reminder.intervalValue <= 0 || !reminder.timeIntervalValue || reminder.timeIntervalValue <= 0) {
          Alert.alert(t('validation.required', 'Required'), t('programs.taskDualIntervalRequired', 'Service reminders with "Mileage and Time" must have both valid intervals'));
          return false;
        }
      }
    }

    return true;
  };

  // Handle service reminder creation
  const handleAddTask = () => {
    if (!newReminder.name?.trim()) {
      Alert.alert(t('validation.required', 'Required'), t('programs.taskNameRequired', 'Service reminder name is required'));
      return;
    }
    
    if (!newReminder.category) {
      Alert.alert(t('validation.required', 'Required'), t('programs.taskCategoryRequired', 'Service reminder category is required'));
      return;
    }
    
    // Validate intervals based on selected interval type
    if (selectedIntervalType === 'mileage') {
      if (!newReminder.intervalValue || newReminder.intervalValue <= 0) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskIntervalRequired', 'Service reminder interval is required'));
        return;
      }
    } else if (selectedIntervalType === 'time') {
      if (!newReminder.timeIntervalValue || newReminder.timeIntervalValue <= 0) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskIntervalRequired', 'Service reminder interval is required'));
        return;
      }
    } else if (selectedIntervalType === 'dual') {
      if (!newReminder.intervalValue || newReminder.intervalValue <= 0 || !newReminder.timeIntervalValue || newReminder.timeIntervalValue <= 0) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskDualIntervalRequired', 'Service reminders with "Mileage and Time" must have both valid intervals'));
        return;
      }
    }

    // Generate reminder ID and add to list
    const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const completeReminder: ProgramTask = {
      id: reminderId,
      name: newReminder.name!,
      description: newReminder.description || '',
      category: newReminder.category!,
      intervalType: newReminder.intervalType!,
      intervalValue: newReminder.intervalValue!,
      timeIntervalUnit: newReminder.timeIntervalUnit,
      timeIntervalValue: newReminder.timeIntervalValue,
      estimatedCost: newReminder.estimatedCost,
      reminderOffset: newReminder.reminderOffset || 7,
      isActive: newReminder.isActive ?? true,
    };

    setServiceReminders([...serviceReminders, completeReminder]);
    
    // Reset reminder form
    setNewReminder({
      name: '',
      description: '',
      category: '',
      intervalType: 'mileage',
      intervalValue: undefined,
      timeIntervalUnit: 'months',
      timeIntervalValue: undefined,
      estimatedCost: undefined,
      reminderOffset: 7,
      isActive: true,
    });
    setSelectedIntervalType('mileage'); // Reset interval type selector
    setIsAddingReminder(false);
  };

  // Handle service reminder removal
  const handleRemoveTask = (reminderId: string) => {
    setServiceReminders(serviceReminders.filter(reminder => reminder.id !== reminderId));
  };

  // Handle category selection
  const handleCategorySelect = (categoryKey: string, subcategoryKey: string) => {
    const category = `${categoryKey}:${subcategoryKey}`;
    const categoryName = `${getCategoryName(categoryKey)} - ${getSubcategoryName(categoryKey, subcategoryKey)}`;
    
    setNewReminder({ ...newReminder, category });
    setSelectedCategory(categoryKey);
    setSelectedSubcategory(subcategoryKey);
    setShowCategoryPicker(false);
    
    // Auto-suggest reminder name based on category
    if (!newReminder.name?.trim()) {
      setNewReminder({ ...newReminder, category, name: getSubcategoryName(categoryKey, subcategoryKey) });
    }
  };

  // Handle program save
  const handleSaveProgram = async () => {
    if (!validateProgram() || !user) return;
    
    setSaving(true);
    try {
      const programId = `program_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const program: MaintenanceProgram = {
        id: programId,
        userId: user.uid,
        name: programName.trim(),
        description: programDescription.trim() || undefined,
        tasks: serviceReminders as ProgramTask[],
        assignedVehicleIds: selectedVehicleIds,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await programRepository.create(program);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('programs.programCreated', 'Program created successfully!'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
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

  // Render category picker
  const renderCategoryPicker = () => (
    <Card variant="elevated" style={styles.categoryPicker}>
      <Typography variant="subheading" style={styles.categoryTitle}>
        {t('programs.selectCategory', 'Select Maintenance Category')}
      </Typography>
      
      <ScrollView style={styles.categoryList}>
        {Object.entries(MAINTENANCE_CATEGORIES).map(([categoryKey, category]) => (
          <View key={categoryKey} style={styles.categoryGroup}>
            <Typography variant="body" style={styles.categoryGroupName}>
              {category.name}
            </Typography>
            
            {Object.entries(category.subcategories).map(([subcategoryKey, subcategory]) => (
              <TouchableOpacity
                key={subcategoryKey}
                style={styles.subcategoryItem}
                onPress={() => handleCategorySelect(categoryKey, subcategoryKey)}
              >
                <Typography variant="body" style={styles.subcategoryName}>
                  {subcategory.name}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      
      <Button
        title={t('common.cancel', 'Cancel')}
        onPress={() => setShowCategoryPicker(false)}
        variant="outline"
        style={styles.cancelButton}
      />
    </Card>
  );

  // Render task item
  const renderTaskItem = (task: Partial<ProgramTask>, index: number) => (
    <Card key={task.id || index} variant="outlined" style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Typography variant="heading" style={styles.taskName}>
            {task.name}
          </Typography>
          {task.description && (
            <Typography variant="body" style={styles.taskDescription}>
              {task.description}
            </Typography>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => task.id && handleRemoveTask(task.id)}
          style={styles.removeButton}
        >
          <TrashIcon size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.taskDetails}>
        <Typography variant="caption" style={styles.taskDetail}>
          {task.intervalValue} {task.intervalType === 'mileage' ? t('vehicles.miles', 'miles') : t('common.days', 'days')}
        </Typography>
        
        {task.estimatedCost && (
          <Typography variant="caption" style={styles.taskDetail}>
            ${task.estimatedCost}
          </Typography>
        )}
        
        <View style={[styles.statusIndicator, { 
          backgroundColor: task.isActive ? theme.colors.success : theme.colors.textSecondary 
        }]} />
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Vehicle Selection */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>
            {t('programs.selectVehicles', 'Select Vehicles')}
          </Typography>
          <Typography variant="body" style={styles.sectionSubtitle}>
            {t('programs.selectVehiclesMessage', 'Choose which vehicles this maintenance program applies to')}
          </Typography>
          
          {vehiclesLoading ? (
            <View style={styles.vehicleLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Typography variant="body" style={styles.vehicleLoadingText}>
                {t('vehicles.loading', 'Loading vehicles...')}
              </Typography>
            </View>
          ) : vehiclesError ? (
            <View style={styles.vehicleErrorContainer}>
              <Typography variant="body" style={styles.vehicleErrorText}>
                {vehiclesError}
              </Typography>
              <Button
                title={t('common.retry', 'Try Again')}
                onPress={loadVehicles}
                variant="outline"
                size="sm"
                style={styles.retryButton}
              />
            </View>
          ) : vehicles.length === 0 ? (
            <View style={styles.noVehiclesContainer}>
              <Typography variant="body" style={styles.noVehiclesText}>
                {t('programs.noVehiclesAvailable', 'No vehicles available. Add a vehicle first.')}
              </Typography>
              <Button
                title={t('vehicles.addVehicle', 'Add Vehicle')}
                onPress={() => navigation.navigate('AddVehicle')}
                variant="primary"
                size="sm"
                style={styles.addVehicleButton}
              />
            </View>
          ) : (
            <View style={styles.vehicleSelector}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleOption,
                    selectedVehicleIds.includes(vehicle.id) && styles.vehicleOptionSelected
                  ]}
                  onPress={() => handleVehicleSelection(vehicle.id)}
                >
                  <View style={styles.vehicleOptionContent}>
                    <Typography
                      variant="body"
                      style={[
                        styles.vehicleOptionText,
                        selectedVehicleIds.includes(vehicle.id) && styles.vehicleOptionTextSelected
                      ]}
                    >
                      {getVehicleDisplayName(vehicle)}
                    </Typography>
                    <View style={[
                      styles.vehicleOptionCheckbox,
                      selectedVehicleIds.includes(vehicle.id) && styles.vehicleOptionCheckboxSelected
                    ]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Program Information */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="title" style={styles.sectionTitle}>
            {t('programs.programName', 'Program Name')}
          </Typography>
          
          <Input
            label={t('programs.programName', 'Program Name')}
            placeholder={selectedVehicleIds.length > 0 ? 
              t('programs.programNameAutoSuggest', 'Auto-suggested based on selected vehicles') :
              t('programs.programNamePlaceholder', 'e.g., Basic Maintenance, Performance Package')
            }
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
        </Card>

        {/* Tasks Section */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.serviceReminderSection}>
            <Typography variant="title" style={styles.sectionTitle}>
              {t('programs.addServiceReminders', 'Add Service Reminders')}
            </Typography>
            <Typography variant="body" style={styles.sectionSubtitle}>
              {t('programs.addServiceRemindersSubtitle', 'Add service reminders to create your maintenance program.')}
            </Typography>
            
            <Button
              title={t('programs.addTask', 'Add Service Reminder')}
              onPress={() => setIsAddingReminder(true)}
              variant="primary"
              style={styles.addServiceReminderButton}
            />
          </View>
          
          {serviceReminders.map(renderTaskItem)}
        </Card>

        {/* Add Service Reminder Form */}
        {isAddingReminder && (
          <Card variant="filled" style={styles.addTaskForm}>
            <Typography variant="subheading" style={styles.addTaskTitle}>
              {t('programs.addNewTask', 'Add New Service Reminder')}
            </Typography>
            
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Typography variant="body" style={styles.categorySelectorLabel}>
                {t('programs.category', 'Category')}
              </Typography>
              <Typography variant="body" style={styles.categorySelectorValue}>
                {newReminder.category ? 
                  `${getCategoryName(selectedCategory)} - ${getSubcategoryName(selectedCategory, selectedSubcategory)}` :
                  t('programs.selectCategory', 'Select category...')
                }
              </Typography>
            </TouchableOpacity>
            
            <Input
              label={t('programs.taskName', 'Service Reminder Name')}
              placeholder={t('programs.taskNamePlaceholder', 'e.g., Oil Change, Brake Inspection')}
              value={newReminder.name}
              onChangeText={(text) => setNewReminder({ ...newReminder, name: text })}
              required
            />
            
            <Input
              label={t('programs.taskDescription', 'Description (Optional)')}
              placeholder={t('programs.taskDescriptionPlaceholder', 'Additional details...')}
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              multiline
              numberOfLines={2}
            />
            
            {/* Progressive Service Interval Selector */}
            <View style={styles.defineServiceIntervals}>
              <Typography variant="subheading" style={styles.intervalSelectorTitle}>
                {t('programs.defineServiceIntervals', 'Define Service Intervals')}
              </Typography>
              
              {/* Interval Type Selector - Core Progressive UX */}
              <View style={styles.intervalTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.intervalTypeSelectorButton,
                    selectedIntervalType === 'mileage' && styles.intervalTypeSelectorButtonActive
                  ]}
                  onPress={() => handleIntervalTypeChange('mileage')}
                >
                  <Typography
                    variant="body"
                    style={[
                      styles.intervalTypeSelectorText,
                      selectedIntervalType === 'mileage' && styles.intervalTypeSelectorTextActive
                    ]}
                  >
                    {t('programs.intervalMileage', 'Mileage')}
                  </Typography>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.intervalTypeSelectorButton,
                    selectedIntervalType === 'time' && styles.intervalTypeSelectorButtonActive
                  ]}
                  onPress={() => handleIntervalTypeChange('time')}
                >
                  <Typography
                    variant="body"
                    style={[
                      styles.intervalTypeSelectorText,
                      selectedIntervalType === 'time' && styles.intervalTypeSelectorTextActive
                    ]}
                  >
                    {t('programs.intervalTime', 'Time')}
                  </Typography>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.intervalTypeSelectorButton,
                    selectedIntervalType === 'dual' && styles.intervalTypeSelectorButtonActive
                  ]}
                  onPress={() => handleIntervalTypeChange('dual')}
                >
                  <Typography
                    variant="body"
                    style={[
                      styles.intervalTypeSelectorText,
                      selectedIntervalType === 'dual' && styles.intervalTypeSelectorTextActive
                    ]}
                  >
                    {t('programs.intervalEither', 'Mileage and Time')}
                  </Typography>
                </TouchableOpacity>
              </View>
              
              {/* Progressive Disclosure: Show relevant inputs based on selection */}
              {selectedIntervalType === 'mileage' && (
                <View style={styles.mileageInputSection}>
                  <Input
                    label={t('programs.intervalMiles', 'Every ___ miles')}
                    placeholder="5000"
                    value={newReminder.intervalValue?.toString()}
                    onChangeText={(text) => setNewReminder({ ...newReminder, intervalValue: parseInt(text) || undefined })}
                    keyboardType="numeric"
                    required
                  />
                </View>
              )}
              
              {selectedIntervalType === 'time' && (
                <View style={styles.timeInputSection}>
                  <View style={styles.timeInputRow}>
                    <Input
                      label={t('programs.intervalTime', 'Every ___')}
                      placeholder={
                        newReminder.timeIntervalUnit === 'days' ? '7' :
                        newReminder.timeIntervalUnit === 'weeks' ? '4' :
                        newReminder.timeIntervalUnit === 'months' ? '6' : '2'
                      }
                      value={newReminder.timeIntervalValue?.toString()}
                      onChangeText={(text) => setNewReminder({ ...newReminder, timeIntervalValue: parseInt(text) || undefined })}
                      keyboardType="numeric"
                      style={styles.timeIntervalInput}
                      required
                    />
                    
                    <View style={styles.timeUnitContainer}>
                      <Typography variant="caption" style={styles.timeUnitLabel}>
                        {t('programs.timeUnit', 'Unit')}
                      </Typography>
                      <View style={styles.timeUnitSelector}>
                        <TouchableOpacity
                          style={[
                            styles.timeUnitButton,
                            newReminder.timeIntervalUnit === 'days' && styles.timeUnitButtonActive
                          ]}
                          onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'days' })}
                        >
                          <Typography
                            variant="caption"
                            style={[
                              styles.timeUnitButtonText,
                              newReminder.timeIntervalUnit === 'days' && styles.timeUnitButtonTextActive
                            ]}
                          >
                            {t('common.days', 'Days')}
                          </Typography>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.timeUnitButton,
                            newReminder.timeIntervalUnit === 'weeks' && styles.timeUnitButtonActive
                          ]}
                          onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'weeks' })}
                        >
                          <Typography
                            variant="caption"
                            style={[
                              styles.timeUnitButtonText,
                              newReminder.timeIntervalUnit === 'weeks' && styles.timeUnitButtonTextActive
                            ]}
                          >
                            {t('common.weeks', 'Weeks')}
                          </Typography>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.timeUnitButton,
                            newReminder.timeIntervalUnit === 'months' && styles.timeUnitButtonActive
                          ]}
                          onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'months' })}
                        >
                          <Typography
                            variant="caption"
                            style={[
                              styles.timeUnitButtonText,
                              newReminder.timeIntervalUnit === 'months' && styles.timeUnitButtonTextActive
                            ]}
                          >
                            {t('common.months', 'Months')}
                          </Typography>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.timeUnitButton,
                            newReminder.timeIntervalUnit === 'years' && styles.timeUnitButtonActive
                          ]}
                          onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'years' })}
                        >
                          <Typography
                            variant="caption"
                            style={[
                              styles.timeUnitButtonText,
                              newReminder.timeIntervalUnit === 'years' && styles.timeUnitButtonTextActive
                            ]}
                          >
                            {t('common.years', 'Years')}
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              
              {selectedIntervalType === 'dual' && (
                <View style={styles.dualInputSection}>
                  <Typography variant="subheading" style={styles.dualInputTitle}>
                    {t('programs.dualIntervalTitle', 'Whichever Occurs First')}
                  </Typography>
                  <Typography variant="caption" style={styles.dualInputSubtitle}>
                    {t('programs.dualIntervalSubtitle', 'Maintenance due when dual condition is met')}
                  </Typography>
                  
                  {/* Mileage Input */}
                  <View style={styles.dualMileageSection}>
                    <Input
                      label={t('programs.intervalMiles', 'Every ___ miles')}
                      placeholder="5000"
                      value={newReminder.intervalValue?.toString()}
                      onChangeText={(text) => setNewReminder({ ...newReminder, intervalValue: parseInt(text) || undefined })}
                      keyboardType="numeric"
                      required
                    />
                  </View>
                  
                  <View style={styles.dualSeparator}>
                    <Typography variant="subheading" style={styles.dualSeparatorText}>
                      {t('programs.dualOr', 'OR')}
                    </Typography>
                  </View>
                  
                  {/* Time Input */}
                  <View style={styles.dualTimeSection}>
                    <View style={styles.timeInputRow}>
                      <Input
                        label={t('programs.intervalTime', 'Every ___')}
                        placeholder={
                          newReminder.timeIntervalUnit === 'days' ? '7' :
                          newReminder.timeIntervalUnit === 'weeks' ? '4' :
                          newReminder.timeIntervalUnit === 'months' ? '6' : '2'
                        }
                        value={newReminder.timeIntervalValue?.toString()}
                        onChangeText={(text) => setNewReminder({ ...newReminder, timeIntervalValue: parseInt(text) || undefined })}
                        keyboardType="numeric"
                        style={styles.timeIntervalInput}
                        required
                      />
                      
                      <View style={styles.timeUnitContainer}>
                        <Typography variant="caption" style={styles.timeUnitLabel}>
                          {t('programs.timeUnit', 'Unit')}
                        </Typography>
                        <View style={styles.timeUnitSelector}>
                          <TouchableOpacity
                            style={[
                              styles.timeUnitButton,
                              newReminder.timeIntervalUnit === 'days' && styles.timeUnitButtonActive
                            ]}
                            onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'days' })}
                          >
                            <Typography
                              variant="caption"
                              style={[
                                styles.timeUnitButtonText,
                                newReminder.timeIntervalUnit === 'days' && styles.timeUnitButtonTextActive
                              ]}
                            >
                              {t('common.days', 'Days')}
                            </Typography>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[
                              styles.timeUnitButton,
                              newReminder.timeIntervalUnit === 'weeks' && styles.timeUnitButtonActive
                            ]}
                            onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'weeks' })}
                          >
                            <Typography
                              variant="caption"
                              style={[
                                styles.timeUnitButtonText,
                                newReminder.timeIntervalUnit === 'weeks' && styles.timeUnitButtonTextActive
                              ]}
                            >
                              {t('common.weeks', 'Weeks')}
                            </Typography>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[
                              styles.timeUnitButton,
                              newReminder.timeIntervalUnit === 'months' && styles.timeUnitButtonActive
                            ]}
                            onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'months' })}
                          >
                            <Typography
                              variant="caption"
                              style={[
                                styles.timeUnitButtonText,
                                newReminder.timeIntervalUnit === 'months' && styles.timeUnitButtonTextActive
                              ]}
                            >
                              {t('common.months', 'Months')}
                            </Typography>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[
                              styles.timeUnitButton,
                              newReminder.timeIntervalUnit === 'years' && styles.timeUnitButtonActive
                            ]}
                            onPress={() => setNewReminder({ ...newReminder, timeIntervalUnit: 'years' })}
                          >
                            <Typography
                              variant="caption"
                              style={[
                                styles.timeUnitButtonText,
                                newReminder.timeIntervalUnit === 'years' && styles.timeUnitButtonTextActive
                              ]}
                            >
                              {t('common.years', 'Years')}
                            </Typography>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <Typography variant="caption" style={styles.dualInputExample}>
                    {t('programs.dualExample', 'Example: Service due every 5,000 miles OR 6 months, whichever comes first')}
                  </Typography>
                </View>
              )}
            </View>
            
            <Input
              label={t('programs.estimatedCost', 'Estimated Cost (Optional)')}
              placeholder="50"
              value={newReminder.estimatedCost?.toString()}
              onChangeText={(text) => setNewReminder({ ...newReminder, estimatedCost: parseFloat(text) || undefined })}
              keyboardType="numeric"
            />
            
            <View style={styles.taskActions}>
              <Button
                title={t('common.cancel', 'Cancel')}
                onPress={() => setIsAddingReminder(false)}
                variant="outline"
                style={styles.taskActionButton}
              />
              
              <Button
                title={t('programs.addTask', 'Add Service Reminder')}
                onPress={handleAddTask}
                style={styles.taskActionButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      {showCategoryPicker && renderCategoryPicker()}

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title={t('programs.createProgram', 'Create Program')}
          onPress={handleSaveProgram}
          disabled={selectedVehicleIds.length === 0 || !programName.trim() || serviceReminders.length === 0}
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
  
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  
  // Tasks Section
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  
  sectionTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
  },
  
  // Service Reminder Section Polish
  serviceReminderSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  addServiceReminderButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
  },
  
  // Vehicle Selection Styles
  vehicleLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  
  vehicleLoadingText: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  
  vehicleErrorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  
  vehicleErrorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
  },
  
  noVehiclesContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  
  noVehiclesText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  
  addVehicleButton: {
    paddingHorizontal: theme.spacing.lg,
  },
  
  vehicleSelector: {
    marginTop: theme.spacing.sm,
  },
  
  vehicleOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  
  vehicleOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}10`,
  },
  
  vehicleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  
  vehicleOptionText: {
    color: theme.colors.text,
    flex: 1,
  },
  
  vehicleOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  vehicleOptionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  
  vehicleOptionCheckboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  
  taskCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  
  taskInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  
  taskName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  taskDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  removeButton: {
    padding: theme.spacing.xs,
  },
  
  taskDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  
  taskDetail: {
    color: theme.colors.textSecondary,
  },
  
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: theme.spacing.lg,
  },
  
  // Add Task Form
  addTaskForm: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  
  addTaskTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  
  categorySelector: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  
  categorySelectorLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  
  categorySelectorValue: {
    color: theme.colors.text,
  },
  
  // Progressive Service Interval Selector Styles
  defineServiceIntervals: {
    marginTop: theme.spacing.md,
  },
  
  intervalSelectorTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  intervalTypeSelector: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  
  intervalTypeSelectorButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  
  intervalTypeSelectorButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  
  intervalTypeSelectorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  intervalTypeSelectorTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  // Progressive Disclosure Input Sections
  mileageInputSection: {
    marginTop: theme.spacing.sm,
  },
  
  timeInputSection: {
    marginTop: theme.spacing.sm,
  },
  
  timeInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-end',
  },
  
  timeIntervalInput: {
    flex: 1,
  },
  
  timeUnitContainer: {
    flex: 1,
  },
  
  timeUnitLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  timeUnitSelector: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  
  timeUnitButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  
  timeUnitButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  
  timeUnitButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  timeUnitButtonTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  dualInputSection: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'solid',
  },
  
  dualInputTitle: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  dualInputSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  
  dualMileageSection: {
    marginBottom: theme.spacing.md,
  },
  
  dualSeparator: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  
  dualSeparatorText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  
  dualTimeSection: {
    marginBottom: theme.spacing.md,
  },
  
  dualInputExample: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  temporaryPlaceholder: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  taskActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  
  taskActionButton: {
    flex: 1,
  },
  
  // Category Picker
  categoryPicker: {
    position: 'absolute',
    top: 50,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    bottom: 50,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    zIndex: 1000,
  },
  
  categoryTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  
  categoryList: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  
  categoryGroup: {
    marginBottom: theme.spacing.lg,
  },
  
  categoryGroupName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xs,
  },
  
  subcategoryItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  
  subcategoryName: {
    color: theme.colors.text,
  },
  
  cancelButton: {
    alignSelf: 'center',
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
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddProgramScreen;