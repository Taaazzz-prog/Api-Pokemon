import React from 'react';
import { useAuth } from '../contexts/RealAuthContext';
import { useRoster, useArenaStats } from '../hooks/useGameServices';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: roster, isLoading: rosterLoading } = useRoster();
  const { data: arenaStats, isLoading: arenaLoading } = useArenaStats();

  if (!user) return <LoadingSpinner />;

  const pokemonCount = roster?.length || 0;
  const experiencePercentage = user ? (user.experience % 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {user.username}! 👋
        </h1>
        <p className="text-blue-100">
          Prêt pour une nouvelle aventure Pokemon ?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Niveau */}
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl">⭐</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Niveau</h3>
          <p className="text-2xl font-bold text-gray-900">{user.level}</p>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">
              <span>{user.experience}/{(user.level + 1) * 1000}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${experiencePercentage}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Win Rate */}
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Win Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {arenaLoading ? '...' : `${arenaStats?.winRate || 0}%`}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {arenaLoading ? '...' : `${(arenaStats?.wins || 0) + (arenaStats?.losses || 0)} combats`}
          </p>
        </Card>

        {/* Rang Arena */}
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Rang Arena</h3>
          <p className="text-2xl font-bold text-gray-900">
            {arenaLoading ? '...' : arenaStats?.rank || 'Unranked'}
          </p>
        </Card>

        {/* Pokémon */}
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pokémon</h3>
          <p className="text-2xl font-bold text-gray-900">
            {rosterLoading ? '...' : pokemonCount}
          </p>
          <p className="text-sm text-gray-600 mt-2">Collection</p>
        </Card>
      </div>

      {/* Devises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">PokéCredits</h3>
              <p className="text-3xl font-bold text-yellow-600">{user.pokeCredits.toLocaleString()}</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">PokéGems</h3>
              <p className="text-3xl font-bold text-purple-600">{user.pokeGems}</p>
            </div>
            <span className="text-4xl">💎</span>
          </div>
        </Card>
      </div>

      {/* Actions Rapides */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/arena">
            <Button className="w-full h-16 text-lg flex items-center justify-center space-x-3 bg-red-600 hover:bg-red-700">
              <span className="text-2xl">⚔️</span>
              <span>Combat Arena</span>
            </Button>
          </Link>
          
          <Link to="/shop">
            <Button className="w-full h-16 text-lg flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700">
              <span className="text-2xl">🛍️</span>
              <span>Boutique</span>
            </Button>
          </Link>
          
          <Link to="/survival">
            <Button className="w-full h-16 text-lg flex items-center justify-center space-x-3 bg-orange-600 hover:bg-orange-700">
              <span className="text-2xl">🔥</span>
              <span>Mode Survie</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Pokémon Favoris */}
      {!rosterLoading && roster && roster.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Équipe Principale</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {roster.slice(0, 6).map((pokemon) => (
              <div key={pokemon.id} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">
                  {pokemon.isShiny ? '✨' : '🎯'}
                </div>
                <p className="font-medium text-sm">{pokemon.nickname || pokemon.name}</p>
                <p className="text-xs text-gray-600">Niv. {pokemon.level}</p>
                <div className="flex justify-center mt-1 space-x-1">
                  {(pokemon.types || []).map((type: any, index: number) => (
                    <span 
                      key={index} 
                      className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/roster">
              <Button variant="secondary">Voir toute la collection</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;