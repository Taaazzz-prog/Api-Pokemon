import React, { useState } from 'react';
import { useShopItems, usePurchaseItem } from '../hooks/useGameServices';
import { useUser } from '../contexts/UserContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ShopPageNew: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useUser();
  const { data: shopItems, isLoading, error } = useShopItems(selectedCategory);
  const purchaseMutation = usePurchaseItem();

  const categories = [
    { id: 'all', name: 'Tout', icon: '🛍️' },
    { id: 'pack', name: 'Packs', icon: '📦' },
    { id: 'item', name: 'Objets', icon: '🧪' },
    { id: 'boost', name: 'Boosts', icon: '⚡' },
    { id: 'cosmetic', name: 'Cosmétiques', icon: '✨' },
  ];

  const handlePurchase = (itemId: string) => {
    purchaseMutation.mutate(itemId);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-200',
      rare: 'bg-blue-100 text-blue-800 border-blue-200',
      epic: 'bg-purple-100 text-purple-800 border-purple-200',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCurrencyIcon = (currency: string) => {
    return currency === 'gems' ? '💎' : '💰';
  };

  const canAfford = (price: number, currency: string) => {
    if (!user) return false;
    return currency === 'gems' ? user.pokeGems >= price : user.pokeCredits >= price;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Erreur lors du chargement de la boutique</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">🛍️ Boutique Pokémon</h1>
        <p className="text-purple-100">
          Découvrez de nouveaux Pokémon et améliorez votre collection !
        </p>
      </div>

      {/* Devises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <h3 className="font-semibold text-gray-700">PokéCredits</h3>
                <p className="text-sm text-gray-600">Devise principale</p>
              </div>
            </div>
            <span className="text-xl font-bold text-yellow-600">
              {user?.pokeCredits.toLocaleString() || 0}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💎</span>
              <div>
                <h3 className="font-semibold text-gray-700">PokéGems</h3>
                <p className="text-sm text-gray-600">Devise premium</p>
              </div>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {user?.pokeGems || 0}
            </span>
          </div>
        </Card>
      </div>

      {/* Categories */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Items Grid */}
      {shopItems && shopItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item) => {
            const affordable = canAfford(item.price, item.currency);
            
            return (
              <Card key={item.id} className={`p-6 border-2 ${getRarityColor(item.rarity)}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>
                  <div className="text-4xl">
                    {item.category === 'pack' && '📦'}
                    {item.category === 'item' && '🧪'}
                    {item.category === 'boost' && '⚡'}
                    {item.category === 'cosmetic' && '✨'}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 min-h-[2.5rem]">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getCurrencyIcon(item.currency)}
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {item.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.currency === 'gems' ? 'Gems' : 'Crédits'}
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    affordable 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!affordable || purchaseMutation.isPending}
                  onClick={() => handlePurchase(item.id)}
                >
                  {purchaseMutation.isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Achat...</span>
                    </div>
                  ) : affordable ? (
                    `🛒 Acheter`
                  ) : (
                    `❌ Pas assez de ${item.currency === 'gems' ? 'gems' : 'crédits'}`
                  )}
                </Button>

                {item.category === 'pack' && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    💡 Les packs contiennent des récompenses aléatoires !
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun article trouvé
          </h3>
          <p className="text-gray-600">
            Aucun article disponible dans cette catégorie pour le moment.
          </p>
        </Card>
      )}

      {/* Special Offers */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-yellow-800 mb-2">
              🎉 Offres Spéciales
            </h3>
            <p className="text-yellow-700">
              Nouveaux packs chaque semaine ! Revenez régulièrement.
            </p>
          </div>
          <div className="text-4xl">🎁</div>
        </div>
      </Card>
    </div>
  );
};

export default ShopPageNew;