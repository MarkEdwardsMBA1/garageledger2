// Add Vehicle screen for creating new vehicles
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { PhotoPicker } from '../components/common/PhotoPicker';
import { VehicleFormData, Vehicle } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';
import { imageUploadService } from '../services/ImageUploadService';
import { verificationPromptService } from '../services/VerificationPromptService';

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

  // Navigation interceptor for unsaved changes - temporarily disabled for debugging
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
  //     // If form is not dirty, allow navigation
  //     if (!isVehicleFormDirty(formData)) {
  //       return;
  //     }

  //     // Prevent default behavior of leaving the screen
  //     e.preventDefault();

  //     // Show confirmation dialog
  //     Alert.alert(
  //       'Discard Changes?',
  //       'You have unsaved vehicle information. Are you sure you want to discard your changes?',
  //       [
  //         {
  //           text: 'Continue Editing',
  //           style: 'cancel',
  //           onPress: () => {}
  //         },
  //         {
  //           text: 'Discard Changes',
  //           style: 'destructive',
  //           onPress: () => {
  //             // Reset form and allow navigation
  //             setFormData(EMPTY_VEHICLE_FORM);
  //             setErrors({});
  //             navigation.dispatch(e.data.action);
  //           }
  //         }
  //       ]
  //     );
  //   });

  //   return unsubscribe;
  // }, [navigation, formData]);
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: '',
    vin: '',
    nickname: '',
    mileage: '',
    notes: '',
    photoUri: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Filtered input handlers using proven patterns
  const handleYearChange = (input: string) => {
    // Only allow digits, max 4 characters (enforced by maxLength)
    const filtered = input.replace(/[^0-9]/g, '');
    handleInputChange('year', filtered);
  };

  const handleMileageChange = (input: string) => {
    // Only allow digits, no decimals
    const filtered = input.replace(/[^0-9]/g, '');
    handleInputChange('mileage', filtered);
  };

  const handleVinChange = (input: string) => {
    // Auto-uppercase and remove invalid VIN characters (I, O, Q not allowed)
    const filtered = input.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    handleInputChange('vin', filtered);
  };

  const validateForm = (): boolean => {
    try {
      // Simple validation without Zod for now
      const newErrors: Record<string, string> = {};

      if (!formData.make.trim()) {
        newErrors.make = 'Vehicle make is required';
      }
      if (!formData.model.trim()) {
        newErrors.model = 'Vehicle model is required';
      }
      if (!formData.year.trim()) {
        newErrors.year = 'Vehicle year is required';
      } else {
        const yearNum = parseInt(formData.year);
        const currentYear = new Date().getFullYear();
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 2) {
          newErrors.year = `Year must be between 1900 and ${currentYear + 2}`;
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in validateForm:', error);
      return false;
    }
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
        vin: (formData.vin || '').trim(),
        mileage: (formData.mileage || '').trim() ? parseInt((formData.mileage || '').replace(/,/g, '')) : 0,
        notes: (formData.notes || '').trim(),
        nickname: (formData.nickname || '').trim(),
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
        nickname: '',
        mileage: '',
        notes: '',
        photoUri: '',
      });

      // Trigger email verification prompt for next session
      // This is a high-value moment - user just added their first vehicle
      if (user && !user.emailVerified) {
        try {
          await verificationPromptService.recordPromptShown(user.uid, 'after_vehicle_added');
        } catch (error) {
          console.log('Failed to record verification prompt trigger:', error);
        }
      }
      
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


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('vehicles.saving', 'Saving vehicle...')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      <Card variant="elevated" style={styles.formCard}>
        {/* Vehicle Information */}
        <View style={styles.section}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('vehicles.vehicleInfo', 'Vehicle Information')}
          </Typography>
          
          <Input
            label={t('vehicles.nickname', 'Nickname (Optional)')}
            value={formData.nickname}
            onChangeText={(value) => handleInputChange('nickname', value)}
            placeholder={t('vehicles.nicknamePlaceholder', 'e.g., Lightning McQueen, Beast, Ruby')}
          />

          <Input
            label={t('vehicles.make', 'Make')}
            value={formData.make}
            onChangeText={(value) => handleInputChange('make', value)}
            placeholder={t('vehicles.makePlaceholder', 'e.g., Toyota, Honda, Ford')}
            error={errors.make}
          />

          <Input
            label={t('vehicles.model', 'Model')}
            value={formData.model}
            onChangeText={(value) => handleInputChange('model', value)}
            placeholder={t('vehicles.modelPlaceholder', 'e.g., Camry, Civic, F-150')}
            error={errors.model}
          />

          <Input
            label={t('vehicles.year', 'Year')}
            value={formData.year}
            onChangeText={handleYearChange}
            placeholder={t('vehicles.yearPlaceholder', 'e.g., 2020')}
            keyboardType="numeric"
            maxLength={4}
            error={errors.year}
          />
        </View>

          <Input
            label={t('vehicles.vin', 'VIN (Optional)')}
            value={formData.vin}
            onChangeText={handleVinChange}
            placeholder={t('vehicles.vinPlaceholder', 'Vehicle Identification Number')}
            autoCapitalize="characters"
            maxLength={17}
            error={errors.vin}
          />

          <Input
            label={t('vehicles.mileage', 'Mileage (Optional)')}
            value={formData.mileage}
            onChangeText={handleMileageChange}
            placeholder={t('vehicles.mileagePlaceholder', 'e.g., 50000')}
            keyboardType="numeric"
            error={errors.mileage}
          />

          <Input
            label={t('vehicles.notes', 'Notes (Optional)')}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder={t('vehicles.notesPlaceholder', 'Any additional information...')}
            multiline
            numberOfLines={3}
          />

          <PhotoPicker
            photoUri={formData.photoUri}
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            placeholder={t('vehicles.photo', 'Photo (Optional)')}
          />
      </Card>

        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionBar}>
        <Button
          title={t('vehicles.saveVehicle', 'Save Vehicle')}
          variant="primary"
          onPress={handleSave}
          style={styles.fullWidthButton}
          loading={loading}
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
  screenTitle: {
    marginBottom: theme.spacing.sm,
  },
  screenSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  actionBar: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  fullWidthButton: {
    minHeight: 48,
  },
});

export default AddVehicleScreen;