// Types temporaires pour remplacer @pta/contracts
export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  experience: number;
  pokeCredits: number;
  pokeGems: number;
  avatar: string;
}

export interface Pokemon {
  id: string;
  pokedexId: number;
  name: string;
  level: number;
  experience: number;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  moves: string[];
  nature: string;
  isShiny: boolean;
  nickname?: string;
  sprite: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'credits' | 'gems';
  category: 'pack' | 'item' | 'boost' | 'cosmetic';
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}