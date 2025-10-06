// @ts-nocheck
import { prisma } from '../database/connection';
import { CombatSimulator } from './CombatSimulator';
import { CurrencyService } from './currency.service';
import { logger } from '../utils/logger';

export interface ArenaMatch {
  id: string;
  mode: 'RANKED' | 'CASUAL' | 'TOURNAMENT';
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  player1: ArenaPlayer;
  player2?: ArenaPlayer;
  battleData?: any;
  winner?: string;
  rewards?: MatchRewards;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ArenaPlayer {
  userId: string;
  username: string;
  rank: number;
  rating: number;
  team: any[];
  ready: boolean;
}

export interface MatchRewards {
  winner: {
    credits: number;
    gems?: number;
    rankingPoints: number;
    experience: number;
  };
  loser: {
    credits: number;
    rankingPoints: number;
    experience: number;
  };
}

export interface ArenaRanking {
  userId: string;
  username: string;
  rank: number;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalMatches: number;
}

export interface MatchmakingOptions {
  mode: 'RANKED' | 'CASUAL';
  ratingRange?: number;
  teamSizeLimit?: number;
  timeLimit?: number;
}

export class ArenaService {
  private combatSimulator = new CombatSimulator();
  private currencyService = new CurrencyService();
  private matchmakingQueue: Map<string, any> = new Map();

  /**
   * Join matchmaking queue
   */
  async joinQueue(
    userId: string,
    options: MatchmakingOptions
  ): Promise<{ status: 'QUEUED' | 'MATCHED'; matchId?: string }> {
    
    // Get user's active team
    const activeTeam = await prisma.team.findFirst({
      where: { userId, isActive: true },
      include: {
        slots: {
          include: {
            rosterEntry: {
              include: { pokemon: true }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!activeTeam || activeTeam.slots.length === 0) {
      throw new Error('No active team found');
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { arenaStats: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const arenaStats = user.arenaStats || await this.initializeArenaStats(userId);

    // Check if already in queue or match
    const existingMatch = await prisma.arenaMatch.findFirst({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ],
        status: { in: ['WAITING', 'IN_PROGRESS'] }
      }
    });

    if (existingMatch) {
      throw new Error('Already in queue or active match');
    }

    // Create player data
    const player: ArenaPlayer = {
      userId,
      username: user.username,
      rank: arenaStats.rank,
      rating: arenaStats.rating,
      team: activeTeam.slots.map(slot => ({
        id: slot.rosterEntry.id,
        pokemon: slot.rosterEntry.pokemon,
        level: slot.rosterEntry.level,
        nickname: slot.rosterEntry.nickname,
        customStats: slot.rosterEntry.customStats
      })),
      ready: true
    };

    // Try to find a match
    const matchedOpponent = await this.findMatch(player, options);

    if (matchedOpponent) {
      // Create match
      const match = await this.createMatch(player, matchedOpponent, options.mode);
      
      // Remove from queue
      this.matchmakingQueue.delete(matchedOpponent.userId);

      logger.info(`Arena match created: ${player.username} vs ${matchedOpponent.username}`);

      return {
        status: 'MATCHED',
        matchId: match.id
      };
    } else {
      // Add to queue
      this.matchmakingQueue.set(userId, {
        player,
        options,
        joinedAt: new Date()
      });

      // Auto-remove from queue after 5 minutes
      setTimeout(() => {
        this.matchmakingQueue.delete(userId);
      }, 5 * 60 * 1000);

      return { status: 'QUEUED' };
    }
  }

  /**
   * Leave matchmaking queue
   */
  async leaveQueue(userId: string): Promise<void> {
    this.matchmakingQueue.delete(userId);
    
    // Cancel any waiting matches
    await prisma.arenaMatch.updateMany({
      where: {
        player1Id: userId,
        status: 'WAITING'
      },
      data: { status: 'CANCELLED' }
    });
  }

  /**
   * Get current match for user
   */
  async getCurrentMatch(userId: string): Promise<ArenaMatch | null> {
    const match = await prisma.arenaMatch.findFirst({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ],
        status: { in: ['WAITING', 'IN_PROGRESS'] }
      },
      include: {
        player1: true,
        player2: true
      }
    });

    if (!match) return null;

    // Transform to ArenaMatch format
    return this.transformMatch(match);
  }

  /**
   * Start battle
   */
  async startBattle(matchId: string): Promise<{ battleId: string; battleData: any }> {
    const match = await prisma.arenaMatch.findUnique({
      where: { id: matchId },
      include: {
        player1: { include: { arenaStats: true } },
        player2: { include: { arenaStats: true } }
      }
    });

    if (!match || !match.player2) {
      throw new Error('Match not found or incomplete');
    }

    if (match.status !== 'WAITING') {
      throw new Error('Match already started or completed');
    }

    // Get teams
    const player1Team = await this.getPlayerTeam(match.player1Id);
    const player2Team = await this.getPlayerTeam(match.player2Id);

    // Simulate battle
    const battleResult = await this.combatSimulator.simulateBattle(
      player1Team,
      player2Team,
      50 // Maximum 50 turns
    );

    // Update match with battle data
    await prisma.arenaMatch.update({
      where: { id: matchId },
      data: {
        status: 'IN_PROGRESS',
        battleData: battleResult,
        startedAt: new Date()
      }
    });

    logger.info(`Arena battle started: Match ${matchId}`);

    return {
      battleId: matchId,
      battleData: battleResult
    };
  }

  /**
   * Complete match and distribute rewards
   */
  async completeMatch(
    matchId: string,
    winnerId: string,
    battleResult: any
  ): Promise<MatchRewards> {
    
    return await prisma.$transaction(async (tx) => {
      const match = await tx.arenaMatch.findUnique({
        where: { id: matchId },
        include: {
          player1: { include: { arenaStats: true } },
          player2: { include: { arenaStats: true } }
        }
      });

      if (!match || !match.player2) {
        throw new Error('Match not found');
      }

      const winner = winnerId === match.player1Id ? match.player1 : match.player2;
      const loser = winnerId === match.player1Id ? match.player2 : match.player1;

      if (!winner || !loser) {
        throw new Error('Invalid winner ID');
      }

      // Calculate rewards
      const rewards = this.calculateMatchRewards(
        winner,
        loser,
        match.mode as 'RANKED' | 'CASUAL' | 'TOURNAMENT'
      );

      // Update match
      await tx.arenaMatch.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          winnerId,
          completedAt: new Date(),
          rewards
        }
      });

      // Distribute rewards and update stats
      await this.distributeRewards(tx, winner.id, loser.id, rewards, match.mode);

      logger.info(`Arena match completed: ${winner.username} defeated ${loser.username}`);

      return rewards;
    });
  }

