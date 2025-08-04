import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { theme } from '../utils/theme';
import { LanguageUtils } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const currentLanguage = i18n.language;
  const isSpanish = currentLanguage === 'es';

  // Redirect authenticated users to main app
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('MainApp');
    }
  }, [isAuthenticated, navigation]);

  const handleLanguageToggle = async () => {
    setIsChangingLanguage(true);
    try {
      const newLanguage = isSpanish ? 'en' : 'es';
      await LanguageUtils.changeLanguage(newLanguage);
    } catch (error) {
      console.warn('Failed to change language:', error);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Language Toggle */}
      <View style={styles.languageToggle}>
        <Button
          title={isSpanish ? 'English' : 'Español'}
          variant="text"
          onPress={handleLanguageToggle}
          disabled={isChangingLanguage}
          style={styles.languageButton}
        />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + theme.spacing.xl, theme.spacing['4xl']) }
        ]}
      >
        {/* Logo and Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logos/garageledger_logo_transparent.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Typography variant="title" style={styles.title}>
            GarageLedger
          </Typography>
          <Typography variant="heading" style={styles.subtitle}>
            {t('welcome.tagline', 'Your Digital Garage Logbook')}
          </Typography>
        </View>

        {/* Value Propositions */}
        <View style={styles.valueProps}>
          <View style={styles.valueProp}>
            <Typography variant="body" style={styles.valueIcon}>🚗</Typography>
            <Typography variant="body" style={styles.valueText}>
              {t('welcome.trackVehicles', 'Track maintenance, mods & costs — stay in the driver\'s seat')}
            </Typography>
          </View>
          
          <View style={styles.valueProp}>
            <Typography variant="body" style={styles.valueIcon}>🔧</Typography>
            <Typography variant="body" style={styles.valueText}>
              {t('welcome.neverForget', 'Never forget an oil change again')}
            </Typography>
          </View>
          
          <View style={styles.valueProp}>
            <Typography variant="body" style={styles.valueIcon}>📱</Typography>
            <Typography variant="body" style={styles.valueText}>
              {t('welcome.ownData', 'Your data stays yours — complete ownership and export')}
            </Typography>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.actions}>
          <Button
            title={t('welcome.getStarted', 'Get Started')}
            variant="primary"
            onPress={handleGetStarted}
            style={styles.primaryButton}
          />
          
          <View style={styles.signInRow}>
            <Typography variant="body" style={styles.signInText}>
              {t('welcome.alreadyHaveAccount', 'Already have an account?')}
            </Typography>
            <Button
              title={t('welcome.signIn', 'Sign In')}
              variant="text"
              onPress={handleSignIn}
              style={styles.signInButton}
            />
          </View>
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
  languageToggle: {
    position: 'absolute',
    top: 60, // Account for status bar
    right: theme.spacing.lg,
    zIndex: 1,
  },
  languageButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
  },
  valueProps: {
    marginBottom: theme.spacing['4xl'],
  },
  valueProp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  valueIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing.md,
    width: 32,
    textAlign: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
  primaryButton: {
    marginBottom: theme.spacing.lg,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  signInButton: {
    paddingHorizontal: theme.spacing.xs,
  },
});

export default WelcomeScreen;