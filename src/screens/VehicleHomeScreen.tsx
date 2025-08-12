// Vehicle Home Page - Deep dive into specific vehicle
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { Typography } from '../components/common/Typography';
import { ActivityIcon } from '../components/icons';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { getCategoryName, getSubcategoryName } from '../types/MaintenanceCategories';
import { Vehicle, MaintenanceLog } from '../types';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vehicle data
  const loadVehicleData = async () => {
    if (!isAuthenticated || !params?.vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [vehicleData, logs] = await Promise.all([
        vehicleRepository.getById(params.vehicleId),
        maintenanceLogRepository.getByVehicleId(params.vehicleId)
      ]);
      
      if (!vehicleData) {
        setError('Vehicle not found');
        return;
      }
      
      setVehicle(vehicleData);
      setMaintenanceLogs(logs);
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

  const renderVehicleHeader = () => {
    if (!vehicle) return null;

    return (
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.vehicleInfo}>
          <Typography variant="title" style={styles.vehicleName}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Typography>
          
          {vehicle.mileage > 0 && (
            <View style={styles.mileageContainer}>
              <Typography variant="bodyLarge" style={styles.mileageLabel}>
                📍 Current:
              </Typography>
              <Typography variant="bodyLarge" style={styles.mileageValue}>
                {vehicle.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
              </Typography>
            </View>
          )}
          
          {vehicle.notes && (
            <Typography variant="bodySmall" style={styles.vehicleNotes}>
              {vehicle.notes}
            </Typography>
          )}
        </View>
      </Card>
    );
  };

  const renderQuickActions = () => (
    <Card variant="elevated" style={styles.sectionCard}>
      <Typography variant="heading" style={styles.sectionTitle}>
        🔧 {t('dashboard.quickActions', 'Quick Actions')}
      </Typography>
      
      <View style={styles.actionButtons}>
        <Button
          title={t('maintenance.logMaintenance', 'Log Maintenance')}
          variant="primary"
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('Maintenance', { 
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
                navigation.navigate('Maintenance', { 
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
              onPress={() => navigation.navigate('Maintenance')}
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
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
});

export default VehicleHomeScreen;