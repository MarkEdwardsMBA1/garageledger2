import React from 'react';
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../utils/theme';

export interface GoogleContinueButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Loading state */
  loading?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Full width button */
  fullWidth?: boolean;
  
  /** Custom button style */
  style?: ViewStyle;
  
  /** Test ID for testing */
  testID?: string;
}

/**
 * Google Continue Button Component
 * Uses official Google branding assets and follows Google's design guidelines
 * 
 * Based on Google Identity Branding Guidelines:
 * - Light theme with white background (#FFFFFF)
 * - Standard Google "G" logo colors
 * - Web padding: 12px left, 10px between logo and text, 12px right
 * - Roboto Medium font (handled by theme)
 */
export const GoogleContinueButton: React.FC<GoogleContinueButtonProps> = ({
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID = 'google-continue-button',
  onPress,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (!loading && !disabled && onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel="Continue with Google"
      accessibilityHint="Sign in using your Google account"
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Image
        source={require('../../../assets/icons/google-continue-light.png')}
        style={styles.buttonImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    // Google's official button dimensions and styling
    height: 48, // Standard button height matching our theme
    borderRadius: 24, // Pill-shaped as per Google guidelines
    backgroundColor: '#FFFFFF', // Google's light theme background
    borderWidth: 1,
    borderColor: '#747775', // Google's light theme border color
    
    // Center the image
    justifyContent: 'center',
    alignItems: 'center',
    
    // Accessibility
    minHeight: 48, // WCAG minimum touch target
    
    // Shadow for depth (subtle)
    ...theme.shadows.xs,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  buttonImage: {
    // Google button image should fill the entire button area
    width: '100%',
    height: '100%',
  },
  
  disabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
});