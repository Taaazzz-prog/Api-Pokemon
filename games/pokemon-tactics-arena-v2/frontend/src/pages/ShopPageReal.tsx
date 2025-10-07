import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pokemonGameService, type Pokemon } from '../services/pokemonGameService';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

interface ShopPageRealProps {
  className?: string;
}

const ShopPageReal: React.FC<ShopPageRealProps> = ({ className = '' }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Récupère les Pokemon du shop
  const { data: shopPokemon = [], isLoading: isLoadingShop } = useQuery({
    queryKey: ['shop-pokemon'],
    queryFn: () => pokemonGameService.getShopPokemon()
  });

  // Récupère les types
  const { data: pokemonTypes = [] } = useQuery({
    queryKey: ['pokemon-types'],
    queryFn: () => pokemonGameService.getPokemonTypes()
  });

  // Mutation pour acheter un Pokemon
  const purchaseMutation = useMutation({
    mutationFn: (pokemonId: number) => pokemonGameService.purchasePokemon(pokemonId, user?.id || 'default-user'),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['user-roster'] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error('Erreur lors de l\'achat');
    }
  });

  // Filtrage des Pokemon
  const filteredPokemon = shopPokemon.filter(pokemon => {
    const typeMatch = selectedType === 'all' || pokemon.types.some(type => type.name === selectedType);
    const rarityMatch = selectedRarity === 'all' || pokemon.rarity === selectedRarity;
    return typeMatch && rarityMatch;
  });

  const handlePurchase = (pokemon: Pokemon) => {
    purchaseMutation.mutate(pokemon.id);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatTotal = (pokemon: Pokemon) => {
    return pokemon.hp + pokemon.attack + pokemon.defense + 
           pokemon.specialAttack + pokemon.specialDefense + pokemon.speed;
  };

  if (isLoadingShop) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de la boutique...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🛒 Boutique Pokemon</h1>
          <p className="text-gray-600">Découvrez et achetez de nouveaux Pokemon pour votre collection</p>
          
          {/* Statistiques utilisateur */}
          <div className="mt-4 flex gap-4">
            <div className="bg-white rounded-lg shadow-md px-4 py-2">
              <span className="text-sm text-gray-600">Crédits Pokemon</span>
              <div className="font-bold text-lg text-blue-600">{user?.pokeCredits || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md px-4 py-2">
              <span className="text-sm text-gray-600">Gemmes Pokemon</span>
              <div className="font-bold text-lg text-purple-600">{user?.pokeGems || 0}</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre par type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                {pokemonTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.frenchName} ({type.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par rareté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rareté</label>
              <select 
                value={selectedRarity} 
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les raretés</option>
                <option value="common">Commun</option>
                <option value="uncommon">Peu commun</option>
                <option value="rare">Rare</option>
                <option value="epic">Épique</option>
                <option value="legendary">Légendaire</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille des Pokemon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPokemon.map(pokemon => (
            <div key={pokemon.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Image du Pokemon */}
              <div className="relative">
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name}
                  className="w-full h-48 object-contain bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/200/200';
                  }}
                />
                
                {/* Badge légendaire */}
                {pokemon.isLegendary && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
                    ⭐ Légendaire
                  </div>
                )}
                
                {/* Badge rareté */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${getRarityColor(pokemon.rarity)}`}>
                  {pokemon.rarity}
                </div>
              </div>

              {/* Informations du Pokemon */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{pokemon.name}</h3>
                  <span className="text-sm text-gray-500">#{pokemon.pokedexId}</span>
                </div>

                {/* Types */}
                <div className="flex gap-1 mb-3">
                  {pokemon.types.map(type => (
                    <span 
                      key={type.id}
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: type.color }}
                    >
                      {type.frenchName}
                    </span>
                  ))}
                </div>

                {/* Statistiques de base */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">HP:</span>
                    <span className="font-medium">{pokemon.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ATK:</span>
                    <span className="font-medium">{pokemon.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DEF:</span>
                    <span className="font-medium">{pokemon.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SPD:</span>
                    <span className="font-medium">{pokemon.speed}</span>
                  </div>
                </div>

                {/* Stats totales */}
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-bold text-lg">{getStatTotal(pokemon)}</span>
                </div>

                {/* Prix et bouton d'achat */}
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{pokemon.basePrice}</div>
                    <div className="text-xs text-gray-500">Crédits</div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(pokemon)}
                    disabled={purchaseMutation.isPending || (user?.pokeCredits || 0) < pokemon.basePrice}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      (user?.pokeCredits || 0) >= pokemon.basePrice
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {purchaseMutation.isPending ? 'Achat...' : 'Acheter'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun Pokemon */}
        {filteredPokemon.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun Pokemon trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPageReal;