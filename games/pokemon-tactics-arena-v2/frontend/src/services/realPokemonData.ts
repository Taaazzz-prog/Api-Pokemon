// Types Pokemon réels pour le jeu

export interface PokemonType {
  id: number;
  name: string;
  frenchName: string;
  color: string;
}

export interface Pokemon {
  id: number;
  pokedexId: number;
  name: string;
  image: string;
  types: PokemonType[];
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  generation: number;
  isLegendary: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  basePrice: number;
}

// Types Pokemon réels
export const pokemonTypes: PokemonType[] = [
  { id: 1, name: "Normal", frenchName: "Normal", color: "#A8A878" },
  { id: 2, name: "Fire", frenchName: "Feu", color: "#F08030" },
  { id: 3, name: "Water", frenchName: "Eau", color: "#6890F0" },
  { id: 4, name: "Electric", frenchName: "Électrik", color: "#F8D030" },
  { id: 5, name: "Grass", frenchName: "Plante", color: "#78C850" },
  { id: 6, name: "Ice", frenchName: "Glace", color: "#98D8D8" },
  { id: 7, name: "Fighting", frenchName: "Combat", color: "#C03028" },
  { id: 8, name: "Poison", frenchName: "Poison", color: "#A040A0" },
  { id: 9, name: "Ground", frenchName: "Sol", color: "#E0C068" },
  { id: 10, name: "Flying", frenchName: "Vol", color: "#A890F0" },
  { id: 11, name: "Psychic", frenchName: "Psy", color: "#F85888" },
  { id: 12, name: "Bug", frenchName: "Insecte", color: "#A8B820" },
  { id: 13, name: "Rock", frenchName: "Roche", color: "#B8A038" },
  { id: 14, name: "Ghost", frenchName: "Spectre", color: "#705898" },
  { id: 15, name: "Dragon", frenchName: "Dragon", color: "#7038F8" },
  { id: 16, name: "Dark", frenchName: "Ténèbres", color: "#705848" },
  { id: 17, name: "Steel", frenchName: "Acier", color: "#B8B8D0" },
  { id: 18, name: "Fairy", frenchName: "Fée", color: "#EE99AC" }
];

