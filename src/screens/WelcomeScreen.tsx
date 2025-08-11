import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Typography } from '../components/common/Typography';
import { VehicleIcon, MaintenanceIcon, MobileIcon, ChevronRightIcon } from '../components/icons';
import { theme } from '../utils/theme';
import { LanguageUtils } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

interface WelcomeScreenProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375; // iPhone SE size
const isMediumScreen = screenWidth < 414; // iPhone 11 Pro size

// AsyncStorage keys
const WELCOME_COMPLETED_KEY = '@GarageLedger:welcome_completed';

// Helper functions for welcome screen storage
const markWelcomeCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
  } catch (error) {
    console.warn('Failed to mark welcome as completed:', error);
  }
};

const isWelcomeCompleted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(WELCOME_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('Failed to check welcome completion status:', error);
    return false;
  }
};

// Helper function to render text with bold keywords
const renderTextWithBoldKeywords = (text: string, boldWords: string[], baseStyle: any) => {
  if (boldWords.length === 0) {
    return <Text style={baseStyle}>{text}</Text>;
  }
  
  // Create regex pattern to match any of the bold words (case insensitive)
  const pattern = new RegExp(`\\b(${boldWords.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);
  
  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        const isBold = boldWords.some(word => word.toLowerCase() === part.toLowerCase());
        return (
          <Text 
            key={index} 
            style={isBold ? { ...baseStyle, fontWeight: theme.typography.fontWeight.bold } : baseStyle}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const currentLanguage = i18n.language;
  const isSpanish = currentLanguage === 'es';

  // Check welcome completion status and redirect accordingly
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (isAuthenticated) {
        // Authenticated users go directly to main app
        navigation.navigate('MainApp');
      } else {
        // For non-authenticated users, check if they've completed welcome
        const welcomeCompleted = await isWelcomeCompleted();
        if (welcomeCompleted) {
          // If welcome was completed before, go directly to login
          navigation.navigate('Login');
        }
        // If welcome not completed, stay on this screen
      }
    };

    checkWelcomeStatus();
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

  const handleGetStarted = async () => {
    await markWelcomeCompleted();
    navigation.navigate('GoalsSetup' as never);
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      

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
            accessible={true}
            accessibilityLabel={t('common.appName', 'GarageLedger logo')}
          />
          <Typography 
            variant="display" 
            style={[styles.title, { color: theme.colors.primary }]}
            accessible={true}
            accessibilityRole="header"
          >
            GarageLedger
          </Typography>
          <Typography 
            variant="subheading" 
            style={styles.subtitle}
            accessible={true}
            accessibilityRole="text"
          >
            {t('welcome.tagline', 'Your Digital Garage Logbook')}
          </Typography>
        </View>

        {/* Value Propositions */}
        <View style={styles.valueProps}>
          <View style={styles.valueProp}>
            <View style={styles.iconContainer}>
              <VehicleIcon size={32} color={theme.colors.primary} />
            </View>
            <View 
              accessible={true}
              accessibilityRole="text"
            >
              {renderTextWithBoldKeywords(
                t('welcome.trackVehicles', 'Track maintenance, mods & costs — stay in the driver\'s seat'),
                ['Track', 'Rastrea'], // English and Spanish keywords
                styles.valueText
              )}
            </View>
          </View>
          
          <View style={styles.valueProp}>
            <View style={styles.iconContainer}>
              <MaintenanceIcon size={32} color={theme.colors.primary} />
            </View>
            <View 
              accessible={true}
              accessibilityRole="text"
            >
              {renderTextWithBoldKeywords(
                t('welcome.neverForget', 'Never forget an oil change again'),
                ['Never forget', 'Nunca olvides'], // English and Spanish keywords
                styles.valueText
              )}
            </View>
          </View>
          
          <View style={styles.valueProp}>
            <View style={styles.iconContainer}>
              <MobileIcon size={32} color={theme.colors.primary} />
            </View>
            <View 
              accessible={true}
              accessibilityRole="text"
            >
              {renderTextWithBoldKeywords(
                t('welcome.ownData', 'Your data stays yours — complete ownership and export'),
                ['Your data stays yours', 'Tus datos son tuyos'], // English and Spanish keywords
                styles.valueText
              )}
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.actions}>
          <Button
            title={t('welcome.getStarted', 'Get Started')}
            variant="primary"
            onPress={handleGetStarted}
            style={styles.primaryButton}
            icon={<ChevronRightIcon size={18} color={theme.colors.surface} />}
            iconPosition="right"
            accessible={true}
            accessibilityLabel={t('welcome.getStarted', 'Get Started') + '. ' + t('common.continueToSetup', 'Continue to setup')}
            accessibilityHint={t('common.navigateToNextScreen', 'Navigate to the next screen')}
          />
          
          <View style={styles.signInRow}>
            <Typography variant="bodySmall" style={styles.signInText}>
              {t('welcome.alreadyHaveAccount', 'Already have an account?')}
            </Typography>
            <Button
              title={t('welcome.signIn', 'Sign In')}
              variant="text"
              onPress={handleSignIn}
              style={styles.signInButton}
              accessible={true}
              accessibilityLabel={t('welcome.signIn', 'Sign In')}
              accessibilityHint={t('common.signInToExistingAccount', 'Sign in to your existing account')}
            />
          </View>
          
          {/* Language Toggle - Moved to bottom for less prominence */}
          <View style={styles.languageSection}>
            <Typography variant="caption" style={styles.languageLabel}>
              {t('welcome.language', 'Language')}: {isSpanish ? 'Español' : 'English'}
            </Typography>
            <Button
              title={t('welcome.switchLanguage', { language: isSpanish ? 'English' : 'Español' })}
              variant="text"
              onPress={handleLanguageToggle}
              disabled={isChangingLanguage}
              style={styles.languageButton}
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
  languageSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  languageLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  languageButton: {
    paddingHorizontal: theme.spacing.xs,
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
    width: isSmallScreen ? 80 : isMediumScreen ? 90 : 100,
    height: isSmallScreen ? 80 : isMediumScreen ? 90 : 100,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: isSmallScreen ? theme.typography.fontSize['2xl'] : isMediumScreen ? theme.typography.fontSize['3xl'] : theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.luxury, // Titanium Gray for premium feel
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
  iconContainer: {
    marginRight: theme.spacing.md,
    width: 40, // Increased from 32 to accommodate larger icons
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: theme.spacing.md, // Increased from xs to md for better tap area
    paddingVertical: theme.spacing.sm,   // Added vertical padding for better accessibility
    minWidth: 80,                        // Ensure minimum tap target size
    minHeight: 44,                       // WCAG AA minimum tap target size
  },
});

export default WelcomeScreen;