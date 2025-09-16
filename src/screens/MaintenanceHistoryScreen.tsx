// Maintenance History Screen - Clean implementation using proven InfoCard patterns
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import { Typography } from '../components/common/Typography';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import InfoCard from '../components/common/InfoCard';
import { EmptyState } from '../components/common/ErrorState';
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

/**
 * Maintenance History Screen - Clean implementation using proven InfoCard patterns
 * Shows overdue services + full maintenance history with consistent styling
 */
const MaintenanceHistoryScreen: React.FC<MaintenanceHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  
  // Get vehicleId from route params
  const { vehicleId } = route.params as { vehicleId: string };
  
  // State management (enhanced with pagination)
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [overdueServices, setOverdueServices] = useState<NextServiceDue[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<MaintenanceLog[]>([]);
  const [hasMoreLogs, setHasMoreLogs] = useState(false);
  const [logsPerPage] = useState(10);

  // Load data (preserved from original)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [vehicleId])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const [vehicleData, logs, vehiclePrograms] = await Promise.all([
        vehicleRepository.getById(vehicleId),
        maintenanceLogRepository.getByVehicleId(vehicleId),
        programRepository.getProgramsByVehicle(vehicleId),
      ]);

      if (vehicleData) {
        setVehicle(vehicleData);
        const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());
        setMaintenanceLogs(sortedLogs);
        setPrograms(vehiclePrograms);

        // Initialize pagination - show first 10 logs
        setDisplayedLogs(sortedLogs.slice(0, logsPerPage));
        setHasMoreLogs(sortedLogs.length > logsPerPage);

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

  // Load more logs function for pagination
  const loadMoreLogs = () => {
    const currentCount = displayedLogs.length;
    const nextBatch = maintenanceLogs.slice(currentCount, currentCount + logsPerPage);
    const updatedDisplayedLogs = [...displayedLogs, ...nextBatch];
    
    setDisplayedLogs(updatedDisplayedLogs);
    setHasMoreLogs(updatedDisplayedLogs.length < maintenanceLogs.length);
  };

  // Overdue Services section using InfoCard pattern
  const renderOverdueServices = () => {
    if (overdueServices.length === 0) {
      return null;
    }

    return (
      <InfoCard
        title="Overdue Services"
        style={styles.sectionCard}
      >
        <View style={styles.servicesContainer}>
          {overdueServices.map((service, index) => (
            <TouchableOpacity
              key={`overdue-${index}`}
              style={[styles.serviceItem, styles.overdueService]}
              onPress={() => {
                // Future: Navigate to program-based service management
                console.log('Navigate to overdue service:', service.service);
              }}
            >
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
            </TouchableOpacity>
          ))}
        </View>
      </InfoCard>
    );
  };

  // Simple maintenance history list - minimal implementation
  const renderMaintenanceHistory = () => {
    return (
      <View style={styles.historyContainer}>
        {displayedLogs.map((log, index) => {
          const serviceText = log.serviceType === 'shop' ? 'Shop Service' : 'DIY Service';
          const dateText = log.date.toLocaleDateString();
          const costText = log.totalCost > 0 ? ` • $${log.totalCost.toFixed(2)}` : '';
          
          return (
            <TouchableOpacity
              key={log.id || `log-${index}`}
              style={styles.logRow}
              onPress={() => navigation.navigate('ServiceDetail', { 
                serviceLogId: log.id, 
                vehicleId: vehicleId 
              })}
            >
              <Typography variant="body" style={styles.logTitle}>
                {serviceText}
              </Typography>
              <Typography variant="bodySmall" style={styles.logSubtitle}>
                {dateText}{costText}
              </Typography>
            </TouchableOpacity>
          );
        })}
        
        {hasMoreLogs && (
          <TouchableOpacity onPress={loadMoreLogs} style={styles.loadMoreButton}>
            <Typography variant="bodySmall" style={styles.loadMoreText}>
              Load More
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading maintenance history..." />
      </View>
    );
  }

  // Error state - Vehicle not found
  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            title="Vehicle Not Found"
            message="This vehicle could not be found"
            icon="🚗"
            showRetry
            onRetry={loadData}
          />
        </View>
      </View>
    );
  }

  // Empty state when no maintenance logs exist
  if (maintenanceLogs.length === 0) {
    return (
      <View style={styles.container}>
        {/* Empty State Content */}
        <View style={styles.emptyStateContainer}>
          <Typography variant="bodyLarge" style={styles.emptyStateText}>
            Log maintenance services to build your car's life history.
          </Typography>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <Button
            title="Log Maintenance"
            variant="primary"
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddMaintenanceLog', { vehicleId })}
          />
          <Button
            title="Back to Vehicle"
            variant="outline"
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderOverdueServices()}
        {renderMaintenanceHistory()}
      </ScrollView>

      {/* Bottom Action Buttons - Following button patterns from other screens */}
      <View style={styles.bottomActions}>
        <Button
          title="Log Maintenance"
          variant="primary"
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddMaintenanceLog', { vehicleId })}
        />
        <Button
          title="Back to Vehicle"
          variant="outline"
          style={styles.actionButton}
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
  
  // Content (following VehicleHomeScreen pattern)
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  
  // Section Cards (consistent with VehicleHomeScreen)
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  
  // Services Container (for overdue and timeline)
  servicesContainer: {
    gap: theme.spacing.md,
  },
  
  // Service Items (overdue services)
  serviceItem: {
    gap: theme.spacing.xs,
  },
  overdueService: {
    paddingLeft: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    backgroundColor: '#fef2f2', // Very light red background
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  overdueServiceName: {
    color: theme.colors.error,
  },
  overdueServiceDetails: {
    color: theme.colors.error,
  },
  
  // Bottom Actions (consistent with other screens)
  bottomActions: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  actionButton: {
    minHeight: 48,
  },
  
  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginBottom: theme.spacing.xl,
  },
  
  // Simple History Container
  historyContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.xs,
  },
  
  // Simple Log Row
  logRow: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  
  // Simple Text Styles
  logTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  logSubtitle: {
    color: theme.colors.textSecondary,
  },
  
  // Load More Button
  loadMoreButton: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  loadMoreText: {
    color: theme.colors.primary,
  },
});

export default MaintenanceHistoryScreen;