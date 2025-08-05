import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'garageledger_language';

// Available languages configuration
export const AVAILABLE_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' }
} as const;

export type SupportedLanguage = keyof typeof AVAILABLE_LANGUAGES;

// Language detection and persistence functions
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // First try to get stored language preference
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (storedLanguage && Object.keys(AVAILABLE_LANGUAGES).includes(storedLanguage)) {
        console.log('🌍 Using stored language:', storedLanguage);
        callback(storedLanguage);
        return;
      }

      // Fallback to device locale detection
      const deviceLanguages = Localization.getLocales();
      const deviceLanguage = deviceLanguages[0]?.languageCode || 'en';
      
      // Check if device language is supported
      const supportedLanguage = Object.keys(AVAILABLE_LANGUAGES).includes(deviceLanguage) 
        ? deviceLanguage 
        : 'en'; // Default to English
      
      console.log('🌍 Using device language:', supportedLanguage, 'from device:', deviceLanguage);
      callback(supportedLanguage);
    } catch (error) {
      console.warn('🌍 Language detection failed, defaulting to English:', error);
      callback('en');
    }
  },
  
  init: () => {
    // No initialization needed for AsyncStorage
  },
  
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      console.log('🌍 Language preference saved:', lng);
    } catch (error) {
      console.warn('🌍 Failed to save language preference:', error);
    }
  }
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    // Translation resources
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    
    // Fallback language
    fallbackLng: 'en',
    
    // Enable debug in development
    debug: __DEV__,
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // React i18next options
    react: {
      useSuspense: false, // Disable suspense mode for React Native
    },
    
    // Default namespace
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Compatibility settings
    compatibilityJSON: 'v3', // Use v3 format for better React Native support
  });

// Export configured i18n instance
export default i18n;

/**
 * Language utility functions for the app
 */
export const LanguageUtils = {
  /**
   * Get current active language
   */
  getCurrentLanguage: (): SupportedLanguage => {
    return i18n.language as SupportedLanguage;
  },

  /**
   * Change app language and persist choice
   */
  changeLanguage: async (language: SupportedLanguage): Promise<void> => {
    try {
      await i18n.changeLanguage(language);
      console.log('🌍 Language changed to:', language);
    } catch (error) {
      console.error('🌍 Failed to change language:', error);
      throw error;
    }
  },

  /**
   * Get list of available languages
   */
  getAvailableLanguages: () => {
    return Object.entries(AVAILABLE_LANGUAGES).map(([code, config]) => ({
      code: code as SupportedLanguage,
      name: config.name,
      flag: config.flag
    }));
  },

  /**
   * Check if current language is Spanish
   */
  isSpanish: (): boolean => {
    return i18n.language === 'es';
  },

  /**
   * Get stored language preference
   */
  getStoredLanguage: async (): Promise<SupportedLanguage | null> => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      return stored as SupportedLanguage | null;
    } catch (error) {
      console.warn('🌍 Failed to get stored language:', error);
      return null;
    }
  },

  /**
   * Initialize language on app startup
   */
  initializeLanguage: async (): Promise<void> => {
    // Language initialization is handled by the language detector
    // This function can be used for any additional setup if needed
    console.log('🌍 Language initialization complete');
  },

  /**
   * Get currency symbol based on language/region
   */
  getCurrencySymbol: (currency?: string): string => {
    const lang = i18n.language;
    
    if (currency) {
      // Return specific currency if provided
      const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'MXN': '$',
        'COP': '$',
        'ARS': '$',
        'CLP': '$',
      };
      return symbols[currency] || currency;
    }
    
    // Default currency based on language
    switch (lang) {
      case 'es':
        return '$'; // Default to USD for Spanish (can be customized per region)
      default:
        return '$';
    }
  },

  /**
   * Get date format based on language
   */
  getDateFormat: (): string => {
    const lang = i18n.language;
    switch (lang) {
      case 'es':
        return 'DD/MM/YYYY'; // Common in Spanish-speaking countries
      default:
        return 'MM/DD/YYYY'; // US format
    }
  },

  /**
   * Get measurement system based on language/region
   */
  getMeasurementSystem: (): 'imperial' | 'metric' => {
    const lang = i18n.language;
    switch (lang) {
      case 'es':
        return 'metric'; // Most Spanish-speaking countries use metric
      default:
        return 'imperial'; // US uses imperial
    }
  }
};

// Log initialization
console.log('🌍 i18n initialized with languages:', Object.keys(AVAILABLE_LANGUAGES));