import { Pokemon, realPokemonData } from './realPokemonData';
import { realUserService, OwnedPokemon } from './realUserService';

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
      const user = await realUserService.getCurrentUser();
      
      // Ajouter les Pokemon au roster de l'utilisateur
      const newPokemon = starterPack.pokemon.map(pokemon => ({
        id: pokemon.id,
        nickname: null,
        level: 5, // Les Pokemon de démarrage commencent au niveau 5
        experience: 0,
        isShiny: Math.random() < 0.05, // 5% de chance d'être shiny
        obtainedAt: new Date().toISOString(),
        obtainedFrom: 'starter_pack'
      }));

      const updatedOwnedPokemon = [
        ...(user.ownedPokemon || []),
        ...newPokemon
      ];

      // Mettre à jour l'utilisateur
      const updateData = {
        ownedPokemon: updatedOwnedPokemon,
        hasReceivedStarterPack: true,
        pokeCredits: 3000, // Crédits de démarrage (2500 de base + 500 bonus)
        pokeGems: 55 // Gemmes de démarrage (50 de base + 5 bonus)
      };
      
      console.log('📦 Application du starter pack - données à sauvegarder:', updateData);
      
      const updatedUser = await realUserService.updateUser(updateData);
      
      console.log('✅ Starter pack appliqué avec succès - utilisateur mis à jour:', {
        hasReceivedStarterPack: updatedUser.hasReceivedStarterPack,
        pokemonCount: updatedUser.ownedPokemon?.length || 0,
        pokeCredits: updatedUser.pokeCredits,
        pokeGems: updatedUser.pokeGems
      });

    } catch (error) {
      console.error('Erreur lors de l\'application du starter pack:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur a déjà reçu son starter pack
   */
  async hasReceivedStarterPack(): Promise<boolean> {
    try {
      const user = await realUserService.getCurrentUser();
      console.log('🔍 Vérification starter pack - utilisateur:', {
        id: user.id,
        hasReceivedStarterPack: user.hasReceivedStarterPack,
        fullUser: user
      });
      return user.hasReceivedStarterPack || false;
    } catch (error) {
      console.error('Erreur lors de la vérification du starter pack:', error);
      return false;
    }
  }
}

export const starterPackService = new StarterPackService();