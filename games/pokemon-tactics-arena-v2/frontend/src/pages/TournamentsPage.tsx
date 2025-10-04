import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  TrophyIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  PlayIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'single-elimination' | 'double-elimination' | 'round-robin';
  status: 'upcoming' | 'registration' | 'in-progress' | 'completed';
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  currency: 'credits' | 'gems';
  prizes: { position: string; reward: string }[];
  startTime: string;
  estimatedDuration: string;
  requirements?: {
    minLevel?: number;
    maxLevel?: number;
    minRank?: string;
  };
}

const TournamentsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'history'>('active');

  const tournaments: Tournament[] = [
    {
      id: 'tour1',
      name: 'Weekly Championship',
      description: 'Compete for the weekly crown and exclusive rewards!',
      type: 'single-elimination',
      status: 'registration',
      maxParticipants: 64,
      currentParticipants: 42,
      entryFee: 10,
      currency: 'gems',
      prizes: [
        { position: '1st', reward: '500 💎 + Legendary Pack' },
        { position: '2nd', reward: '250 💎 + Premium Pack' },
        { position: '3rd', reward: '100 💎 + Basic Pack' },
        { position: '4th-8th', reward: '50 💎' },
      ],
      startTime: 'Tomorrow 6:00 PM',
      estimatedDuration: '3-4 hours',
      requirements: {
        minLevel: 15,
      },
    },
    {
      id: 'tour2',
      name: 'Newbie Tournament',
      description: 'Perfect for new trainers to test their skills!',
      type: 'round-robin',
      status: 'registration',
      maxParticipants: 32,
      currentParticipants: 18,
      entryFee: 100,
      currency: 'credits',
      prizes: [
        { position: '1st', reward: '2000 ₽ + Evolution Stones' },
        { position: '2nd', reward: '1000 ₽' },
        { position: '3rd', reward: '500 ₽' },
      ],
      startTime: 'In 3 hours',
      estimatedDuration: '2-3 hours',
      requirements: {
        maxLevel: 20,
      },
    },
    {
      id: 'tour3',
      name: 'Elite Masters Cup',
      description: 'Only the strongest trainers can participate',
      type: 'double-elimination',
      status: 'in-progress',
      maxParticipants: 16,
      currentParticipants: 16,
      entryFee: 25,
      currency: 'gems',
      prizes: [
        { position: '1st', reward: '1000 💎 + Exclusive Title' },
        { position: '2nd', reward: '500 💎' },
        { position: '3rd', reward: '250 💎' },
      ],
      startTime: 'Started 1 hour ago',
      estimatedDuration: '4-5 hours',
      requirements: {
        minLevel: 40,
        minRank: 'Gold',
      },
    },
    {
      id: 'tour4',
      name: 'Monthly Grand Prix',
      description: 'The biggest tournament of the month!',
      type: 'single-elimination',
      status: 'upcoming',
      maxParticipants: 128,
      currentParticipants: 0,
      entryFee: 50,
      currency: 'gems',
      prizes: [
        { position: '1st', reward: '2000 💎 + Legendary Title + Exclusive Pokemon' },
        { position: '2nd', reward: '1000 💎 + Epic Title' },
        { position: '3rd', reward: '500 💎 + Rare Title' },
        { position: '4th-8th', reward: '200 💎' },
        { position: '9th-16th', reward: '100 💎' },
      ],
      startTime: 'Next Friday 8:00 PM',
      estimatedDuration: '6-8 hours',
      requirements: {
        minLevel: 25,
      },
    },
  ];

  const userTournaments = [
    {
      id: 'user1',
      tournament: 'Elite Masters Cup',
      status: 'in-progress',
      currentRound: 'Quarter-Finals',
      nextMatch: 'In 15 minutes vs DragonSlayer',
    },
    {
      id: 'user2',
      tournament: 'Weekly Championship',
      status: 'registered',
      position: 'Registered',
      startTime: 'Tomorrow 6:00 PM',
    },
  ];

  const history = [
    {
      id: 'hist1',
      tournament: 'Last Week Championship',
      placement: '5th',
      reward: '50 💎',
      date: '1 week ago',
    },
    {
      id: 'hist2',
      tournament: 'Beginner Cup',
      placement: '2nd',
      reward: '1000 ₽',
      date: '2 weeks ago',
    },
    {
      id: 'hist3',
      tournament: 'Elite Tournament',
      placement: '12th',
      reward: '25 💎',
      date: '3 weeks ago',
    },
  ];

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'registration':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canJoin = (tournament: Tournament) => {
    return tournament.status === 'registration' && 
           tournament.currentParticipants < tournament.maxParticipants;
  };

  const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-gray-900 mr-3">{tournament.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
              {tournament.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 mb-3">{tournament.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-2" />
              {tournament.currentParticipants}/{tournament.maxParticipants} players
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {tournament.startTime}
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              {tournament.estimatedDuration}
            </div>
            <div className="flex items-center">
              <GiftIcon className="w-4 h-4 mr-2" />
              {tournament.entryFee} {tournament.currency === 'credits' ? '₽' : '💎'}
            </div>
          </div>

          {tournament.requirements && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Requirements:</h4>
              <div className="text-sm text-gray-600">
                {tournament.requirements.minLevel && `Min Level: ${tournament.requirements.minLevel}`}
                {tournament.requirements.maxLevel && `Max Level: ${tournament.requirements.maxLevel}`}
                {tournament.requirements.minRank && ` • Min Rank: ${tournament.requirements.minRank}`}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Prizes:</h4>
        <div className="space-y-1">
          {tournament.prizes.map((prize, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{prize.position}:</span>
              <span className="font-medium text-gray-900">{prize.reward}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {canJoin(tournament) && (
          <Button className="flex-1">
            Join Tournament
          </Button>
        )}
        {tournament.status === 'in-progress' && (
          <Button variant="secondary" className="flex-1">
            <PlayIcon className="w-4 h-4 mr-2" />
            Watch Live
          </Button>
        )}
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-600">Compete in tournaments for glory and rewards</p>
        </div>
        <div className="flex items-center space-x-2">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          <span className="text-lg font-medium text-gray-900">Tournament Points: 1,247</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Tournaments
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Tournaments
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {selectedTab === 'active' && (
        <div className="space-y-6">
          {userTournaments.length === 0 ? (
            <Card className="p-12 text-center">
              <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tournaments</h3>
              <p className="text-gray-600 mb-6">Join a tournament to start competing!</p>
              <Button onClick={() => setSelectedTab('upcoming')}>
                Browse Tournaments
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {userTournaments.map((userTournament) => (
                <Card key={userTournament.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{userTournament.tournament}</h3>
                      <p className="text-gray-600">
                        {userTournament.status === 'in-progress' ? (
                          <>Current: {userTournament.currentRound}</>
                        ) : (
                          userTournament.position
                        )}
                      </p>
                      {userTournament.nextMatch && (
                        <p className="text-sm text-blue-600 font-medium">{userTournament.nextMatch}</p>
                      )}
                      {userTournament.startTime && (
                        <p className="text-sm text-gray-500">Starts: {userTournament.startTime}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {userTournament.status === 'in-progress' && (
                        <Button>
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Enter Battle
                        </Button>
                      )}
                      <Button variant="secondary">View Bracket</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tournaments
            .filter(t => t.status !== 'completed')
            .map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
        </div>
      )}

      {selectedTab === 'history' && (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{entry.tournament}</h3>
                  <p className="text-sm text-gray-600">{entry.date}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium text-gray-900">{entry.placement} Place</span>
                  </div>
                  <p className="text-sm text-green-600">{entry.reward}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;