  /**
   * Get arena rankings
   */
  async getRankings(
    options: {
      season?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ rankings: ArenaRanking[]; pagination: any }> {
    
    const { limit = 50, offset = 0 } = options;

    const arenaStats = await prisma.arenaStats.findMany({
      include: { user: true },
      orderBy: [
        { rating: 'desc' },
        { wins: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const rankings: ArenaRanking[] = arenaStats.map((stats, index) => ({
      userId: stats.userId,
      username: stats.user.username,
      rank: offset + index + 1,
      rating: stats.rating,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 100) : 0,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      totalMatches: stats.totalMatches
    }));

    const total = await prisma.arenaStats.count();

    return {
      rankings,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Get user's arena statistics
   */
  async getUserStats(userId: string): Promise<any> {
    let arenaStats = await prisma.arenaStats.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!arenaStats) {
      arenaStats = await this.initializeArenaStats(userId);
    }

    // Get recent matches
    const recentMatches = await prisma.arenaMatch.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ],
        status: 'COMPLETED'
      },
      include: {
        player1: true,
        player2: true
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    // Calculate rank position
    const rankPosition = await prisma.arenaStats.count({
      where: { rating: { gt: arenaStats.rating } }
    }) + 1;

    return {
      ...arenaStats,
      rank: rankPosition,
      winRate: arenaStats.totalMatches > 0 ? Math.round((arenaStats.wins / arenaStats.totalMatches) * 100) : 0,
      recentMatches: recentMatches.map(match => ({
        id: match.id,
        opponent: match.player1Id === userId ? match.player2?.username : match.player1?.username,
        result: match.winnerId === userId ? 'WIN' : 'LOSS',
        mode: match.mode,
        completedAt: match.completedAt
      }))
    };
  }

  /**
   * Get match history
   */
  async getMatchHistory(
    userId: string,
    options: { page?: number; limit?: number; mode?: string } = {}
  ): Promise<{ matches: any[]; pagination: any }> {
    
    const { page = 1, limit = 20, mode } = options;
    const offset = (page - 1) * limit;

    const where: any = {
      OR: [
        { player1Id: userId },
        { player2Id: userId }
      ],
      status: 'COMPLETED'
    };

    if (mode) {
      where.mode = mode;
    }

    const matches = await prisma.arenaMatch.findMany({
      where,
      include: {
        player1: true,
        player2: true
      },
      orderBy: { completedAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.arenaMatch.count({ where });

    return {
      matches: matches.map(match => this.transformMatch(match, userId)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find match for player
   */
  private async findMatch(
    player: ArenaPlayer,
    options: MatchmakingOptions
  ): Promise<ArenaPlayer | null> {
    
    const ratingRange = options.ratingRange || 200;

    for (const [userId, queueData] of this.matchmakingQueue) {
      const opponent = queueData.player;
      
      // Skip self
      if (opponent.userId === player.userId) continue;

      // Check mode compatibility
      if (queueData.options.mode !== options.mode) continue;

      // Check rating range for ranked matches
      if (options.mode === 'RANKED') {
        const ratingDiff = Math.abs(player.rating - opponent.rating);
        if (ratingDiff > ratingRange) continue;
      }

      // Check team size compatibility
      if (player.team.length !== opponent.team.length) continue;

      // Found a match!
      return opponent;
    }

    return null;
  }

  /**
   * Create arena match
   */
  private async createMatch(
    player1: ArenaPlayer,
    player2: ArenaPlayer,
    mode: 'RANKED' | 'CASUAL' | 'TOURNAMENT'
  ): Promise<any> {
    
    return await prisma.arenaMatch.create({
      data: {
        mode,
        status: 'WAITING',
        player1Id: player1.userId,
        player2Id: player2.userId,
        player1Data: {
          team: player1.team,
          rating: player1.rating
        },
        player2Data: {
          team: player2.team,
          rating: player2.rating
        }
      }
    });
  }

  /**
   * Get player's team for battle
   */
  private async getPlayerTeam(userId: string): Promise<any[]> {
    const team = await prisma.team.findFirst({
      where: { userId, isActive: true },
      include: {
        slots: {
          include: {
            rosterEntry: {
              include: { pokemon: true }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!team) {
      throw new Error('No active team found');
    }

    return team.slots.map(slot => ({
      id: slot.rosterEntry.id,
      pokemon: slot.rosterEntry.pokemon,
      level: slot.rosterEntry.level,
      customStats: slot.rosterEntry.customStats,
      currentHp: this.calculateMaxHp(slot.rosterEntry),
      status: 'NORMAL'
    }));
  }

  /**
   * Calculate max HP for Pokemon
   */
  private calculateMaxHp(rosterEntry: any): number {
    const stats = rosterEntry.customStats || rosterEntry.pokemon.baseStats;
    const level = rosterEntry.level;
    
    // Standard Pokemon HP calculation
    return Math.floor(((2 * stats.hp + 31) * level) / 100) + level + 10;
  }

  /**
   * Calculate match rewards
   */
  private calculateMatchRewards(
    winner: any,
    loser: any,
    mode: 'RANKED' | 'CASUAL' | 'TOURNAMENT'
  ): MatchRewards {
    
    const baseCredits = mode === 'RANKED' ? 500 : 300;
    const baseExp = 100;

    // Rating difference affects rewards
    const ratingDiff = winner.arenaStats.rating - loser.arenaStats.rating;
    const multiplier = ratingDiff < 0 ? 1.5 : 1.0; // Bonus for beating stronger opponent

    const rewards: MatchRewards = {
      winner: {
        credits: Math.floor(baseCredits * multiplier),
        experience: Math.floor(baseExp * multiplier),
        rankingPoints: this.calculateRatingChange(winner.arenaStats.rating, loser.arenaStats.rating, true)
      },
      loser: {
        credits: Math.floor(baseCredits * 0.3), // Consolation prize
        experience: Math.floor(baseExp * 0.5),
        rankingPoints: this.calculateRatingChange(loser.arenaStats.rating, winner.arenaStats.rating, false)
      }
    };

    // Bonus gems for ranked wins
    if (mode === 'RANKED' && Math.random() < 0.2) { // 20% chance
      rewards.winner.gems = Math.floor(Math.random() * 3) + 1;
    }

    return rewards;
  }

  /**
   * Calculate ELO-style rating change
   */
  private calculateRatingChange(
    playerRating: number,
    opponentRating: number,
    won: boolean
  ): number {
    
    const K = 32; // K-factor
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actualScore = won ? 1 : 0;
    
    return Math.round(K * (actualScore - expectedScore));
  }

  /**
   * Distribute rewards and update statistics
   */
  private async distributeRewards(
    tx: any,
    winnerId: string,
    loserId: string,
    rewards: MatchRewards,
    mode: string
  ): Promise<void> {
    
    // Update winner
    await tx.user.update({
      where: { id: winnerId },
      data: {
        credits: { increment: rewards.winner.credits },
        gems: { increment: rewards.winner.gems || 0 },
        experience: { increment: rewards.winner.experience }
      }
    });

    await tx.arenaStats.upsert({
      where: { userId: winnerId },
      update: {
        wins: { increment: 1 },
        totalMatches: { increment: 1 },
        rating: { increment: rewards.winner.rankingPoints },
        currentStreak: { increment: 1 },
        bestStreak: { increment: 1 }
      },
      create: {
        userId: winnerId,
        wins: 1,
        losses: 0,
        totalMatches: 1,
        rating: 1200 + rewards.winner.rankingPoints,
        currentStreak: 1,
        bestStreak: 1
      }
    });

    // Update loser
    await tx.user.update({
      where: { id: loserId },
      data: {
        credits: { increment: rewards.loser.credits },
        experience: { increment: rewards.loser.experience }
      }
    });

    await tx.arenaStats.upsert({
      where: { userId: loserId },
      update: {
        losses: { increment: 1 },
        totalMatches: { increment: 1 },
        rating: { increment: rewards.loser.rankingPoints },
        currentStreak: 0
      },
      create: {
        userId: loserId,
        wins: 0,
        losses: 1,
        totalMatches: 1,
        rating: 1200 + rewards.loser.rankingPoints,
        currentStreak: 0,
        bestStreak: 0
      }
    });

    // Create transaction records
    await tx.transaction.createMany({
      data: [
        {
          userId: winnerId,
          type: 'CREDIT',
          amount: rewards.winner.credits,
          source: `Arena ${mode} victory`,
          metadata: { type: 'arena_reward' }
        },
        {
          userId: loserId,
          type: 'CREDIT',
          amount: rewards.loser.credits,
          source: `Arena ${mode} participation`,
          metadata: { type: 'arena_reward' }
        }
      ]
    });
  }

  /**
   * Initialize arena stats for new user
   */
  private async initializeArenaStats(userId: string): Promise<any> {
    return await prisma.arenaStats.create({
      data: {
        userId,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        rating: 1200, // Starting rating
        currentStreak: 0,
        bestStreak: 0
      },
      include: { user: true }
    });
  }

  /**
   * Transform database match to ArenaMatch
   */
  private transformMatch(match: any, perspectiveUserId?: string): any {
    const isPlayer1 = perspectiveUserId === match.player1Id;
    
    return {
      id: match.id,
      mode: match.mode,
      status: match.status,
      opponent: isPlayer1 ? match.player2?.username : match.player1?.username,
      result: match.winnerId === perspectiveUserId ? 'WIN' : 'LOSS',
      rewards: match.rewards,
      createdAt: match.createdAt,
      completedAt: match.completedAt,
      battleData: match.battleData
    };
  }
}

export const arenaService = new ArenaService();