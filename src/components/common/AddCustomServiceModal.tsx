// Add Custom Service Modal
// Simple, focused modal for adding custom service names without keyboard conflicts

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { Typography } from './Typography';
import { Input } from './Input';
import { Button } from './Button';

interface AddCustomServiceModalProps {
  visible: boolean;
  onSave: (serviceName: string) => void;
  onCancel: () => void;
}

/**
 * AddCustomServiceModal - Dedicated modal for custom service input
 * 
 * Features:
 * - Clean, focused UI for service name input
 * - Automatic keyboard handling (no conflicts)
 * - Input validation
 * - Safe area support
 */
export const AddCustomServiceModal: React.FC<AddCustomServiceModalProps> = ({
  visible,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  const [serviceName, setServiceName] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setServiceName('');
      setError('');
    }
  }, [visible]);

  // Validation function
  const validateServiceName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Service name is required';
    }
    
    if (trimmedName.length < 3) {
      return 'Service name must be at least 3 characters';
    }
    
    if (trimmedName.length > 50) {
      return 'Service name must be 50 characters or less';
    }
    
    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\-&().]+$/.test(trimmedName)) {
      return 'Service name contains invalid characters';
    }
    
    return null;
  };

  // Handle save
  const handleSave = () => {
    const validationError = validateServiceName(serviceName);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onSave(serviceName.trim());
  };

  // Handle cancel
  const handleCancel = () => {
    setServiceName('');
    setError('');
    onCancel();
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    setServiceName(text);
    if (error) {
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Button
              title={t('common.cancel', 'Cancel')}
              variant="text"
              onPress={handleCancel}
            />
          </View>
          <Typography variant="heading" style={styles.title}>
            Add a Custom Service
          </Typography>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Input
              label="Service Name"
              value={serviceName}
              onChangeText={handleTextChange}
              placeholder="e.g., State Inspection, Custom Check"
              maxLength={50}
              autoFocus
              error={error}
            />
            
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={[styles.bottomButtons, { paddingBottom: insets.bottom }]}>
          <Button
            title={t('common.cancel', 'Cancel')}
            variant="outline"
            onPress={handleCancel}
            style={styles.bottomButton}
          />
          <Button
            title="Next"
            variant="primary"
            onPress={handleSave}
            disabled={!serviceName.trim()}
            style={styles.bottomButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },

  headerRight: {
    flex: 1,
  },

  title: {
    color: theme.colors.surface,
    flex: 2,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
  },

  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },

  inputSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg, // Reduce space above buttons
  },


  hint: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs, // Bring closer to input field
    textAlign: 'left',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },

  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm, // Reduce button area height
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  bottomButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
});

export default AddCustomServiceModal;