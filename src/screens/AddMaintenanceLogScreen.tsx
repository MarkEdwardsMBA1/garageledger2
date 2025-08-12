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
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const vehicleId = params?.vehicleId;
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

  // Load the specific vehicle for this maintenance log
  useEffect(() => {
    loadVehicle();
  }, [vehicleId, isAuthenticated]);

  const loadVehicle = async () => {
    if (!isAuthenticated || !vehicleId) {
      // No vehicle specified - redirect to vehicle selection
      Alert.alert(
        t('maintenance.noVehicle', 'No Vehicle Selected'),
        t('maintenance.selectVehicleFirst', 'Please select a vehicle first to log maintenance.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }
    
    try {
      const vehicle = await vehicleRepository.getById(vehicleId);
      if (vehicle) {
        setCurrentVehicle(vehicle);
      } else {
        throw new Error('Vehicle not found');
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('vehicles.loadError', 'Failed to load vehicle information.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Parse form data - handle optional fields properly for Firestore
      const maintenanceData: Omit<MaintenanceLog, 'id'> = {
        vehicleId: vehicleId!,
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
    if (!vehicleId || !currentVehicle) {
      Alert.alert(
        t('maintenance.logMaintenance', 'Log Maintenance'),
        t('maintenance.noVehicle', 'No vehicle selected for maintenance logging.')
      );
      return false;
    }

    // Collect missing required fields for friendly batch validation
    const missingFields = [];
    const invalidFields = [];

    // Check required fields
    if (!formData.mileage || !formData.mileage.trim()) {
      missingFields.push('• Current mileage');
    } else if (isNaN(parseInt(formData.mileage))) {
      invalidFields.push('• Mileage must be a valid number (e.g., 75000)');
    }

    if (!formData.date) {
      missingFields.push('• Service date');
    }

    if (!formData.categoryKey || !formData.subcategoryKey) {
      missingFields.push('• Maintenance type/category');
    }

    // Check optional but formatted fields
    if (formData.cost && isNaN(parseFloat(formData.cost))) {
      invalidFields.push('• Cost must be a valid amount (e.g., 45.99) or leave blank');
    }

    // Show friendly combined error message
    if (missingFields.length > 0 || invalidFields.length > 0) {
      let message = '';
      
      if (missingFields.length > 0) {
        message += `Please fill in these required fields:\n${missingFields.join('\n')}`;
      }
      
      if (invalidFields.length > 0) {
        if (message) message += '\n\nAlso fix these issues:\n';
        else message += 'Please fix these issues:\n';
        message += invalidFields.join('\n');
      }

      Alert.alert('🔧 Complete Your Maintenance Log', message);
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

  const renderVehicleContext = () => {
    if (!currentVehicle) {
      return (
        <Card variant="outlined" style={styles.sectionCard}>
          <Typography variant="bodyLarge" style={styles.loadingText}>
            {t('maintenance.loadingVehicle', 'Loading vehicle information...')}
          </Typography>
        </Card>
      );
    }

    return (
      <Card variant="filled" style={styles.vehicleContextCard}>
        <View style={styles.vehicleContextHeader}>
          <Typography variant="caption" style={styles.vehicleContextLabel}>
            {t('maintenance.loggingFor', 'LOGGING MAINTENANCE FOR')}
          </Typography>
        </View>
        <Typography variant="title" style={styles.vehicleContextName}>
          {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
        </Typography>
        {currentVehicle.vin && (
          <Typography variant="body" style={styles.vehicleContextVin}>
            VIN: {currentVehicle.vin}
          </Typography>
        )}
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
        {/* Vehicle Context */}
        {renderVehicleContext()}

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
            placeholder={t('maintenance.tagsPlaceholder', 'warranty, dealer, DIY (separate with commas)')}
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
  loadingText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  vehicleContextCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  vehicleContextHeader: {
    marginBottom: theme.spacing.sm,
  },
  vehicleContextLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  vehicleContextName: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  vehicleContextVin: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: 'monospace',
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