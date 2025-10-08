import { apiClient } from './apiClient';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'pack' | 'currency';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  currency: 'credits' | 'gems';
  metadata?: Record<string, unknown>;
}

export interface ShopPurchaseResult {
  rewards: Array<Record<string, unknown>>;
  cost: Array<{ currency: 'credits' | 'gems'; amount: number }>;
}

const mapCategory = (category: string): ShopItem['category'] => {
  switch (category) {
    case 'POKEMON_PACK':
      return 'pack';
    case 'CURRENCY':
    default:
      return 'currency';
  }
};

const mapCurrency = (currency: string): ShopItem['currency'] =>
  currency === 'POKE_GEMS' ? 'gems' : 'credits';

const normalizeItem = (item: any): ShopItem => {
  const primaryPrice = item.prices?.[0] ?? { currency: 'POKE_CREDITS', amount: 0 };
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: mapCategory(item.category),
    rarity: (item.rarity?.toLowerCase?.() ?? 'common') as ShopItem['rarity'],
    price: primaryPrice.amount,
    currency: mapCurrency(primaryPrice.currency),
    metadata: item.metadata ?? {},
  };
};

export const realShopService = {
  async getShopItems(category?: string): Promise<ShopItem[]> {
    const filters =
      category && category !== 'all'
        ? {
            category: category === 'pack' ? 'POKEMON_PACK' : category === 'currency' ? 'CURRENCY' : undefined,
          }
        : undefined;

    const catalog = await apiClient.getShopCatalog(filters);
    if (!catalog || !catalog.items) {
      return [];
    }

    return catalog.items.map(normalizeItem);
  },

  async purchaseItem(itemId: string, quantity: number = 1): Promise<ShopPurchaseResult> {
    const result = await apiClient.purchaseItem(itemId, quantity);
    const rewards = result?.rewards ?? result?.items ?? [];
    const cost =
      (result?.cost ?? []).map((entry: any) => ({
        currency: mapCurrency(entry.currency),
        amount: entry.amount,
      })) ?? [];

    return {
      rewards,
      cost,
    };
  },
};

export default realShopService;
