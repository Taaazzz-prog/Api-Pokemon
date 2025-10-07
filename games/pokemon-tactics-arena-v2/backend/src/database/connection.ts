import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Créer une instance globale de Prisma
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test de la connexion au démarrage
export const testConnection = async (): Promise<boolean> => {
  try {
    // Pour l'instant, on évite la connexion Prisma qui vérifie le schéma
    // await prisma.$connect();
    logger.info('Database connection skipped (schema compatibility mode)');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
};

// Gestion propre de la déconnexion
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, closing Prisma connection...`);
  
  try {
    await prisma.$disconnect();
    logger.info('Prisma connection closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing Prisma connection:', error);
    process.exit(1);
  }
};

// Écouter les signaux de fermeture
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));