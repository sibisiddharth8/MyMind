import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../services/apiClient';

// --- Type Definitions ---
interface PublicUser {
  id: string;
  name: string;
  email: string;
}

// FIX: The context type now correctly includes the 'user' and 'token'
interface PublicAuthContextType {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: PublicUser, rememberMe: boolean) => void;
  logout: () => void;
}

const PublicAuthContext = createContext<PublicAuthContextType | undefined>(undefined);

export const PublicAuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once on app load to check for a saved session
  useEffect(() => {
    let storedToken = localStorage.getItem('public_token');
    let storedUser = localStorage.getItem('public_user');

    if (!storedToken) {
        storedToken = sessionStorage.getItem('public_token');
        storedUser = sessionStorage.getItem('public_user');
    }

    try {
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        // Important: Set the auth header for future API calls in this session
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Failed to parse auth data from storage", error);
      // Clear potentially corrupted data
      localStorage.removeItem('public_token');
      localStorage.removeItem('public_user');
      sessionStorage.removeItem('public_token');
      sessionStorage.removeItem('public_user');
    } finally {
        setIsLoading(false);
    }
  }, []);

  // The login function now correctly saves to the chosen storage
  const login = useCallback((newToken: string, newUser: PublicUser, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem('public_token', newToken);
    storage.setItem('public_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }, []);

  // The logout function now correctly clears both storages
  const logout = useCallback(() => {
    localStorage.removeItem('public_token');
    localStorage.removeItem('public_user');
    sessionStorage.removeItem('public_token');
    sessionStorage.removeItem('public_user');

    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  // FIX: The 'value' object now correctly provides the token to all child components
  const value = { user, token, isAuthenticated: !!token, isLoading, login, logout };

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
};

export const usePublicAuth = () => {
  const context = useContext(PublicAuthContext);
  if (context === undefined) throw new Error('usePublicAuth must be used within a PublicAuthProvider');
  return context;
};