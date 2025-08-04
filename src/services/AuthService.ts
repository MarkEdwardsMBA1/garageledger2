import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  Auth
} from 'firebase/auth';
import { auth } from './firebase/config';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
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
      console.error('🔑 AuthService: signIn error:', error.code, error.message);
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
    console.log('🔐 AuthService: getCurrentUser called, Firebase user:', firebaseUser ? 'exists' : 'null');
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
      emailVerified: firebaseUser.emailVerified
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
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (!password) {
      throw new AuthError('Password is required', 'auth/missing-password');
    }
    
    if (password.length < 6) {
      throw new AuthError('Password must be at least 6 characters long', 'auth/weak-password');
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
        return new AuthError('Password should be at least 6 characters', error.code, error);
      
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