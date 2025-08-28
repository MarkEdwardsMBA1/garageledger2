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
import { PhoneMaintenanceIcon } from '../components/icons';
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
        <OnboardingProgressIndicator currentStep={1} totalSteps={3} />

        {/* Hero Visual */}
        <View style={styles.heroContainer}>
          {/* Digital maintenance tracking visualization */}
          <View style={styles.phoneContainer}>
            <PhoneMaintenanceIcon 
              size={200}
              color={theme.colors.primary}
              phoneColor={theme.colors.info}
              screenColor={theme.colors.surface}
              toolColor={theme.colors.secondary}
              accentColor={theme.colors.accent}
              dataColor={theme.colors.chrome}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.messageContainer}>
          <Typography variant="body" style={styles.message}>
            Ready to create your vehicle's digital memory? Start logging services, it's easy!
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
  phoneContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
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