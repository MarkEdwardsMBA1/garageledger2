// Add Service Reminder Modal - Focused modal for adding service reminders to maintenance programs
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { MaintenanceCategorySelector } from './MaintenanceCategorySelector';
import { ProgramTask } from '../../types';
import { getSubcategoryName } from '../../types/MaintenanceCategories';

interface ServiceReminderFormData {
  name: string;
  description: string;
  category: string;
  intervalType: 'mileage' | 'time' | 'dual';
  intervalValue?: number;
  timeIntervalUnit: 'days' | 'weeks' | 'months' | 'years';
  timeIntervalValue?: number;
  estimatedCost?: number;
  reminderOffset: number;
  isActive: boolean;
}

interface AddServiceReminderModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when user cancels the modal */
  onCancel: () => void;
  /** Called when user successfully adds a service reminder */
  onAddService: (serviceReminder: ProgramTask) => void;
}

/**
 * Add Service Reminder Modal
 * Focused modal for adding service reminders with category selection and interval definition
 */
export const AddServiceReminderModal: React.FC<AddServiceReminderModalProps> = ({
  visible,
  onCancel,
  onAddService,
}) => {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState<ServiceReminderFormData>({
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
  const [selectedIntervalType, setSelectedIntervalType] = useState<'mileage' | 'time' | 'dual'>('mileage');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setFormData({
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
      setSelectedIntervalType('mileage');
    }
  }, [visible]);

  // Handle category selection
  const handleCategorySelect = (categoryKey: string, subcategoryKey: string) => {
    const category = `${categoryKey}:${subcategoryKey}`;
    
    setFormData(prev => ({ 
      ...prev, 
      category,
      // Auto-generate name from category
      name: getSubcategoryName(categoryKey, subcategoryKey)
    }));
  };

  // Handle interval type selection
  const handleIntervalTypeChange = (type: 'mileage' | 'time' | 'dual') => {
    setSelectedIntervalType(type);
    
    setFormData(prev => ({
      ...prev,
      intervalType: type,
      // Reset values when changing types
      intervalValue: undefined,
      timeIntervalValue: undefined,
      timeIntervalUnit: type === 'time' || type === 'dual' ? 'months' : prev.timeIntervalUnit,
    }));
  };

  // Validate and add service reminder
  const handleAddServiceReminder = () => {
    if (!formData.category) {
      Alert.alert(t('validation.required', 'Required'), t('programs.taskCategoryRequired', 'Please select a maintenance category first'));
      return;
    }
    
    // Validate intervals based on selected interval type
    if (selectedIntervalType === 'mileage') {
      if (!formData.intervalValue || formData.intervalValue <= 0) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskIntervalRequired', 'Service reminder interval is required'));
        return;
      }
    } else if (selectedIntervalType === 'time') {
      if (!formData.timeIntervalValue || formData.timeIntervalValue <= 0) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskIntervalRequired', 'Service reminder interval is required'));
        return;
      }
    } else if (selectedIntervalType === 'dual') {
      if (!formData.intervalValue || formData.intervalValue <= 0 || !formData.timeIntervalValue || formData.timeIntervalValue <= 0) {
        Alert.alert(t('validation.required', 'Required'), t('programs.taskDualIntervalRequired', 'Service reminders with "Mileage and Time" must have both valid intervals'));
        return;
      }
    }

    // Generate reminder ID and create task
    const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const serviceReminder: ProgramTask = {
      id: reminderId,
      name: formData.name,
      description: formData.description || '',
      category: formData.category,
      intervalType: formData.intervalType,
      intervalValue: formData.intervalValue!,
      timeIntervalUnit: formData.timeIntervalUnit,
      timeIntervalValue: formData.timeIntervalValue,
      estimatedCost: formData.estimatedCost,
      reminderOffset: formData.reminderOffset,
      isActive: formData.isActive,
    };

    onAddService(serviceReminder);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title={t('common.cancel', 'Cancel')}
            variant="text"
            onPress={onCancel}
            style={styles.headerButton}
          />
          <Typography variant="title" style={styles.modalTitle}>
            {t('programs.addServiceReminder', 'Add Service Reminder')}
          </Typography>
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Helper Text */}
          <Typography variant="body" style={styles.helperText}>
            Select a maintenance category and define when you want to be reminded to perform this service.
          </Typography>

          {/* Category Selection */}
          <Card variant="elevated" style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              Maintenance Category
            </Typography>
            
            <MaintenanceCategorySelector
              label={t('programs.category', 'Category')}
              categoryKey={formData.category ? formData.category.split(':')[0] : ''}
              subcategoryKey={formData.category ? formData.category.split(':')[1] : ''}
              onSelectionChange={handleCategorySelect}
              required
            />
          </Card>

          {/* Optional Details */}
          <Card variant="elevated" style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              Additional Details (Optional)
            </Typography>
            
            <Input
              label={t('programs.serviceDescription', 'Description (Optional)')}
              placeholder={t('programs.taskDescriptionPlaceholder', 'Additional details...')}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={2}
            />
            
            <Input
              label={t('programs.estimatedCost', 'Estimated Cost (Optional)')}
              placeholder="50"
              value={formData.estimatedCost?.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(text) || undefined }))}
              keyboardType="numeric"
            />
          </Card>

          {/* Reminder Interval */}
          <Card variant="elevated" style={styles.section}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.defineReminderInterval', 'Define Reminder Interval')}
            </Typography>
            
            {/* Interval Type Selector */}
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
                  value={formData.intervalValue?.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, intervalValue: parseInt(text) || undefined }))}
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
                      formData.timeIntervalUnit === 'days' ? '7' :
                      formData.timeIntervalUnit === 'weeks' ? '4' :
                      formData.timeIntervalUnit === 'months' ? '6' : '2'
                    }
                    value={formData.timeIntervalValue?.toString()}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, timeIntervalValue: parseInt(text) || undefined }))}
                    keyboardType="numeric"
                    style={styles.timeIntervalInput}
                    required
                  />
                  
                  <View style={styles.timeUnitContainer}>
                    <Typography variant="caption" style={styles.timeUnitLabel}>
                      {t('programs.timeUnit', 'Unit')}
                    </Typography>
                    <View style={styles.timeUnitSelector}>
                      {['days', 'weeks', 'months', 'years'].map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.timeUnitButton,
                            formData.timeIntervalUnit === unit && styles.timeUnitButtonActive
                          ]}
                          onPress={() => setFormData(prev => ({ ...prev, timeIntervalUnit: unit as any }))}
                        >
                          <Typography
                            variant="caption"
                            style={[
                              styles.timeUnitButtonText,
                              formData.timeIntervalUnit === unit && styles.timeUnitButtonTextActive
                            ]}
                          >
                            {t(`common.${unit}`, unit.charAt(0).toUpperCase() + unit.slice(1))}
                          </Typography>
                        </TouchableOpacity>
                      ))}
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
                    value={formData.intervalValue?.toString()}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, intervalValue: parseInt(text) || undefined }))}
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
                        formData.timeIntervalUnit === 'days' ? '7' :
                        formData.timeIntervalUnit === 'weeks' ? '4' :
                        formData.timeIntervalUnit === 'months' ? '6' : '2'
                      }
                      value={formData.timeIntervalValue?.toString()}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, timeIntervalValue: parseInt(text) || undefined }))}
                      keyboardType="numeric"
                      style={styles.timeIntervalInput}
                      required
                    />
                    
                    <View style={styles.timeUnitContainer}>
                      <Typography variant="caption" style={styles.timeUnitLabel}>
                        {t('programs.timeUnit', 'Unit')}
                      </Typography>
                      <View style={styles.timeUnitSelector}>
                        {['days', 'weeks', 'months', 'years'].map((unit) => (
                          <TouchableOpacity
                            key={unit}
                            style={[
                              styles.timeUnitButton,
                              formData.timeIntervalUnit === unit && styles.timeUnitButtonActive
                            ]}
                            onPress={() => setFormData(prev => ({ ...prev, timeIntervalUnit: unit as any }))}
                          >
                            <Typography
                              variant="caption"
                              style={[
                                styles.timeUnitButtonText,
                                formData.timeIntervalUnit === unit && styles.timeUnitButtonTextActive
                              ]}
                            >
                              {t(`common.${unit}`, unit.charAt(0).toUpperCase() + unit.slice(1))}
                            </Typography>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
                
                <Typography variant="caption" style={styles.dualInputExample}>
                  {t('programs.dualExample', 'Example: Service due every 5,000 miles OR 6 months, whichever comes first')}
                </Typography>
              </View>
            )}
          </Card>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={t('programs.addServiceReminder', 'Add Service Reminder')}
            onPress={handleAddServiceReminder}
            disabled={!formData.category}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerButton: {
    width: 80,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
  },
  
  // Content
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  helperText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  section: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  // Interval Type Selector
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
  
  // Input Sections
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
  
  // Dual Input Styles
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
  
  // Footer
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default AddServiceReminderModal;