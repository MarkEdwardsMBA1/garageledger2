import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { OnboardingProgressIndicator } from '../components/common/OnboardingProgressIndicator';
import { legalComplianceService } from '../services/LegalComplianceService';
import { authService } from '../services/AuthService';
import { theme } from '../utils/theme';
import { LegalAcceptanceData } from '../types';

interface LegalCheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: string;
  onShowSummary?: () => void;
  onShowFullDocument?: () => void;
  testID?: string;
}

// Note: LegalCheckbox component is no longer used as we're using individual cards
// Keeping for reference but not implementing since the UI has changed

interface DocumentModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  visible,
  onClose,
  title,
  content,
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <Typography variant="heading" style={styles.modalTitle}>
            {title}
          </Typography>
          <Button
            title="Close"
            onPress={onClose}
            variant="text"
            style={styles.modalCloseButton}
          />
        </View>
        
        <ScrollView 
          style={styles.modalContent}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }}
        >
          <Typography variant="body" style={styles.modalText}>
            {content}
          </Typography>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const LegalAgreementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [maintenanceDisclaimerAccepted, setMaintenanceDisclaimerAccepted] = useState(false);
  const [showModal, setShowModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({ visible: false, title: '', content: '' });

  // Get translations (temp implementation - using fallbacks)
  const t = (key: string, fallback?: string) => fallback || key.split('.').pop() || key;

  const canProceed = termsAccepted && privacyAccepted && maintenanceDisclaimerAccepted;
  const allAccepted = canProceed;

  const handleAcceptAll = (accepted: boolean) => {
    setTermsAccepted(accepted);
    setPrivacyAccepted(accepted);
    setMaintenanceDisclaimerAccepted(accepted);
  };

  const handleAccept = async () => {
    if (!canProceed) {
      Alert.alert(
        'Almost There!',
        'Please review and accept all agreements to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

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

      // Navigate to signup success as step 5 of 5
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

  const showTermsSummary = () => {
    setShowModal({
      visible: true,
      title: 'Terms of Service Summary',
      content: `📄 Terms of Service Summary

✓ Use GarageLedger to track your vehicle maintenance
✓ Your data belongs to you - export anytime
✓ We provide tracking tools, not professional advice
⚠️ Always consult your owner's manual for official schedules
⚠️ You're responsible for all maintenance decisions

Key Points:
• GarageLedger is a SOFTWARE TOOL for tracking maintenance
• We do NOT provide professional automotive advice
• You assume ALL RISKS for maintenance decisions
• Always consult qualified professionals for safety-critical work
• Our liability is limited to subscription fees paid`,
    });
  };

  const showPrivacySummary = () => {
    setShowModal({
      visible: true,
      title: 'Privacy Policy Summary',
      content: `🔒 Privacy Policy Summary

✓ We collect: Vehicle info, maintenance records, photos
✓ We use data to: Provide app features, sync your data
✓ We don't: Sell your data or use it for ads
✓ You control: Export, delete, or modify your data anytime
✓ Security: Data encrypted and stored securely

Your Rights:
• Access your data anytime
• Export all data in standard formats
• Delete your account and all data
• Control what information you share
• Update your preferences anytime`,
    });
  };

  const showMaintenanceDisclaimer = () => {
    setShowModal({
      visible: true,
      title: 'Important Maintenance Disclaimer',
      content: `⚠️ Important Maintenance Disclaimer

This app helps you TRACK maintenance - it doesn't provide professional automotive advice.

CRITICAL: Always check your owner's manual and consult qualified mechanics for:
• Official maintenance schedules
• Safety-critical decisions
• Warranty requirements
• Technical procedures

You are responsible for all maintenance choices.

GarageLedger provides tracking tools only. We make no warranties about maintenance information accuracy. Always prioritize official manufacturer guidance over app suggestions.`,
    });
  };

  const handleBack = () => {
    navigation.goBack();
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
          { paddingTop: Math.max(insets.top + theme.spacing.xl, theme.spacing['4xl']) }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <OnboardingProgressIndicator currentStep={2} totalSteps={2} />

        <View style={styles.header}>
          <Typography variant="title" style={styles.title}>
            Data Consents
          </Typography>
        </View>

        {/* Friendly summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Typography variant="body" style={styles.summaryIcon}>✓</Typography>
            <Typography variant="body" style={styles.summaryText}>
              Your data is encrypted, secure, and stays yours – export anytime
            </Typography>
          </View>
          
          <View style={styles.summaryItem}>
            <Typography variant="body" style={styles.summaryIcon}>✓</Typography>
            <Typography variant="body" style={styles.summaryText}>
              We don't sell your personal or vehicle data
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
              You can review these documents anytime in Settings
            </Typography>
          </View>
        </Card>

        {/* Accept All card */}
        <Card style={styles.agreementCard}>
          <View style={styles.agreementRow}>
            <Typography variant="body" style={styles.agreementText}>
              Accept All
            </Typography>
            <View style={[styles.radioToggle, allAccepted ? styles.radioToggleActive : null]}>
              <Button
                title=""
                onPress={() => handleAcceptAll(!allAccepted)}
                variant="text"
                style={StyleSheet.flatten([styles.radioButton, allAccepted && styles.radioButtonActive])}
                testID="accept-all-toggle"
              />
            </View>
          </View>
        </Card>

        {/* Individual agreement cards */}
        <Card style={styles.agreementCard}>
          <View style={styles.agreementRow}>
            <Typography variant="body" style={styles.agreementText}>
              I agree to Terms of Service
            </Typography>
            <View style={[styles.radioToggle, termsAccepted ? styles.radioToggleActive : null]}>
              <Button
                title=""
                onPress={() => setTermsAccepted(!termsAccepted)}
                variant="text"
                style={StyleSheet.flatten([styles.radioButton, termsAccepted && styles.radioButtonActive])}
                testID="terms-toggle"
              />
            </View>
          </View>
          <View style={styles.documentLinks}>
            <Button
              title="View Summary"
              onPress={showTermsSummary}
              variant="text"
              style={styles.documentLink}
            />
          </View>
        </Card>

        <Card style={styles.agreementCard}>
          <View style={styles.agreementRow}>
            <Typography variant="body" style={styles.agreementText}>
              I agree to the Privacy Policy
            </Typography>
            <View style={[styles.radioToggle, privacyAccepted ? styles.radioToggleActive : null]}>
              <Button
                title=""
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
                variant="text"
                style={StyleSheet.flatten([styles.radioButton, privacyAccepted && styles.radioButtonActive])}
                testID="privacy-toggle"
              />
            </View>
          </View>
          <View style={styles.documentLinks}>
            <Button
              title="View Summary"
              onPress={showPrivacySummary}
              variant="text"
              style={styles.documentLink}
            />
          </View>
        </Card>

        <Card style={styles.agreementCard}>
          <View style={styles.agreementRow}>
            <Typography variant="body" style={styles.agreementText}>
              I understand the Maintenance Disclaimer
            </Typography>
            <View style={[styles.radioToggle, maintenanceDisclaimerAccepted ? styles.radioToggleActive : null]}>
              <Button
                title=""
                onPress={() => setMaintenanceDisclaimerAccepted(!maintenanceDisclaimerAccepted)}
                variant="text"
                style={StyleSheet.flatten([styles.radioButton, maintenanceDisclaimerAccepted && styles.radioButtonActive])}
                testID="disclaimer-toggle"
              />
            </View>
          </View>
          <View style={styles.documentLinks}>
            <Button
              title="View Summary"
              onPress={showMaintenanceDisclaimer}
              variant="text"
              style={styles.documentLink}
            />
          </View>
        </Card>

        <View style={styles.buttons}>
          <Button
            title="I Understand & Continue"
            onPress={handleAccept}
            disabled={!canProceed || isLoading}
            style={!canProceed ? {...styles.acceptButton, ...styles.acceptButtonDisabled} : styles.acceptButton}
            textStyle={styles.acceptButtonText}
            testID="accept-continue-button"
          />

        </View>
      </ScrollView>

      <DocumentModal
        visible={showModal.visible}
        onClose={() => setShowModal({ visible: false, title: '', content: '' })}
        title={showModal.title}
        content={showModal.content}
      />
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
  settingsReviewText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  agreementCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  agreementText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
  },
  radioToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.borderLight,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  radioToggleActive: {
    backgroundColor: theme.colors.primary,
    alignItems: 'flex-end',
  },
  radioButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surface,
    minHeight: 26,
    padding: 0,
    margin: 0,
    ...theme.shadows.sm,
  },
  radioButtonActive: {
    backgroundColor: theme.colors.surface,
  },
  documentLinks: {
    flexDirection: 'row',
    paddingLeft: 0,
  },
  documentLink: {
    marginRight: theme.spacing.md,
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.xs,
  },
  buttons: {
    alignItems: 'center',
  },
  acceptButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  acceptButtonText: {
    textAlign: 'center',
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  footerText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  modalCloseButton: {
    paddingHorizontal: 0,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalText: {
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
});