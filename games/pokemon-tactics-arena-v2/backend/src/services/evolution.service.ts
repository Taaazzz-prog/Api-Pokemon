import { prisma } from '../database/connection';
import { CurrencyService } from './currency.service';
import { logger } from '../utils/logger';

export interface EvolutionRequirement {
  type: 'LEVEL' | 'ITEM' | 'TRADE' | 'FRIENDSHIP' | 'TIME' | 'STONE' | 'SPECIAL';
  value?: number;
  itemId?: string;
  timeOfDay?: 'DAY' | 'NIGHT';
  location?: string;
  additionalConditions?: any;
}

export interface EvolutionChain {
  pokemonId: string;
  evolvesTo: {
    pokemonId: string;
    requirements: EvolutionRequirement[];
  }[];
}

export interface EvolutionResult {
  success: boolean;
  newPokemon?: any;
  consumedItems?: any[];
  error?: string;
}

export class EvolutionService {
  private currencyService = new CurrencyService();

  /**
   * Get evolution chains for all Pokemon
   */
  async getEvolutionChains(): Promise<EvolutionChain[]> {
    // This would normally come from a database, but for now we'll define some examples
    const evolutionChains: EvolutionChain[] = [
      // Starter Pokemon Examples
      {
        pokemonId: 'bulbasaur',
        evolvesTo: [{
          pokemonId: 'ivysaur',
          requirements: [{ type: 'LEVEL', value: 16 }]
        }]
      },
      {
        pokemonId: 'ivysaur',
        evolvesTo: [{
          pokemonId: 'venusaur',
          requirements: [{ type: 'LEVEL', value: 32 }]
        }]
      },
      {
        pokemonId: 'charmander',
        evolvesTo: [{
          pokemonId: 'charmeleon',
          requirements: [{ type: 'LEVEL', value: 16 }]
        }]
      },
      {
        pokemonId: 'charmeleon',
        evolvesTo: [{
          pokemonId: 'charizard',
          requirements: [{ type: 'LEVEL', value: 36 }]
        }]
      },
      {
        pokemonId: 'squirtle',
        evolvesTo: [{
          pokemonId: 'wartortle',
          requirements: [{ type: 'LEVEL', value: 16 }]
        }]
      },
      {
        pokemonId: 'wartortle',
        evolvesTo: [{
          pokemonId: 'blastoise',
          requirements: [{ type: 'LEVEL', value: 36 }]
        }]
      },

      // Stone Evolution Examples
      {
        pokemonId: 'pikachu',
        evolvesTo: [{
          pokemonId: 'raichu',
          requirements: [{ type: 'STONE', itemId: 'thunder_stone' }]
        }]
      },
      {
        pokemonId: 'eevee',
        evolvesTo: [
          {
            pokemonId: 'vaporeon',
            requirements: [{ type: 'STONE', itemId: 'water_stone' }]
          },
          {
            pokemonId: 'jolteon',
            requirements: [{ type: 'STONE', itemId: 'thunder_stone' }]
          },
          {
            pokemonId: 'flareon',
            requirements: [{ type: 'STONE', itemId: 'fire_stone' }]
          },
          {
            pokemonId: 'espeon',
            requirements: [{ type: 'FRIENDSHIP', value: 220, timeOfDay: 'DAY' }]
          },
          {
            pokemonId: 'umbreon',
            requirements: [{ type: 'FRIENDSHIP', value: 220, timeOfDay: 'NIGHT' }]
          }
        ]
      },

      // Trade Evolution Examples
      {
        pokemonId: 'machoke',
        evolvesTo: [{
          pokemonId: 'machamp',
          requirements: [{ type: 'TRADE' }]
        }]
      },
      {
        pokemonId: 'kadabra',
        evolvesTo: [{
          pokemonId: 'alakazam',
          requirements: [{ type: 'TRADE' }]
        }]
      }
    ];

    return evolutionChains;
  }

  /**
   * Get possible evolutions for a specific Pokemon
   */
  async getPokemonEvolutions(pokemonId: string): Promise<EvolutionChain | null> {
    const chains = await this.getEvolutionChains();
    return chains.find(chain => chain.pokemonId === pokemonId) || null;
  }

