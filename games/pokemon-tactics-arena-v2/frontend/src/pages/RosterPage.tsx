import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Pokemon {
  id: string;
  name: string;
  species: string;
  level: number;
  types: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  moves: string[];
  isShiny: boolean;
  favorite: boolean;
}

const RosterPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'collection' | 'teams'>('collection');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // TODO: Remplacer par de vraies données du service utilisateur
  const pokemon: Pokemon[] = [];

  const teams = [
    {
      id: 'team1',
      name: 'Main Team',
      pokemon: pokemon.slice(0, 3),
      isActive: true,
    },
    {
      id: 'team2',
      name: 'Arena Squad',
      pokemon: pokemon.slice(0, 2),
      isActive: false,
    },
  ];

  const typeColors: Record<string, string> = {
    Electric: 'bg-yellow-100 text-yellow-800',
    Fire: 'bg-red-100 text-red-800',
    Water: 'bg-blue-100 text-blue-800',
    Flying: 'bg-indigo-100 text-indigo-800',
    Grass: 'bg-green-100 text-green-800',
    Poison: 'bg-purple-100 text-purple-800',
  };

  const rarityColors: Record<string, string> = {
    common: 'border-gray-300',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  const filteredPokemon = pokemon.filter(p => {
    if (filterType !== 'all' && !p.types.includes(filterType)) return false;
    if (filterRarity !== 'all' && p.rarity !== filterRarity) return false;
    return true;
  });

  const toggleFavorite = (pokemonId: string) => {
    // TODO: Implement favorite toggle
    console.log('Toggle favorite for:', pokemonId);
  };

  const PokemonCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => (
    <Card className={`p-4 border-2 ${rarityColors[pokemon.rarity]} relative`}>
      {pokemon.isShiny && (
        <div className="absolute top-2 right-2">
          <SparklesIcon className="w-5 h-5 text-yellow-500" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{pokemon.name}</h3>
          <p className="text-sm text-gray-600">{pokemon.species}</p>
          <p className="text-xs text-gray-500">Level {pokemon.level}</p>
        </div>
        <button
          onClick={() => toggleFavorite(pokemon.id)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {pokemon.favorite ? (
            <StarIconSolid className="w-5 h-5 text-yellow-500" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {pokemon.types.map(type => (
          <span
            key={type}
            className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}
          >
            {type}
          </span>
        ))}
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
          pokemon.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
          pokemon.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
          pokemon.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
          pokemon.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {pokemon.rarity}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs">
          <span>HP: {pokemon.stats.hp}</span>
          <span>ATK: {pokemon.stats.attack}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>DEF: {pokemon.stats.defense}</span>
          <span>SPD: {pokemon.stats.speed}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button size="sm" variant="secondary" className="flex-1">
          <PencilIcon className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button size="sm" variant="danger" className="px-3">
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pokemon Roster</h1>
          <p className="text-gray-600">Manage your Pokemon collection and teams</p>
        </div>
        <Button>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Pokemon
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('collection')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'collection'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Collection ({pokemon.length})
          </button>
          <button
            onClick={() => setSelectedTab('teams')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teams ({teams.length})
          </button>
        </nav>
      </div>

      {selectedTab === 'collection' && (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="Electric">Electric</option>
                  <option value="Fire">Fire</option>
                  <option value="Water">Water</option>
                  <option value="Grass">Grass</option>
                  <option value="Flying">Flying</option>
                  <option value="Poison">Poison</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rarity
                </label>
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Pokemon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPokemon.map(pokemon => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>
        </>
      )}

      {selectedTab === 'teams' && (
        <div className="space-y-6">
          {teams.map(team => (
            <Card key={team.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                  {team.isActive && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary">
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {!team.isActive && (
                    <Button size="sm">
                      Set Active
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {team.pokemon.map(pokemon => (
                  <div key={pokemon.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{pokemon.name}</p>
                      <p className="text-sm text-gray-600">{pokemon.species}</p>
                      <p className="text-xs text-gray-500">Level {pokemon.level}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pokemon.types.map(type => (
                        <span
                          key={type}
                          className={`px-1.5 py-0.5 text-xs font-medium rounded ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {team.pokemon.length < 6 && (
                  <div className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg">
                    <Button size="sm" variant="ghost">
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Pokemon
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          <Card className="p-6 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Team</h3>
              <p className="text-gray-600 mb-4">Build a new team composition for battles</p>
              <Button>
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Team
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RosterPage;