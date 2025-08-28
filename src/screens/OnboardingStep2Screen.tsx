import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { OnboardingProgressIndicator } from '../components/common/OnboardingProgressIndicator';
import { ChecklistIcon, ClipboardIcon } from '../components/icons';
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
        <OnboardingProgressIndicator currentStep={2} totalSteps={3} />

        {/* Hero Visual */}
        <View style={styles.heroContainer}>
          {/* Maintenance checklist visualization */}
          <View style={styles.checklistContainer}>
            <ChecklistIcon 
              size={180} 
              color={theme.colors.primary}
              backgroundColor={theme.colors.surface}
              checkmarkColor={theme.colors.secondary}
              penColor={theme.colors.warning}
              textColor={theme.colors.chrome}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.messageContainer}>
          <Typography variant="body" style={styles.message}>
            Stay ahead of preventive maintenance services and estimated costs with programs and reminders.
          </Typography>
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
    position: 'relative',
    marginVertical: theme.spacing.xl,
  },
  checklistContainer: {
    position: 'relative',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
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