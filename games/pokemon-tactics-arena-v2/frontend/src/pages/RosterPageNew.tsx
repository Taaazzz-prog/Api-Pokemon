import React, { useState } from 'react';
import { useRoster, useUpdatePokemonNickname } from '../hooks/useGameServices';
import { getRarityBorderClasses, getRarityConfig } from '../utils/rarityUtils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Input from '../components/ui/Input';

const RosterPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'collection' | 'teams'>('collection');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingPokemon, setEditingPokemon] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState<string>('');

  const filters = filterType === 'all' ? undefined : { type: filterType };
  const searchFilters = searchTerm ? { ...filters, search: searchTerm } : filters;
  
  const { data: roster, isLoading, error } = useRoster(searchFilters);
  const updateNicknameMutation = useUpdatePokemonNickname();

  const pokemonTypes = ['all', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

  const handleEditNickname = (pokemonId: string, currentNickname: string) => {
    setEditingPokemon(pokemonId);
    setNewNickname(currentNickname || '');
  };

  const handleSaveNickname = (pokemonId: string) => {
    updateNicknameMutation.mutate(
      { id: pokemonId, nickname: newNickname },
      {
        onSuccess: () => {
          setEditingPokemon(null);
          setNewNickname('');
        }
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingPokemon(null);
    setNewNickname('');
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Fire: 'bg-red-100 text-red-800',
      Water: 'bg-blue-100 text-blue-800',
      Electric: 'bg-yellow-100 text-yellow-800',
      Grass: 'bg-green-100 text-green-800',
      Ice: 'bg-cyan-100 text-cyan-800',
      Fighting: 'bg-orange-100 text-orange-800',
      Poison: 'bg-purple-100 text-purple-800',
      Ground: 'bg-amber-100 text-amber-800',
      Flying: 'bg-indigo-100 text-indigo-800',
      Psychic: 'bg-pink-100 text-pink-800',
      Bug: 'bg-lime-100 text-lime-800',
      Rock: 'bg-stone-100 text-stone-800',
      Ghost: 'bg-violet-100 text-violet-800',
      Dragon: 'bg-emerald-100 text-emerald-800',
      Dark: 'bg-gray-100 text-gray-800',
      Steel: 'bg-slate-100 text-slate-800',
      Fairy: 'bg-rose-100 text-rose-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Erreur lors du chargement des données</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collection Pokémon</h1>
          <p className="text-gray-600">{roster?.length || 0} Pokémon dans votre collection</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="bg-blue-600 hover:bg-blue-700">
            ➕ Nouveau Pokémon
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('collection')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'collection'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📚 Collection
          </button>
          <button
            onClick={() => setSelectedTab('teams')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Équipes
          </button>
        </nav>
      </div>

      {selectedTab === 'collection' && (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <Input
                  type="text"
                  placeholder="Nom ou surnom du Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {pokemonTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Tous les types' : type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setFilterType('all');
                    setSearchTerm('');
                  }}
                  className="w-full"
                >
                  🔄 Réinitialiser
                </Button>
              </div>
            </div>
          </Card>

          {/* Pokemon Grid */}
          {roster && roster.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {roster.map((pokemon) => {
                if (!pokemon) return null;
                
                const rarityConfig = getRarityConfig(pokemon);
                const borderClasses = getRarityBorderClasses(pokemon);
                
                return (
                  <Card key={pokemon.id} className={`p-4 hover:shadow-lg transition-shadow ${borderClasses}`}>
                    {/* Badge de rareté */}
                    <div className="mb-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${rarityConfig.bgColor} ${rarityConfig.textColor} border ${rarityConfig.borderColor}`}>
                        {rarityConfig.label}
                      </span>
                    </div>
                    
                    {/* Header avec image Pokemon */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        {/* Image Pokemon */}
                        <div className="relative">
                          <img 
                            src={pokemon.sprite || '/images/pokemon/unknown.png'} 
                            alt={pokemon.name}
                            className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-gray-200"
                            onError={(e) => {
                              // Fallback si l'image ne charge pas
                              e.currentTarget.src = '/images/pokemon/unknown.png';
                            }}
                          />
                          {/* Badge Shiny */}
                          {pokemon.isShiny && (
                            <div className="absolute -top-1 -right-1 text-yellow-400">
                              <span className="text-sm">✨</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">Niv. {pokemon.level}</span>
                      </div>
                    </div>

                  <div className="mb-3">
                    {editingPokemon === pokemon.id ? (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          placeholder="Nouveau surnom..."
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNickname(pokemon.id)}
                            disabled={updateNicknameMutation.isPending}
                          >
                            ✅ Sauver
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelEdit}
                          >
                            ❌ Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pokemon.nickname || pokemon.name}
                        </h3>
                        {pokemon.nickname && (
                          <p className="text-sm text-gray-600">({pokemon.name})</p>
                        )}
                        <button
                          onClick={() => handleEditNickname(pokemon.id, pokemon.nickname || pokemon.name)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          ✏️ Modifier surnom
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pokemon.types.map((type, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(type)}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">HP:</span>
                      <span className="font-medium">{pokemon.stats.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ATT:</span>
                      <span className="font-medium">{pokemon.stats.attack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DEF:</span>
                      <span className="font-medium">{pokemon.stats.defense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIT:</span>
                      <span className="font-medium">{pokemon.stats.speed}</span>
                    </div>
                  </div>

                  {/* Moves */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Attaques:</p>
                    <div className="flex flex-wrap gap-1">
                      {pokemon.moves.slice(0, 2).map((move, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {move}
                        </span>
                      ))}
                      {pokemon.moves.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{pokemon.moves.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" className="flex-1">
                      👁️ Détails
                    </Button>
                    <Button size="sm" variant="warning" className="flex-1">
                      ⚡ Entraîner
                    </Button>
                  </div>
                </Card>
              );
            })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun Pokémon trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche.'
                  : 'Votre collection est vide. Attrapez votre premier Pokémon !'}
              </p>
              <Button>🎣 Aller à la Boutique</Button>
            </Card>
          )}
        </>
      )}

      {selectedTab === 'teams' && (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gestion d'Équipes
          </h3>
          <p className="text-gray-600 mb-4">
            Créez et gérez vos équipes de combat stratégiques.
          </p>
          <Button>➕ Créer une Équipe</Button>
        </Card>
      )}
    </div>
  );
};

export default RosterPage;