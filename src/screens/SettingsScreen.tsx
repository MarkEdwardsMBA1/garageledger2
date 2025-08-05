// Settings screen for app configuration and user preferences
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';
import { Card } from '../components/common/Card';
import { LanguageUtils, AVAILABLE_LANGUAGES, SupportedLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
}

/**
 * Settings screen - app configuration and preferences
 * Includes language, notifications, data management, etc.
 */
const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

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
          icon: '🌐',
          onPress: handleLanguageToggle,
        },
        {
          id: 'notifications',
          title: t('settings.notifications', 'Notifications'),
          subtitle: t('settings.notificationsDesc', 'Maintenance reminders'),
          icon: '🔔',
          onPress: () => console.log('Navigate to notifications settings'),
        },
        {
          id: 'units',
          title: t('settings.units', 'Units'),
          subtitle: t('settings.unitsDesc', 'Miles, kilometers, etc.'),
          icon: '📏',
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
          icon: '☁️',
          onPress: () => console.log('Navigate to backup settings'),
        },
        {
          id: 'export',
          title: t('settings.export', 'Export Data'),
          subtitle: t('settings.exportDesc', 'Download your data'),
          icon: '📤',
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
          icon: '❓',
          onPress: () => console.log('Navigate to help'),
        },
        {
          id: 'feedback',
          title: t('settings.feedback', 'Send Feedback'),
          subtitle: t('settings.feedbackDesc', 'Report issues or suggestions'),
          icon: '💬',
          onPress: () => console.log('Send feedback'),
        },
        {
          id: 'about',
          title: t('settings.about', 'About'),
          subtitle: 'GarageLedger v1.0.0',
          icon: 'ℹ️',
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
        <Text style={styles.settingIconText}>{item.icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <View style={styles.settingArrow}>
        <Text style={styles.settingArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.displayName || t('settings.user', 'User')}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || t('settings.notSignedIn', 'Not signed in')}
            </Text>
            {user && !user.emailVerified && (
              <View style={styles.emailVerificationSection}>
                <Text style={styles.emailNotVerified}>
                  ⚠️ Email not verified
                </Text>
                <Text style={styles.emailVerificationText}>
                  Verify your email to secure your account and enable password recovery.
                </Text>
                <TouchableOpacity 
                  style={styles.verifyEmailButton}
                  onPress={handleSendVerification}
                >
                  <Text style={styles.verifyEmailButtonText}>
                    📧 Send Verification Email
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {!user && (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => console.log('Navigate to sign in')}
            >
              <Text style={styles.signInButtonText}>
                {t('settings.signIn', 'Sign In')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Settings Sections */}
      {settingSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={styles.sectionCard}>
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

      {/* Sign Out at bottom - only show if user is signed in */}
      {user && (
        <View style={styles.signOutSection}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>
              {t('settings.signOut', 'Sign Out')}
            </Text>
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
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emailVerificationSection: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary || '#fef3c7',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning || '#f59e0b',
  },
  emailNotVerified: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning || '#f59e0b',
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  emailVerificationText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.xs,
  },
  verifyEmailButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  verifyEmailButtonText: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
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
  signOutText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  signInButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.surface,
  },

  // Settings sections
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  settingArrow: {
    marginLeft: theme.spacing.md,
  },
  settingArrowText: {
    fontSize: 20,
    color: theme.colors.textLight,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: theme.spacing.lg + 32 + theme.spacing.md, // Align with content
  },

});

export default SettingsScreen;