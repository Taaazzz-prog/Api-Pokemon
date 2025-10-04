import { realUserService } from './realUserService';

export interface Tournament {
  id: string;
  name: string;
  type: 'single' | 'double';
  status: 'registration' | 'active' | 'completed';
  maxParticipants: number;
  currentParticipants: number;
  prize: {
    coins: number;
    items: string[];
  };
  startDate: string;
  endDate: string;
  rules: string[];
}

export interface TournamentResult {
  success: boolean;
  message: string;
  tournament?: Tournament;
}

export const realTournamentService = {
  getTournaments: async (): Promise<Tournament[]> => {
    // Simuler des tournois disponibles
    const tournaments: Tournament[] = [
      {
        id: 'tournament_1',
        name: 'Coupe des Champions',
        type: 'single',
        status: 'registration',
        maxParticipants: 32,
        currentParticipants: 18,
        prize: {
          coins: 5000,
          items: ['Master Ball', 'Rare Candy x5']
        },
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        rules: [
          'Maximum niveau 50',
          'Équipe de 6 Pokémon',
          'Pas de légendaires'
        ]
      },
      {
        id: 'tournament_2',
        name: 'Bataille Légendaire',
        type: 'double',
        status: 'active',
        maxParticipants: 16,
        currentParticipants: 16,
        prize: {
          coins: 10000,
          items: ['Legendary Pack', 'Golden Trophy']
        },
        startDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        rules: [
          'Niveau 100',
          'Équipe de 4 Pokémon',
          'Légendaires autorisés'
        ]
      },
      {
        id: 'tournament_3',
        name: 'Tournoi Débutant',
        type: 'single',
        status: 'registration',
        maxParticipants: 64,
        currentParticipants: 35,
        prize: {
          coins: 1000,
          items: ['Potion x10', 'Pokéball x20']
        },
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        rules: [
          'Maximum niveau 25',
          'Équipe de 3 Pokémon',
          'Pokémon de base uniquement'
        ]
      }
    ];

    return tournaments;
  },

  joinTournament: async (tournamentId: string): Promise<TournamentResult> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const tournaments = await realTournamentService.getTournaments();
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
      throw new Error('Tournoi introuvable');
    }

    if (tournament.status !== 'registration') {
      throw new Error('Les inscriptions sont fermées pour ce tournoi');
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      throw new Error('Le tournoi est complet');
    }

    // Vérifier que l'utilisateur a une équipe valide
    if (!currentUser.teams || currentUser.teams.length === 0) {
      throw new Error('Vous devez avoir au moins une équipe pour participer');
    }

    // Simuler l'inscription
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Incrémenter le nombre de participants (simulation)
    tournament.currentParticipants += 1;

    return {
      success: true,
      message: `Inscription réussie au tournoi "${tournament.name}"!`,
      tournament
    };
  },

  getUserTournaments: async (): Promise<Tournament[]> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    // Pour l'instant, on retourne une liste vide
    // Dans une vraie application, on récupèrerait les tournois de l'utilisateur
    return [];
  },

  leaveTournament: async (tournamentId: string): Promise<TournamentResult> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const tournaments = await realTournamentService.getTournaments();
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
      throw new Error('Tournoi introuvable');
    }

    if (tournament.status === 'completed') {
      throw new Error('Impossible de quitter un tournoi terminé');
    }

    // Simuler la désinscription
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: `Vous avez quitté le tournoi "${tournament.name}"`,
      tournament
    };
  }
};