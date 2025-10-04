import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  ShoppingBagIcon,
  CubeIcon,
  SparklesIcon,
  GiftIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'pack' | 'item' | 'boost' | 'cosmetic';
  price: number;
  currency: 'credits' | 'gems';
  rarity?: string;
  contents?: string[];
  image?: string;
  discount?: number;
  popular?: boolean;
}

const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userCurrency] = useState({ credits: 1000, gems: 50 });

  const shopItems: ShopItem[] = [
    {
      id: 'pack1',
      name: 'Basic Pokemon Pack',
      description: 'Contains 5 random Pokemon with guaranteed uncommon+',
      type: 'pack',
      price: 100,
      currency: 'credits',
      contents: ['5 Pokemon Cards', 'Guaranteed Uncommon+'],
      popular: true,
    },
    {
      id: 'pack2',
      name: 'Premium Pokemon Pack',
      description: 'Contains 5 random Pokemon with guaranteed rare+',
      type: 'pack',
      price: 10,
      currency: 'gems',
      contents: ['5 Pokemon Cards', 'Guaranteed Rare+', '1 Bonus Item'],
    },
    {
      id: 'pack3',
      name: 'Legendary Pack',
      description: 'High chance for legendary Pokemon!',
      type: 'pack',
      price: 25,
      currency: 'gems',
      rarity: 'legendary',
      contents: ['3 Pokemon Cards', 'High Legendary Chance', 'Exclusive Items'],
      discount: 20,
    },
    {
      id: 'item1',
      name: 'Evolution Stone',
      description: 'Evolve your Pokemon instantly',
      type: 'item',
      price: 50,
      currency: 'credits',
    },
    {
      id: 'item2',
      name: 'Master Ball',
      description: 'Guarantees capture in battles',
      type: 'item',
      price: 5,
      currency: 'gems',
    },
    {
      id: 'boost1',
      name: 'XP Boost (24h)',
      description: 'Double XP gain for 24 hours',
      type: 'boost',
      price: 3,
      currency: 'gems',
    },
    {
      id: 'boost2',
      name: 'Credits Boost (1h)',
      description: 'Double credits from battles for 1 hour',
      type: 'boost',
      price: 150,
      currency: 'credits',
    },
    {
      id: 'cosmetic1',
      name: 'Shiny Effect',
      description: 'Make any Pokemon appear shiny',
      type: 'cosmetic',
      price: 15,
      currency: 'gems',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBagIcon },
    { id: 'pack', name: 'Pokemon Packs', icon: CubeIcon },
    { id: 'item', name: 'Items', icon: GiftIcon },
    { id: 'boost', name: 'Boosts', icon: SparklesIcon },
    { id: 'cosmetic', name: 'Cosmetics', icon: SparklesIcon },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory);

  const canAfford = (item: ShopItem) => {
    return userCurrency[item.currency] >= item.price;
  };

  const handlePurchase = (item: ShopItem) => {
    if (canAfford(item)) {
      console.log('Purchasing:', item.name);
      // TODO: Implement purchase logic
    }
  };

  const getDiscountedPrice = (item: ShopItem) => {
    if (!item.discount) return item.price;
    return Math.floor(item.price * (1 - item.discount / 100));
  };

  const ShopItemCard: React.FC<{ item: ShopItem }> = ({ item }) => (
    <Card className="p-4 relative">
      {item.popular && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          POPULAR
        </div>
      )}
      
      {item.discount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{item.discount}%
        </div>
      )}

      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          {item.type === 'pack' && <CubeIcon className="w-6 h-6 text-white" />}
          {item.type === 'item' && <GiftIcon className="w-6 h-6 text-white" />}
          {item.type === 'boost' && <SparklesIcon className="w-6 h-6 text-white" />}
          {item.type === 'cosmetic' && <SparklesIcon className="w-6 h-6 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{item.type}</p>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4">{item.description}</p>

      {item.contents && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Contains:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {item.contents.map((content, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                {content}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {item.discount && (
            <span className="text-sm text-gray-500 line-through mr-2">
              {item.price} {item.currency === 'credits' ? '₽' : '💎'}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            {getDiscountedPrice(item)} {item.currency === 'credits' ? '₽' : '💎'}
          </span>
        </div>
        
        <Button
          onClick={() => handlePurchase(item)}
          disabled={!canAfford(item)}
          variant={canAfford(item) ? 'primary' : 'secondary'}
          size="sm"
        >
          {canAfford(item) ? 'Buy' : 'Insufficient Funds'}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pokemon Shop</h1>
          <p className="text-gray-600">Purchase Pokemon packs, items, and boosts</p>
        </div>
        
        {/* Currency Display */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-yellow-100 rounded-lg px-3 py-2">
            <CurrencyDollarIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="font-medium text-yellow-800">
              {userCurrency.credits.toLocaleString()} ₽
            </span>
          </div>
          <div className="flex items-center bg-purple-100 rounded-lg px-3 py-2">
            <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-800">
              {userCurrency.gems.toLocaleString()} 💎
            </span>
          </div>
        </div>
      </div>

      {/* Daily Deals */}
      <Card className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Daily Deal</h2>
            <p className="text-orange-100">Premium Pokemon Pack - 50% OFF!</p>
            <p className="text-sm text-orange-200">Resets in 14h 23m</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">5 💎</div>
            <div className="text-sm line-through text-orange-200">10 💎</div>
            <Button variant="secondary" className="mt-2">
              Claim Deal
            </Button>
          </div>
        </div>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <ShopItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Purchase History */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Purchases</h2>
        <div className="space-y-3">
          {[
            { item: 'Basic Pokemon Pack', time: '2 hours ago', cost: '100 ₽' },
            { item: 'Evolution Stone', time: '1 day ago', cost: '50 ₽' },
            { item: 'XP Boost (24h)', time: '3 days ago', cost: '3 💎' },
          ].map((purchase, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{purchase.item}</p>
                <p className="text-sm text-gray-500">{purchase.time}</p>
              </div>
              <span className="text-sm font-medium text-gray-600">{purchase.cost}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ShopPage;