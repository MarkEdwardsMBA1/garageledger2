// Conflict Resolution Modal for intelligent program creation
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Card } from './Card';
import { Button } from './Button';
import { Loading } from './Loading';
import { SpannerIcon, AlertTriangleIcon } from '../icons';
import { 
  VehicleConflict, 
  ConflictDetectionResult, 
  ConflictResolutionAction, 
  Vehicle,
  MaintenanceProgram 
} from '../../types';
import { programConflictService } from '../../services/ProgramConflictService';

interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: ConflictDetectionResult;
  vehicles: Vehicle[];
  onResolve: (action: ConflictResolutionAction) => void;
  onCancel: () => void;
}

/**
 * Rich conflict resolution modal for handling program-vehicle conflicts
 * Provides intelligent options based on conflict type and safety confirmations
 */
export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  conflicts,
  vehicles,
  onResolve,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ConflictResolutionAction | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Get display name for vehicle
  const getVehicleDisplayName = (vehicleId: string): string => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return vehicle.notes?.trim() || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  };

  // Get conflicted vehicles only
  const conflictedVehicles = conflicts.conflicts.filter(c => c.conflictType !== 'none');

  // Handle resolution action selection
  const handleActionSelection = (action: ConflictResolutionAction) => {
    setSelectedAction(action);
    
    // Show safety confirmation for destructive actions
    if (action.type === 'replace-program' || action.type === 'remove-vehicles') {
      showSafetyConfirmation(action);
    } else {
      executeAction(action);
    }
  };

  // Show safety confirmation dialog
  const showSafetyConfirmation = (action: ConflictResolutionAction) => {
    let confirmationMessage = '';
    let confirmationTitle = t('common.confirmAction', 'Confirm Action');

    switch (action.type) {
      case 'replace-program':
        const program = conflictedVehicles[0]?.existingPrograms[0];
        confirmationMessage = t('programs.replaceConfirmation', 
          `Delete "${program?.name}" and create a new program? This action cannot be undone.`);
        break;
      case 'remove-vehicles':
        const vehicleNames = action.vehicleIds.map(getVehicleDisplayName).join(', ');
        confirmationMessage = t('programs.removeVehiclesConfirmation',
          `Remove ${vehicleNames} from existing programs and create a new program?`);
        break;
    }

    Alert.alert(
      confirmationTitle,
      confirmationMessage,
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
          onPress: () => setSelectedAction(null)
        },
        {
          text: t('common.confirm', 'Confirm'),
          style: 'destructive',
          onPress: () => executeAction(action)
        }
      ]
    );
  };

  // Execute the selected action
  const executeAction = async (action: ConflictResolutionAction) => {
    try {
      setProcessing(true);
      onResolve(action);
    } catch (error) {
      console.error('Error executing conflict resolution:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('programs.resolutionError', 'Failed to resolve conflict. Please try again.')
      );
    } finally {
      setProcessing(false);
      setSelectedAction(null);
    }
  };

  // Render conflict details for a vehicle
  const renderConflictDetails = (conflict: VehicleConflict) => {
    const vehicleName = getVehicleDisplayName(conflict.vehicleId);
    const description = programConflictService.getConflictDescription(conflict, vehicleName);
    const options = programConflictService.getResolutionOptions(conflict);

    return (
      <Card key={conflict.vehicleId} variant="outlined" style={styles.conflictCard}>
        <View style={styles.conflictHeader}>
          <View style={styles.conflictIcon}>
            <AlertTriangleIcon size={20} color={theme.colors.warning} />
          </View>
          <View style={styles.conflictInfo}>
            <Typography variant="heading" style={styles.conflictVehicle}>
              {vehicleName}
            </Typography>
            <Typography variant="body" style={styles.conflictDescription}>
              {description}
            </Typography>
          </View>
        </View>

        <View style={styles.conflictActions}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.radioOption,
                selectedOption === option && styles.radioOptionSelected
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <View style={styles.radioContent}>
                <Typography 
                  variant="body" 
                  style={[
                    styles.radioText,
                    selectedOption === option && styles.radioTextSelected
                  ]}
                >
                  {option}
                </Typography>
                <View style={[
                  styles.radioCircle,
                  selectedOption === option && styles.radioCircleSelected
                ]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    );
  };

  // Map option text to action
  const getActionForOption = (conflict: VehicleConflict, option: string): ConflictResolutionAction | null => {
    switch (option) {
      case 'Edit Existing':
        return { type: 'edit-existing', programId: conflict.existingPrograms[0].id };
      case 'Replace Program':
        return { type: 'replace-program', programId: conflict.existingPrograms[0].id };
      case 'Remove & Create New':
        return { 
          type: 'remove-vehicles', 
          programIds: conflict.existingPrograms.map(p => p.id),
          vehicleIds: [conflict.vehicleId]
        };
      default:
        return null;
    }
  };

  if (processing) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <Loading message={t('programs.resolvingConflict', 'Resolving conflict...')} />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <SpannerIcon size={24} color={theme.colors.primary} />
              </View>
              <Typography variant="title" style={styles.headerTitle}>
                {t('programs.conflictDetected', 'Program Conflict Detected')}
              </Typography>
              <Typography variant="body" style={styles.headerSubtitle}>
                {t('programs.conflictExplanation', 
                  'The selected vehicles are already managed by existing programs. Choose how to proceed:')}
              </Typography>
            </View>

            {/* Conflict Details */}
            <View style={styles.conflictsContainer}>
              {conflictedVehicles.map(renderConflictDetails)}
            </View>

            {/* Help Text */}
            <View style={styles.helpSection}>
              <Typography variant="caption" style={styles.helpText}>
                {t('programs.onePerVehicleNote', 'Note: Each vehicle can have only one active maintenance program to avoid conflicts and confusion.')}
              </Typography>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title={t('common.cancel', 'Cancel')}
              variant="outline"
              onPress={onCancel}
              style={styles.footerCancelButton}
            />
            <Button
              title={t('common.continue', 'Continue')}
              variant="primary"
              disabled={!selectedOption}
              onPress={() => {
                if (selectedOption) {
                  // Find which conflict has this option to get the right action
                  const conflict = conflictedVehicles.find(c => {
                    const options = programConflictService.getResolutionOptions(c);
                    return options.includes(selectedOption);
                  });
                  if (conflict) {
                    const action = getActionForOption(conflict, selectedOption);
                    if (action) handleActionSelection(action);
                  }
                }
              }}
              style={styles.footerContinueButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.xl,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.xl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },

  // Conflicts
  conflictsContainer: {
    marginBottom: theme.spacing.xl,
  },
  conflictCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  conflictHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  conflictIcon: {
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  conflictInfo: {
    flex: 1,
  },
  conflictVehicle: {
    marginBottom: theme.spacing.xs,
  },
  conflictDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.base,
  },
  conflictActions: {
    marginTop: theme.spacing.sm,
  },
  
  // Radio Button Options
  radioOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  radioOptionSelected: {
    // Only border changes for true radio button behavior
    borderColor: theme.colors.primary,
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  radioText: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.fontSize.base,
  },
  radioTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },

  // Help Section
  helpSection: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary || theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  helpText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.xs,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: theme.spacing.md,
  },
  footerCancelButton: {
    flex: 1,
  },
  footerContinueButton: {
    flex: 2,
  },
});

export default ConflictResolutionModal;