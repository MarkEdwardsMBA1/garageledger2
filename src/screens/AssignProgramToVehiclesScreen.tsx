// Assign Program to Multiple Vehicles Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { Vehicle, MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AssignProgramToVehiclesParams {
  programId: string;
  programName: string;
}

/**
 * Screen for assigning a specific program to multiple vehicles
 */
const AssignProgramToVehiclesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as AssignProgramToVehiclesParams;

  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [program, setProgram] = useState<MaintenanceProgram | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load vehicles and program data
  const loadData = async () => {
    if (!isAuthenticated || !params?.programId) return;

    setLoading(true);
    setError(null);

    try {
      const [vehicles, programData] = await Promise.all([
        vehicleRepository.getAll(),
        programRepository.getById(params.programId)
      ]);

      setAllVehicles(vehicles);
      setProgram(programData);

      // Set currently assigned vehicles as selected
      if (programData) {
        setSelectedVehicleIds(programData.assignedVehicleIds || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated, params?.programId]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [isAuthenticated, params?.programId])
  );

  // Handle vehicle selection toggle
  const handleVehicleToggle = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  // Handle saving assignments
  const handleSaveAssignments = async () => {
    if (!params?.programId) return;

    setSaving(true);

    try {
      // Get current assignments
      const currentAssignments = program?.assignedVehicleIds || [];
      
      // Determine vehicles to assign and unassign
      const toAssign = selectedVehicleIds.filter(id => !currentAssignments.includes(id));
      const toUnassign = currentAssignments.filter(id => !selectedVehicleIds.includes(id));

      // Perform assignments
      for (const vehicleId of toAssign) {
        await programRepository.assignToVehicle(params.programId, vehicleId);
      }

      // Perform unassignments
      for (const vehicleId of toUnassign) {
        await programRepository.unassignFromVehicle(params.programId, vehicleId);
      }

      Alert.alert(
        t('common.success', 'Success'),
        t('programs.assignmentSuccess', 'Program assignments updated successfully'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Programs')
          }
        ]
      );
    } catch (err: any) {
      console.error('Error saving assignments:', err);
      Alert.alert(
        t('common.error', 'Error'),
        err.message || t('programs.assignmentError', 'Failed to update assignments')
      );
    } finally {
      setSaving(false);
    }
  };

  const renderVehicleItem = (vehicle: Vehicle) => {
    const isSelected = selectedVehicleIds.includes(vehicle.id);

    return (
      <TouchableOpacity
        key={vehicle.id}
        onPress={() => handleVehicleToggle(vehicle.id)}
        activeOpacity={0.7}
      >
        <Card 
          variant={isSelected ? "elevated" : "outlined"} 
          style={isSelected 
            ? { ...styles.vehicleCard, ...styles.vehicleCardSelected }
            : styles.vehicleCard
          }
        >
          <View style={styles.vehicleContent}>
            <View style={styles.vehicleInfo}>
              <Typography variant="bodyLarge" style={styles.vehicleName}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Typography>
              
              {vehicle.mileage > 0 && (
                <Typography variant="bodySmall" style={styles.vehicleMileage}>
                  {vehicle.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
                </Typography>
              )}
            </View>
            
            <View style={styles.selectionIndicator}>
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected
              ]}>
                {isSelected && (
                  <Typography variant="caption" style={styles.checkmark}>
                    ✓
                  </Typography>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('programs.loadingVehicles', 'Loading vehicles...')} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('common.error', 'Error')}
          message={error}
          icon="⚠️"
          showRetry
          onRetry={loadData}
        />
      </View>
    );
  }

  if (allVehicles.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('programs.noVehicles', 'No Vehicles')}
          message={t('programs.noVehiclesMessage', 'Add vehicles to assign this program')}
          icon="🚗"
          primaryAction={{
            title: t('vehicles.addVehicle', 'Add Vehicle'),
            onPress: () => navigation.navigate('Vehicles', { screen: 'AddVehicle' }),
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Card variant="elevated" style={styles.headerCard}>
          <Typography variant="title" style={styles.headerTitle}>
            {t('programs.assignProgram', 'Assign Program')}
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            {params?.programName}
          </Typography>
          <Typography variant="bodySmall" style={styles.headerDescription}>
            {t('programs.selectVehicles', 'Select vehicles to assign this program to')}
          </Typography>
        </Card>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('programs.availableVehicles', 'Available Vehicles')} ({allVehicles.length})
          </Typography>
          
          <View style={styles.vehiclesList}>
            {allVehicles.map(renderVehicleItem)}
          </View>
        </View>

        {/* Selection Summary */}
        {selectedVehicleIds.length > 0 && (
          <Card variant="filled" style={styles.summaryCard}>
            <Typography variant="bodyLarge" style={styles.summaryText}>
              {selectedVehicleIds.length} {selectedVehicleIds.length === 1 ? 
                t('programs.vehicleSelected', 'vehicle selected') : 
                t('programs.vehiclesSelected', 'vehicles selected')}
            </Typography>
          </Card>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={t('common.cancel', 'Cancel')}
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        />
        <Button
          title={t('common.save', 'Save')}
          variant="primary"
          onPress={handleSaveAssignments}
          loading={saving}
          style={styles.saveButton}
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
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for actions
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  headerDescription: {
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  vehiclesList: {
    gap: theme.spacing.sm,
  },
  vehicleCard: {
    marginBottom: theme.spacing.sm,
  },
  vehicleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  vehicleMileage: {
    color: theme.colors.textSecondary,
  },
  selectionIndicator: {
    marginLeft: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryText: {
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});

export default AssignProgramToVehiclesScreen;