import { logger } from '../utils/logger';

type PokemonRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

const PokemonRarity = {
  COMMON: 'COMMON' as const,
  UNCOMMON: 'UNCOMMON' as const,
  RARE: 'RARE' as const,
  EPIC: 'EPIC' as const,
  LEGENDARY: 'LEGENDARY' as const,
};

/**
 * Drop Rate Configuration
 */
export interface DropRateConfig {
  [PokemonRarity.COMMON]: number;
  [PokemonRarity.UNCOMMON]: number;
  [PokemonRarity.RARE]: number;
  [PokemonRarity.EPIC]: number;
  [PokemonRarity.LEGENDARY]: number;
}

/**
 * Rarity System Service
 */
export class RarityService {
  /**
   * Default drop rates for starter pack (must sum to 100)
   */
  private readonly starterDropRates: DropRateConfig = {
    [PokemonRarity.COMMON]: 50.0,     // 50%
    [PokemonRarity.UNCOMMON]: 30.0,   // 30%
    [PokemonRarity.RARE]: 15.0,       // 15%
    [PokemonRarity.EPIC]: 4.5,        // 4.5%
    [PokemonRarity.LEGENDARY]: 0.5,   // 0.5%
  };

  /**
   * Premium pack drop rates (better odds)
   */
  private readonly premiumDropRates: DropRateConfig = {
    [PokemonRarity.COMMON]: 30.0,     // 30%
    [PokemonRarity.UNCOMMON]: 35.0,   // 35%
    [PokemonRarity.RARE]: 25.0,       // 25%
    [PokemonRarity.EPIC]: 8.0,        // 8%
    [PokemonRarity.LEGENDARY]: 2.0,   // 2%
  };

  /**
   * Event pack drop rates (special events)
   */
  private readonly eventDropRates: DropRateConfig = {
    [PokemonRarity.COMMON]: 20.0,     // 20%
    [PokemonRarity.UNCOMMON]: 30.0,   // 30%
    [PokemonRarity.RARE]: 30.0,       // 30%
    [PokemonRarity.EPIC]: 15.0,       // 15%
    [PokemonRarity.LEGENDARY]: 5.0,   // 5%
  };

  /**
   * Generate random rarity based on drop rates
   */
  generateRarity(packType: 'starter' | 'premium' | 'event' = 'starter'): PokemonRarity {
    const dropRates = this.getDropRates(packType);
    const random = Math.random() * 100; // 0-100
    
    let cumulative = 0;
    for (const [rarity, rate] of Object.entries(dropRates)) {
      cumulative += rate;
      if (random <= cumulative) {
        logger.debug('Rarity generated', { rarity, random, cumulative, packType });
        return rarity as PokemonRarity;
      }
    }
    
    // Fallback to common (should never happen if rates sum to 100)
    logger.warn('Rarity generation fallback to COMMON', { random, packType });
    return PokemonRarity.COMMON;
  }

  /**
   * Generate multiple rarities for a pack
   */
  generatePackRarities(count: number, packType: 'starter' | 'premium' | 'event' = 'starter'): PokemonRarity[] {
    const rarities: PokemonRarity[] = [];
    
    for (let i = 0; i < count; i++) {
      rarities.push(this.generateRarity(packType));
    }
    
    logger.info('Pack rarities generated', { count, packType, rarities });
    return rarities;
  }

  /**
   * Get drop rates for pack type
   */
  getDropRates(packType: 'starter' | 'premium' | 'event'): DropRateConfig {
    switch (packType) {
      case 'premium':
        return this.premiumDropRates;
      case 'event':
        return this.eventDropRates;
      case 'starter':
      default:
        return this.starterDropRates;
    }
  }

  /**
   * Calculate rarity bonus multiplier for rewards
   */
  getRarityMultiplier(rarity: PokemonRarity): number {
    switch (rarity) {
      case PokemonRarity.COMMON:
        return 1.0;
      case PokemonRarity.UNCOMMON:
        return 1.2;
      case PokemonRarity.RARE:
        return 1.5;
      case PokemonRarity.EPIC:
        return 2.0;
      case PokemonRarity.LEGENDARY:
        return 3.0;
      default:
        return 1.0;
    }
  }

  /**
   * Get rarity display information
   */
  getRarityInfo(rarity: PokemonRarity): { name: string; color: string; emoji: string } {
    switch (rarity) {
      case PokemonRarity.COMMON:
        return { name: 'Common', color: '#6B7280', emoji: '⚪' };
      case PokemonRarity.UNCOMMON:
        return { name: 'Uncommon', color: '#10B981', emoji: '🟢' };
      case PokemonRarity.RARE:
        return { name: 'Rare', color: '#3B82F6', emoji: '🔵' };
      case PokemonRarity.EPIC:
        return { name: 'Epic', color: '#8B5CF6', emoji: '🟣' };
      case PokemonRarity.LEGENDARY:
        return { name: 'Legendary', color: '#F59E0B', emoji: '🟡' };
      default:
        return { name: 'Unknown', color: '#6B7280', emoji: '⚪' };
    }
  }

  /**
   * Get all rarities sorted by value (common -> legendary)
   */
  getAllRarities(): PokemonRarity[] {
    return [
      PokemonRarity.COMMON,
      PokemonRarity.UNCOMMON,
      PokemonRarity.RARE,
      PokemonRarity.EPIC,
      PokemonRarity.LEGENDARY,
    ];
  }

  /**
   * Calculate pack value based on rarities
   */
  calculatePackValue(rarities: PokemonRarity[]): number {
    return rarities.reduce((total, rarity) => {
      return total + this.getRarityMultiplier(rarity);
    }, 0);
  }

  /**
   * Validate drop rates configuration
   */
  validateDropRates(dropRates: DropRateConfig): boolean {
    const total = Object.values(dropRates).reduce((sum, rate) => sum + rate, 0);
    const isValid = Math.abs(total - 100) < 0.01; // Allow for floating point precision
    
    if (!isValid) {
      logger.error('Invalid drop rates configuration', { dropRates, total });
    }
    
    return isValid;
  }

  /**
   * Get starter pack configuration (MVP)
   */
  getStarterPackConfig(): { count: number; packType: 'starter'; guaranteed?: PokemonRarity } {
    return {
      count: 3,
      packType: 'starter',
      guaranteed: PokemonRarity.UNCOMMON, // At least one uncommon
    };
  }

  /**
   * Generate starter pack with guaranteed rarity
   */
  generateStarterPack(): PokemonRarity[] {
    const config = this.getStarterPackConfig();
    const rarities: PokemonRarity[] = [];
    
    // Add guaranteed rarity first
    if (config.guaranteed) {
      rarities.push(config.guaranteed);
    }
    
    // Fill remaining slots
    const remaining = config.count - rarities.length;
    rarities.push(...this.generatePackRarities(remaining, config.packType));
    
    // Shuffle the array
    for (let i = rarities.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rarities[i], rarities[j]] = [rarities[j], rarities[i]];
    }
    
    logger.info('Starter pack generated', { rarities, config });
    return rarities;
  }
}

export const rarityService = new RarityService();