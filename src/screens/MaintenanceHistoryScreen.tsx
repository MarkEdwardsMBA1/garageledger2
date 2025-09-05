// Unified Maintenance History Screen
// Shows overdue services (red, at top) + full maintenance history (chronological)
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { theme } from '../utils/theme';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { calculateVehicleStatusSummary, NextServiceDue } from '../services/VehicleStatusService';

// Navigation types
type MaintenanceHistoryScreenNavigationProp = StackNavigationProp<any, 'MaintenanceHistory'>;
type MaintenanceHistoryScreenRouteProp = RouteProp<any, 'MaintenanceHistory'>;

interface MaintenanceHistoryScreenProps {
  navigation: MaintenanceHistoryScreenNavigationProp;
  route: MaintenanceHistoryScreenRouteProp;
}

const MaintenanceHistoryScreen: React.FC<MaintenanceHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  // Get vehicleId from route params
  const { vehicleId } = route.params as { vehicleId: string };
  
  // State
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [overdueServices, setOverdueServices] = useState<NextServiceDue[]>([]);

  // Using singleton repository instances

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load vehicle, maintenance logs, and programs in parallel
      const [vehicleData, logs, vehiclePrograms] = await Promise.all([
        vehicleRepository.getById(vehicleId),
        maintenanceLogRepository.getByVehicleId(vehicleId),
        programRepository.getProgramsByVehicle(vehicleId),
      ]);

      if (vehicleData) {
        setVehicle(vehicleData);
        setMaintenanceLogs(logs.sort((a, b) => b.date.getTime() - a.date.getTime()));
        setPrograms(vehiclePrograms);

        // Calculate overdue services
        const statusSummary = calculateVehicleStatusSummary(vehicleData, vehiclePrograms, logs);
        setOverdueServices(statusSummary.overdueServices);
      }
    } catch (error) {
      console.error('Error loading maintenance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverdueServices = () => {
    if (overdueServices.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Overdue Services
        </Typography>
        
        {overdueServices.map((service, index) => (
          <TouchableOpacity
            key={`overdue-${index}`}
            style={[styles.serviceItem, styles.overdueServiceItem]}
            onPress={() => {
              // Future: Navigate to program-based service management for overdue services
              console.log('Navigate to overdue service:', service.service);
            }}
          >
            <View style={styles.serviceContent}>
              <Typography variant="body" style={styles.overdueServiceName}>
                {service.service}
              </Typography>
              <Typography variant="bodySmall" style={styles.overdueServiceDetails}>
                {service.type === 'time' && service.dueDate && (
                  `Due: ${service.dueDate.toLocaleDateString()} (${service.dueIn})`
                )}
                {service.type === 'mileage' && service.dueMileage && (
                  `Due: ${service.dueMileage.toLocaleString()} miles (${service.dueIn})`
                )}
                {service.type === 'both' && service.dueDate && service.dueMileage && (
                  `Due: ${service.dueDate.toLocaleDateString()} or ${service.dueMileage.toLocaleString()} miles (${service.dueIn})`
                )}
              </Typography>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMaintenanceHistory = () => {
    if (maintenanceLogs.length === 0) {
      return (
        <View style={styles.section}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Past Services
          </Typography>
          <View style={styles.emptyState}>
            <Typography variant="body" style={styles.emptyStateText}>
              Log maintenance services to see a list of all services performed.
            </Typography>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Past Services
        </Typography>
        
        {maintenanceLogs.map((log) => (
          <TouchableOpacity
            key={log.id}
            style={styles.serviceItem}
            onPress={() => {
              // Navigate to service detail screen
              navigation.navigate('ServiceDetail', { 
                serviceLogId: log.id, 
                vehicleId: vehicleId 
              });
            }}
          >
            <View style={styles.serviceContent}>
              <View style={styles.serviceHeader}>
                <Typography variant="body" style={styles.serviceName}>
                  {log.title}
                </Typography>
                {log.totalCost && log.totalCost > 0 && (
                  <Typography variant="body" style={styles.serviceCost}>
                    ${log.totalCost.toFixed(2)}
                  </Typography>
                )}
              </View>
              
              <View style={styles.serviceDetails}>
                <Typography variant="bodySmall" style={styles.serviceDate}>
                  {log.date.toLocaleDateString()}
                </Typography>
                {log.mileage > 0 && (
                  <>
                    <Typography variant="bodySmall" style={styles.serviceSeparator}>
                      •
                    </Typography>
                    <Typography variant="bodySmall" style={styles.serviceMileage}>
                      {log.mileage.toLocaleString()} miles
                    </Typography>
                  </>
                )}
                <Typography variant="bodySmall" style={styles.serviceSeparator}>
                  •
                </Typography>
                <Typography variant="bodySmall" style={styles.serviceType}>
                  {log.serviceType === 'shop' ? 'Shop Service' : 'DIY Service'}
                </Typography>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!vehicle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Typography variant="body" style={styles.errorText}>
          Vehicle not found
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderOverdueServices()}
        {renderMaintenanceHistory()}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <Button
          title="Log Maintenance"
          variant="primary"
          fullWidth
          onPress={() => navigation.navigate('AddMaintenanceLog', { vehicleId })}
        />
        
        <Button
          title="Cancel"
          variant="outline"
          fullWidth
          onPress={() => navigation.goBack()}
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
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  
  // Sections
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  // Service Items
  serviceItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  overdueServiceItem: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    backgroundColor: '#fef2f2', // Very light red background
  },
  
  serviceContent: {
    gap: theme.spacing.xs,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  overdueServiceName: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  serviceCost: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  serviceDate: {
    color: theme.colors.textSecondary,
  },
  serviceMileage: {
    color: theme.colors.textSecondary,
  },
  serviceType: {
    color: theme.colors.textSecondary,
  },
  serviceSeparator: {
    color: theme.colors.textSecondary,
  },
  overdueServiceDetails: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Empty States
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'left',
  },
  
  // Error
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    margin: theme.spacing.lg,
  },

  // Bottom Action Buttons
  bottomActions: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
});

export default MaintenanceHistoryScreen;