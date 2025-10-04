import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

type Currency = 'POKE_CREDITS' | 'POKE_GEMS';
type TransactionType = 'CREDIT' | 'DEBIT';

const Currency = {
  POKE_CREDITS: 'POKE_CREDITS' as const,
  POKE_GEMS: 'POKE_GEMS' as const,
};

const TransactionType = {
  CREDIT: 'CREDIT' as const,
  DEBIT: 'DEBIT' as const,
};

const prisma = new PrismaClient();

/**
 * Currency Service for managing PokeCredits and PokeGems
 */
export class CurrencyService {
  /**
   * Get current balance for a user
   */
  async getBalance(userId: string): Promise<{ pokeCredits: number; pokeGems: number }> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { pokeCredits: true, pokeGems: true }
    });

    return profile || { pokeCredits: 0, pokeGems: 0 };
  }

  /**
   * Add currency to user account
   */
  async addCurrency(
    userId: string,
    currency: Currency,
    amount: number,
    source: string,
    metadata: Record<string, any> = {}
  ): Promise<{ newBalance: number; transactionId: string }> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    return await prisma.$transaction(async (tx: any) => {
      // Get current balance
      const profile = await tx.userProfile.findUnique({
        where: { userId },
        select: {
          pokeCredits: true,
          pokeGems: true,
        },
      });

      if (!profile) {
        throw new Error('User profile not found');
      }

      const currentBalance = currency === Currency.POKE_CREDITS 
        ? profile.pokeCredits 
        : profile.pokeGems;
      
      const newBalance = currentBalance + amount;

      // Update balance
      await tx.userProfile.update({
        where: { userId },
        data: {
          [currency === Currency.POKE_CREDITS ? 'pokeCredits' : 'pokeGems']: newBalance,
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          currency: currency as any,
          type: TransactionType.CREDIT as any,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          source,
          description: `Added ${amount} ${currency}`,
          metadata: metadata as any,
        },
      });

      logger.info(`Added ${amount} ${currency} to user ${userId}. New balance: ${newBalance}`);

      return {
        newBalance,
        transactionId: transaction.id,
      };
    });
  }

  /**
   * Remove currency from user account
   */
  async removeCurrency(
    userId: string,
    currency: Currency,
    amount: number,
    source: string,
    metadata: Record<string, any> = {}
  ): Promise<{ newBalance: number; transactionId: string }> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    return await prisma.$transaction(async (tx: any) => {
      // Get current balance
      const profile = await tx.userProfile.findUnique({
        where: { userId },
        select: {
          pokeCredits: true,
          pokeGems: true,
        },
      });

      if (!profile) {
        throw new Error('User profile not found');
      }

      const currentBalance = currency === Currency.POKE_CREDITS 
        ? profile.pokeCredits 
        : profile.pokeGems;

      if (currentBalance < amount) {
        throw new Error(`Insufficient ${currency}. Current: ${currentBalance}, Required: ${amount}`);
      }
      
      const newBalance = currentBalance - amount;

      // Update balance
      await tx.userProfile.update({
        where: { userId },
        data: {
          [currency === Currency.POKE_CREDITS ? 'pokeCredits' : 'pokeGems']: newBalance,
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          currency: currency as any,
          type: TransactionType.DEBIT as any,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          source,
          description: `Removed ${amount} ${currency}`,
          metadata: metadata as any,
        },
      });

      logger.info(`Removed ${amount} ${currency} from user ${userId}. New balance: ${newBalance}`);

      return {
        newBalance,
        transactionId: transaction.id,
      };
    });
  }

  /**
   * Transfer currency between users
   */
  async transferCurrency(
    fromUserId: string,
    toUserId: string,
    currency: Currency,
    amount: number,
    source: string = 'user_transfer',
    metadata: Record<string, any> = {}
  ): Promise<{ senderBalance: number; recipientBalance: number; transactionIds: string[] }> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    return await prisma.$transaction(async (tx: any) => {
      // Remove from sender
      const senderResult = await this.removeCurrency(fromUserId, currency, amount, source, {
        ...metadata,
        transferTo: toUserId,
      });

      // Add to recipient
      const recipientResult = await this.addCurrency(toUserId, currency, amount, source, {
        ...metadata,
        transferFrom: fromUserId,
      });

      logger.info(`Transferred ${amount} ${currency} from ${fromUserId} to ${toUserId}`);

      return {
        senderBalance: senderResult.newBalance,
        recipientBalance: recipientResult.newBalance,
        transactionIds: [senderResult.transactionId, recipientResult.transactionId],
      };
    });
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    options: {
      currency?: Currency;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const { currency, limit = 20, offset = 0, startDate, endDate } = options;

    const where: any = { userId };
    
    if (currency) {
      where.currency = currency;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Calculate daily login bonus
   */
  async calculateDailyBonus(userId: string, consecutiveDays: number = 1) {
    const baseCredits = 50;
    const baseGems = consecutiveDays >= 7 ? 2 : 1;
    
    // Bonus multiplier based on consecutive days
    const multiplier = Math.min(1 + (consecutiveDays - 1) * 0.1, 2); // Max 2x multiplier
    
    return [
      { currency: Currency.POKE_CREDITS, amount: Math.floor(baseCredits * multiplier) },
      ...(Math.random() < 0.1 ? [{ currency: Currency.POKE_GEMS, amount: 1 }] : []), // 10% chance for extra gem
    ];
  }

  /**
   * Calculate battle rewards based on performance
   */
  async calculateBattleRewards(
    gameMode: string,
    result: 'WIN' | 'LOSS' | 'DRAW',
    performance: {
      damage?: number;
      survival?: number;
      time?: number;
    } = {}
  ) {
    const baseRewards = {
      FREE: { credits: 25, gems: 1 },
      SURVIVAL: { credits: 50, gems: 2 },
      TOURNAMENT: { credits: 100, gems: 5 },
      ARENA: { credits: 75, gems: 3 },
    };

    const base = baseRewards[gameMode as keyof typeof baseRewards] || baseRewards.FREE;
    const resultMultiplier = result === 'WIN' ? 1 : result === 'DRAW' ? 0.5 : 0.3;
    
    return [
      { currency: Currency.POKE_CREDITS, amount: Math.floor(base.credits * resultMultiplier) },
      { currency: Currency.POKE_GEMS, amount: Math.floor(base.gems * resultMultiplier) },
    ];
  }

  /**
   * Calculate achievement rewards
   */
  async calculateAchievementRewards(achievementTier: string) {
    const gemRewards: Record<string, number> = {
      bronze: 2,
      silver: 5,
      gold: 10,
      legendary: 25,
    };

    return [
      { currency: Currency.POKE_CREDITS, amount: 200 },
      { currency: Currency.POKE_GEMS, amount: gemRewards[achievementTier] || 10 },
    ];
  }

  /**
   * Apply starter pack rewards
   */
  async applyStarterRewards(userId: string) {
    return [
      { currency: Currency.POKE_CREDITS, amount: 75 },
    ];
  }

  /**
   * Validate if user can afford a purchase
   */
  async canAfford(userId: string, costs: Array<{ currency: Currency; amount: number }>): Promise<boolean> {
    const balance = await this.getBalance(userId);
    
    return costs.every(cost => {
      const currentBalance = cost.currency === Currency.POKE_CREDITS 
        ? balance.pokeCredits 
        : balance.pokeGems;
      return currentBalance >= cost.amount;
    });
  }

  /**
   * Process multiple currency operations atomically
   */
  async processMultipleTransactions(
    userId: string,
    operations: Array<{
      type: 'ADD' | 'REMOVE';
      currency: Currency;
      amount: number;
      source: string;
      metadata?: Record<string, any>;
    }>
  ) {
    return await prisma.$transaction(async (tx: any) => {
      const results = [];
      
      for (const op of operations) {
        if (op.type === 'ADD') {
          const result = await this.addCurrency(
            userId,
            op.currency,
            op.amount,
            op.source,
            op.metadata
          );
          results.push(result);
        } else {
          const result = await this.removeCurrency(
            userId,
            op.currency,
            op.amount,
            op.source,
            op.metadata
          );
          results.push(result);
        }
      }
      
      return results;
    });
  }
}

export const currencyService = new CurrencyService();