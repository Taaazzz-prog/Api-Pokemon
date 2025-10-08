import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { realUserService } from '../services/realUserService';
import realShopService from '../services/realShopService';
import { apiClient } from '../services/apiClient';

export const useRoster = (filters?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['roster', filters],
    queryFn: async () => {
      const response = await realUserService.getUserRoster();
      if (!response.pokemon?.length) {
        return [];
      }

      return response.pokemon.map((pokemon: any) => ({
        id: pokemon.id,
        pokedexId: pokemon.pokemonId,
        name: pokemon.name?.display ?? pokemon.name?.fr ?? 'Pokemon',
        nickname: pokemon.nickname,
        level: pokemon.level,
        experience: pokemon.experience ?? 0,
        obtainedAt: pokemon.obtainedAt,
        obtainedFrom: pokemon.obtainedFrom,
        types: pokemon.types ?? [],
        stats: {
          hp: pokemon.stats?.hp ?? 0,
          attack: pokemon.stats?.attack ?? 0,
          defense: pokemon.stats?.defense ?? 0,
          spAttack: pokemon.stats?.specialAttack ?? 0,
          spDefense: pokemon.stats?.specialDefense ?? 0,
          speed: pokemon.stats?.speed ?? 0,
        },
        sprite: pokemon.spriteRegular,
        spriteShiny: pokemon.spriteShiny,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

export const usePokemon = (id: string) =>
  useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => (id ? apiClient.getPokemonById(Number(id)) : null),
    enabled: !!id,
  });

export const useUpdatePokemonNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nickname }: { id: string; nickname: string }) =>
      apiClient.updateRosterNickname(id, nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roster'] });
      toast.success('Surnom mis à jour!');
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useShopItems = (category?: string) =>
  useQuery({
    queryKey: ['shop', category],
    queryFn: () => realShopService.getShopItems(category),
    staleTime: 10 * 60 * 1000,
  });

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!realUserService.isAuthenticated()) {
        throw new Error('Utilisateur non connecté');
      }
      return realShopService.purchaseItem(itemId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      if (data?.rewards?.length) {
        toast.success('Pack ouvert! Vérifiez vos récompenses.');
      } else {
        toast.success('Achat effectué avec succès');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'achat");
    },
  });
};

export const useArenaStats = () =>
  useQuery({
    queryKey: ['arena', 'stats'],
    queryFn: () => apiClient.get('/arena/stats'),
    staleTime: 60 * 1000,
  });

export const useArenaRankings = (limit = 10) =>
  useQuery({
    queryKey: ['arena', 'rankings', limit],
    queryFn: () => apiClient.get('/arena/rankings', { limit }),
    staleTime: 60 * 1000,
  });

export const useArenaHistory = () =>
  useQuery({
    queryKey: ['arena', 'history'],
    queryFn: () => apiClient.get('/arena/history'),
    staleTime: 60 * 1000,
  });

export const useTournaments = () =>
  useQuery({
    queryKey: ['tournaments'],
    queryFn: () => apiClient.get('/tournaments'),
    staleTime: 5 * 60 * 1000,
  });

export const useTournament = (tournamentId: string) =>
  useQuery({
    queryKey: ['tournaments', tournamentId],
    queryFn: () => apiClient.get(`/tournaments/${tournamentId}`),
    enabled: !!tournamentId,
  });

export const useTournamentBracket = (tournamentId: string) =>
  useQuery({
    queryKey: ['tournaments', tournamentId, 'bracket'],
    queryFn: () => apiClient.get(`/tournaments/${tournamentId}/bracket`),
    enabled: !!tournamentId,
  });

export const useSurvivalStatus = () =>
  useQuery({
    queryKey: ['survival', 'status'],
    queryFn: () => apiClient.get('/survival/status'),
    staleTime: 30 * 1000,
  });

export const useSurvivalHistory = () =>
  useQuery({
    queryKey: ['survival', 'history'],
    queryFn: () => apiClient.get('/survival/history'),
    staleTime: 60 * 1000,
  });
