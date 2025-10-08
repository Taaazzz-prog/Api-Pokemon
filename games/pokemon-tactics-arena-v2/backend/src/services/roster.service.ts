import { Prisma } from '@prisma/client';
import { prisma } from '../database/connection';
import { logger } from '../utils/logger';

export interface RosterPokemonSummary {
  id: string;
  pokemonId: number;
  name: {
    fr: string;
    en: string;
    jp: string;
    display: string;
  };
  nickname: string | null;
  types: Array<{ id: number; name: string; color: string | null }>;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
  level: number;
  experience: number;
  obtainedFrom: string;
  obtainedAt: Date;
  isLocked: boolean;
  inTeams: string[];
  spriteRegular: string | null;
  spriteShiny: string | null;
  spriteGmax: string | null;
  sprites: {
    regular: string | null;
    shiny: string | null;
    gmax: string | null;
  };
}

export interface TeamSummary {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  gameMode: string;
  members: Array<{
    position: number;
    rosterPokemon: RosterPokemonSummary;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RosterStats {
  totalPokemon: number;
  byType: Record<string, number>;
  byGeneration: Record<string, number>;
  byRarity: Record<'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY', number>;
  averageLevel: number;
  highestLevel: number;
}

type RosterEntryPayload = Prisma.UserRosterGetPayload<{
  include: {
    pokemon: {
      include: {
        typeRelations: {
          include: {
            type: true;
          };
        };
      };
    };
    teamMembers: {
      include: {
        teamPreset: true;
      };
    };
  };
}>;

type TeamPresetPayload = Prisma.TeamPresetGetPayload<{
  include: {
    members: {
      orderBy: { position: 'asc' };
      include: {
        userRoster: {
          include: {
            pokemon: {
              include: {
                typeRelations: {
                  include: { type: true };
                };
              };
            };
            teamMembers: {
              include: { teamPreset: true };
            };
          };
        };
      };
    };
  };
}>;

const rarityFromTotalStats = (total: number): 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' => {
  if (total >= 600) return 'LEGENDARY';
  if (total >= 540) return 'EPIC';
  if (total >= 480) return 'RARE';
  if (total >= 420) return 'UNCOMMON';
  return 'COMMON';
};

class RosterService {
  async getRoster(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      generation?: number;
    } = {}
  ): Promise<{
    pokemon: RosterPokemonSummary[];
    pagination: { page: number; limit: number; total: number };
    stats: RosterStats;
  }> {
    const { page = 1, limit = 50, search, type, generation } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.UserRosterWhereInput = { userId };
    const pokemonFilter: Prisma.PokemonWhereInput = {};

    if (generation) {
      pokemonFilter.generation = generation;
    }

    if (type) {
      pokemonFilter.typeRelations = {
        some: {
          type: {
            name: { equals: type },
          },
        },
      };
    }

    if (Object.keys(pokemonFilter).length > 0) {
      where.pokemon = { is: pokemonFilter };
    }

    if (search) {
      where.OR = [
        { nickname: { contains: search } },
        { pokemon: { is: { nameFr: { contains: search } } } },
        { pokemon: { is: { nameEn: { contains: search } } } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.userRoster.findMany({
        where,
        orderBy: { obtainedAt: 'desc' },
        skip,
        take: limit,
        include: {
          pokemon: {
            include: {
              typeRelations: {
                include: { type: true },
              },
            },
          },
          teamMembers: {
            include: { teamPreset: true },
          },
        },
      }),
      prisma.userRoster.count({ where }),
    ]);

    const pokemon = entries.map((entry) => this.mapRosterEntry(entry));
    const stats = await this.calculateRosterStats(userId);

    return {
      pokemon,
      pagination: {
        page,
        limit,
        total,
      },
      stats,
    };
  }

  async getRosterPokemon(userId: string, rosterId: string): Promise<RosterPokemonSummary | null> {
    const entry = await prisma.userRoster.findFirst({
      where: { id: rosterId, userId },
      include: {
        pokemon: {
          include: {
            typeRelations: {
              include: { type: true },
            },
          },
        },
        teamMembers: {
          include: { teamPreset: true },
        },
      },
    });

    if (!entry) {
      return null;
    }

    return this.mapRosterEntry(entry);
  }

  async updateNickname(userId: string, rosterId: string, nickname: string): Promise<RosterPokemonSummary> {
    const updated = await prisma.userRoster.update({
      where: { id: rosterId, userId },
      data: { nickname: nickname.trim() || null },
      include: {
        pokemon: {
          include: {
            typeRelations: {
              include: { type: true },
            },
          },
        },
        teamMembers: {
          include: { teamPreset: true },
        },
      },
    });

    logger.info('Roster nickname updated', { userId, rosterId, nickname });
    return this.mapRosterEntry(updated);
  }

  async toggleLock(userId: string, rosterId: string, isLocked: boolean): Promise<RosterPokemonSummary> {
    const updated = await prisma.userRoster.update({
      where: { id: rosterId, userId },
      data: { isLocked },
      include: {
        pokemon: {
          include: {
            typeRelations: {
              include: { type: true },
            },
          },
        },
        teamMembers: {
          include: { teamPreset: true },
        },
      },
    });

    logger.info('Roster lock toggled', { userId, rosterId, isLocked });
    return this.mapRosterEntry(updated);
  }

  async releasePokemon(userId: string, rosterIds: string[]): Promise<{ released: number; rewards: { credits: number } }> {
    if (rosterIds.length === 0) {
      return { released: 0, rewards: { credits: 0 } };
    }

    return prisma.$transaction(async (tx) => {
      const entries = await tx.userRoster.findMany({
        where: {
          id: { in: rosterIds },
          userId,
        },
        include: {
          teamMembers: true,
          pokemon: true,
        },
      });

      if (entries.length !== rosterIds.length) {
        throw new Error('Some Pokémon are missing or do not belong to the user');
      }

      if (entries.some((entry) => entry.isLocked)) {
        throw new Error('Cannot release locked Pokémon');
      }

      if (entries.some((entry) => entry.teamMembers.length > 0)) {
        throw new Error('Remove Pokémon from teams before releasing them');
      }

      const profile = await tx.userProfile.findUnique({
        where: { userId },
        select: { pokeCredits: true },
      });

      if (!profile) {
        throw new Error('User profile not found');
      }

      const creditReward = entries.reduce((sum, entry) => sum + entry.level * 10 + 50, 0);

      await tx.userRoster.deleteMany({
        where: { id: { in: rosterIds } },
      });

      await tx.userProfile.update({
        where: { userId },
        data: {
          pokeCredits: { increment: creditReward },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'CREDIT',
          currency: 'POKE_CREDITS',
          amount: creditReward,
          balanceBefore: profile.pokeCredits,
          balanceAfter: profile.pokeCredits + creditReward,
          source: 'release_pokemon',
          metadata: {
            released: entries.map((entry) => ({
              rosterId: entry.id,
              pokemonId: entry.pokemonId,
              level: entry.level,
            })),
          },
        },
      });

      logger.info('Roster Pokémon released', { userId, count: entries.length, creditReward });
      return {
        released: entries.length,
        rewards: {
          credits: creditReward,
        },
      };
    });
  }

  async getTeams(userId: string): Promise<TeamSummary[]> {
    const teams = await prisma.teamPreset.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        members: {
          orderBy: { position: 'asc' },
          include: {
            userRoster: {
              include: {
                pokemon: {
                  include: {
                    typeRelations: {
                      include: { type: true },
                    },
                  },
                },
                teamMembers: {
                  include: { teamPreset: true },
                },
              },
            },
          },
        },
      },
    });

    return teams.map((team) => this.mapTeam(team));
  }

  async createTeam(userId: string, name: string, rosterIds: string[]): Promise<TeamSummary> {
    if (rosterIds.length === 0 || rosterIds.length > 6) {
      throw new Error('A team must contain between 1 and 6 Pokémon');
    }

    const sanitizedName = name.trim();
    if (!sanitizedName) {
      throw new Error('Team name is required');
    }

    return prisma.$transaction(async (tx) => {
      const rosterEntries = await tx.userRoster.findMany({
        where: { id: { in: rosterIds }, userId },
        select: { id: true, pokemonId: true },
      });

      if (rosterEntries.length !== rosterIds.length) {
        throw new Error('Some Pokémon do not belong to the user');
      }

      const pokemonIdByRoster = new Map(rosterEntries.map((entry) => [entry.id, entry.pokemonId]));

      const team = await tx.teamPreset.create({
        data: {
          userId,
          name: sanitizedName,
          gameMode: 'ARENA',
          isActive: false,
        },
      });

      await Promise.all(
        rosterIds.map((rosterId, index) =>
          tx.teamMember.create({
            data: {
              teamPresetId: team.id,
              userRosterId: rosterId,
              pokemonId: pokemonIdByRoster.get(rosterId)!,
              position: index + 1,
            },
          })
        )
      );

      const fullTeam = await tx.teamPreset.findUnique({
        where: { id: team.id },
        include: {
          members: {
            orderBy: { position: 'asc' },
            include: {
              userRoster: {
                include: {
                  pokemon: {
                    include: {
                      typeRelations: {
                        include: { type: true },
                      },
                    },
                  },
                  teamMembers: {
                    include: { teamPreset: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!fullTeam) {
        throw new Error('Failed to load created team');
      }

      logger.info('Team created', { userId, teamId: team.id, size: rosterIds.length });
      return this.mapTeam(fullTeam);
    });
  }

  async updateTeam(
    userId: string,
    teamId: string,
    updates: { name?: string; rosterIds?: string[]; isActive?: boolean }
  ): Promise<TeamSummary> {
    return prisma.$transaction(async (tx) => {
      const team = await tx.teamPreset.findFirst({ where: { id: teamId, userId } });
      if (!team) {
        throw new Error('Team not found');
      }

      if (updates.name !== undefined) {
        const sanitizedName = updates.name.trim();
        if (!sanitizedName) {
          throw new Error('Team name cannot be empty');
        }
        await tx.teamPreset.update({ where: { id: teamId }, data: { name: sanitizedName } });
      }

      if (updates.isActive) {
        await tx.teamPreset.updateMany({ where: { userId }, data: { isActive: false } });
        await tx.teamPreset.update({ where: { id: teamId }, data: { isActive: true } });
      }

      if (updates.rosterIds) {
        if (updates.rosterIds.length === 0 || updates.rosterIds.length > 6) {
          throw new Error('A team must contain between 1 and 6 Pokémon');
        }

        const rosterEntries = await tx.userRoster.findMany({
          where: { id: { in: updates.rosterIds }, userId },
          select: { id: true, pokemonId: true },
        });

        if (rosterEntries.length !== updates.rosterIds.length) {
          throw new Error('Some Pokémon do not belong to the user');
        }

        const pokemonIdByRoster = new Map(rosterEntries.map((entry) => [entry.id, entry.pokemonId]));

        await tx.teamMember.deleteMany({ where: { teamPresetId: teamId } });
        await Promise.all(
          updates.rosterIds.map((rosterId, index) =>
            tx.teamMember.create({
              data: {
                teamPresetId: teamId,
                userRosterId: rosterId,
                pokemonId: pokemonIdByRoster.get(rosterId)!,
                position: index + 1,
              },
            })
          )
        );
      }

      const fullTeam = await tx.teamPreset.findUnique({
        where: { id: teamId },
        include: {
          members: {
            orderBy: { position: 'asc' },
            include: {
              userRoster: {
                include: {
                  pokemon: {
                    include: {
                      typeRelations: {
                        include: { type: true },
                      },
                    },
                  },
                  teamMembers: {
                    include: { teamPreset: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!fullTeam) {
        throw new Error('Failed to load updated team');
      }

      logger.info('Team updated', { userId, teamId });
      return this.mapTeam(fullTeam);
    });
  }

  async deleteTeam(userId: string, teamId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const team = await tx.teamPreset.findFirst({ where: { id: teamId, userId } });
      if (!team) {
        throw new Error('Team not found');
      }

      await tx.teamMember.deleteMany({ where: { teamPresetId: teamId } });
      await tx.teamPreset.delete({ where: { id: teamId } });

      logger.info('Team deleted', { userId, teamId });
    });
  }

  private mapRosterEntry(entry: RosterEntryPayload): RosterPokemonSummary {
    const stats = {
      hp: entry.pokemon.hp,
      attack: entry.pokemon.attackStat,
      defense: entry.pokemon.defenseStat,
      specialAttack: entry.pokemon.specialAttack,
      specialDefense: entry.pokemon.specialDefense,
      speed: entry.pokemon.speed,
    };
    const total = Object.values(stats).reduce((sum, value) => sum + value, 0);

    const types = entry.pokemon.typeRelations
      .sort((a, b) => a.slotNumber - b.slotNumber)
      .map((relation) => ({
        id: relation.typeId,
        name: relation.type.name,
        color: relation.type.color,
      }));

    return {
      id: entry.id,
      pokemonId: entry.pokemonId,
      name: {
        fr: entry.pokemon.nameFr,
        en: entry.pokemon.nameEn,
        jp: entry.pokemon.nameJp,
        display: entry.pokemon.nameFr || entry.pokemon.nameEn,
      },
      nickname: entry.nickname,
      types,
      stats: {
        ...stats,
        total,
      },
      level: entry.level,
      experience: entry.experience,
      obtainedFrom: entry.obtainedFrom,
      obtainedAt: entry.obtainedAt,
      isLocked: entry.isLocked,
      inTeams: entry.teamMembers.map((member) => member.teamPresetId),
      sprites: {
        regular: entry.pokemon.spriteRegular,
        shiny: entry.pokemon.spriteShiny,
        gmax: entry.pokemon.spriteGmax,
      },
      spriteRegular: entry.pokemon.spriteRegular,
      spriteShiny: entry.pokemon.spriteShiny,
      spriteGmax: entry.pokemon.spriteGmax,
    };
  }

  private mapTeam(team: TeamPresetPayload): TeamSummary {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      isActive: team.isActive,
      gameMode: team.gameMode,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: team.members.map((member) => ({
        position: member.position,
        rosterPokemon: this.mapRosterEntry(member.userRoster as RosterEntryPayload),
      })),
    };
  }

  private async calculateRosterStats(userId: string): Promise<RosterStats> {
    const entries = await prisma.userRoster.findMany({
      where: { userId },
      include: {
        pokemon: {
          include: {
            typeRelations: {
              include: { type: true },
            },
          },
        },
      },
    });

    if (entries.length === 0) {
      return {
        totalPokemon: 0,
        byType: {},
        byGeneration: {},
        byRarity: {
          COMMON: 0,
          UNCOMMON: 0,
          RARE: 0,
          EPIC: 0,
          LEGENDARY: 0,
        },
        averageLevel: 0,
        highestLevel: 0,
      };
    }

    const stats: RosterStats = {
      totalPokemon: entries.length,
      byType: {},
      byGeneration: {},
      byRarity: {
        COMMON: 0,
        UNCOMMON: 0,
        RARE: 0,
        EPIC: 0,
        LEGENDARY: 0,
      },
      averageLevel: 0,
      highestLevel: 0,
    };

    let totalLevel = 0;

    entries.forEach((entry) => {
      totalLevel += entry.level;
      stats.highestLevel = Math.max(stats.highestLevel, entry.level);

      const totalStats =
        entry.pokemon.hp +
        entry.pokemon.attackStat +
        entry.pokemon.defenseStat +
        entry.pokemon.specialAttack +
        entry.pokemon.specialDefense +
        entry.pokemon.speed;
      const rarity = rarityFromTotalStats(totalStats);
      stats.byRarity[rarity] += 1;

      const generationKey = `Gen ${entry.pokemon.generation}`;
      stats.byGeneration[generationKey] = (stats.byGeneration[generationKey] || 0) + 1;

      entry.pokemon.typeRelations.forEach((relation) => {
        const typeName = relation.type.name;
        stats.byType[typeName] = (stats.byType[typeName] || 0) + 1;
      });
    });

    stats.averageLevel = Math.round(totalLevel / entries.length);
    return stats;
  }
}

export const rosterService = new RosterService();
