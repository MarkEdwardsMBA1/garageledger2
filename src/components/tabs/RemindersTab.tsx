// Reminders Tab Component - Extracted from RemindersScreen for reuse in TabbedInsightsScreen
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/ErrorState';
import { 
  ReminderStatusBadge, 
  ReminderStatusIndicator, 
  ReminderSummaryBar 
} from '../common/ReminderStatusIndicator';
import { SegmentedControl } from '../common/SegmentedControl';
import { 
  MaintenanceIcon, 
  CarIcon, 
  CalendarIcon, 
  AlertTriangleIcon,
  ChevronRightIcon 
} from '../icons';
import { 
  reminderCalculationService, 
  ReminderItem, 
  ReminderCalculationResult 
} from '../../services/ReminderCalculationService';
import { vehicleRepository } from '../../repositories/VehicleRepository';
import { programRepository } from '../../repositories/SecureProgramRepository';
import { Vehicle, MaintenanceProgram } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

type FilterType = 'all' | 'overdue' | 'due' | 'upcoming';

interface RemindersTabProps {
  // Optional prop to control whether this tab is active (for optimization)
  isActive?: boolean;
}

/**
 * Reminders Tab Component
 * Contains all the reminders functionality extracted from RemindersScreen
 * Can be used standalone or within tabbed interfaces
 */
