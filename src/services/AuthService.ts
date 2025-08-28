import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  Auth
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { auth } from './firebase/config';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
  providerId?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Firebase Authentication Service
 * Provides secure user authentication and session management
 */
export class AuthService {
  private authInstance: Auth;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor(authInstance: Auth = auth) {
    this.authInstance = authInstance;
    this.setupAuthStateListener();
    this.initializeGoogleSignIn();
  }

  /**
   * Set up global auth state listener
   */
  private setupAuthStateListener(): void {
    onAuthStateChanged(this.authInstance, (firebaseUser) => {
      const user = firebaseUser ? this.formatUser(firebaseUser) : null;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  /**
   * Initialize Google OAuth configuration for Expo
   */
  private initializeGoogleSignIn(): void {
    try {
      // Configure WebBrowser for OAuth flows
      WebBrowser.maybeCompleteAuthSession();
      console.log('✅ Expo Google OAuth configured');
    } catch (error) {
      console.warn('⚠️ Failed to configure Google OAuth:', error);
    }
  }

  /**
   * Register a new user with email and password
   */
  async signUp(data: SignUpData): Promise<User> {
    try {
      const { email, password, displayName } = data;
      
      // Validate inputs
      this.validateEmail(email);
      this.validatePassword(password);

      // Create user account
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.authInstance,
        email,
        password
      );

      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Automatically send email verification
      try {
        await sendEmailVerification(userCredential.user);
        console.log('✅ Email verification sent automatically');
      } catch (verificationError) {
        console.warn('⚠️ Failed to send email verification:', verificationError);
        // Don't throw error - user can still proceed and send verification later
      }

      return this.formatUser(userCredential.user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in existing user with email and password
   */
  async signIn(data: SignInData): Promise<User> {
    try {
      const { email, password } = data;
      console.log('🔑 AuthService: signIn called with email:', email);
      
      // Validate inputs
      this.validateEmail(email);
      if (!password) {
        throw new AuthError('Password is required', 'auth/missing-password');
      }

      console.log('🔑 AuthService: Attempting Firebase signIn...');
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.authInstance,
        email,
        password
      );
      console.log('🔑 AuthService: Firebase signIn successful:', userCredential.user.uid);

      return this.formatUser(userCredential.user);
    } catch (error: any) {
      // Log for debugging but don't make it prominent
      console.log('🔑 AuthService: signIn failed for user:', data.email.split('@')[0] + '@***');
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<User> {
    try {
      console.log('🔍 AuthService: Google Sign-In requested');
      
      // Get Google Web Client ID from environment
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!clientId) {
        throw new AuthError('Google OAuth not configured', 'auth/configuration-missing');
      }
      
      console.log('🔍 AuthService: Starting Google OAuth flow');
      
      // Force exact redirect URI that matches Google Console configuration
      const redirectUri = 'https://auth.expo.io/@edwards1m/garageledger2';
      console.log('🔍 AuthService: Redirect URI:', redirectUri);
      
      // Generate nonce for security
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(),
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {
          nonce: nonce,
        },
        usePKCE: false, // Disable PKCE for web client
      });

      // Use Google's discovery endpoint for proper configuration
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };
      
      console.log('🔍 AuthService: OAuth request configured, prompting user');
      
      // Present the OAuth flow to the user with timeout
      let result: AuthSession.AuthSessionResult;
      try {
        console.log('🔍 AuthService: About to call promptAsync...');
        result = await Promise.race([
          request.promptAsync(discovery),
          new Promise<AuthSession.AuthSessionResult>((_, reject) => 
            setTimeout(() => reject(new Error('OAuth timeout after 60 seconds')), 60000)
          )
        ]);
        console.log('🔍 AuthService: promptAsync returned');
      } catch (promptError) {
        console.log('🔍 AuthService: promptAsync threw error:', promptError);
        throw promptError;
      }
      
      console.log('🔍 AuthService: OAuth prompt completed', result.type);
      console.log('🔍 AuthService: OAuth result keys:', Object.keys(result));
      console.log('🔍 AuthService: OAuth result params keys:', 'params' in result ? Object.keys(result.params || {}) : 'no params');
      console.log('🔍 AuthService: Full OAuth result:', JSON.stringify(result, null, 2));
      
      if (result.type === 'error') {
        console.log('🔍 AuthService: OAuth error details:', 'errorCode' in result ? result.errorCode : 'N/A', 'error' in result ? result.error : 'N/A');
        const error = ('error' in result && result.error) || ('errorCode' in result && result.errorCode) || 'Unknown OAuth error';
        throw new AuthError(`OAuth error: ${error}`, 'auth/oauth-error');
      }
      
      if (result.type === 'success' && 'params' in result && result.params?.id_token) {
        console.log('🔍 AuthService: Got ID token, creating Firebase credential');
        console.log('🔍 AuthService: ID token length:', result.params.id_token.length);
        
        // Create Firebase credential from Google ID token
        const googleCredential = GoogleAuthProvider.credential(result.params.id_token);
        console.log('🔍 AuthService: Created Firebase credential, signing in...');
        
        // Sign in to Firebase with Google credential
        const userCredential = await signInWithCredential(this.authInstance, googleCredential);
        console.log('🔍 AuthService: Firebase authentication successful:', userCredential.user.uid);
        
        return this.formatUser(userCredential.user);
      } else if (result.type === 'cancel') {
        console.log('🔍 AuthService: User cancelled OAuth flow');
        throw new AuthError('Sign in was cancelled', 'auth/cancelled');
      } else if (result.type === 'success') {
        console.log('🔍 AuthService: OAuth success but no id_token found');
        console.log('🔍 AuthService: Available params:', 'params' in result ? Object.keys(result.params || {}) : 'no params');
        throw new AuthError('Authentication succeeded but no ID token received', 'auth/no-id-token');
      } else {
        console.log('🔍 AuthService: Unexpected OAuth result type:', result.type);
        throw new AuthError(`Google Sign-In failed with result type: ${result.type}`, 'auth/unknown-error');
      }
    } catch (error: any) {
      console.log('🔍 AuthService: Google Sign-In failed');
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.authInstance);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): User | null {
    const firebaseUser = this.authInstance.currentUser;
    // Only log on auth state changes to avoid noise
    return firebaseUser ? this.formatUser(firebaseUser) : null;
  }

  /**
   * Get current user or throw error if not authenticated
   */
  requireAuth(): User {
    const user = this.getCurrentUser();
    if (!user) {
      throw new AuthError('Authentication required', 'auth/unauthenticated');
    }
    return user;
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      this.validateEmail(email);
      await sendPasswordResetEmail(this.authInstance, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send email verification to current user
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const user = this.requireAuth();
      const firebaseUser = this.authInstance.currentUser;
      
      if (!firebaseUser) {
        throw new AuthError('No user is currently signed in', 'auth/no-current-user');
      }
      
      if (firebaseUser.emailVerified) {
        throw new AuthError('Email is already verified', 'auth/email-already-verified');
      }
      
      await sendEmailVerification(firebaseUser);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Refresh current user data from Firebase
   * Useful for checking email verification status after user clicks verification link
   */
  async refreshUser(): Promise<User | null> {
    try {
      const firebaseUser = this.authInstance.currentUser;
      if (!firebaseUser) {
        return null;
      }

      // Reload user data from Firebase
      await firebaseUser.reload();
      
      // Return updated user data
      const refreshedUser = this.formatUser(firebaseUser);
      
      // Trigger auth state change to update UI
      this.authStateListeners.forEach(listener => listener(refreshedUser));
      
      return refreshedUser;
    } catch (error: any) {
      console.log('🔐 AuthService: Failed to refresh user');
      throw this.handleAuthError(error);
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Format Firebase user to our User interface
   */
  private formatUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      photoURL: firebaseUser.photoURL,
      providerId: firebaseUser.providerId || (firebaseUser.providerData.length > 0 ? firebaseUser.providerData[0].providerId : undefined)
    };
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    if (!email) {
      throw new AuthError('Email is required', 'auth/missing-email');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AuthError('Please enter a valid email address', 'auth/invalid-email');
    }
  }

  /**
   * Validate password strength - automotive-themed security
   */
  private validatePassword(password: string): void {
    if (!password) {
      throw new AuthError('Password is required', 'auth/missing-password');
    }
    
    if (password.length < 8) {
      throw new AuthError('Secure your garage with at least 8 characters', 'auth/weak-password');
    }

    // Check for at least one number or special character
    const hasNumberOrSpecial = /[\d\W]/.test(password);
    if (!hasNumberOrSpecial) {
      throw new AuthError('Add a number or special character to strengthen your key', 'auth/weak-password');
    }
  }

  /**
   * Handle and format authentication errors
   */
  private handleAuthError(error: any): AuthError {
    // If already an AuthError, return as-is
    if (error instanceof AuthError) {
      return error;
    }

    // Handle Firebase auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new AuthError('Oops! An account with this email already exists. Please sign in.', error.code, error);
      
      case 'auth/invalid-email':
        return new AuthError('Please enter a valid email address', error.code, error);
      
      case 'auth/operation-not-allowed':
        return new AuthError('Email/password accounts are not enabled', error.code, error);
      
      case 'auth/weak-password':
        return new AuthError('Secure your garage with a stronger password', error.code, error);
      
      case 'auth/user-disabled':
        return new AuthError('This account has been disabled', error.code, error);
      
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return new AuthError('Invalid email or password. Please check your credentials and try again.', error.code, error);
      
      case 'auth/too-many-requests':
        return new AuthError('Too many failed sign-in attempts. Please wait a few minutes and try again.', error.code, error);
      
      case 'auth/user-token-expired':
      case 'auth/requires-recent-login':
        return new AuthError('Your session has expired. Please sign in again.', error.code, error);
      
      case 'auth/account-exists-with-different-credential':
        return new AuthError('An account already exists with this email address using a different sign-in method.', error.code, error);
      
      case 'auth/network-request-failed':
        return new AuthError('Network error. Please check your connection', error.code, error);
      
      case 'auth/api-key-not-valid':
        return new AuthError('Firebase configuration error. Please contact support', error.code, error);
      
      case 'auth/no-current-user':
        return new AuthError('Please sign in to continue', error.code, error);
      
      case 'auth/email-already-verified':
        return new AuthError('Your email is already verified!', error.code, error);
      
      case 'auth/too-many-requests':
        return new AuthError('Too many verification emails sent. Please wait before requesting another.', error.code, error);
      
      default:
        // Log unhandled error codes for debugging
        console.warn('🔥 Unhandled Firebase Auth Error:', error.code, error.message);
        
        // Provide a user-friendly fallback message
        const friendlyMessage = error.message?.includes('Firebase:') 
          ? 'Something went wrong with sign-in. Please try again.'
          : error.message || 'An unexpected error occurred. Please try again.';
          
        return new AuthError(
          friendlyMessage,
          error.code || 'auth/unknown',
          error
        );
    }
  }
}

// Export singleton instance
export const authService = new AuthService();