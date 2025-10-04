import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  TrophyIcon,
  FireIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const stats = {
    level: 15,
    experience: 2450,
    nextLevelExp: 3000,
    totalBattles: 42,
    winRate: 68,
    currentRank: 'Silver II',
    pokemonCount: 12,
    favoriteType: 'Electric',
  };

  const recentBattles = [
    { id: 1, opponent: 'AshTrainer', result: 'win', type: 'Arena', time: '2 hours ago' },
    { id: 2, opponent: 'PikachuMaster', result: 'loss', type: 'Tournament', time: '1 day ago' },
    { id: 3, opponent: 'DragonTamer', result: 'win', type: 'Arena', time: '2 days ago' },
  ];

  const dailyQuests = [
    { id: 1, title: 'Win 3 Arena battles', progress: 2, max: 3, reward: '100 ₽' },
    { id: 2, title: 'Evolve a Pokemon', progress: 0, max: 1, reward: '10 💎' },
    { id: 3, title: 'Complete 5 battles', progress: 4, max: 5, reward: '50 ₽' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'Trainer'}!
        </h1>
        <p className="text-blue-100">
          Ready for another day of Pokemon battles?
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-2xl font-bold text-gray-900">{stats.level}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Experience</span>
              <span>{stats.experience}/{stats.nextLevelExp}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(stats.experience / stats.nextLevelExp) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.winRate}%</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalBattles} total battles
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rank</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentRank}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pokemon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pokemonCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Quests */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Daily Quests</h2>
              <span className="text-sm text-gray-500">Resets in 14h 23m</span>
            </div>
            <div className="space-y-4">
              {dailyQuests.map((quest) => (
                <div key={quest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{quest.title}</h3>
                    <div className="flex items-center mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(quest.progress / quest.max) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {quest.progress}/{quest.max}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-sm font-medium text-green-600">{quest.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/arena">
                <Button className="w-full justify-start" variant="secondary">
                  <TrophyIcon className="w-5 h-5 mr-3" />
                  Battle Arena
                </Button>
              </Link>
              <Link to="/shop">
                <Button className="w-full justify-start" variant="secondary">
                  <ShoppingBagIcon className="w-5 h-5 mr-3" />
                  Visit Shop
                </Button>
              </Link>
              <Link to="/survival">
                <Button className="w-full justify-start" variant="secondary">
                  <FireIcon className="w-5 h-5 mr-3" />
                  Survival Mode
                </Button>
              </Link>
              <Link to="/roster">
                <Button className="w-full justify-start" variant="secondary">
                  <UserGroupIcon className="w-5 h-5 mr-3" />
                  Manage Roster
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Battles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opponent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBattles.map((battle) => (
                <tr key={battle.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {battle.opponent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      battle.result === 'win' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {battle.result === 'win' ? 'Victory' : 'Defeat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {battle.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {battle.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;