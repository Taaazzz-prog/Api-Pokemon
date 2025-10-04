import { realPokemonData, pokemonTypes, getPokemonByRarity, getLegendaryPokemon, type Pokemon, type PokemonType } from './realPokemonData';

// Service pour la gestion des Pokemon avec vraies données
export class PokemonGameService {
  // Récupère tous les Pokemon disponibles
  async getAllPokemon(): Promise<Pokemon[]> {
    return realPokemonData;
  }

  // Récupère les Pokemon pour le shop (avec rotation quotidienne simulée)
  async getShopPokemon(): Promise<Pokemon[]> {
    // Retourne un mix de raretés
    const common = getPokemonByRarity('common').slice(0, 3);
    const uncommon = getPokemonByRarity('uncommon').slice(0, 2);
    const rare = getPokemonByRarity('rare').slice(0, 2);
    const legendary = getLegendaryPokemon().slice(0, 1);
    
    return [...common, ...uncommon, ...rare, ...legendary];
  }

  // Récupère un Pokemon par ID
  getPokemonById(pokemonId: number): Pokemon | null {
    return realPokemonData.find(p => p.id === pokemonId) || null;
  }

  // Récupère les stats d'un Pokemon
  async getPokemonStats(pokemonId: number): Promise<Pokemon | null> {
    return realPokemonData.find(p => p.id === pokemonId) || null;
  }

  // Récupère les types Pokemon
  async getPokemonTypes(): Promise<PokemonType[]> {
    return pokemonTypes;
  }

  // Simule l'achat d'un Pokemon
  async purchasePokemon(pokemonId: number, _userId: string): Promise<{ success: boolean; message: string; pokemon?: Pokemon }> {
    const pokemon = realPokemonData.find(p => p.id === pokemonId);
    
    if (!pokemon) {
      return { success: false, message: 'Pokemon non trouvé' };
    }

    // Dans une vraie application, on vérifierait les crédits de l'utilisateur ici
    // Pour cette démo, on simule le succès
    return { 
      success: true, 
      message: `${pokemon.name} acheté avec succès !`,
      pokemon 
    };
  }

  // Génère un roster de démarrage
  async generateStarterRoster(): Promise<Pokemon[]> {
    // Pokemon de démarrage classiques
    const starterIds = [1, 4, 7]; // Bulbizarre, Salamèche, Carapuce
    return realPokemonData.filter(p => starterIds.includes(p.id));
  }

  // Récupère des Pokemon par type pour le battle
  async getPokemonForBattle(teamSize: number = 3): Promise<Pokemon[]> {
    // Mélange et prend une sélection équilibrée
    const shuffled = [...realPokemonData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, teamSize);
  }

  // Simule un combat et retourne le résultat
  async simulateBattle(playerTeam: Pokemon[], opponentTeam: Pokemon[]): Promise<{
    winner: 'player' | 'opponent';
    playerDamage: number;
    opponentDamage: number;
    experienceGained: number;
    creditsEarned: number;
  }> {
    // Calcul simple de puissance d'équipe
    const playerPower = playerTeam.reduce((total, pokemon) => 
      total + pokemon.hp + pokemon.attack + pokemon.defense + pokemon.specialAttack + pokemon.specialDefense + pokemon.speed, 0
    );
    
    const opponentPower = opponentTeam.reduce((total, pokemon) => 
      total + pokemon.hp + pokemon.attack + pokemon.defense + pokemon.specialAttack + pokemon.specialDefense + pokemon.speed, 0
    );

    // Ajoute de l'aléatoire (±20%)
    const playerFinalPower = playerPower * (0.8 + Math.random() * 0.4);
    const opponentFinalPower = opponentPower * (0.8 + Math.random() * 0.4);

    const winner = playerFinalPower > opponentFinalPower ? 'player' : 'opponent';
    
    return {
      winner,
      playerDamage: Math.floor(Math.random() * 50) + 10,
      opponentDamage: Math.floor(Math.random() * 50) + 10,
      experienceGained: winner === 'player' ? Math.floor(Math.random() * 100) + 50 : 25,
      creditsEarned: winner === 'player' ? Math.floor(Math.random() * 200) + 100 : 50
    };
  }

  // Récupère des Pokemon pour tournoi
  async getTournamentPokemon(): Promise<Pokemon[]> {
    // Mix de Pokemon puissants pour les tournois
    const powerfulPokemon = realPokemonData
      .filter(p => (p.hp + p.attack + p.specialAttack) > 200)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    return powerfulPokemon;
  }

  // Fonction de recherche
  async searchPokemon(query: string): Promise<Pokemon[]> {
    const lowercaseQuery = query.toLowerCase();
    return realPokemonData.filter(pokemon => 
      pokemon.name.toLowerCase().includes(lowercaseQuery) ||
      pokemon.types.some(type => 
        type.name.toLowerCase().includes(lowercaseQuery) ||
        type.frenchName.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Statistiques globales
  async getGameStats(): Promise<{
    totalPokemon: number;
    totalTypes: number;
    legendaryCount: number;
    averageStats: {
      hp: number;
      attack: number;
      defense: number;
      specialAttack: number;
      specialDefense: number;
      speed: number;
    };
  }> {
    const legendaryPokemon = getLegendaryPokemon();
    
    const totalStats = realPokemonData.reduce((acc, pokemon) => ({
      hp: acc.hp + pokemon.hp,
      attack: acc.attack + pokemon.attack,
      defense: acc.defense + pokemon.defense,
      specialAttack: acc.specialAttack + pokemon.specialAttack,
      specialDefense: acc.specialDefense + pokemon.specialDefense,
      speed: acc.speed + pokemon.speed
    }), { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 });

    const pokemonCount = realPokemonData.length;

    return {
      totalPokemon: pokemonCount,
      totalTypes: pokemonTypes.length,
      legendaryCount: legendaryPokemon.length,
      averageStats: {
        hp: Math.round(totalStats.hp / pokemonCount),
        attack: Math.round(totalStats.attack / pokemonCount),
        defense: Math.round(totalStats.defense / pokemonCount),
        specialAttack: Math.round(totalStats.specialAttack / pokemonCount),
        specialDefense: Math.round(totalStats.specialDefense / pokemonCount),
        speed: Math.round(totalStats.speed / pokemonCount)
      }
    };
  }
}

// Instance globale du service
export const pokemonGameService = new PokemonGameService();

// Export des fonctions pour compatibilité
export const getRealPokemonData = () => realPokemonData;
export const getRealPokemonTypes = () => pokemonTypes;

// Export des types
export type { Pokemon, PokemonType };