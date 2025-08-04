// Maintenance screen for tracking and managing maintenance records
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/ErrorState';

type MaintenanceTab = 'upcoming' | 'history';

/**
 * Maintenance screen - track upcoming and completed maintenance
 * Shows tabs for upcoming and history views
 */
const MaintenanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('upcoming');

  // TODO: Replace with actual maintenance data from Firebase
  const upcomingMaintenance: any[] = [];
  const maintenanceHistory: any[] = [];

  const handleLogMaintenance = () => {
    // TODO: Navigate to log maintenance screen
    console.log('Navigate to log maintenance screen');
  };

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
    if (maintenanceHistory.length === 0) {
      return (
        <EmptyState
          title={t('maintenance.history.empty.title', 'No Maintenance History')}
          message={t('maintenance.history.empty.message', 'Start logging maintenance to build your history.')}
          icon="📋"
          primaryAction={{
            title: t('maintenance.logMaintenance', 'Log Maintenance'),
            onPress: handleLogMaintenance,
          }}
        />
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer}>
        {maintenanceHistory.map((maintenance) => (
          <Card
            key={maintenance.id}
            title={maintenance.type}
            subtitle={`${maintenance.vehicle} • ${maintenance.date}`}
            pressable
            onPress={() => {
              console.log('View maintenance details:', maintenance.id);
            }}
            rightContent={
              <Text style={styles.completedStatus}>
                {t('maintenance.completed', 'Completed')}
              </Text>
            }
          >
            <></>
          </Card>
        ))}
      </ScrollView>
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
  listContainer: {
    padding: theme.spacing.lg,
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