import { prisma } from '../database/connection';
import { ArenaService } from './arena.service';
import { CurrencyService } from './currency.service';
import { logger } from '../utils/logger';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
  status: 'UPCOMING' | 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  maxParticipants: number;
  currentParticipants: number;
  entryFee: {
    credits?: number;
    gems?: number;
  };
  prizes: TournamentPrizes;
  rules: TournamentRules;
  schedule: {
    registrationStart: Date;
    registrationEnd: Date;
    tournamentStart: Date;
    estimatedEnd: Date;
  };
  createdBy: string;
  createdAt: Date;
}

export interface TournamentPrizes {
  first: { credits?: number; gems?: number; title?: string };
  second: { credits?: number; gems?: number; title?: string };
  third: { credits?: number; gems?: number; title?: string };
  participation: { credits?: number; experience?: number };
}

export interface TournamentRules {
  teamSize: number;
  levelCap?: number;
  allowedRarities?: string[];
  bannedPokemon?: string[];
  timeLimit: number;
  format: 'STANDARD' | 'DRAFT' | 'PRESET';
}

export interface TournamentBracket {
  tournamentId: string;
  rounds: TournamentRound[];
  currentRound: number;
  totalRounds: number;
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startTime?: Date;
  endTime?: Date;
}

export interface TournamentMatch {
  id: string;
  roundNumber: number;
  matchNumber: number;
  player1?: TournamentPlayer;
  player2?: TournamentPlayer;
  winner?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'WALKOVER';
  battleResult?: any;
  scheduledTime?: Date;
  completedAt?: Date;
}

export interface TournamentPlayer {
  userId: string;
  username: string;
  seed: number;
  status: 'ACTIVE' | 'ELIMINATED' | 'WITHDRAWN';
  currentRound: number;
  wins: number;
  losses: number;
}

export class TournamentService {
  private arenaService = new ArenaService();
  private currencyService = new CurrencyService();

  /**
   * Get active tournaments
   */
  async getActiveTournaments(filters: {
    status?: string;
    type?: string;
    canJoin?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ tournaments: Tournament[]; pagination: any }> {
    
    const { status, type, canJoin, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // Default to active tournaments
      where.status = { in: ['UPCOMING', 'REGISTRATION', 'IN_PROGRESS'] };
    }

    if (type) {
      where.type = type;
    }

    if (canJoin) {
      where.status = 'REGISTRATION';
      where.currentParticipants = { lt: prisma.tournament.fields.maxParticipants };
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        creator: { select: { username: true } },
        participants: { include: { user: { select: { username: true } } } }
      },
      orderBy: { tournamentStart: 'asc' },
      skip: offset,
      take: limit
    });

    const total = await prisma.tournament.count({ where });

