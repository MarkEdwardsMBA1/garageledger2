// Add Maintenance Log screen - Create new maintenance record
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { PhotoPicker } from '../components/common/PhotoPicker';
import { Loading } from '../components/common/Loading';
import { Typography } from '../components/common/Typography';
import { MaintenanceCategorySelector } from '../components/common/MaintenanceCategorySelector';
import { getSubcategoryName } from '../types/MaintenanceCategories';
import { Vehicle, MaintenanceLog } from '../types';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { useAuth } from '../contexts/AuthContext';

interface AddMaintenanceLogParams {
  vehicleId?: string;
}

interface MaintenanceLogFormData {
  title: string;
  date: Date;
  mileage: string;
  categoryKey: string;
  subcategoryKey: string;
  cost: string;
  notes: string;
  tags: string;
  photos: string[];
}

// Categories now handled by MaintenanceCategorySelector component

/**
 * Add Maintenance Log screen
 * Allows users to create detailed maintenance records with photos
 */
const AddMaintenanceLogScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as AddMaintenanceLogParams;

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(params?.vehicleId || '');
  const [formData, setFormData] = useState<MaintenanceLogFormData>({
    title: '',
    date: new Date(),
    mileage: '',
    categoryKey: '',
    subcategoryKey: '',
    cost: '',
    notes: '',
    tags: '',
    photos: [],
  });

  // Load user's vehicles on component mount
  useEffect(() => {
    loadVehicles();
  }, [isAuthenticated]);

  const loadVehicles = async () => {
    if (!isAuthenticated) return;
    
    try {
      const userVehicles = await vehicleRepository.getUserVehicles();
      setVehicles(userVehicles);
      
      // If no vehicle pre-selected and user has vehicles, select the first one
      if (!selectedVehicleId && userVehicles.length > 0) {
        setSelectedVehicleId(userVehicles[0].id);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('vehicles.loadError', 'Failed to load vehicles')
      );
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Parse form data - handle optional fields properly for Firestore
      const maintenanceData: Omit<MaintenanceLog, 'id'> = {
        vehicleId: selectedVehicleId,
        title: formData.title.trim(),
        date: formData.date,
        mileage: parseInt(formData.mileage) || 0,
        category: `${formData.categoryKey}:${formData.subcategoryKey}`, // Store as combined key
        cost: formData.cost && parseFloat(formData.cost) > 0 ? parseFloat(formData.cost) : undefined,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        photos: formData.photos,
        createdAt: new Date(),
      };

      // Remove undefined fields to prevent Firestore errors
      Object.keys(maintenanceData).forEach(key => {
        if (maintenanceData[key as keyof typeof maintenanceData] === undefined) {
          delete maintenanceData[key as keyof typeof maintenanceData];
        }
      });

      const savedLog = await maintenanceLogRepository.create(maintenanceData);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('maintenance.logMaintenance', 'Maintenance logged successfully'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Maintenance'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving maintenance log:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('maintenance.saveError', 'Failed to save maintenance log')
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedVehicleId) {
      Alert.alert(
        t('maintenance.logMaintenance', 'Log Maintenance'),
        t('validation.selectVehicle', 'Please select a vehicle to log maintenance for')
      );
      return false;
    }

    if (!formData.title.trim()) {
      Alert.alert(
        t('maintenance.logTitle', 'Title'),
        t('validation.titleRequired', 'What type of maintenance did you perform? Please add a title')
      );
      return false;
    }

    if (!formData.mileage || !formData.mileage.trim()) {
      Alert.alert(
        t('maintenance.mileage', 'Mileage'),
        t('validation.mileageRequired', 'We need your current mileage to track maintenance intervals')
      );
      return false;
    }

    if (isNaN(parseInt(formData.mileage))) {
      Alert.alert(
        t('maintenance.mileage', 'Mileage'),
        t('validation.invalidMileage', 'Please enter a valid mileage')
      );
      return false;
    }

    if (!formData.date) {
      Alert.alert(
        t('maintenance.date', 'Date'),
        t('validation.dateRequired', 'When was this maintenance performed? Please select a date')
      );
      return false;
    }

    if (!formData.categoryKey || !formData.subcategoryKey) {
      Alert.alert(
        t('maintenance.category', 'Category'),
        t('validation.categoryRequired', 'Please select what type of maintenance was performed')
      );
      return false;
    }

    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      Alert.alert(
        t('maintenance.cost', 'Cost'),
        'Please enter a valid cost amount'
      );
      return false;
    }

    return true;
  };

  const handlePhotoSelected = (photoUri: string) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, photoUri],
    }));
  };

  const handlePhotoRemoved = (photoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== photoIndex),
    }));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderVehicleSelector = () => {
    if (vehicles.length === 0) {
      return (
        <Card variant="outlined" style={styles.sectionCard}>
          <Typography variant="bodyLarge" style={styles.noVehiclesText}>
            {t('vehicles.noVehicles', 'No vehicles found. Please add a vehicle first.')}
          </Typography>
          <Button
            title={t('vehicles.addVehicle', 'Add Vehicle')}
            variant="primary"
            onPress={() => navigation.navigate('Vehicles', { screen: 'AddVehicle' })}
            style={styles.addVehicleButton}
          />
        </Card>
      );
    }

    return (
      <Card variant="elevated" style={styles.sectionCard}>
        <Typography variant="heading" style={styles.sectionTitle}>
          {t('vehicles.title', 'Vehicle')}
        </Typography>
        <View style={styles.vehicleSelector}>
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleOption,
                selectedVehicleId === vehicle.id && styles.vehicleOptionSelected,
              ]}
              onPress={() => setSelectedVehicleId(vehicle.id)}
            >
              <Typography
                variant="bodyLarge"
                style={[
                  styles.vehicleOptionText,
                  selectedVehicleId === vehicle.id && styles.vehicleOptionTextSelected,
                ]}
              >
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  const handleCategorySelection = (categoryKey: string, subcategoryKey: string) => {
    setFormData(prev => ({ 
      ...prev, 
      categoryKey, 
      subcategoryKey,
      // Auto-populate title based on subcategory selection if title is empty
      title: prev.title || getSubcategoryName(categoryKey, subcategoryKey)
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('maintenance.saving', 'Saving maintenance log...')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vehicle Selection */}
        {renderVehicleSelector()}

        {/* Mileage & Date */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('maintenance.mileageAndDate', 'Mileage & Date')}
          </Typography>
          
          <Input
            label={t('maintenance.mileage', 'Mileage')}
            value={formData.mileage}
            onChangeText={(mileage) => setFormData(prev => ({ ...prev, mileage }))}
            placeholder="50000"
            keyboardType="numeric"
            required
          />
          
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => {
              // For now, using current date. Date picker can be added later if needed
              setFormData(prev => ({ ...prev, date: new Date() }));
            }}
          >
            <Typography variant="label" style={styles.dateLabel}>
              {t('maintenance.date', 'Date')} *
            </Typography>
            <Typography variant="bodyLarge" style={styles.dateValue}>
              {formatDate(formData.date)}
            </Typography>
          </TouchableOpacity>
        </Card>

        {/* Category Selection */}
        <Card variant="elevated" style={styles.sectionCard}>
          <MaintenanceCategorySelector
            label={t('maintenance.category', 'Category')}
            categoryKey={formData.categoryKey}
            subcategoryKey={formData.subcategoryKey}
            onSelectionChange={handleCategorySelection}
            required
          />
        </Card>

        {/* Additional Details */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('maintenance.additionalDetails', 'Additional Details')}
          </Typography>
          
          <Input
            label={t('maintenance.notes', 'Notes')}
            value={formData.notes}
            onChangeText={(notes) => setFormData(prev => ({ ...prev, notes }))}
            placeholder={t('maintenance.notesPlaceholder', 'Additional notes about the maintenance...')}
            multiline
            numberOfLines={3}
          />

          <Input
            label={t('maintenance.tags', 'Tags')}
            value={formData.tags}
            onChangeText={(tags) => setFormData(prev => ({ ...prev, tags }))}
            placeholder={t('maintenance.tagsPlaceholder', 'warranty, dealer, DIY')}
            helper={t('maintenance.tagsHelper', 'Separate tags with commas')}
          />
        </Card>

        {/* Photos */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('maintenance.photos', 'Photos')}
          </Typography>
          
          <PhotoPicker
            onPhotoSelected={handlePhotoSelected}
            placeholder={t('maintenance.addPhoto', 'Add maintenance photo')}
          />

          {/* Display selected photos */}
          {formData.photos.length > 0 && (
            <View style={styles.photoList}>
              {formData.photos.map((photoUri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Typography variant="bodySmall">
                    Photo {index + 1}
                  </Typography>
                  <Button
                    title={t('common.remove', 'Remove')}
                    variant="text"
                    size="sm"
                    onPress={() => handlePhotoRemoved(index)}
                  />
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={t('common.cancel', 'Cancel')}
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={loading}
        />
        <Button
          title={t('maintenance.logMaintenance', 'Log Maintenance')}
          variant="primary"
          onPress={handleSave}
          disabled={loading}
          style={styles.button}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  noVehiclesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  addVehicleButton: {
    alignSelf: 'center',
  },
  vehicleSelector: {
    gap: theme.spacing.sm,
  },
  vehicleOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  vehicleOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '10',
  },
  vehicleOptionText: {
    textAlign: 'center',
  },
  vehicleOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  dateSelector: {
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  dateLabel: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  dateValue: {
    color: theme.colors.text,
  },
  // Category styles removed - now handled by MaintenanceCategorySelector
  photoList: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  photoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
  },
});

export default AddMaintenanceLogScreen;