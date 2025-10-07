// Service utilisateur réel utilisant l'API backend au lieu du localStorage

import { apiClient } from './apiClient';

export interface OwnedPokemon {
  id: string;
  pokemonId: number;
  nickname: string | null;
  level: number;
  experience: number;
  isShiny: boolean;
  obtainedAt: string;
  obtainedFrom: string;
}

export interface RealUser {
  id: string;
  email: string;
  username: string;
  level: number;
  experience: number;
  pokeCredits: number;
  pokeGems: number;
  coins: number;
  avatar: string;
  ownedPokemon: OwnedPokemon[];
  teams: Team[];
  stats: UserStats;
  hasReceivedStarterPack?: boolean;
}

export interface Team {
  id: string;
  name: string;
  pokemonIds: number[];
  createdAt: Date;
  isActive: boolean;
}

export interface UserStats {
  totalBattles: number;
  battlesWon: number;
  battlesLost: number;
  survivalBestWave: number;
  tournamentWins: number;
  achievementsUnlocked: number;
}

class RealUserService {
  // Récupérer le profil utilisateur depuis l'API
  async getUser(): Promise<RealUser | null> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return null;
      }

      const userData = await apiClient.getCurrentUser();
      console.log('✅ Profil utilisateur récupéré depuis l\'API:', userData);
      return userData;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du profil utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour le profil utilisateur via l'API
  async updateUser(updates: Partial<RealUser>): Promise<RealUser | null> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return null;
      }

      const updatedUser = await apiClient.updateUserProfile(updates);
      console.log('✅ Profil utilisateur mis à jour via l\'API:', updatedUser);
      return updatedUser;
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      return null;
    }
  }

  // Récupérer le roster de Pokémon depuis l'API
  async getUserRoster(): Promise<OwnedPokemon[]> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return [];
      }

      const roster = await apiClient.getUserRoster();
      console.log('✅ Roster récupéré depuis l\'API:', roster);
      return roster;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du roster:', error);
      return [];
    }
  }

  // Ajouter un Pokémon au roster via l'API
  async addPokemonToRoster(pokemonId: number, data?: Partial<OwnedPokemon>): Promise<OwnedPokemon | null> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return null;
      }

      const newPokemon = await apiClient.addPokemonToRoster(pokemonId, data);
      console.log('✅ Pokémon ajouté au roster via l\'API:', newPokemon);
      return newPokemon;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'ajout du Pokémon au roster:', error);
      return null;
    }
  }

  // Supprimer un Pokémon du roster via l'API
  async removePokemonFromRoster(rosterPokemonId: string): Promise<boolean> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return false;
      }

      await apiClient.removePokemonFromRoster(rosterPokemonId);
      console.log('✅ Pokémon supprimé du roster via l\'API');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression du Pokémon du roster:', error);
      return false;
    }
  }

  // Récupérer les équipes depuis l'API
  async getUserTeams(): Promise<Team[]> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return [];
      }

      const teams = await apiClient.getUserTeams();
      console.log('✅ Équipes récupérées depuis l\'API:', teams);
      return teams;
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération des équipes:', error);
      return [];
    }
  }

  // Créer une nouvelle équipe via l'API
  async createTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team | null> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return null;
      }

      const newTeam = await apiClient.createTeam(teamData);
      console.log('✅ Équipe créée via l\'API:', newTeam);
      return newTeam;
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de l\'équipe:', error);
      return null;
    }
  }

  // Mettre à jour une équipe via l'API
  async updateTeam(teamId: string, teamData: Partial<Team>): Promise<Team | null> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return null;
      }

      const updatedTeam = await apiClient.updateTeam(teamId, teamData);
      console.log('✅ Équipe mise à jour via l\'API:', updatedTeam);
      return updatedTeam;
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour de l\'équipe:', error);
      return null;
    }
  }

  // Supprimer une équipe via l'API
  async deleteTeam(teamId: string): Promise<boolean> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié');
        return false;
      }

      await apiClient.deleteTeam(teamId);
      console.log('✅ Équipe supprimée via l\'API');
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression de l\'équipe:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

// Instance singleton
export const realUserService = new RealUserService();

export default realUserService;