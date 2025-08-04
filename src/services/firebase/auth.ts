// Firebase Authentication service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Convert Firebase User to our AuthUser interface
 */
const mapFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
});

/**
 * Authentication service class
 */
export class AuthService {
  /**
   * Register a new user with email and password
   */
  static async register(email: string, password: string): Promise<AuthUser> {
    try {
      const credential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  }

  /**
   * Sign in user with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const credential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export default AuthService;