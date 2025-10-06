import { Pokemon } from '../types';

export type PokemonRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface RarityConfig {
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export const rarityConfigs: Record<PokemonRarity, RarityConfig> = {
  common: {
    label: 'Commun',
    color: 'gray',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800'
  },
  uncommon: {
    label: 'Peu commun',
    color: 'green',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  rare: {
    label: 'Rare',
    color: 'blue',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  epic: {
    label: 'Épique',
    color: 'purple',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800'
  },
  legendary: {
    label: 'Légendaire',
    color: 'yellow',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  }
};

/**
 * Détermine la rareté d'un Pokemon basée sur ses stats totales
 */
export function getPokemonRarity(pokemon: any): PokemonRarity {
  const totalStats = (pokemon.stats?.hp || 0) + 
                    (pokemon.stats?.attack || 0) + 
                    (pokemon.stats?.defense || 0) + 
                    (pokemon.stats?.spAttack || 0) + 
                    (pokemon.stats?.spDefense || 0) + 
                    (pokemon.stats?.speed || 0);

  // Pokemon légendaires (stats totales >= 580)
  if (totalStats >= 580) return 'legendary';
  
  // Pokemon épiques (stats totales >= 520)
  if (totalStats >= 520) return 'epic';
  
  // Pokemon rares (stats totales >= 450)
  if (totalStats >= 450) return 'rare';
  
  // Pokemon peu communs (stats totales >= 380)
  if (totalStats >= 380) return 'uncommon';
  
  // Pokemon communs (stats totales < 380)
  return 'common';
}

/**
 * Obtient la configuration de rareté pour un Pokemon
 */
export function getRarityConfig(pokemon: any): RarityConfig {
  const rarity = getPokemonRarity(pokemon);
  return rarityConfigs[rarity];
}

/**
 * Classes CSS pour les cadres de rareté
 */
export function getRarityBorderClasses(pokemon: any): string {
  const config = getRarityConfig(pokemon);
  return `${config.borderColor} border-2`;
}

/**
 * Classes CSS pour les badges de rareté
 */
export function getRarityBadgeClasses(pokemon: any): string {
  const config = getRarityConfig(pokemon);
  return `${config.bgColor} ${config.textColor} border ${config.borderColor}`;
}