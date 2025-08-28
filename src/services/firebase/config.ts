// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Firebase config from environment variables or app.json
const getFirebaseConfig = () => {
  // Try environment variables first (development)
  if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
  }

  // Fallback to app.json extra config (production builds)
  const config = Constants.expoConfig?.extra?.firebase;
  if (config) {
    return {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId,
    };
  }

  // Default empty config (will cause Firebase to fail gracefully)
  return {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  };
};

// Firebase configuration
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with explicit React Native persistence  
import { onAuthStateChanged } from 'firebase/auth';

// Initialize Firebase Auth with AsyncStorage persistence
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;
let auth: Auth;
try {
  // Use initializeAuth with React Native AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: reactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (error: any) {
  // If initializeAuth fails (e.g., already initialized), use getAuth
  console.log('🔄 Auth already initialized, using getAuth');
  auth = getAuth(app);
}

// Debug auth state on initialization
console.log('🔍 Auth Debug - Current user on init:', auth.currentUser?.uid || 'NO USER');
console.log('🔍 Auth Debug - Auth config:', {
  apiKey: !!auth.config.apiKey,
  authDomain: !!auth.config.authDomain,
  app: auth.app.name
});

// Listen to auth state changes for debugging
onAuthStateChanged(auth, (user) => {
  console.log('🔍 Auth State Changed:', user ? `User: ${user.uid}` : 'NO USER');
  if (user) {
    console.log('🔍 User details:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
  }
});

export { auth };
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Development emulator setup - TEMPORARILY DISABLED for real Firebase testing
if (false && __DEV__) {
  // Only connect to emulators in development and if not already connected
  try {
    // Check if running on device vs simulator/emulator
    const isDevice = !__DEV__ || process.env.NODE_ENV === 'production';
    
    if (!isDevice) {
      // Use localhost for iOS simulator, 10.0.2.2 for Android emulator
      const host = 'localhost';
      
      // Connect to emulators only if not already connected
      if (!auth.app.options.projectId?.includes('demo-')) {
        console.log('🔥 Connecting to Firebase emulators...');
        
        // Auth emulator (port 9099)
        connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
        
        // Firestore emulator (port 8080)
        connectFirestoreEmulator(firestore, host, 8080);
        
        // Storage emulator (port 9199)
        connectStorageEmulator(storage, host, 9199);
        
        console.log('✅ Connected to Firebase emulators');
      }
    }
  } catch (error) {
    // Emulators might already be connected, ignore the error
    console.log('ℹ️ Firebase emulators already connected or not available');
  }
}

// Export the Firebase app instance
export default app;

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Helper function to get configuration status
export const getFirebaseConfigStatus = () => {
  const status = {
    configured: isFirebaseConfigured(),
    projectId: firebaseConfig.projectId || 'Not configured',
    environment: __DEV__ ? 'Development' : 'Production',
    emulators: __DEV__ && !firebaseConfig.projectId?.includes('demo-'),
    missing: [] as string[],
  };

  // Check what's missing in development
  if (__DEV__ && !status.configured) {
    if (!firebaseConfig.apiKey) status.missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
    if (!firebaseConfig.authDomain) status.missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
    if (!firebaseConfig.projectId) status.missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
    if (!firebaseConfig.storageBucket) status.missing.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
    if (!firebaseConfig.messagingSenderId) status.missing.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
    if (!firebaseConfig.appId) status.missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');
  }

  return status;
};

// Log configuration status in development
if (__DEV__) {
  const status = getFirebaseConfigStatus();
  if (!status.configured) {
    console.warn('🔥 Firebase not configured!');
    console.warn('Missing environment variables:', status.missing);
    console.warn('Create a .env file with your Firebase configuration.');
    console.warn('See .env.example for the required format.');
  } else {
    console.log('✅ Firebase configured for project:', status.projectId);
  }
}