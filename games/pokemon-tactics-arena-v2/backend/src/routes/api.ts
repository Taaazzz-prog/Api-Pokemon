// @ts-nocheck
import { Router } from 'express';
import { shopService } from '../services/shop.service';
import { rosterService } from '../services/roster.service';
import { evolutionService } from '../services/evolution.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import authRouter from './auth';
import { prisma } from '../database/connection';
import { logger } from '../utils/logger';
import starterPackController from '../controllers/starterPack.controller';


const arenaQueueSchema = {
  body: z.object({
    opponentName: z.string().min(1).max(100).optional(),
    team: z.array(z.string().min(1).max(50)).max(6).optional(),
  }),
};

const tournamentCreateSchema = {
  body: z.object({
    name: z.string().min(3).max(100),
    format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN']).optional(),
    maxRounds: z.number().int().min(1).max(10).optional(),
    rewards: z.array(z.any()).optional(),
    description: z.string().max(255).optional(),
  }),
};

const tournamentIdSchema = { params: z.object({ tournamentId: z.string().uuid('Invalid tournament id') }) };

const tournamentResultSchema = {
  params: z.object({
    tournamentId: z.string().uuid('Invalid tournament id'),
    matchId: z.string().uuid('Invalid match id'),
  }),
  body: z.object({
    winnerId: z.string().uuid('Invalid winner id').optional(),
  }),
};

const survivalStartSchema = {
  body: z.object({ team: z.array(z.string().min(1).max(50)).max(6).optional() }),
};

const survivalProgressSchema = {
  params: z.object({ runId: z.string().uuid('Invalid run id') }),
  body: z.object({
    wave: z.number().int().min(1).optional(),
    rewards: z.array(z.any()).optional(),
  }),
};

const survivalEndSchema = {
  body: z.object({
    runId: z.string().uuid('Invalid run id'),
    waves: z.number().int().min(0).optional(),
    score: z.number().int().min(0).optional(),
    rewards: z.array(z.any()).optional(),
  }),
};

const router = Router();

// Authentication routes
router.use('/auth', authRouter);

