import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { theme } from '../utils/theme';
import { MaintenanceIcon, ModificationsIcon, FuelIcon, RemindersIcon } from '../components/icons';

interface GoalsSetupScreenProps {
  navigation: any;
}

export interface TrackingGoals {
  maintenance: boolean;
  modifications: boolean;
  fuel: boolean;
  reminders: boolean;
}

const TrackingOption: React.FC<{
  IconComponent: React.FC<{ size?: number; color?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  testID?: string;
}> = ({ IconComponent, title, description, selected, onToggle, testID }) => {
  return (
    <Card 
      style={selected ? [styles.optionCard, styles.optionCardSelected] as any : styles.optionCard}
      onPress={onToggle}
      testID={testID}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionHeader}>
          <View style={styles.optionIconContainer}>
            <IconComponent 
              size={28} 
              color={selected ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <View style={styles.optionTexts}>
            <Typography variant="heading" style={styles.optionTitle}>
              {title}
            </Typography>
            <Typography variant="body" style={styles.optionDescription}>
              {description}
            </Typography>
          </View>
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && (
              <Typography variant="body" style={styles.checkmark}>
                ✓
              </Typography>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

export const GoalsSetupScreen: React.FC<GoalsSetupScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<TrackingGoals>({
    maintenance: false,
    modifications: false,
    fuel: false,
    reminders: false,
  });

  const hasSelectedGoals = Object.values(goals).some(selected => selected);

  const toggleGoal = (goalKey: keyof TrackingGoals) => {
    setGoals(prev => ({
      ...prev,
      [goalKey]: !prev[goalKey],
    }));
  };

  const handleContinue = () => {
    // Navigate to success screen with goals
    navigation.navigate('GoalsSuccess', { goals });
  };

  const handleSkip = () => {
    // Continue with default goals (all enabled)
    const defaultGoals: TrackingGoals = {
      maintenance: true,
      modifications: true,
      fuel: true,
      reminders: true,
    };
    navigation.navigate('GoalsSuccess', { goals: defaultGoals });
  };

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
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 1 of 4
          </Typography>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Typography variant="title" style={styles.title}>
            {t('goals.title', 'What would you like to track?')}
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            {t('goals.subtitle', 'Choose what matters most to you. You can always change this later.')}
          </Typography>
        </View>

        {/* Tracking Options */}
        <View style={styles.options}>
          <TrackingOption
            IconComponent={MaintenanceIcon}
            title="Maintenance & Repairs"
            description="Oil changes, tune-ups, and repair records"
            selected={goals.maintenance}
            onToggle={() => toggleGoal('maintenance')}
            testID="maintenance-option"
          />

          <TrackingOption
            IconComponent={ModificationsIcon}
            title="Modifications & Upgrades"
            description="Track mods, parts, and build progress"
            selected={goals.modifications}
            onToggle={() => toggleGoal('modifications')}
            testID="modifications-option"
          />

          <TrackingOption
            IconComponent={FuelIcon}
            title="Fuel & Costs"
            description="Gas mileage, expenses, and cost analysis"
            selected={goals.fuel}
            onToggle={() => toggleGoal('fuel')}
            testID="fuel-option"
          />

          <TrackingOption
            IconComponent={RemindersIcon}
            title="Reminders & Schedules"
            description="Never miss maintenance or inspections"
            selected={goals.reminders}
            onToggle={() => toggleGoal('reminders')}
            testID="reminders-option"
          />
        </View>


        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={hasSelectedGoals ? "Continue" : "I'll choose everything"}
            onPress={hasSelectedGoals ? handleContinue : handleSkip}
            variant="primary"
            style={styles.continueButton}
            testID="continue-button"
          />
          
          {hasSelectedGoals && (
            <Button
              title="Skip for now"
              onPress={handleSkip}
              variant="text"
              style={styles.skipButton}
              testID="skip-button"
            />
          )}
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
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing.md,
  },
  options: {
    marginBottom: theme.spacing.xl,
  },
  optionCard: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '05',
  },
  optionContent: {
    padding: theme.spacing.lg,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 32,
    height: 32,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTexts: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  optionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  continueButton: {
    marginBottom: theme.spacing.md,
  },
  skipButton: {
    alignSelf: 'center',
  },
});

export default GoalsSetupScreen;