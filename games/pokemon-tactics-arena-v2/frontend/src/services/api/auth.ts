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

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Set auth token for subsequent requests
  setAuthToken(token: string | null): void {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data.data;
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', userData);
    return response.data.data;
  }

  // Get current user data
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/profile');
    return response.data.data;
  }

  // Update user profile
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

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await this.api.post('/auth/refresh');
    return response.data.data;
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await this.api.post('/auth/forgot-password', { email });
  }

  // Reset password with token
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await this.api.post('/auth/reset-password', data);
  }

  // Logout (server-side token invalidation if needed)
  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors - we'll clear local storage anyway
      console.warn('Logout request failed:', error);
    }
  }
}

export const authApi = new AuthAPI();