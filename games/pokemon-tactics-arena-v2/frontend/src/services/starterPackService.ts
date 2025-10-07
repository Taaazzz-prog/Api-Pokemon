import { Pokemon, realPokemonData } from './realPokemonData';
import { apiClient } from './apiClient';

export interface StarterPackResult {
  pokemon: Pokemon[];
  hasLegendary: boolean;
  message: string;
}

/**
 * Service pour gérer le starter pack des nouveaux joueurs
 */
export class StarterPackService {
  
  /**
   * Obtenir tous les Pokemon par rareté
   */
  private getPokemonByRarity() {
    const byRarity = {
      common: realPokemonData.filter(p => p.rarity === 'common'),
      uncommon: realPokemonData.filter(p => p.rarity === 'uncommon'),
      rare: realPokemonData.filter(p => p.rarity === 'rare'),
      epic: realPokemonData.filter(p => p.rarity === 'epic'),
      legendary: realPokemonData.filter(p => p.rarity === 'legendary' || p.isLegendary)
    };

    return byRarity;
  }

  /**
   * Calculer le total des stats d'un Pokemon
   */
  private calculateTotalStats(pokemon: Pokemon): number {
    return pokemon.hp + pokemon.attack + pokemon.defense + 
           pokemon.specialAttack + pokemon.specialDefense + pokemon.speed;
  }

  /**
   * Obtenir les Pokemon légendaires (stats totales >= 580)
   */
  private getLegendaryPokemon(): Pokemon[] {
    return realPokemonData.filter(pokemon => {
      const totalStats = this.calculateTotalStats(pokemon);
      return totalStats >= 580 || pokemon.isLegendary || pokemon.rarity === 'legendary';
    });
  }

  /**
   * Sélectionner un Pokemon aléatoire dans une liste
   */
  private selectRandomPokemon(pokemonList: Pokemon[]): Pokemon {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    return pokemonList[randomIndex];
  }

  /**
   * Générer un starter pack pour un nouveau joueur
   * - 3 Pokemon communs/peu communs
   * - 1 Pokemon rare
   * - 10% de chance d'avoir un Pokemon légendaire
   */
  async generateStarterPack(): Promise<StarterPackResult> {
    const pokemonByRarity = this.getPokemonByRarity();
    const selectedPokemon: Pokemon[] = [];
    let hasLegendary = false;

    // 1. Sélectionner 3 Pokemon de base (commun/peu commun)
    const basePokemon = [...pokemonByRarity.common, ...pokemonByRarity.uncommon];
    
    for (let i = 0; i < 3; i++) {
      let selectedBasePokemon: Pokemon;
      do {
        selectedBasePokemon = this.selectRandomPokemon(basePokemon);
      } while (selectedPokemon.some(p => p.id === selectedBasePokemon.id));
      
      selectedPokemon.push(selectedBasePokemon);
    }

    // 2. Sélectionner 1 Pokemon rare
    let selectedRarePokemon: Pokemon;
    do {
      selectedRarePokemon = this.selectRandomPokemon(pokemonByRarity.rare);
    } while (selectedPokemon.some(p => p.id === selectedRarePokemon.id));
    
    selectedPokemon.push(selectedRarePokemon);

    // 3. 10% de chance d'avoir un Pokemon légendaire
    const legendaryRoll = Math.random();
    if (legendaryRoll <= 0.10) { // 10% de chance
      const legendaryPokemon = this.getLegendaryPokemon();
      if (legendaryPokemon.length > 0) {
        let selectedLegendary: Pokemon;
        do {
          selectedLegendary = this.selectRandomPokemon(legendaryPokemon);
        } while (selectedPokemon.some(p => p.id === selectedLegendary.id));
        
        selectedPokemon.push(selectedLegendary);
        hasLegendary = true;
      }
    }

    // Générer le message de bienvenue
    const message = hasLegendary 
      ? "🎉 Incroyable ! Vous avez obtenu un Pokemon légendaire dans votre pack de démarrage !"
      : "🌟 Bienvenue dans le monde Pokemon ! Voici votre équipe de démarrage.";

    return {
      pokemon: selectedPokemon,
      hasLegendary,
      message
    };
  }

  /**
   * Appliquer le starter pack à un utilisateur
   */
  async applyStarterPack(starterPack: StarterPackResult): Promise<void> {
    try {
      console.log('🎁 Début application du starter pack...');
      
      // Pour l'instant, on marque simplement que l'utilisateur a reçu son starter pack
      // Le backend devrait gérer l'ajout des Pokemon au roster via une API dédiée
      const updateData = {
        hasReceivedStarterPack: true,
        pokeCredits: 3000, // Crédits de démarrage
        pokeGems: 55 // Gemmes de démarrage
      };
      
      console.log('📦 Application du starter pack - données à sauvegarder:', updateData);
      
      const updatedUser = await apiClient.updateUserProfile(updateData);
      
      console.log('✅ Starter pack appliqué avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'application du starter pack:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur a déjà reçu son starter pack
   */
  hasReceivedStarterPack(user: any): boolean {
    try {
      console.log('🔍 Vérification starter pack - utilisateur:', {
        id: user?.id,
        hasReceivedStarterPack: user?.hasReceivedStarterPack,
        pokeCredits: user?.pokeCredits,
        pokeGems: user?.pokeGems,
        fullUser: user
      });
      
      // Si le champ hasReceivedStarterPack existe et est true
      if (user?.hasReceivedStarterPack === true) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du starter pack:', error);
      return false;
    }
  }
}

export const starterPackService = new StarterPackService();