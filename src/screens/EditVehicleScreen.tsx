// Edit Vehicle screen for updating existing vehicles
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Loading } from '../components/common/Loading';
import { PhotoPicker } from '../components/common/PhotoPicker';
import { VehicleFormData, Vehicle } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';

type VehicleStackParamList = {
  EditVehicle: {
    vehicleId: string;
  };
};

type EditVehicleScreenProps = StackScreenProps<VehicleStackParamList, 'EditVehicle'>;

/**
 * Edit Vehicle screen - form for updating existing vehicles
 * Includes validation, Firebase integration, and delete functionality
 */
const EditVehicleScreen: React.FC<any> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { vehicleId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
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

  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});

  // Load vehicle data on mount
  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    if (!user) {
      Alert.alert(
        t('auth.required', 'Authentication Required'),
        t('auth.signInPrompt', 'Please sign in to view vehicles'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
          }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      const vehicleData = await vehicleRepository.getById(vehicleId);
      
      if (!vehicleData) {
        Alert.alert(
          t('common.error', 'Error'),
          t('vehicles.notFound', 'Vehicle not found'),
          [
            {
              text: t('common.ok', 'OK'),
              onPress: () => navigation.goBack(),
            }
          ]
        );
        return;
      }

      setVehicle(vehicleData);
      
      // Populate form with existing data
      setFormData({
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year.toString(),
        vin: vehicleData.vin || '',
        nickname: vehicleData.nickname || '',
        mileage: vehicleData.mileage ? vehicleData.mileage.toString() : '',
        notes: vehicleData.notes || '',
        photoUri: vehicleData.photoUri || '',
      });
    } catch (error: any) {
      console.error('Error loading vehicle:', error);
      
      let errorMessage = t('vehicles.loadError', 'Failed to load vehicle');
      
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('auth') ||
          error.message?.includes('Unauthorized')) {
        errorMessage = t('auth.required', 'Please sign in to view this vehicle');
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = t('common.networkError', 'Network error. Please check your connection.');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        t('common.error', 'Error'),
        errorMessage,
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

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
    console.log('Photo selected with URI:', uri);
    setFormData(prev => ({ ...prev, photoUri: uri }));
  };

  const handlePhotoRemoved = () => {
    setFormData(prev => ({ ...prev, photoUri: '' }));
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert(
        t('auth.required', 'Authentication Required'),
        t('auth.signInPrompt', 'Please sign in to update vehicles')
      );
      return;
    }

    if (!validateForm() || !vehicle) {
      return;
    }

    setSaving(true);
    try {
      // Convert form data to update format (avoid undefined values)
      const updateData: Partial<Vehicle> = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        mileage: formData.mileage.trim() ? parseInt(formData.mileage.replace(/,/g, '')) : 0,
        updatedAt: new Date(),
        // Always include optional fields (empty strings instead of undefined)
        vin: formData.vin.trim() || '',
        nickname: formData.nickname.trim() || '',
        notes: formData.notes.trim() || '',
        ...(formData.photoUri && { photoUri: formData.photoUri }),
        ...(vehicle.licensePlate && { licensePlate: vehicle.licensePlate }),
        ...(vehicle.color && { color: vehicle.color }),
      };

      console.log('Updating vehicle for user:', user.uid, updateData);
      console.log('PhotoURI being saved:', formData.photoUri);
      console.log('PhotoURI included in updateData?', 'photoUri' in updateData, updateData.photoUri);
      
      // Update using secure repository
      const updatedVehicle = await vehicleRepository.update(vehicleId, updateData);
      console.log('Vehicle updated successfully:', updatedVehicle);
      
      // Create personalized update success message
      const vehicleName = `${updateData.year} ${updateData.make} ${updateData.model}`;
      const updateMessages = [
        `🔧 ${vehicleName} has been tuned up!`,
        `✨ Your ${vehicleName} details are now up to date!`,
        `📝 ${vehicleName}'s records have been updated!`,
        `🎯 All changes saved for your ${vehicleName}!`,
        `👍 ${vehicleName} is looking good in the books!`
      ];
      const randomMessage = updateMessages[Math.floor(Math.random() * updateMessages.length)];
      
      Alert.alert(
        '✅ Vehicle Updated!',
        randomMessage,
        [
          {
            text: 'Great!',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      
      let errorMessage = t('vehicles.updateError', 'Failed to update vehicle. Please try again.');
      
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('auth') ||
          error.message?.includes('Unauthorized')) {
        errorMessage = t('auth.required', 'Please sign in to update this vehicle');
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
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!user) {
      Alert.alert(
        t('auth.required', 'Authentication Required'),
        t('auth.signInPrompt', 'Please sign in to delete vehicles')
      );
      return;
    }

    if (!vehicle) return;

    Alert.alert(
      t('vehicles.deleteConfirm.title', 'Delete Vehicle'),
      t('vehicles.deleteConfirm.message', 'Are you sure you want to delete this vehicle? This action cannot be undone.'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!user || !vehicle) return;

    setDeleting(true);
    try {
      console.log('Deleting vehicle for user:', user.uid, vehicleId);
      
      // Delete using secure repository
      await vehicleRepository.delete(vehicleId);
      console.log('Vehicle deleted successfully');
      
      // Thoughtful delete confirmation message
      const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      
      Alert.alert(
        '👋 Farewell!',
        `Your ${vehicleName} has been removed from the garage. All memories preserved! 📚`,
        [
          {
            text: 'Got it',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      
      let errorMessage = t('vehicles.deleteError', 'Failed to delete vehicle. Please try again.');
      
      if (error.message?.includes('Authentication required') || 
          error.message?.includes('auth') ||
          error.message?.includes('Unauthorized')) {
        errorMessage = t('auth.required', 'Please sign in to delete this vehicle');
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
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('vehicles.loading', 'Loading vehicle...')} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="subheading" style={{ color: theme.colors.error, textAlign: 'center' }}>
          {t('vehicles.notFound', 'Vehicle not found')}
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.formCard}>
        {/* Vehicle Information */}
        <View style={styles.section}>
          <Typography variant="subheading" style={{ marginBottom: theme.spacing.md }}>
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
            onChangeText={(value) => handleInputChange('year', value)}
            placeholder={t('vehicles.yearPlaceholder', 'e.g., 2020')}
            keyboardType="numeric"
            maxLength={4}
            error={errors.year}
          />
        </View>

          <Input
            label={t('vehicles.vin', 'VIN (Optional)')}
            value={formData.vin}
            onChangeText={(value) => handleInputChange('vin', value.toUpperCase())}
            placeholder={t('vehicles.vinPlaceholder', 'Vehicle Identification Number')}
            maxLength={17}
            error={errors.vin}
          />

          <Input
            label={t('vehicles.mileage', 'Mileage (Optional)')}
            value={formData.mileage}
            onChangeText={(value) => handleInputChange('mileage', value)}
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
            vehicleId={vehicleId}
          />
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('common.cancel', 'Cancel')}
          variant="outline"
          onPress={handleCancel}
          style={styles.button}
          disabled={saving || deleting}
        />
        <Button
          title={t('common.save', 'Save')}
          variant="primary"
          onPress={handleSave}
          style={styles.button}
          loading={saving}
          disabled={deleting}
        />
      </View>

      {/* Delete Button */}
      <View style={styles.deleteContainer}>
        <Button
          title={t('common.delete', 'Delete Vehicle')}
          variant="danger"
          onPress={handleDelete}
          style={styles.deleteButton}
          loading={deleting}
          disabled={saving}
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  button: {
    flex: 1,
  },
  deleteContainer: {
    marginTop: theme.spacing.lg,
  },
  deleteButton: {
    width: '100%',
  },
});

export default EditVehicleScreen;