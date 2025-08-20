// Costs Tab Teaser Component - Preview content with premium upgrade CTA
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LockIcon, DollarIcon, PieChartIcon, TrendingDownIcon, TrendingUpIcon } from '../icons';

/**
 * Costs Tab Teaser Component
 * Shows preview of Costs functionality with upgrade CTA
 * Part of freemium strategy for Phase 2
 */
export const CostsTabTeaser: React.FC = () => {

  const handleUpgrade = () => {
    Alert.alert(
      'Unlock Detailed Costs',
      'Track costs by vehicle, parts, labor, and categories. Get budget forecasts and cost-saving insights with GarageLedger Pro.',
      [
        {
          text: 'Learn More',
          onPress: () => {
            // TODO: Navigate to pricing/upgrade screen
            Alert.alert('Coming Soon', 'Upgrade options will be available soon!');
          }
        },
        {
          text: 'Not Now',
          style: 'cancel'
        }
      ]
    );
  };

  const renderCostCard = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    amount: string,
    trend?: { value: string; isPositive: boolean },
    isLocked = true
  ) => (
    <Card variant="elevated" style={isLocked ? StyleSheet.flatten([styles.costCard, styles.lockedCard]) : styles.costCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <View style={styles.cardIcon}>
            {icon}
          </View>
          <View style={styles.cardTitleInfo}>
            <Typography variant="subheading" style={styles.cardTitle}>
              {title}
            </Typography>
            <Typography variant="caption" style={styles.cardSubtitle}>
              {subtitle}
            </Typography>
          </View>
        </View>
        {isLocked && (
          <View style={styles.lockIcon}>
            <LockIcon size={20} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.costContent}>
        <Typography variant="display" style={[styles.costAmount, isLocked && styles.lockedText]}>
          {amount}
        </Typography>
        {trend && (
          <View style={styles.trendContainer}>
            {trend.isPositive ? (
              <TrendingUpIcon size={16} color={theme.colors.error} />
            ) : (
              <TrendingDownIcon size={16} color={theme.colors.success} />
            )}
            <Typography 
              variant="caption" 
              style={[
                styles.trendText,
                { color: trend.isPositive ? theme.colors.error : theme.colors.success }
              ]}
            >
              {trend.value}
            </Typography>
          </View>
        )}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Typography variant="caption" style={styles.lockText}>
              Pro Only
            </Typography>
          </View>
        )}
      </View>
    </Card>
  );

  const renderCategoryBreakdown = () => {
    const categories = [
      { name: 'Oil Changes', amount: 240, percentage: 35, color: theme.colors.primary },
      { name: 'Brake Service', amount: 180, percentage: 26, color: theme.colors.secondary },
      { name: 'Tire Rotation', amount: 120, percentage: 17, color: theme.colors.accent },
      { name: 'Other', amount: 150, percentage: 22, color: theme.colors.textSecondary },
    ];

    return (
      <Card variant="outlined" style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <Typography variant="subheading" style={styles.breakdownTitle}>
            Cost Breakdown by Category
          </Typography>
          <LockIcon size={20} color={theme.colors.textSecondary} />
        </View>
        
        <View style={styles.breakdownContent}>
          {categories.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Typography variant="bodySmall" style={styles.categoryName}>
                  {category.name}
                </Typography>
              </View>
              <View style={styles.categoryAmountContainer}>
                <Typography variant="bodySmall" style={[styles.categoryAmount, styles.lockedText]}>
                  ${category.amount}
                </Typography>
                <Typography variant="caption" style={styles.categoryPercentage}>
                  {category.percentage}%
                </Typography>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.breakdownFooter}>
          <Typography variant="caption" style={styles.upgradeHint}>
            Unlock detailed cost tracking and budgeting tools
          </Typography>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cost Overview Cards */}
        <View style={styles.costsSection}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Sample Cost Analysis
          </Typography>
          
          <View style={styles.cardsGrid}>
            {renderCostCard(
              'Total Maintenance Costs',
              'Last 12 months',
              <DollarIcon size={24} color={theme.colors.primary} />,
              '$1,247',
              { value: '+12%', isPositive: true },
              true
            )}
            
            {renderCostCard(
              'Average Monthly Cost',
              'Per vehicle',
              <PieChartIcon size={24} color={theme.colors.secondary} />,
              '$104',
              { value: '-8%', isPositive: false },
              true
            )}
            
            {renderCostCard(
              'Upcoming Budget',
              'Next 3 months forecast',
              <TrendingUpIcon size={24} color={theme.colors.accent} />,
              '$380',
              undefined,
              true
            )}
            
            {/* Sample unlocked card */}
            {renderCostCard(
              'Last Service Cost',
              'Most recent maintenance',
              <DollarIcon size={24} color={theme.colors.success} />,
              '$89',
              undefined,
              false
            )}
          </View>
        </View>

        {/* Category Breakdown */}
        {renderCategoryBreakdown()}

        {/* Features List */}
        <Card variant="outlined" style={styles.featuresCard}>
          <Typography variant="subheading" style={styles.featuresTitle}>
            Full Cost Tracking Includes:
          </Typography>
          
          <View style={styles.featuresList}>
            {[
              'Detailed cost breakdown by vehicle',
              'Category-wise spending analysis',
              'Parts vs labor cost tracking',
              'Monthly and yearly budget forecasts',
              'Cost-per-mile calculations',
              'Maintenance cost optimization tips'
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Typography variant="bodySmall" style={styles.featureText}>
                  {feature}
                </Typography>
                <LockIcon size={14} color={theme.colors.textSecondary} />
              </View>
            ))}
          </View>
        </Card>

        {/* Upgrade CTA */}
        <Card variant="filled" style={styles.ctaCard}>
          <Typography variant="subheading" style={styles.ctaTitle}>
            Take Control of Your Costs
          </Typography>
          <Typography variant="body" style={styles.ctaDescription}>
            Set budgets, track spending trends, and get personalized cost-saving recommendations for each vehicle.
          </Typography>
          
          <Button
            title="Upgrade to Pro"
            variant="primary"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />
          
          <TouchableOpacity onPress={handleUpgrade}>
            <Typography variant="caption" style={styles.learnMoreText}>
              See all Pro features and pricing
            </Typography>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  
  // Costs section
  costsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardsGrid: {
    gap: theme.spacing.md,
  },
  
  // Cost cards
  costCard: {
    padding: theme.spacing.md,
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: theme.spacing.sm,
  },
  cardTitleInfo: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
  },
  lockIcon: {
    marginLeft: theme.spacing.sm,
  },
  
  costContent: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costAmount: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  lockedText: {
    color: theme.colors.textSecondary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  trendText: {
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  lockOverlay: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  lockText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.xs,
  },
  
  // Category breakdown
  breakdownCard: {
    marginBottom: theme.spacing.xl,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  breakdownTitle: {
    color: theme.colors.text,
  },
  breakdownContent: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    color: theme.colors.text,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryPercentage: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  breakdownFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  upgradeHint: {
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  
  // Features
  featuresCard: {
    marginBottom: theme.spacing.xl,
  },
  featuresTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featuresList: {
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  featureText: {
    flex: 1,
    color: theme.colors.text,
  },
  
  // CTA
  ctaCard: {
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
  },
  ctaTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  ctaDescription: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  learnMoreText: {
    color: theme.colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default CostsTabTeaser;