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
import { ActivityIcon, SpannerIcon, CheckIcon, AlertTriangleIcon, MaintenanceIcon } from '../components/icons';
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
      <Typography variant="heading" style={styles.sectionTitle}>
        {t('dashboard.quickActions', 'Quick Actions')}
      </Typography>
      
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

  const renderVehicleStatus = () => {
    if (!vehicleStatus) {
      return (
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Vehicle Status
          </Typography>
          <Typography variant="body" style={styles.statusLoading}>
            Calculating status...
          </Typography>
        </Card>
      );
    }

    const { nextService, overdueServices } = vehicleStatus;

    // Show all maintenance up to date
    if (overdueServices.length === 0) {
      return (
        <Card variant="elevated" style={[styles.sectionCard, styles.statusCardUpToDate]}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Vehicle Status
          </Typography>
          
          <View style={styles.statusHeaderRow}>
            <Typography variant="caption" style={styles.statusUpToDateText}>
              All maintenance up to date
            </Typography>
          </View>
          
          {vehicleStatus.lastMaintenanceDate && (
            <View style={[styles.statRow, styles.lastServiceRow]}>
              <Typography variant="caption" style={styles.statLabel}>
                Last service: {vehicleStatus.lastMaintenanceDate.toLocaleDateString()}
              </Typography>
            </View>
          )}
        </Card>
      );
    }

    const getStatusColor = () => {
      switch(nextService.status) {
        case 'overdue': return theme.colors.error;     // Critical Red
        case 'due': return theme.colors.warning;       // Signal Orange  
        case 'upcoming': return theme.colors.info;     // Electric Blue
        default: return theme.colors.success;          // Racing Green
      }
    };

    const getStatusIcon = () => {
      switch(nextService.status) {
        case 'overdue': return <AlertTriangleIcon size={24} color={theme.colors.error} />;
        case 'due': return <MaintenanceIcon size={24} color={theme.colors.warning} />;
        case 'upcoming': return <MaintenanceIcon size={24} color={theme.colors.info} />;
        default: return <CheckIcon size={24} color={theme.colors.success} />;
      }
    };

    const getStatusMessage = () => {
      switch(nextService.status) {
        case 'overdue': return 'Service Overdue';
        case 'due': return 'Service Due Soon';
        case 'upcoming': return 'Next Service';
        default: return 'Up to Date';
      }
    };

    // Show overdue services 
    return (
      <Card 
        variant="elevated" 
        style={[
          styles.sectionCard, 
          styles.statusCard,
          { borderLeftColor: theme.colors.error, borderLeftWidth: 4 }
        ]}
      >
        <Typography variant="heading" style={styles.sectionTitle}>
          Vehicle Status
        </Typography>
        
        {/* Services Overdue Header with Count */}
        <View style={styles.statusHeaderRow}>
          <Typography variant="caption" style={styles.overdueLabel}>
            Services overdue: {overdueServices.length}
          </Typography>
        </View>

        {/* Numbered Overdue Services List */}
        <View style={styles.overdueServicesTable}>
          {overdueServices.map((service, index) => (
            <View key={index} style={styles.overdueServiceRow}>
              <Typography variant="caption" style={styles.overdueServiceNumber}>
                {index + 1}.
              </Typography>
              <Typography variant="caption" style={styles.overdueServiceName}>
                {service.service} • {service.dueIn}
              </Typography>
            </View>
          ))}
        </View>
        
        {vehicleStatus.lastMaintenanceDate && (
          <View style={[styles.statRow, styles.lastServiceRow]}>
            <Typography variant="caption" style={styles.statLabel}>
              Last service: {vehicleStatus.lastMaintenanceDate.toLocaleDateString()}
            </Typography>
          </View>
        )}
      </Card>
    );
  };

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

  const renderCostAnalytics = () => {
    if (maintenanceLogs.length === 0) {
      // Show placeholder when no maintenance logs exist
      return (
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Cost & Analytics
          </Typography>
          <Typography variant="body" style={styles.statusLoading}>
            Add maintenance records with costs to see analytics
          </Typography>
        </Card>
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
        <Card variant="elevated" style={styles.sectionCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Cost & Analytics
          </Typography>
          <Typography variant="body" style={styles.statusLoading}>
            Add cost information to your maintenance records to see spending analytics
          </Typography>
          <Typography variant="caption" style={styles.statusLoading}>
            Debug: Found {maintenanceLogs.length} logs, {maintenanceLogs.filter(log => (log.totalCost || 0) > 0).length} with costs
          </Typography>
        </Card>
      );
    }

    return (
      <Card variant="elevated" style={styles.sectionCard}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Cost & Analytics
        </Typography>
        
        {/* Cost Metrics Grid */}
        <View style={styles.costMetricsGrid}>
          <View style={styles.costMetricItem}>
            <Typography variant="bodyLarge" style={styles.costMetricValue}>
              ${analytics.totalCost}
            </Typography>
            <Typography variant="caption" style={styles.costMetricLabel}>
              Total Spent
            </Typography>
          </View>
          
          <View style={styles.costMetricItem}>
            <Typography variant="bodyLarge" style={styles.costMetricValue}>
              ${analytics.averagePerService}
            </Typography>
            <Typography variant="caption" style={styles.costMetricLabel}>
              Avg per Service
            </Typography>
          </View>
          
          {analytics.recent30Days > 0 && (
            <View style={styles.costMetricItem}>
              <Typography variant="bodyLarge" style={styles.costMetricValue}>
                ${analytics.recent30Days}
              </Typography>
              <Typography variant="caption" style={styles.costMetricLabel}>
                Last 30 Days
              </Typography>
            </View>
          )}
          
          {analytics.costPerMile && (
            <View style={styles.costMetricItem}>
              <Typography variant="bodyLarge" style={styles.costMetricValue}>
                ${analytics.costPerMile}/mi
              </Typography>
              <Typography variant="caption" style={styles.costMetricLabel}>
                Cost per Mile
              </Typography>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={[styles.statRow, styles.costSummaryRow]}>
          <Typography variant="caption" style={styles.statLabel}>
            {maintenanceLogs.length} maintenance {maintenanceLogs.length === 1 ? 'entry' : 'entries'} • {analytics.timespan}
          </Typography>
        </View>
        
        {analytics.trend && (
          <View style={styles.statRow}>
            <Typography variant="caption" style={[
              styles.costTrendText,
              { color: analytics.trend === 'increasing' ? theme.colors.warning : theme.colors.success }
            ]}>
              {analytics.trend === 'increasing' 
                ? `📈 Spending trending up (${analytics.trendPercentage}%)`
                : `📉 Spending trending down (${analytics.trendPercentage}%)`
              }
            </Typography>
          </View>
        )}
      </Card>
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
  vehicleInfo: {
    gap: theme.spacing.xs,
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