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
import { useFocusEffect } from '@react-navigation/native';

import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { theme } from '../utils/theme';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { VehicleStatusService, NextServiceDue } from '../services/VehicleStatusService';

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

  // Load data on mount and when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [vehicleId])
  );

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
        const statusSummary = VehicleStatusService.calculateVehicleStatus(vehicleData, vehiclePrograms, logs);
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
                {service.service || 'Unknown Service'}
              </Typography>
              <Typography variant="bodySmall" style={styles.overdueServiceDetails}>
                {(() => {
                  if (service.type === 'time' && service.dueDate && service.dueIn) {
                    return `Due: ${service.dueDate.toLocaleDateString()} (${service.dueIn})`;
                  }
                  if (service.type === 'mileage' && service.dueMileage && service.dueIn) {
                    return `Due: ${service.dueMileage.toLocaleString()} miles (${service.dueIn})`;
                  }
                  if (service.type === 'both' && service.dueDate && service.dueMileage && service.dueIn) {
                    return `Due: ${service.dueDate.toLocaleDateString()} or ${service.dueMileage.toLocaleString()} miles (${service.dueIn})`;
                  }
                  return 'Service overdue';
                })()}
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
        {maintenanceLogs.map((log, index) => (
            <TouchableOpacity
              key={log.id || `log-${index}`}
              style={[
                styles.serviceItem,
                log.serviceType === 'shop' ? styles.serviceItemShop : styles.serviceItemDIY
              ]}
            onPress={() => {
              // Navigate to service detail screen
              navigation.navigate('ServiceDetail', { 
                serviceLogId: log.id, 
                vehicleId: vehicleId 
              });
            }}
          >
            <View style={styles.serviceContent}>
              {/* Title: Service Type */}
              <Typography variant="body" style={styles.serviceName}>
                {(typeof log.serviceType === 'string' && log.serviceType === 'shop') ? 'Shop Service' : 
                 (typeof log.serviceType === 'string' && log.serviceType === 'diy') ? 'DIY Service' : 'Service'}
              </Typography>
              
              {/* Row 2: Date - Mileage */}
              <View style={styles.serviceDetails}>
                <Typography variant="bodySmall" style={styles.serviceDetailText}>
                  {log.date ? new Date(log.date).toLocaleDateString() : 'Unknown date'}
                </Typography>
                {(typeof log.mileage === 'number' && !isNaN(log.mileage) && log.mileage > 0) ? (
                  <>
                    <Typography variant="bodySmall" style={styles.serviceDetailText}>
                      {' - '}
                    </Typography>
                    <Typography variant="bodySmall" style={styles.serviceDetailText}>
                      {log.mileage.toLocaleString()} miles
                    </Typography>
                  </>
                ) : null}
              </View>
              
              {/* Row 3: Total Cost */}
              {(typeof log.totalCost === 'number' && !isNaN(log.totalCost) && log.totalCost > 0) ? (
                <Typography variant="bodySmall" style={styles.serviceDetailText}>
                  Total cost: ${Number(log.totalCost).toFixed(2)}
                </Typography>
              ) : null}
              
              {/* Row 4: Services List */}
              {log.services && log.services.length > 0 && (
                <View style={styles.servicesContainer}>
                  <Typography variant="bodySmall" style={styles.serviceDetailText}>
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
    gap: theme.spacing.lg, // Increased spacing between service cards
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.lg, // 18px, match InfoCard titles
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  // Service Items
  serviceItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    paddingLeft: theme.spacing.lg, // Extra padding for colored border
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4, // Colored left border
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  serviceItemDIY: {
    borderLeftColor: '#166534', // Racing Green for DIY - explicit color
  },
  serviceItemShop: {
    borderLeftColor: '#1e40af', // Engine Blue for Shop - explicit color
  },
  overdueServiceItem: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    backgroundColor: '#fef2f2', // Very light red background
  },
  
  serviceContent: {
    gap: theme.spacing.xs,
  },
  serviceName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base, // 16px, slightly smaller than VehicleCard title
    fontWeight: theme.typography.fontWeight.semibold,
  },
  overdueServiceName: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetailText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm, // 14px, match VehicleCard subtitle
  },
  servicesContainer: {
    gap: theme.spacing.xs / 2,
  },
  serviceItem: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm, // 14px, match VehicleCard subtitle
    marginLeft: theme.spacing.sm, // Indent for bullet list
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