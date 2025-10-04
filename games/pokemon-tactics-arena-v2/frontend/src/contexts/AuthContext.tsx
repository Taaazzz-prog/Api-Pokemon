import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AuthResponse, LoginRequest, RegisterRequest } from '../services/api/auth';
import { User } from '@pta/contracts';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // Set token for API calls
      authApi.setAuthToken(token);
      
      // Get current user data
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('Token validation failed:', error);
      // Remove invalid token
      localStorage.removeItem('token');
      authApi.setAuthToken(null);
      setIsLoading(false);
      toast.error('Session expired. Please login again.');
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response: AuthResponse = await authApi.login(credentials);
      
      // Store token
      localStorage.setItem('token', response.token);
      authApi.setAuthToken(response.token);
      
      // Set user data
      setUser(response.user);
      
      toast.success(`Welcome back, ${response.user.email.split('@')[0]}!`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response: AuthResponse = await authApi.register(userData);
      
      // Store token
      localStorage.setItem('token', response.token);
      authApi.setAuthToken(response.token);
      
      // Set user data
      setUser(response.user);
      
      toast.success(`Welcome to Pokemon Tactics Arena, ${response.user.email.split('@')[0]}!`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear token and user data
    localStorage.removeItem('token');
    authApi.setAuthToken(null);
    setUser(null);
    
    toast.success('Logged out successfully');
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might need to login again
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};