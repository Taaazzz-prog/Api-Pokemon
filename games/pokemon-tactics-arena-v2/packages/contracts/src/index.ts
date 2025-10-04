// Re-export all types and schemas
export * from './types';
export * from './schemas';

// Package version
export const VERSION = '1.0.0';

// Common constants
export const CONSTANTS = {
  MAX_TEAM_SIZE: 6,
  MIN_TEAM_SIZE: 1,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_PASSWORD_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6,
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
  
  // Game constants
  MAX_POKEMON_LEVEL: 100,
  MIN_POKEMON_LEVEL: 1,
  MAX_MOVES_PER_POKEMON: 4,
  
  // Currency constants
  STARTER_CREDITS: 1000,
  STARTER_GEMS: 50,
  
  // Battle constants
  MAX_BATTLE_DURATION: 1800, // 30 minutes in seconds
  
  // Rarity order
  RARITY_ORDER: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const,
} as const;