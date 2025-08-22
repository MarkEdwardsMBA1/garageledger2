// Program Detail Screen - View and manage individual program details
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { MaintenanceIcon, CarIcon, CalendarIcon, EditIcon, TrashIcon } from '../components/icons';
import { programRepository } from '../repositories/SecureProgramRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { MaintenanceProgram, Vehicle } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProgramDetailParams {
  programId: string;
}

/**
 * Program Detail Screen - Complete program information and management
 */
const ProgramDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as ProgramDetailParams;

  const [program, setProgram] = useState<MaintenanceProgram | null>(null);
  const [assignedVehicles, setAssignedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load program data
  const loadProgramData = async () => {
    if (!isAuthenticated || !params?.programId) return;

    setLoading(true);
    setError(null);

    try {
      const [programData, allVehicles] = await Promise.all([
        programRepository.getById(params.programId),
        vehicleRepository.getAll()
      ]);

      if (!programData) {
        setError(t('programs.programNotFound', 'Program not found'));
        return;
      }

      setProgram(programData);

      // Filter vehicles that are assigned to this program
      const assignedVehiclesList = allVehicles.filter(vehicle => 
        programData.assignedVehicleIds.includes(vehicle.id)
      );
      setAssignedVehicles(assignedVehiclesList);

    } catch (err: any) {
      console.error('Error loading program data:', err);
      setError(err.message || 'Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgramData();
  }, [isAuthenticated, params?.programId]);

  useFocusEffect(
    React.useCallback(() => {
      loadProgramData();
    }, [isAuthenticated, params?.programId])
  );

  // Handle program status toggle
  const handleStatusToggle = async (isActive: boolean) => {
    if (!program) return;
    
    setUpdating(true);
    try {
      if (isActive) {
        await programRepository.activateProgram(program.id);
      } else {
        await programRepository.deactivateProgram(program.id);
      }
      
      setProgram(prev => prev ? { ...prev, isActive } : null);
      
      Alert.alert(
        t('common.success', 'Success'),
        isActive 
          ? t('programs.activateSuccess', 'Program activated successfully')
          : t('programs.deactivateSuccess', 'Program deactivated successfully')
      );
    } catch (err: any) {
      console.error('Error toggling program status:', err);
      Alert.alert(
        t('common.error', 'Error'),
        err.message || t('programs.statusToggleError', 'Failed to update program status')
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle edit program
  const handleEditProgram = () => {
    if (!program) return;
    
    navigation.navigate('EditProgram', { programId: program.id });
  };

  // Handle delete program
  const handleDeleteProgram = () => {
    if (!program) return;

    Alert.alert(
      t('programs.deleteProgram', 'Delete Program'),
      t('programs.deleteProgramConfirm', 'Are you sure you want to delete this program? This action cannot be undone.'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: confirmDeleteProgram
        }
      ]
    );
  };

  const confirmDeleteProgram = async () => {
    if (!program) return;

    setUpdating(true);
    try {
      await programRepository.delete(program.id);
      
      Alert.alert(
        t('common.success', 'Success'),
        t('programs.deleteSuccess', 'Program deleted successfully'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('ProgramsList')
          }
        ]
      );
    } catch (err: any) {
      console.error('Error deleting program:', err);
      Alert.alert(
        t('common.error', 'Error'),
        err.message || t('programs.deleteError', 'Failed to delete program')
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle assign vehicles
  const handleAssignVehicles = () => {
    if (!program) return;
    
    navigation.navigate('Programs', {
      screen: 'AssignProgramToVehicles',
      params: { 
        programId: program.id,
        programName: program.name 
      }
    });
  };

  // Get vehicle display name
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Format interval display
  const formatInterval = (task: any): string => {
    if (task.intervalType === 'mileage') {
      return `Every ${task.intervalValue?.toLocaleString()} miles`;
    } else if (task.intervalType === 'time') {
      return `Every ${task.timeIntervalValue} ${task.timeIntervalUnit}`;
    } else if (task.intervalType === 'dual') {
      return `Every ${task.intervalValue?.toLocaleString()} miles or ${task.timeIntervalValue} ${task.timeIntervalUnit}`;
    }
    return 'Not configured';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('programs.loadingProgram', 'Loading program...')} />
      </View>
    );
  }

  if (error || !program) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('common.error', 'Error')}
          message={error || t('programs.programNotFound', 'Program not found')}
          icon="⚠️"
          primaryAction={{
            title: t('common.back', 'Back'),
            onPress: () => navigation.goBack(),
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Program Header */}
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Typography variant="title" style={styles.programTitle}>
                {program.name}
              </Typography>
              
              {program.description && (
                <Typography variant="body" style={styles.programDescription}>
                  {program.description}
                </Typography>
              )}
              
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: program.isActive ? theme.colors.success : theme.colors.textSecondary }
                ]} />
                <Typography variant="caption" style={styles.statusText}>
                  {program.isActive ? t('programs.active', 'Active') : t('programs.inactive', 'Inactive')}
                </Typography>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleEditProgram}
                style={styles.actionButton}
                disabled={updating}
              >
                <EditIcon size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleDeleteProgram}
                style={styles.actionButton}
                disabled={updating}
              >
                <TrashIcon size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Toggle */}
          <View style={styles.statusToggleContainer}>
            <Typography variant="body" style={styles.statusToggleLabel}>
              {t('programs.programActive', 'Program Active')}
            </Typography>
            <Switch
              value={program.isActive}
              onValueChange={handleStatusToggle}
              disabled={updating}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={program.isActive ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* Program Stats */}
        <Card variant="outlined" style={styles.statsCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            {t('programs.overview', 'Overview')}
          </Typography>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaintenanceIcon size={24} color={theme.colors.primary} />
              <Typography variant="bodyLarge" style={styles.statValue}>
                {program.tasks.length}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                {t('programs.services', 'Services')}
              </Typography>
            </View>
            
            <View style={styles.statItem}>
              <CarIcon size={24} color={theme.colors.secondary} />
              <Typography variant="bodyLarge" style={styles.statValue}>
                {assignedVehicles.length}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                {t('programs.vehicles', 'Vehicles')}
              </Typography>
            </View>
            
            <View style={styles.statItem}>
              <CalendarIcon size={24} color={theme.colors.textSecondary} />
              <Typography variant="bodyLarge" style={styles.statValue}>
                {program.updatedAt.toLocaleDateString()}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                {t('programs.updated', 'Updated')}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Services Section */}
        <Card variant="outlined" style={styles.servicesCard}>
          <View style={styles.sectionHeader}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.services', 'Services')} ({program.tasks.length})
            </Typography>
          </View>
          
          <View style={styles.servicesList}>
            {program.tasks.map((task, index) => (
              <View key={`${task.id}-${index}`} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Typography variant="bodyLarge" style={styles.serviceName}>
                    {task.name}
                  </Typography>
                  <Typography variant="caption" style={styles.serviceCategory}>
                    {task.category}
                  </Typography>
                  <Typography variant="bodySmall" style={styles.serviceInterval}>
                    {formatInterval(task)}
                  </Typography>
                </View>
                
                <View style={[
                  styles.serviceStatusIndicator,
                  { backgroundColor: task.isActive ? theme.colors.success : theme.colors.textSecondary }
                ]} />
              </View>
            ))}
          </View>
        </Card>

        {/* Assigned Vehicles Section */}
        <Card variant="outlined" style={styles.vehiclesCard}>
          <View style={styles.sectionHeader}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('programs.assignedVehicles', 'Assigned Vehicles')} ({assignedVehicles.length})
            </Typography>
            <Button
              title={t('programs.manage', 'Manage')}
              variant="outline"
              size="sm"
              onPress={handleAssignVehicles}
            />
          </View>
          
          {assignedVehicles.length === 0 ? (
            <View style={styles.emptyVehicles}>
              <Typography variant="body" style={styles.emptyText}>
                {t('programs.noVehiclesAssigned', 'No vehicles assigned to this program')}
              </Typography>
              <Button
                title={t('programs.assignVehicles', 'Assign Vehicles')}
                variant="primary"
                size="sm"
                onPress={handleAssignVehicles}
                style={styles.assignButton}
              />
            </View>
          ) : (
            <View style={styles.vehiclesList}>
              {assignedVehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleItem}>
                  <CarIcon size={20} color={theme.colors.primary} />
                  <View style={styles.vehicleInfo}>
                    <Typography variant="body" style={styles.vehicleName}>
                      {getVehicleDisplayName(vehicle)}
                    </Typography>
                    {vehicle.mileage > 0 && (
                      <Typography variant="caption" style={styles.vehicleMileage}>
                        {vehicle.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
                      </Typography>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
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
  },
  
  // Header Card
  headerCard: {
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  programTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  programDescription: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  
  // Status Toggle
  statusToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  statusToggleLabel: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Stats Card
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statValue: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Services Card
  servicesCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  servicesList: {
    gap: theme.spacing.md,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  serviceCategory: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  serviceInterval: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  serviceStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: theme.spacing.md,
  },
  
  // Vehicles Card
  vehiclesCard: {
    marginBottom: theme.spacing.lg,
  },
  emptyVehicles: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  assignButton: {
    minWidth: 120,
  },
  vehiclesList: {
    gap: theme.spacing.sm,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  vehicleMileage: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

export default ProgramDetailScreen;