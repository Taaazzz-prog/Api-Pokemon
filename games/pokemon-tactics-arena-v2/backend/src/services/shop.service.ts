import { Prisma, Currency } from '@prisma/client';
import { prisma } from '../database/connection';
import { currencyService } from './currency.service';
import { logger } from '../utils/logger';

export interface ShopCatalogItem {
  id: string;
  name: string;
  description: string;
  category: 'POKEMON_PACK' | 'CURRENCY';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  prices: Array<{ currency: Currency; amount: number }>;
  metadata?: Record<string, unknown>;
  isAvailable: boolean;
}

export interface PurchaseResult {
  success: boolean;
  rewards: Array<Record<string, unknown>>;
  cost: Array<{ currency: Currency; amount: number }>;
}

const SHOP_ITEMS: ShopCatalogItem[] = [
  {
    id: 'starter_pack',
    name: 'Pack de démarrage',
    description: 'Obtenez trois Pokémon aléatoires des premières générations.',
    category: 'POKEMON_PACK',
    rarity: 'COMMON',
    prices: [{ currency: Currency.POKE_CREDITS, amount: 500 }],
    metadata: { packSize: 3, maxGeneration: 2 },
    isAvailable: true,
  },
  {
    id: 'rare_pack',
    name: 'Pack rare',
    description: 'Garantit au moins un Pokémon rare.',
    category: 'POKEMON_PACK',
    rarity: 'RARE',
    prices: [{ currency: Currency.POKE_GEMS, amount: 12 }],
    metadata: { packSize: 4, guaranteedRarity: 'RARE', maxGeneration: 3 },
    isAvailable: true,
  },
  {
    id: 'credit_bundle_small',
    name: 'Pack de crédits (petit)',
    description: '+750 Poké-Crédits.',
    category: 'CURRENCY',
    rarity: 'COMMON',
    prices: [{ currency: Currency.POKE_GEMS, amount: 3 }],
    metadata: { reward: { currency: Currency.POKE_CREDITS, amount: 750 } },
    isAvailable: true,
  },
  {
    id: 'credit_bundle_large',
    name: 'Pack de crédits (grand)',
    description: '+2 000 Poké-Crédits.',
    category: 'CURRENCY',
    rarity: 'UNCOMMON',
    prices: [{ currency: Currency.POKE_GEMS, amount: 7 }],
    metadata: { reward: { currency: Currency.POKE_CREDITS, amount: 2000 } },
    isAvailable: true,
  },
];

