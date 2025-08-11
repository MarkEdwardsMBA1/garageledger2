import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { OnboardingStep1Screen } from './OnboardingStep1Screen';
import { OnboardingStep2Screen } from './OnboardingStep2Screen';
import { OnboardingStep3Screen } from './OnboardingStep3Screen';
import { theme } from '../utils/theme';

interface OnboardingFlowProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const OnboardingFlowScreen: React.FC<OnboardingFlowProps> = ({
  navigation,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleComplete = () => {
    // Navigate to signup success after value proposition
    navigation.navigate('SignUpSuccess' as never);
  };

  const handleSkip = () => {
    // Skip to signup success
    navigation.navigate('SignUpSuccess' as never);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Animate to next screen
      Animated.timing(translateX, {
        toValue: -nextStep * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Animate to previous screen
      Animated.timing(translateX, {
        toValue: -prevStep * screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.screensContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Screen 1: Your Car's Digital Memory */}
        <View style={styles.screen}>
          <OnboardingStep1Screen
            navigation={navigation}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        </View>
        
        {/* Screen 2: Stay on Top of Maintenance */}
        <View style={styles.screen}>
          <OnboardingStep2Screen
            navigation={navigation}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        </View>
        
        {/* Screen 3: Your Data, Your Rules */}
        <View style={styles.screen}>
          <OnboardingStep3Screen
            navigation={navigation}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screensContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * 3, // 3 screens side by side
  },
  screen: {
    width: screenWidth,
    flex: 1,
  },
});

export default OnboardingFlowScreen;