import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { theme } from '../utils/theme';
import { Vehicle } from '../types';

interface FirstVehicleSuccessProps {
  navigation: any;
  route: {
    params: {
      vehicle: Vehicle;
    };
  };
}

export const FirstVehicleSuccessScreen: React.FC<any> = ({ 
  navigation, 
  route 
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { vehicle } = route.params;

  const handleLogMaintenance = () => {
    // Navigate to first maintenance log for A2 activation
    navigation.navigate('FirstMaintenanceLog', { vehicle });
  };

  const handleAddReminder = () => {
    // Navigate to reminder setup for A2 activation
    navigation.navigate('FirstReminder', { vehicle });
  };

  const handleGoToDashboard = () => {
    // Navigate to main app dashboard
    navigation.navigate('MainApp');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom + theme.spacing.lg, theme.spacing.xl) }
      ]}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Typography variant="title" style={styles.successIcon}>
            🎉
          </Typography>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Typography variant="title" style={styles.title}>
            {t('success.congratulations', 'Congratulations!')}
          </Typography>
          
          <Typography variant="body" style={styles.message}>
            {t('success.firstVehicleMessage', 'Your {{year}} {{make}} {{model}} is parked in GarageLedger.', {
              year: vehicle.year,
              make: vehicle.make,
              model: vehicle.model,
            })}
          </Typography>
        </View>

        {/* Next Steps Card */}
        <Card style={styles.nextStepsCard}>
          <Typography variant="heading" style={styles.nextStepsTitle}>
            {t('success.whatsNext', 'What\'s next?')}
          </Typography>
          
          <Typography variant="body" style={styles.nextStepsDescription}>
            {t('success.nextStepsDescription', 'Get the most out of GarageLedger by tracking your maintenance:')}
          </Typography>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title={t('success.logMaintenance', 'Log my last oil change')}
              variant="primary"
              onPress={handleLogMaintenance}
              style={styles.actionButton}
            />
            
            <Button
              title={t('success.addReminder', 'Add a maintenance reminder')}
              variant="outline"
              onPress={handleAddReminder}
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* Skip Option */}
        <Button
          title={t('success.goToDashboard', 'Take me to the dashboard')}
          variant="text"
          onPress={handleGoToDashboard}
          style={styles.skipButton}
        />
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
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.bold,
  },
  message: {
    textAlign: 'center',
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    paddingHorizontal: theme.spacing.md,
  },
  nextStepsCard: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  nextStepsTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  nextStepsDescription: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  actions: {
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  skipButton: {
    alignSelf: 'center',
  },
});

export default FirstVehicleSuccessScreen;