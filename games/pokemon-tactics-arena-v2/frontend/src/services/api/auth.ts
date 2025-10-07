import axios, { AxiosInstance } from 'axios';
import { User } from '@pta/contracts';

// Types pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

class AuthAPI {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          // Optionally redirect to login page
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management (in-memory only)
  setToken(token: string): void {
    this.token = token;
    console.log('🔐 Token d\'authentification défini en mémoire');
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    console.log('🔓 Token d\'authentification supprimé de la mémoire');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', data);
      const authData = response.data;
      
      if (authData.token) {
        this.setToken(authData.token);
      }
      
      console.log('✅ Connexion réussie');
      return authData;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', data);
      const authData = response.data;
      
      if (authData.token) {
        this.setToken(authData.token);
      }
      
      console.log('✅ Inscription réussie');
      return authData;
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
      this.clearToken();
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error.response?.data?.error || error.message);
      // Force clear token even if logout request fails
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.api.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (error: any) {
      console.error('❌ Erreur récupération utilisateur actuel:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/refresh');
      const authData = response.data;
      
      if (authData.token) {
        this.setToken(authData.token);
      }
      
      console.log('✅ Token rafraîchi');
      return authData;
    } catch (error: any) {
      console.error('❌ Erreur rafraîchissement token:', error.response?.data?.error || error.message);
      this.clearToken();
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.api.post('/auth/reset-password', { email });
      console.log('✅ Email de réinitialisation envoyé');
    } catch (error: any) {
      console.error('❌ Erreur réinitialisation mot de passe:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Set auth token for subsequent requests (compatibility method)
  setAuthToken(token: string | null): void {
    if (token) {
      this.setToken(token);
    } else {
      this.clearToken();
    }
  }

  // Get current user data (compatibility method)
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.api.put('/auth/profile', updates);
    return response.data.data;
  }

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await this.api.put('/auth/change-password', data);
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await this.api.post('/auth/forgot-password', { email });
  }

  // Reset password with token
  async resetPasswordWithToken(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await this.api.post('/auth/reset-password', data);
  }
}

// Create singleton instance
export const authApi = new AuthAPI();

export default authApi;