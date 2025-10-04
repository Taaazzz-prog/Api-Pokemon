import { realUserService } from './realUserService';

export interface PlayerStats {
  id: string;
  username: string;
  wins: number;
  losses: number;
  winRate: number;
  rank: string;
  points: number;
  totalBattles: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  wins: number;
  losses: number;
  winRate: number;
  rank: string;
  points: number;
}

export interface MatchResult {
  opponent: {
    id: string;
    username: string;
    team: any[];
  };
  arena: string;
  estimatedDuration: number;
}

export const realArenaService = {
  getPlayerStats: async (): Promise<PlayerStats> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    return {
      id: currentUser.id,
      username: currentUser.username,
      wins: currentUser.stats.battlesWon,
      losses: currentUser.stats.battlesLost,
      winRate: currentUser.stats.battlesWon + currentUser.stats.battlesLost > 0
        ? (currentUser.stats.battlesWon / (currentUser.stats.battlesWon + currentUser.stats.battlesLost)) * 100
        : 0,
      rank: realArenaService.calculateRank(currentUser.stats.battlesWon),
      points: currentUser.stats.battlesWon * 10 - currentUser.stats.battlesLost * 5,
      totalBattles: currentUser.stats.battlesWon + currentUser.stats.battlesLost
    };
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    // Pour l'instant, on simule un classement avec quelques joueurs
    const leaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        username: 'DragonMaster',
        wins: 150,
        losses: 20,
        winRate: 88.2,
        rank: 'Champion',
        points: 1400
      },
      {
        id: '2',
        username: 'PikachuFan',
        wins: 120,
        losses: 30,
        winRate: 80.0,
        rank: 'Expert',
        points: 1050
      },
      {
        id: '3',
        username: 'TeamRocket',
        wins: 100,
        losses: 50,
        winRate: 66.7,
        rank: 'Avancé',
        points: 750
      }
    ];

    // Ajouter l'utilisateur actuel s'il est connecté
    try {
      const currentUser = await realUserService.getCurrentUser();
      if (currentUser) {
        const playerStats = await realArenaService.getPlayerStats();
        leaderboard.push({
          id: playerStats.id,
          username: playerStats.username,
          wins: playerStats.wins,
          losses: playerStats.losses,
          winRate: playerStats.winRate,
          rank: playerStats.rank,
          points: playerStats.points
        });
      }
    } catch (error) {
      // Ignore si pas connecté
    }

    // Trier par points décroissants
    return leaderboard.sort((a, b) => b.points - a.points);
  },

  findMatch: async (): Promise<MatchResult> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Simuler la recherche d'un match
    await new Promise(resolve => setTimeout(resolve, 1500));

    const opponents = [
      { id: '1', username: 'DragonMaster', team: [] },
      { id: '2', username: 'PikachuFan', team: [] },
      { id: '3', username: 'TeamRocket', team: [] },
      { id: '4', username: 'AshKetchum', team: [] },
      { id: '5', username: 'MistyWater', team: [] }
    ];

    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
    const arenas = ['Forêt', 'Montagne', 'Océan', 'Volcan', 'Glace'];
    const randomArena = arenas[Math.floor(Math.random() * arenas.length)];

    return {
      opponent: randomOpponent,
      arena: randomArena,
      estimatedDuration: Math.floor(Math.random() * 10) + 5 // 5-15 minutes
    };
  },

  calculateRank: (wins: number): string => {
    if (wins >= 100) return 'Champion';
    if (wins >= 75) return 'Expert';
    if (wins >= 50) return 'Avancé';
    if (wins >= 25) return 'Intermédiaire';
    if (wins >= 10) return 'Débutant';
    return 'Novice';
  }
};