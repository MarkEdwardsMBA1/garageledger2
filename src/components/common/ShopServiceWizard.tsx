// Shop Service Wizard - Progressive form for logging shop maintenance
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { MaintenanceCategoryPicker } from './MaintenanceCategoryPicker';
import { PhotoPicker } from './PhotoPicker';
// import { AttachmentIcon, PhotoCameraIcon, LockIcon } from '../icons';
import { SelectedService, AdvancedServiceConfiguration } from '../../types';

export interface ShopServiceData {
  date: Date;
  mileage: string;
  totalCost: string;
  services: SelectedService[];
  photos: string[];
  notes: string;
}

interface ShopServiceWizardProps {
  visible: boolean;
  onComplete: (data: ShopServiceData) => void;
  onCancel: () => void;
  userTier?: 'free' | 'pro'; // For upgrade prompts
}

type WizardStep = 'basic' | 'services' | 'photos' | 'notes';

export const ShopServiceWizard: React.FC<ShopServiceWizardProps> = ({
  visible,
  onComplete,
  onCancel,
  userTier = 'free'
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const [formData, setFormData] = useState<ShopServiceData>({
    date: new Date(),
    mileage: '',
    totalCost: '',
    services: [],
    photos: [],
    notes: ''
  });

  // Reset form when modal closes
  const handleCancel = () => {
    setCurrentStep('basic');
    setFormData({
      date: new Date(),
      mileage: '',
      totalCost: '',
      services: [],
      photos: [],
      notes: ''
    });
    onCancel();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On iOS, the modal picker will auto-dismiss after selection
    // On Android, we need to explicitly hide it
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
      // Auto-hide picker after successful selection on iOS too
      setShowDatePicker(false);
    } else if (event.type === 'dismissed') {
      // User cancelled the picker
      setShowDatePicker(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canProceedFromBasic = () => {
    return formData.mileage.trim() !== '' && 
           formData.totalCost.trim() !== '' &&
           !isNaN(parseFloat(formData.totalCost)) &&
           !isNaN(parseInt(formData.mileage));
  };

  const canProceedFromServices = () => {
    return formData.services.length > 0;
  };

  const handleComplete = () => {
    onComplete(formData);
    handleCancel(); // Reset form
  };

  const renderStepIndicator = () => {
    const steps: { key: WizardStep; label: string }[] = [
      { key: 'basic', label: 'Basic Info' },
      { key: 'services', label: 'Services' },
      { key: 'photos', label: 'Photos' },
      { key: 'notes', label: 'Notes' }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <Typography variant="caption" style={[
              styles.stepLabel,
              index <= currentStepIndex && styles.stepLabelActive
            ]}>
              {step.label}
            </Typography>
            <View style={[
              styles.stepCircle,
              index <= currentStepIndex && styles.stepCircleActive
            ]}>
              <Typography variant="caption" style={[
                styles.stepNumber,
                index <= currentStepIndex && styles.stepNumberActive
              ]}>
                {index + 1}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Step 1: Basic Information
  const renderBasicInfoStep = () => (
    <ScrollView style={styles.stepContent}>
      <Typography variant="title" style={styles.stepTitle}>
        Basic Information
      </Typography>
      
      <View style={styles.formSection}>
        <Typography variant="label" style={styles.fieldLabel}>
          Service Date
        </Typography>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Typography variant="bodyLarge" style={styles.dateValue}>
            {formatDate(formData.date)}
          </Typography>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.formSection}>
        <Input
          label="Odometer Reading"
          value={formData.mileage}
          onChangeText={(mileage) => setFormData(prev => ({ ...prev, mileage }))}
          placeholder="75000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formSection}>
        <Input
          label="Total Cost"
          value={formData.totalCost}
          onChangeText={(totalCost) => setFormData(prev => ({ ...prev, totalCost }))}
          placeholder="245.50"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={handleCancel}
          style={styles.button}
        />
        <Button
          title="Next Step"
          variant="primary"
          onPress={() => setCurrentStep('services')}
          style={styles.button}
          disabled={!canProceedFromBasic()}
        />
      </View>
    </ScrollView>
  );

  // Step 2: Service Categories
  const renderServiceCategoriesStep = () => (
    <ScrollView style={styles.stepContent}>
      <Typography variant="title" style={styles.stepTitle}>
        Select Services Performed
      </Typography>
      
      {/* Show selected services */}
      {formData.services.length > 0 && (
        <Card variant="outlined" style={styles.selectedServicesCard}>
          <Typography variant="bodyLarge" style={styles.selectedServicesTitle}>
            Selected Services ({formData.services.length})
          </Typography>
          {formData.services.map((service, index) => (
            <Typography key={index} variant="body" style={styles.selectedServiceItem}>
              • {service.serviceName}
            </Typography>
          ))}
        </Card>
      )}

      {/* Button to open category picker */}
      <Button
        title={formData.services.length > 0 ? "Edit Services" : "Select Services"}
        variant="outline"
        onPress={() => setShowCategoryPicker(true)}
        style={styles.selectServicesButton}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          variant="outline"
          onPress={() => setCurrentStep('basic')}
          style={styles.button}
        />
        <Button
          title="Next Step"
          variant="primary"
          onPress={() => setCurrentStep('photos')}
          style={styles.button}
          disabled={!canProceedFromServices()}
        />
      </View>
    </ScrollView>
  );

  // Step 3: Photos & Receipt with upgrade prompts
  const renderPhotosStep = () => (
    <ScrollView style={styles.stepContent}>
      <Typography variant="title" style={styles.stepTitle}>
        Receipt & Photos
      </Typography>
      
      {userTier === 'free' ? (
        // Upgrade prompts for free users
        <View style={styles.upgradeSection}>
          <Card variant="outlined" style={styles.upgradeCard}>
            <Typography variant="bodyLarge" style={styles.upgradeTitle}>
              📄 Upload Receipt 🔒
            </Typography>
            <Typography variant="body" style={styles.upgradeDescription}>
              Upgrade to Pro to upload receipts and keep better maintenance records
            </Typography>
            <Button
              title="Upgrade to Pro"
              variant="primary"
              size="sm"
              onPress={() => {/* TODO: Navigate to upgrade screen */}}
              style={styles.upgradeButton}
            />
          </Card>

          <Card variant="outlined" style={styles.upgradeCard}>
            <Typography variant="bodyLarge" style={styles.upgradeTitle}>
              📸 Additional Photos 🔒
            </Typography>
            <Typography variant="body" style={styles.upgradeDescription}>
              Upgrade to Pro for photo storage and organization
            </Typography>
            <Button
              title="Upgrade to Pro"
              variant="primary" 
              size="sm"
              onPress={() => {/* TODO: Navigate to upgrade screen */}}
              style={styles.upgradeButton}
            />
          </Card>
        </View>
      ) : (
        // Full photo functionality for Pro users
        <View style={styles.formSection}>
          <PhotoPicker
            onPhotoSelected={(photoUri) => {
              setFormData(prev => ({ 
                ...prev, 
                photos: [...prev.photos, photoUri] 
              }));
            }}
            placeholder="Add receipt or service photos"
          />
          
          {formData.photos.length > 0 && (
            <View style={styles.photoList}>
              {formData.photos.map((photoUri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Typography variant="bodySmall">
                    Photo {index + 1}
                  </Typography>
                  <Button
                    title="Remove"
                    variant="text"
                    size="sm"
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        photos: prev.photos.filter((_, i) => i !== index)
                      }));
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          variant="outline"
          onPress={() => setCurrentStep('services')}
          style={styles.button}
        />
        <Button
          title="Next Step"
          variant="primary"
          onPress={() => setCurrentStep('notes')}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );

  // Step 4: Notes (final step)
  const renderNotesStep = () => (
    <ScrollView style={styles.stepContent}>
      <Typography variant="title" style={styles.stepTitle}>
        Final Details
      </Typography>
      
      <View style={styles.formSection}>
        <Input
          label="Notes (Optional)"
          value={formData.notes}
          onChangeText={(notes) => setFormData(prev => ({ ...prev, notes }))}
          placeholder="Additional notes about the service..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Summary */}
      <Card variant="elevated" style={styles.summaryCard}>
        <Typography variant="heading" style={styles.summaryTitle}>
          Summary
        </Typography>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Typography variant="label" style={styles.summaryLabel}>
              Date:
            </Typography>
            <Typography variant="body" style={styles.summaryValue}>
              {formatDate(formData.date)}
            </Typography>
          </View>
          <View style={styles.summaryRow}>
            <Typography variant="label" style={styles.summaryLabel}>
              Mileage:
            </Typography>
            <Typography variant="body" style={styles.summaryValue}>
              {formData.mileage} miles
            </Typography>
          </View>
          <View style={styles.summaryRow}>
            <Typography variant="label" style={styles.summaryLabel}>
              Total Cost:
            </Typography>
            <Typography variant="body" style={styles.summaryValue}>
              ${formData.totalCost}
            </Typography>
          </View>
          <View style={styles.summaryRow}>
            <Typography variant="label" style={styles.summaryLabel}>
              Services:
            </Typography>
            <Typography variant="body" style={styles.summaryValue}>
              {formData.services.length} selected
            </Typography>
          </View>
        </View>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          variant="outline"
          onPress={() => setCurrentStep('photos')}
          style={styles.button}
        />
        <Button
          title="Save Log"
          variant="primary"
          onPress={handleComplete}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicInfoStep();
      case 'services':
        return renderServiceCategoriesStep();
      case 'photos':
        return renderPhotosStep();
      case 'notes':
        return renderNotesStep();
      default:
        return renderBasicInfoStep();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {renderStepIndicator()}
        {renderCurrentStep()}
      </View>

      {/* Category Picker Modal */}
      <MaintenanceCategoryPicker
        visible={showCategoryPicker}
        selectedServices={formData.services}
        onSelectionComplete={(services) => {
          setFormData(prev => ({ ...prev, services }));
          setShowCategoryPicker(false);
        }}
        onCancel={() => setShowCategoryPicker(false)}
        serviceType="shop"
        enableConfiguration={false}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  stepNumberActive: {
    color: theme.colors.surface,
  },
  stepLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Step Content
  stepContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  // Form Elements
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  dateSelector: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  dateValue: {
    color: theme.colors.text,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
  },

  // Upgrade Prompts
  upgradeSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  upgradeCard: {
    padding: theme.spacing.lg,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  upgradeTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  upgradeDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },

  // Photos
  photoList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  photoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
  },

  // Summary
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryContent: {
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 2,
    textAlign: 'right',
  },

  // Service Selection
  selectedServicesCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  selectedServicesTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  selectedServiceItem: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
  },
  selectServicesButton: {
    marginBottom: theme.spacing.lg,
  },
});