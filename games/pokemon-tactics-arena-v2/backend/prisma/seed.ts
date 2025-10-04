import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Création d'un utilisateur de test
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
          avatar: '👤',
          level: 1,
          experience: 0,
          pokeCredits: 1000,
          pokeGems: 50,
        }
      }
    },
    include: {
      profile: true
    }
  });

  console.log('✅ Test user created:', testUser);

  // Création de quelques Pokemon de base
  const starterPokemon = [
    {
      pokedexId: 1,
      name: 'Bulbasaur',
      level: 5,
      experience: 0,
      types: ['Grass', 'Poison'],
      stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
      moves: ['Tackle', 'Growl'],
      nature: 'Hardy',
      isShiny: false,
      userId: testUser.id
    },
    {
      pokedexId: 4,
      name: 'Charmander', 
      level: 5,
      experience: 0,
      types: ['Fire'],
      stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
      moves: ['Scratch', 'Growl'],
      nature: 'Hardy',
      isShiny: false,
      userId: testUser.id
    },
    {
      pokedexId: 7,
      name: 'Squirtle',
      level: 5, 
      experience: 0,
      types: ['Water'],
      stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
      moves: ['Tackle', 'Tail Whip'],
      nature: 'Hardy',
      isShiny: false,
      userId: testUser.id
    }
  ];

  for (const pokemon of starterPokemon) {
    const createdPokemon = await prisma.userRoster.upsert({
      where: { 
        userId_pokedexId_nickname: {
          userId: pokemon.userId,
          pokedexId: pokemon.pokedexId,
          nickname: pokemon.name
        }
      },
      update: {},
      create: pokemon
    });
    console.log('✅ Pokemon created:', createdPokemon.name);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });