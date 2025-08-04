// TEMPORARY: Minimal i18n stub to fix circular reference crash
// This bypasses the i18n system entirely until we can debug the circular reference

// Simple mock i18n object
const mockI18n = {
  language: 'en',
  t: (key: string, defaultValue?: string) => {
    // Return the default value if provided, otherwise return the key
    return defaultValue || key.split('.').pop() || key;
  },
  changeLanguage: (lng: string) => Promise.resolve(),
  init: () => Promise.resolve(),
  use: () => mockI18n,
};

export default mockI18n;

/**
 * TEMPORARY: Mock language utilities to prevent crashes
 */
export const LanguageUtils = {
  getCurrentLanguage: (): string => 'en',
  changeLanguage: async (language: 'en' | 'es'): Promise<void> => {},
  getAvailableLanguages: (): string[] => ['en', 'es'],
  isSpanish: (): boolean => false,
  getStoredLanguage: async (): Promise<string> => 'en',
  initializeLanguage: async (): Promise<void> => {},
  getCurrencySymbol: (currency: string): string => '$',
  getDateFormat: (): string => 'MM/DD/YYYY',
  getMeasurementSystem: (): 'imperial' | 'metric' => 'imperial',
};