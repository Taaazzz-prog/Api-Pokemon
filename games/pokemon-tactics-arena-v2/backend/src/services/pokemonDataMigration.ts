import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration API existante
const API_BASE_URL = 'https://pokebuild-api.fr/api/v1';

// Types Pokemon avec correspondance français/anglais
const TYPE_MAPPING = {
  'Normal': 'Normal',
  'Feu': 'Fire',
  'Eau': 'Water',
  'Électrik': 'Electric',
  'Plante': 'Grass',
  'Glace': 'Ice',
  'Combat': 'Fighting',
  'Poison': 'Poison',
  'Sol': 'Ground',
  'Vol': 'Flying',
  'Psy': 'Psychic',
  'Insecte': 'Bug',
  'Roche': 'Rock',
  'Spectre': 'Ghost',
  'Dragon': 'Dragon',
  'Ténèbres': 'Dark',
  'Acier': 'Steel',
  'Fée': 'Fairy'
};

/**
 * Récupère tous les Pokemon depuis l'API
 */
async function fetchAllPokemon() {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon`);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokemon:', error);
    return [];
  }
}

/**
 * Récupère les détails d'un Pokemon spécifique
 */
async function fetchPokemonDetails(pokemonId) {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon/${pokemonId}`);
    if (!response.ok) {
      console.warn(`Pokemon ${pokemonId} non trouvé dans l'API`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Erreur pour Pokemon ${pokemonId}:`, error);
    return null;
  }
}

/**
 * Récupère tous les types depuis l'API
 */
async function fetchAllTypes() {
  try {
    const response = await fetch(`${API_BASE_URL}/types`);
    if (!response.ok) {
      throw new Error(`Erreur API types: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des types:', error);
    return [];
  }
}

/**
 * Crée les types Pokemon dans la base de données
 */
async function createPokemonTypes() {
  console.log('Création des types Pokemon...');
  
  const types = Object.entries(TYPE_MAPPING);
  
  for (const [frenchName, englishName] of types) {
    try {
      await prisma.pokemonType.upsert({
        where: { name: englishName },
        update: {},
        create: {
          name: englishName,
          frenchName: frenchName,
          color: getTypeColor(englishName)
        }
      });
      console.log(`✓ Type créé: ${englishName} (${frenchName})`);
    } catch (error) {
      console.error(`Erreur création type ${englishName}:`, error);
    }
  }
}

/**
 * Retourne la couleur associée à un type
 */
function getTypeColor(typeName) {
  const colors = {
    'Normal': '#A8A878',
    'Fire': '#F08030',
    'Water': '#6890F0',
    'Electric': '#F8D030',
    'Grass': '#78C850',
    'Ice': '#98D8D8',
    'Fighting': '#C03028',
    'Poison': '#A040A0',
    'Ground': '#E0C068',
    'Flying': '#A890F0',
    'Psychic': '#F85888',
    'Bug': '#A8B820',
    'Rock': '#B8A038',
    'Ghost': '#705898',
    'Dragon': '#7038F8',
    'Dark': '#705848',
    'Steel': '#B8B8D0',
    'Fairy': '#EE99AC'
  };
  return colors[typeName] || '#68A090';
}

/**
 * Convertit un nom de Pokemon français en chemin d'image
 */
function getPokemonImagePath(pokemonName, types) {
  // Normalise le nom pour le système de fichiers
  const normalizedName = pokemonName
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ôö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[ù]/g, 'u')
    .replace(/[î]/g, 'i')
    .replace(/\s+/g, '_')
    .replace(/[^\w\-_.]/g, '');
    
  // Utilise le premier type pour déterminer le dossier
  const primaryType = types[0]?.name || 'Normal';
  const frenchType = Object.keys(TYPE_MAPPING).find(
    key => TYPE_MAPPING[key] === primaryType
  ) || 'Normal';
  
  return `/images/pokemon/${frenchType}/${normalizedName}.png`;
}

/**
 * Migre les Pokemon depuis l'API vers la base de données
 */
async function migratePokemon() {
  console.log('Début de la migration Pokemon...');
  
  // Récupère tous les Pokemon
  const pokemonList = await fetchAllPokemon();
  console.log(`${pokemonList.length} Pokemon trouvés dans l'API`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const pokemon of pokemonList) {
    try {
      // Récupère les détails complets
      const details = await fetchPokemonDetails(pokemon.id);
      if (!details) {
        errorCount++;
        continue;
      }
      
      // Récupère les types existants en base
      const types = await Promise.all(
        details.apiTypes.map(async (typeData) => {
          const englishName = TYPE_MAPPING[typeData.name] || typeData.name;
          return await prisma.pokemonType.findUnique({
            where: { name: englishName }
          });
        })
      );
      
      const validTypes = types.filter(Boolean);
      
      // Calcule l'image path
      const imagePath = getPokemonImagePath(details.name, validTypes);
      
      // Crée le Pokemon en base
      await prisma.pokemon.upsert({
        where: { pokedexId: details.pokedexId },
        update: {
          name: details.name,
          image: imagePath,
          hp: details.stats.HP,
          attack: details.stats.attack,
          defense: details.stats.defense,
          specialAttack: details.stats.special_attack,
          specialDefense: details.stats.special_defense,
          speed: details.stats.speed,
          generation: details.generation || 1,
          isLegendary: details.isLegendary || false,
          types: {
            set: validTypes.map(type => ({ id: type.id }))
          }
        },
        create: {
          pokedexId: details.pokedexId,
          name: details.name,
          image: imagePath,
          hp: details.stats.HP,
          attack: details.stats.attack,
          defense: details.stats.defense,
          specialAttack: details.stats.special_attack,
          specialDefense: details.stats.special_defense,
          speed: details.stats.speed,
          generation: details.generation || 1,
          isLegendary: details.isLegendary || false,
          types: {
            connect: validTypes.map(type => ({ id: type.id }))
          }
        },
        include: {
          types: true
        }
      });
      
      successCount++;
      console.log(`✓ ${details.name} (#${details.pokedexId}) migré`);
      
      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Erreur migration Pokemon ${pokemon.name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`Migration terminée: ${successCount} succès, ${errorCount} erreurs`);
}

/**
 * Utilise les données de fallback si l'API n'est pas disponible
 */
async function useFallbackData() {
  console.log('Utilisation des données de fallback...');
  
  // Données de fallback (échantillon)
  const fallbackPokemon = [
    {
      pokedexId: 1,
      name: "Bulbizarre",
      image: "/images/pokemon/Plante/Bulbizarre.png",
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
      generation: 1,
      isLegendary: false,
      types: ["Grass", "Poison"]
    },
    {
      pokedexId: 4,
      name: "Salamèche",
      image: "/images/pokemon/Feu/Salam_che.png",
      hp: 39,
      attack: 52,
      defense: 43,
      specialAttack: 60,
      specialDefense: 50,
      speed: 65,
      generation: 1,
      isLegendary: false,
      types: ["Fire"]
    },
    {
      pokedexId: 7,
      name: "Carapuce",
      image: "/images/pokemon/Eau/Carapuce.png",
      hp: 44,
      attack: 48,
      defense: 65,
      specialAttack: 50,
      specialDefense: 64,
      speed: 43,
      generation: 1,
      isLegendary: false,
      types: ["Water"]
    },
    {
      pokedexId: 25,
      name: "Pikachu",
      image: "/images/pokemon/Électrik/Pikachu.png",
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
      generation: 1,
      isLegendary: false,
      types: ["Electric"]
    },
    {
      pokedexId: 150,
      name: "Mewtwo",
      image: "/images/pokemon/Psy/Mewtwo.png",
      hp: 106,
      attack: 110,
      defense: 90,
      specialAttack: 154,
      specialDefense: 90,
      speed: 130,
      generation: 1,
      isLegendary: true,
      types: ["Psychic"]
    }
  ];
  
  for (const pokemonData of fallbackPokemon) {
    try {
      // Récupère les types
      const types = await Promise.all(
        pokemonData.types.map(typeName => 
          prisma.pokemonType.findUnique({ where: { name: typeName } })
        )
      );
      
      const validTypes = types.filter(Boolean);
      
      await prisma.pokemon.upsert({
        where: { pokedexId: pokemonData.pokedexId },
        update: pokemonData,
        create: {
          ...pokemonData,
          types: {
            connect: validTypes.map(type => ({ id: type.id }))
          }
        }
      });
      
      console.log(`✓ ${pokemonData.name} ajouté depuis fallback`);
    } catch (error) {
      console.error(`Erreur fallback ${pokemonData.name}:`, error);
    }
  }
}

/**
 * Fonction principale de migration
 */
async function runMigration() {
  try {
    console.log('=== MIGRATION POKEMON DATA ===');
    
    // 1. Créer les types
    await createPokemonTypes();
    
    // 2. Tenter migration depuis API
    await migratePokemon();
    
    // 3. Vérifier si on a des Pokemon en base
    const pokemonCount = await prisma.pokemon.count();
    if (pokemonCount === 0) {
      console.log('Aucun Pokemon migré, utilisation des données de fallback...');
      await useFallbackData();
    }
    
    // 4. Statistiques finales
    const finalPokemonCount = await prisma.pokemon.count();
    const finalTypeCount = await prisma.pokemonType.count();
    
    console.log(`=== MIGRATION TERMINÉE ===`);
    console.log(`Pokemon en base: ${finalPokemonCount}`);
    console.log(`Types en base: ${finalTypeCount}`);
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exporte les fonctions pour utilisation externe
export {
  runMigration,
  fetchAllPokemon,
  fetchPokemonDetails,
  createPokemonTypes,
  migratePokemon,
  useFallbackData
};

// Execute si lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}