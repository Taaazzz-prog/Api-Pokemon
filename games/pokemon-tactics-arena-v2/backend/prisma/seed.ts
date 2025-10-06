import { PrismaClient, PokemonRarity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with baseline data...');

  // Base trainer account
  const testUser = await prisma.user.upsert({
    where: { email: 'test@pokemon.com' },
    update: {},
    create: {
      email: 'test@pokemon.com',
      passwordHash: '$2b$10$rQz3gF4P7C8X9T6Y3Z1K2O.8lN5xS7wV4uR8qE2mD9fH3jN6pK1sO', // password: test123
      role: 'USER',
      profile: {
        create: {
          username: 'TestTrainer',
          avatar: null,
          level: 1,
          experience: 0,
          pokeCredits: 1000,
          pokeGems: 50,
          settings: {},
          stats: {}
        }
      }
    },
    include: {
      profile: true
    }
  });

  console.log('User ready:', testUser.email);

  // Minimal Pokemon catalogue aligned with Prisma schema
  const starterPokemon = [
    {
      pokemonId: 1,
      name: 'Bulbasaur',
      types: ['grass', 'poison'],
      stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
      rarity: PokemonRarity.COMMON,
      generation: 1
    },
    {
      pokemonId: 4,
      name: 'Charmander',
      types: ['fire'],
      stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
      rarity: PokemonRarity.UNCOMMON,
      generation: 1
    },
    {
      pokemonId: 7,
      name: 'Squirtle',
      types: ['water'],
      stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
      rarity: PokemonRarity.COMMON,
      generation: 1
    }
  ];

  for (const entry of starterPokemon) {
    const pokemon = await prisma.pokemon.upsert({
      where: { pokemonId: entry.pokemonId },
      update: {},
      create: {
        pokemonId: entry.pokemonId,
        name: entry.name,
        types: entry.types,
        stats: entry.stats,
        rarity: entry.rarity,
        generation: entry.generation,
        imageUrl: null,
        evolutions: [],
        moves: []
      }
    });

    await prisma.userRoster.upsert({
      where: {
        userId_pokemonId: {
          userId: testUser.id,
          pokemonId: pokemon.id
        }
      },
      update: {},
      create: {
        userId: testUser.id,
        pokemonId: pokemon.id,
        nickname: entry.name,
        level: 5,
        experience: 0,
        customStats: null,
        obtainedFrom: 'starter',
        isLocked: false
      }
    });

    console.log(`Pokemon ready: ${entry.name}`);
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