// Pokemon avec vraies images et données
export const realPokemonData: Pokemon[] = [
  {
    id: 1,
    pokedexId: 1,
    name: "Bulbizarre",
    image: "/images/pokemon/Plante/Bulbizarre.png",
    types: [
      pokemonTypes.find(t => t.name === "Grass")!,
      pokemonTypes.find(t => t.name === "Poison")!
    ],
    hp: 45,
    attack: 49,
    defense: 49,
    specialAttack: 65,
    specialDefense: 65,
    speed: 45,
    generation: 1,
    isLegendary: false,
    rarity: "common",
    basePrice: 500
  },
  {
    id: 2,
    pokedexId: 2,
    name: "Herbizarre",
    image: "/images/pokemon/Plante/Herbizarre.png",
    types: [
      pokemonTypes.find(t => t.name === "Grass")!,
      pokemonTypes.find(t => t.name === "Poison")!
    ],
    hp: 60,
    attack: 62,
    defense: 63,
    specialAttack: 80,
    specialDefense: 80,
    speed: 60,
    generation: 1,
    isLegendary: false,
    rarity: "uncommon",
    basePrice: 750
  },
  {
    id: 3,
    pokedexId: 3,
    name: "Florizarre",
    image: "/images/pokemon/Plante/Florizarre.png",
    types: [
      pokemonTypes.find(t => t.name === "Grass")!,
      pokemonTypes.find(t => t.name === "Poison")!
    ],
    hp: 80,
    attack: 82,
    defense: 83,
    specialAttack: 100,
    specialDefense: 100,
    speed: 80,
    generation: 1,
    isLegendary: false,
    rarity: "rare",
    basePrice: 1500
  },
  {
    id: 4,
    pokedexId: 4,
    name: "Salamèche",
    image: "/images/pokemon/Feu/Salam_che.png",
    types: [
      pokemonTypes.find(t => t.name === "Fire")!
    ],
    hp: 39,
    attack: 52,
    defense: 43,
    specialAttack: 60,
    specialDefense: 50,
    speed: 65,
    generation: 1,
    isLegendary: false,
    rarity: "common",
    basePrice: 500
  },
  {
    id: 5,
    pokedexId: 5,
    name: "Reptincel",
    image: "/images/pokemon/Feu/Reptincel.png",
    types: [
      pokemonTypes.find(t => t.name === "Fire")!
    ],
    hp: 58,
    attack: 64,
    defense: 58,
    specialAttack: 80,
    specialDefense: 65,
    speed: 80,
    generation: 1,
    isLegendary: false,
    rarity: "uncommon",
    basePrice: 750
  },
  {
    id: 6,
    pokedexId: 6,
    name: "Dracaufeu",
    image: "/images/pokemon/Feu/Dracaufeu.png",
    types: [
      pokemonTypes.find(t => t.name === "Fire")!,
      pokemonTypes.find(t => t.name === "Flying")!
    ],
    hp: 78,
    attack: 84,
    defense: 78,
    specialAttack: 109,
    specialDefense: 85,
    speed: 100,
    generation: 1,
    isLegendary: false,
    rarity: "rare",
    basePrice: 1500
  },
  {
    id: 7,
    pokedexId: 7,
    name: "Carapuce",
    image: "/images/pokemon/Eau/Carapuce.png",
    types: [
      pokemonTypes.find(t => t.name === "Water")!
    ],
    hp: 44,
    attack: 48,
    defense: 65,
    specialAttack: 50,
    specialDefense: 64,
    speed: 43,
    generation: 1,
    isLegendary: false,
    rarity: "common",
    basePrice: 500
  },
  {
    id: 8,
    pokedexId: 8,
    name: "Carabaffe",
    image: "/images/pokemon/Eau/Carabaffe.png",
    types: [
      pokemonTypes.find(t => t.name === "Water")!
    ],
    hp: 59,
    attack: 63,
    defense: 80,
    specialAttack: 65,
    specialDefense: 80,
    speed: 58,
    generation: 1,
    isLegendary: false,
    rarity: "uncommon",
    basePrice: 750
  },
  {
    id: 9,
    pokedexId: 9,
    name: "Tortank",
    image: "/images/pokemon/Eau/Tortank.png",
    types: [
      pokemonTypes.find(t => t.name === "Water")!
    ],
    hp: 79,
    attack: 83,
    defense: 100,
    specialAttack: 85,
    specialDefense: 105,
    speed: 78,
    generation: 1,
    isLegendary: false,
    rarity: "rare",
    basePrice: 1500
  },
  {
    id: 10,
    pokedexId: 25,
    name: "Pikachu",
    image: "/images/pokemon/Électrik/Pikachu.png",
    types: [
      pokemonTypes.find(t => t.name === "Electric")!
    ],
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90,
    generation: 1,
    isLegendary: false,
    rarity: "uncommon",
    basePrice: 750
  },
  {
    id: 11,
    pokedexId: 26,
    name: "Raichu",
    image: "/images/pokemon/Électrik/Raichu.png",
    types: [
      pokemonTypes.find(t => t.name === "Electric")!
    ],
    hp: 60,
    attack: 90,
    defense: 55,
    specialAttack: 90,
    specialDefense: 80,
    speed: 110,
    generation: 1,
    isLegendary: false,
    rarity: "rare",
    basePrice: 1200
  },
  {
    id: 12,
    pokedexId: 144,
    name: "Artikodin",
    image: "/images/pokemon/Glace/Artikodin.png",
    types: [
      pokemonTypes.find(t => t.name === "Ice")!,
      pokemonTypes.find(t => t.name === "Flying")!
    ],
    hp: 90,
    attack: 85,
    defense: 100,
    specialAttack: 95,
    specialDefense: 125,
    speed: 85,
    generation: 1,
    isLegendary: true,
    rarity: "legendary",
    basePrice: 4000
  },
  {
    id: 13,
    pokedexId: 145,
    name: "Électhor",
    image: "/images/pokemon/Électrik/_lecthor.png",
    types: [
      pokemonTypes.find(t => t.name === "Electric")!,
      pokemonTypes.find(t => t.name === "Flying")!
    ],
    hp: 90,
    attack: 90,
    defense: 85,
    specialAttack: 125,
    specialDefense: 90,
    speed: 100,
    generation: 1,
    isLegendary: true,
    rarity: "legendary",
    basePrice: 4000
  },
  {
    id: 14,
    pokedexId: 146,
    name: "Sulfura",
    image: "/images/pokemon/Feu/Sulfura.png",
    types: [
      pokemonTypes.find(t => t.name === "Fire")!,
      pokemonTypes.find(t => t.name === "Flying")!
    ],
    hp: 90,
    attack: 100,
    defense: 90,
    specialAttack: 125,
    specialDefense: 85,
    speed: 90,
    generation: 1,
    isLegendary: true,
    rarity: "legendary",
    basePrice: 4000
  },
  {
    id: 15,
    pokedexId: 150,
    name: "Mewtwo",
    image: "/images/pokemon/Psy/Mewtwo.png",
    types: [
      pokemonTypes.find(t => t.name === "Psychic")!
    ],
    hp: 106,
    attack: 110,
    defense: 90,
    specialAttack: 154,
    specialDefense: 90,
    speed: 130,
    generation: 1,
    isLegendary: true,
    rarity: "legendary",
    basePrice: 5000
  },
  // Generation 2
  {
    id: 16,
    pokedexId: 152,
    name: "Germignon",
    image: "/images/pokemon/Plante/Germignon.png",
    types: [
      pokemonTypes.find(t => t.name === "Grass")!
    ],
    hp: 45,
    attack: 49,
    defense: 65,
    specialAttack: 49,
    specialDefense: 65,
    speed: 45,
    generation: 2,
    isLegendary: false,
    rarity: "common",
    basePrice: 500
  },
  {
    id: 17,
    pokedexId: 155,
    name: "Héricendre",
    image: "/images/pokemon/Feu/H_ricendre.png",
    types: [
      pokemonTypes.find(t => t.name === "Fire")!
    ],
    hp: 39,
    attack: 52,
    defense: 43,
    specialAttack: 60,
    specialDefense: 50,
    speed: 65,
    generation: 2,
    isLegendary: false,
    rarity: "common",
    basePrice: 500
  },
  {
    id: 18,
    pokedexId: 158,
    name: "Kaiminus",
    image: "/images/pokemon/Eau/Kaiminus.png",
    types: [
      pokemonTypes.find(t => t.name === "Water")!
    ],
    hp: 50,
    attack: 65,
    defense: 64,
    specialAttack: 44,
    specialDefense: 48,
    speed: 43,
    generation: 2,
    isLegendary: false,
    rarity: "common",
    basePrice: 500
  },
  // Quelques Pokemon populaires supplémentaires
  {
    id: 19,
    pokedexId: 94,
    name: "Ectoplasma",
    image: "/images/pokemon/Spectre/Ectoplasma.png",
    types: [
      pokemonTypes.find(t => t.name === "Ghost")!,
      pokemonTypes.find(t => t.name === "Poison")!
    ],
    hp: 60,
    attack: 65,
    defense: 60,
    specialAttack: 130,
    specialDefense: 75,
    speed: 110,
    generation: 1,
    isLegendary: false,
    rarity: "rare",
    basePrice: 1800
  },
  {
    id: 20,
    pokedexId: 130,
    name: "Léviator",
    image: "/images/pokemon/Eau/L_viator.png",
    types: [
      pokemonTypes.find(t => t.name === "Water")!,
      pokemonTypes.find(t => t.name === "Flying")!
    ],
    hp: 95,
    attack: 125,
    defense: 79,
    specialAttack: 60,
    specialDefense: 100,
    speed: 81,
    generation: 1,
    isLegendary: false,
    rarity: "rare",
    basePrice: 2000
  }
];

