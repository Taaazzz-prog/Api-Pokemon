import { PrismaClient } from '@prisma/client';
import { prisma } from '../database/connection';
import { logger } from '../utils/logger';

export class StarterPackService {
  
  /**
   * Check if user has received starter pack
   */
  async hasReceivedStarterPack(userId: string): Promise<boolean> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      });
      
      return profile?.hasReceivedStarterPack || false;
    } catch (error: any) {
      logger.error('Check starter pack failed', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Apply starter pack to user
   */
  async applyStarterPack(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      logger.info('Applying starter pack', { userId });

      // Check if already received
      const hasReceived = await this.hasReceivedStarterPack(userId);
      if (hasReceived) {
        logger.warn('User already received starter pack', { userId });
        return { success: false, error: 'Starter pack already received' };
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        logger.info('Starting starter pack transaction', { userId });
        
        // Update profile with starter pack flag and rewards
        const updatedProfile = await tx.userProfile.update({
          where: { userId },
          data: {
            hasReceivedStarterPack: true,
            pokeCredits: { increment: 3000 },
            pokeGems: { increment: 55 }
          }
        });
        logger.info('Profile updated successfully', { userId, credits: updatedProfile.pokeCredits, gems: updatedProfile.pokeGems });

        // Add starter Pokemon to roster
        const starterPokemon = [
          { pokemonId: 1, nickname: 'Bulbizarre' },   // Bulbasaur
          { pokemonId: 4, nickname: 'Salamèche' },    // Charmander  
          { pokemonId: 7, nickname: 'Carapuce' }      // Squirtle
        ];

        const rosterEntries = [];
        for (const pokemon of starterPokemon) {
          logger.info('Processing starter Pokemon', { userId, pokemonId: pokemon.pokemonId, nickname: pokemon.nickname });
          
          // First check if this Pokemon already exists in roster
          const existingEntry = await tx.userRoster.findFirst({
            where: {
              userId,
              pokemonId: pokemon.pokemonId
            }
          });

          if (existingEntry) {
            logger.warn('Pokemon already exists in roster', { userId, pokemonId: pokemon.pokemonId });
          } else {
            logger.info('Creating new roster entry', { userId, pokemonId: pokemon.pokemonId });
            try {
              const entry = await tx.userRoster.create({
                data: {
                  userId,
                  pokemonId: pokemon.pokemonId,
                  nickname: pokemon.nickname,
                  level: 5,
                  experience: 0,
                  obtainedFrom: 'starter',
                  obtainedAt: new Date()
                }
              });
              logger.info('Roster entry created successfully', { entryId: entry.id, pokemonId: pokemon.pokemonId });
              rosterEntries.push(entry);
            } catch (createError: any) {
              logger.error('Failed to create roster entry', { 
                userId, 
                pokemonId: pokemon.pokemonId, 
                error: createError.message,
                code: createError.code 
              });
              throw createError;
            }
          }
        }

        logger.info('Transaction completed', { userId, pokemonAdded: rosterEntries.length });
        return {
          profile: updatedProfile,
          pokemonAdded: rosterEntries.length
        };
      });

      logger.info('Starter pack applied successfully', { 
        userId, 
        pokemonAdded: result.pokemonAdded 
      });

      return { 
        success: true, 
        data: {
          hasReceivedStarterPack: true,
          pokeCredits: result.profile.pokeCredits,
          pokeGems: result.profile.pokeGems,
          pokemonAdded: result.pokemonAdded
        }
      };

    } catch (error: any) {
      logger.error('Apply starter pack failed', { error: error.message, stack: error.stack, userId });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get starter pack status and rewards info
   */
  async getStarterPackInfo(userId: string): Promise<any> {
    try {
      const hasReceived = await this.hasReceivedStarterPack(userId);
      
      const rosterCount = await prisma.userRoster.count({
        where: { 
          userId,
          obtainedFrom: 'starter'
        }
      });

      return {
        hasReceived,
        rosterCount,
        rewards: {
          pokeCredits: 3000,
          pokeGems: 55,
          starterPokemon: 3
        }
      };
    } catch (error: any) {
      logger.error('Get starter pack info failed', { error: error.message, userId });
      return {
        hasReceived: false,
        rosterCount: 0,
        error: error.message
      };
    }
  }
}

export default new StarterPackService();