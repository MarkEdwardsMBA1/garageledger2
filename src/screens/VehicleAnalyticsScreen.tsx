// Vehicle Analytics Screen - Phase 4: Enhanced Maintenance Analytics
// Comprehensive analytics dashboard with cost trends, service frequency, and predictive insights
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { useTranslation } from 'react-i18next';

import { Typography } from '../components/common/Typography';
import InfoCard from '../components/common/InfoCard';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import TrendIndicator from '../components/analytics/TrendIndicator';
import SimpleBarChart, { BarChartDataPoint } from '../components/analytics/SimpleBarChart';
import InsightCard from '../components/analytics/InsightCard';
import { theme } from '../utils/theme';
import { Vehicle, MaintenanceLog, MaintenanceProgram } from '../types';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { maintenanceLogRepository } from '../repositories/FirebaseMaintenanceLogRepository';
import { programRepository } from '../repositories/SecureProgramRepository';
import { 
  VehicleAnalyticsService, 
  CostTrendAnalysis, 
  ServiceFrequencyAnalysis, 
  PredictiveInsights 
} from '../services/VehicleAnalyticsService';

// Navigation types
type VehicleAnalyticsScreenNavigationProp = StackNavigationProp<any, 'VehicleAnalytics'>;
type VehicleAnalyticsScreenRouteProp = RouteProp<any, 'VehicleAnalytics'>;

interface VehicleAnalyticsScreenProps {
  navigation: VehicleAnalyticsScreenNavigationProp;
  route: VehicleAnalyticsScreenRouteProp;
}

