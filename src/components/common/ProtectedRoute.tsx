import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from './Loading';
import { LoginScreen } from '../../screens/LoginScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback: FallbackComponent = LoginScreen 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <FallbackComponent />;
  }

  return <>{children}</>;
};