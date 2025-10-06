import { Router } from 'express';
import { shopService } from '../services/shop.service';
import { rosterService } from '../services/roster.service';
import { evolutionService } from '../services/evolution.service';
import { arenaService } from '../services/arena.service';
import { tournamentService } from '../services/tournament.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

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

// Roster Routes
router.get('/roster', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const filters = {
      type: req.query.type as string,
      rarity: req.query.rarity as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await rosterService.getRoster(userId, filters);
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
