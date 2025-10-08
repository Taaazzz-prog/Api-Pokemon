import { Router, Request, Response } from 'express';
import { prisma } from '../database/connection';

const router = Router();

const getLocalizedName = (
  pokemon: { nameFr?: string | null; nameEn?: string | null; nameJp?: string | null },
  lang: string
): string => {
  switch (lang) {
    case 'en':
      return pokemon.nameEn || pokemon.nameFr || '';
    case 'jp':
      return pokemon.nameJp || pokemon.nameEn || pokemon.nameFr || '';
    case 'fr':
    default:
      return pokemon.nameFr || pokemon.nameEn || '';
  }
};

router.get('/pokemon/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lang = 'fr' } = req.query as { lang?: string };

    const pokemonId = Number.parseInt(id, 10);
    if (Number.isNaN(pokemonId)) {
      return res.status(400).json({ success: false, error: 'Invalid Pokemon ID' });
    }

    const query = `
      SELECT 
        p.id,
        p.name_fr as nameFr,
        p.name_en as nameEn,
        p.name_jp as nameJp,
        p.generation,
        p.category,
        p.height,
        p.weight,
        p.hp,
        p.attack_stat as attackStat,
        p.defense_stat as defenseStat,
        p.special_attack as specialAttack,
        p.special_defense as specialDefense,
        p.speed,
        p.catch_rate as catchRate,
        p.sprite_regular as spriteRegular,
        p.sprite_shiny as spriteShiny,
        p.sprite_gmax as spriteGmax,
        p.male_rate as maleRate,
        p.female_rate as femaleRate
      FROM pokemon p
      WHERE p.id = ?
    `;

    const result = await prisma.$queryRawUnsafe<any[]>(query, pokemonId);
    const pokemon = result[0];

    if (!pokemon) {
      return res.status(404).json({ success: false, error: 'Pokemon not found' });
    }

    const response = {
      id: pokemon.id,
      name: getLocalizedName(pokemon, lang),
      names: {
        fr: pokemon.nameFr,
        en: pokemon.nameEn,
        jp: pokemon.nameJp,
      },
      stats: {
        hp: pokemon.hp,
        attack: pokemon.attackStat,
        defense: pokemon.defenseStat,
        specialAttack: pokemon.specialAttack,
        specialDefense: pokemon.specialDefense,
        speed: pokemon.speed,
      },
      metadata: {
        generation: pokemon.generation,
        category: pokemon.category,
        height: pokemon.height,
        weight: pokemon.weight,
        catchRate: pokemon.catchRate,
      },
      sprites: {
        regular: pokemon.spriteRegular,
        shiny: pokemon.spriteShiny,
        gmax: pokemon.spriteGmax,
      },
      breeding: {
        maleRate: Number(pokemon.maleRate),
        femaleRate: Number(pokemon.femaleRate),
      },
    };

    return res.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Pokemon API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pokemon/search', async (req: Request, res: Response) => {
  try {
    const { q, lang = 'fr', limit = '20' } = req.query as {
      q?: string;
      lang?: string;
      limit?: string;
    };

    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const searchQuery = `
      SELECT 
        p.id,
        p.name_fr as nameFr,
        p.name_en as nameEn,
        p.name_jp as nameJp,
        p.generation,
        p.sprite_regular as spriteRegular
      FROM pokemon p
      WHERE 
        p.name_fr LIKE ? OR 
        p.name_en LIKE ? OR 
        p.name_jp LIKE ?
      ORDER BY p.id ASC
      LIMIT ?
    `;

    const likeTerm = `%${q}%`;
    const results = await prisma.$queryRawUnsafe<any[]>(
      searchQuery,
      likeTerm,
      likeTerm,
      likeTerm,
      Number.parseInt(limit, 10)
    );

    const pokemon = results.map((p) => ({
      id: p.id,
      name: getLocalizedName(p, lang),
      names: {
        fr: p.nameFr,
        en: p.nameEn,
        jp: p.nameJp,
      },
      generation: p.generation,
      sprite: p.spriteRegular,
    }));

    return res.json({ success: true, data: pokemon });
  } catch (error: any) {
    console.error('Pokemon search error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pokemon/generation/:generation', async (req: Request, res: Response) => {
  try {
    const { generation } = req.params;
    const { page = '1', limit = '20', lang = 'fr' } = req.query as {
      page?: string;
      limit?: string;
      lang?: string;
    };

    const generationNumber = Number.parseInt(generation, 10);
    if (Number.isNaN(generationNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid generation' });
    }

    const limitNumber = Number.parseInt(limit, 10);
    const offset = (Number.parseInt(page, 10) - 1) * limitNumber;

    const generationQuery = `
      SELECT 
        p.id,
        p.name_fr as nameFr,
        p.name_en as nameEn,
        p.name_jp as nameJp,
        p.generation,
        p.sprite_regular as spriteRegular
      FROM pokemon p
      WHERE p.generation = ?
      ORDER BY p.id ASC
      LIMIT ? OFFSET ?
    `;

    const results = await prisma.$queryRawUnsafe<any[]>(
      generationQuery,
      generationNumber,
      limitNumber,
      offset
    );

    const pokemon = results.map((p) => ({
      id: p.id,
      name: getLocalizedName(p, lang),
      names: {
        fr: p.nameFr,
        en: p.nameEn,
        jp: p.nameJp,
      },
      generation: p.generation,
      sprite: p.spriteRegular,
    }));

    return res.json({
      success: true,
      data: pokemon,
      pagination: {
        page: Number.parseInt(page, 10),
        limit: limitNumber,
        total: pokemon.length,
      },
    });
  } catch (error: any) {
    console.error('Pokemon generation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pokemon/random', async (req: Request, res: Response) => {
  try {
    const { count = '1', lang = 'fr' } = req.query as { count?: string; lang?: string };
    const limitNumber = Math.max(1, Math.min(100, Number.parseInt(count, 10)));

    const randomQuery = `
      SELECT 
        p.id,
        p.name_fr as nameFr,
        p.name_en as nameEn,
        p.name_jp as nameJp,
        p.generation,
        p.sprite_regular as spriteRegular
      FROM pokemon p
      ORDER BY RAND()
      LIMIT ?
    `;

    const results = await prisma.$queryRawUnsafe<any[]>(randomQuery, limitNumber);
    const pokemon = results.map((p) => ({
      id: p.id,
      name: getLocalizedName(p, lang),
      names: {
        fr: p.nameFr,
        en: p.nameEn,
        jp: p.nameJp,
      },
      generation: p.generation,
      sprite: p.spriteRegular,
    }));

    return res.json({ success: true, data: pokemon });
  } catch (error: any) {
    console.error('Random pokemon error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pokemon/stats', async (_req: Request, res: Response) => {
  try {
    const totalQuery = 'SELECT COUNT(*) as total FROM pokemon';
    const generationQuery = `
      SELECT generation, COUNT(*) as count 
      FROM pokemon 
      GROUP BY generation 
      ORDER BY generation
    `;

    const totalResult = await prisma.$queryRawUnsafe<any[]>(totalQuery);
    const generationResults = await prisma.$queryRawUnsafe<any[]>(generationQuery);

    const stats = {
      total: totalResult[0]?.total ?? 0,
      byGeneration: generationResults.reduce<Record<number, number>>((acc, gen) => {
        acc[gen.generation] = gen.count;
        return acc;
      }, {}),
      lastUpdated: new Date().toISOString(),
    };

    return res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Pokemon stats error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
