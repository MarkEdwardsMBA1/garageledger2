// Settings screen for app configuration and user preferences
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { Typography } from '../components/common/Typography';
import { LanguageUtils, AVAILABLE_LANGUAGES, SupportedLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';
import {
  GlobeIcon,
  NotificationsIcon,
  RulerIcon,
  CloudIcon,
  ExportIcon,
  HelpIcon,
  FeedbackIcon,
  InfoIcon
} from '../components/icons';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  IconComponent: React.FC<{ size?: number; color?: string }>;
  onPress: () => void;
}

/**
 * Settings screen - app configuration and preferences
 * Includes language, notifications, data management, etc.
 */
const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, refreshUser } = useAuth();

  // Automatically refresh user data when screen comes into focus
  // This helps catch email verification that happened in a browser
  useFocusEffect(
    React.useCallback(() => {
      if (user && !user.emailVerified) {
        refreshUser();
      }
    }, [user?.emailVerified, refreshUser])
  );

  const handleLanguageToggle = async () => {
    try {
      const currentLang = LanguageUtils.getCurrentLanguage();
      const newLanguage: SupportedLanguage = currentLang === 'en' ? 'es' : 'en';
      
      await LanguageUtils.changeLanguage(newLanguage);
      
      // Show success message in the new language
      const newLangName = AVAILABLE_LANGUAGES[newLanguage].name;
      Alert.alert(
        newLanguage === 'es' ? '🌍 Idioma Cambiado' : '🌍 Language Changed',
        newLanguage === 'es' 
          ? `El idioma se cambió a ${newLangName} exitosamente.`
          : `Language successfully changed to ${newLangName}.`,
        [{ text: newLanguage === 'es' ? 'Perfecto' : 'Great' }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error', 'Error'),
        'Failed to change language. Please try again.',
        [{ text: t('common.ok', 'OK') }]
      );
    }
  };

  const handleSendVerification = async () => {
    try {
      await authService.sendEmailVerification();
      Alert.alert(
        '📧 Verification Email Sent!',
        'Check your email inbox for the verification link. Don\'t forget to check your spam folder!',
        [{ text: 'Got it!' }]
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to Send Verification',
        error.message || 'Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRefreshEmailVerification = async () => {
    try {
      await refreshUser();
      if (user?.emailVerified) {
        Alert.alert(
          '✅ Email Verified!',
          'Your email has been successfully verified.',
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'Email Not Yet Verified',
          'If you clicked the verification link, please wait a moment and try refreshing again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Unable to Refresh Status',
        'Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut', 'Sign Out'),
      t('settings.signOutConfirm', 'Are you sure you want to sign out?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.signOut', 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert(
                t('settings.signOutError', 'Sign Out Failed'),
                error instanceof Error ? error.message : 'An unexpected error occurred'
              );
            }
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: t('settings.preferences', 'Preferences'),
      items: [
        {
          id: 'language',
          title: t('settings.language', 'Language'),
          subtitle: AVAILABLE_LANGUAGES[LanguageUtils.getCurrentLanguage()].name,
          IconComponent: GlobeIcon,
          onPress: handleLanguageToggle,
        },
        {
          id: 'notifications',
          title: t('settings.notifications', 'Notifications'),
          subtitle: t('settings.notificationsDesc', 'Maintenance reminders'),
          IconComponent: NotificationsIcon,
          onPress: () => console.log('Navigate to notifications settings'),
        },
        {
          id: 'units',
          title: t('settings.units', 'Units'),
          subtitle: t('settings.unitsDesc', 'Miles, kilometers, etc.'),
          IconComponent: RulerIcon,
          onPress: () => console.log('Navigate to units settings'),
        },
      ],
    },
    {
      title: t('settings.data', 'Data'),
      items: [
        {
          id: 'backup',
          title: t('settings.backup', 'Backup & Sync'),
          subtitle: t('settings.backupDesc', 'Cloud backup status'),
          IconComponent: CloudIcon,
          onPress: () => console.log('Navigate to backup settings'),
        },
        {
          id: 'export',
          title: t('settings.export', 'Export Data'),
          subtitle: t('settings.exportDesc', 'Download your data'),
          IconComponent: ExportIcon,
          onPress: () => console.log('Export data'),
        },
      ],
    },
    {
      title: t('settings.support', 'Support'),
      items: [
        {
          id: 'help',
          title: t('settings.help', 'Help & FAQ'),
          subtitle: t('settings.helpDesc', 'Get help and answers'),
          IconComponent: HelpIcon,
          onPress: () => console.log('Navigate to help'),
        },
        {
          id: 'feedback',
          title: t('settings.feedback', 'Send Feedback'),
          subtitle: t('settings.feedbackDesc', 'Report issues or suggestions'),
          IconComponent: FeedbackIcon,
          onPress: () => console.log('Send feedback'),
        },
        {
          id: 'about',
          title: t('settings.about', 'About'),
          subtitle: 'GarageLedger v1.0.0',
          IconComponent: InfoIcon,
          onPress: () => console.log('Navigate to about'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <item.IconComponent size={20} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.settingContent}>
        <Typography variant="body">{item.title}</Typography>
        {item.subtitle && (
          <Typography variant="bodySmall" style={{ color: theme.colors.textSecondary }}>{item.subtitle}</Typography>
        )}
      </View>
      <View style={styles.settingArrow}>
        <Typography variant="heading" style={{ color: theme.colors.textLight }}>›</Typography>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Profile Section */}
      <Card variant="elevated" style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Typography variant="subheading">
              {user?.displayName || t('settings.user', 'User')}
            </Typography>
            <Typography variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {user?.email || t('settings.notSignedIn', 'Not signed in')}
            </Typography>
          </View>
          {!user && (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => console.log('Navigate to sign in')}
            >
              <Typography variant="button" style={{ color: theme.colors.surface }}>
                {t('settings.signIn', 'Sign In')}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Email Verification Card - only show for unverified users */}
      {user && !user.emailVerified && (
        <Card variant="elevated" style={styles.emailVerificationCard}>
          <View style={styles.emailVerificationHeader}>
            <Typography variant="heading">⚠️</Typography>
            <View style={styles.emailVerificationHeaderText}>
              <Typography variant="body" style={{ color: theme.colors.warning, marginBottom: theme.spacing.xs }}>
                Please Verify Your Email
              </Typography>
              <Typography variant="bodySmall" style={{ color: theme.colors.textSecondary }}>
                Complete your account setup
              </Typography>
            </View>
          </View>
          
          <Typography variant="bodySmall" style={{ color: theme.colors.text, lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm, marginBottom: theme.spacing.lg }}>
            Verify your email to secure your account and enable password recovery. Check your inbox for our verification email.
          </Typography>
          
          <View style={styles.emailVerificationActions}>
            <TouchableOpacity 
              style={styles.verifyEmailPrimaryButton}
              onPress={handleSendVerification}
            >
              <Typography variant="button" style={{ color: theme.colors.surface }}>
                Send Verification Email
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.verifyEmailSecondaryButton}
              onPress={handleRefreshEmailVerification}
            >
              <Typography variant="bodySmall" style={{ color: theme.colors.warning }}>
                Already verified? Check status
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Settings Sections */}
      {settingSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Typography variant="label" style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>{section.title}</Typography>
          <Card variant="elevated" style={styles.sectionCard}>
            {section.items.map((item, index) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {index < section.items.length - 1 && (
                  <View style={styles.settingDivider} />
                )}
              </View>
            ))}
          </Card>
        </View>
      ))}

      {/* Legal Documents - only show for signed-in users */}
      {user && user.emailVerified && (
        <View style={styles.section}>
          <Card variant="elevated" style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => console.log('Navigate to Terms of Service')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <Typography variant="body">Terms of Service</Typography>
              </View>
              <View style={styles.settingArrow}>
                <Typography variant="heading" style={{ color: theme.colors.textLight }}>›</Typography>
              </View>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => console.log('Navigate to Privacy Policy')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <Typography variant="body">Privacy Policy</Typography>
              </View>
              <View style={styles.settingArrow}>
                <Typography variant="heading" style={{ color: theme.colors.textLight }}>›</Typography>
              </View>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => console.log('Navigate to Maintenance Disclaimer')}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <Typography variant="body">Maintenance Disclaimer</Typography>
              </View>
              <View style={styles.settingArrow}>
                <Typography variant="heading" style={{ color: theme.colors.textLight }}>›</Typography>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      )}

      {/* Sign Out at bottom - only show if user is signed in */}
      {user && (
        <View style={styles.signOutSection}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Typography variant="body" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
              {t('settings.signOut', 'Sign Out')}
            </Typography>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },

  // Profile section
  profileCard: {
    marginBottom: theme.spacing.xl,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  profileAvatarText: {
    // Text emoji, no font styling needed
  },
  profileInfo: {
    flex: 1,
  },
  // Email Verification Card Styles
  emailVerificationCard: {
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning, // Signal Orange accent
  },
  emailVerificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emailVerificationIcon: {
    marginRight: theme.spacing.md,
  },
  emailVerificationHeaderText: {
    flex: 1,
  },
  emailVerificationActions: {
    gap: theme.spacing.sm,
  },
  verifyEmailPrimaryButton: {
    backgroundColor: theme.colors.warning, // Signal Orange
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  verifyEmailSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.warning, // Subtle Signal Orange outline
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  signInButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  // Sign out section at bottom
  signOutSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  signOutButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },

  // Settings sections
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionCard: {
    padding: 0,
  },

  // Setting items
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  settingIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingArrow: {
    marginLeft: theme.spacing.md,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: theme.spacing.lg + 32 + theme.spacing.md, // Align with content
  },

});

export default SettingsScreen;