import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../utils/theme';
import { Typography } from '../common/Typography';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface CustomServiceBottomSheetProps {
  isVisible: boolean;
  onServiceSaved: (serviceName: string) => void;
  onClose: () => void;
}

/**
 * Bottom sheet modal for creating custom service reminders
 * Provides guided input with validation and examples
 */
export const CustomServiceBottomSheet: React.FC<CustomServiceBottomSheetProps> = ({
  isVisible,
  onServiceSaved,
  onClose,
}) => {
  const { t } = useTranslation();
  const [serviceName, setServiceName] = useState('');
  const [error, setError] = useState('');
  
  const bottomSheetTranslateY = useRef(new Animated.Value(0)).current;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setServiceName('');
      setError('');
    }
  }, [isVisible]);

  // Validation logic
  const validateServiceName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return t('programs.customService.errorRequired', 'Service name is required');
    }
    
    if (trimmedName.length < 3) {
      return t('programs.customService.errorTooShort', 'Service name must be at least 3 characters');
    }
    
    if (trimmedName.length > 50) {
      return t('programs.customService.errorTooLong', 'Service name must be 50 characters or less');
    }
    
    // Check for invalid characters (basic validation)
    if (!/^[a-zA-Z0-9\s\-&().]+$/.test(trimmedName)) {
      return t('programs.customService.errorInvalidChars', 'Service name contains invalid characters');
    }
    
    return null;
  };

  const handleServiceNameChange = (text: string) => {
    setServiceName(text);
    setError('');
  };

  const handleSave = () => {
    const validationError = validateServiceName(serviceName);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Save the service name
    onServiceSaved(serviceName.trim());
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Service name examples
  const serviceExamples = [
    'State Inspection',
    'Smog Check', 
    'DEF Fluid Top-off',
    'Winter Prep',
    'Pre-trip Inspection'
  ];

  const handleExamplePress = (example: string) => {
    setServiceName(example);
    setError('');
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={bottomSheetStyles.overlay}>
        <TouchableOpacity 
          style={bottomSheetStyles.backdrop} 
          onPress={handleCancel}
          activeOpacity={1}
        />
        
        <Animated.View 
          style={[
            bottomSheetStyles.bottomSheet,
            { transform: [{ translateY: bottomSheetTranslateY }] }
          ]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => Keyboard.dismiss()}
        >
          {/* Handle */}
          <View style={bottomSheetStyles.handle} />
          
          <View style={bottomSheetStyles.content}>
            {/* Header */}
            <View style={bottomSheetStyles.header}>
              <Typography variant="title" style={bottomSheetStyles.title}>
                {t('programs.customService.title', 'Custom Service Reminder')}
              </Typography>
              <Typography variant="caption" style={bottomSheetStyles.category}>
                {t('programs.customService.subtitle', 'Add your own maintenance reminder')}
              </Typography>
            </View>

            {/* Service Name Input */}
            <View style={bottomSheetStyles.section}>
              <Typography variant="body" style={bottomSheetStyles.inputLabel}>
                {t('programs.customService.serviceNameLabel', 'Service Name')}
              </Typography>
              <Input
                value={serviceName}
                onChangeText={handleServiceNameChange}
                placeholder={t('programs.customService.placeholder', 'e.g., State Inspection')}
                style={StyleSheet.flatten([
                  bottomSheetStyles.serviceInput,
                  error && bottomSheetStyles.serviceInputError
                ])}
                maxLength={50}
                autoFocus
              />
              {error ? (
                <Typography variant="caption" style={bottomSheetStyles.errorText}>
                  {error}
                </Typography>
              ) : null}
            </View>

            {/* Examples Section */}
            <View style={bottomSheetStyles.section}>
              <Typography variant="body" style={bottomSheetStyles.examplesLabel}>
                {t('programs.customService.examplesLabel', 'Common Examples:')}
              </Typography>
              <View style={bottomSheetStyles.examplesContainer}>
                {serviceExamples.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={bottomSheetStyles.exampleChip}
                    onPress={() => handleExamplePress(example)}
                    activeOpacity={0.7}
                  >
                    <Typography variant="caption" style={bottomSheetStyles.exampleText}>
                      {example}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={bottomSheetStyles.actions}>
            <View style={bottomSheetStyles.mainActions}>
              <Button
                title={t('common.cancel', 'Cancel')}
                variant="outline"
                onPress={handleCancel}
                style={bottomSheetStyles.cancelButton}
              />
              <Button
                title={t('common.save', 'Save')}
                variant="primary"
                onPress={handleSave}
                style={bottomSheetStyles.saveButton}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const bottomSheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  backdrop: {
    flex: 1,
  },
  
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 20, // Extra padding for safe area
    maxHeight: '60%', // Smaller sheet since we have less content
  },
  
  handle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  
  content: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  category: {
    color: theme.colors.textSecondary,
  },
  
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  
  inputLabel: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  serviceInput: {
    marginBottom: theme.spacing.xs,
  },
  
  serviceInputError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  
  examplesLabel: {
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  exampleChip: {
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  
  exampleText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  actions: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  
  mainActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  saveButton: {
    flex: 1,
  },
});