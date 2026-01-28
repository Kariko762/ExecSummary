import React, { type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  appName?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  appName = 'CMS Admin'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fis-eggplant border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-roobert-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If auth not required, always show content
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth required and user is authenticated, show content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, show login page
  return <LoginPage appName={appName} />;
}
