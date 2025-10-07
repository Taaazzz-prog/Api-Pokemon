// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { prisma } from '../database/connection';
import { CurrencyService } from './currency.service';
import { logger } from '../utils/logger';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'POKEMON_PACK' | 'ITEMS' | 'COSMETICS' | 'BOOSTS';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  price: {
    credits?: number;
    gems?: number;
  };
  metadata: {
    packSize?: number;
    duration?: number;
    effect?: string;
  };
  isAvailable: boolean;
}

export interface PurchaseResult {
  success: boolean;
  items: any[];
  transaction: {
    id: string;
    cost: Array<{ currency: string; amount: number }>;
  };
}

export class ShopService {
  private currencyService = new CurrencyService();

  /**
   * Get shop catalog with filters
   */
  async getCatalog(filters: {
    category?: string;
    rarity?: string;
    maxPrice?: { credits?: number; gems?: number };
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: ShopItem[]; pagination: any }> {
    
    const { category, rarity, maxPrice, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    // Define shop items (could be from database in real implementation)
    const shopItems: ShopItem[] = [
      // Pokemon Packs
      {
        id: 'starter_pack',
        name: 'Pack Starter',
        description: '3 Pokémon aléatoires pour débuter',
        category: 'POKEMON_PACK',
        rarity: 'COMMON',
        price: { credits: 500 },
        metadata: { packSize: 3 },
        isAvailable: true
      },
      {
        id: 'premium_pack',
        name: 'Pack Premium',
        description: '5 Pokémon avec garantie d\'au moins 1 rare',
        category: 'POKEMON_PACK',
        rarity: 'RARE',
        price: { gems: 10 },
        metadata: { packSize: 5 },
        isAvailable: true
      },
      {
        id: 'legendary_pack',
        name: 'Pack Légendaire',
        description: '3 Pokémon avec garantie d\'1 légendaire',
        category: 'POKEMON_PACK',
        rarity: 'LEGENDARY',
        price: { gems: 50 },
        metadata: { packSize: 3 },
        isAvailable: true
      },

      // Items
      {
        id: 'super_potion',
        name: 'Super Potion',
        description: 'Restaure 100 HP à un Pokémon',
        category: 'ITEMS',
        rarity: 'COMMON',
        price: { credits: 200 },
        metadata: { effect: 'heal_100' },
        isAvailable: true
      },
      {
        id: 'rare_candy',
        name: 'Super Bonbon',
        description: 'Augmente le niveau d\'un Pokémon de 1',
        category: 'ITEMS',
        rarity: 'RARE',
        price: { gems: 5 },
        metadata: { effect: 'level_up' },
        isAvailable: true
      },

      // Boosts
      {
        id: 'xp_boost_1h',
        name: 'Boost XP (1h)',
        description: 'Double l\'XP gagnée pendant 1 heure',
        category: 'BOOSTS',
        rarity: 'UNCOMMON',
        price: { gems: 3 },
        metadata: { duration: 3600, effect: 'xp_x2' },
        isAvailable: true
      },
      {
        id: 'credit_boost_1h',
        name: 'Boost Crédits (1h)',
        description: 'Double les crédits gagnés pendant 1 heure',
        category: 'BOOSTS',
        rarity: 'UNCOMMON',
        price: { gems: 3 },
        metadata: { duration: 3600, effect: 'credits_x2' },
        isAvailable: true
      },

      // Cosmetics
      {
        id: 'avatar_frame_gold',
        name: 'Cadre Avatar Or',
        description: 'Cadre doré pour votre avatar',
        category: 'COSMETICS',
        rarity: 'EPIC',
        price: { gems: 25 },
        metadata: { effect: 'avatar_frame' },
        isAvailable: true
      }
    ];

    // Apply filters
    let filteredItems = shopItems.filter(item => item.isAvailable);

    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (rarity) {
      filteredItems = filteredItems.filter(item => item.rarity === rarity);
    }

    if (maxPrice) {
      filteredItems = filteredItems.filter(item => {
        if (maxPrice.credits && item.price.credits && item.price.credits > maxPrice.credits) {
          return false;
        }
        if (maxPrice.gems && item.price.gems && item.price.gems > maxPrice.gems) {
          return false;
        }
        return true;
      });
    }

    // Pagination
    const total = filteredItems.length;
    const paginatedItems = filteredItems.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Purchase item from shop
   */
  async purchaseItem(
    userId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<PurchaseResult> {
    
    // Get item details
    const catalog = await this.getCatalog();
    const item = catalog.items.find(i => i.id === itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    if (!item.isAvailable) {
      throw new Error('Item not available');
    }

    // Calculate total cost
    const totalCost = [];
    if (item.price.credits) {
      totalCost.push({
        currency: 'POKE_CREDITS' as const,
        amount: item.price.credits * quantity
      });
    }
    if (item.price.gems) {
      totalCost.push({
        currency: 'POKE_GEMS' as const,
        amount: item.price.gems * quantity
      });
    }

    // Check if user can afford
    const canAfford = await this.currencyService.canAfford(userId, totalCost);
    if (!canAfford) {
      throw new Error('Insufficient currency');
    }

    // Process purchase in transaction
    return await prisma.$transaction(async (tx: any) => {
      // Deduct currency
      const transactions = [];
      for (const cost of totalCost) {
        const result = await this.currencyService.removeCurrency(
          userId,
          cost.currency,
          cost.amount,
          `Shop purchase: ${item.name} x${quantity}`,
          { itemId, quantity }
        );
        transactions.push(result.transactionId);
      }

      // Generate items based on purchase
      const purchasedItems = await this.generatePurchaseItems(
        item,
        quantity,
        userId
      );

      // Log purchase
      logger.info(`User ${userId} purchased ${quantity}x ${item.name}`);

      return {
        success: true,
        items: purchasedItems,
        transaction: {
          id: transactions[0], // Primary transaction ID
          cost: totalCost
        }
      };
    });
  }

  /**
   * Generate items from purchase
   */
  private async generatePurchaseItems(
    item: ShopItem,
    quantity: number,
    userId: string
  ): Promise<any[]> {
    
    const items = [];

    for (let i = 0; i < quantity; i++) {
      switch (item.category) {
        case 'POKEMON_PACK':
          const packPokemon = await this.generatePackPokemon(item, userId);
          items.push(...packPokemon);
          break;

        case 'ITEMS':
          // Add to user inventory
          const inventoryItem = await prisma.userInventory.create({
            data: {
              userId,
              itemType: item.id,
              itemName: item.name,
              quantity: 1,
              metadata: item.metadata
            }
          });
          items.push(inventoryItem);
          break;

        case 'BOOSTS':
          // Apply boost effect
          const boost = await this.applyBoost(userId, item);
          items.push(boost);
          break;

        case 'COSMETICS':
          // Add cosmetic to collection
          const cosmetic = await prisma.userCosmetics.create({
            data: {
              userId,
              cosmeticType: item.id,
              cosmeticName: item.name,
              isEquipped: false,
              metadata: item.metadata
            }
          });
          items.push(cosmetic);
          break;
      }
    }

    return items;
  }

  /**
   * Generate Pokemon from pack opening
   */
  private async generatePackPokemon(item: ShopItem, userId: string): Promise<any[]> {
    const packSize = item.metadata.packSize || 3;
    const guaranteedRarity = this.getGuaranteedRarity(item);
    
    const pokemon = [];
    
    for (let i = 0; i < packSize; i++) {
      // Determine rarity for this Pokemon
      let rarity;
      if (i === 0 && guaranteedRarity) {
        rarity = guaranteedRarity; // First card guaranteed
      } else {
        rarity = this.rollPackRarity(item.rarity);
      }

      // Get random Pokemon of this rarity (for now, get any Pokemon by generation)
      const randomPokemon = await prisma.pokemon.findFirst({
        where: { 
          generation: { lte: 3 } // Only Gen 1-3 for now
        },
        skip: Math.floor(Math.random() * 100),
        orderBy: { id: 'asc' }
      });

      if (randomPokemon) {
        // Add to user's roster
        const rosterEntry = await prisma.userRoster.create({
          data: {
            userId,
            pokemonId: randomPokemon.id,
            nickname: null,
            level: this.getPackPokemonLevel(item.rarity),
            experience: 0,
            customStats: null,
            obtainedFrom: `shop_${item.id}`,
            obtainedAt: new Date(),
            isLocked: false
          },
          include: { pokemon: true }
        });

        pokemon.push(rosterEntry);
      }
    }

    return pokemon;
  }

  /**
   * Get guaranteed rarity for pack
   */
  private getGuaranteedRarity(item: ShopItem): string | null {
    switch (item.id) {
      case 'premium_pack':
        return 'RARE';
      case 'legendary_pack':
        return 'LEGENDARY';
      default:
        return null;
    }
  }

  /**
   * Roll random rarity based on pack type
   */
  private rollPackRarity(packRarity: string): string {
    const rarityChances = {
      COMMON: { COMMON: 70, UNCOMMON: 25, RARE: 5 },
      RARE: { COMMON: 50, UNCOMMON: 30, RARE: 15, EPIC: 5 },
      LEGENDARY: { UNCOMMON: 40, RARE: 35, EPIC: 20, LEGENDARY: 5 }
    };

    const chances = rarityChances[packRarity as keyof typeof rarityChances] 
                   || rarityChances.COMMON;

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(chances)) {
      cumulative += chance;
      if (random <= cumulative) {
        return rarity;
      }
    }

    return 'COMMON';
  }

  /**
   * Get Pokemon level based on pack rarity
   */
  private getPackPokemonLevel(packRarity: string): number {
    const levelRanges = {
      COMMON: [1, 10],
      UNCOMMON: [5, 15],
      RARE: [10, 20],
      EPIC: [15, 25],
      LEGENDARY: [20, 30]
    };

    const range = levelRanges[packRarity as keyof typeof levelRanges] || [1, 10];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }

  /**
   * Apply boost effect to user
   */
  private async applyBoost(userId: string, item: ShopItem): Promise<any> {
    const duration = item.metadata.duration || 3600; // 1 hour default
    const expiresAt = new Date(Date.now() + duration * 1000);

    return await prisma.userBoosts.create({
      data: {
        userId,
        boostType: item.metadata.effect || 'unknown',
        multiplier: 2, // Default 2x
        expiresAt,
        isActive: true
      }
    });
  }

  /**
   * Get user's purchase history
   */
  async getPurchaseHistory(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<any> {
    
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Get transactions with shop purchases
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        source: { startsWith: 'Shop purchase:' }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    return {
      purchases: transactions,
      pagination: { page, limit, total: transactions.length }
    };
  }
}

export const shopService = new ShopService();