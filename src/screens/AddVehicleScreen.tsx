// Add Vehicle screen for creating new vehicles
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { PhotoPicker } from '../components/common/PhotoPicker';
import { VehicleFormData, Vehicle } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';
import { imageUploadService } from '../services/ImageUploadService';

interface AddVehicleScreenProps {
  navigation: any;
}

/**
 * Add Vehicle screen - form for creating new vehicles
 * Includes validation and Firebase integration
 */
const AddVehicleScreen: React.FC<AddVehicleScreenProps> = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: '',
    vin: '',
    mileage: '',
    notes: '',
    photoUri: '',
  });

  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleFormData> = {};

    // Required fields
    if (!formData.make.trim()) {
      newErrors.make = t('validation.required', 'This field is required');
    }
    if (!formData.model.trim()) {
      newErrors.model = t('validation.required', 'This field is required');
    }
    if (!formData.year.trim()) {
      newErrors.year = t('validation.required', 'This field is required');
    }

    // Year validation
    if (formData.year.trim()) {
      const yearNum = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = t('validation.invalidYear', 'Please enter a valid year');
      }
    }

    // Mileage validation (if provided)
    if (formData.mileage.trim()) {
      const mileageNum = parseInt(formData.mileage.replace(/,/g, ''));
      if (isNaN(mileageNum) || mileageNum < 0) {
        newErrors.mileage = t('validation.invalidMileage', 'Please enter a valid mileage');
      }
    }

    // VIN validation (basic - should be 17 characters if provided)
    if (formData.vin.trim() && formData.vin.trim().length !== 17) {
      newErrors.vin = t('validation.invalidVin', 'VIN should be 17 characters');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoSelected = (uri: string) => {
    setFormData(prev => ({ ...prev, photoUri: uri }));
  };

  const handlePhotoRemoved = () => {
    setFormData(prev => ({ ...prev, photoUri: '' }));
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert(
        t('auth.required', 'Authentication Required'),
        t('auth.signInPrompt', 'Please sign in to add vehicles')
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert form data to Vehicle format
      const vehicleData: Omit<Vehicle, 'id'> = {
        userId: user.uid, // Use authenticated user's ID
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        ...(formData.vin.trim() && { vin: formData.vin.trim() }),
        mileage: formData.mileage.trim() ? parseInt(formData.mileage.replace(/,/g, '')) : 0,
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
        ...(formData.photoUri && { photoUri: formData.photoUri }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Saving vehicle for user:', user.uid, vehicleData);
      
      // Save using secure repository
      const savedVehicle = await vehicleRepository.create(vehicleData);
      console.log('Vehicle saved successfully:', savedVehicle);
      
      // If there's a local photo URI, upload it to Firebase and update the vehicle
      if (formData.photoUri && !imageUploadService.isFirebaseStorageUrl(formData.photoUri)) {
        try {
          const firebaseUrl = await imageUploadService.uploadVehiclePhoto(formData.photoUri, savedVehicle.id);
          await vehicleRepository.update(savedVehicle.id, { photoUri: firebaseUrl });
          console.log('Vehicle photo uploaded and updated:', firebaseUrl);
        } catch (photoError) {
          console.warn('Failed to upload vehicle photo, keeping local URI:', photoError);
          // Don't fail the whole operation if photo upload fails
        }
      }
      
      // Create personalized success message
      const vehicleName = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`;
      const successMessages = [
        `🎉 Welcome to the garage, ${vehicleName}!`,
        `🚗 Your ${vehicleName} is now parked in your digital garage!`,
        `✨ ${vehicleName} has been added to your fleet!`,
        `🔧 Ready to track your ${vehicleName}'s journey!`,
        `🏁 Your ${vehicleName} just pulled into the garage!`
      ];
      const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
      
      // Clear form data after successful save
      setFormData({
        make: '',
        model: '',
        year: '',
        vin: '',
        mileage: '',
        notes: '',
        photoUri: '',
      });
      
      Alert.alert(
        '🎉 Vehicle Added!',
        randomMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Vehicles screen to show the new vehicle
              navigation.navigate('VehiclesList');
            },
          }
        ]
      );
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      
      // Handle authentication errors specifically
      let errorMessage = t('vehicles.saveError', 'Failed to save vehicle');
      
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('auth') ||
          error.message?.includes('Unauthorized')) {
        errorMessage = t('auth.required', 'Please sign in to add vehicles');
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = t('common.networkError', 'Network error. Please check your connection.');
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert(
        t('common.error', 'Error'),
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to Vehicles list screen
    navigation.navigate('VehiclesList');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('vehicles.saving', 'Saving vehicle...')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.formCard}>
        <Text style={styles.title}>
          {t('vehicles.addNew', 'Add Vehicle')}
        </Text>
        <Text style={styles.subtitle}>
          {t('vehicles.addDescription', 'Enter your vehicle information to start tracking maintenance.')}
        </Text>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('vehicles.basicInfo', 'Basic Information')}
          </Text>
          
          <Input
            label={t('vehicles.make', 'Make')}
            value={formData.make}
            onChangeText={(value) => handleInputChange('make', value)}
            placeholder={t('vehicles.makePlaceholder', 'e.g., Toyota, Honda, Ford')}
            error={errors.make}
            required
          />

          <Input
            label={t('vehicles.model', 'Model')}
            value={formData.model}
            onChangeText={(value) => handleInputChange('model', value)}
            placeholder={t('vehicles.modelPlaceholder', 'e.g., Camry, Civic, F-150')}
            error={errors.model}
            required
          />

          <Input
            label={t('vehicles.year', 'Year')}
            value={formData.year}
            onChangeText={(value) => handleInputChange('year', value)}
            placeholder={t('vehicles.yearPlaceholder', 'e.g., 2020')}
            keyboardType="numeric"
            maxLength={4}
            error={errors.year}
            required
          />
        </View>

        {/* Vehicle Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('vehicles.details', 'Vehicle Details')}
          </Text>

          <Input
            label={t('vehicles.vin', 'VIN')}
            value={formData.vin}
            onChangeText={(value) => handleInputChange('vin', value.toUpperCase())}
            placeholder={t('vehicles.vinPlaceholder', 'Vehicle Identification Number')}
            maxLength={17}
            error={errors.vin}
            helperText={t('vehicles.vinHelper', 'Optional - helps with parts and recalls')}
          />

          <Input
            label={t('vehicles.mileage', 'Current Mileage')}
            value={formData.mileage}
            onChangeText={(value) => handleInputChange('mileage', value)}
            placeholder={t('vehicles.mileagePlaceholder', 'e.g., 50000')}
            keyboardType="numeric"
            error={errors.mileage}
            helperText={t('vehicles.mileageHelper', 'Optional - helps with maintenance scheduling')}
          />

          <Input
            label={t('vehicles.notes', 'Notes')}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder={t('vehicles.notesPlaceholder', 'Any additional information...')}
            multiline
            numberOfLines={3}
            helperText={t('vehicles.notesHelper', 'Optional - color, trim, modifications, etc.')}
          />

          <PhotoPicker
            photoUri={formData.photoUri}
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            placeholder={t('vehicles.photo', 'Photo')}
          />
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('common.cancel', 'Cancel')}
          variant="outline"
          onPress={handleCancel}
          style={styles.button}
        />
        <Button
          title={t('common.save', 'Save')}
          variant="primary"
          onPress={handleSave}
          style={styles.button}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
  },
});

export default AddVehicleScreen;