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
import { ActivityIcon, ReportAnalysisIcon, Car91Icon } from '../components/icons';
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
    // Calculate comprehensive fleet analytics
    const totalVehicles = vehicles.length;
    const totalLogs = maintenanceLogs.length;
    const totalMiles = vehicles.reduce((sum, vehicle) => sum + (vehicle.mileage || 0), 0);
    const averageMileage = totalVehicles > 0 ? Math.round(totalMiles / totalVehicles) : 0;
    
    // Calculate average age
    const currentYear = new Date().getFullYear();
    const totalAge = vehicles.reduce((sum, vehicle) => sum + (currentYear - vehicle.year), 0);
    const averageAge = totalVehicles > 0 ? (totalAge / totalVehicles).toFixed(1) : 0;
    
    // Calculate total service costs
    const totalServiceCosts = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    
    // Calculate category breakdown
    const categoryStats = maintenanceLogs.reduce((acc, log) => {
      const [categoryKey] = log.category.split(':');
      const categoryName = getCategoryName(categoryKey);
      const cost = log.cost || 0;
      
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, cost: 0 };
      }
      acc[categoryName].count++;
      acc[categoryName].cost += cost;
      return acc;
    }, {} as Record<string, { count: number; cost: number }>);
    
    // Get top 3 categories by cost
    const topCategories = Object.entries(categoryStats)
      .sort(([, a], [, b]) => b.cost - a.cost)
      .slice(0, 3)
      .map(([category, stats]) => ({
        name: category,
        cost: stats.cost,
        percentage: totalServiceCosts > 0 ? Math.round((stats.cost / totalServiceCosts) * 100) : 0,
        count: stats.count
      }));
    
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
          icon={<Car91Icon size={64} color={theme.colors.textSecondary} />}
          primaryAction={{
            title: t('vehicles.addVehicle', 'Add Vehicle'),
            onPress: () => navigation.navigate('Vehicles', { screen: 'AddVehicle' }),
          }}
        />
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {/* Unified Stats Cards - No section headers for cleaner look */}
        
        {/* Row 1: Navigation Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Vehicles')}
            activeOpacity={0.7}
            style={styles.statCardTouchable}
          >
            <Card variant="elevated" style={styles.statCard}>
              <Typography variant="display" style={styles.statNumber}>
                {totalVehicles}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                {t('dashboard.totalVehicles', 'Total Vehicles')}
              </Typography>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to reminders/upcoming when implemented
              // For now, stay on current screen
            }}
            activeOpacity={0.7}
            style={styles.statCardTouchable}
          >
            <Card variant="elevated" style={styles.statCard}>
              <Typography variant="display" style={styles.statNumber}>
                {upcomingMaintenance.length}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                {t('dashboard.upcomingMaintenance', 'Upcoming')}
              </Typography>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Row 2: Fleet Analytics */}
        <View style={styles.statsRow}>
          <Card variant="elevated" style={styles.statCard}>
            <Typography variant="display" style={styles.statNumber}>
              {averageAge}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Average Age (years)
            </Typography>
          </Card>
          
          <Card variant="elevated" style={styles.statCard}>
            <Typography variant="display" style={styles.statNumber}>
              {averageMileage.toLocaleString()}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Average Mileage
            </Typography>
          </Card>
        </View>

        {/* Row 3: Service Analytics */}
        <View style={styles.statsRow}>
          <Card variant="elevated" style={styles.statCard}>
            <Typography variant="display" style={styles.statNumber}>
              ${totalServiceCosts.toFixed(0)}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Total Service Costs
            </Typography>
          </Card>
          
          <Card variant="elevated" style={styles.statCard}>
            <Typography variant="display" style={styles.statNumber}>
              {totalLogs}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Total Services
            </Typography>
          </Card>
        </View>

        {/* Cost Breakdown by Category */}
        {totalServiceCosts > 0 && topCategories.length > 0 && (
          <Card variant="elevated" style={styles.summaryCard}>
            <Typography variant="heading" style={styles.sectionTitle}>
              Cost Breakdown by Category
            </Typography>
            
            {topCategories.map((category, index) => (
              <View key={category.name} style={styles.categoryBreakdownItem}>
                <View style={styles.categoryInfo}>
                  <Typography variant="bodyLarge" style={styles.categoryName}>
                    {category.name}
                  </Typography>
                  <Typography variant="body" style={styles.categoryStats}>
                    ${category.cost.toFixed(0)} ({category.percentage}%) • {category.count} services
                  </Typography>
                </View>
                <View style={styles.categoryBar}>
                  <View 
                    style={[
                      styles.categoryBarFill, 
                      { 
                        width: `${category.percentage}%`,
                        backgroundColor: index === 0 ? theme.colors.primary : 
                                        index === 1 ? theme.colors.secondary : 
                                        theme.colors.accent
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Recent Activity - Fleet-wide maintenance overview */}
        {maintenanceLogs.length > 0 && (
          <Card variant="filled" style={styles.summaryCard}>
            <Typography variant="heading" style={styles.sectionTitle}>
              {t('dashboard.recentActivity', 'Recent Activity')}
            </Typography>
            
            {maintenanceLogs.slice(0, 5).map((log, index) => {
              const vehicle = vehicles.find(v => v.id === log.vehicleId);
              const [categoryKey, subcategoryKey] = log.category.split(':');
              const categoryName = getCategoryName(categoryKey);
              const subcategoryName = getSubcategoryName(categoryKey, subcategoryKey);
              
              return (
                <TouchableOpacity
                  key={log.id}
                  style={[
                    styles.activityItem,
                    index < Math.min(maintenanceLogs.length, 5) - 1 && styles.activityItemBorder
                  ]}
                  onPress={() => {
                    if (log.vehicleId) {
                      // Navigate to Vehicles tab and then to specific vehicle detail
                      navigation.navigate('Vehicles', {
                        screen: 'VehiclesList'
                      });
                      
                      // Then navigate to specific vehicle detail
                      setTimeout(() => {
                        navigation.navigate('Vehicles', {
                          screen: 'VehicleHome',
                          params: { vehicleId: log.vehicleId }
                        });
                      }, 100);
                    }
                  }}
                >
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Typography variant="body" style={styles.activityTitle}>{log.title}</Typography>
                      <Typography variant="caption" style={styles.activityDate}>
                        {log.date.toLocaleDateString()}
                      </Typography>
                    </View>
                    <View style={styles.activityDetails}>
                      <Typography variant="caption" style={styles.activityVehicle}>
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                      </Typography>
                      <Typography variant="caption" style={styles.activityCategory}>
                        {subcategoryName || categoryName}
                      </Typography>
                    </View>
                    {log.mileage > 0 && (
                      <Typography variant="caption" style={styles.activityMileage}>
                        {log.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
                      </Typography>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {maintenanceLogs.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setActiveTab('history')}
              >
                <Typography variant="body" style={styles.viewAllText}>
                  {t('dashboard.viewAllActivity', 'View All Activity')}
                </Typography>
              </TouchableOpacity>
            )}
          </Card>
        )}

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
          icon={<ReportAnalysisIcon size={64} color={theme.colors.textSecondary} />}
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
                variant="elevated"
                title={log.title}
                subtitle={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                pressable
                onPress={() => {
                  console.log('View maintenance details:', log.id);
                  // TODO: Navigate to maintenance detail screen
                }}
                rightContent={
                  <View style={styles.logDetails}>
                    <Typography variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
                      {log.date.toLocaleDateString()}
                    </Typography>
                    <Typography variant="bodySmall" style={styles.completedStatus}>
                      {t('maintenance.completed', 'Completed')}
                    </Typography>
                  </View>
                }
              >
                <View style={styles.logContent}>
                  <View style={styles.logRow}>
                    <Typography variant="bodySmall" style={styles.logLabel}>
                      {t('maintenance.category', 'Category')}:
                    </Typography>
                    <Typography variant="bodySmall" style={{ color: theme.colors.text }}>
                      {subcategoryName || categoryName}
                    </Typography>
                  </View>
                  
                  {log.mileage > 0 && (
                    <View style={styles.logRow}>
                      <Typography variant="bodySmall" style={styles.logLabel}>
                        {t('maintenance.mileage', 'Mileage')}:
                      </Typography>
                      <Typography variant="bodySmall" style={{ color: theme.colors.text }}>
                        {log.mileage.toLocaleString()} {t('vehicles.miles', 'miles')}
                      </Typography>
                    </View>
                  )}
                  
                  {log.cost && (
                    <View style={styles.logRow}>
                      <Typography variant="bodySmall" style={styles.logLabel}>
                        {t('maintenance.cost', 'Cost')}:
                      </Typography>
                      <Typography variant="bodySmall" style={{ color: theme.colors.text }}>
                        ${log.cost.toFixed(2)}
                      </Typography>
                    </View>
                  )}
                  
                  {log.notes && (
                    <View style={[styles.logRow, styles.notesRow]}>
                      <Typography
                        variant="bodySmall"
                        style={{
                          color: theme.colors.textSecondary,
                          fontStyle: 'italic',
                          flex: 1,
                          lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm
                        }}
                        numberOfLines={2}
                      >
                        {log.notes}
                      </Typography>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg, // Add top spacing from Engine Blue header
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
  
  // Unified Stats styles
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCardTouchable: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    flex: 1,
  },
  statNumber: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  logDetails: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  // logDate style removed - using Typography variant="bodySmall"
  logContent: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // logLabel style removed - using Typography variant="bodySmall"
  // logValue style removed - using Typography variant="bodySmall"
  notesRow: {
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  // logNotes style removed - using Typography variant="bodySmall"
  dueBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  dueBadgeText: {
    color: theme.colors.surface,
  },
  // completedStatus style removed - using Typography variant="bodySmall"
  
  // Fleet Status Styles
  summaryCard: {
    marginBottom: theme.spacing.lg,
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
  },
  vehicleDetails: {
    gap: theme.spacing.xs,
  },
  vehicleMileage: {
    color: theme.colors.textSecondary,
  },
  lastMaintenance: {
    color: theme.colors.primary,
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
    marginBottom: theme.spacing.sm,
  },
  
  // Category Breakdown Styles
  categoryBreakdownItem: {
    marginBottom: theme.spacing.md,
  },
  categoryInfo: {
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  categoryStats: {
    color: theme.colors.textSecondary,
  },
  categoryBar: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  
  // Recent Activity Styles
  activityItem: {
    padding: theme.spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  activityContent: {
    gap: theme.spacing.xs,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  activityDate: {
    color: theme.colors.textSecondary,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityVehicle: {
    color: theme.colors.primary,
  },
  activityCategory: {
    color: theme.colors.textSecondary,
  },
  activityMileage: {
    color: theme.colors.textSecondary,
  },
  viewAllButton: {
    padding: theme.spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  viewAllText: {
    color: theme.colors.primary,
  },
  // Typography styles
  logLabel: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  completedStatus: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default MaintenanceScreen;