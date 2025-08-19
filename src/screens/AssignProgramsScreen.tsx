// Assign Programs to Vehicle Screen
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
import { programRepository } from '../repositories/SecureProgramRepository';
import { MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AssignProgramsParams {
  vehicleId: string;
  vehicleName: string;
}

/**
 * Screen for assigning programs to a specific vehicle
 */
const AssignProgramsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as AssignProgramsParams;

  const [allPrograms, setAllPrograms] = useState<MaintenanceProgram[]>([]);
  const [assignedPrograms, setAssignedPrograms] = useState<MaintenanceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load all programs and assigned programs
  const loadPrograms = async () => {
    if (!isAuthenticated || !params?.vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const [userPrograms, vehiclePrograms] = await Promise.all([
        programRepository.getUserPrograms(),
        programRepository.getProgramsByVehicle(params.vehicleId)
      ]);

      setAllPrograms(userPrograms);
      setAssignedPrograms(vehiclePrograms);
    } catch (err: any) {
      console.error('Error loading programs:', err);
      setError(err.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [isAuthenticated, params?.vehicleId]);

  useFocusEffect(
    React.useCallback(() => {
      loadPrograms();
    }, [isAuthenticated, params?.vehicleId])
  );

  // Check if a program is already assigned
  const isProgramAssigned = (programId: string) => {
    return assignedPrograms.some(p => p.id === programId);
  };

  // Handle assigning a program to the vehicle
  const handleAssignProgram = async (program: MaintenanceProgram) => {
    if (!params?.vehicleId) return;

    setAssignLoading(program.id);

    try {
      await programRepository.assignToVehicle(program.id, params.vehicleId);
      
      // Refresh assigned programs
      const updatedAssigned = await programRepository.getProgramsByVehicle(params.vehicleId);
      setAssignedPrograms(updatedAssigned);

      Alert.alert(
        t('common.success', 'Success'),
        t('programs.assignSuccess', `"${program.name}" assigned to vehicle`)
      );
    } catch (err: any) {
      console.error('Error assigning program:', err);
      Alert.alert(
        t('common.error', 'Error'),
        err.message || t('programs.assignError', 'Failed to assign program')
      );
    } finally {
      setAssignLoading(null);
    }
  };

  // Handle unassigning a program from the vehicle
  const handleUnassignProgram = async (program: MaintenanceProgram) => {
    if (!params?.vehicleId) return;

    setAssignLoading(program.id);

    try {
      await programRepository.unassignFromVehicle(program.id, params.vehicleId);
      
      // Refresh assigned programs
      const updatedAssigned = await programRepository.getProgramsByVehicle(params.vehicleId);
      setAssignedPrograms(updatedAssigned);

      Alert.alert(
        t('common.success', 'Success'),
        t('programs.unassignSuccess', `"${program.name}" removed from vehicle`)
      );
    } catch (err: any) {
      console.error('Error unassigning program:', err);
      Alert.alert(
        t('common.error', 'Error'),
        err.message || t('programs.unassignError', 'Failed to remove program')
      );
    } finally {
      setAssignLoading(null);
    }
  };

  const renderProgramItem = (program: MaintenanceProgram) => {
    const isAssigned = isProgramAssigned(program.id);
    const isLoading = assignLoading === program.id;

    return (
      <Card 
        key={program.id} 
        variant={isAssigned ? "elevated" : "outlined"} 
        style={[
          styles.programCard,
          isAssigned && styles.programCardAssigned
        ] as any}
      >
        <View style={styles.programContent}>
          <Typography variant="subheading" style={styles.programName}>
            {program.name}
          </Typography>
          
          {program.description && (
            <Typography variant="bodySmall" style={styles.programDescription}>
              {program.description}
            </Typography>
          )}
          
          <View style={styles.programDetails}>
            <Typography variant="caption" style={styles.programTaskCount}>
              {program.tasks.length} service{program.tasks.length !== 1 ? 's' : ''}
            </Typography>
            
            <Typography variant="caption" style={styles.programStatus}>
              {program.isActive ? '✅ Active' : '⏸️ Inactive'}
            </Typography>
          </View>
        </View>

        <View style={styles.programActions}>
          {isAssigned ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.unassignButton]}
              onPress={() => handleUnassignProgram(program)}
              disabled={isLoading}
            >
              <Typography variant="caption" style={styles.unassignButtonText}>
                {isLoading ? '...' : '✓ Assigned'}
              </Typography>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.assignButton]}
              onPress={() => handleAssignProgram(program)}
              disabled={isLoading}
            >
              <Typography variant="caption" style={styles.assignButtonText}>
                {isLoading ? '...' : 'Assign'}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading programs..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Error"
          message={error}
          icon="⚠️"
          showRetry
          onRetry={loadPrograms}
        />
      </View>
    );
  }

  if (allPrograms.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card variant="outlined" style={styles.vehicleHeader}>
          <Typography variant="title" style={styles.vehicleTitle}>
            {params?.vehicleName}
          </Typography>
          <Typography variant="caption" style={styles.headerSubtitle}>
            Assign Programs
          </Typography>
        </Card>

        <EmptyState
          title="No Programs Available"
          message="Create your first maintenance program to assign it to vehicles"
          icon="📋"
          primaryAction={{
            title: "Create Program",
            onPress: () => navigation.navigate('CreateProgramVehicleSelection'),
          }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Vehicle Header */}
      <Card variant="outlined" style={styles.vehicleHeader}>
        <Typography variant="title" style={styles.vehicleTitle}>
          {params?.vehicleName}
        </Typography>
        <Typography variant="caption" style={styles.headerSubtitle}>
          Assign Programs ({assignedPrograms.length} assigned)
        </Typography>
      </Card>

      {/* Programs List */}
      <View style={styles.programsSection}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Available Programs ({allPrograms.length})
        </Typography>
        
        <View style={styles.programsList}>
          {allPrograms.map(renderProgramItem)}
        </View>
      </View>

      {/* Done Button */}
      <View style={styles.footer}>
        <Button
          title="Done"
          onPress={() => navigation.goBack()}
          style={styles.doneButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 100, // Space for footer
  },

  // Vehicle Header
  vehicleHeader: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  vehicleTitle: {
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Programs Section
  programsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  programsList: {
    gap: theme.spacing.md,
  },

  // Program Cards
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  programCardAssigned: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}10`,
  },
  programContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  programName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  programDescription: {
    color: theme.colors.textSecondary,
  },
  programDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  programTaskCount: {
    color: theme.colors.textSecondary,
  },
  programStatus: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Actions
  programActions: {
    marginLeft: theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: theme.colors.primary,
  },
  assignButtonText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.medium,
  },
  unassignButton: {
    backgroundColor: theme.colors.success,
  },
  unassignButtonText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.medium,
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
  doneButton: {
    width: '100%',
  },
});

export default AssignProgramsScreen;