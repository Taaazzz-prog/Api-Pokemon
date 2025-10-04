import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pokemonGameService } from '../services/pokemonGameService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ArenaPageProps {
  className?: string;
}

interface Player {
  id: string;
  username: string;
  rank: string;
  rating: number;
  winRate: number;
  level: number;
}

interface Match {
  id: string;
  opponent: Player;
  status: 'waiting' | 'in-progress' | 'completed';
  estimatedTime?: string;
  result?: 'win' | 'loss' | 'draw';
}

const ArenaPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'ranked' | 'casual'>('ranked');
  const [inQueue, setInQueue] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  // TODO: Remplacer par de vraies données du service utilisateur
  const playerStats = {
    currentRank: 'Bronze I',
    rating: 1000,
    winRate: 0,
    totalBattles: 0,
    winStreak: 0,
    level: 1,
  };

  // TODO: Remplacer par de vraies données du leaderboard
  const leaderboard: Player[] = [];

  // TODO: Remplacer par de vraies données des matches récents
  const recentMatches: any[] = [];

  const handleStartQueue = () => {
    setInQueue(true);
    // Simulate finding a match
    setTimeout(() => {
      setCurrentMatch({
        id: 'match1',
        opponent: {
          id: 'opp1',
          username: 'NewChallenger',
          rank: 'Silver I',
          rating: 1467,
          winRate: 72,
          level: 23,
        },
        status: 'waiting',
        estimatedTime: '30s',
      });
      setInQueue(false);
    }, 3000);
  };

  const handleCancelQueue = () => {
    setInQueue(false);
  };

  const handleAcceptMatch = () => {
    if (currentMatch) {
      setCurrentMatch({
        ...currentMatch,
        status: 'in-progress',
      });
    }
  };

  const handleDeclineMatch = () => {
    setCurrentMatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Battle Arena</h1>
          <p className="text-gray-600">Compete against other trainers in ranked battles</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedMode('ranked')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedMode === 'ranked'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrophyIcon className="w-5 h-5 inline mr-2" />
          Ranked Match
        </button>
        <button
          onClick={() => setSelectedMode('casual')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedMode === 'casual'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <UserIcon className="w-5 h-5 inline mr-2" />
          Casual Match
        </button>
      </div>

      {/* Current Status */}
      {inQueue && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">Searching for opponent...</h3>
                <p className="text-blue-600">Estimated wait time: 1-3 minutes</p>
              </div>
            </div>
            <Button variant="secondary" onClick={handleCancelQueue}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {currentMatch && currentMatch.status === 'waiting' && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-green-900 mb-2">Match Found!</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="text-center mr-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                  You
                </div>
                <p className="font-medium">{playerStats.currentRank}</p>
                <p className="text-sm text-gray-600">{playerStats.rating} MMR</p>
              </div>
              <div className="text-2xl font-bold text-gray-400 mx-4">VS</div>
              <div className="text-center ml-8">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                  {currentMatch.opponent.username[0]}
                </div>
                <p className="font-medium">{currentMatch.opponent.username}</p>
                <p className="font-medium">{currentMatch.opponent.rank}</p>
                <p className="text-sm text-gray-600">{currentMatch.opponent.rating} MMR</p>
              </div>
            </div>
            <p className="text-green-600 mb-4">Accept match within {currentMatch.estimatedTime}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleAcceptMatch}>
                <PlayIcon className="w-5 h-5 mr-2" />
                Accept
              </Button>
              <Button variant="secondary" onClick={handleDeclineMatch}>
                Decline
              </Button>
            </div>
          </div>
        </Card>
      )}

      {currentMatch && currentMatch.status === 'in-progress' && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Battle in Progress</h3>
            <p className="text-yellow-600 mb-4">
              Fighting against {currentMatch.opponent.username}
            </p>
            <Button>
              <PlayIcon className="w-5 h-5 mr-2" />
              Enter Battle
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Stats */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{playerStats.currentRank}</div>
                <div className="text-sm text-gray-600">Current Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{playerStats.rating}</div>
                <div className="text-sm text-gray-600">MMR Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{playerStats.winRate}%</div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{playerStats.totalBattles}</div>
                <div className="text-sm text-gray-600">Total Battles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{playerStats.winStreak}</div>
                <div className="text-sm text-gray-600">Win Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{playerStats.level}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
            </div>
          </Card>

          {/* Queue Controls */}
          {!inQueue && !currentMatch && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start Battle</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedMode === 'ranked' ? 'Ranked Match' : 'Casual Match'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedMode === 'ranked' 
                        ? 'Affects your ranking and MMR'
                        : 'Practice battles, no ranking changes'
                      }
                    </p>
                  </div>
                  <Button onClick={handleStartQueue}>
                    <QueueListIcon className="w-5 h-5 mr-2" />
                    Join Queue
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Matches */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Matches</h2>
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      match.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">vs {match.opponent.username}</p>
                      <p className="text-sm text-gray-600">
                        {match.opponent.rank} • {match.duration} • {match.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      match.result === 'win' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {match.result === 'win' ? 'Victory' : 'Defeat'}
                    </span>
                    <p className={`text-xs ${
                      match.ratingChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {match.ratingChange > 0 ? '+' : ''}{match.ratingChange} MMR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <div key={player.id} className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{player.username}</p>
                    <p className="text-xs text-gray-600">{player.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{player.rating}</p>
                    <p className="text-xs text-gray-600">{player.winRate}% WR</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArenaPage;