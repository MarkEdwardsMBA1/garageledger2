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
import { ConflictResolutionModal } from '../components/common/ConflictResolutionModal';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { Vehicle, ConflictDetectionResult, ConflictResolutionAction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { programConflictService } from '../services/ProgramConflictService';

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
  
  // Vehicle program information for visual indicators
  const [vehicleProgramCounts, setVehicleProgramCounts] = useState<Record<string, number>>({});
  
  // Conflict detection state
  const [conflictCheckLoading, setConflictCheckLoading] = useState(false);
  const [conflictResult, setConflictResult] = useState<ConflictDetectionResult | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Load user vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    if (!user) return;
    
    try {
      setVehiclesLoading(true);
      setVehiclesError(null);
      
      // Load vehicles
      const userVehicles = await vehicleRepository.getUserVehicles();
      setVehicles(userVehicles);
      
      // Load program counts for each vehicle (for visual indicators)
      const programCounts: Record<string, number> = {};
      await Promise.all(
        userVehicles.map(async (vehicle) => {
          try {
            const programs = await programRepository.getProgramsByVehicle(vehicle.id);
            const activePrograms = programs.filter(p => p.isActive);
            programCounts[vehicle.id] = activePrograms.length;
          } catch (error) {
            console.warn(`Failed to load programs for vehicle ${vehicle.id}:`, error);
            programCounts[vehicle.id] = 0;
          }
        })
      );
      
      setVehicleProgramCounts(programCounts);
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

  // Handle vehicle selection for vehicles with existing programs (edit mode)
  const handleVehicleEdit = async (vehicle: Vehicle) => {
    try {
      // Get the program for this vehicle
      const programs = await programRepository.getProgramsByVehicle(vehicle.id);
      const activePrograms = programs.filter(p => p.isActive);
      
      if (activePrograms.length > 0) {
        // Navigate to edit the first active program
        const programToEdit = activePrograms[0];
        navigation.navigate('EditProgram', {
          programId: programToEdit.id,
          vehicleId: vehicle.id,
        });
      } else {
        Alert.alert(
          t('common.error', 'Error'),
          t('programs.noProgramFound', 'No active program found for this vehicle')
        );
      }
    } catch (error) {
      console.error('Error getting vehicle program:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.loadProgramError', 'Failed to load vehicle program')
      );
    }
  };

  // Get display name for vehicle (nickname takes priority)
  const getVehicleDisplayName = (vehicle: Vehicle): string => {
    const nickname = vehicle.nickname?.trim();
    return (nickname && nickname.length > 0) ? nickname : `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Handle continue to next step with conflict detection
  const handleContinue = async () => {
    if (selectedVehicleIds.length === 0) {
      Alert.alert(t('validation.required', 'Required'), t('programs.vehicleRequired', 'Please select at least one vehicle for this program'));
      return;
    }
    
    try {
      setConflictCheckLoading(true);
      
      // Check for conflicts
      const conflictResult = await programRepository.checkVehicleConflicts(selectedVehicleIds);
      
      if (conflictResult.canProceedDirectly) {
        // No conflicts - proceed normally
        navigation.navigate('CreateProgramDetails', {
          selectedVehicleIds,
          selectedVehicles: vehicles.filter(v => selectedVehicleIds.includes(v.id)).map(vehicle => ({
            ...vehicle,
            createdAt: vehicle.createdAt.toISOString(),
            updatedAt: vehicle.updatedAt.toISOString(),
          }))
        });
      } else {
        // Conflicts found - show rich conflict resolution modal
        setConflictResult(conflictResult);
        setShowConflictModal(true);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.conflictCheckError', 'Failed to check program conflicts. Please try again.')
      );
    } finally {
      setConflictCheckLoading(false);
    }
  };
  
  // Handle conflict resolution from modal
  const handleConflictResolution = async (action: ConflictResolutionAction) => {
    try {
      setShowConflictModal(false);
      setConflictCheckLoading(true);
      
      // Note: "proceed anyway" option removed to enforce one program per vehicle
      
      if (action.type === 'edit-existing') {
        // TODO: Phase 2 - Navigate to edit existing program screen
        Alert.alert(
          t('programs.editFeatureComingSoon', 'Coming Soon'),
          t('programs.editFeatureMessage', 'Program editing capability will be available in Phase 2.')
        );
        return;
      }
      
      // Handle destructive actions (replace-program, remove-vehicles)
      if (conflictResult) {
        await programConflictService.resolveConflict(action, conflictResult.conflicts);
        
        // After successful resolution, proceed to program creation
        Alert.alert(
          t('common.success', 'Success'),
          t('programs.conflictResolved', 'Conflicts resolved successfully. Proceeding to create new program.'),
          [
            {
              text: t('common.ok', 'OK'),
              onPress: () => {
                navigation.navigate('CreateProgramDetails', {
                  selectedVehicleIds,
                  selectedVehicles: vehicles.filter(v => selectedVehicleIds.includes(v.id)).map(vehicle => ({
                    ...vehicle,
                    createdAt: vehicle.createdAt.toISOString(),
                    updatedAt: vehicle.updatedAt.toISOString(),
                  }))
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.resolutionError', 'Failed to resolve conflict. Please try again.')
      );
    } finally {
      setConflictCheckLoading(false);
    }
  };
  
  // Handle modal cancel
  const handleConflictCancel = () => {
    setShowConflictModal(false);
    setConflictResult(null);
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <ProgressBar currentStep={1} totalSteps={3} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {vehiclesLoading ? (
          <Card variant="elevated" style={styles.section}>
            <View style={styles.vehicleLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Typography variant="body" style={styles.vehicleLoadingText}>
                {t('vehicles.loading', 'Loading vehicles...')}
              </Typography>
            </View>
          </Card>
        ) : vehiclesError ? (
          <Card variant="elevated" style={styles.section}>
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
          </Card>
        ) : vehicles.length === 0 ? (
          <Card variant="elevated" style={styles.section}>
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
          </Card>
        ) : (
          <>
            {/* Vehicles without programs - for creating new programs */}
            {(() => {
              const vehiclesWithoutPrograms = vehicles.filter(vehicle => vehicleProgramCounts[vehicle.id] === 0);
              
              if (vehiclesWithoutPrograms.length > 0) {
                return (
                  <Card variant="elevated" style={styles.section}>
                    <Typography variant="title" style={styles.sectionTitle}>
                      {t('programs.selectVehicles', 'Select Vehicles')}
                    </Typography>
                    <Typography variant="body" style={styles.sectionSubtitle}>
                      {t('programs.selectVehiclesMessage', 'Choose which vehicles this maintenance program applies to')}
                    </Typography>
                    
                    <View style={styles.vehicleSelector}>
                      {vehiclesWithoutPrograms.map((vehicle) => (
                        <TouchableOpacity
                          key={vehicle.id}
                          style={[
                            styles.checkboxOption,
                            selectedVehicleIds.includes(vehicle.id) && styles.checkboxOptionSelected
                          ]}
                          onPress={() => handleVehicleSelection(vehicle.id)}
                        >
                          <View style={styles.checkboxContent}>
                            <View style={styles.vehicleInfo}>
                              <Typography
                                variant="body"
                                style={[
                                  styles.checkboxText,
                                  selectedVehicleIds.includes(vehicle.id) && styles.checkboxTextSelected
                                ]}
                              >
                                {getVehicleDisplayName(vehicle)}
                              </Typography>
                            </View>
                            <View style={[
                              styles.checkboxSquare,
                              selectedVehicleIds.includes(vehicle.id) && styles.checkboxSquareSelected
                            ]} />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Vehicles with existing programs - for editing */}
            {(() => {
              const vehiclesWithPrograms = vehicles.filter(vehicle => vehicleProgramCounts[vehicle.id] > 0);
              
              if (vehiclesWithPrograms.length > 0) {
                return (
                  <Card variant="elevated" style={styles.section}>
                    <Typography variant="title" style={styles.sectionTitle}>
                      Select vehicle to edit or remove its program
                    </Typography>
                    
                    <View style={styles.vehicleSelector}>
                      {vehiclesWithPrograms.map((vehicle) => (
                        <TouchableOpacity
                          key={vehicle.id}
                          style={styles.editVehicleOption}
                          onPress={() => handleVehicleEdit(vehicle)}
                        >
                          <View style={styles.checkboxContent}>
                            <View style={styles.vehicleInfo}>
                              <Typography variant="body" style={styles.editVehicleText}>
                                {getVehicleDisplayName(vehicle)}
                              </Typography>
                              <View style={styles.programBadge}>
                                <Typography variant="caption" style={styles.programBadgeText}>
                                  {vehicleProgramCounts[vehicle.id]} {vehicleProgramCounts[vehicle.id] === 1 ? 'program' : 'programs'}
                                </Typography>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>
                );
              }
              return null;
            })()}
          </>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title={conflictCheckLoading ? t('programs.checkingConflicts', 'Checking conflicts...') : t('common.continue', 'Continue')}
          onPress={handleContinue}
          disabled={selectedVehicleIds.length === 0 || conflictCheckLoading}
          loading={conflictCheckLoading}
        />
      </View>

      {/* Conflict Resolution Modal */}
      {conflictResult && (
        <ConflictResolutionModal
          visible={showConflictModal}
          conflicts={conflictResult}
          vehicles={vehicles}
          onResolve={handleConflictResolution}
          onCancel={handleConflictCancel}
        />
      )}
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
  
  // Checkbox List Pattern (following design system style guide)
  checkboxOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface, // Always stays neutral
  },
  
  checkboxOptionSelected: {
    borderColor: theme.colors.primary, // Only border changes
  },
  
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  
  vehicleInfo: {
    flex: 1,
  },
  
  checkboxText: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  checkboxTextSelected: {
    color: theme.colors.primary, // Selected text becomes primary color
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  
  checkboxSquareSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary, // Square fills when selected
  },
  
  // Program Badge
  programBadge: {
    backgroundColor: theme.colors.warning + '20', // Semi-transparent warning background
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  
  programBadgeText: {
    color: theme.colors.warning,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Edit Vehicle Styles
  editVehicleOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  
  editVehicleText: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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