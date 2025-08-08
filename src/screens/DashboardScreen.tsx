// Dashboard screen showing overview of vehicles and maintenance
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ActivityIcon } from '../components/icons';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { Vehicle } from '../types';

/**
 * Dashboard screen - main overview of the app
 * Shows quick stats and recent activity
 */
const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  // Load vehicles on component mount
  useEffect(() => {
    const loadVehicles = async () => {
      // Set loading to true only if data takes longer than 100ms
      const loadingTimer = setTimeout(() => setLoading(true), 100);
      
      try {
        const userVehicles = await vehicleRepository.getUserVehicles();
        setVehicles(userVehicles);
      } catch (error) {
        console.error('Error loading vehicles for dashboard:', error);
        setVehicles([]);
      } finally {
        clearTimeout(loadingTimer);
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Vehicles')}
            activeOpacity={0.7}
            style={styles.statCardTouchable}
          >
            <Card variant="elevated" style={styles.statCard}>
              <Text style={[styles.statNumber, loading && styles.loadingText]}>
                {loading ? '–' : vehicles.length}
              </Text>
              <Text style={styles.statLabel}>
                {t('dashboard.totalVehicles', 'Total Vehicles')}
              </Text>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Maintenance')}
            activeOpacity={0.7}
            style={styles.statCardTouchable}
          >
            <Card variant="elevated" style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>
                {t('dashboard.upcomingMaintenance', 'Upcoming')}
              </Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>
          {t('dashboard.quickActions', 'Quick Actions')}
        </Text>
        
        <Card variant="elevated">
          <View style={styles.actionGrid}>
            <Button
              title={t('dashboard.addVehicle', 'Add Vehicle')}
              variant="primary"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Vehicles', { screen: 'AddVehicle' })}
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
        
        <Card variant="filled">
          <View style={styles.emptyState}>
            <ActivityIcon size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { marginTop: theme.spacing.md }]}>
              {t('dashboard.noActivity', 'No recent activity')}
            </Text>
            <Text style={styles.emptyStateMessage}>
              {vehicles.length === 0 
                ? t('dashboard.noActivityMessage', 'Start by adding your first vehicle')
                : t('dashboard.noMaintenanceActivity', 'Start logging maintenance to build your activity history')
              }
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
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.carbon, // Premium Oil Black
    marginBottom: theme.spacing.xs,
    letterSpacing: theme.typography.letterSpacing.tight,
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize['3xl'],
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.normal,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.luxury, // Titanium Gray
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
  },

  // Section titles - Enhanced typography
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    letterSpacing: theme.typography.letterSpacing.normal,
    lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.xl,
  },

  // Stats section
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCardTouchable: {
    flex: 1,
  },
  statCard: {
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
  loadingText: {
    color: theme.colors.textSecondary,
    opacity: 0.7,
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
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.normal,
    lineHeight: theme.typography.lineHeight.snug * theme.typography.fontSize.xl,
  },
  emptyStateMessage: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
});

export default DashboardScreen;