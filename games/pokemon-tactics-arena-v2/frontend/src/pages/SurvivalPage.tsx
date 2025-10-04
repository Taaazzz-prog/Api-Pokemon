import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  FireIcon,
  ClockIcon,
  TrophyIcon,
  HeartIcon,
  BoltIcon,
  ShieldCheckIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

interface SurvivalRun {
  id: string;
  status: 'active' | 'completed' | 'failed';
  currentWave: number;
  score: number;
  timeElapsed: string;
  pokemonRemaining: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  rewards: string[];
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  bestWave: number;
  score: number;
  difficulty: string;
  date: string;
}

const SurvivalPage: React.FC = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard' | 'nightmare'>('normal');
  const [currentRun, setCurrentRun] = useState<SurvivalRun | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused'>('menu');

  // Mock data
  const personalBest = {
    bestWave: 47,
    bestScore: 15420,
    totalRuns: 23,
    averageWave: 18,
    totalTime: '8h 32m',
  };

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'SurvivalKing', bestWave: 89, score: 45670, difficulty: 'Nightmare', date: '2 days ago' },
    { rank: 2, username: 'EndlessTrainer', bestWave: 82, score: 42350, difficulty: 'Hard', date: '1 week ago' },
    { rank: 3, username: 'WaveMaster', bestWave: 76, score: 39120, difficulty: 'Hard', date: '3 days ago' },
    { rank: 4, username: 'IronWill', bestWave: 71, score: 36890, difficulty: 'Normal', date: '5 days ago' },
    { rank: 5, username: 'PersistentOne', bestWave: 68, score: 34560, difficulty: 'Normal', date: '1 day ago' },
  ];

  const difficulties = {
    easy: {
      name: 'Easy',
      description: 'Perfect for beginners. Slower enemy scaling.',
      multiplier: '1x',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    normal: {
      name: 'Normal',
      description: 'Balanced difficulty. Standard enemy scaling.',
      multiplier: '1.5x',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    hard: {
      name: 'Hard',
      description: 'Challenging waves. Faster enemy scaling.',
      multiplier: '2x',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    nightmare: {
      name: 'Nightmare',
      description: 'Extreme difficulty. Only for the brave.',
      multiplier: '3x',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  };

  const startSurvival = () => {
    const newRun: SurvivalRun = {
      id: 'run-' + Date.now(),
      status: 'active',
      currentWave: 1,
      score: 0,
      timeElapsed: '0:00',
      pokemonRemaining: 6,
      difficulty: selectedDifficulty,
      rewards: [],
    };
    setCurrentRun(newRun);
    setGameState('playing');
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const stopGame = () => {
    setCurrentRun(null);
    setGameState('menu');
  };

  const getDifficultyInfo = (difficulty: string) => {
    return difficulties[difficulty as keyof typeof difficulties] || difficulties.normal;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survival Mode</h1>
          <p className="text-gray-600">Test your endurance against endless waves of enemies</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Personal Best</p>
            <p className="text-lg font-bold text-gray-900">Wave {personalBest.bestWave}</p>
          </div>
        </div>
      </div>

      {gameState === 'menu' && (
        <>
          {/* Difficulty Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Difficulty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(difficulties).map(([key, diff]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDifficulty(key as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDifficulty === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 ${diff.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <FireIcon className={`w-6 h-6 ${diff.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{diff.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{diff.description}</p>
                  <span className={`text-sm font-medium ${diff.color}`}>
                    Score Multiplier: {diff.multiplier}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button onClick={startSurvival} size="lg">
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Survival Run
              </Button>
            </div>
          </Card>

          {/* Personal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="p-6 text-center">
              <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{personalBest.bestWave}</p>
              <p className="text-sm text-gray-600">Best Wave</p>
            </Card>
            <Card className="p-6 text-center">
              <FireIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{personalBest.bestScore.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Best Score</p>
            </Card>
            <Card className="p-6 text-center">
              <BoltIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{personalBest.totalRuns}</p>
              <p className="text-sm text-gray-600">Total Runs</p>
            </Card>
            <Card className="p-6 text-center">
              <ShieldCheckIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{personalBest.averageWave}</p>
              <p className="text-sm text-gray-600">Average Wave</p>
            </Card>
            <Card className="p-6 text-center">
              <ClockIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{personalBest.totalTime}</p>
              <p className="text-sm text-gray-600">Total Time</p>
            </Card>
          </div>

          {/* Leaderboard */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Global Leaderboard</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Best Wave
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry) => (
                    <tr key={entry.rank}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-600 text-white' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {entry.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.bestWave}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getDifficultyInfo(entry.difficulty.toLowerCase()).bgColor
                        } ${getDifficultyInfo(entry.difficulty.toLowerCase()).color}`}>
                          {entry.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {gameState === 'playing' && currentRun && (
        <div className="space-y-6">
          {/* Game HUD */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Wave</p>
                  <p className="text-2xl font-bold text-blue-600">{currentRun.currentWave}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-2xl font-bold text-green-600">{currentRun.score.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-2xl font-bold text-purple-600">{currentRun.timeElapsed}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pokemon Left</p>
                  <div className="flex items-center justify-center space-x-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <HeartIcon
                        key={i}
                        className={`w-6 h-6 ${
                          i < currentRun.pokemonRemaining ? 'text-red-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={pauseGame} variant="secondary">
                  <PauseIcon className="w-5 h-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={stopGame} variant="danger">
                  <StopIcon className="w-5 h-5 mr-2" />
                  Surrender
                </Button>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Difficulty: {getDifficultyInfo(currentRun.difficulty).name}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  Next wave in: 0:15
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </Card>

          {/* Battle Area Placeholder */}
          <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Battle in Progress</h3>
            <p className="text-gray-600 mb-6">Fighting wave {currentRun.currentWave} enemies...</p>
            <div className="flex justify-center space-x-4">
              <Button>Use Special Attack</Button>
              <Button variant="secondary">Use Item</Button>
              <Button variant="ghost">Defend</Button>
            </div>
          </Card>
        </div>
      )}

      {gameState === 'paused' && currentRun && (
        <Card className="p-12 text-center">
          <PauseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Paused</h3>
          <p className="text-gray-600 mb-6">
            Wave {currentRun.currentWave} • Score: {currentRun.score.toLocaleString()}
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={resumeGame}>
              <PlayIcon className="w-5 h-5 mr-2" />
              Resume
            </Button>
            <Button variant="danger" onClick={stopGame}>
              <StopIcon className="w-5 h-5 mr-2" />
              Quit Run
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SurvivalPage;