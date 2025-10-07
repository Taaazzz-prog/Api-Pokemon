import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
  user: any;
  message: string;
}

class ApiClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
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
        console.error('❌ Erreur de requête API:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          this.clearToken();
          window.location.href = '/login';
        }
        
        console.error('❌ Erreur de réponse API:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Gestion des tokens
  setToken(token: string): void {
    this.token = token;
    console.log('🔐 Token d\'authentification défini');
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    console.log('🔓 Token d\'authentification supprimé');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Méthodes d'authentification
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      console.log('✅ Connexion réussie');
      return data;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.response?.data?.error || error.message);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', userData);
      const data = response.data;
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      console.log('✅ Inscription réussie');
      return data;
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
      this.clearToken(); // Force la suppression du token même en cas d'erreur
    }
  }

  // Méthodes API génériques
  async get<T = any>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, { params });
      return (response.data as ApiResponse<T>).data || (response.data as T);
    } catch (error: any) {
      console.error(`❌ Erreur GET ${url}:`, error.response?.data?.error || error.message);
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data);
      return (response.data as ApiResponse<T>).data || (response.data as T);
    } catch (error: any) {
      console.error(`❌ Erreur POST ${url}:`, error.response?.data?.error || error.message);
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data);
      return (response.data as ApiResponse<T>).data || (response.data as T);
    } catch (error: any) {
      console.error(`❌ Erreur PUT ${url}:`, error.response?.data?.error || error.message);
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url);
      return (response.data as ApiResponse<T>).data || (response.data as T);
    } catch (error: any) {
      console.error(`❌ Erreur DELETE ${url}:`, error.response?.data?.error || error.message);
      throw error;
    }
  }

  // Méthodes spécifiques pour les utilisateurs
  async getCurrentUser(): Promise<any> {
    return this.get('/users/profile');
  }

  async updateUserProfile(data: any): Promise<any> {
    return this.put('/users/profile', data);
  }

  // Méthodes pour les Pokémon
  async getPokemonList(params?: any): Promise<any> {
    return this.get('/pokemon', params);
  }

  async getPokemonById(id: number): Promise<any> {
    return this.get(`/pokemon/${id}`);
  }

  // Méthodes pour le roster
  async getUserRoster(): Promise<any> {
    return this.get('/roster');
  }

  async addPokemonToRoster(pokemonId: number, data?: any): Promise<any> {
    return this.post('/roster/pokemon', { pokemonId, ...data });
  }

  async removePokemonFromRoster(rosterPokemonId: string): Promise<any> {
    return this.delete(`/roster/pokemon/${rosterPokemonId}`);
  }

  // Méthodes pour la boutique
  async getShopCatalog(filters?: any): Promise<any> {
    return this.get('/shop/catalog', filters);
  }

  async purchaseItem(itemId: string, quantity: number = 1): Promise<any> {
    return this.post('/shop/purchase', { itemId, quantity });
  }

  // Méthodes pour les équipes
  async getUserTeams(): Promise<any> {
    return this.get('/teams');
  }

  async createTeam(teamData: any): Promise<any> {
    return this.post('/teams', teamData);
  }

  async updateTeam(teamId: string, teamData: any): Promise<any> {
    return this.put(`/teams/${teamId}`, teamData);
  }

  async deleteTeam(teamId: string): Promise<any> {
    return this.delete(`/teams/${teamId}`);
  }

  // Méthodes pour les batailles
  async joinArenaQueue(teamId: string): Promise<any> {
    return this.post('/arena/queue', { teamId });
  }

  async getBattleHistory(): Promise<any> {
    return this.get('/battles/history');
  }

  // Méthodes pour les tournois
  async getTournaments(): Promise<any> {
    return this.get('/tournaments');
  }

  async joinTournament(tournamentId: string, teamId: string): Promise<any> {
    return this.post(`/tournaments/${tournamentId}/join`, { teamId });
  }

  // Méthodes pour le mode survie
  async startSurvivalRun(teamId: string): Promise<any> {
    return this.post('/survival/start', { teamId });
  }

  async getSurvivalProgress(): Promise<any> {
    return this.get('/survival/progress');
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Fonctions utilitaires
export const isApiError = (error: any): boolean => {
  return error.response && error.response.data && error.response.data.error;
};

export const getApiErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.response.data.error;
  }
  return error.message || 'Une erreur inattendue s\'est produite';
};

export default apiClient;