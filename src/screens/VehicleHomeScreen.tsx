// Vehicle Home Page - Deep dive into specific vehicle
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { Typography } from '../components/common/Typography';
import { ActivityIcon, SpannerIcon } from '../components/icons';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { getCategoryName, getSubcategoryName } from '../types/MaintenanceCategories';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface VehicleHomeParams {
  vehicleId: string;
}

/**
 * Vehicle Home Screen - focused view of individual vehicle
 * Shows maintenance timeline, status, and quick actions for specific vehicle
 */
const VehicleHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as VehicleHomeParams;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programActionLoading, setProgramActionLoading] = useState<string | null>(null);

  // Load vehicle data
  const loadVehicleData = async () => {
    if (!isAuthenticated || !params?.vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [vehicleData, logs, vehiclePrograms] = await Promise.all([
        vehicleRepository.getById(params.vehicleId),
        maintenanceLogRepository.getByVehicleId(params.vehicleId),
        programRepository.getProgramsByVehicle(params.vehicleId)
      ]);
      
      if (!vehicleData) {
        setError('Vehicle not found');
        return;
      }
      
      setVehicle(vehicleData);
      setMaintenanceLogs(logs);
      setPrograms(vehiclePrograms);
    } catch (err: any) {
      console.error('Error loading vehicle data:', err);
      setError(err.message || 'Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when screen is focused
  useEffect(() => {
    loadVehicleData();
  }, [isAuthenticated, params?.vehicleId]);

  useFocusEffect(
    React.useCallback(() => {
      loadVehicleData();
    }, [isAuthenticated, params?.vehicleId])
  );

  // Handle unassigning a program from this vehicle
  const handleUnassignProgram = async (programId: string, programName: string) => {
    if (!params?.vehicleId) return;
    
    // Show confirmation alert
    Alert.alert(
      t('programs.unassignConfirm', 'Unassign Program'),
      t('programs.unassignMessage', `Remove "${programName}" from this vehicle?`),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel'
        },
        {
          text: t('common.remove', 'Remove'),
          style: 'destructive',
          onPress: async () => {
            setProgramActionLoading(programId);
            try {
              await programRepository.unassignFromVehicle(programId, params.vehicleId);
              
              // Refresh programs list
              const updatedPrograms = await programRepository.getProgramsByVehicle(params.vehicleId);
              setPrograms(updatedPrograms);
              
              Alert.alert(
                t('common.success', 'Success'),
                t('programs.unassignSuccess', 'Program removed from vehicle')
              );
            } catch (err: any) {
              console.error('Error unassigning program:', err);
              Alert.alert(
                t('common.error', 'Error'),
                err.message || t('programs.unassignError', 'Failed to remove program')
              );
            } finally {
              setProgramActionLoading(null);
            }
          }
        }
      ]
    );
  };

  // Navigate to program assignment screen
  const handleAssignPrograms = () => {
    if (!vehicle) return;
    
    navigation.navigate('Programs', {
      screen: 'AssignPrograms',
      params: { 
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      }
    });
  };

  const renderVehicleHeader = () => {
    if (!vehicle) return null;

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('EditVehicle', { vehicleId: vehicle.id });
        }}
        activeOpacity={0.7}
      >
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.vehicleInfo}>
            <Typography variant="title" style={styles.vehicleName}>
              {(vehicle.nickname?.trim() && vehicle.nickname.trim().length > 0) ? vehicle.nickname.trim() : `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </Typography>
            
            {/* Show vehicle info if nickname is present */}
            {(vehicle.nickname?.trim() && vehicle.nickname.trim().length > 0) && (
              <Typography variant="bodySmall" style={styles.vehicleInfoSubtitle}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Typography>
            )}
            
            {/* Show mileage under vehicle info when nickname is present, or normally when no nickname */}
            {vehicle.mileage > 0 && (
              <Typography variant="bodySmall" style={styles.mileageSubtitle}>
                Current: {vehicle.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
              </Typography>
            )}
            
            {vehicle.vin && (
              <View style={styles.detailContainer}>
                <Typography variant="bodySmall" style={styles.detailLabel}>
                  VIN:
                </Typography>
                <Typography variant="bodySmall" style={styles.detailValue}>
                  {vehicle.vin}
                </Typography>
              </View>
            )}
            
            {vehicle.notes && (
              <View style={styles.detailContainer}>
                <Typography variant="bodySmall" style={styles.detailLabel}>
                  Notes:
                </Typography>
                <Typography variant="bodySmall" style={styles.vehicleNotes}>
                  {vehicle.notes}
                </Typography>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderQuickActions = () => (
    <Card variant="elevated" style={styles.sectionCard}>
      <View style={styles.sectionTitleContainer}>
        <SpannerIcon size={18} color={theme.colors.primary} />
        <Typography variant="heading" style={styles.sectionTitleWithIcon}>
          {t('dashboard.quickActions', 'Quick Actions')}
        </Typography>
      </View>
      
      <View style={styles.actionButtons}>
        <Button
          title={t('maintenance.logMaintenance', 'Log Maintenance')}
          variant="primary"
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('Insights', { 
              screen: 'AddMaintenanceLog',
              params: { vehicleId: params.vehicleId }
            });
          }}
        />
        
        <Button
          title={t('reminders.addNew', 'Add Reminder')}
          variant="outline"
          style={styles.actionButton}
          onPress={() => {
            // TODO: Navigate to add reminder screen
            console.log('Add reminder for vehicle:', params.vehicleId);
          }}
        />
      </View>
    </Card>
  );

  const renderStatusSummary = () => (
    <Card variant="elevated" style={styles.sectionCard}>
      <Typography variant="heading" style={styles.sectionTitle}>
        📊 Status Summary
      </Typography>
      
      <View style={styles.statusItem}>
        <Typography variant="bodyLarge" style={styles.statusGood}>
          ✅ No overdue maintenance
        </Typography>
      </View>
      
      <Typography variant="bodySmall" style={styles.statusNote}>
        Manual reminders coming soon!
      </Typography>
    </Card>
  );

  const renderActivePrograms = () => {
    if (programs.length === 0) {
      return (
        <Card variant="filled" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            📋 Assigned Maintenance Program
          </Typography>
          
          <EmptyState
            title="No Programs Assigned"
            message="Create and assign maintenance programs to automate service reminders for this vehicle"
            icon="📋"
            primaryAction={{
              title: "Assign Programs",
              onPress: handleAssignPrograms,
            }}
          />
        </Card>
      );
    }

    return (
      <Card variant="elevated" style={styles.sectionCard}>
        <View style={styles.programsHeader}>
          <Typography variant="heading" style={styles.sectionTitle}>
            📋 Assigned Maintenance Program ({programs.length})
          </Typography>
          
          <View style={styles.programsHeaderActions}>
            <TouchableOpacity
              onPress={handleAssignPrograms}
              style={styles.assignButton}
            >
              <Typography variant="caption" style={styles.assignButtonText}>
                + Assign
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Programs')}
            >
              <Typography variant="bodySmall" style={styles.viewAllLink}>
                Manage
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.programsList}>
          {programs.map((program) => (
            <View key={program.id} style={styles.programItem}>
              <View style={styles.programContent}>
                <Typography variant="bodyLarge" style={styles.programName}>
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
                <TouchableOpacity
                  style={styles.programAction}
                  onPress={() => {
                    // TODO: Navigate to program details
                    console.log('View program:', program.id);
                  }}
                  disabled={programActionLoading === program.id}
                >
                  <Typography variant="caption" style={styles.programActionText}>
                    View
                  </Typography>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.programAction, styles.programUnassignAction]}
                  onPress={() => handleUnassignProgram(program.id, program.name)}
                  disabled={programActionLoading === program.id}
                >
                  <Typography variant="caption" style={styles.programUnassignText}>
                    {programActionLoading === program.id ? '...' : 'Remove'}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderMaintenanceTimeline = () => {
    if (maintenanceLogs.length === 0) {
      return (
        <Card variant="filled" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Maintenance Timeline
          </Typography>
          
          <EmptyState
            title="No Maintenance Logged"
            message="Start logging maintenance to build this vehicle's timeline"
            icon={<ActivityIcon size={48} color={theme.colors.textSecondary} />}
            primaryAction={{
              title: t('maintenance.logMaintenance', 'Log Maintenance'),
              onPress: () => {
                navigation.navigate('Insights', { 
                  screen: 'AddMaintenanceLog',
                  params: { vehicleId: params.vehicleId }
                });
              },
            }}
          />
        </Card>
      );
    }

    // Show recent logs (limit to 5 for timeline view)
    const recentLogs = maintenanceLogs.slice(0, 5);

    return (
      <Card variant="elevated" style={styles.sectionCard}>
        <View style={styles.timelineHeader}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Recent Maintenance
          </Typography>
          
          {maintenanceLogs.length > 5 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Insights')}
            >
              <Typography variant="bodySmall" style={styles.viewAllLink}>
                View All ({maintenanceLogs.length})
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.timeline}>
          {recentLogs.map((log, index) => {
            const [categoryKey, subcategoryKey] = log.category.split(':');
            const subcategoryName = getSubcategoryName(categoryKey, subcategoryKey);
            const categoryName = getCategoryName(categoryKey);
            
            return (
              <View 
                key={log.id}
                style={[
                  styles.timelineItem,
                  index < recentLogs.length - 1 && styles.timelineItemBorder
                ]}
              >
                <View style={styles.timelineContent}>
                  <Typography variant="bodyLarge" style={styles.timelineTitle}>
                    {log.title}
                  </Typography>
                  
                  <View style={styles.timelineDetails}>
                    <Typography variant="bodySmall" style={styles.timelineDate}>
                      {log.date.toLocaleDateString()}
                    </Typography>
                    {log.mileage > 0 && (
                      <>
                        <Typography variant="bodySmall" style={styles.timelineSeparator}>
                          •
                        </Typography>
                        <Typography variant="bodySmall" style={styles.timelineMileage}>
                          {log.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
                        </Typography>
                      </>
                    )}
                  </View>
                  
                  <Typography variant="caption" style={styles.timelineCategory}>
                    {subcategoryName || categoryName}
                  </Typography>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderCostInsights = () => {
    if (maintenanceLogs.length === 0) return null;

    // Calculate total cost for this vehicle
    const totalCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    
    if (totalCost === 0) return null;

    return (
      <Card variant="elevated" style={styles.sectionCard}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Cost Insights
        </Typography>
        
        <View style={styles.costSummary}>
          <Typography variant="bodyLarge" style={styles.costTotal}>
            ${totalCost.toFixed(2)} total spent
          </Typography>
          
          <Typography variant="bodySmall" style={styles.costDetail}>
            Across {maintenanceLogs.length} maintenance {maintenanceLogs.length === 1 ? 'entry' : 'entries'}
          </Typography>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading vehicle details..." />
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
          onRetry={loadVehicleData}
        />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Vehicle Not Found"
          message="This vehicle could not be found"
          icon="🚗"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderVehicleHeader()}
      {renderQuickActions()}
      {renderStatusSummary()}
      {renderActivePrograms()}
      {renderMaintenanceTimeline()}
      {renderCostInsights()}
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
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
  },
  vehicleInfo: {
    gap: theme.spacing.sm,
  },
  vehicleName: {
    color: theme.colors.text,
    textAlign: 'center',
  },
  mileageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  mileageLabel: {
    color: theme.colors.textSecondary,
  },
  mileageValue: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  vehicleNotes: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'left',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    minWidth: 50,
  },
  detailValue: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: 'monospace',
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleWithIcon: {
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  actionButtons: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    minHeight: 48,
  },
  statusItem: {
    paddingVertical: theme.spacing.sm,
  },
  statusGood: {
    color: theme.colors.success,
  },
  statusNote: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timeline: {
    gap: theme.spacing.xs,
  },
  timelineItem: {
    paddingVertical: theme.spacing.sm,
  },
  timelineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  timelineContent: {
    gap: theme.spacing.xs,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timelineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timelineDate: {
    color: theme.colors.textSecondary,
  },
  timelineSeparator: {
    color: theme.colors.textSecondary,
  },
  timelineMileage: {
    color: theme.colors.textSecondary,
  },
  timelineCategory: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  costSummary: {
    gap: theme.spacing.xs,
  },
  costTotal: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  costDetail: {
    color: theme.colors.textSecondary,
  },
  
  // Programs Section
  programsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  programsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  assignButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
  },
  assignButtonText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.medium,
  },
  programsList: {
    gap: theme.spacing.sm,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
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
  programActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  programAction: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}20`,
  },
  programActionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  programUnassignAction: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  programUnassignText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  vehicleInfoSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  mileageSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});

export default VehicleHomeScreen;