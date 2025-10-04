import { realUserService } from './realUserService';

export interface SurvivalStats {
  userId: string;
  bestRun: number;
  totalRuns: number;
  totalWins: number;
  totalRewards: {
    coins: number;
    items: string[];
  };
  lastRun: {
    date: string;
    waves: number;
    reward: number;
  } | null;
}

export interface SurvivalRun {
  id: string;
  userId: string;
  startDate: string;
  currentWave: number;
  isActive: boolean;
  rewards: {
    coins: number;
    items: string[];
  };
  team: any[];
}

export interface SurvivalResult {
  success: boolean;
  message: string;
  run?: SurvivalRun;
}

export const realSurvivalService = {
  getStats: async (): Promise<SurvivalStats> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Simuler les statistiques de survie
    return {
      userId: currentUser.id,
      bestRun: Math.floor(Math.random() * 20) + 5, // 5-25 vagues
      totalRuns: Math.floor(Math.random() * 50) + 10, // 10-60 runs
      totalWins: Math.floor(Math.random() * 100) + 20, // 20-120 victoires
      totalRewards: {
        coins: Math.floor(Math.random() * 10000) + 5000,
        items: ['Potion x50', 'Rare Candy x10', 'Master Ball x2']
      },
      lastRun: {
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        waves: Math.floor(Math.random() * 15) + 3,
        reward: Math.floor(Math.random() * 1000) + 200
      }
    };
  },

  startRun: async (): Promise<SurvivalResult> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Vérifier que l'utilisateur a une équipe
    if (!currentUser.teams || currentUser.teams.length === 0) {
      throw new Error('Vous devez avoir au moins une équipe pour commencer une run');
    }

    const activeTeam = currentUser.teams.find(team => team.isActive) || currentUser.teams[0];
    if (!activeTeam || !activeTeam.pokemonIds || activeTeam.pokemonIds.length === 0) {
      throw new Error('Votre équipe active est vide');
    }

    // Simuler le démarrage d'une run
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRun: SurvivalRun = {
      id: `run_${Date.now()}`,
      userId: currentUser.id,
      startDate: new Date().toISOString(),
      currentWave: 1,
      isActive: true,
      rewards: {
        coins: 0,
        items: []
      },
      team: activeTeam.pokemonIds
    };

    return {
      success: true,
      message: 'Run de survie démarrée! Préparez-vous au combat!',
      run: newRun
    };
  },

  getCurrentRun: async (): Promise<SurvivalRun | null> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      return null;
    }

    // Simuler une run active (pour les tests)
    // Dans une vraie application, on récupèrerait les données depuis la base
    return null;
  },

  endRun: async (runId: string): Promise<SurvivalResult> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Simuler la fin d'une run
    await new Promise(resolve => setTimeout(resolve, 500));

    const finalRewards = {
      coins: Math.floor(Math.random() * 1000) + 100,
      items: Math.random() > 0.5 ? ['Rare Candy'] : []
    };

    // Ajouter les récompenses à l'utilisateur
    currentUser.coins += finalRewards.coins;
    await realUserService.updateUser(currentUser);

    return {
      success: true,
      message: `Run terminée! Vous avez gagné ${finalRewards.coins} pièces!`
    };
  },

  battleWave: async (runId: string, waveNumber: number): Promise<{
    success: boolean;
    nextWave: boolean;
    rewards?: { coins: number; items: string[] };
    message: string;
  }> => {
    const currentUser = await realUserService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    // Simuler le combat
    await new Promise(resolve => setTimeout(resolve, 2000));

    const victory = Math.random() > 0.3; // 70% de chance de victoire

    if (victory) {
      const waveRewards = {
        coins: waveNumber * 10 + Math.floor(Math.random() * 50),
        items: waveNumber % 5 === 0 ? ['Potion'] : []
      };

      return {
        success: true,
        nextWave: true,
        rewards: waveRewards,
        message: `Vague ${waveNumber} terminée! +${waveRewards.coins} pièces`
      };
    } else {
      return {
        success: false,
        nextWave: false,
        message: 'Défaite! Votre run se termine ici.'
      };
    }
  }
};