const VehicleAnalyticsScreen: React.FC<VehicleAnalyticsScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  
  // Get vehicleId from route params
  const { vehicleId } = route.params as { vehicleId: string };
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [programs, setPrograms] = useState<MaintenanceProgram[]>([]);
  const [costTrends, setCostTrends] = useState<CostTrendAnalysis | null>(null);
  const [serviceFrequency, setServiceFrequency] = useState<ServiceFrequencyAnalysis | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);

      // Load vehicle, maintenance logs, and programs in parallel
      const [vehicleData, logs, vehiclePrograms] = await Promise.all([
        vehicleRepository.getById(vehicleId),
        maintenanceLogRepository.getByVehicleId(vehicleId),
        programRepository.getProgramsByVehicle(vehicleId),
      ]);

      if (vehicleData) {
        setVehicle(vehicleData);
        setMaintenanceLogs(logs.sort((a, b) => b.date.getTime() - a.date.getTime()));
        setPrograms(vehiclePrograms);

        // Calculate analytics
        const costAnalysis = VehicleAnalyticsService.calculateCostTrends(logs, vehicleData);
        const frequencyAnalysis = VehicleAnalyticsService.calculateServiceFrequency(logs);
        const insights = VehicleAnalyticsService.generatePredictiveInsights(logs, vehicleData, vehiclePrograms);

        setCostTrends(costAnalysis);
        setServiceFrequency(frequencyAnalysis);
        setPredictiveInsights(insights);
      }
    } catch (error) {
      console.error('Error loading vehicle analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadData(true);
  };

  const renderCostTrendsCard = () => {
    if (!costTrends) return null;

    const chartData: BarChartDataPoint[] = costTrends.monthlyBreakdown
      .slice(-6) // Last 6 months
      .map(month => ({
        label: month.monthName.split(' ')[0], // Just month name
        value: month.amount,
        subtitle: `${month.serviceCount} srv`
      }));

    return (
      <InfoCard
        title="Cost Trends"
        variant="elevated"
        style={styles.analyticsCard}
      >
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Typography variant="heading" style={styles.metricValue}>
              ${costTrends.totalCost.toLocaleString()}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Total Spent
            </Typography>
          </View>
          
          <View style={styles.metricItem}>
            <Typography variant="heading" style={styles.metricValue}>
              ${costTrends.averagePerService.toFixed(0)}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Avg per Service
            </Typography>
          </View>
          
          <View style={styles.metricItem}>
            <Typography variant="heading" style={styles.metricValue}>
              ${costTrends.costPerMonth.toFixed(0)}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Per Month
            </Typography>
          </View>
        </View>

        <TrendIndicator
          direction={costTrends.trendDirection}
          percentage={costTrends.trendPercentage}
          label="Cost Trend"
          style={styles.trendIndicator}
        />

        {chartData.length > 0 && (
          <SimpleBarChart
            data={chartData}
            title="Monthly Spending"
            maxHeight={100}
            showValues={true}
            style={styles.chart}
          />
        )}
      </InfoCard>
    );
  };

  const renderServiceFrequencyCard = () => {
    if (!serviceFrequency) return null;

    const categoryChartData: BarChartDataPoint[] = serviceFrequency.servicesByCategory
      .slice(0, 5) // Top 5 categories
      .map((category, index) => ({
        label: category.categoryName.replace(/\s+/g, ' ').slice(0, 8), // Shorten labels
        value: category.count,
        subtitle: `${category.averageInterval.toFixed(0)}d avg`,
        color: index === 0 ? theme.colors.primary : undefined
      }));

    return (
      <InfoCard
        title="Service Frequency"
        variant="elevated"
        style={styles.analyticsCard}
      >
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Typography variant="heading" style={styles.metricValue}>
              {serviceFrequency.totalServices}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Total Services
            </Typography>
          </View>
          
          <View style={styles.metricItem}>
            <Typography variant="heading" style={styles.metricValue}>
              {serviceFrequency.averageServiceInterval.toFixed(0)}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Avg Days Apart
            </Typography>
          </View>
          
          <View style={styles.metricItem}>
            <Typography variant="heading" style={styles.metricValue}>
              {serviceFrequency.servicesPerMonth.toFixed(1)}
            </Typography>
            <Typography variant="caption" style={styles.metricLabel}>
              Per Month
            </Typography>
          </View>
        </View>

        {categoryChartData.length > 0 && (
          <SimpleBarChart
            data={categoryChartData}
            title="Services by Category"
            maxHeight={100}
            showValues={false}
            style={styles.chart}
          />
        )}

        {serviceFrequency.mostCommonServices.length > 0 && (
          <View style={styles.servicesList}>
            <Typography variant="body" style={styles.servicesTitle}>
              Most Common Services
            </Typography>
            {serviceFrequency.mostCommonServices.slice(0, 3).map((service, index) => (
              <View key={service.serviceName} style={styles.serviceItem}>
                <Typography variant="bodySmall" style={styles.serviceName}>
                  {service.serviceName}
                </Typography>
                <Typography variant="caption" style={styles.serviceCount}>
                  {service.count}x • {service.averageInterval.toFixed(0)} days avg
                </Typography>
              </View>
            ))}
          </View>
        )}
      </InfoCard>
    );
  };

  const renderPredictiveInsightsCard = () => {
    if (!predictiveInsights) return null;

    return (
      <InfoCard
        title="Predictive Insights"
        variant="elevated"
        style={styles.analyticsCard}
      >
        <View style={styles.maintenanceScoreContainer}>
          <View style={styles.scoreCircle}>
            <Typography variant="heading" style={styles.scoreValue}>
              {predictiveInsights.maintenanceScore}
            </Typography>
            <Typography variant="caption" style={styles.scoreLabel}>
              Score
            </Typography>
          </View>
          
          <View style={styles.scoreDetails}>
            <Typography variant="body" style={styles.scoreTitle}>
              Maintenance Health Score
            </Typography>
            <Typography variant="bodySmall" style={styles.scoreDescription}>
              Based on service frequency, program compliance, and recent activity
            </Typography>
          </View>
        </View>

        {predictiveInsights.nextServiceDue && (
          <View style={styles.nextServiceContainer}>
            <Typography variant="body" style={styles.nextServiceTitle}>
              Next Service Prediction
            </Typography>
            <View style={styles.nextServiceDetails}>
              <Typography variant="bodySmall" style={styles.nextServiceName}>
                {predictiveInsights.nextServiceDue.serviceName}
              </Typography>
              <Typography variant="caption" style={styles.nextServiceDate}>
                Expected: {predictiveInsights.nextServiceDue.dueDate.toLocaleDateString()}
              </Typography>
              <Typography variant="caption" style={styles.nextServiceConfidence}>
                {Math.round(predictiveInsights.nextServiceDue.confidence * 100)}% confidence
              </Typography>
            </View>
          </View>
        )}

        {predictiveInsights.recommendedBudget && (
          <View style={styles.budgetContainer}>
            <Typography variant="body" style={styles.budgetTitle}>
              Recommended Budget
            </Typography>
            <View style={styles.budgetGrid}>
              <View style={styles.budgetItem}>
                <Typography variant="bodySmall" style={styles.budgetValue}>
                  ${predictiveInsights.recommendedBudget.monthlyBudget.toFixed(0)}
                </Typography>
                <Typography variant="caption" style={styles.budgetLabel}>
                  Monthly
                </Typography>
              </View>
              <View style={styles.budgetItem}>
                <Typography variant="bodySmall" style={styles.budgetValue}>
                  ${predictiveInsights.recommendedBudget.quarterlyBudget.toFixed(0)}
                </Typography>
                <Typography variant="caption" style={styles.budgetLabel}>
                  Quarterly
                </Typography>
              </View>
            </View>
            <Typography variant="caption" style={styles.budgetReasoning}>
              {predictiveInsights.recommendedBudget.reasoning}
            </Typography>
          </View>
        )}
      </InfoCard>
    );
  };

  const renderInsights = () => {
    if (!predictiveInsights || predictiveInsights.insights.length === 0) return null;

    return (
      <View style={styles.insightsSection}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Insights & Recommendations
        </Typography>
        {predictiveInsights.insights.map((insight, index) => (
          <InsightCard
            key={`insight-${index}`}
            insight={insight}
            style={styles.insightCard}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="body" style={styles.errorText}>
            Vehicle not found
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="heading" style={styles.headerTitle}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body" style={styles.headerSubtitle}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Typography>
        </View>

        {/* Analytics Cards */}
        {renderCostTrendsCard()}
        {renderServiceFrequencyCard()}
        {renderPredictiveInsightsCard()}

        {/* Insights Section */}
        {renderInsights()}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Export Analytics"
            variant="outline"
            fullWidth
            onPress={() => {
              // TODO: Implement export functionality
              console.log('Export analytics data');
            }}
            style={styles.actionButton}
          />
        </View>
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
  },
  headerTitle: {
    color: theme.colors.text,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
  },

  // Analytics Cards
  analyticsCard: {
    // InfoCard already handles the styling
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs / 2,
  },

  // Trend Indicator
  trendIndicator: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },

  // Charts
  chart: {
    marginTop: theme.spacing.sm,
  },

  // Services List
  servicesList: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  servicesTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  serviceItem: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceName: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  serviceCount: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },

  // Predictive Insights
  maintenanceScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 24,
  },
  scoreLabel: {
    color: theme.colors.surface,
    fontSize: 12,
  },
  scoreDetails: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  scoreTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scoreDescription: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  // Next Service
  nextServiceContainer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  nextServiceTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  nextServiceDetails: {
    gap: theme.spacing.xs / 2,
  },
  nextServiceName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  nextServiceDate: {
    color: theme.colors.textSecondary,
  },
  nextServiceConfidence: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // Budget
  budgetContainer: {
    gap: theme.spacing.sm,
  },
  budgetTitle: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  budgetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetValue: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  budgetLabel: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  budgetReasoning: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Insights Section
  insightsSection: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
  },
  insightCard: {
    // InsightCard handles its own styling
  },

  // Actions
  actionsContainer: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
  },
  actionButton: {
    // Button handles its own styling
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default VehicleAnalyticsScreen;