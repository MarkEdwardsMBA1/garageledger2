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
// Card component now handled by VehicleCard and InfoCard
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { Typography } from '../components/common/Typography';
import { ActivityIcon, SpannerIcon, CheckIcon, AlertTriangleIcon, MaintenanceIcon } from '../components/icons';
import VehicleCard from '../components/common/VehicleCard';
import InfoCard from '../components/common/InfoCard';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { getCategoryName, getSubcategoryName } from '../types/MaintenanceCategories';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { calculateVehicleStatusSummary, VehicleStatusSummary } from '../services/VehicleStatusService';

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
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatusSummary | null>(null);

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
      
      // Calculate vehicle status after data is loaded
      const statusSummary = calculateVehicleStatusSummary(vehicleData, vehiclePrograms, logs);
      setVehicleStatus(statusSummary);
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

  // Get vehicle display info (similar to VehiclesScreen)
  const renderVehicleHeader = () => {
    if (!vehicle) return null;

    // Additional info for VIN and notes
    const additionalInfo = (
      <>
        {vehicle.vin && (
          <Text style={styles.vinText}>
            VIN: {vehicle.vin}
          </Text>
        )}
        {vehicle.notes && (
          <Text style={styles.notesText}>
            {vehicle.notes}
          </Text>
        )}
      </>
    );

    return (
      <VehicleCard
        vehicle={vehicle}
        showImage={true}
        onPress={() => navigation.navigate('EditVehicle', { vehicleId: vehicle.id })}
        additionalInfo={additionalInfo}
        style={styles.headerCard}
      />
    );
  };

  const renderQuickActions = () => (
    <InfoCard
      title={t('dashboard.quickActions', 'Quick Actions')}
      style={styles.sectionCard}
    >
      <View style={styles.actionButtons}>
        <Button
          title={t('maintenance.logMaintenance', 'Log Maintenance')}
          variant="primary"
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('AddMaintenanceLog', { vehicleId: params.vehicleId });
          }}
        />
        
        <Button
          title="Manage Programs"
          variant="outline"
          style={styles.actionButton}
          onPress={() => {
            if (programs.length > 0) {
              // Navigate to edit existing program
              navigation.navigate('Programs', {
                screen: 'EditProgram',
                params: { programId: programs[0].id }
              });
            } else {
              // Navigate to create new program
              navigation.navigate('Programs', {
                screen: 'CreateProgramVehicleSelection',
                params: { preSelectedVehicleId: params.vehicleId }
              });
            }
          }}
        />
      </View>
    </InfoCard>
  );

  const renderVehicleStatus = () => {
    // Empty state: No program assigned
    if (programs.length === 0) {
      return (
        <InfoCard
          title="Vehicle Status"
          subtitle="Setup a maintenance program to track your vehicle's service schedule and see alerts for upcoming and past due services."
          style={styles.sectionCard}
        />
      );
    }

    // Loading state: Program assigned but status calculating
    if (!vehicleStatus) {
      return (
        <InfoCard
          title="Vehicle Status"
          subtitle="Calculating status..."
          style={styles.sectionCard}
        />
      );
    }

    const { overdueCount } = vehicleStatus;
    const primaryProgram = programs[0]; // Show first program for simplicity

    return (
      <InfoCard
        title="Vehicle Status"
        style={styles.sectionCard}
        onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
      >
        <View style={styles.statusContent}>
          {/* Program Information */}
          <View style={styles.programInfo}>
            <Typography variant="body" style={styles.programLabel}>
              Program: {primaryProgram.name}
            </Typography>
          </View>

          {/* Services Overdue Count with Color Coding */}
          <View style={styles.overdueInfo}>
            <Typography variant="body" style={styles.overdueLabel}>
              Services Overdue: 
              <Typography 
                variant="body" 
                style={[
                  styles.overdueCount,
                  { color: overdueCount > 0 ? theme.colors.error : theme.colors.success }
                ]}
              > {overdueCount}</Typography>
            </Typography>
          </View>
        </View>
      </InfoCard>
    );
  };

  const renderActivePrograms = () => {
    // Don't render the programs card - program info now shown in Vehicle Status
    return null;

    const headerSubtitle = (
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
    );

    return (
      <InfoCard
        title={`📋 Assigned Maintenance Program (${programs.length})`}
        subtitle={headerSubtitle}
        style={styles.sectionCard}
      >
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
      </InfoCard>
    );
  };

  const renderMaintenanceTimeline = () => {
    if (maintenanceLogs.length === 0) {
      return (
        <InfoCard
          title="Recent Maintenance"
          subtitle="Log maintenance services to see a list of recent services performed."
          style={styles.sectionCard}
          onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
        />
      );
    }

    // Show recent logs (limit to 5 for timeline view)
    const recentLogs = maintenanceLogs.slice(0, 5);

    const headerSubtitle = maintenanceLogs.length > 5 ? (
      <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
        <Typography variant="bodySmall" style={styles.viewAllLink}>
          View All ({maintenanceLogs.length})
        </Typography>
      </TouchableOpacity>
    ) : undefined;

    return (
      <InfoCard
        title="Recent Maintenance"
        subtitle={headerSubtitle}
        style={styles.sectionCard}
        onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
      >
        <View style={styles.timeline}>
          {recentLogs.map((log, index) => {
            // Safely handle category parsing with fallback
            const categoryParts = log.category?.split(':') || ['general', 'maintenance'];
            const [categoryKey, subcategoryKey] = categoryParts;
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
                  <Typography variant="body" style={styles.timelineTitle}>
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
      </InfoCard>
    );
  };

  const renderCostAnalytics = () => {
    if (maintenanceLogs.length === 0) {
      // Show placeholder when no maintenance logs exist
      return (
        <InfoCard
          title="Cost & Analytics"
          subtitle="Add maintenance records with costs for analytics and insights."
          style={styles.sectionCard}
        />
      );
    }
    
    const analytics = calculateCostAnalytics(maintenanceLogs, vehicle);
    
    // Debug: Show what we found
    console.log('DEBUG - Maintenance logs:', maintenanceLogs.length);
    console.log('DEBUG - Logs with costs:', maintenanceLogs.filter(log => (log.totalCost || 0) > 0).length);
    console.log('DEBUG - First log structure:', maintenanceLogs[0]);
    
    // Show placeholder when no costs are recorded
    if (analytics.totalCost === 0) {
      return (
        <InfoCard
          title="Cost & Analytics"
          subtitle="Add cost information to your maintenance records to see spending analytics"
          style={styles.sectionCard}
        />
      );
    }

    return (
      <InfoCard
        title="Cost & Analytics"
        style={styles.sectionCard}
        onPress={() => navigation.navigate('VehicleAnalytics', { vehicleId: vehicle?.id })}
      >
        {/* Cost Metrics Grid */}
        <View style={styles.costMetricsGrid}>
          <View style={styles.costMetricItem}>
            <Typography variant="body" style={styles.costMetricValue}>
              ${analytics.totalCost}
            </Typography>
            <Typography variant="caption" style={styles.costMetricLabel}>
              Total Spent
            </Typography>
          </View>
          
          <View style={styles.costMetricItem}>
            <Typography variant="body" style={styles.costMetricValue}>
              ${analytics.averagePerService}
            </Typography>
            <Typography variant="caption" style={styles.costMetricLabel}>
              Avg per Service
            </Typography>
          </View>
          
          {analytics.recent30Days > 0 && (
            <View style={styles.costMetricItem}>
              <Typography variant="body" style={styles.costMetricValue}>
                ${analytics.recent30Days}
              </Typography>
              <Typography variant="caption" style={styles.costMetricLabel}>
                Last 30 Days
              </Typography>
            </View>
          )}
          
          {analytics.costPerMile && (
            <View style={styles.costMetricItem}>
              <Typography variant="body" style={styles.costMetricValue}>
                ${analytics.costPerMile}/mi
              </Typography>
              <Typography variant="caption" style={styles.costMetricLabel}>
                Cost per Mile
              </Typography>
            </View>
          )}
        </View>
      </InfoCard>
    );
  };

  // Enhanced cost analytics calculation
  const calculateCostAnalytics = (logs: MaintenanceLog[], vehicle: Vehicle | null) => {
    const logsWithCost = logs.filter(log => (log.totalCost || 0) > 0);
    if (logsWithCost.length === 0) {
      return { totalCost: 0, averagePerService: 0, recent30Days: 0 };
    }

    const totalCost = logsWithCost.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const averagePerService = totalCost / logsWithCost.length;
    
    // Calculate recent 30 days spending
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent30Days = logsWithCost
      .filter(log => log.date >= thirtyDaysAgo)
      .reduce((sum, log) => sum + (log.totalCost || 0), 0);

    // Calculate cost per mile (if we have mileage data)
    const sortedLogs = logsWithCost.sort((a, b) => a.date.getTime() - b.date.getTime());
    const oldestLog = sortedLogs[0];
    const newestLog = sortedLogs[sortedLogs.length - 1];
    let costPerMile = null;
    
    if (oldestLog && newestLog && oldestLog.mileage && newestLog.mileage) {
      const milesDriven = newestLog.mileage - oldestLog.mileage;
      if (milesDriven > 0) {
        costPerMile = (totalCost / milesDriven).toFixed(3);
      }
    }

    // Calculate timespan
    const oldestDate = sortedLogs[0]?.date;
    const newestDate = sortedLogs[sortedLogs.length - 1]?.date;
    let timespan = 'All time';
    if (oldestDate && newestDate && oldestDate !== newestDate) {
      const monthsDiff = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      timespan = monthsDiff <= 12 ? `${monthsDiff} ${monthsDiff === 1 ? 'month' : 'months'}` : `${Math.ceil(monthsDiff / 12)} years`;
    }

    // Calculate trend (compare first half vs second half of data)
    let trend = null;
    let trendPercentage = 0;
    if (logsWithCost.length >= 4) {
      const midPoint = Math.floor(logsWithCost.length / 2);
      const firstHalf = sortedLogs.slice(0, midPoint);
      const secondHalf = sortedLogs.slice(midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, log) => sum + (log.totalCost || 0), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, log) => sum + (log.totalCost || 0), 0) / secondHalf.length;
      
      if (Math.abs(secondHalfAvg - firstHalfAvg) / firstHalfAvg > 0.2) { // 20% threshold
        trend = secondHalfAvg > firstHalfAvg ? 'increasing' : 'decreasing';
        trendPercentage = Math.abs(Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100));
      }
    }

    return {
      totalCost: totalCost.toFixed(2),
      averagePerService: averagePerService.toFixed(2),
      recent30Days: recent30Days.toFixed(2),
      costPerMile,
      timespan,
      trend,
      trendPercentage
    };
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
      {renderVehicleStatus()}
      {renderActivePrograms()}
      {renderMaintenanceTimeline()}
      {renderCostAnalytics()}
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
  
  // Vehicle Card Styles (matching VehiclesScreen)
  subtitleContainer: {
    gap: theme.spacing.xs,
  },
  vehicleInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  mileageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  vinText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  notesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  vehicleImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  carSilhouetteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
    ...theme.shadows.sm,
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
  
  // Enhanced Status Card Styles
  statusCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
  },
  statusCardUpToDate: {
    borderLeftColor: theme.colors.success,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statusContent: {
    gap: theme.spacing.xs,
  },
  programInfo: {
    marginBottom: theme.spacing.xs,
  },
  programLabel: {
    color: theme.colors.text,
  },
  overdueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueLabel: {
    color: theme.colors.text,
  },
  overdueCount: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusLoading: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statusUpToDate: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusLastMaintenance: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statusMessage: {
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  statusServiceName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Enhanced Status Intelligence Styles
  statusHelpText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  nextServicePreview: {
    marginBottom: theme.spacing.sm,
  },
  nextServiceLabel: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  lastServiceInfo: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  lastServiceLabel: {
    color: theme.colors.textSecondary,
  },
  primaryServiceAlert: {
    marginBottom: theme.spacing.sm,
  },
  primaryServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryServiceName: {
    flex: 1,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  primaryServiceDue: {
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'right',
  },
  additionalServices: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  additionalServicesLabel: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statusDueIn: {
    color: theme.colors.textSecondary,
  },
  statusUrgent: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: theme.spacing.xs,
  },
  
  // Programs Screen Consistent Formatting
  statRow: {
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  statusUpToDateText: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusHeaderRow: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  
  // Clean Numbered List Overdue Services Formatting
  overdueLabel: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  overdueServicesTable: {
    marginLeft: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  overdueServiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs / 2,
    paddingVertical: 1, // Subtle row separation
  },
  overdueServiceNumber: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    minWidth: 16,
    marginRight: theme.spacing.xs,
    lineHeight: theme.typography.fontSize.sm * 1.3,
  },
  overdueServiceName: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
    lineHeight: theme.typography.fontSize.sm * 1.3,
  },
  lastServiceRow: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
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
  },
  mileageSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Cost Analytics Styles
  costMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  costMetricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  costMetricValue: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs / 2,
  },
  costMetricLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
  },
  costSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  costTrendText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default VehicleHomeScreen;