
import { PrismaClient, Prisma, PokemonRarity, Currency } from '@prisma/client';

const prisma = new PrismaClient();

type StarterPokemon = {
  id: number;
  nameFr: string;
  nameEn: string;
  nameJp: string;
  types: Array<{ name: string; color: string }>;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  rarity: PokemonRarity;
  generation: number;
  category: string;
  height: string;
  weight: string;
};

const STARTERS: StarterPokemon[] = [
  {
    id: 1,
    nameFr: 'Bulbizarre',
    nameEn: 'Bulbasaur',
    nameJp: 'フシギダネ',
    types: [
      { name: 'Grass', color: '#78C850' },
      { name: 'Poison', color: '#A040A0' },
    ],
    stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
    rarity: PokemonRarity.COMMON,
    generation: 1,
    category: 'Pokémon Graine',
    height: '0.7 m',
    weight: '6.9 kg',
  },
  {
    id: 4,
    nameFr: 'Salamèche',
    nameEn: 'Charmander',
    nameJp: 'ヒトカゲ',
    types: [
      { name: 'Fire', color: '#F08030' },
    ],
    stats: { hp: 39, attack: 52, defense: 43, specialAttack: 60, specialDefense: 50, speed: 65 },
    rarity: PokemonRarity.UNCOMMON,
    generation: 1,
    category: 'Pokémon Lézard',
    height: '0.6 m',
    weight: '8.5 kg',
  },
  {
    id: 7,
    nameFr: 'Carapuce',
    nameEn: 'Squirtle',
    nameJp: 'ゼニガメ',
    types: [
      { name: 'Water', color: '#6890F0' },
    ],
    stats: { hp: 44, attack: 48, defense: 65, specialAttack: 50, specialDefense: 64, speed: 43 },
    rarity: PokemonRarity.COMMON,
    generation: 1,
    category: 'Pokémon Minitortue',
    height: '0.5 m',
    weight: '9.0 kg',
  },
];

async function upsertTypes() {
  for (const starter of STARTERS) {
    for (const type of starter.types) {
      await prisma.pokemonType.upsert({
        where: { name: type.name },
        update: { color: type.color },
        create: {
          name: type.name,
          color: type.color,
        },
      });
    }
  }
}

async function seedPokemon() {
  for (const starter of STARTERS) {
    const pokemon = await prisma.pokemon.upsert({
      where: { id: starter.id },
      create: {
        id: starter.id,
        nameFr: starter.nameFr,
        nameEn: starter.nameEn,
        nameJp: starter.nameJp,
        generation: starter.generation,
        category: starter.category,
        height: starter.height,
        weight: starter.weight,
        hp: starter.stats.hp,
        attackStat: starter.stats.attack,
        defenseStat: starter.stats.defense,
        specialAttack: starter.stats.specialAttack,
        specialDefense: starter.stats.specialDefense,
        speed: starter.stats.speed,
        spriteRegular: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starter.id}.png`,
        spriteShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${starter.id}.png`,
        spriteGmax: null,
        maleRate: new Prisma.Decimal(50),
        femaleRate: new Prisma.Decimal(50),
      },
      update: {
        nameFr: starter.nameFr,
        nameEn: starter.nameEn,
        nameJp: starter.nameJp,
      },
    });

    await prisma.pokemonTypeRelation.deleteMany({ where: { pokemonId: pokemon.id } });

    for (const [index, type] of starter.types.entries()) {
      const pokemonType = await prisma.pokemonType.findUnique({ where: { name: type.name } });
      if (!pokemonType) continue;

      await prisma.pokemonTypeRelation.create({
        data: {
          pokemonId: pokemon.id,
          typeId: pokemonType.id,
          slotNumber: index + 1,
        },
      });
    }
  }
}

async function seedShop() {
  const items = [
    {
      id: 'starter_pack',
      name: 'Pack Starter',
      description: 'Obtenez trois Pokémon de départ garantis.',
      category: 'POKEMON_PACK',
      itemType: 'starter_pack',
      rarity: PokemonRarity.COMMON,
      priceCurrency: Currency.POKE_CREDITS,
      priceAmount: 500,
      metadata: { packSize: 3, maxGeneration: 1 },
    },
    {
      id: 'credit_bundle_small',
      name: 'Pack de crédits (petit)',
      description: 'Ajoute 750 Poké-Crédits à votre solde.',
      category: 'CURRENCY',
      itemType: 'credit_bundle',
      rarity: PokemonRarity.COMMON,
      priceCurrency: Currency.POKE_GEMS,
      priceAmount: 3,
      metadata: { reward: { currency: Currency.POKE_CREDITS, amount: 750 } },
    },
  ] as const;

  for (const item of items) {
    await prisma.shopItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        priceAmount: item.priceAmount,
        priceCurrency: item.priceCurrency,
        metadata: item.metadata as any,
        isAvailable: true,
      },
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category as any,
        itemType: item.itemType,
        rarity: item.rarity,
        priceCurrency: item.priceCurrency,
        priceAmount: item.priceAmount,
        metadata: item.metadata as any,
      },
    });
  }
}

async function seedUser() {
  const user = await prisma.user.upsert({
    where: { email: 'test@pokemon.com' },
    update: {},
    create: {
      email: 'test@pokemon.com',
      passwordHash: '$2b$10$rQz3gF4P7C8X9T6Y3Z1K2O.8lN5xS7wV4uR8qE2mD9fH3jN6pK1sO',
      profile: {
        create: {
          username: 'TestTrainer',
          pokeCredits: 3000,
          pokeGems: 55,
          settings: {},
          stats: {},
        },
      },
    },
    include: { profile: true },
  });

  for (const starter of STARTERS) {
    await prisma.userRoster.upsert({
      where: {
        userId_pokemonId: {
          userId: user.id,
          pokemonId: starter.id,
        },
      },
      update: {
        level: 5,
      },
      create: {
        userId: user.id,
        pokemonId: starter.id,
        nickname: starter.nameFr,
        obtainedFrom: 'starter',
        level: 5,
        experience: 0,
      },
    });
  }

  await prisma.transaction.create({
    data: {
      userId: user.id,
      currency: Currency.POKE_CREDITS,
      type: TransactionType.CREDIT,
      amount: 3000,
      balanceBefore: 0,
      balanceAfter: 3000,
      source: 'seed_initial_credit',
      metadata: {},
    },
  });
}

async function main() {
  console.log('🚀 Seeding database...');
  await upsertTypes();
  await seedPokemon();
  await seedShop();
  await seedUser();
  console.log('✅ Seed completed.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
