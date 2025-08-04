import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  StatusBar,
} from 'react-native';
import { theme } from '../utils/theme';
// TEMP: removed i18n import

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // TEMP: removed language initialization
        
        // Show branded splash for 1 second (branding + future i18n preparation)
        setTimeout(() => {
          onComplete();
        }, 1000);
      } catch (error) {
        console.warn('Error during splash initialization:', error);
        // Still proceed after timeout even if language init fails
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };

    initializeApp();
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <View style={styles.content}>
        <Image 
          source={require('../../assets/GarageLedger Logo 4 Transparent.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>GarageLedger</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b', // Dark gray for better contrast with blue text
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.md, // Space between logo and wordmark
  },
  wordmark: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize['2xl'], // 24px
    fontWeight: theme.typography.fontWeight.bold,
    color: '#2563eb', // Blue color as specified
    textAlign: 'center',
    letterSpacing: 0.5, // Subtle letter spacing for professional look
  },
});

export default SplashScreen;