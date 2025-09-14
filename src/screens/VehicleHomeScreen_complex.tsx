// Vehicle Home Screen - Clean implementation using proven patterns
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import InfoCard from '../components/common/InfoCard';
import VehicleCard from '../components/common/VehicleCard';
import { ActivityIcon, SpannerIcon, CheckIcon, AlertTriangleIcon } from '../components/icons';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { VehicleStatusService, VehicleStatusSummary } from '../services/VehicleStatusService';

interface VehicleHomeParams {
  vehicleId: string;
}

/**
 * Vehicle Home Screen - Clean implementation using proven patterns
 * Shows maintenance timeline, status, and quick actions for specific vehicle
 */
const VehicleHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const params = route.params as VehicleHomeParams;

  // State management (copied from original)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatusSummary | null>(null);

  // Load vehicle data (preserved from original)
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
      setMaintenanceLogs(logs.sort((a, b) => b.date.getTime() - a.date.getTime()));
      setPrograms(vehiclePrograms);
      
      // Calculate vehicle status
      const statusSummary = VehicleStatusService.calculateVehicleStatus(vehicleData, vehiclePrograms, logs);
      setVehicleStatus(statusSummary);
    } catch (err: any) {
      console.error('Error loading vehicle data:', err);
      setError(err.message || 'Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  // Load data effects (preserved from original)
  useEffect(() => {
    loadVehicleData();
  }, [isAuthenticated, params?.vehicleId]);

  useFocusEffect(
    React.useCallback(() => {
      loadVehicleData();
    }, [isAuthenticated, params?.vehicleId])
  );

  // Vehicle header section (using VehicleCard pattern from VehiclesScreen)
  const renderVehicleHeader = () => {
    if (!vehicle) return null;

    const additionalInfo = (
      <View style={styles.vehicleDetails}>
        {vehicle.vin && (
          <Typography variant="bodySmall" style={styles.detailText}>
            VIN: {vehicle.vin}
          </Typography>
        )}
        {vehicle.notes && (
          <Typography variant="bodySmall" style={styles.detailText}>
            {vehicle.notes}
          </Typography>
        )}
      </View>
    );

    return (
      <VehicleCard
        vehicle={vehicle}
        showImage={true}
        onPress={() => navigation.navigate('EditVehicle', { vehicleId: vehicle.id })}
        additionalInfo={additionalInfo}
        style={styles.vehicleCard}
      />
    );
  };

  // Quick Actions section (using InfoCard pattern from ProgramsScreen)
  const renderQuickActions = () => (
    <InfoCard
      title="Quick Actions"
      style={styles.sectionCard}
    >
      <View style={styles.actionButtons}>
        <Button
          title="Log Maintenance"
          variant="primary"
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddMaintenanceLog', { vehicleId: params.vehicleId })}
        />
        <Button
          title="Manage Programs"
          variant="outline"
          style={styles.actionButton}
          onPress={() => {
            if (programs.length > 0) {
              navigation.navigate('Programs', {
                screen: 'EditProgram',
                params: { programId: programs[0].id }
              });
            } else {
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

  // Vehicle Status section (clean InfoCard pattern)
  const renderVehicleStatus = () => {
    if (programs.length === 0) {
      return (
        <InfoCard
          title="Vehicle Status"
          subtitle="Setup a maintenance program to track your vehicle's service schedule."
          style={styles.sectionCard}
        />
      );
    }

    if (!vehicleStatus) {
      return (
        <InfoCard
          title="Vehicle Status"
          subtitle="Calculating status..."
          style={styles.sectionCard}
        />
      );
    }

    const statusMessage = VehicleStatusService.getStatusMessage(vehicleStatus);
    const statusColor = VehicleStatusService.getStatusColor(vehicleStatus.overallStatus);
    const primaryProgram = programs[0];

    return (
      <InfoCard
        title="Vehicle Status"
        style={styles.sectionCard}
        onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
      >
        <View style={styles.statusContent}>
          <View style={styles.programInfo}>
            <Typography variant="bodySmall" style={styles.programLabel}>
              Program: {primaryProgram.name}
            </Typography>
          </View>

          <View style={[styles.statusIndicator, { borderLeftColor: statusColor }]}>
            <View style={styles.statusIcon}>
              {vehicleStatus.overallStatus === 'overdue' && (
                <AlertTriangleIcon size={20} color={statusColor} />
              )}
              {vehicleStatus.overallStatus === 'due' && (
                <ActivityIcon size={20} color={statusColor} />
              )}
              {vehicleStatus.overallStatus === 'upcoming' && (
                <SpannerIcon size={20} color={statusColor} />
              )}
              {vehicleStatus.overallStatus === 'up_to_date' && (
                <CheckIcon size={20} color={statusColor} />
              )}
            </View>
            
            <View style={styles.statusText}>
              <Typography variant="body" style={[styles.statusMessage, { color: statusColor }]}>
                {statusMessage}
              </Typography>
              {vehicleStatus.nextServiceDue && (
                <Typography variant="caption" style={styles.statusDetail}>
                  From: {vehicleStatus.nextServiceDue.programName}
                </Typography>
              )}
            </View>
          </View>
        </View>
      </InfoCard>
    );
  };

  // Maintenance Timeline section (clean pattern)
  const renderMaintenanceTimeline = () => {
    if (maintenanceLogs.length === 0) {
      return (
        <InfoCard
          title="Recent Maintenance"
          subtitle="Log maintenance services to see your service history."
          style={styles.sectionCard}
          onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
        />
      );
    }

    const recentLogs = maintenanceLogs.slice(0, 5);
    const showViewAll = maintenanceLogs.length > 5;

    return (
      <InfoCard
        title="Recent Maintenance"
        style={styles.sectionCard}
        onPress={() => navigation.navigate('MaintenanceHistory', { vehicleId: params.vehicleId })}
      >
        <View style={styles.timelineContent}>
          {showViewAll && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Insights')}
            >
              <Typography variant="bodySmall" style={styles.viewAllText}>
                View All ({maintenanceLogs.length})
              </Typography>
            </TouchableOpacity>
          )}
          
          <View style={styles.timeline}>
            {recentLogs.map((log, index) => {
              const serviceType = log.serviceType === 'shop' ? 'Shop Service' : 'DIY Service';
              
              return (
                <View 
                  key={log.id}
                  style={[
                    styles.timelineItem,
                    index < recentLogs.length - 1 && styles.timelineItemBorder,
                    log.serviceType === 'shop' ? styles.timelineShop : styles.timelineDIY
                  ]}
                >
                  <Typography variant="body" style={styles.timelineTitle}>
                    {serviceType}
                  </Typography>
                  
                  <View style={styles.timelineDetails}>
                    <Typography variant="bodySmall" style={styles.timelineDetail}>
                      {log.date.toLocaleDateString()}
                    </Typography>
                    {log.mileage > 0 && (
                      <Typography variant="bodySmall" style={styles.timelineDetail}>
                        - {log.mileage.toLocaleString()} miles
                      </Typography>
                    )}
                  </View>
                  
                  {log.totalCost && log.totalCost > 0 && (
                    <Typography variant="bodySmall" style={styles.timelineDetail}>
                      Cost: ${log.totalCost.toFixed(2)}
                    </Typography>
                  )}
                  
                  {log.services && log.services.length > 0 && (
                    <View style={styles.servicesList}>
                      <Typography variant="bodySmall" style={styles.timelineDetail}>
                        Services:
                      </Typography>
                      {log.services.map((service, serviceIndex) => (
                        <Typography key={serviceIndex} variant="bodySmall" style={styles.serviceItem}>
                          • {service.serviceName}
                        </Typography>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </InfoCard>
    );
  };

  // Cost Analytics section (placeholder)
  const renderCostAnalytics = () => {
    if (maintenanceLogs.length === 0) {
      return (
        <InfoCard
          title="Cost & Analytics"
          subtitle="Add maintenance records with costs for insights."
          style={styles.sectionCard}
        />
      );
    }

    return (
      <InfoCard
        title="Cost & Analytics"
        subtitle="Analytics will be displayed here"
        style={styles.sectionCard}
        onPress={() => navigation.navigate('VehicleAnalytics', { vehicleId: vehicle?.id })}
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading vehicle details..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            title="Error"
            message={error}
            icon="⚠️"
            showRetry
            onRetry={loadVehicleData}
          />
        </View>
      </View>
    );
  }

  // Vehicle not found
  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            title="Vehicle Not Found"
            message="This vehicle could not be found"
            icon="🚗"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderVehicleHeader()}
        {renderQuickActions()}
        {renderVehicleStatus()}
        {renderMaintenanceTimeline()}
        {renderCostAnalytics()}
      </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  // Vehicle Card
  vehicleCard: {
    marginBottom: theme.spacing.lg,
  },
  vehicleDetails: {
    gap: theme.spacing.xs,
  },
  detailText: {
    color: theme.colors.textSecondary,
  },

  // Section Cards (following ProgramsScreen pattern)
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },

  // Quick Actions
  actionButtons: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    minHeight: 48,
  },

  // Vehicle Status
  statusContent: {
    gap: theme.spacing.sm,
  },
  programInfo: {
    marginBottom: theme.spacing.xs,
  },
  programLabel: {
    color: theme.colors.textSecondary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderLeftWidth: 4,
    gap: theme.spacing.sm,
  },
  statusIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  statusMessage: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusDetail: {
    color: theme.colors.textSecondary,
  },

  // Timeline
  timelineContent: {
    gap: theme.spacing.sm,
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    paddingVertical: theme.spacing.xs,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timeline: {
    gap: theme.spacing.md,
  },
  timelineItem: {
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 4,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  timelineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingBottom: theme.spacing.md,
  },
  timelineShop: {
    borderLeftColor: theme.colors.primary,
  },
  timelineDIY: {
    borderLeftColor: theme.colors.secondary,
  },
  timelineTitle: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  timelineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timelineDetail: {
    color: theme.colors.textSecondary,
  },
  servicesList: {
    gap: theme.spacing.xs / 2,
  },
  serviceItem: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
});

export default VehicleHomeScreen;