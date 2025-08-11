import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { MaintenanceIcon } from '../components/icons';
import { theme } from '../utils/theme';

interface OnboardingStep2Props {
  navigation: any;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const OnboardingStep2Screen: React.FC<OnboardingStep2Props> = ({
  navigation,
  onNext,
  onBack,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={[
        styles.content,
        { 
          paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl),
          paddingBottom: Math.max(insets.bottom + theme.spacing.lg, theme.spacing.xl)
        }
      ]}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 2 of 3
          </Typography>
        </View>

        {/* Hero Visual */}
        <View style={styles.heroContainer}>
          {/* Dashboard-style visual */}
          <View style={styles.dashboardContainer}>
            {/* Central maintenance icon */}
            <View style={styles.centerIcon}>
              <MaintenanceIcon size={80} color={theme.colors.primary} />
            </View>
            
            {/* Reminder indicators around the center */}
            <View style={[styles.reminderIndicator, styles.indicator1]}>
              <View style={[styles.reminderDot, styles.dueSoon]} />
              <Typography variant="caption" style={styles.reminderText}>
                Oil Change
              </Typography>
              <Typography variant="caption" style={styles.dueDateText}>
                Due in 500 mi
              </Typography>
            </View>
            
            <View style={[styles.reminderIndicator, styles.indicator2]}>
              <View style={[styles.reminderDot, styles.good]} />
              <Typography variant="caption" style={styles.reminderText}>
                Inspection
              </Typography>
              <Typography variant="caption" style={styles.dueDateText}>
                Good until May
              </Typography>
            </View>
            
            <View style={[styles.reminderIndicator, styles.indicator3]}>
              <View style={[styles.reminderDot, styles.overdue]} />
              <Typography variant="caption" style={styles.reminderText}>
                Tire Rotation
              </Typography>
              <Typography variant="caption" style={styles.dueDateText}>
                Past due
              </Typography>
            </View>
            
            {/* Clock/Calendar visual element */}
            <View style={styles.clockElement}>
              <MaintenanceIcon size={24} color={theme.colors.info} />
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.messageContainer}>
          <Typography variant="title" style={styles.title}>
            Stay on Top of Maintenance
          </Typography>
          
          <Typography variant="body" style={styles.message}>
            Never wonder "when was my last oil change?" again. Smart reminders keep you ahead of the game and your car running smoothly.
          </Typography>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Typography variant="body" style={styles.benefitIcon}>⏰</Typography>
              <Typography variant="body" style={styles.benefitText}>
                Calendar and mileage-based reminders
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Typography variant="body" style={styles.benefitIcon}>🎯</Typography>
              <Typography variant="body" style={styles.benefitText}>
                At-a-glance status for all your vehicles
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Typography variant="body" style={styles.benefitIcon}>🛡️</Typography>
              <Typography variant="body" style={styles.benefitText}>
                Stay ahead of problems, avoid breakdowns
              </Typography>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue"
            variant="primary"
            onPress={onNext}
            style={styles.continueButton}
            textStyle={styles.buttonText}
          />
          
          <View style={styles.bottomActions}>
            <Button
              title="Back"
              variant="text"
              onPress={onBack}
              style={styles.backButton}
            />
            <Button
              title="Skip intro"
              variant="text"
              onPress={onSkip}
              style={styles.skipButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.textSecondary,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dashboardContainer: {
    position: 'relative',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: 50,
    ...theme.shadows.md,
  },
  reminderIndicator: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.xs,
    minWidth: 80,
    ...theme.shadows.xs,
  },
  indicator1: {
    top: 20,
    right: 10,
  },
  indicator2: {
    bottom: 60,
    left: 10,
  },
  indicator3: {
    top: 80,
    left: -10,
  },
  reminderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
  },
  dueSoon: {
    backgroundColor: theme.colors.warning,
  },
  good: {
    backgroundColor: theme.colors.success,
  },
  overdue: {
    backgroundColor: theme.colors.error,
  },
  reminderText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  dueDateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  clockElement: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.xs,
    ...theme.shadows.xs,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.typography.fontSize.lg,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  benefitsList: {
    alignSelf: 'stretch',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  benefitIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing.md,
    width: 32,
    textAlign: 'center',
  },
  benefitText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
  },
  actions: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
  skipButton: {
    paddingVertical: theme.spacing.sm,
  },
});

export default OnboardingStep2Screen;