// Pokemon Routes
router.get('/pokemon', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const generation = req.query.generation ? parseInt(req.query.generation as string) : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    // Build search conditions for multilingual support
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameFr: { contains: search, mode: 'insensitive' } },
        { nameJp: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (type) {
      // TODO: Implement type filtering with new Pokemon-Type relations
      console.log(`Type filtering for '${type}' not yet implemented in new schema`);
    }
    if (generation) {
      where.generation = generation;
    }

    const [pokemon, total] = await Promise.all([
      prisma.pokemon.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: 'asc'
        }
      }),
      prisma.pokemon.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        pokemon,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/pokemon/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse ID to integer
    const pokemonId = parseInt(id);
    if (isNaN(pokemonId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Pokemon ID'
      });
    }
    
    // Find Pokemon by ID
    const pokemon = await prisma.pokemon.findUnique({
      where: {
        id: pokemonId
      }
    });

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: 'Pokemon not found'
      });
    }

    res.json({
      success: true,
      data: pokemon
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Shop Routes
router.get('/shop/catalog', authenticate, async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      rarity: req.query.rarity as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await shopService.getCatalog(filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/shop/purchase', authenticate, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.user!.id;

    const result = await shopService.purchaseItem(userId, itemId, quantity);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Starter Pack Routes
router.get('/starter-pack/info', authenticate, starterPackController.getStarterPackInfo);
router.post('/starter-pack/apply', authenticate, starterPackController.applyStarterPack);
router.get('/starter-pack/status', authenticate, starterPackController.hasReceivedStarterPack);

// Roster Routes
router.get('/roster', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { page, limit, search, type, generation } = req.query;

    const result = await rosterService.getRoster(userId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string | undefined,
      type: type as string | undefined,
      generation: generation ? parseInt(generation as string, 10) : undefined,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Roster lookup failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put('/roster/:rosterId/nickname', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { rosterId } = req.params;
    const { nickname } = req.body;

    const result = await rosterService.updateNickname(userId, rosterId, nickname);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/roster/teams', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const teams = await rosterService.getTeams(userId);
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/roster/teams', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, pokemonIds = [] } = req.body;

    const team = await rosterService.createTeam(userId, name, pokemonIds);
    res.json({
      success: true,
      data: team
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Evolution Routes
router.get('/evolution/chains', async (req, res) => {
  try {
    const chains = await evolutionService.getEvolutionChains();
    res.json({
      success: true,
      data: chains
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/evolution/:pokemonId/check', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { pokemonId } = req.params;

    const result = await evolutionService.canEvolve(userId, pokemonId);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/evolution/:pokemonId/evolve', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { pokemonId } = req.params;
    const { targetPokemonId } = req.body;

    const result = await evolutionService.evolvePokemon(userId, pokemonId, targetPokemonId);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Arena Routes
router.post('/arena/queue', authenticate, validateRequest(arenaQueueSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { opponentName = 'Dresseur IA', team = [] } = req.body;

    const battleResult: 'WIN' | 'LOSS' | 'DRAW' = Math.random() > 0.4 ? 'WIN' : (Math.random() > 0.5 ? 'LOSS' : 'DRAW');
    const rewardCredits = battleResult === 'WIN' ? 150 : battleResult === 'DRAW' ? 75 : 40;
    const rewardGems = battleResult === 'WIN' ? 1 : 0;

    const match = await prisma.$transaction(async (tx) => {
      const profile = await tx.userProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw new Error('Profil introuvable');
      }

      const winsIncrement = battleResult === 'WIN' ? 1 : 0;
      const totalBattles = profile.totalBattles + 1;
      const totalWins = profile.totalWins + winsIncrement;
      const winRate = totalBattles > 0 ? (totalWins / totalBattles) * 100 : 0;

      await tx.userProfile.update({
        where: { userId },
        data: {
          totalBattles,
          totalWins,
          winRate,
          pokeCredits: { increment: rewardCredits },
          pokeGems: { increment: rewardGems },
        },
      });

      return tx.arenaMatch.create({
        data: {
          userId,
          opponentType: 'AI',
          opponentName,
          result: battleResult,
          rewardCredits,
          rewardGems,
        },
      });
    });

    res.json({
      success: true,
      data: {
        match,
        rewardCredits,
        rewardGems,
        result: battleResult,
      },
    });
  } catch (error: any) {
    logger.error('Arena match generation failed', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/arena/history', authenticate, async (req, res) => {
  try {
    const matches = await prisma.arenaMatch.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/arena/rankings', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const profiles = await prisma.userProfile.findMany({
      orderBy: [{ totalWins: 'desc' }, { totalBattles: 'desc' }],
      take: limit,
      skip: offset,
      include: { user: { select: { email: true } } },
    });

    const total = await prisma.userProfile.count();

    res.json({
      success: true,
      data: {
        rankings: profiles.map((profile, index) => ({
          userId: profile.userId,
          username: profile.username,
          rank: offset + index + 1,
          wins: profile.totalWins,
          losses: profile.totalBattles - profile.totalWins,
          winRate: profile.totalBattles > 0 ? Math.round((profile.totalWins / profile.totalBattles) * 100) : 0,
          rewardCredits: profile.pokeCredits,
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error: any) {
    logger.error('Arena rankings lookup failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/arena/stats', authenticate, async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      return res.json({
        success: true,
        data: {
          wins: 0,
          losses: 0,
          winRate: 0,
          rank: null,
          rewardCredits: 0,
        },
      });
    }

    const losses = profile.totalBattles - profile.totalWins;
    res.json({
      success: true,
      data: {
        wins: profile.totalWins,
        losses,
        winRate: profile.totalBattles > 0 ? Math.round((profile.totalWins / profile.totalBattles) * 100) : 0,
        rewardCredits: profile.pokeCredits,
      },
    });
  } catch (error: any) {
    logger.error('Arena stats lookup failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tournament Routes
router.get('/tournaments', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const format = req.query.format as string | undefined;

    const tournaments = await prisma.tournament.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(format ? { format: format as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { participantsRel: true },
    });

    res.json({
      success: true,
      data: tournaments.map((tournament) => ({
        ...tournament,
        participantsCount: tournament.participantsRel.length,
      })),
    });
  } catch (error: any) {
    logger.error('Tournament list failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tournaments', authenticate, validateRequest(tournamentCreateSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      format = 'SINGLE_ELIMINATION',
      maxRounds = 3,
      rewards = [],
      description = '',
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Tournament name is required' });
    }

    const tournament = await prisma.tournament.create({
      data: {
        userId,
        name: String(name),
        format,
        status: 'PENDING',
        maxRounds,
        rewards,
        description,
      },
    });

    res.json({ success: true, data: tournament });
  } catch (error: any) {
    logger.error('Tournament creation failed', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/tournaments/:tournamentId/join', authenticate, validateRequest(tournamentIdSchema), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { tournamentId } = req.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { participantsRel: true },
    });
    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Tournament is closed' });
    }

    if (tournament.participantsRel.some((entry) => entry.userId === userId)) {
      return res.status(400).json({ success: false, error: 'Already joined' });
    }

    const joined = await prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId,
      },
    });

    res.json({ success: true, data: joined });
  } catch (error: any) {
    logger.error('Tournament join failed', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/tournaments/:tournamentId', validateRequest(tournamentIdSchema), async (req, res) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.tournamentId },
      include: {
        participantsRel: {
          include: { user: { select: { email: true, profile: true } } },
        },
        matches: true,
      },
    });
    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    res.json({ success: true, data: tournament });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/tournaments/:tournamentId/bracket', validateRequest(tournamentIdSchema), async (req, res) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.tournamentId },
      include: { matches: true },
    });
    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    const grouped = tournament.matches.reduce<Record<number, typeof tournament.matches>>((acc, match) => {
      acc[match.round] = acc[match.round] || [];
      acc[match.round].push(match);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tournaments/:tournamentId/start', authenticate, validateRequest(tournamentIdSchema), async (req, res) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.tournamentId },
      include: { participantsRel: true },
    });

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    if (tournament.participantsRel.length < 2) {
      return res.status(400).json({ success: false, error: 'Au moins deux participants sont nécessaires' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tournamentMatch.deleteMany({ where: { tournamentId: tournament.id } });

      const participants = tournament.participantsRel.map((p) => p.userId);
      for (let i = 0; i < participants.length; i += 2) {
        const player1 = participants[i];
        const player2 = participants[i + 1] ?? null;

        await tx.tournamentMatch.create({
          data: {
            tournamentId: tournament.id,
            round: 1,
            player1Id: player1,
            player2Id: player2,
            status: player2 ? 'PENDING' : 'COMPLETED',
            winnerId: player2 ? null : player1,
          },
        });
      }

      await tx.tournament.update({
        where: { id: tournament.id },
        data: { status: 'ACTIVE', currentRound: 1 },
      });
    });

    res.json({ success: true, message: 'Tournoi démarré' });
  } catch (error: any) {
    logger.error('Tournament start failed', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/tournaments/:tournamentId/matches/:matchId/result', authenticate, validateRequest(tournamentResultSchema), async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    const { winnerId } = req.body;

    const match = await prisma.tournamentMatch.findUnique({ where: { id: matchId } });
    if (!match || match.tournamentId !== tournamentId) {
      return res.status(404).json({ success: false, error: 'Match introuvable' });
    }

    if (match.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'Match déjà terminé' });
    }

    const updated = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED',
        winnerId,
        completedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('Tournament result failed', { error: error.message });
    res.status(400).json({ success: false, error: error.message });
  }
});

// Survival Routes
router.get('/survival/status', authenticate, async (req, res) => {
  try {
    const run = await prisma.survivalRun.findFirst({
      where: { userId: req.user!.id, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    res.json({ success: true, data: run });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/survival/start', authenticate, validateRequest(survivalStartSchema), async (req, res) => {
  try {
    const { team = [] } = req.body;
    const existing = await prisma.survivalRun.findFirst({
      where: { userId: req.user!.id, status: 'ACTIVE' },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Une run est déjà en cours' });
    }

    const run = await prisma.survivalRun.create({
      data: {
        userId: req.user!.id,
        initialTeam: team,
      },
    });

    res.json({ success: true, data: run });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/survival/end', authenticate, validateRequest(survivalEndSchema), async (req, res) => {
  try {
    const { runId, waves = 0, score = 0, rewards = [] } = req.body;
    const run = await prisma.survivalRun.findUnique({ where: { id: runId } });

    if (!run || run.userId !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Run introuvable' });
    }

    const updated = await prisma.survivalRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        currentWave: waves,
        maxWave: Math.max(run.maxWave, waves),
        score,
        rewards,
        completedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/survival/:runId/progress', authenticate, validateRequest(survivalProgressSchema), async (req, res) => {
  try {
    const { runId } = req.params;
    const { wave = 1, rewards = [] } = req.body;

    const run = await prisma.survivalRun.findUnique({ where: { id: runId } });
    if (!run || run.userId !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Run introuvable' });
    }

    const updated = await prisma.survivalRun.update({
      where: { id: runId },
      data: {
        currentWave: wave,
        maxWave: Math.max(run.maxWave, wave),
        rewards,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/survival/history', authenticate, async (req, res) => {
  try {
    const runs = await prisma.survivalRun.findMany({
      where: { userId: req.user!.id },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: runs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
