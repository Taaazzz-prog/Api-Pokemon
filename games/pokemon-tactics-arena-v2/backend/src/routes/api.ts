// @ts-nocheck
import { Router } from 'express';
import { shopService } from '../services/shop.service';
import { rosterService } from '../services/roster.service';
import { evolutionService } from '../services/evolution.service';
import { arenaService } from '../services/arena.service';
import { tournamentService } from '../services/tournament.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import authRouter from './auth';
import { prisma } from '../database/connection';
import starterPackController from '../controllers/starterPack.controller';

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
    
    // Version simplifiée pour debug
    const rosterEntries = await prisma.userRoster.findMany({
      where: { userId },
      include: { pokemon: true },
      orderBy: { obtainedAt: 'desc' }
    });

    const simplifiedRoster = rosterEntries.map(entry => ({
      id: entry.id,
      pokemonId: entry.pokemonId,
      pokemonName: entry.pokemon.nameFr, // Maintenant le client Prisma reconnaît nameFr
      nickname: entry.nickname,
      level: entry.level,
      obtainedFrom: entry.obtainedFrom,
      spriteRegular: entry.pokemon.spriteRegular, // Ajout du sprite normal
      spriteShiny: entry.pokemon.spriteShiny // Ajout du sprite shiny
    }));

    res.json({
      success: true,
      data: {
        pokemon: simplifiedRoster,
        total: rosterEntries.length
      }
    });
  } catch (error: any) {
    console.error('Roster error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/roster/:pokemonId/nickname', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { pokemonId } = req.params;
    const { nickname } = req.body;

    const result = await rosterService.updateNickname(userId, pokemonId, nickname);
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
router.post('/arena/queue', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { mode = 'RANKED', ratingRange = 200 } = req.body;

    const result = await arenaService.joinQueue(userId, { mode, ratingRange });
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

router.delete('/arena/queue', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    await arenaService.leaveQueue(userId);
    
    res.json({
      success: true,
      message: 'Left queue successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/arena/current-match', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const match = await arenaService.getCurrentMatch(userId);
    
    res.json({
      success: true,
      data: match
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/arena/rankings', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await arenaService.getRankings(options);
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

router.get('/arena/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const stats = await arenaService.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Tournament Routes
router.get('/tournaments', async (req, res) => {
  try {
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      canJoin: req.query.canJoin === 'true',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await tournamentService.getActiveTournaments(filters);
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

router.post('/tournaments', authenticate, async (req, res) => {
  try {
    const creatorId = req.user!.id;
    const tournamentData = req.body;

    const tournament = await tournamentService.createTournament(creatorId, tournamentData);
    res.json({
      success: true,
      data: tournament
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/tournaments/:tournamentId/join', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { tournamentId } = req.params;

    const result = await tournamentService.joinTournament(userId, tournamentId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/tournaments/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await tournamentService.getTournament(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      data: tournament
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/tournaments/:tournamentId/bracket', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const bracket = await tournamentService.getTournamentBracket(tournamentId);
    
    res.json({
      success: true,
      data: bracket
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
