import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  verificationPromptService, 
  VerificationContext,
  VerificationPromptState 
} from '../services/VerificationPromptService';

interface UseEmailVerificationPromptReturn {
  shouldShow: boolean;
  promptState: VerificationPromptState | null;
  canSendEmail: boolean;
  recordShown: () => Promise<void>;
  recordDismissed: () => Promise<void>;
  recordVerificationSent: () => Promise<void>;
  setUserPreference: (preference: 'remind' | 'later' | 'never') => Promise<void>;
}

/**
 * Smart hook for managing email verification prompts
 * Handles all the complexity of timing, frequency, and user preferences
 */
export const useEmailVerificationPrompt = (
  context: VerificationContext,
  enabled: boolean = true
): UseEmailVerificationPromptReturn => {
  const { user } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [promptState, setPromptState] = useState<VerificationPromptState | null>(null);
  const [canSendEmail, setCanSendEmail] = useState(true);

  // Check if prompt should be shown
  useEffect(() => {
    const checkShouldShow = async () => {
      if (!enabled || !user || user.emailVerified) {
        setShouldShow(false);
        return;
      }

      try {
        const [shouldShowResult, promptStateResult, canSendResult] = await Promise.all([
          verificationPromptService.shouldShowPrompt(user.uid, context),
          verificationPromptService.getPromptState(user.uid),
          verificationPromptService.canSendVerificationEmail(user.uid),
        ]);

        setShouldShow(shouldShowResult);
        setPromptState(promptStateResult);
        setCanSendEmail(canSendResult);
      } catch (error) {
        console.log('Error checking verification prompt state:', error);
        setShouldShow(false);
      }
    };

    checkShouldShow();
  }, [user?.uid, user?.emailVerified, context, enabled]);

  // Record that prompt was shown
  const recordShown = async () => {
    if (user) {
      await verificationPromptService.recordPromptShown(user.uid, context);
    }
  };

  // Record that prompt was dismissed
  const recordDismissed = async () => {
    if (user) {
      await verificationPromptService.recordPromptDismissed(user.uid, context);
      setShouldShow(false);
    }
  };

  // Record that verification email was sent
  const recordVerificationSent = async () => {
    if (user) {
      await verificationPromptService.recordVerificationSent(user.uid);
      setCanSendEmail(false);
    }
  };

  // Set user preference
  const setUserPreference = async (preference: 'remind' | 'later' | 'never') => {
    if (user) {
      await verificationPromptService.setUserPreference(user.uid, preference);
      if (preference === 'never') {
        setShouldShow(false);
      }
    }
  };

  return {
    shouldShow,
    promptState,
    canSendEmail,
    recordShown,
    recordDismissed,
    recordVerificationSent,
    setUserPreference,
  };
};