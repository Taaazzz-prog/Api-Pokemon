import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

// Types pour l'état utilisateur
export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  experience: number;
  pokeCredits: number;
  pokeGems: number;
  avatar?: string;
  stats: {
    totalBattles: number;
    totalWins: number;
    winRate: number;
  };
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Actions pour le reducer
type UserAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// État initial
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer pour gérer l'état
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
      };
    
    case 'UPDATE_USER':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Context
interface UserContextType extends UserState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Fonctions pour gérer l'authentification
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiClient.login({ email, password });
      
      if (response.user) {
        await refreshUser();
      } else {
        throw new Error('Données utilisateur manquantes dans la réponse');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de connexion';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      console.error('❌ Erreur de connexion:', errorMessage);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiClient.register({ email, password, username });
      
      if (response.user) {
        // L'inscription a réussi, maintenant récupérons le profil complet
        console.log('✅ Inscription réussie, récupération du profil complet...');
        await refreshUser(); // Récupère le profil complet depuis /auth/me
        console.log('✅ Utilisateur inscrit avec profil complet');
      } else {
        throw new Error('Données utilisateur manquantes dans la réponse');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur d\'inscription';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      console.error('❌ Erreur d\'inscription:', errorMessage);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Utilisateur déconnecté');
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error);
      // Force la déconnexion même en cas d'erreur
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (data: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: data });
    console.log('✅ Données utilisateur mises à jour:', data);
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!apiClient.isAuthenticated()) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      const userData = await apiClient.getCurrentUser();
      
      if (userData) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        console.log('✅ Données utilisateur actualisées');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'actualisation des données utilisateur:', error);
      // Si l'utilisateur n'est plus authentifié, on le déconnecte
      if (error.response?.status === 401) {
        dispatch({ type: 'LOGOUT' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Vérifier l'authentification au chargement si un token existe
  useEffect(() => {
    const initializeAuth = async () => {
      if (apiClient.isAuthenticated()) {
        await refreshUser();
      }
    };

    initializeAuth();
  }, []);

  const contextValue: UserContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook pour utiliser le context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé dans un UserProvider');
  }
  return context;
};

export default UserContext;
