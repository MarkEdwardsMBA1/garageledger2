// Fleet Insights Screen - Phase 5A: Modern Dashboard Replacing TabbedInsightsScreen
// Comprehensive fleet-wide insights with consistent InfoCard design patterns
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import InfoCard from '../components/common/InfoCard';
import { Loading } from '../components/common/Loading';
import { ReportAnalysisIcon } from '../components/icons';
import FleetSummaryMetrics from '../components/fleet/FleetSummaryMetrics';
import SimpleRecentActivity from '../components/fleet/SimpleRecentActivity';
import SimpleCostSummary from '../components/fleet/SimpleCostSummary';
import FleetStatus from '../components/fleet/FleetStatus';
import { theme } from '../utils/theme';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { FleetAnalyticsService, FleetOverview, FleetActivity, FleetReminder } from '../services/FleetAnalyticsService';

/**
 * FleetInsightsScreen - Phase 5A Implementation
 * 
 * Modern replacement for TabbedInsightsScreen featuring:
 * - Consistent InfoCard design patterns
 * - Fleet-wide analytics and insights
 * - Automotive color scheme throughout
 * - Progressive disclosure navigation
 */
const FleetInsightsScreen: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetOverview, setFleetOverview] = useState<FleetOverview | null>(null);
  const [fleetCostData, setFleetCostData] = useState<any>(null);

  // Load data on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async (isRefresh = false) => {
    if (!user) return;

    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);

      // Load all user data in parallel
      const [userVehicles, allMaintenanceLogs, allPrograms] = await Promise.all([
        vehicleRepository.getByUserId(user.uid),
        maintenanceLogRepository.getByUserId(user.uid),
        programRepository.getUserPrograms(),
      ]);

      setVehicles(userVehicles);

      // Calculate fleet analytics
      const fleetData = await FleetAnalyticsService.calculateFleetOverview(
        userVehicles, 
        allMaintenanceLogs, 
        allPrograms
      );
      setFleetOverview(fleetData);

      // Calculate fleet cost insights
      const costInsights = FleetAnalyticsService.calculateFleetCostInsights(
        userVehicles,
        allMaintenanceLogs
      );
      setFleetCostData(costInsights);

    } catch (error) {
      console.error('Error loading fleet insights:', error);
      // Set empty fleet data so empty state can render
      const emptyFleetData = {
        totalVehicles: 0,
        totalMaintenanceRecords: 0,
        totalCostAllTime: 0,
        totalCostLast30Days: 0,
        averageCostPerVehicle: 0,
        recentActivity: [],
        upcomingReminders: [],
        fleetStatus: {
          compliantCount: 0,
          dueSoonCount: 0,
          overdueCount: 0,
        }
      };
      setFleetOverview(emptyFleetData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadData(true);
  };

  const handleActivityPress = (activity: FleetActivity) => {
    // TODO: Navigate to service detail screen
    console.log('Navigate to service detail:', activity.maintenanceLog.id);
  };

  const handleReminderPress = (reminder: FleetReminder) => {
    // TODO: Navigate to vehicle maintenance logging
    console.log('Navigate to vehicle maintenance:', reminder.vehicleId);
  };

  const renderFleetOverview = () => {
    if (!fleetOverview) return null;

    if (fleetOverview.totalVehicles === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Card variant="elevated" style={styles.emptyStateCard}>
            <View style={styles.emptyStateContent}>
              {/* Fleet Insights image at the top */}
              <View style={styles.emptyStateImageContainer}>
                <ReportAnalysisIcon 
                  size={160} 
                  color={theme.colors.primary} // Engine Blue for main chart elements
                  accentColor={theme.colors.secondary} // Racing Green for bar highlights
                  backgroundColor={theme.colors.chrome} // Chrome Silver for subtle background
                />
              </View>
              
              {/* Text below the image */}
              <Typography variant="body" style={styles.emptyStateText}>
                This is where your fleet insights will appear. Add vehicles and log maintenance to see analytics.
              </Typography>
            </View>
          </Card>
          
          {/* CTA button below the card */}
          <Button
            title="Add Vehicle"
            onPress={() => navigation.navigate('Vehicles', { screen: 'AddVehicle' })}
            variant="primary"
            style={styles.emptyStateCTAButton}
          />
        </View>
      );
    }

    return (
      <InfoCard
        title="Overview"
        variant="elevated"
        style={styles.card}
        onPress={() => {
          // TODO: Navigate to detailed fleet analytics
          console.log('Navigate to detailed fleet analytics');
        }}
      >
        <FleetSummaryMetrics fleetData={fleetOverview} />
      </InfoCard>
    );
  };

  const renderRecentActivity = () => {
    if (!fleetOverview || !fleetOverview.recentActivity || fleetOverview.recentActivity.length === 0) {
      return (
        <InfoCard
          title="Recent Fleet Maintenance"
          variant="elevated"
          style={styles.card}
        >
          <View style={styles.emptyActivityState}>
            <Typography variant="bodySmall" style={styles.emptyActivityText}>
              No recent maintenance activity
            </Typography>
            <Typography variant="caption" style={styles.emptyActivityHint}>
              Log maintenance to see your activity timeline
            </Typography>
          </View>
        </InfoCard>
      );
    }

    return (
      <InfoCard
        title="Recent Fleet Maintenance"
        variant="elevated"
        style={styles.card}
      >
        <SimpleRecentActivity 
          activities={fleetOverview?.recentActivity}
        />
      </InfoCard>
    );
  };

  const renderUpcomingReminders = () => {
    if (!fleetOverview || !fleetOverview.upcomingReminders) return null;

    return (
      <InfoCard
        title="Upcoming Reminders"
        subtitle={fleetOverview.upcomingReminders.length > 0 
          ? `${fleetOverview.upcomingReminders.length} services due soon`
          : 'All vehicles up to date'
        }
        variant="elevated"
        style={styles.card}
        onPress={() => {
          // TODO: Navigate to reminders screen
          console.log('Navigate to reminders screen');
        }}
      >
{/* TODO: Implement UpcomingRemindersPreview component */}
      </InfoCard>
    );
  };

  const renderFleetStatus = () => {
    if (!fleetOverview) return null;

    return (
      <InfoCard
        title="Fleet Status"
        variant="elevated"
        style={styles.card}
      >
        <FleetStatus fleetStatus={fleetOverview.fleetStatus} />
      </InfoCard>
    );
  };

  const renderCostInsights = () => {
    if (!fleetCostData) return null;

    return (
      <InfoCard
        title="Cost Insights"
        subtitle="Fleet spending analysis"
        variant="elevated"
        style={styles.card}
        onPress={() => {
          // TODO: Navigate to detailed cost analytics
          console.log('Navigate to fleet cost analytics');
        }}
      >
        <SimpleCostSummary 
          costData={fleetCostData}
        />
      </InfoCard>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Fleet Overview Card */}
        {renderFleetOverview()}

        {/* Fleet Status Card - Only show when user has vehicles */}
        {fleetOverview && fleetOverview.totalVehicles > 0 && renderFleetStatus()}

        {/* Recent Activity Card - Only show when user has vehicles */}
        {fleetOverview && fleetOverview.totalVehicles > 0 && renderRecentActivity()}

        {/* Cost Insights Card - Only show when user has vehicles */}
        {fleetCostData && fleetOverview && fleetOverview.totalVehicles > 0 && renderCostInsights()}

        {/* Additional Information for Single Vehicle Users */}
        {vehicles.length === 1 && fleetOverview && fleetOverview.totalMaintenanceRecords > 0 && (
          <InfoCard
            title="Pro Tip"
            variant="outlined"
            style={styles.card}
          >
            <View style={styles.proTip}>
              <Typography variant="bodySmall" style={styles.proTipText}>
                Add more vehicles to unlock fleet comparisons, cost efficiency rankings, and multi-vehicle service scheduling optimization.
              </Typography>
            </View>
          </InfoCard>
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

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },

  // Header
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.text,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
  },

  // Cards
  card: {
    // InfoCard handles all styling
  },

  // Empty States - Matching VehiclesScreen and ProgramsScreen style
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 2,
  },
  emptyStateCard: {
    width: '100%',
    maxWidth: 320,
    marginBottom: theme.spacing.xl,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  emptyStateImageContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: theme.typography.fontSize.base,
  },
  emptyStateCTAButton: {
    width: '100%',
    maxWidth: 300,
  },

  emptyActivityState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  emptyActivityText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyActivityHint: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Pro Tip
  proTip: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  proTipText: {
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
});

export default FleetInsightsScreen;