export const RemindersTab: React.FC<RemindersTabProps> = ({ isActive = true }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();

  const [reminderResult, setReminderResult] = useState<ReminderCalculationResult | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  // Load reminders data
  const loadReminders = async (isRefresh = false) => {
    if (!isAuthenticated) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [vehiclesData, programsData] = await Promise.all([
        vehicleRepository.getAll(),
        programRepository.getUserPrograms()
      ]);

      setVehicles(vehiclesData);
      setPrograms(programsData);

      // Calculate reminders
      const result = await reminderCalculationService.calculateReminders(vehiclesData, programsData);
      setReminderResult(result);

    } catch (err: any) {
      console.error('Error loading reminders:', err);
      setError(err.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      loadReminders();
    }
  }, [isAuthenticated, isActive]);

  useFocusEffect(
    React.useCallback(() => {
      if (isActive) {
        loadReminders();
      }
    }, [isAuthenticated, isActive])
  );

  // Filter reminders based on selected filter
  const getFilteredReminders = (): ReminderItem[] => {
    if (!reminderResult) return [];

    switch (filter) {
      case 'overdue':
        return reminderResult.reminders.filter(r => r.status === 'overdue');
      case 'due':
        return reminderResult.reminders.filter(r => r.status === 'due');
      case 'upcoming':
        return reminderResult.reminders.filter(r => r.status === 'upcoming');
      default:
        return reminderResult.reminders;
    }
  };

  // Handle reminder item tap
  const handleReminderTap = (reminder: ReminderItem) => {
    // Navigate to vehicle detail or program detail
    Alert.alert(
      reminder.taskName,
      `${reminder.vehicleName}\n\nThis will navigate to maintenance logging or program details.`,
      [
        {
          text: t('programs.viewProgram', 'View Program'),
          onPress: () => navigation.navigate('Programs', {
            screen: 'ProgramDetail',
            params: { programId: reminder.programId }
          })
        },
        {
          text: t('maintenance.logMaintenance', 'Log Maintenance'),
          onPress: () => {
            // TODO: Navigate to maintenance logging with pre-filled data
            Alert.alert(t('maintenance.logMaintenance', 'Log Maintenance'), 'Maintenance logging integration coming soon!');
          }
        },
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel'
        }
      ]
    );
  };

  // Handle vehicle navigation
  const handleVehicleNavigation = (vehicleId: string) => {
    navigation.navigate('Vehicles', {
      screen: 'VehicleHome',
      params: { vehicleId }
    });
  };

  // Render reminder item
  const renderReminderItem = (reminder: ReminderItem) => {
    const getPriorityIcon = () => {
      if (reminder.priority === 'critical' || reminder.status === 'overdue') {
        return <AlertTriangleIcon size={20} color={theme.colors.error} />;
      }
      return <MaintenanceIcon size={20} color={theme.colors.primary} />;
    };

    const formatDueInfo = () => {
      if (reminder.dueType === 'mileage' && reminder.dueMileage && reminder.currentMileage) {
        const remaining = Math.max(0, reminder.dueMileage - reminder.currentMileage);
        return `${reminder.currentMileage.toLocaleString()} / ${reminder.dueMileage.toLocaleString()} miles`;
      } else if (reminder.dueType === 'time' && reminder.dueDate) {
        return reminder.dueDate.toLocaleDateString();
      } else if (reminder.dueType === 'both') {
        const mileageInfo = reminder.dueMileage ? `${reminder.currentMileage?.toLocaleString()} / ${reminder.dueMileage.toLocaleString()} miles` : '';
        const timeInfo = reminder.dueDate ? reminder.dueDate.toLocaleDateString() : '';
        return `${mileageInfo}${mileageInfo && timeInfo ? ' • ' : ''}${timeInfo}`;
      }
      return '';
    };

    return (
      <TouchableOpacity
        key={reminder.id}
        onPress={() => handleReminderTap(reminder)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderIcon}>
              {getPriorityIcon()}
            </View>
            
            <View style={styles.reminderInfo}>
              <Typography variant="bodyLarge" style={styles.reminderTitle}>
                {reminder.taskName}
              </Typography>
              <Typography variant="caption" style={styles.reminderCategory}>
                {reminder.taskCategory}
              </Typography>
            </View>

            <View style={styles.reminderStatus}>
              <ReminderStatusBadge 
                status={reminder.status} 
                priority={reminder.priority}
                size="sm"
              />
            </View>
          </View>

          <View style={styles.reminderDetails}>
            <View style={styles.reminderVehicle}>
              <CarIcon size={16} color={theme.colors.textSecondary} />
              <TouchableOpacity onPress={() => handleVehicleNavigation(reminder.vehicleId)}>
                <Typography variant="bodySmall" style={styles.reminderVehicleName}>
                  {reminder.vehicleName}
                </Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.reminderDueInfo}>
              <Typography variant="bodySmall" style={styles.reminderDueText}>
                {formatDueInfo()}
              </Typography>
            </View>
          </View>

          <View style={styles.reminderBottom}>
            <ReminderStatusIndicator 
              reminder={reminder} 
              showDetails={true}
              size="sm"
            />
            
            <ChevronRightIcon size={16} color={theme.colors.textSecondary} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const getEmptyStateContent = () => {
      if (vehicles.length === 0) {
        return {
          title: t('reminders.noVehicles', 'No Vehicles'),
          message: t('reminders.noVehiclesMessage', 'Add vehicles to start tracking maintenance reminders'),
          icon: <CarIcon size={48} color={theme.colors.textSecondary} />,
          action: {
            title: t('vehicles.addVehicle', 'Add Vehicle'),
            onPress: () => navigation.navigate('Vehicles', { screen: 'AddVehicle' })
          }
        };
      }

      if (programs.length === 0) {
        return {
          title: t('reminders.noPrograms', 'No Maintenance Programs'),
          message: t('reminders.noProgramsMessage', 'Create maintenance programs to get smart reminders'),
          icon: <MaintenanceIcon size={48} color={theme.colors.textSecondary} />,
          action: {
            title: t('programs.createProgram', 'Create Program'),
            onPress: () => navigation.navigate('Programs', { screen: 'CreateProgramVehicleSelection' })
          }
        };
      }

      switch (filter) {
        case 'overdue':
          return {
            title: t('reminders.noOverdue', 'No Overdue Items'),
            message: t('reminders.noOverdueMessage', 'Great! All your maintenance is up to date.'),
            icon: '✅'
          };
        case 'due':
          return {
            title: t('reminders.noDue', 'Nothing Due'),
            message: t('reminders.noDueMessage', 'No maintenance is due in the immediate future.'),
            icon: '📅'
          };
        case 'upcoming':
          return {
            title: t('reminders.noUpcoming', 'No Upcoming Reminders'),
            message: t('reminders.noUpcomingMessage', 'All maintenance is up to date for now.'),
            icon: '⏰'
          };
        default:
          return {
            title: t('reminders.noReminders', 'No Reminders'),
            message: t('reminders.noRemindersMessage', 'All maintenance is up to date! Check back later.'),
            icon: '🎉'
          };
      }
    };

    const content = getEmptyStateContent();
    
    return (
      <EmptyState
        title={content.title}
        message={content.message}
        icon={content.icon}
        primaryAction={content.action}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message={t('reminders.loadingReminders', 'Loading reminders...')} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t('common.error', 'Error')}
          message={error}
          icon="⚠️"
          showRetry
          onRetry={() => loadReminders()}
        />
      </View>
    );
  }

  const filteredReminders = getFilteredReminders();
  const hasReminders = reminderResult && reminderResult.reminders.length > 0;

  // Filter options
  const filterOptions = [
    { key: 'all', label: t('reminders.all', 'All') },
    { key: 'overdue', label: t('reminders.overdue', 'Overdue') },
    { key: 'due', label: t('reminders.due', 'Due') },
    { key: 'upcoming', label: t('reminders.upcoming', 'Upcoming') },
  ];

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      {hasReminders && reminderResult && (
        <View style={styles.summaryContainer}>
          <ReminderSummaryBar 
            summary={reminderResult.summary}
            style={styles.summaryBar}
          />
        </View>
      )}

      {/* Filter Controls */}
      {hasReminders && (
        <View style={styles.filterContainer}>
          <SegmentedControl
            options={filterOptions}
            selectedKey={filter}
            onSelect={(key) => setFilter(key as FilterType)}
          />
        </View>
      )}

      {/* Reminders List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadReminders(true)}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredReminders.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Filter Results Header */}
            <View style={styles.resultsHeader}>
              <Typography variant="heading" style={styles.resultsTitle}>
                {filter === 'all' 
                  ? t('reminders.allReminders', 'All Reminders')
                  : `${filterOptions.find(f => f.key === filter)?.label} ${t('reminders.reminders', 'Reminders')}`
                } ({filteredReminders.length})
              </Typography>
            </View>

            {/* Reminders List */}
            <View style={styles.remindersList}>
              {filteredReminders.map(renderReminderItem)}
            </View>

            {/* Quick Actions */}
            <Card variant="outlined" style={styles.actionsCard}>
              <Typography variant="subheading" style={styles.actionsTitle}>
                {t('reminders.quickActions', 'Quick Actions')}
              </Typography>
              
              <View style={styles.actionButtons}>
                <Button
                  title={t('maintenance.logMaintenance', 'Log Maintenance')}
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    Alert.alert(
                      t('maintenance.logMaintenance', 'Log Maintenance'),
                      'Maintenance logging integration coming soon!'
                    );
                  }}
                  style={styles.actionButton}
                />
                
                <Button
                  title={t('programs.createProgram', 'Create Program')}
                  variant="outline"
                  size="sm"
                  onPress={() => navigation.navigate('Programs', { screen: 'CreateProgramVehicleSelection' })}
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
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
  
  // Summary section
  summaryContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  summaryBar: {
    marginHorizontal: 0,
  },
  
  // Filter section
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  
  // Results header
  resultsHeader: {
    marginBottom: theme.spacing.md,
  },
  resultsTitle: {
    color: theme.colors.text,
  },
  
  // Reminders list
  remindersList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  
  // Reminder card
  reminderCard: {
    padding: theme.spacing.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reminderIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  reminderInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  reminderTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  reminderCategory: {
    color: theme.colors.textSecondary,
  },
  reminderStatus: {
    alignItems: 'flex-end',
  },
  
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  reminderVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  reminderVehicleName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  reminderDueInfo: {
    alignItems: 'flex-end',
  },
  reminderDueText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  reminderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Quick actions
  actionsCard: {
    marginTop: theme.spacing.lg,
  },
  actionsTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default RemindersTab;