    return {
      tournaments: tournaments.map(t => this.transformTournament(t)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create new tournament
   */
  async createTournament(
    creatorId: string,
    tournamentData: {
      name: string;
      description: string;
      type: string;
      maxParticipants: number;
      entryFee: any;
      prizes: TournamentPrizes;
      rules: TournamentRules;
      schedule: any;
    }
  ): Promise<Tournament> {
    
    // Validate creator permissions (could check if user is admin/moderator)
    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!creator) {
      throw new Error('Creator not found');
    }

    // Validate tournament data
    this.validateTournamentData(tournamentData);

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: tournamentData.name.trim(),
        description: tournamentData.description.trim(),
        type: tournamentData.type as any,
        status: 'UPCOMING',
        maxParticipants: tournamentData.maxParticipants,
        currentParticipants: 0,
        entryFee: tournamentData.entryFee,
        prizes: tournamentData.prizes,
        rules: tournamentData.rules,
        registrationStart: tournamentData.schedule.registrationStart,
        registrationEnd: tournamentData.schedule.registrationEnd,
        tournamentStart: tournamentData.schedule.tournamentStart,
        estimatedEnd: tournamentData.schedule.estimatedEnd,
        createdBy: creatorId
      },
      include: {
        creator: { select: { username: true } }
      }
    });

    logger.info(`Tournament created: ${tournament.name} by ${creator.username}`);

    return this.transformTournament(tournament);
  }

  /**
   * Join tournament
   */
  async joinTournament(
    userId: string,
    tournamentId: string
  ): Promise<{ success: boolean; message: string }> {
    
    return await prisma.$transaction(async (tx) => {
      // Get tournament
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true }
      });

      if (!tournament) {
        return { success: false, message: 'Tournament not found' };
      }

      // Check if registration is open
      if (tournament.status !== 'REGISTRATION') {
        return { success: false, message: 'Registration is not open' };
      }

      // Check if tournament is full
      if (tournament.currentParticipants >= tournament.maxParticipants) {
        return { success: false, message: 'Tournament is full' };
      }

      // Check if user is already registered
      const existingParticipant = tournament.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        return { success: false, message: 'Already registered for this tournament' };
      }

      // Check user has valid team
      const activeTeam = await tx.team.findFirst({
        where: { userId, isActive: true },
        include: {
          slots: {
            include: { rosterEntry: { include: { pokemon: true } } }
          }
        }
      });

      if (!activeTeam || activeTeam.slots.length === 0) {
        return { success: false, message: 'No active team found' };
      }

      // Validate team against tournament rules
      const teamValidation = this.validateTeamForTournament(activeTeam, tournament.rules);
      if (!teamValidation.valid) {
        return { success: false, message: teamValidation.reason };
      }

      // Check and deduct entry fee
      if (tournament.entryFee) {
        const canAfford = await this.currencyService.canAfford(userId, [
          ...(tournament.entryFee.credits ? [{ currency: 'POKE_CREDITS' as const, amount: tournament.entryFee.credits }] : []),
          ...(tournament.entryFee.gems ? [{ currency: 'POKE_GEMS' as const, amount: tournament.entryFee.gems }] : [])
        ]);

        if (!canAfford) {
          return { success: false, message: 'Insufficient funds for entry fee' };
        }

        // Deduct entry fee
        if (tournament.entryFee.credits) {
          await this.currencyService.removeCurrency(
            userId,
            'POKE_CREDITS',
            tournament.entryFee.credits,
            `Tournament entry: ${tournament.name}`,
            { tournamentId }
          );
        }

        if (tournament.entryFee.gems) {
          await this.currencyService.removeCurrency(
            userId,
            'POKE_GEMS',
            tournament.entryFee.gems,
            `Tournament entry: ${tournament.name}`,
            { tournamentId }
          );
        }
      }

      // Add participant
      await tx.tournamentParticipant.create({
        data: {
          tournamentId,
          userId,
          seed: tournament.currentParticipants + 1,
          status: 'ACTIVE',
          registeredAt: new Date(),
          teamSnapshot: {
            pokemon: activeTeam.slots.map(slot => ({
              id: slot.rosterEntry.id,
              pokemon: slot.rosterEntry.pokemon,
              level: slot.rosterEntry.level,
              nickname: slot.rosterEntry.nickname,
              customStats: slot.rosterEntry.customStats
            }))
          }
        }
      });

      // Update tournament participant count
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { currentParticipants: { increment: 1 } }
      });

      logger.info(`User ${userId} joined tournament ${tournament.name}`);

      return { success: true, message: 'Successfully joined tournament' };
    });
  }

  /**
   * Leave tournament
   */
  async leaveTournament(
    userId: string,
    tournamentId: string
  ): Promise<{ success: boolean; message: string; refund?: any }> {
    
    return await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        return { success: false, message: 'Tournament not found' };
      }

      // Check if can still withdraw
      if (tournament.status === 'IN_PROGRESS') {
        return { success: false, message: 'Cannot withdraw from tournament in progress' };
      }

      if (tournament.status === 'COMPLETED') {
        return { success: false, message: 'Tournament already completed' };
      }

      // Find participant
      const participant = await tx.tournamentParticipant.findFirst({
        where: { tournamentId, userId }
      });

      if (!participant) {
        return { success: false, message: 'Not registered for this tournament' };
      }

      // Calculate refund (partial refund if close to start time)
      let refundAmount = null;
      if (tournament.entryFee) {
        const timeUntilStart = tournament.tournamentStart.getTime() - Date.now();
        const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
        
        let refundRate = 1.0; // 100% refund
        if (hoursUntilStart < 24) refundRate = 0.5; // 50% refund within 24 hours
        if (hoursUntilStart < 2) refundRate = 0; // No refund within 2 hours

        if (refundRate > 0) {
          refundAmount = {
            credits: tournament.entryFee.credits ? Math.floor(tournament.entryFee.credits * refundRate) : 0,
            gems: tournament.entryFee.gems ? Math.floor(tournament.entryFee.gems * refundRate) : 0
          };

          // Process refund
          if (refundAmount.credits > 0) {
            await this.currencyService.addCurrency(
              userId,
              'POKE_CREDITS',
              refundAmount.credits,
              `Tournament withdrawal refund: ${tournament.name}`,
              { tournamentId }
            );
          }

          if (refundAmount.gems > 0) {
            await this.currencyService.addCurrency(
              userId,
              'POKE_GEMS',
              refundAmount.gems,
              `Tournament withdrawal refund: ${tournament.name}`,
              { tournamentId }
            );
          }
        }
      }

      // Remove participant
      await tx.tournamentParticipant.delete({
        where: { id: participant.id }
      });

      // Update tournament participant count
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { currentParticipants: { decrement: 1 } }
      });

      logger.info(`User ${userId} left tournament ${tournament.name}`);

      return {
        success: true,
        message: 'Successfully left tournament',
        refund: refundAmount
      };
    });
  }

  /**
   * Start tournament (generate bracket)
   */
  async startTournament(tournamentId: string): Promise<TournamentBracket> {
    return await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: { include: { user: true } } }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'REGISTRATION') {
        throw new Error('Tournament cannot be started');
      }

      if (tournament.currentParticipants < 4) {
        throw new Error('Minimum 4 participants required');
      }

      // Update tournament status
      await tx.tournament.update({
        where: { id: tournamentId },
        data: {
          status: 'IN_PROGRESS',
          actualStart: new Date()
        }
      });

      // Generate bracket based on tournament type
      const bracket = await this.generateBracket(tournament, tx);

      logger.info(`Tournament started: ${tournament.name} with ${tournament.currentParticipants} participants`);

      return bracket;
    });
  }

  /**
   * Get tournament details
   */
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        creator: { select: { username: true } },
        participants: { include: { user: { select: { username: true } } } }
      }
    });

    return tournament ? this.transformTournament(tournament) : null;
  }

  /**
   * Get tournament bracket
   */
  async getTournamentBracket(tournamentId: string): Promise<TournamentBracket | null> {
    const matches = await prisma.tournamentMatch.findMany({
      where: { tournamentId },
      include: {
        player1: { include: { user: { select: { username: true } } } },
        player2: { include: { user: { select: { username: true } } } }
      },
      orderBy: [{ roundNumber: 'asc' }, { matchNumber: 'asc' }]
    });

    if (matches.length === 0) return null;

    // Group matches by round
    const rounds: TournamentRound[] = [];
    const roundsMap = new Map<number, TournamentMatch[]>();

    for (const match of matches) {
      if (!roundsMap.has(match.roundNumber)) {
        roundsMap.set(match.roundNumber, []);
      }
      roundsMap.get(match.roundNumber)!.push(this.transformTournamentMatch(match));
    }

    for (const [roundNumber, roundMatches] of roundsMap) {
      rounds.push({
        roundNumber,
        matches: roundMatches,
        status: this.getRoundStatus(roundMatches),
        startTime: roundMatches[0]?.scheduledTime,
        endTime: roundMatches.every(m => m.status === 'COMPLETED') 
          ? roundMatches.reduce((latest, m) => 
              m.completedAt && (!latest || m.completedAt > latest) ? m.completedAt : latest, 
              null as Date | null
            ) 
          : undefined
      });
    }

    return {
      tournamentId,
      rounds: rounds.sort((a, b) => a.roundNumber - b.roundNumber),
      currentRound: rounds.find(r => r.status === 'IN_PROGRESS')?.roundNumber || 1,
      totalRounds: rounds.length
    };
  }

  /**
   * Report match result
   */
  async reportMatchResult(
    matchId: string,
    winnerId: string,
    battleResult: any
  ): Promise<void> {
    
    return await prisma.$transaction(async (tx) => {
      const match = await tx.tournamentMatch.findUnique({
        where: { id: matchId },
        include: { tournament: true }
      });

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.status !== 'IN_PROGRESS') {
        throw new Error('Match is not in progress');
      }

      // Update match
      await tx.tournamentMatch.update({
        where: { id: matchId },
        data: {
          winnerId,
          status: 'COMPLETED',
          battleResult,
          completedAt: new Date()
        }
      });

      // Update participant stats
      await tx.tournamentParticipant.updateMany({
        where: { 
          tournamentId: match.tournamentId,
          userId: winnerId
        },
        data: { wins: { increment: 1 } }
      });

      const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
      if (loserId) {
        await tx.tournamentParticipant.updateMany({
          where: { 
            tournamentId: match.tournamentId,
            userId: loserId
          },
          data: { losses: { increment: 1 } }
        });
      }

      // Check if tournament round is complete
      await this.checkRoundCompletion(match.tournamentId, match.roundNumber, tx);

      logger.info(`Tournament match completed: ${matchId}, winner: ${winnerId}`);
    });
  }

  /**
   * Generate tournament bracket
   */
  private async generateBracket(tournament: any, tx: any): Promise<TournamentBracket> {
    const participants = tournament.participants;
    
    switch (tournament.type) {
      case 'SINGLE_ELIMINATION':
        return await this.generateSingleEliminationBracket(tournament.id, participants, tx);
      case 'DOUBLE_ELIMINATION':
        return await this.generateDoubleEliminationBracket(tournament.id, participants, tx);
      case 'ROUND_ROBIN':
        return await this.generateRoundRobinBracket(tournament.id, participants, tx);
      default:
        throw new Error(`Unsupported tournament type: ${tournament.type}`);
    }
  }

  /**
   * Generate single elimination bracket
   */
  private async generateSingleEliminationBracket(
    tournamentId: string,
    participants: any[],
    tx: any
  ): Promise<TournamentBracket> {
    
    // Shuffle participants for random seeding
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    const totalRounds = Math.ceil(Math.log2(participants.length));
    let currentRound = 1;
    let currentParticipants = shuffled;

    const rounds: TournamentRound[] = [];

    while (currentParticipants.length > 1) {
      const matches: TournamentMatch[] = [];
      const nextRoundParticipants: any[] = [];

      // Pair up participants
      for (let i = 0; i < currentParticipants.length; i += 2) {
        const player1 = currentParticipants[i];
        const player2 = currentParticipants[i + 1] || null; // Bye if odd number

        const match = await tx.tournamentMatch.create({
          data: {
            tournamentId,
            roundNumber: currentRound,
            matchNumber: Math.floor(i / 2) + 1,
            player1Id: player1.userId,
            player2Id: player2?.userId,
            status: player2 ? 'PENDING' : 'WALKOVER',
            winnerId: player2 ? null : player1.userId // Auto-win for bye
          }
        });

        matches.push(this.transformTournamentMatch(match));

        // Advance winner to next round
        nextRoundParticipants.push(player2 ? null : player1); // null means TBD
      }

      rounds.push({
        roundNumber: currentRound,
        matches,
        status: 'PENDING'
      });

      currentRound++;
      currentParticipants = nextRoundParticipants.filter(p => p !== null);
      
      if (nextRoundParticipants.some(p => p === null)) {
        // There are matches to be determined, break for now
        break;
      }
    }

    return {
      tournamentId,
      rounds,
      currentRound: 1,
      totalRounds
    };
  }

  /**
   * Generate double elimination bracket (simplified)
   */
  private async generateDoubleEliminationBracket(
    tournamentId: string,
    participants: any[],
    tx: any
  ): Promise<TournamentBracket> {
    
    // For simplicity, implement as single elimination for now
    // Full double elimination would require winner/loser brackets
    return await this.generateSingleEliminationBracket(tournamentId, participants, tx);
  }

  /**
   * Generate round robin bracket
   */
  private async generateRoundRobinBracket(
    tournamentId: string,
    participants: any[],
    tx: any
  ): Promise<TournamentBracket> {
    
    const matches: TournamentMatch[] = [];
    let matchNumber = 1;

    // Generate all possible matches
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match = await tx.tournamentMatch.create({
          data: {
            tournamentId,
            roundNumber: 1, // All matches in round 1 for round robin
            matchNumber: matchNumber++,
            player1Id: participants[i].userId,
            player2Id: participants[j].userId,
            status: 'PENDING'
          }
        });

        matches.push(this.transformTournamentMatch(match));
      }
    }

    return {
      tournamentId,
      rounds: [{
        roundNumber: 1,
        matches,
        status: 'PENDING'
      }],
      currentRound: 1,
      totalRounds: 1
    };
  }

  /**
   * Validate tournament data
   */
  private validateTournamentData(data: any): void {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Tournament name must be at least 3 characters');
    }

    if (data.maxParticipants < 4 || data.maxParticipants > 128) {
      throw new Error('Max participants must be between 4 and 128');
    }

    if (!data.schedule.registrationStart || !data.schedule.tournamentStart) {
      throw new Error('Registration and tournament start times are required');
    }

    if (data.schedule.registrationStart >= data.schedule.tournamentStart) {
      throw new Error('Registration must end before tournament starts');
    }
  }

  /**
   * Validate team for tournament rules
   */
  private validateTeamForTournament(team: any, rules: TournamentRules): { valid: boolean; reason: string } {
    if (team.slots.length !== rules.teamSize) {
      return { valid: false, reason: `Team must have exactly ${rules.teamSize} Pokemon` };
    }

    for (const slot of team.slots) {
      const pokemon = slot.rosterEntry;
      
      // Check level cap
      if (rules.levelCap && pokemon.level > rules.levelCap) {
        return { valid: false, reason: `Pokemon level cannot exceed ${rules.levelCap}` };
      }

      // Check allowed rarities
      if (rules.allowedRarities && !rules.allowedRarities.includes(pokemon.pokemon.rarity)) {
        return { valid: false, reason: `${pokemon.pokemon.rarity} rarity Pokemon not allowed` };
      }

      // Check banned Pokemon
      if (rules.bannedPokemon && rules.bannedPokemon.includes(pokemon.pokemon.id)) {
        return { valid: false, reason: `${pokemon.pokemon.name} is banned in this tournament` };
      }
    }

    return { valid: true, reason: '' };
  }

  /**
   * Check if round is complete and advance if needed
   */
  private async checkRoundCompletion(
    tournamentId: string,
    roundNumber: number,
    tx: any
  ): Promise<void> {
    
    const roundMatches = await tx.tournamentMatch.findMany({
      where: { tournamentId, roundNumber }
    });

    const allCompleted = roundMatches.every((match: any) => 
      match.status === 'COMPLETED' || match.status === 'WALKOVER'
    );

    if (allCompleted) {
      // Check if tournament is complete
      if (roundMatches.length === 1) {
        // Final match completed
        await tx.tournament.update({
          where: { id: tournamentId },
          data: { 
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });

        // Distribute prizes
        await this.distributeTournamentPrizes(tournamentId, tx);
      } else {
        // Generate next round if needed
        // This would be more complex in a full implementation
      }
    }
  }

  /**
   * Distribute tournament prizes
   */
  private async distributeTournamentPrizes(tournamentId: string, tx: any): Promise<void> {
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId },
      include: { 
        participants: { include: { user: true } },
        matches: true
      }
    });

    if (!tournament || !tournament.prizes) return;

    // Find final match to determine winner
    const finalMatch = tournament.matches.find((m: any) => 
      m.roundNumber === Math.max(...tournament.matches.map((match: any) => match.roundNumber))
    );

    if (!finalMatch?.winnerId) return;

    // Distribute prizes (simplified - would need proper ranking logic)
    const winner = tournament.participants.find((p: any) => p.userId === finalMatch.winnerId);
    
    if (winner && tournament.prizes.first) {
      if (tournament.prizes.first.credits) {
        await this.currencyService.addCurrency(
          winner.userId,
          'POKE_CREDITS',
          tournament.prizes.first.credits,
          `Tournament victory: ${tournament.name}`,
          { tournamentId, place: 1 }
        );
      }

      if (tournament.prizes.first.gems) {
        await this.currencyService.addCurrency(
          winner.userId,
          'POKE_GEMS',
          tournament.prizes.first.gems,
          `Tournament victory: ${tournament.name}`,
          { tournamentId, place: 1 }
        );
      }
    }

    logger.info(`Tournament prizes distributed for ${tournament.name}`);
  }

  /**
   * Transform database tournament to Tournament interface
   */
  private transformTournament(tournament: any): Tournament {
    return {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      type: tournament.type,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.currentParticipants,
      entryFee: tournament.entryFee,
      prizes: tournament.prizes,
      rules: tournament.rules,
      schedule: {
        registrationStart: tournament.registrationStart,
        registrationEnd: tournament.registrationEnd,
        tournamentStart: tournament.tournamentStart,
        estimatedEnd: tournament.estimatedEnd
      },
      createdBy: tournament.createdBy,
      createdAt: tournament.createdAt
    };
  }

  /**
   * Transform database match to TournamentMatch
   */
  private transformTournamentMatch(match: any): TournamentMatch {
    return {
      id: match.id,
      roundNumber: match.roundNumber,
      matchNumber: match.matchNumber,
      player1: match.player1 ? {
        userId: match.player1.userId,
        username: match.player1.user.username,
        seed: match.player1.seed,
        status: match.player1.status,
        currentRound: match.roundNumber,
        wins: match.player1.wins,
        losses: match.player1.losses
      } : undefined,
      player2: match.player2 ? {
        userId: match.player2.userId,
        username: match.player2.user.username,
        seed: match.player2.seed,
        status: match.player2.status,
        currentRound: match.roundNumber,
        wins: match.player2.wins,
        losses: match.player2.losses
      } : undefined,
      winner: match.winnerId,
      status: match.status,
      battleResult: match.battleResult,
      scheduledTime: match.scheduledTime,
      completedAt: match.completedAt
    };
  }

  /**
   * Get round status based on matches
   */
  private getRoundStatus(matches: TournamentMatch[]): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' {
    if (matches.every(m => m.status === 'COMPLETED' || m.status === 'WALKOVER')) {
      return 'COMPLETED';
    }
    if (matches.some(m => m.status === 'IN_PROGRESS')) {
      return 'IN_PROGRESS';
    }
    return 'PENDING';
  }
}

export const tournamentService = new TournamentService();