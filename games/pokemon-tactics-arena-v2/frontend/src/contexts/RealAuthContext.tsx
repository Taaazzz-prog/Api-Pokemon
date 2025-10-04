// Contexte d'authentification réel pour remplacer AuthContextMock

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { realUserService, RealUser } from '../services/realUserService';

interface AuthContextType {
  user: RealUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; username: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<RealUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<RealUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const savedToken = localStorage.getItem('pokemon-tactics-token');
      if (savedToken) {
        setToken(savedToken);
        const userData = await realUserService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await realUserService.login(credentials.email, credentials.password);
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('pokemon-tactics-token', response.token);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; username: string }) => {
    try {
      setIsLoading(true);
      const response = await realUserService.register(userData.email, userData.password, userData.username);
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('pokemon-tactics-token', response.token);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      localStorage.removeItem('pokemon-tactics-token');
      localStorage.removeItem('pokemon-tactics-user');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateUser = async (updates: Partial<RealUser>) => {
    try {
      if (user) {
        const updatedUser = await realUserService.updateUser(updates);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (token) {
        const userData = await realUserService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};