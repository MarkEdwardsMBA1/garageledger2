// Dashboard screen showing overview of vehicles and maintenance
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { Vehicle } from '../types';

/**
 * Dashboard screen - main overview of the app
 * Shows quick stats and recent activity
 */
const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Load vehicles on component mount
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const userVehicles = await vehicleRepository.getUserVehicles();
        setVehicles(userVehicles);
      } catch (error) {
        console.error('Error loading vehicles for dashboard:', error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          {t('dashboard.welcome', 'Welcome to GarageLedger')}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {t('dashboard.subtitle', 'Keep track of your vehicle maintenance')}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.quickStats', 'Quick Stats')}
        </Text>
        
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{loading ? '...' : vehicles.length}</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.totalVehicles', 'Total Vehicles')}
            </Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.upcomingMaintenance', 'Upcoming')}
            </Text>
          </Card>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.quickActions', 'Quick Actions')}
        </Text>
        
        <Card>
          <View style={styles.actionGrid}>
            <Button
              title={t('dashboard.addVehicle', 'Add Vehicle')}
              variant="primary"
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddVehicle' as never)}
            />
            
            <Button
              title={t('dashboard.logMaintenance', 'Log Maintenance')}
              variant="outline"
              style={styles.actionButton}
              onPress={() => {
                // TODO: Navigate to log maintenance screen
                console.log('Navigate to log maintenance');
              }}
            />
          </View>
        </Card>
      </View>

      {/* Recent Activity - Empty State */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.recentActivity', 'Recent Activity')}
        </Text>
        
        <Card>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>
              {t('dashboard.noActivity', 'No recent activity')}
            </Text>
            <Text style={styles.emptyStateMessage}>
              {t('dashboard.noActivityMessage', 'Start by adding your first vehicle')}
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
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

  // Welcome section
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },

  // Section titles
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Stats section
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  statNumber: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Actions section
  actionsSection: {
    marginBottom: theme.spacing.xl,
  },
  actionGrid: {
    gap: theme.spacing.md,
  },
  actionButton: {
    minHeight: 48,
  },

  // Recent activity section
  recentSection: {
    marginBottom: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyStateMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;