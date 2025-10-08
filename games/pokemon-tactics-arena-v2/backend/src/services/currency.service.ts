import { Prisma, Currency, TransactionType, GameMode, BattleResult } from '@prisma/client';
import { prisma } from '../database/connection';
import { logger } from '../utils/logger';

export type CurrencyCode = Currency;
export type TransactionKind = TransactionType;

interface OperationOptions {
  metadata?: Prisma.JsonValue;
  transaction?: Prisma.TransactionClient;
}

class CurrencyService {
  async getBalance(userId: string): Promise<{ pokeCredits: number; pokeGems: number }> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { pokeCredits: true, pokeGems: true },
    });

    return profile ?? { pokeCredits: 0, pokeGems: 0 };
  }

  async addCurrency(
    userId: string,
    currency: CurrencyCode,
    amount: number,
    source: string,
    options: OperationOptions = {}
  ) {
    return this.adjustBalance(userId, currency, amount, TransactionType.CREDIT, {
      source,
      metadata: options.metadata,
      transaction: options.transaction,
    });
  }

  async removeCurrency(
    userId: string,
    currency: CurrencyCode,
    amount: number,
    source: string,
    options: OperationOptions = {}
  ) {
    return this.adjustBalance(userId, currency, -Math.abs(amount), TransactionType.DEBIT, {
      source,
      metadata: options.metadata,
      transaction: options.transaction,
    });
  }

  async canAfford(userId: string, costs: Array<{ currency: CurrencyCode; amount: number }>): Promise<boolean> {
    const balance = await this.getBalance(userId);

    return costs.every(({ currency, amount }) => {
      if (currency === Currency.POKE_CREDITS) {
        return balance.pokeCredits >= amount;
      }
      return balance.pokeGems >= amount;
    });
  }

  async getTransactionHistory(
    userId: string,
    options: {
      currency?: CurrencyCode;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const { currency, limit = 20, offset = 0, startDate, endDate } = options;

    const where: Prisma.TransactionWhereInput = { userId };

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

  getDailyBonus(consecutiveDays = 1): Array<{ currency: CurrencyCode; amount: number }> {
    const baseCredits = 50;
    const multiplier = Math.min(1 + (consecutiveDays - 1) * 0.1, 2);
    const rewards: Array<{ currency: CurrencyCode; amount: number }> = [
      { currency: Currency.POKE_CREDITS, amount: Math.floor(baseCredits * multiplier) },
    ];

    if (Math.random() < 0.1) {
      rewards.push({ currency: Currency.POKE_GEMS, amount: 1 });
    }

    return rewards;
  }

  getBattleRewards(gameMode: GameMode, result: BattleResult): Array<{ currency: CurrencyCode; amount: number }> {
    const baseRewards: Record<GameMode, { credits: number; gems: number }> = {
      FREE: { credits: 25, gems: 1 },
      SURVIVAL: { credits: 50, gems: 2 },
      TOURNAMENT: { credits: 100, gems: 5 },
      ARENA: { credits: 75, gems: 3 },
    };

    const multiplier = result === 'WIN' ? 1 : result === 'DRAW' ? 0.5 : 0.3;
    const base = baseRewards[gameMode];

    return [
      { currency: Currency.POKE_CREDITS, amount: Math.floor(base.credits * multiplier) },
      { currency: Currency.POKE_GEMS, amount: Math.floor(base.gems * multiplier) },
    ];
  }

  getStarterRewards(): Array<{ currency: CurrencyCode; amount: number }> {
    return [
      { currency: Currency.POKE_CREDITS, amount: 3000 },
      { currency: Currency.POKE_GEMS, amount: 55 },
    ];
  }

  private async adjustBalance(
    userId: string,
    currency: CurrencyCode,
    amount: number,
    type: TransactionKind,
    options: { source: string; metadata?: Prisma.JsonValue; transaction?: Prisma.TransactionClient }
  ) {
    if (amount === 0) {
      return { newBalance: await this.getCurrentBalance(userId, currency), transactionId: null };
    }

    const tx = options.transaction ?? prisma;

    const profile = await tx.userProfile.findUnique({
      where: { userId },
      select: { pokeCredits: true, pokeGems: true },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    const currentBalance = currency === Currency.POKE_CREDITS ? profile.pokeCredits : profile.pokeGems;
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      throw new Error(`Insufficient ${currency}. Current: ${currentBalance}, required: ${Math.abs(amount)}`);
    }

    await tx.userProfile.update({
      where: { userId },
      data: {
        [currency === Currency.POKE_CREDITS ? 'pokeCredits' : 'pokeGems']: newBalance,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        currency,
        type,
        amount: Math.abs(amount),
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        source: options.source,
        metadata: options.metadata ?? Prisma.JsonNull,
      },
    });

    logger.info('Currency updated', { userId, currency, type, amount: Math.abs(amount), source: options.source });

    return {
      newBalance,
      transactionId: transaction.id,
    };
  }

  private async getCurrentBalance(userId: string, currency: CurrencyCode) {
    const balance = await this.getBalance(userId);
    return currency === Currency.POKE_CREDITS ? balance.pokeCredits : balance.pokeGems;
  }
}

export { CurrencyService };
export const currencyService = new CurrencyService();
