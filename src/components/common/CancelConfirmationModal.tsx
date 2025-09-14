// Simple, reusable cancel confirmation modal
import React from 'react';
import { Alert } from 'react-native';

interface CancelConfirmationModalProps {
  /** Show the confirmation dialog */
  onCancel: () => void;
  /** Optional custom title - defaults to "Cancel Service Logging?" */
  title?: string;
  /** Optional custom message - defaults to "Any changes will be lost." */
  message?: string;
}

/**
 * Simple, reusable cancel confirmation using native Alert
 * 
 * Replaces complex multi-step cancel flows with single, clear confirmation
 * Following standard UX patterns with simple Yes/No buttons
 */
export const showCancelConfirmation = ({
  onCancel,
  title = "Cancel Service Logging?",
  message = "Any changes will be lost."
}: CancelConfirmationModalProps) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'No',
        style: 'cancel'
      },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: onCancel
      }
    ],
    { cancelable: false }
  );
};

export default showCancelConfirmation;