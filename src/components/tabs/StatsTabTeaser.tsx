// Stats Tab Teaser Component - Preview content with premium upgrade CTA
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
import { LockIcon, TrendingUpIcon, BarChartIcon, CalendarIcon } from '../icons';

/**
 * Stats Tab Teaser Component
 * Shows preview of Stats functionality with upgrade CTA
 * Part of freemium strategy for Phase 2
 */
export const StatsTabTeaser: React.FC = () => {

  const handleUpgrade = () => {
    Alert.alert(
      'Unlock Full Stats',
      'Get detailed vehicle analytics, mileage trends, cost breakdowns, and maintenance forecasting with GarageLedger Pro.',
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

  const renderPreviewCard = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    previewData: string,
    isLocked = true
  ) => (
    <Card variant="elevated" style={isLocked ? StyleSheet.flatten([styles.previewCard, styles.lockedCard]) : styles.previewCard}>
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
      
      <View style={styles.previewContent}>
        <Typography variant="display" style={[styles.previewValue, isLocked && styles.lockedText]}>
          {previewData}
        </Typography>
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Typography variant="caption" style={styles.lockText}>
              Unlock with Pro
            </Typography>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Cards */}
        <View style={styles.previewSection}>
          <Typography variant="heading" style={styles.sectionTitle}>
            Sample Analytics
          </Typography>
          
          <View style={styles.cardsGrid}>
            {renderPreviewCard(
              'Fleet Mileage Trends',
              'Monthly driving patterns',
              <TrendingUpIcon size={24} color={theme.colors.primary} />,
              '12,847',
              true
            )}
            
            {renderPreviewCard(
              'Average Cost Per Mile',
              'Maintenance efficiency',
              <BarChartIcon size={24} color={theme.colors.secondary} />,
              '$0.18',
              true
            )}
            
            {renderPreviewCard(
              'Service Frequency',
              'Maintenance schedule adherence',
              <CalendarIcon size={24} color={theme.colors.accent} />,
              '94%',
              true
            )}
            
            {/* Sample unlocked card */}
            {renderPreviewCard(
              'Total Vehicles',
              'Active fleet size',
              <BarChartIcon size={24} color={theme.colors.success} />,
              '3',
              false
            )}
          </View>
        </View>

        {/* Features List */}
        <Card variant="outlined" style={styles.featuresCard}>
          <Typography variant="subheading" style={styles.featuresTitle}>
            Full Stats Include:
          </Typography>
          
          <View style={styles.featuresList}>
            {[
              'Vehicle mileage and usage trends',
              'Cost per mile and efficiency metrics', 
              'Maintenance frequency analysis',
              'Seasonal driving pattern insights',
              'Service cost forecasting',
              'Fleet comparison analytics'
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
            Unlock Detailed Analytics
          </Typography>
          <Typography variant="body" style={styles.ctaDescription}>
            Get insights that help you save money, extend vehicle life, and make informed maintenance decisions.
          </Typography>
          
          <Button
            title="Upgrade to Pro"
            variant="primary"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />
          
          <TouchableOpacity onPress={handleUpgrade}>
            <Typography variant="caption" style={styles.learnMoreText}>
              Learn more about Pro features
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
  
  // Preview section
  previewSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardsGrid: {
    gap: theme.spacing.md,
  },
  
  // Preview cards
  previewCard: {
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
  
  previewContent: {
    position: 'relative',
  },
  previewValue: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  lockedText: {
    color: theme.colors.textSecondary,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
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

export default StatsTabTeaser;