  /**
   * Check if Pokemon can evolve
   */
  async canEvolve(
    userId: string,
    rosterPokemonId: string
  ): Promise<{
    canEvolve: boolean;
    availableEvolutions: Array<{
      targetPokemon: any;
      requirements: EvolutionRequirement[];
      meetsRequirements: boolean;
      missingRequirements: string[];
    }>;
  }> {
    
    // Get roster Pokemon
    const rosterPokemon = await prisma.rosterEntry.findFirst({
      where: { id: rosterPokemonId, userId },
      include: { pokemon: true }
    });

    if (!rosterPokemon) {
      throw new Error('Pokemon not found in roster');
    }

    // Get evolution chain
    const evolutionChain = await this.getPokemonEvolutions(rosterPokemon.pokemon.id);

    if (!evolutionChain || evolutionChain.evolvesTo.length === 0) {
      return {
        canEvolve: false,
        availableEvolutions: []
      };
    }

    // Check each possible evolution
    const availableEvolutions = [];
    let canEvolveAny = false;

    for (const evolution of evolutionChain.evolvesTo) {
      // Get target Pokemon data
      const targetPokemon = await prisma.pokemon.findUnique({
        where: { id: evolution.pokemonId }
      });

      if (!targetPokemon) continue;

      // Check requirements
      const requirementCheck = await this.checkEvolutionRequirements(
        userId,
        rosterPokemon,
        evolution.requirements
      );

      availableEvolutions.push({
        targetPokemon,
        requirements: evolution.requirements,
        meetsRequirements: requirementCheck.meetsAll,
        missingRequirements: requirementCheck.missing
      });

      if (requirementCheck.meetsAll) {
        canEvolveAny = true;
      }
    }

    return {
      canEvolve: canEvolveAny,
      availableEvolutions
    };
  }

  /**
   * Evolve Pokemon
   */
  async evolvePokemon(
    userId: string,
    rosterPokemonId: string,
    targetPokemonId: string
  ): Promise<EvolutionResult> {
    
    return await prisma.$transaction(async (tx) => {
      // Get roster Pokemon
      const rosterPokemon = await tx.rosterEntry.findFirst({
        where: { id: rosterPokemonId, userId },
        include: { pokemon: true }
      });

      if (!rosterPokemon) {
        return { success: false, error: 'Pokemon not found in roster' };
      }

      // Check if Pokemon is locked
      if (rosterPokemon.isLocked) {
        return { success: false, error: 'Cannot evolve locked Pokemon' };
      }

      // Get evolution chain
      const evolutionChain = await this.getPokemonEvolutions(rosterPokemon.pokemon.id);
      
      if (!evolutionChain) {
        return { success: false, error: 'This Pokemon cannot evolve' };
      }

      // Find the specific evolution
      const targetEvolution = evolutionChain.evolvesTo.find(
        evo => evo.pokemonId === targetPokemonId
      );

      if (!targetEvolution) {
        return { success: false, error: 'Invalid evolution target' };
      }

      // Check requirements
      const requirementCheck = await this.checkEvolutionRequirements(
        userId,
        rosterPokemon,
        targetEvolution.requirements
      );

      if (!requirementCheck.meetsAll) {
        return {
          success: false,
          error: `Requirements not met: ${requirementCheck.missing.join(', ')}`
        };
      }

      // Get target Pokemon data
      const targetPokemon = await tx.pokemon.findUnique({
        where: { id: targetPokemonId }
      });

      if (!targetPokemon) {
        return { success: false, error: 'Target Pokemon not found' };
      }

      // Consume evolution items/requirements
      const consumedItems = await this.consumeEvolutionRequirements(
        userId,
        targetEvolution.requirements,
        tx
      );

      // Calculate evolved Pokemon stats
      const evolvedStats = this.calculateEvolvedStats(rosterPokemon, targetPokemon);

      // Update roster entry
      const evolvedPokemon = await tx.rosterEntry.update({
        where: { id: rosterPokemonId },
        data: {
          pokemonId: targetPokemonId,
          level: evolvedStats.level,
          experience: evolvedStats.experience,
          customStats: evolvedStats.customStats,
          obtainedFrom: `evolved_from_${rosterPokemon.pokemon.name}`
        },
        include: { pokemon: true }
      });

      // Log evolution
      logger.info(
        `User ${userId} evolved ${rosterPokemon.pokemon.name} to ${targetPokemon.name} (Level ${evolvedStats.level})`
      );

      // Create evolution record
      await tx.evolutionHistory.create({
        data: {
          userId,
          fromPokemonId: rosterPokemon.pokemon.id,
          toPokemonId: targetPokemonId,
          rosterEntryId: rosterPokemonId,
          requirements: targetEvolution.requirements,
          evolvedAt: new Date()
        }
      });

      return {
        success: true,
        newPokemon: evolvedPokemon,
        consumedItems
      };
    });
  }