class ShopService {
  async getCatalog(filters: {
    category?: ShopCatalogItem['category'];
    rarity?: ShopCatalogItem['rarity'];
    page?: number;
    limit?: number;
  } = {}) {
    const { category, rarity, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let items = SHOP_ITEMS.filter((item) => item.isAvailable);

    if (category) {
      items = items.filter((item) => item.category === category);
    }

    if (rarity) {
      items = items.filter((item) => item.rarity === rarity);
    }

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return {
      items: paginated,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async purchaseItem(userId: string, itemId: string, quantity = 1): Promise<PurchaseResult> {
    const item = SHOP_ITEMS.find((catalogItem) => catalogItem.id === itemId && catalogItem.isAvailable);
    if (!item) {
      throw new Error('Article introuvable');
    }

    const costs = item.prices.map((price) => ({
      currency: price.currency,
      amount: price.amount * quantity,
    }));

    const canAfford = await currencyService.canAfford(userId, costs);
    if (!canAfford) {
      throw new Error('Solde insuffisant');
    }

    return prisma.$transaction(async (tx) => {
      for (const cost of costs) {
        await currencyService.removeCurrency(userId, cost.currency, cost.amount, `shop:${item.id}`, {
          metadata: { itemId: item.id, quantity },
          transaction: tx,
        });
      }

      const rewards: Array<Record<string, unknown>> = [];

      if (item.category === 'POKEMON_PACK') {
        const packRewards = await this.openPokemonPack(tx, userId, item, quantity);
        rewards.push(...packRewards);
      } else if (item.category === 'CURRENCY') {
        const reward = item.metadata?.reward as { currency: Currency; amount: number } | undefined;
        if (reward) {
          await currencyService.addCurrency(userId, reward.currency, reward.amount * quantity, `shop:${item.id}`, {
            metadata: { itemId: item.id, quantity },
            transaction: tx,
          });
          rewards.push({ type: 'currency', currency: reward.currency, amount: reward.amount * quantity });
        }
      }

      logger.info('Shop purchase completed', { userId, itemId: item.id, quantity });

      return {
        success: true,
        rewards,
        cost: costs,
      };
    });
  }

  private async openPokemonPack(
    tx: Prisma.TransactionClient,
    userId: string,
    item: ShopCatalogItem,
    quantity: number
  ): Promise<Array<Record<string, unknown>>> {
    const packSize = Number(item.metadata?.packSize ?? 3);
    const maxGeneration = Number(item.metadata?.maxGeneration ?? 3);
    const guaranteedRarity = item.metadata?.guaranteedRarity as string | undefined;

    const rewards: Array<Record<string, unknown>> = [];

    for (let packIndex = 0; packIndex < quantity; packIndex += 1) {
      for (let i = 0; i < packSize; i += 1) {
        const rarity = i === 0 && guaranteedRarity ? guaranteedRarity : this.rollPackRarity(item.rarity);
        const pokemon = await this.pickRandomPokemon(maxGeneration);

        if (!pokemon) {
          continue;
        }

        const existing = await tx.userRoster.findUnique({
          where: {
            userId_pokemonId: {
              userId,
              pokemonId: pokemon.id,
            },
          },
        });

        if (existing) {
          const updated = await tx.userRoster.update({
            where: { id: existing.id },
            data: { level: Math.min(existing.level + 1, 100) },
            include: {
              pokemon: true,
            },
          });
          rewards.push({ type: 'upgrade', rosterId: updated.id, pokemonId: updated.pokemonId, rarity });
        } else {
          const rosterEntry = await tx.userRoster.create({
            data: {
              userId,
              pokemonId: pokemon.id,
              nickname: null,
              level: this.initialLevelForRarity(rarity),
              experience: 0,
              customStats: null,
              obtainedFrom: `shop_${item.id}`,
              obtainedAt: new Date(),
              isLocked: false,
            },
            include: {
              pokemon: true,
            },
          });

          rewards.push({ type: 'pokemon', rosterId: rosterEntry.id, pokemonId: rosterEntry.pokemonId, rarity });
        }
      }
    }

    return rewards;
  }

  private async pickRandomPokemon(maxGeneration: number) {
    const count = await prisma.pokemon.count({ where: { generation: { lte: maxGeneration } } });
    if (count === 0) {
      return null;
    }

    const offset = Math.floor(Math.random() * count);
    return prisma.pokemon.findFirst({
      where: { generation: { lte: maxGeneration } },
      skip: offset,
      orderBy: { id: 'asc' },
    });
  }

  private initialLevelForRarity(rarity: string): number {
    switch (rarity) {
      case 'LEGENDARY':
        return 20;
      case 'EPIC':
        return 18;
      case 'RARE':
        return 16;
      case 'UNCOMMON':
        return 14;
      default:
        return 12;
    }
  }

  private rollPackRarity(packRarity: ShopCatalogItem['rarity']): ShopCatalogItem['rarity'] {
    const rarityChances: Record<string, Record<ShopCatalogItem['rarity'], number>> = {
      COMMON: { COMMON: 70, UNCOMMON: 25, RARE: 5, EPIC: 0, LEGENDARY: 0 },
      UNCOMMON: { COMMON: 50, UNCOMMON: 30, RARE: 15, EPIC: 5, LEGENDARY: 0 },
      RARE: { COMMON: 35, UNCOMMON: 35, RARE: 20, EPIC: 8, LEGENDARY: 2 },
      EPIC: { COMMON: 20, UNCOMMON: 30, RARE: 25, EPIC: 20, LEGENDARY: 5 },
      LEGENDARY: { COMMON: 10, UNCOMMON: 20, RARE: 25, EPIC: 25, LEGENDARY: 20 },
    };

    const table = rarityChances[packRarity] ?? rarityChances.COMMON;
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(table)) {
      cumulative += chance;
      if (roll <= cumulative) {
        return rarity as ShopCatalogItem['rarity'];
      }
    }

    return 'COMMON';
  }
}

export const shopService = new ShopService();
