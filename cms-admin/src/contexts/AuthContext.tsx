import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthSession, LoginCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const token = localStorage.getItem('auth_token');
      const storedSession = localStorage.getItem('auth_session');

      if (token && storedSession) {
        try {
          const sessionData: AuthSession = JSON.parse(storedSession);
          
          // Check if token is expired
          if (new Date(sessionData.expiresAt) > new Date()) {
            // Verify token with backend
            const isValid = await verifyTokenWithBackend(token);
            
            if (isValid) {
              setSession(sessionData);
              // Note: Full user data would come from verify endpoint
              setUser({
                id: sessionData.userId,
                username: sessionData.username,
                role: sessionData.role as any,
                permissions: sessionData.permissions,
                email: '', // Would be fetched from verify endpoint
                passwordHash: '',
                createdAt: '',
                lastLogin: null,
                isActive: true
              });
            } else {
              // Invalid token, clear storage
              clearAuth();
            }
          } else {
            // Expired token
            clearAuth();
          }
        } catch (error) {
          console.error('Error loading session:', error);
          clearAuth();
        }
      }
      
      setIsLoading(false);
    };

    loadSession();
  }, []);

  const verifyTokenWithBackend = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      return false;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Store token and session
      localStorage.setItem('auth_token', data.token);
      
      const sessionData: AuthSession = {
        userId: data.user.id,
        username: data.user.username,
        role: data.user.role,
        permissions: data.user.permissions,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h from now
      };

      localStorage.setItem('auth_session', JSON.stringify(sessionData));
      
      setUser(data.user);
      setSession(sessionData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    clearAuth();
    
    // Optional: Call backend logout endpoint
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(console.error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_session');
    setUser(null);
    setSession(null);
  };

  const verifyToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    return await verifyTokenWithBackend(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        verifyToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
