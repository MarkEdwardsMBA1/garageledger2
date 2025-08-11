// Maintenance screen for tracking and managing maintenance records
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/ErrorState';
import { ActivityIcon } from '../components/icons';
import { Typography } from '../components/common/Typography';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { getCategoryName, getSubcategoryName } from '../types/MaintenanceCategories';
import { MaintenanceLog, Vehicle } from '../types';
import { useAuth } from '../contexts/AuthContext';

type MaintenanceTab = 'status' | 'history';

/**
 * Maintenance screen - fleet command center for maintenance management
 * Shows fleet status overview and maintenance history across all vehicles
 */
const MaintenanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('status'); // Start with status overview
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([]);

  // TODO: Replace with actual upcoming maintenance data (reminders)
  const upcomingMaintenance: any[] = [];


  // Load maintenance data
  const loadMaintenanceData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const [logs, userVehicles] = await Promise.all([
        maintenanceLogRepository.getAll(),
        vehicleRepository.getUserVehicles()
      ]);
      
      setMaintenanceLogs(logs);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLogs(maintenanceLogs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = maintenanceLogs.filter(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      const vehicleText = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '';
      const [categoryKey, subcategoryKey] = log.category.split(':');
      const categoryText = getCategoryName(categoryKey) + ' ' + getSubcategoryName(categoryKey, subcategoryKey);
      
      return (
        log.title.toLowerCase().includes(query) ||
        vehicleText.toLowerCase().includes(query) ||
        categoryText.toLowerCase().includes(query) ||
        (log.notes && log.notes.toLowerCase().includes(query))
      );
    });
    
    setFilteredLogs(filtered);
  }, [searchQuery, maintenanceLogs, vehicles]);

  // Load data on mount and when screen is focused
  useEffect(() => {
    loadMaintenanceData();
  }, [isAuthenticated]);

  useFocusEffect(
    React.useCallback(() => {
      loadMaintenanceData();
    }, [isAuthenticated])
  );

  const renderTabButton = (tab: MaintenanceTab, label: string) => (
    <Button
      title={label}
      variant={activeTab === tab ? 'primary' : 'ghost'}
      size="sm"
      style={styles.tabButton}
      onPress={() => setActiveTab(tab)}
    />
  );

  const renderFleetStatus = () => {
    // Calculate fleet statistics
    const totalMiles = vehicles.reduce((sum, vehicle) => sum + (vehicle.mileage || 0), 0);
    const totalLogs = maintenanceLogs.length;
    const totalVehicles = vehicles.length;
    
    // For now, assume all vehicles are up to date (no overdue maintenance)
    // This will be enhanced with actual reminder system later
    const overdueCount = 0;
    const dueSoonCount = 0;
    const upToDateCount = totalVehicles - overdueCount - dueSoonCount;

    if (totalVehicles === 0) {
      return (
        <EmptyState
          title="No Vehicles to Track"
          message="Add your first vehicle to start building your fleet status"
          icon="🚗"
          primaryAction={{
            title: t('vehicles.addVehicle', 'Add Vehicle'),
            onPress: () => navigation.navigate('Vehicles', { screen: 'AddVehicle' }),
          }}
        />
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {/* Fleet Summary Stats */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            📊 Fleet Overview
          </Typography>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Typography variant="title" style={styles.statNumber}>
                {totalVehicles}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                {totalVehicles === 1 ? 'Vehicle' : 'Vehicles'}
              </Typography>
            </View>
            
            <View style={styles.statCard}>
              <Typography variant="title" style={styles.statNumber}>
                {totalMiles.toLocaleString()}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                Total Miles
              </Typography>
            </View>
            
            <View style={styles.statCard}>
              <Typography variant="title" style={styles.statNumber}>
                {totalLogs}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                Maintenance Logs
              </Typography>
            </View>
          </View>
        </Card>

        {/* Vehicle Status Overview */}
        <Card variant="elevated" style={styles.statusCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            🚦 Status Summary
          </Typography>
          
          <View style={styles.statusItems}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusGoodIndicator]} />
              <View style={styles.statusContent}>
                <Typography variant="bodyLarge" style={styles.statusText}>
                  {upToDateCount} {upToDateCount === 1 ? 'vehicle' : 'vehicles'} up to date
                </Typography>
                <Typography variant="caption" style={styles.statusSubtext}>
                  No known maintenance needed
                </Typography>
              </View>
            </View>
            
            {dueSoonCount > 0 && (
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.statusWarningIndicator]} />
                <View style={styles.statusContent}>
                  <Typography variant="bodyLarge" style={styles.statusWarningText}>
                    {dueSoonCount} {dueSoonCount === 1 ? 'vehicle' : 'vehicles'} due soon
                  </Typography>
                  <Typography variant="caption" style={styles.statusSubtext}>
                    Maintenance needed within 30 days
                  </Typography>
                </View>
              </View>
            )}
            
            {overdueCount > 0 && (
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, styles.statusErrorIndicator]} />
                <View style={styles.statusContent}>
                  <Typography variant="bodyLarge" style={styles.statusErrorText}>
                    {overdueCount} {overdueCount === 1 ? 'vehicle' : 'vehicles'} overdue
                  </Typography>
                  <Typography variant="caption" style={styles.statusSubtext}>
                    Immediate attention required
                  </Typography>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Vehicle List with Status */}
        <Card variant="elevated" style={styles.vehicleListCard}>
          <Typography variant="heading" style={styles.sectionTitle}>
            🚗 Vehicle Details
          </Typography>
          
          {vehicles.map((vehicle) => {
            const vehicleLogs = maintenanceLogs.filter(log => log.vehicleId === vehicle.id);
            const lastMaintenance = vehicleLogs.length > 0 ? vehicleLogs[0] : null;
            
            return (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleItem}
                onPress={() => navigation.navigate('Vehicles', {
                  screen: 'VehicleHome',
                  params: { vehicleId: vehicle.id }
                })}
              >
                <View style={styles.vehicleInfo}>
                  <Typography variant="bodyLarge" style={styles.vehicleName}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Typography>
                  
                  <View style={styles.vehicleDetails}>
                    {vehicle.mileage > 0 && (
                      <Typography variant="caption" style={styles.vehicleMileage}>
                        {vehicle.mileage.toLocaleString()} miles
                      </Typography>
                    )}
                    
                    {lastMaintenance && (
                      <Typography variant="caption" style={styles.lastMaintenance}>
                        Last: {lastMaintenance.title} ({lastMaintenance.date.toLocaleDateString()})
                      </Typography>
                    )}
                    
                    {!lastMaintenance && (
                      <Typography variant="caption" style={styles.noMaintenance}>
                        No maintenance logged yet
                      </Typography>
                    )}
                  </View>
                </View>
                
                <View style={styles.vehicleStatus}>
                  <View style={[styles.statusIndicator, styles.statusGoodIndicator]} />
                  <Typography variant="caption" style={styles.statusGoodText}>
                    Up to date
                  </Typography>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
      </ScrollView>
    );
  };

  const renderHistory = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Loading message={t('maintenance.loading', 'Loading maintenance history...')} />
        </View>
      );
    }

    if (filteredLogs.length === 0 && !searchQuery) {
      return (
        <EmptyState
          title={t('maintenance.history.empty.title', 'No Maintenance History')}
          message="Visit your individual vehicles to start logging maintenance"
          icon={<ActivityIcon size={48} color={theme.colors.textSecondary} />}
          primaryAction={{
            title: t('vehicles.title', 'View Vehicles'),
            onPress: () => navigation.navigate('Vehicles'),
          }}
        />
      );
    }

    if (filteredLogs.length === 0 && searchQuery) {
      return (
        <EmptyState
          title={t('common.empty.title', 'No Results Found')}
          message={`No maintenance records found for "${searchQuery}"`}
          icon="🔍"
        />
      );
    }

    return (
      <>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder={t('maintenance.searchPlaceholder', 'Search maintenance records...')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredLogs.map((log) => {
            const vehicle = vehicles.find(v => v.id === log.vehicleId);
            const [categoryKey, subcategoryKey] = log.category.split(':');
            const categoryName = getCategoryName(categoryKey);
            const subcategoryName = getSubcategoryName(categoryKey, subcategoryKey);
            
            return (
              <Card
                key={log.id}
                title={log.title}
                subtitle={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                pressable
                onPress={() => {
                  console.log('View maintenance details:', log.id);
                  // TODO: Navigate to maintenance detail screen
                }}
                rightContent={
                  <View style={styles.logDetails}>
                    <Text style={styles.logDate}>
                      {log.date.toLocaleDateString()}
                    </Text>
                    <Text style={styles.completedStatus}>
                      {t('maintenance.completed', 'Completed')}
                    </Text>
                  </View>
                }
              >
                <View style={styles.logContent}>
                  <View style={styles.logRow}>
                    <Text style={styles.logLabel}>
                      {t('maintenance.category', 'Category')}:
                    </Text>
                    <Text style={styles.logValue}>
                      {subcategoryName || categoryName}
                    </Text>
                  </View>
                  
                  {log.mileage > 0 && (
                    <View style={styles.logRow}>
                      <Text style={styles.logLabel}>
                        {t('maintenance.mileage', 'Mileage')}:
                      </Text>
                      <Text style={styles.logValue}>
                        {log.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
                      </Text>
                    </View>
                  )}
                  
                  {log.cost && (
                    <View style={styles.logRow}>
                      <Text style={styles.logLabel}>
                        {t('maintenance.cost', 'Cost')}:
                      </Text>
                      <Text style={styles.logValue}>
                        ${log.cost.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  
                  {log.notes && (
                    <View style={[styles.logRow, styles.notesRow]}>
                      <Text style={styles.logNotes} numberOfLines={2}>
                        {log.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('maintenance.title', 'Maintenance')}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('status', 'Fleet Status')}
        {renderTabButton('history', t('maintenance.history.title', 'History'))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'status' ? renderFleetStatus() : renderHistory()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
  },
  activeTabButton: {
    // Active tab styling handled by variant
  } as const,
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    marginVertical: 0,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  logDetails: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  logDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  logContent: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  notesRow: {
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  logNotes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  dueBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  dueBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.surface,
  },
  completedStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Fleet Status Styles
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  statNumber: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  statusCard: {
    marginBottom: theme.spacing.lg,
  },
  statusItems: {
    gap: theme.spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusGoodIndicator: {
    backgroundColor: theme.colors.success,
  },
  statusWarningIndicator: {
    backgroundColor: theme.colors.warning,
  },
  statusErrorIndicator: {
    backgroundColor: theme.colors.error,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    color: theme.colors.text,
  },
  statusWarningText: {
    color: theme.colors.warning,
  },
  statusErrorText: {
    color: theme.colors.error,
  },
  statusGoodText: {
    color: theme.colors.success,
  },
  statusSubtext: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  vehicleListCard: {
    marginBottom: theme.spacing.lg,
  },
  vehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  vehicleInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  vehicleName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  vehicleDetails: {
    gap: theme.spacing.xs,
  },
  vehicleMileage: {
    color: theme.colors.textSecondary,
  },
  lastMaintenance: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  noMaintenance: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  vehicleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
});

export default MaintenanceScreen;