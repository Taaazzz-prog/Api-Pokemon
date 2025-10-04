import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pokemonGameService } from '../services/pokemonGameService';

interface ArenaPageProps {
  className?: string;
}

interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile' | 'Expert';
  rewards: string[];
  isAvailable: boolean;
}

const ArenaPage: React.FC<ArenaPageProps> = ({ className = '' }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // Récupère les statistiques du joueur
  const { data: playerStats } = useQuery({
    queryKey: ['player-arena-stats'],
    queryFn: async () => {
      // Simulation des statistiques
      return {
        wins: 12,
        losses: 5,
        streak: 3,
        rank: 'Silver',
        points: 1250
      };
    }
  });

  // Modes de jeu disponibles
  const gameModes: GameMode[] = [
    {
      id: 'quick-battle',
      name: 'Combat Rapide',
      description: 'Combats courts contre des adversaires aléatoires',
      icon: '⚡',
      difficulty: 'Facile',
      rewards: ['50-100 Gold', 'XP Pokemon'],
      isAvailable: true
    },
    {
      id: 'ranked-battle',
      name: 'Combat Classé',
      description: 'Montez dans les rangs et affrontez des joueurs de votre niveau',
      icon: '🏆',
      difficulty: 'Moyen',
      rewards: ['Points de Rang', '100-200 Gold', 'Objets Rares'],
      isAvailable: true
    },
    {
      id: 'championship',
      name: 'Championnat',
      description: 'Tournoi d\'élite avec les meilleurs dresseurs',
      icon: '👑',
      difficulty: 'Expert',
      rewards: ['Titres', 'Pokemon Légendaires', '500+ Gold'],
      isAvailable: false
    },
    {
      id: 'survival',
      name: 'Mode Survie',
      description: 'Combattez jusqu\'à l\'épuisement de votre équipe',
      icon: '🛡️',
      difficulty: 'Difficile',
      rewards: ['Bonus progressifs', 'Objets exclusifs'],
      isAvailable: true
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-600 bg-green-100';
      case 'Moyen': return 'text-yellow-600 bg-yellow-100';
      case 'Difficile': return 'text-orange-600 bg-orange-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏟️ Arène Pokemon</h1>
          <p className="text-gray-600">Affrontez d'autres dresseurs et grimpez dans les classements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Modes de Jeu */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Modes de Combat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameModes.map((mode) => (
                  <div
                    key={mode.id}
                    className={`
                      border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer
                      ${mode.isAvailable 
                        ? 'border-gray-200 hover:border-purple-300 hover:shadow-md' 
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }
                      ${selectedMode === mode.id ? 'border-purple-500 bg-purple-50' : ''}
                    `}
                    onClick={() => mode.isAvailable && setSelectedMode(mode.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{mode.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{mode.name}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(mode.difficulty)}`}>
                            {mode.difficulty}
                          </span>
                        </div>
                      </div>
                      {!mode.isAvailable && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Bientôt
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{mode.description}</p>
                    
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Récompenses :</p>
                      <div className="flex flex-wrap gap-1">
                        {mode.rewards.map((reward, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {reward}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {mode.isAvailable && selectedMode === mode.id && (
                      <div className="mt-4 pt-3 border-t">
                        <Link
                          to="/battle"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block text-center"
                        >
                          ⚔️ Commencer le Combat
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Classements */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">🏆 Classement Global</h2>
              
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'MasterTrainer', points: 2500, badge: '👑' },
                  { rank: 2, name: 'PokeMaster2024', points: 2350, badge: '🥈' },
                  { rank: 3, name: 'DragonSlayer', points: 2200, badge: '🥉' },
                  { rank: 4, name: 'EliteTrainer', points: 2100, badge: '⭐' },
                  { rank: 5, name: 'ChampionAsh', points: 2050, badge: '⭐' },
                  { rank: '...', name: '', points: 0, badge: '' },
                  { rank: 127, name: 'Vous', points: playerStats?.points || 1250, badge: '🎮', isPlayer: true }
                ].map((player, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-3 rounded-lg
                      ${player.isPlayer ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{player.badge}</span>
                      <div>
                        <span className="font-medium text-gray-800">#{player.rank}</span>
                        {player.name && <span className="ml-2 text-gray-600">{player.name}</span>}
                      </div>
                    </div>
                    {player.points > 0 && (
                      <span className="font-bold text-purple-600">{player.points} pts</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistiques du Joueur */}
          <div className="space-y-6">
            
            {/* Profil */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">👤 Votre Profil</h3>
              
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🎮</span>
                </div>
                <h4 className="font-bold text-lg text-gray-800">Dresseur</h4>
                <p className="text-sm text-gray-600">Rang: {playerStats?.rank || 'Bronze'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Victoires:</span>
                  <span className="font-bold text-green-600">{playerStats?.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Défaites:</span>
                  <span className="font-bold text-red-600">{playerStats?.losses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Série actuelle:</span>
                  <span className="font-bold text-purple-600">{playerStats?.streak || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points totaux:</span>
                  <span className="font-bold text-blue-600">{playerStats?.points || 0}</span>
                </div>
              </div>
            </div>

            {/* Récompenses Quotidiennes */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🎁 Récompenses</h3>
              
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Connexion quotidienne</p>
                      <p className="text-sm text-green-600">100 Gold</p>
                    </div>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Récupérer
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-600">Première victoire</p>
                      <p className="text-sm text-gray-500">200 Gold + Pack</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      En attente
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-600">5 victoires</p>
                      <p className="text-sm text-gray-500">Pokemon rare</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      0/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">⚡ Actions Rapides</h3>
              
              <div className="space-y-3">
                <Link
                  to="/team-builder"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block text-center"
                >
                  ⚔️ Former une Équipe
                </Link>
                
                <Link
                  to="/shop"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block text-center"
                >
                  🛒 Acheter des Pokemon
                </Link>
                
                <Link
                  to="/roster"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block text-center"
                >
                  👥 Voir mon Roster
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaPage;