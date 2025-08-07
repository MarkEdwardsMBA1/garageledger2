import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { legalComplianceService } from '../services/LegalComplianceService';
import { authService } from '../services/AuthService';
import { theme } from '../utils/theme';
import { LegalAcceptanceData } from '../types';

export const LegalConsentScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Prepare legal acceptance data
      const acceptanceData: LegalAcceptanceData = {
        termsAccepted: true,
        privacyAccepted: true,
        maintenanceDisclaimerAccepted: true,
        acceptanceTimestamp: new Date(),
        ipAddress: 'unknown', // Would be retrieved in production
        userAgent: 'GarageLedger/1.0.0 (React Native)',
        appVersion: '1.0.0',
        locale: 'en-US', // Would be retrieved from i18n in production
      };

      // Record legal acceptance
      await legalComplianceService.recordAcceptance(currentUser.uid, acceptanceData);

      // Navigate to celebration screen
      navigation.navigate('SignUpSuccess' as never);
    } catch (error) {
      console.error('Failed to record legal acceptance:', error);
      Alert.alert(
        'Error',
        'Failed to record legal agreements. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (documentType: 'terms' | 'privacy' | 'disclaimer') => {
    // Navigate to detailed view or show modal
    Alert.alert(
      'Document Details',
      'In production, this would show the full legal document.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl),
            paddingBottom: Math.max(insets.bottom + theme.spacing.xl, theme.spacing['4xl']) 
          }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            Step 4 of 5
          </Typography>
        </View>

        <View style={styles.header}>
          <Typography variant="body" style={styles.headerIcon}>
            🔒
          </Typography>
          <Typography variant="title" style={styles.title}>
            Privacy & Terms
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            We value your privacy and want to be transparent about how we handle your data.
          </Typography>
        </View>

        {/* Friendly summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Typography variant="body" style={styles.summaryIcon}>✓</Typography>
            <Typography variant="body" style={styles.summaryText}>
              Your vehicle data stays yours — export anytime
            </Typography>
          </View>
          
          <View style={styles.summaryItem}>
            <Typography variant="body" style={styles.summaryIcon}>✓</Typography>
            <Typography variant="body" style={styles.summaryText}>
              We provide tracking tools, not professional advice
            </Typography>
          </View>
          
          <View style={styles.summaryItem}>
            <Typography variant="body" style={styles.summaryIcon}>✓</Typography>
            <Typography variant="body" style={styles.summaryText}>
              Secure cloud storage with data encryption
            </Typography>
          </View>
        </Card>

        {/* Important disclaimer - softened */}
        <Card style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Typography variant="body" style={styles.disclaimerIcon}>
              ℹ️
            </Typography>
            <Typography variant="heading" style={styles.disclaimerTitle}>
              Quick Reminder
            </Typography>
          </View>
          
          <Typography variant="body" style={styles.disclaimerText}>
            GarageLedger helps you track maintenance — it doesn't replace your owner's manual or professional mechanic advice. Always consult qualified professionals for safety-critical decisions.
          </Typography>
        </Card>

        {/* Legal links */}
        <View style={styles.legalLinks}>
          <Typography variant="body" style={styles.legalText}>
            By continuing, you agree to our:
          </Typography>
          
          <View style={styles.linkRow}>
            <Button
              title="Terms of Service"
              onPress={() => handleViewDetails('terms')}
              variant="text"
              style={styles.legalLink}
            />
            <Typography variant="body" style={styles.linkSeparator}>•</Typography>
            <Button
              title="Privacy Policy"
              onPress={() => handleViewDetails('privacy')}
              variant="text"
              style={styles.legalLink}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="I Understand & Continue"
            onPress={handleAccept}
            disabled={isLoading}
            style={styles.acceptButton}
            testID="accept-continue-button"
          />
          
          <Typography variant="caption" style={styles.footerText}>
            You can withdraw consent anytime in Settings
          </Typography>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    fontSize: theme.typography.fontSize['3xl'],
    marginBottom: theme.spacing.md,
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
  summaryCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  summaryIcon: {
    color: theme.colors.success,
    marginRight: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  summaryText: {
    flex: 1,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  disclaimerCard: {
    backgroundColor: theme.colors.info + '10', // Electric Blue background
    borderColor: theme.colors.info + '30',     // Electric Blue border  
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  disclaimerIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.sm,
  },
  disclaimerTitle: {
    flex: 1,
    color: theme.colors.info,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  disclaimerText: {
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  legalLinks: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  legalText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    paddingHorizontal: theme.spacing.xs,
  },
  linkSeparator: {
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.sm,
  },
  actions: {
    alignItems: 'center',
  },
  acceptButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default LegalConsentScreen;