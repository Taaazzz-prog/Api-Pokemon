// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export interface RosterPokemon {
  id: string;
  pokemon: {
    id: string;
    name: string;
    type1: string;
    type2?: string;
    baseStats: any;
    rarity: string;
    generation: number;
  };
  nickname?: string;
  level: number;
  experience: number;
  customStats?: any;
  obtainedFrom: string;
  obtainedAt: Date;
  isLocked: boolean;
  isInTeam: boolean;
}

export interface Team {
  id: string;
  name: string;
  pokemon: RosterPokemon[];
  isActive: boolean;
  formations?: any;
}

export interface RosterStats {
  totalPokemon: number;
  byRarity: Record<string, number>;
  byType: Record<string, number>;
  byGeneration: Record<string, number>;
  averageLevel: number;
  highestLevel: number;
}

export class RosterService {

  /**
   * Get user's complete roster
   */
  async getRoster(
    userId: string,
    filters: {
      type?: string;
      rarity?: string;
      generation?: number;
      minLevel?: number;
      maxLevel?: number;
      isInTeam?: boolean;
      search?: string;
      sortBy?: 'level' | 'name' | 'rarity' | 'obtainedAt';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ pokemon: RosterPokemon[]; pagination: any; stats: RosterStats }> {
    
    const {
      type,
      rarity,
      generation,
      minLevel,
      maxLevel,
      isInTeam,
      search,
      sortBy = 'obtainedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = filters;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (type) {
      where.pokemon = {
        OR: [
          { type1: type },
          { type2: type }
        ]
      };
    }

    if (rarity) {
      where.pokemon = { ...where.pokemon, rarity };
    }

    if (generation) {
      where.pokemon = { ...where.pokemon, generation };
    }

    if (minLevel !== undefined) {
      where.level = { gte: minLevel };
    }

    if (maxLevel !== undefined) {
      where.level = { ...where.level, lte: maxLevel };
    }

    if (isInTeam !== undefined) {
      where.isInTeam = isInTeam;
    }

    if (search) {
      where.OR = [
        { pokemon: { name: { contains: search, mode: 'insensitive' } } },
        { nickname: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { pokemon: { name: sortOrder } };
        break;
      case 'level':
        orderBy = { level: sortOrder };
        break;
      case 'rarity':
        orderBy = { pokemon: { rarity: sortOrder } };
        break;
      case 'obtainedAt':
      default:
        orderBy = { obtainedAt: sortOrder };
        break;
    }

    // Get roster entries
    const rosterEntries = await prisma.rosterEntry.findMany({
      where,
      include: {
        pokemon: true,
        teamSlots: {
          include: { team: true }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    });

    // Get total count
    const total = await prisma.rosterEntry.count({ where });

    // Transform to RosterPokemon format
    const pokemon: RosterPokemon[] = rosterEntries.map(entry => ({
      id: entry.id,
      pokemon: {
        id: entry.pokemon.id,
        name: entry.pokemon.name,
        type1: entry.pokemon.type1,
        type2: entry.pokemon.type2,
        baseStats: entry.pokemon.baseStats,
        rarity: entry.pokemon.rarity,
        generation: entry.pokemon.generation
      },
      nickname: entry.nickname,
      level: entry.level,
      experience: entry.experience,
      customStats: entry.customStats,
      obtainedFrom: entry.obtainedFrom,
      obtainedAt: entry.obtainedAt,
      isLocked: entry.isLocked,
      isInTeam: entry.teamSlots.length > 0
    }));

    // Calculate stats
    const stats = await this.calculateRosterStats(userId);

    return {
      pokemon,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    };
  }

  /**
   * Get specific Pokemon from roster
   */
  async getRosterPokemon(userId: string, rosterPokemonId: string): Promise<RosterPokemon | null> {
    const entry = await prisma.rosterEntry.findFirst({
      where: {
        id: rosterPokemonId,
        userId
      },
      include: {
        pokemon: true,
        teamSlots: { include: { team: true } }
      }
    });

    if (!entry) return null;

    return {
      id: entry.id,
      pokemon: {
        id: entry.pokemon.id,
        name: entry.pokemon.name,
        type1: entry.pokemon.type1,
        type2: entry.pokemon.type2,
        baseStats: entry.pokemon.baseStats,
        rarity: entry.pokemon.rarity,
        generation: entry.pokemon.generation
      },
      nickname: entry.nickname,
      level: entry.level,
      experience: entry.experience,
      customStats: entry.customStats,
      obtainedFrom: entry.obtainedFrom,
      obtainedAt: entry.obtainedAt,
      isLocked: entry.isLocked,
      isInTeam: entry.teamSlots.length > 0
    };
  }

  /**
   * Update Pokemon nickname
   */
  async updateNickname(
    userId: string,
    rosterPokemonId: string,
    nickname: string
  ): Promise<RosterPokemon> {
    
    // Validate ownership
    const exists = await prisma.rosterEntry.findFirst({
      where: { id: rosterPokemonId, userId }
    });

    if (!exists) {
      throw new Error('Pokemon not found in roster');
    }

    // Update nickname
    await prisma.rosterEntry.update({
      where: { id: rosterPokemonId },
      data: { nickname: nickname.trim() || null }
    });

    // Return updated Pokemon
    const updated = await this.getRosterPokemon(userId, rosterPokemonId);
    if (!updated) throw new Error('Failed to retrieve updated Pokemon');

    logger.info(`User ${userId} updated nickname for Pokemon ${rosterPokemonId} to "${nickname}"`);
    return updated;
  }

  /**
   * Lock/unlock Pokemon
   */
  async toggleLock(
    userId: string,
    rosterPokemonId: string,
    isLocked: boolean
  ): Promise<RosterPokemon> {
    
    // Validate ownership
    const exists = await prisma.rosterEntry.findFirst({
      where: { id: rosterPokemonId, userId }
    });

    if (!exists) {
      throw new Error('Pokemon not found in roster');
    }

    // Update lock status
    await prisma.rosterEntry.update({
      where: { id: rosterPokemonId },
      data: { isLocked }
    });

    // Return updated Pokemon
    const updated = await this.getRosterPokemon(userId, rosterPokemonId);
    if (!updated) throw new Error('Failed to retrieve updated Pokemon');

    logger.info(`User ${userId} ${isLocked ? 'locked' : 'unlocked'} Pokemon ${rosterPokemonId}`);
    return updated;
  }

  /**
   * Release Pokemon (remove from roster)
   */
  async releasePokemon(
    userId: string,
    rosterPokemonIds: string[]
  ): Promise<{ released: number; rewards: any }> {
    
    return await prisma.$transaction(async (tx) => {
      // Check all Pokemon exist and are not locked
      const pokemon = await tx.rosterEntry.findMany({
        where: {
          id: { in: rosterPokemonIds },
          userId,
          isLocked: false
        },
        include: { pokemon: true }
      });

      if (pokemon.length !== rosterPokemonIds.length) {
        throw new Error('Some Pokemon not found or are locked');
      }

      // Check if any are in teams
      const inTeams = await tx.teamSlot.findMany({
        where: { rosterEntryId: { in: rosterPokemonIds } }
      });

      if (inTeams.length > 0) {
        throw new Error('Cannot release Pokemon that are in teams');
      }

      // Calculate release rewards
      const totalLevel = pokemon.reduce((sum, p) => sum + p.level, 0);
      const totalRarity = pokemon.reduce((sum, p) => {
        const rarityValues = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };
        return sum + (rarityValues[p.pokemon.rarity as keyof typeof rarityValues] || 1);
      }, 0);

      const creditReward = totalLevel * 10 + totalRarity * 50;

      // Remove Pokemon from roster
      await tx.rosterEntry.deleteMany({
        where: { id: { in: rosterPokemonIds } }
      });

      // Add currency reward
      await tx.transaction.create({
        data: {
          userId,
          type: 'CREDIT',
          amount: creditReward,
          source: `Released ${pokemon.length} Pokemon`,
          metadata: {
            releasedPokemon: pokemon.map(p => ({
              id: p.id,
              name: p.pokemon.name,
              level: p.level
            }))
          }
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: creditReward }
        }
      });

      logger.info(`User ${userId} released ${pokemon.length} Pokemon for ${creditReward} credits`);

      return {
        released: pokemon.length,
        rewards: {
          credits: creditReward
        }
      };
    });
  }

  /**
   * Get user's teams
   */
  async getTeams(userId: string): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { userId },
      include: {
        slots: {
          include: {
            rosterEntry: {
              include: { pokemon: true }
            }
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return teams.map(team => ({
      id: team.id,
      name: team.name,
      isActive: team.isActive,
      formations: team.formations,
      pokemon: team.slots.map(slot => ({
        id: slot.rosterEntry.id,
        pokemon: {
          id: slot.rosterEntry.pokemon.id,
          name: slot.rosterEntry.pokemon.name,
          type1: slot.rosterEntry.pokemon.type1,
          type2: slot.rosterEntry.pokemon.type2,
          baseStats: slot.rosterEntry.pokemon.baseStats,
          rarity: slot.rosterEntry.pokemon.rarity,
          generation: slot.rosterEntry.pokemon.generation
        },
        nickname: slot.rosterEntry.nickname,
        level: slot.rosterEntry.level,
        experience: slot.rosterEntry.experience,
        customStats: slot.rosterEntry.customStats,
        obtainedFrom: slot.rosterEntry.obtainedFrom,
        obtainedAt: slot.rosterEntry.obtainedAt,
        isLocked: slot.rosterEntry.isLocked,
        isInTeam: true
      }))
    }));
  }

  /**
   * Create new team
   */
  async createTeam(
    userId: string,
    name: string,
    pokemonIds: string[] = []
  ): Promise<Team> {
    
    if (pokemonIds.length > 6) {
      throw new Error('Team cannot have more than 6 Pokemon');
    }

    return await prisma.$transaction(async (tx) => {
      // Check if user already has max teams (let's say 5)
      const existingTeams = await tx.team.count({
        where: { userId }
      });

      if (existingTeams >= 5) {
        throw new Error('Maximum number of teams reached');
      }

      // Validate all Pokemon belong to user
      if (pokemonIds.length > 0) {
        const validPokemon = await tx.rosterEntry.count({
          where: {
            id: { in: pokemonIds },
            userId
          }
        });

        if (validPokemon !== pokemonIds.length) {
          throw new Error('Some Pokemon do not belong to you');
        }
      }

      // Create team
      const team = await tx.team.create({
        data: {
          userId,
          name: name.trim(),
          isActive: existingTeams === 0 // First team is active by default
        }
      });

      // Add Pokemon to team
      for (let i = 0; i < pokemonIds.length; i++) {
        await tx.teamSlot.create({
          data: {
            teamId: team.id,
            rosterEntryId: pokemonIds[i],
            position: i + 1
          }
        });
      }

      logger.info(`User ${userId} created team "${name}" with ${pokemonIds.length} Pokemon`);

      // Return full team data
      const teams = await this.getTeams(userId);
      return teams.find(t => t.id === team.id)!;
    });
  }

  /**
   * Update team composition
   */
  async updateTeam(
    userId: string,
    teamId: string,
    updates: {
      name?: string;
      pokemonIds?: string[];
      isActive?: boolean;
    }
  ): Promise<Team> {
    
    return await prisma.$transaction(async (tx) => {
      // Validate team ownership
      const team = await tx.team.findFirst({
        where: { id: teamId, userId }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      // Update team properties
      const updateData: any = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
      }
      if (updates.isActive !== undefined) {
        updateData.isActive = updates.isActive;
        
        // If setting as active, deactivate other teams
        if (updates.isActive) {
          await tx.team.updateMany({
            where: { userId, id: { not: teamId } },
            data: { isActive: false }
          });
        }
      }

      if (Object.keys(updateData).length > 0) {
        await tx.team.update({
          where: { id: teamId },
          data: updateData
        });
      }

      // Update Pokemon if provided
      if (updates.pokemonIds !== undefined) {
        if (updates.pokemonIds.length > 6) {
          throw new Error('Team cannot have more than 6 Pokemon');
        }

        // Validate Pokemon ownership
        if (updates.pokemonIds.length > 0) {
          const validPokemon = await tx.rosterEntry.count({
            where: {
              id: { in: updates.pokemonIds },
              userId
            }
          });

          if (validPokemon !== updates.pokemonIds.length) {
            throw new Error('Some Pokemon do not belong to you');
          }
        }

        // Remove existing slots
        await tx.teamSlot.deleteMany({
          where: { teamId }
        });

        // Add new slots
        for (let i = 0; i < updates.pokemonIds.length; i++) {
          await tx.teamSlot.create({
            data: {
              teamId,
              rosterEntryId: updates.pokemonIds[i],
              position: i + 1
            }
          });
        }
      }

      logger.info(`User ${userId} updated team ${teamId}`);

      // Return updated team
      const teams = await this.getTeams(userId);
      return teams.find(t => t.id === teamId)!;
    });
  }

  /**
   * Delete team
   */
  async deleteTeam(userId: string, teamId: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      // Validate team ownership
      const team = await tx.team.findFirst({
        where: { id: teamId, userId }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      // Don't allow deleting if it's the only team
      const teamCount = await tx.team.count({
        where: { userId }
      });

      if (teamCount === 1) {
        throw new Error('Cannot delete your only team');
      }

      // Delete team slots first (cascade)
      await tx.teamSlot.deleteMany({
        where: { teamId }
      });

      // Delete team
      await tx.team.delete({
        where: { id: teamId }
      });

      // If this was the active team, make another team active
      if (team.isActive) {
        const firstTeam = await tx.team.findFirst({
          where: { userId }
        });

        if (firstTeam) {
          await tx.team.update({
            where: { id: firstTeam.id },
            data: { isActive: true }
          });
        }
      }

      logger.info(`User ${userId} deleted team ${teamId}`);
    });
  }

  /**
   * Calculate roster statistics
   */
  private async calculateRosterStats(userId: string): Promise<RosterStats> {
    const roster = await prisma.rosterEntry.findMany({
      where: { userId },
      include: { pokemon: true }
    });

    const stats: RosterStats = {
      totalPokemon: roster.length,
      byRarity: {},
      byType: {},
      byGeneration: {},
      averageLevel: 0,
      highestLevel: 0
    };

    if (roster.length === 0) return stats;

    let totalLevel = 0;
    let maxLevel = 0;

    for (const entry of roster) {
      // Rarity stats
      const rarity = entry.pokemon.rarity;
      stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;

      // Type stats
      const type1 = entry.pokemon.type1;
      stats.byType[type1] = (stats.byType[type1] || 0) + 1;
      
      if (entry.pokemon.type2) {
        const type2 = entry.pokemon.type2;
        stats.byType[type2] = (stats.byType[type2] || 0) + 1;
      }

      // Generation stats
      const generation = entry.pokemon.generation.toString();
      stats.byGeneration[generation] = (stats.byGeneration[generation] || 0) + 1;

      // Level stats
      totalLevel += entry.level;
      maxLevel = Math.max(maxLevel, entry.level);
    }

    stats.averageLevel = Math.round(totalLevel / roster.length);
    stats.highestLevel = maxLevel;

    return stats;
  }
}

export const rosterService = new RosterService();