/**
 * Firebase configuration test (without React Native dependencies)
 */

// Mock Firebase to avoid React Native dependencies in Node.js test environment
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'test-app' })),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({
    currentUser: null,
    config: { apiKey: 'test-key', authDomain: 'test.com' },
    app: { name: 'test-app' },
  })),
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('expo-constants', () => ({
  expoConfig: null,
}));

describe('Firebase Configuration', () => {
  // Set environment variables for testing
  beforeAll(() => {
    // Mock __DEV__ global variable
    (global as any).__DEV__ = true;
    
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.storage';
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
  });

  test('should detect Firebase is configured with env vars', () => {
    // Import after setting env vars
    const { isFirebaseConfigured } = require('../services/firebase/config');
    const configured = isFirebaseConfigured();
    expect(configured).toBe(true);
  });

  test('should return correct configuration status', () => {
    const { getFirebaseConfigStatus } = require('../services/firebase/config');
    const status = getFirebaseConfigStatus();
    expect(status.configured).toBe(true);
    expect(status.projectId).toBe('test-project');
    expect(status.environment).toBe('Development');
  });
});