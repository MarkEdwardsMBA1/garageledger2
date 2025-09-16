// Input component with validation, labels, and error states
import React, { useState, forwardRef, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  
  /** Error message to display */
  error?: string;
  
  /** Helper text to display below input */
  helperText?: string;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Input variant */
  variant?: 'default' | 'outlined' | 'filled';
  
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Container style */
  containerStyle?: ViewStyle;
  
  /** Input style */
  inputStyle?: TextStyle;
  
  /** Label style */
  labelStyle?: TextStyle;
  
  /** Left icon component */
  leftIcon?: React.ReactNode;
  
  /** Right icon component */
  rightIcon?: React.ReactNode;
  
  /** Show/hide password toggle (for password inputs) */
  showPasswordToggle?: boolean;
  
  /** Custom validation function */
  validate?: (value: string) => string | null;
  
  /** Callback when validation state changes */
  onValidationChange?: (isValid: boolean, error?: string) => void;
  
  /** Custom style (alias for containerStyle) */
  style?: ViewStyle;
}

/**
 * Reusable Input component with validation and error states
 * Supports labels, icons, and bilingual error messages
 */
export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  required = false,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  validate,
  onValidationChange,
  value,
  onChangeText,
  secureTextEntry,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const hasError = !!(error || internalError);
  const isSecure = secureTextEntry && !isPasswordVisible;

  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }

    // Run validation
    if (validate) {
      const validationError = validate(text);
      setInternalError(validationError);
      
      if (onValidationChange) {
        onValidationChange(!validationError, validationError || undefined);
      }
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const focusInput = () => {
    if (!disabled) {
      if (ref && 'current' in ref) {
        ref.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  };

  const containerStyles = [
    styles.container,
    containerStyle,
    style, // Allow style prop as alias for containerStyle
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    hasError && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyles = [
    styles.input,
    styles[`${size}Input`],
    disabled && styles.disabledInput,
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    styles[`${size}Label`],
    hasError && styles.errorLabel,
    disabled && styles.disabledLabel,
    labelStyle,
  ];

  const currentError = error || internalError;

  return (
    <View style={containerStyles}>
      {label && (
        <Typography variant="label" style={labelStyles}>
          {label}
        </Typography>
      )}
      
      <TouchableWithoutFeedback onPress={focusInput}>
        <View style={inputContainerStyles}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}
          
          <TextInput
            ref={ref || inputRef}
            style={textInputStyles}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isSecure}
            editable={!disabled}
            placeholderTextColor={theme.colors.textLight}
            {...props}
          />
          
          {(rightIcon || showPasswordToggle) && (
            <View style={styles.rightIconContainer}>
              {showPasswordToggle && secureTextEntry ? (
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Typography variant="body" style={styles.passwordToggle}>
                    {isPasswordVisible ? '🙈' : '👁️'}
                  </Typography>
                </TouchableOpacity>
              ) : (
                rightIcon
              )}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      
      {(currentError || helperText) && (
        <View style={styles.messageContainer}>
          <Typography variant="bodySmall" style={[
            styles.message,
            currentError ? styles.errorMessage : styles.helperMessage
          ]}>
            {currentError || helperText}
          </Typography>
        </View>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },

  // Label styles - Uses Typography variant="label" with size customization
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  smLabel: {
    fontSize: theme.typography.fontSize.sm,
  },
  mdLabel: {
    fontSize: theme.typography.fontSize.base,
  },
  lgLabel: {
    fontSize: theme.typography.fontSize.lg,
  },
  errorLabel: {
    color: theme.colors.error,
  },
  disabledLabel: {
    color: theme.colors.textLight,
  },

  // Input container styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.components.input.borderRadius,
    borderWidth: theme.components.input.borderWidth,
  },

  // Variant styles
  default: {
    borderColor: 'transparent',
    backgroundColor: theme.colors.surface,
  },
  outlined: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filled: {
    borderColor: 'transparent',
    backgroundColor: theme.colors.borderLight,
  },

  // Size styles
  sm: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  md: {
    minHeight: theme.components.input.height,
    paddingHorizontal: theme.components.input.paddingHorizontal,
    paddingVertical: theme.spacing.sm,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  // State styles
  focused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    ...theme.shadows.sm,
  },
  error: {
    borderColor: theme.colors.error,
  },
  disabled: {
    backgroundColor: theme.colors.borderLight,
    borderColor: theme.colors.borderLight,
  },

  // Input styles - Typography handled by TextInput native styling
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs, // Better touch target
    minHeight: 20, // Ensure minimum touch area
    letterSpacing: theme.typography.letterSpacing.normal,
  },
  smInput: {
    fontSize: theme.typography.fontSize.sm,
  },
  mdInput: {
    fontSize: theme.components.input.fontSize,
  },
  lgInput: {
    fontSize: theme.typography.fontSize.lg,
  },
  disabledInput: {
    color: theme.colors.textLight,
  },

  // Icon styles
  leftIconContainer: {
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordToggle: {
    padding: theme.spacing.xs,
  },

  // Message styles
  messageContainer: {
    marginTop: theme.spacing.xs,
  },
  message: {
    // Font handled by Typography component
  },
  errorMessage: {
    color: theme.colors.error,
  },
  helperMessage: {
    color: theme.colors.textSecondary,
  },
});

export default Input;