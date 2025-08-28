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
import { DataStorageIcon } from '../components/icons';
import { theme } from '../utils/theme';

interface OnboardingStep3Props {
  navigation: any;
  onComplete: () => void;
  onBack: () => void;
}

export const OnboardingStep3Screen: React.FC<OnboardingStep3Props> = ({
  navigation,
  onComplete,
  onBack,
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
        <OnboardingProgressIndicator currentStep={3} totalSteps={3} />

        {/* Hero Visual */}
        <View style={styles.heroContainer}>
          {/* Data ownership visualization */}
          <View style={styles.dataContainer}>
            <DataStorageIcon 
              size={180}
              color={theme.colors.primary}
              cloudColor={theme.colors.surface}
              serverColor={theme.colors.secondary}
              iconColor={theme.colors.chrome}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.messageContainer}>
          <Typography variant="body" style={styles.message}>
            Discover patterns and trends through insightful analytics.
          </Typography>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Continue"
            variant="primary"
            onPress={onComplete}
            style={styles.getStartedButton}
            textStyle={styles.buttonText}
          />
          
          <Button
            title="Back"
            variant="text"
            onPress={onBack}
            style={styles.backButton}
          />
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
    backgroundColor: theme.colors.success,
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: theme.spacing.xl,
  },
  dataContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  shieldContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 40,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  shieldIcon: {
    fontSize: 64,
  },
  dataFlowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  dataBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    minWidth: 80,
    ...theme.shadows.xs,
  },
  dataBoxLeft: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  dataBoxRight: {
    borderRightWidth: 3,
    borderRightColor: theme.colors.success,
  },
  dataBoxLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  dataItems: {
    gap: theme.spacing.xs,
  },
  dataItem: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
  },
  arrowContainer: {
    alignItems: 'center',
    flex: 1,
  },
  arrow: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  exportLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formatTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  formatTag: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  formatText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  noTrackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  noTrackingIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.sm,
  },
  noTrackingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
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
  getStartedButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
});

export default OnboardingStep3Screen;