import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realUserService } from '../services/realUserService';
import { realShopService } from '../services/realShopService';
import { realArenaService } from '../services/realArenaService';
import { realTournamentService } from '../services/realTournamentService';
import { realSurvivalService } from '../services/realSurvivalService';
import { pokemonGameService, type Pokemon } from '../services/pokemonGameService';
import { toast } from 'react-hot-toast';

// Hooks pour la gestion du Roster
export const useRoster = (filters?: any) => {
  return useQuery({
    queryKey: ['roster', filters],
    queryFn: async () => {
      try {
        // Utiliser directement l'API roster qui retourne la structure corrigée
        const rosterResponse = await realUserService.getUserRoster();
        console.log('✅ Données roster récupérées:', rosterResponse);
        
        // L'API retourne {pokemon: [...], total: 3}
        if (!rosterResponse || !rosterResponse.pokemon || rosterResponse.pokemon.length === 0) {
          return [];
        }
        
        return rosterResponse.pokemon.map((pokemon: any) => ({
          id: pokemon.id,
          pokedexId: pokemon.pokemonId,
          name: pokemon.pokemonName,
          nickname: pokemon.nickname,
          level: pokemon.level,
          experience: pokemon.experience || 0,
          isShiny: false, // TODO: À implémenter
          obtainedAt: pokemon.obtainedAt || new Date().toISOString(),
          obtainedFrom: pokemon.obtainedFrom,
          types: [], // TODO: À récupérer depuis l'API Pokemon
          stats: {
            hp: 0,
            attack: 0,
            defense: 0,
            spAttack: 0,
            spDefense: 0,
            speed: 0,
          },
          moves: [],
          nature: 'Hardy',
          sprite: pokemon.spriteRegular, // Utiliser le sprite de la base de données
          spriteShiny: pokemon.spriteShiny, // Sprite shiny disponible aussi
        }));
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du roster:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePokemon = (id: string) => {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: async () => {
      // TODO: Implémenter récupération Pokemon par ID
      return null;
    },
    enabled: !!id,
  });
};

export const useUpdatePokemonNickname = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, nickname }: { id: string; nickname: string }) => {
      // TODO: Implémenter mise à jour surnom via realUserService
      console.log('Mise à jour surnom:', id, nickname);
      return { success: true, message: 'Surnom mis à jour' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roster'] });
      toast.success('Surnom mis à jour!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
};

// Hooks pour la Boutique
export const useShopItems = (category?: string) => {
  return useQuery({
    queryKey: ['shop', category],
    queryFn: () => realShopService.getShopItems(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const currentUser = await realUserService.getUser();
      if (!currentUser) throw new Error('Utilisateur non connecté');
      return realShopService.purchaseItem(itemId, currentUser.id);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      if (data.rewards) {
        toast.success('Pack ouvert! Vérifiez vos récompenses.');
      } else {
        toast.success(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'achat');
    },
  });
};

// Hooks pour l'Arena
export const useArenaStats = () => {
  return useQuery({
    queryKey: ['arena', 'stats'],
    queryFn: () => realArenaService.getPlayerStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['arena', 'leaderboard'],
    queryFn: () => realArenaService.getLeaderboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFindMatch = () => {
  return useMutation({
    mutationFn: () => realArenaService.findMatch(),
    onSuccess: (data: any) => {
      toast.success(`Match trouvé contre ${data.opponent.username}!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la recherche de match');
    },
  });
};

// Hooks pour les Tournois
export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: () => realTournamentService.getTournaments(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useJoinTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tournamentId: string) => realTournamentService.joinTournament(tournamentId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    },
  });
};

// Hooks pour le Mode Survie
export const useSurvivalStats = () => {
  return useQuery({
    queryKey: ['survival', 'stats'],
    queryFn: () => realSurvivalService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStartSurvivalRun = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => realSurvivalService.startRun(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survival'] });
      toast.success('Run de survie commencé!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du démarrage');
    },
  });
};