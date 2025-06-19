import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../services/apiClient';

// --- NEW ---
// Define the shape of the user profile data
interface UserProfile {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null; // <-- ADDED
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void; // <-- MODIFIED
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null); // <-- ADDED
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser); // <-- ADDED
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => { // <-- MODIFIED
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser)); // <-- ADDED
    setToken(newToken);
    setUser(newUser); // <-- ADDED
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // <-- ADDED
    setToken(null);
    setUser(null); // <-- ADDED
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = { token, user, isAuthenticated: !!token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};