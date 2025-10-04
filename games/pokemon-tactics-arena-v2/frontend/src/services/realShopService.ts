// Service de magasin réel pour remplacer les données mockées

import { Pokemon, realPokemonData } from './realPokemonData';
import { realUserService } from './realUserService';

export interface ShopItem {
  id: string;
  type: 'pokemon' | 'credits' | 'gems' | 'boost' | 'pack';
  name: string;
  description: string;
  price: number;
  currency: 'credits' | 'gems';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image: string;
  pokemonId?: number; // Pour les articles Pokemon
  quantity?: number; // Pour les crédits/gems
}

// Articles du magasin réels
export const realShopItems: ShopItem[] = [
  // Packs de crédits
  {
    id: "credits-small",
    type: "credits",
    name: "Pack de Crédits Petit",
    description: "500 Poké-Crédits pour capturer plus de Pokémon",
    price: 10,
    currency: "gems",
    rarity: "common",
    image: "/images/shop/credits-small.png",
    quantity: 500
  },
  {
    id: "credits-medium",
    type: "credits",
    name: "Pack de Crédits Moyen",
    description: "1200 Poké-Crédits + 200 bonus",
    price: 20,
    currency: "gems",
    rarity: "uncommon",
    image: "/images/shop/credits-medium.png",
    quantity: 1200
  },
  {
    id: "credits-large",
    type: "credits",
    name: "Pack de Crédits Grand",
    description: "2500 Poké-Crédits + 500 bonus",
    price: 35,
    currency: "gems",
    rarity: "rare",
    image: "/images/shop/credits-large.png",
    quantity: 2500
  },

  // Packs de gemmes
  {
    id: "gems-starter",
    type: "gems",
    name: "Pack de Gemmes Débutant",
    description: "25 Poké-Gemmes pour acheter des objets premium",
    price: 1000,
    currency: "credits",
    rarity: "common",
    image: "/images/shop/gems-starter.png",
    quantity: 25
  },
  {
    id: "gems-standard",
    type: "gems",
    name: "Pack de Gemmes Standard",
    description: "60 Poké-Gemmes + 10 bonus",
    price: 2000,
    currency: "credits",
    rarity: "uncommon",
    image: "/images/shop/gems-standard.png",
    quantity: 60
  },

  // Boosters
  {
    id: "exp-boost",
    type: "boost",
    name: "Booster d'Expérience",
    description: "Double l'expérience gagnée pendant 1 heure",
    price: 5,
    currency: "gems",
    rarity: "uncommon",
    image: "/images/shop/exp-boost.png"
  },
  {
    id: "credits-boost",
    type: "boost",
    name: "Booster de Crédits",
    description: "Double les crédits gagnés pendant 1 heure",
    price: 8,
    currency: "gems",
    rarity: "rare",
    image: "/images/shop/credits-boost.png"
  },

  // Packs de Pokémon
  {
    id: "starter-pack",
    type: "pack",
    name: "Pack Starter",
    description: "3 Pokémon aléatoires de départ garantis",
    price: 1500,
    currency: "credits",
    rarity: "common",
    image: "/images/shop/starter-pack.png"
  },
  {
    id: "rare-pack",
    type: "pack",
    name: "Pack Rare",
    description: "5 Pokémon avec au moins 1 rare garanti",
    price: 15,
    currency: "gems",
    rarity: "rare",
    image: "/images/shop/rare-pack.png"
  },
  {
    id: "legendary-pack",
    type: "pack",
    name: "Pack Légendaire",
    description: "1 Pokémon légendaire garanti + 2 rares",
    price: 50,
    currency: "gems",
    rarity: "legendary",
    image: "/images/shop/legendary-pack.png"
  }
];