  /**
   * Check if evolution requirements are met
   */
  private async checkEvolutionRequirements(
    userId: string,
    rosterPokemon: any,
    requirements: EvolutionRequirement[]
  ): Promise<{ meetsAll: boolean; missing: string[] }> {
    
    const missing: string[] = [];

    for (const requirement of requirements) {
      switch (requirement.type) {
        case 'LEVEL':
          if (rosterPokemon.level < (requirement.value || 0)) {
            missing.push(`Level ${requirement.value} required (current: ${rosterPokemon.level})`);
          }
          break;

        case 'STONE':
        case 'ITEM':
          if (requirement.itemId) {
            const hasItem = await prisma.userInventory.findFirst({
              where: {
                userId,
                itemType: requirement.itemId,
                quantity: { gte: 1 }
              }
            });

            if (!hasItem) {
              missing.push(`Required item: ${requirement.itemId}`);
            }
          }
          break;

        case 'FRIENDSHIP':
          // For simplicity, we'll assume friendship is based on level and time owned
          const friendshipLevel = this.calculateFriendship(rosterPokemon);
          if (friendshipLevel < (requirement.value || 220)) {
            missing.push(`Friendship ${requirement.value} required (current: ${friendshipLevel})`);
          }

          // Check time of day if required
          if (requirement.timeOfDay) {
            const currentHour = new Date().getHours();
            const isDay = currentHour >= 6 && currentHour < 20;
            const requiredTimeOfDay = requirement.timeOfDay === 'DAY';

            if (isDay !== requiredTimeOfDay) {
              missing.push(`Must evolve during ${requirement.timeOfDay.toLowerCase()}`);
            }
          }
          break;

        case 'TRADE':
          // For now, we'll simulate trade evolution with a currency cost
          const tradeCost = 1000; // 1000 credits to simulate trade
          const userBalance = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
          });

          if (!userBalance || userBalance.credits < tradeCost) {
            missing.push(`${tradeCost} credits required for trade evolution`);
          }
          break;

        case 'TIME':
          // Check if Pokemon was obtained long enough ago
          const hoursOwned = (Date.now() - rosterPokemon.obtainedAt.getTime()) / (1000 * 60 * 60);
          if (hoursOwned < (requirement.value || 24)) {
            missing.push(`Must own Pokemon for ${requirement.value} hours`);
          }
          break;

        case 'SPECIAL':
          // Handle special conditions based on additional data
          const specialCheck = this.checkSpecialRequirement(rosterPokemon, requirement);
          if (!specialCheck.met) {
            missing.push(specialCheck.reason);
          }
          break;
      }
    }

    return {
      meetsAll: missing.length === 0,
      missing
    };
  }

  /**
   * Consume items/currency for evolution
   */
  private async consumeEvolutionRequirements(
    userId: string,
    requirements: EvolutionRequirement[],
    tx: any
  ): Promise<any[]> {
    
    const consumedItems = [];

    for (const requirement of requirements) {
      switch (requirement.type) {
        case 'STONE':
        case 'ITEM':
          if (requirement.itemId) {
            // Remove item from inventory
            const inventoryItem = await tx.userInventory.findFirst({
              where: {
                userId,
                itemType: requirement.itemId,
                quantity: { gte: 1 }
              }
            });

            if (inventoryItem) {
              await tx.userInventory.update({
                where: { id: inventoryItem.id },
                data: { quantity: { decrement: 1 } }
              });

              // Remove if quantity becomes 0
              if (inventoryItem.quantity === 1) {
                await tx.userInventory.delete({
                  where: { id: inventoryItem.id }
                });
              }

              consumedItems.push({
                type: 'item',
                itemId: requirement.itemId,
                quantity: 1
              });
            }
          }
          break;

        case 'TRADE':
          // Consume trade evolution cost
          const tradeCost = 1000;
          await tx.user.update({
            where: { id: userId },
            data: { credits: { decrement: tradeCost } }
          });

          await tx.transaction.create({
            data: {
              userId,
              type: 'DEBIT',
              amount: tradeCost,
              source: 'Trade evolution cost',
              metadata: { evolutionType: 'TRADE' }
            }
          });

          consumedItems.push({
            type: 'currency',
            currency: 'credits',
            amount: tradeCost
          });
          break;
      }
    }

    return consumedItems;
  }

  /**
   * Calculate evolved Pokemon stats
   */
  private calculateEvolvedStats(rosterPokemon: any, targetPokemon: any): any {
    // Keep the same level and experience
    const level = rosterPokemon.level;
    const experience = rosterPokemon.experience;

    // Calculate new stats based on evolution
    // For simplicity, we'll apply a multiplier to base stats
    const evolutionMultiplier = 1.3; // 30% stat boost on evolution
    
    const currentStats = rosterPokemon.customStats || rosterPokemon.pokemon.baseStats;
    const newBaseStats = targetPokemon.baseStats;
    
    const evolvedStats = {
      hp: Math.floor((currentStats.hp || newBaseStats.hp) * evolutionMultiplier),
      attack: Math.floor((currentStats.attack || newBaseStats.attack) * evolutionMultiplier),
      defense: Math.floor((currentStats.defense || newBaseStats.defense) * evolutionMultiplier),
      spAttack: Math.floor((currentStats.spAttack || newBaseStats.spAttack) * evolutionMultiplier),
      spDefense: Math.floor((currentStats.spDefense || newBaseStats.spDefense) * evolutionMultiplier),
      speed: Math.floor((currentStats.speed || newBaseStats.speed) * evolutionMultiplier)
    };

    return {
      level,
      experience,
      customStats: evolvedStats
    };
  }

  /**
   * Calculate friendship level
   */
  private calculateFriendship(rosterPokemon: any): number {
    const baseAppiness = 70;
    const levelBonus = rosterPokemon.level * 2;
    const timeBonus = Math.min(50, Math.floor(
      (Date.now() - rosterPokemon.obtainedAt.getTime()) / (1000 * 60 * 60 * 24) * 5
    )); // 5 points per day, max 50

    return Math.min(255, baseAppiness + levelBonus + timeBonus);
  }

  /**
   * Check special evolution requirements
   */
  private checkSpecialRequirement(
    rosterPokemon: any,
    requirement: EvolutionRequirement
  ): { met: boolean; reason: string } {
    
    // Handle custom special requirements
    const conditions = requirement.additionalConditions || {};

    // Example: Tyrogue evolution based on stats
    if (rosterPokemon.pokemon.name.toLowerCase() === 'tyrogue') {
      const stats = rosterPokemon.customStats || rosterPokemon.pokemon.baseStats;
      
      if (conditions.evolution === 'hitmonlee' && stats.attack <= stats.defense) {
        return { met: false, reason: 'Attack must be higher than Defense' };
      }
      
      if (conditions.evolution === 'hitmonchan' && stats.defense <= stats.attack) {
        return { met: false, reason: 'Defense must be higher than Attack' };
      }
      
      if (conditions.evolution === 'hitmontop' && stats.attack !== stats.defense) {
        return { met: false, reason: 'Attack and Defense must be equal' };
      }
    }

    return { met: true, reason: '' };
  }

  /**
   * Get evolution history for user
   */
  async getEvolutionHistory(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ evolutions: any[]; pagination: any }> {
    
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const evolutions = await prisma.evolutionHistory.findMany({
      where: { userId },
      include: {
        fromPokemon: true,
        toPokemon: true
      },
      orderBy: { evolvedAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.evolutionHistory.count({
      where: { userId }
    });

    return {
      evolutions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get evolution statistics
   */
  async getEvolutionStats(userId: string): Promise<any> {
    const stats = await prisma.evolutionHistory.aggregate({
      where: { userId },
      _count: { id: true }
    });

    const recentEvolutions = await prisma.evolutionHistory.findMany({
      where: { 
        userId,
        evolvedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      select: { id: true }
    });

    return {
      totalEvolutions: stats._count.id,
      evolutionsThisWeek: recentEvolutions.length,
      averageEvolutionsPerWeek: Math.round(stats._count.id / Math.max(1, 
        Math.ceil((Date.now() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000))
      ))
    };
  }
}

export const evolutionService = new EvolutionService();