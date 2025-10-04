// Service utilisateur réel pour remplacer les données mockées

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
  ownedPokemon: number[];
  teams: Team[];
  stats: UserStats;
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

// Utilisateur réel par défaut avec données de départ
export const defaultUser: RealUser = {
  id: "real-user-001",
  email: "trainer@pokemon.com",
  username: "PokemonTrainer",
  level: 1,
  experience: 0,
  pokeCredits: 2500,
  pokeGems: 50,
  coins: 1000,
  avatar: "/images/trainers/default.png",
  ownedPokemon: [1, 4, 7], // Bulbizarre, Salamèche, Carapuce pour commencer
  teams: [
    {
      id: "starter-team",
      name: "Équipe de départ",
      pokemonIds: [1, 4, 7],
      createdAt: new Date(),
      isActive: true
    }
  ],
  stats: {
    totalBattles: 0,
    battlesWon: 0,
    battlesLost: 0,
    survivalBestWave: 0,
    tournamentWins: 0,
    achievementsUnlocked: 0
  }
};

// Service de gestion utilisateur réel
export const realUserService = {
  // Récupérer l'utilisateur actuel
  getCurrentUser: async (): Promise<RealUser> => {
    // Dans une vraie app, cela ferait appel à l'API
    const userData = localStorage.getItem('pokemon-tactics-user');
    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        ...parsed,
        teams: parsed.teams?.map((team: any) => ({
          ...team,
          createdAt: new Date(team.createdAt)
        })) || []
      };
    }
    
    // Sauvegarder l'utilisateur par défaut
    localStorage.setItem('pokemon-tactics-user', JSON.stringify(defaultUser));
    return defaultUser;
  },

  // Mettre à jour l'utilisateur
  updateUser: async (updates: Partial<RealUser>): Promise<RealUser> => {
    const currentUser = await realUserService.getCurrentUser();
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('pokemon-tactics-user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // Authentification simple
  login: async (email: string, password: string): Promise<{ token: string; user: RealUser }> => {
    // Simulation de connexion - dans une vraie app, validation backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = await realUserService.getCurrentUser();
    return {
      token: `real-jwt-token-${Date.now()}`,
      user: { ...user, email }
    };
  },

  // Inscription simple
  register: async (email: string, password: string, username: string): Promise<{ token: string; user: RealUser }> => {
    // Simulation d'inscription - dans une vraie app, création backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: RealUser = {
      ...defaultUser,
      id: `real-user-${Date.now()}`,
      email,
      username
    };
    
    localStorage.setItem('pokemon-tactics-user', JSON.stringify(newUser));
    
    return {
      token: `real-jwt-token-${Date.now()}`,
      user: newUser
    };
  },

  // Ajouter un Pokémon à la collection
  addPokemonToCollection: async (pokemonId: number): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    if (!user.ownedPokemon.includes(pokemonId)) {
      user.ownedPokemon.push(pokemonId);
    }
    return realUserService.updateUser(user);
  },

  // Dépenser des crédits
  spendCredits: async (amount: number): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    if (user.pokeCredits >= amount) {
      user.pokeCredits -= amount;
      return realUserService.updateUser(user);
    }
    throw new Error('Crédits insuffisants');
  },

  // Gagner des crédits
  earnCredits: async (amount: number): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    user.pokeCredits += amount;
    return realUserService.updateUser(user);
  },

  // Créer une équipe
  createTeam: async (name: string, pokemonIds: number[]): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      pokemonIds: pokemonIds.slice(0, 6), // Maximum 6 Pokémon par équipe
      createdAt: new Date(),
      isActive: false
    };
    
    user.teams.push(newTeam);
    return realUserService.updateUser(user);
  },

  // Mettre à jour une équipe
  updateTeam: async (teamId: string, updates: Partial<Team>): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    const teamIndex = user.teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      user.teams[teamIndex] = { ...user.teams[teamIndex], ...updates };
    }
    return realUserService.updateUser(user);
  },

  // Supprimer une équipe
  deleteTeam: async (teamId: string): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    user.teams = user.teams.filter(t => t.id !== teamId);
    return realUserService.updateUser(user);
  },

  // Mettre à jour les statistiques après un combat
  updateBattleStats: async (won: boolean, experience: number = 0): Promise<RealUser> => {
    const user = await realUserService.getCurrentUser();
    user.stats.totalBattles++;
    if (won) {
      user.stats.battlesWon++;
    } else {
      user.stats.battlesLost++;
    }
    user.experience += experience;
    
    // Calcul du niveau basé sur l'expérience
    const newLevel = Math.floor(user.experience / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      user.pokeCredits += 100; // Bonus de niveau
    }
    
    return realUserService.updateUser(user);
  }
};