// Service de magasin réel
export const realShopService = {
  // Récupérer tous les articles
  getShopItems: async (): Promise<ShopItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulation API
    return realShopItems;
  },

  // Récupérer les Pokémon disponibles à l'achat
  getAvailablePokemon: async (): Promise<Pokemon[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulation API
    return realPokemonData.slice(0, 15); // Les 15 premiers Pokémon disponibles
  },

  // Acheter un article
  purchaseItem: async (itemId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const item = realShopItems.find(i => i.id === itemId);
      if (!item) {
        throw new Error('Article non trouvé');
      }

      const user = await realUserService.getCurrentUser();
      
      // Vérifier si l'utilisateur a assez de fonds
      const userCurrency = item.currency === 'credits' ? user.pokeCredits : user.pokeGems;
      if (userCurrency < item.price) {
        throw new Error(`${item.currency === 'credits' ? 'Crédits' : 'Gemmes'} insuffisant(e)s`);
      }

      // Déduire le coût
      if (item.currency === 'credits') {
        await realUserService.spendCredits(item.price);
      } else {
        const updatedUser = await realUserService.getCurrentUser();
        updatedUser.pokeGems -= item.price;
        await realUserService.updateUser(updatedUser);
      }

      // Appliquer l'effet de l'article
      await applyItemEffect(item, userId);

      return {
        success: true,
        message: `${item.name} acheté avec succès !`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'achat'
      };
    }
  },

  // Acheter un Pokémon
  purchasePokemon: async (pokemonId: number, userId: string): Promise<{ success: boolean; message: string; pokemon?: Pokemon }> => {
    try {
      const pokemon = realPokemonData.find(p => p.id === pokemonId);
      if (!pokemon) {
        throw new Error('Pokémon non trouvé');
      }

      const user = await realUserService.getCurrentUser();
      
      // Vérifier si l'utilisateur a assez de crédits
      if (user.pokeCredits < pokemon.basePrice) {
        throw new Error('Crédits insuffisants');
      }

      // Vérifier si l'utilisateur possède déjà ce Pokémon
      if (user.ownedPokemon.includes(pokemonId)) {
        throw new Error('Vous possédez déjà ce Pokémon');
      }

      // Déduire les crédits et ajouter le Pokémon
      await realUserService.spendCredits(pokemon.basePrice);
      await realUserService.addPokemonToCollection(pokemonId);

      return {
        success: true,
        message: `${pokemon.name} capturé avec succès !`,
        pokemon
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la capture'
      };
    }
  }
};

// Fonction pour appliquer les effets des articles
async function applyItemEffect(item: ShopItem, userId: string): Promise<void> {
  const user = await realUserService.getCurrentUser();

  switch (item.type) {
    case 'credits':
      if (item.quantity) {
        await realUserService.earnCredits(item.quantity);
      }
      break;

    case 'gems':
      if (item.quantity) {
        user.pokeGems += item.quantity;
        await realUserService.updateUser(user);
      }
      break;

    case 'pack':
      // Ouvrir un pack de Pokémon
      await openPokemonPack(item.id);
      break;

    case 'boost':
      // Appliquer un boost (à implémenter selon les besoins)
      console.log(`Boost ${item.name} appliqué`);
      break;

    default:
      console.log(`Type d'article non géré: ${item.type}`);
  }
}

// Fonction pour ouvrir les packs de Pokémon
async function openPokemonPack(packId: string): Promise<Pokemon[]> {
  const obtainedPokemon: Pokemon[] = [];
  
  switch (packId) {
    case 'starter-pack':
      // 3 Pokémon de départ aléatoires
      for (let i = 0; i < 3; i++) {
        const randomPokemon = getRandomPokemonByRarity(['common', 'uncommon']);
        obtainedPokemon.push(randomPokemon);
        await realUserService.addPokemonToCollection(randomPokemon.id);
      }
      break;

    case 'rare-pack':
      // 5 Pokémon avec au moins 1 rare
      const rarePokemon = getRandomPokemonByRarity(['rare', 'epic']);
      obtainedPokemon.push(rarePokemon);
      await realUserService.addPokemonToCollection(rarePokemon.id);
      
      for (let i = 0; i < 4; i++) {
        const randomPokemon = getRandomPokemonByRarity(['common', 'uncommon', 'rare']);
        obtainedPokemon.push(randomPokemon);
        await realUserService.addPokemonToCollection(randomPokemon.id);
      }
      break;

    case 'legendary-pack':
      // 1 légendaire + 2 rares
      const legendaryPokemon = getRandomPokemonByRarity(['legendary']);
      obtainedPokemon.push(legendaryPokemon);
      await realUserService.addPokemonToCollection(legendaryPokemon.id);
      
      for (let i = 0; i < 2; i++) {
        const rarePokemon = getRandomPokemonByRarity(['rare', 'epic']);
        obtainedPokemon.push(rarePokemon);
        await realUserService.addPokemonToCollection(rarePokemon.id);
      }
      break;
  }

  return obtainedPokemon;
}

// Fonction utilitaire pour obtenir un Pokémon aléatoire par rareté
function getRandomPokemonByRarity(rarities: string[]): Pokemon {
  const availablePokemon = realPokemonData.filter(p => rarities.includes(p.rarity));
  const randomIndex = Math.floor(Math.random() * availablePokemon.length);
  return availablePokemon[randomIndex];
}