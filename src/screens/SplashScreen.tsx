import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { theme } from '../utils/theme';

interface SplashScreenProps {
  onComplete: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const initializeApp = async () => {
      const MINIMUM_DURATION = 1500; // Minimum 1.5 seconds for branding
      
      try {
        // Simulate initialization work
        await new Promise(resolve => setTimeout(resolve, MINIMUM_DURATION));
        onComplete();
      } catch (error) {
        console.warn('Error during splash initialization:', error);
        setTimeout(() => {
          onComplete();
        }, MINIMUM_DURATION);
      }
    };

    initializeApp();
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.textLight} />
      <LinearGradient
        colors={[
          theme.colors.textLight,     // Chrome Silver at top (lighter for logo contrast)
          theme.colors.luxury,        // Titanium Gray middle
          '#1f2937',                  // Dark Titanium Gray at bottom (darker for depth)
        ]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logos/garageledger_logo_transparent.png')} 
              style={styles.logo}
              resizeMode="contain"
              accessible={true}
              accessibilityLabel="GarageLedger logo"
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text 
              style={styles.wordmark}
              accessible={true}
              accessibilityRole="text"
              maxFontSizeMultiplier={1.2}
            >
              GarageLedger
            </Text>
            <Text 
              style={styles.tagline}
              accessible={true}
              accessibilityRole="text"
              maxFontSizeMultiplier={1.1}
            >
              {t('splash.tagline', "Track your car's life")}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: Math.min(screenWidth * 0.4, 160), // Responsive logo size, max 160px
    height: Math.min(screenWidth * 0.4, 160),
    marginBottom: theme.spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: Math.min(screenWidth * 0.08, theme.typography.fontSize['3xl']), // Responsive font size
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.surface, // White for contrast against gradient
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.4)', // Darker shadow for better contrast on gray
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: Math.min(screenWidth * 0.04, theme.typography.fontSize.lg), // Responsive tagline size
    fontWeight: theme.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.wide,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Darker shadow for tagline too
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;