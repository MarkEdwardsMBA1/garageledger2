// Edit Service Modal - Reuses Shop Service patterns for consistency
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import MaintenanceCategoryPicker from '../common/MaintenanceCategoryPicker';
import { MaintenanceLog, SelectedService } from '../../types';
import { XCircleIcon } from '../icons';

interface EditServiceModalProps {
  visible: boolean;
  service: MaintenanceLog;
  onSave: (updatedService: MaintenanceLog) => Promise<void>;
  onCancel: () => void;
}

interface EditServiceFormData {
  date: Date;
  mileage: string;
  totalCost: string;
  services: SelectedService[];
  notes: string;
  shopName: string;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  visible,
  service,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  
  // Initialize form data from existing service
  const [formData, setFormData] = useState<EditServiceFormData>({
    date: service.date,
    mileage: service.mileage.toString(),
    totalCost: service.totalCost?.toString() || '',
    services: service.services || [],
    notes: service.notes || '',
    shopName: service.shopName || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        date: service.date,
        mileage: service.mileage.toString(),
        totalCost: service.totalCost?.toString() || '',
        services: service.services || [],
        notes: service.notes || '',
        shopName: service.shopName || '',
      });
      setValidationErrors([]);
    }
  }, [service]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.date) {
      errors.push('Date is required');
    }

    if (!formData.mileage.trim()) {
      errors.push('Mileage is required');
    } else {
      const mileage = parseInt(formData.mileage);
      if (isNaN(mileage) || mileage < 0) {
        errors.push('Mileage must be a valid positive number');
      }
    }

    if (formData.totalCost.trim()) {
      const cost = parseFloat(formData.totalCost);
      if (isNaN(cost) || cost < 0) {
        errors.push('Total cost must be a valid positive number');
      }
    }

    if (formData.services.length === 0) {
      errors.push('At least one service must be selected');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        validationErrors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const updatedService: MaintenanceLog = {
        ...service,
        date: formData.date,
        mileage: parseInt(formData.mileage),
        totalCost: formData.totalCost.trim() ? parseFloat(formData.totalCost) : undefined,
        services: formData.services,
        notes: formData.notes.trim() || undefined,
        shopName: formData.shopName.trim() || undefined,
      };

      await onSave(updatedService);
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert(
        'Error',
        'Failed to save service changes. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleServicesChange = (services: SelectedService[]) => {
    setFormData(prev => ({ ...prev, services }));
    setShowServicePicker(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Typography variant="heading" style={styles.headerTitle}>
          Edit Service
        </Typography>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.closeButton}
        >
          <XCircleIcon size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <Card variant="elevated" style={styles.section}>
      <Typography variant="subheading" style={styles.sectionTitle}>
        Basic Information
      </Typography>

      {/* Date Input */}
      <View style={styles.inputGroup}>
        <Typography variant="label" style={styles.inputLabel}>
          Service Date *
        </Typography>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Typography variant="body">
            {formData.date.toLocaleDateString()}
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Mileage Input */}
      <View style={styles.inputGroup}>
        <Typography variant="label" style={styles.inputLabel}>
          Mileage *
        </Typography>
        <Input
          value={formData.mileage}
          onChangeText={(text) => setFormData(prev => ({ ...prev, mileage: text }))}
          placeholder="Current mileage"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* Total Cost Input */}
      <View style={styles.inputGroup}>
        <Typography variant="label" style={styles.inputLabel}>
          Total Cost
        </Typography>
        <Input
          value={formData.totalCost}
          onChangeText={(text) => setFormData(prev => ({ ...prev, totalCost: text }))}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>

      {/* Shop Name (if it's a shop service) */}
      {service.serviceType === 'shop' && (
        <View style={styles.inputGroup}>
          <Typography variant="label" style={styles.inputLabel}>
            Shop Name
          </Typography>
          <Input
            value={formData.shopName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, shopName: text }))}
            placeholder="Service shop name"
            style={styles.input}
          />
        </View>
      )}
    </Card>
  );

  const renderServices = () => (
    <Card variant="elevated" style={styles.section}>
      <Typography variant="subheading" style={styles.sectionTitle}>
        Services Performed *
      </Typography>
      
      {/* Selected Services Display */}
      {formData.services.length > 0 ? (
        <View style={styles.selectedServicesContainer}>
          {formData.services.map((service, index) => (
            <View key={`${service.categoryKey}-${service.subcategoryKey}-${index}`} style={styles.selectedService}>
              <Typography variant="body" style={styles.selectedServiceText}>
                {service.serviceName}
              </Typography>
            </View>
          ))}
        </View>
      ) : (
        <Typography variant="body" style={styles.noServicesText}>
          No services selected
        </Typography>
      )}

      {/* Edit Services Button */}
      <Button
        title="Edit Services"
        variant="outline"
        onPress={() => setShowServicePicker(true)}
        style={styles.editServicesButton}
      />
    </Card>
  );

  const renderNotes = () => (
    <Card variant="elevated" style={styles.section}>
      <Typography variant="subheading" style={styles.sectionTitle}>
        Notes
      </Typography>
      
      <Input
        value={formData.notes}
        onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
        placeholder="Additional notes about this service..."
        multiline
        numberOfLines={4}
        style={styles.notesInput}
      />
    </Card>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <Button
        title="Cancel"
        variant="outline"
        onPress={onCancel}
        style={styles.actionButton}
      />
      <Button
        title="Save Changes"
        variant="primary"
        onPress={handleSave}
        loading={isLoading}
        style={styles.actionButton}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        {renderHeader()}
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderBasicInfo()}
          {renderServices()}
          {renderNotes()}
        </ScrollView>

        {renderActions()}

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Service Picker Modal */}
        <MaintenanceCategoryPicker
          visible={showServicePicker}
          selectedServices={formData.services}
          onSelectionComplete={handleServicesChange}
          onCancel={() => setShowServicePicker(false)}
          allowMultiple={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  headerTitle: {
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Form inputs
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  input: {
    marginBottom: 0,
  },
  notesInput: {
    marginBottom: 0,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Date picker
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },

  // Selected Services Display
  selectedServicesContainer: {
    marginBottom: theme.spacing.md,
  },
  selectedService: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  selectedServiceText: {
    color: theme.colors.text,
  },
  noServicesText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  editServicesButton: {
    marginTop: theme.spacing.sm,
  },
});

export default EditServiceModal;