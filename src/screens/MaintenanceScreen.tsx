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
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { getCategoryName, getSubcategoryName } from '../types/MaintenanceCategories';
import { MaintenanceLog, Vehicle } from '../types';
import { useAuth } from '../contexts/AuthContext';

type MaintenanceTab = 'upcoming' | 'history';

/**
 * Maintenance screen - track upcoming and completed maintenance
 * Shows tabs for upcoming and history views
 */
const MaintenanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('history'); // Start with history tab
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([]);

  // TODO: Replace with actual upcoming maintenance data (reminders)
  const upcomingMaintenance: any[] = [];

  const handleLogMaintenance = () => {
    navigation.navigate('AddMaintenanceLog');
  };

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

  const renderUpcoming = () => {
    if (upcomingMaintenance.length === 0) {
      return (
        <EmptyState
          title={t('maintenance.upcoming.empty.title', 'No Upcoming Maintenance')}
          message={t('maintenance.upcoming.empty.message', 'All your vehicles are up to date!')}
          icon="✅"
          primaryAction={{
            title: t('maintenance.logMaintenance', 'Log Maintenance'),
            onPress: handleLogMaintenance,
          }}
        />
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {upcomingMaintenance.map((maintenance) => (
          <Card
            key={maintenance.id}
            title={maintenance.type}
            subtitle={`${maintenance.vehicle} • Due: ${maintenance.dueDate}`}
            pressable
            onPress={() => {
              console.log('View maintenance details:', maintenance.id);
            }}
            rightContent={
              <View style={styles.dueBadge}>
                <Text style={styles.dueBadgeText}>
                  {maintenance.priority}
                </Text>
              </View>
            }
          >
            <></>
          </Card>
        ))}
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
          message={t('maintenance.history.empty.message', 'Start logging maintenance to build your history.')}
          icon={<ActivityIcon size={48} color={theme.colors.textSecondary} />}
          primaryAction={{
            title: t('maintenance.logMaintenance', 'Log Maintenance'),
            onPress: handleLogMaintenance,
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
      {/* Header with Log Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('maintenance.title', 'Maintenance')}
        </Text>
        <Button
          title={t('maintenance.log', 'Log')}
          variant="primary"
          size="sm"
          onPress={handleLogMaintenance}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('upcoming', t('maintenance.upcoming.title', 'Upcoming'))}
        {renderTabButton('history', t('maintenance.history.title', 'History'))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'upcoming' ? renderUpcoming() : renderHistory()}
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
});

export default MaintenanceScreen;