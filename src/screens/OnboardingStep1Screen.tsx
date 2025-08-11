import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { CarIcon, MaintenanceIcon, FuelIcon, ActivityIcon } from '../components/icons';
import { theme } from '../utils/theme';

interface OnboardingStep1Props {
  navigation: any;
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingStep1Screen: React.FC<OnboardingStep1Props> = ({
  navigation,
  onNext,
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
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 1 of 3
          </Typography>
        </View>

        {/* Hero Visual */}
        <View style={styles.heroContainer}>
          {/* Central car with floating icons */}
          <View style={styles.carContainer}>
            <CarIcon size={120} color={theme.colors.primary} />
          </View>
          
          {/* Floating maintenance icons */}
          <View style={[styles.floatingIcon, styles.iconTopLeft]}>
            <MaintenanceIcon size={32} color={theme.colors.secondary} />
          </View>
          <View style={[styles.floatingIcon, styles.iconTopRight]}>
            <FuelIcon size={32} color={theme.colors.accent} />
          </View>
          <View style={[styles.floatingIcon, styles.iconBottomLeft]}>
            <ActivityIcon size={32} color={theme.colors.info} />
          </View>
          <View style={[styles.floatingIcon, styles.iconBottomRight]}>
            <MaintenanceIcon size={28} color={theme.colors.warning} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.messageContainer}>
          <Typography variant="title" style={styles.title}>
            Your Car's Digital Memory
          </Typography>
          
          <Typography variant="body" style={styles.message}>
            Every oil change, repair, and upgrade lives in your pocket. Build your car's complete story and never lose track of what's been done.
          </Typography>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Typography variant="body" style={styles.benefitIcon}>📱</Typography>
              <Typography variant="body" style={styles.benefitText}>
                All maintenance records in one place
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Typography variant="body" style={styles.benefitIcon}>📸</Typography>
              <Typography variant="body" style={styles.benefitText}>
                Photos and receipts attached to each service
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Typography variant="body" style={styles.benefitIcon}>💎</Typography>
              <Typography variant="body" style={styles.benefitText}>
                Boost resale value with complete history
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
          
          <Button
            title="Skip intro"
            variant="text"
            onPress={onSkip}
            style={styles.skipButton}
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
  carContainer: {
    padding: theme.spacing.lg,
  },
  floatingIcon: {
    position: 'absolute',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    ...theme.shadows.sm,
  },
  iconTopLeft: {
    top: '20%',
    left: '15%',
  },
  iconTopRight: {
    top: '15%',
    right: '10%',
  },
  iconBottomLeft: {
    bottom: '25%',
    left: '20%',
  },
  iconBottomRight: {
    bottom: '20%',
    right: '15%',
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
  skipButton: {
    paddingVertical: theme.spacing.sm,
  },
});

export default OnboardingStep1Screen;