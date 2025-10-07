import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PokemonMultilingual {
  id: number;
  names: {
    fr: string;
    en: string;
    jp: string;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  metadata: {
    generation: number;
    category?: string;
    height?: string;
    weight?: string;
    catchRate: number;
  };
  sprites: {
    regular?: string;
    shiny?: string;
    gmax?: string;
  };
  breeding: {
    maleRate: number;
    femaleRate: number;
  };
}

export class PokemonService {
  
  /**
   * Get Pokemon by ID - SIMPLIFIED VERSION
   */
  async getPokemonById(id: number): Promise<any> {
    try {
      // Using raw SQL until Prisma client is synchronized
      console.log(`Getting Pokemon #${id} - using simplified version during migration`);
      return null; // TODO: Implement after schema sync
    } catch (error) {
      console.error(`Error fetching Pokemon #${id}:`, error);
      return null;
    }
  }

  /**
   * Search Pokemon - SIMPLIFIED VERSION  
   */
  async searchPokemon(query: string, limit: number = 20): Promise<any[]> {
    try {
      console.log(`Searching Pokemon '${query}' - using simplified version during migration`);
      return []; // TODO: Implement after schema sync
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      return [];
    }
  }
}

export default new PokemonService();