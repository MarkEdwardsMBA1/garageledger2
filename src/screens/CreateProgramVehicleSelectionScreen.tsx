// Create Program - Step 1: Vehicle Selection
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
import { ProgressBar } from '../components/common/ProgressBar';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { Vehicle } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * Create Program - Step 1: Vehicle Selection Screen
 * First step in the two-screen Create Program flow
 */
const CreateProgramVehicleSelectionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Vehicle data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

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
      if (prev.includes(vehicleId)) {
        // Remove vehicle if already selected
        return prev.filter(id => id !== vehicleId);
      } else {
        // Add vehicle to selection
        return [...prev, vehicleId];
      }
    });
  };

  // Get display name for vehicle
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (selectedVehicleIds.length === 0) {
      Alert.alert(t('validation.required', 'Required'), t('programs.vehicleRequired', 'Please select at least one vehicle for this program'));
      return;
    }
    
    // Navigate to Step 2 with selected vehicles
    navigation.navigate('CreateProgramDetails', {
      selectedVehicleIds,
      selectedVehicles: vehicles.filter(v => selectedVehicleIds.includes(v.id))
    });
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <ProgressBar currentStep={1} totalSteps={2} />
      
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
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={t('common.continue', 'Continue')}
          onPress={handleContinue}
          disabled={selectedVehicleIds.length === 0}
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
    padding: theme.spacing.lg,
  },
  
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  sectionSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
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
});

export default CreateProgramVehicleSelectionScreen;