// Fonction pour récupérer un Pokemon par ID
export const getPokemonById = (id: number): Pokemon | undefined => {
  return realPokemonData.find(pokemon => pokemon.id === id);
};

// Fonction pour récupérer un Pokemon par Pokedex ID
export const getPokemonByPokedexId = (pokedexId: number): Pokemon | undefined => {
  return realPokemonData.find(pokemon => pokemon.pokedexId === pokedexId);
};

// Fonction pour récupérer des Pokemon par type
export const getPokemonByType = (typeName: string): Pokemon[] => {
  return realPokemonData.filter(pokemon => 
    pokemon.types.some((type: PokemonType) => type.name === typeName || type.frenchName === typeName)
  );
};

// Fonction pour récupérer des Pokemon par rareté
export const getPokemonByRarity = (rarity: string): Pokemon[] => {
  return realPokemonData.filter(pokemon => pokemon.rarity === rarity);
};

// Fonction pour récupérer des Pokemon par génération
export const getPokemonByGeneration = (generation: number): Pokemon[] => {
  return realPokemonData.filter(pokemon => pokemon.generation === generation);
};

// Fonction pour récupérer des Pokemon légendaires
export const getLegendaryPokemon = (): Pokemon[] => {
  return realPokemonData.filter(pokemon => pokemon.isLegendary);
};

// Fonction pour rechercher des Pokemon par nom
export const searchPokemonByName = (query: string): Pokemon[] => {
  const lowercaseQuery = query.toLowerCase();
  return realPokemonData.filter(pokemon => 
    pokemon.name.toLowerCase().includes(lowercaseQuery)
  );
};