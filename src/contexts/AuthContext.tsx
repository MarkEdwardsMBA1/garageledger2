import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    // Initial auth state check - important for app startup
    const checkInitialAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        }
        setIsLoading(false);
      } catch (error) {
        // Silent error handling for auth check
        setIsLoading(false);
      }
    };
    
    checkInitialAuth();

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signIn({ email, password });
      // User state will be updated by the onAuthStateChanged listener
      // setIsLoading(false) will be called by the listener
    } catch (error) {
      console.error('🔐 AuthContext: signIn failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signUp({ email, password, displayName });
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};