import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VerificationPromptState {
  lastShown: string | null; // ISO date string
  dismissCount: number;
  contextsSeen: string[];
  userPreference: 'remind' | 'later' | 'never';
  verificationSentCount: number;
  lastVerificationSent: string | null;
}

export type VerificationContext = 
  | 'dashboard'
  | 'settings' 
  | 'after_vehicle_added'
  | 'signup_success'
  | 'vehicle_success';

class VerificationPromptService {
  private static readonly STORAGE_KEY = 'verification_prompt_state';
  private static readonly COOLDOWN_DAYS = 3;
  private static readonly MAX_DISMISSALS = 3;
  private static readonly VERIFICATION_COOLDOWN_HOURS = 24;

  /**
   * Get current prompt state from storage
   */
  async getPromptState(userId: string): Promise<VerificationPromptState> {
    try {
      const stored = await AsyncStorage.getItem(`${VerificationPromptService.STORAGE_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.log('Failed to load verification prompt state:', error);
    }

    // Default state for new users
    return {
      lastShown: null,
      dismissCount: 0,
      contextsSeen: [],
      userPreference: 'remind',
      verificationSentCount: 0,
      lastVerificationSent: null,
    };
  }

  /**
   * Update prompt state in storage
   */
  async updatePromptState(userId: string, updates: Partial<VerificationPromptState>): Promise<void> {
    try {
      const currentState = await this.getPromptState(userId);
      const newState = { ...currentState, ...updates };
      await AsyncStorage.setItem(
        `${VerificationPromptService.STORAGE_KEY}_${userId}`,
        JSON.stringify(newState)
      );
    } catch (error) {
      console.log('Failed to save verification prompt state:', error);
    }
  }

  /**
   * Check if prompt should be shown in given context
   */
  async shouldShowPrompt(userId: string, context: VerificationContext): Promise<boolean> {
    const state = await this.getPromptState(userId);

    // Never show if user explicitly opted out
    if (state.userPreference === 'never') {
      return false;
    }

    // Don't show if dismissed too many times
    if (state.dismissCount >= VerificationPromptService.MAX_DISMISSALS) {
      return false;
    }

    // Don't show if recently dismissed (cooldown period)
    if (state.lastShown) {
      const lastShown = new Date(state.lastShown);
      const cooldownEnd = new Date(lastShown.getTime() + (VerificationPromptService.COOLDOWN_DAYS * 24 * 60 * 60 * 1000));
      
      if (new Date() < cooldownEnd) {
        return false;
      }
    }

    // Show in new contexts (different contexts reset some frequency limits)
    if (!state.contextsSeen.includes(context)) {
      return true;
    }

    // Apply additional context-specific logic
    switch (context) {
      case 'dashboard':
        // Only show on dashboard if they've seen it in other contexts first
        return state.contextsSeen.length > 1;
      
      case 'settings':
        // Settings screen has its own UI, don't use prompt component
        return false;
        
      case 'after_vehicle_added':
        // High-value moment, show even if seen before (but respect cooldown)
        return true;
        
      case 'signup_success':
      case 'vehicle_success':
        // Natural completion points, show if not recently dismissed
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Record that prompt was shown
   */
  async recordPromptShown(userId: string, context: VerificationContext): Promise<void> {
    const state = await this.getPromptState(userId);
    const contextsSeen = state.contextsSeen.includes(context) 
      ? state.contextsSeen 
      : [...state.contextsSeen, context];

    await this.updatePromptState(userId, {
      lastShown: new Date().toISOString(),
      contextsSeen,
    });
  }

  /**
   * Record that prompt was dismissed
   */
  async recordPromptDismissed(userId: string, context: VerificationContext): Promise<void> {
    const state = await this.getPromptState(userId);
    
    await this.updatePromptState(userId, {
      dismissCount: state.dismissCount + 1,
      lastShown: new Date().toISOString(),
      userPreference: state.dismissCount + 1 >= VerificationPromptService.MAX_DISMISSALS ? 'never' : 'later',
    });
  }

  /**
   * Record that verification email was sent
   */
  async recordVerificationSent(userId: string): Promise<void> {
    const state = await this.getPromptState(userId);
    
    await this.updatePromptState(userId, {
      verificationSentCount: state.verificationSentCount + 1,
      lastVerificationSent: new Date().toISOString(),
    });
  }

  /**
   * Check if user can send another verification email (rate limiting)
   */
  async canSendVerificationEmail(userId: string): Promise<boolean> {
    const state = await this.getPromptState(userId);
    
    if (!state.lastVerificationSent) {
      return true;
    }

    const lastSent = new Date(state.lastVerificationSent);
    const cooldownEnd = new Date(lastSent.getTime() + (VerificationPromptService.VERIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000));
    
    return new Date() >= cooldownEnd;
  }

  /**
   * Reset all prompt state (for testing or user request)
   */
  async resetPromptState(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${VerificationPromptService.STORAGE_KEY}_${userId}`);
    } catch (error) {
      console.log('Failed to reset verification prompt state:', error);
    }
  }

  /**
   * Set user preference permanently
   */
  async setUserPreference(userId: string, preference: 'remind' | 'later' | 'never'): Promise<void> {
    await this.updatePromptState(userId, {
      userPreference: preference,
    });
  }
}

export const verificationPromptService = new VerificationPromptService();