import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { SpannerIcon } from '../components/icons';
import { theme } from '../utils/theme';
import type { TrackingGoals } from './GoalsSetupScreen';

export const GoalsSuccessScreen: React.FC<any> = ({ 
  navigation, 
  route 
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { goals } = route?.params || { goals: { maintenance: true, modifications: true, fuel: true, reminders: true } };

  // Create personalized success message based on selected goals
  const getPersonalizedMessage = () => {
    const selectedGoals = Object.entries(goals).filter(([_, selected]) => selected);
    const goalCount = selectedGoals.length;
    
    if (goalCount === 4) {
      return "You're all set for comprehensive vehicle tracking! 🚗✨";
    } else if (goalCount >= 2) {
      return `Great choice! You've selected ${goalCount} tracking areas that will help you stay organized. 📈`;
    } else if (goalCount === 1) {
      const [goalKey] = selectedGoals[0];
      const goalMessages = {
        maintenance: "Perfect! You'll never miss another oil change.",
        modifications: "Awesome! Track every upgrade and build progress. ⚡",
        fuel: "Smart! Monitor your fuel costs and efficiency. ⛽",
        reminders: "Great! Stay on top of maintenance schedules. ⏰"
      };
      return goalMessages[goalKey as keyof typeof goalMessages] || "Perfect choice for staying organized! 👍";
    }
    
    return "You're all set! We'll help you track everything that matters. 🎯";
  };

  // Get selected goals for display
  const getSelectedGoalsList = () => {
    return Object.entries(goals)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => ({ key, selected: true }));
  };

  // Render goal item with appropriate icon
  const renderGoalItem = (goalKey: string, index: number) => {
    const goalLabels = {
      maintenance: "Maintenance & Repairs",
      modifications: "⚡ Modifications & Upgrades", 
      fuel: "⛽ Fuel & Costs",
      reminders: "⏰ Reminders & Schedules"
    };

    return (
      <View key={index} style={styles.goalItem}>
        {goalKey === 'maintenance' ? (
          <View style={styles.goalItemWithIcon}>
            <SpannerIcon size={16} color={theme.colors.text} />
            <Typography variant="body" style={styles.goalTextWithIcon}>
              {goalLabels[goalKey as keyof typeof goalLabels]}
            </Typography>
          </View>
        ) : (
          <Typography variant="body" style={styles.goalText}>
            {goalLabels[goalKey as keyof typeof goalLabels]}
          </Typography>
        )}
      </View>
    );
  };

  const handleContinue = () => {
    // Pass goals to signup screen
    navigation.navigate('SignUp', { goals });
  };

  const selectedGoalsList = getSelectedGoalsList();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl),
            paddingBottom: Math.max(insets.bottom + theme.spacing.xl, theme.spacing['4xl']) 
          }
        ]}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 1 Complete!
          </Typography>
        </View>

        {/* Success celebration */}
        <View style={styles.celebrationContainer}>
          <Typography variant="title" style={styles.successTitle}>
            Congratulations, you're all set!
          </Typography>
        </View>

        {/* Selected goals summary */}
        {selectedGoalsList.length > 0 && (
          <Card variant="floating" style={styles.goalsCard}>
            <Typography variant="heading" style={styles.goalsTitle}>
              Your tracking goals:
            </Typography>
            {selectedGoalsList.map((goalObj, index) => 
              renderGoalItem(goalObj.key, index)
            )}
          </Card>
        )}

        {/* Next steps preview */}
        <Card variant="elevated" style={styles.nextStepsCard}>
          <Typography variant="heading" style={styles.nextStepsTitle}>
            What's next?
          </Typography>
          <View style={styles.nextStepsList}>
            <View style={styles.nextStepItem}>
              <Typography variant="body" style={styles.stepNumber}>1.</Typography>
              <Typography variant="body" style={styles.stepText}>
                Create your account
              </Typography>
            </View>
            <View style={styles.nextStepItem}>
              <Typography variant="body" style={styles.stepNumber}>2.</Typography>
              <Typography variant="body" style={styles.stepText}>
                Add your first vehicle
              </Typography>
            </View>
            <View style={styles.nextStepItem}>
              <Typography variant="body" style={styles.stepNumber}>3.</Typography>
              <Typography variant="body" style={styles.stepText}>
                Start tracking immediately!
              </Typography>
            </View>
          </View>
        </Card>

        {/* Continue button */}
        <View style={styles.actions}>
          <Button
            title="Let's create your account!"
            onPress={handleContinue}
            variant="primary"
            style={styles.continueButton}
            testID="continue-to-signup"
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  progressContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
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
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: theme.spacing.md,
  },
  successTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
    paddingHorizontal: theme.spacing.md,
  },
  goalsCard: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.success + '05', // Racing Green background
    borderColor: theme.colors.success + '20',     // Racing Green border
    borderWidth: 1,
  },
  goalsTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.success, // Racing Green for success
    fontWeight: theme.typography.fontWeight.semibold,
  },
  goalItem: {
    marginBottom: theme.spacing.sm,
  },
  goalText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
  },
  goalItemWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTextWithIcon: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    marginLeft: theme.spacing.sm,
  },
  nextStepsCard: {
    marginBottom: theme.spacing.xl,
  },
  nextStepsTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  nextStepsList: {
    gap: theme.spacing.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    marginRight: theme.spacing.sm,
    minWidth: 20,
  },
  stepText: {
    flex: 1,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  continueButton: {
    marginBottom: theme.spacing.md,
  },
});

export default GoalsSuccessScreen;