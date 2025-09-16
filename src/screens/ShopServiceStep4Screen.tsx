// Shop Service Step 4: Notes & Summary
import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
import { useAuth } from '../contexts/AuthContext';
import { FirebaseMaintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { MaintenanceLog, Vehicle } from '../types';
import { SelectedService } from '../types';

interface ShopServiceStep1SerializableData {
  date: string; // ISO string from navigation
  mileage: string;
  totalCost: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
}

interface ShopServiceStep4Params {
  vehicleId: string;
  step1Data: ShopServiceStep1SerializableData;
  selectedServices: SelectedService[];
  photos: string[];
  notes?: string;
}

const maintenanceLogRepository = new FirebaseMaintenanceLogRepository();

export const ShopServiceStep4Screen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as ShopServiceStep4Params;
  const { user } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  // Configure navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Review & Save',
      headerRight: () => (
        <Typography variant="label" style={styles.stepIndicator}>
          4 of 4
        </Typography>
      ),
    });
  }, [navigation]);

  // Load vehicle data
  useEffect(() => {
    loadVehicle();
  }, [params.vehicleId]);

  const loadVehicle = async () => {
    try {
      const vehicle = await vehicleRepository.getById(params.vehicleId);
      setCurrentVehicle(vehicle);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to save maintenance logs.');
      return;
    }

    setSaving(true);

    try {
      // Create maintenance log from collected data
      const maintenanceLog: Omit<MaintenanceLog, 'id'> = {
        vehicleId: params.vehicleId,
        title: `Shop Service - ${params.selectedServices.map(s => s.serviceName).join(', ')}`,
        date: new Date(params.step1Data.date), // Convert ISO string back to Date
        mileage: parseInt(params.step1Data.mileage),
        services: params.selectedServices,
        totalCost: parseFloat(params.step1Data.totalCost),
        notes: (params.notes || '').trim(),
        photos: params.photos,
        serviceType: 'shop',
        tags: [],
        createdAt: new Date(),
      };

      // Save to Firebase
      await maintenanceLogRepository.create(maintenanceLog);

      // Success feedback - navigate back to Vehicle Details
      Alert.alert(
        '🔧 Service Logged Successfully!',
        `Your ${params.selectedServices.length} service${params.selectedServices.length > 1 ? 's' : ''} have been recorded.`,
        [
          {
            text: 'Done',
            onPress: () => navigation.navigate('VehicleHome', { vehicleId: params.vehicleId }),
            style: 'default',
          },
          {
            text: 'Add Another',
            onPress: () => navigation.navigate('AddMaintenanceLog', { vehicleId: params.vehicleId }),
          },
        ]
      );

    } catch (error) {
      console.error('Error saving maintenance log:', error);
      Alert.alert(
        'Save Error',
        'Unable to save your maintenance log. Please check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigation.navigate('ShopServiceStep3', {
      vehicleId: params.vehicleId,
      step1Data: params.step1Data,
      selectedServices: params.selectedServices,
      photos: params.photos,
      notes: params.notes,
    });
  };

  if (saving) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Typography variant="bodyLarge" style={styles.loadingText}>
          Saving your maintenance log...
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Program-style Service Summary Card */}
        <Card variant="elevated" style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Typography variant="heading" style={styles.serviceName}>
              Services Performed
            </Typography>
          </View>
          
          {/* Vehicle Info */}
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Vehicle:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {currentVehicle 
                ? `${currentVehicle.nickname ? `${currentVehicle.nickname} ` : ''}${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`
                : 'Loading...'
              }
            </Typography>
          </View>

          {/* Date */}
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Date:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {formatDate(params.step1Data.date)}
            </Typography>
          </View>

          {/* Mileage */}
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Mileage:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              {parseInt(params.step1Data.mileage).toLocaleString()} miles
            </Typography>
          </View>

          {/* Total Cost */}
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Total Cost:</Typography>
            <Typography variant="body" style={styles.serviceValue}>
              ${parseFloat(params.step1Data.totalCost).toFixed(2)}
            </Typography>
          </View>

          {/* Services */}
          <View style={styles.serviceRow}>
            <Typography variant="bodySmall" style={styles.serviceLabel}>Services:</Typography>
            <View style={styles.servicesList}>
              {params.selectedServices.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Typography variant="body" style={styles.serviceValue}>
                    • {service.serviceName}
                    {service.cost && (
                      <Typography variant="body" style={styles.serviceCost}>
                        ${service.cost.toFixed(2)}
                      </Typography>
                    )}
                  </Typography>
                </View>
              ))}
            </View>
          </View>

          {/* Photos */}
          {params.photos.length > 0 && (
            <View style={styles.serviceRow}>
              <Typography variant="bodySmall" style={styles.serviceLabel}>Photos:</Typography>
              <Typography variant="body" style={styles.serviceValue}>
                {params.photos.length} photo{params.photos.length > 1 ? 's' : ''} attached
              </Typography>
            </View>
          )}

          {/* Notes */}
          {params.notes && params.notes.trim() && (
            <View style={styles.serviceRow}>
              <Typography variant="bodySmall" style={styles.serviceLabel}>Notes:</Typography>
              <Typography variant="body" style={styles.serviceValue}>
                {params.notes.trim()}
              </Typography>
            </View>
          )}
        </Card>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          variant="outline"
          onPress={handleBack}
          style={styles.button}
        />
        <Button
          title="Save"
          variant="primary"
          onPress={handleSave}
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.text,
  },
  stepIndicator: {
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  notesInput: {
    minHeight: 100,
  },
  // Program-style Service Card
  serviceCard: {
    marginBottom: theme.spacing.lg,
  },
  serviceHeader: {
    marginBottom: theme.spacing.md,
  },
  serviceName: {
    color: theme.colors.text,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    minHeight: 24,
  },
  serviceLabel: {
    color: theme.colors.textSecondary,
    width: 100,
    marginRight: theme.spacing.sm,
  },
  serviceValue: {
    color: theme.colors.text,
    flex: 1,
  },
  costValue: {
    color: theme.colors.primary,
  },
  servicesList: {
    flex: 1,
  },
  serviceItem: {
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    color: theme.colors.textSecondary,
  },
  serviceCost: {
    color: theme.colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
  },
});

export default ShopServiceStep4Screen;