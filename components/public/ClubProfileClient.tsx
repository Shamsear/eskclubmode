'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicCard } from './PublicCard';
import { RoleBadge, StatusBadge } from './Badge';
import { StatCard } from './StatCard';
import { PublicSkeletons } from './PublicSkeletons';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import PlayerConstellation from './PlayerConstellation';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  stats: {
    totalMatches: number;
    totalPoints: number;
    winRate: number;
  };
}

interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string | null;
  participantCount: number;
  matchCount: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface ClubStats {
  totalPlayers: number;
  totalTournaments: number;
  totalMatches: number;
  totalGoals: number;
}

interface ClubProfileData {
  club: {
    id: number;
    name: string;
    logo: string | null;
    description: string | null;
    createdAt: string;
  };
  players: Player[];
  tournaments: Tournament[];
  stats: ClubStats;
}

interface ClubProfileClientProps {
  clubId: string;
}

export default function ClubProfileClient({ clubId }: ClubProfileClientProps) {
  const router = useRouter();
  const [data, setData] = useState<ClubProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'constellation' | 'tournaments'>('players');

  useEffect(() => {
    fetchClubProfile();
  }, [clubId]);

  const fetchClubProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/clubs/${clubId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Club not found');
        }
        throw new Error('Failed to fetch club profile');
      }

      const clubData: ClubProfileData = await response.json();
      setData(clubData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error loading club profile</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <button
            onClick={fetchClubProfile}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicSkeletons.PlayerProfile />
      </div>
    );
  }

  const { club, players, tournaments, stats } = data;

  // Filter tournaments by status
  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming');
  const completedTournaments = tournaments.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 mb-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Club Logo */}
          <div className="flex-shrink-0">
            {club.logo ? (
              <OptimizedImage
                src={club.logo}
                alt={`${club.name} logo`}
                width={120}
                height={120}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-5xl sm:text-6xl font-bold text-white">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Club Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              {club.name}
            </h1>
            {club.description && (
              <p className="text-lg sm:text-xl text-white/90 mb-4 max-w-2xl">
                {club.description}
              </p>
            )}
            <p className="text-sm text-white/70">
              Member since {new Date(club.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          label="Players"
          value={stats.totalPlayers}
          icon="👥"
          color="primary"
          format="number"
        />
        <StatCard
          label="Tournaments"
          value={stats.totalTournaments}
          icon="🏆"
          color="success"
          format="number"
        />
        <StatCard
          label="Matches"
          value={stats.totalMatches}
          icon="⚽"
          color="warning"
          format="number"
        />
        <StatCard
          label="Goals"
          value={stats.totalGoals}
          icon="🎯"
          color="danger"
          format="number"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 sm:gap-8" aria-label="Club sections">
            <button
              onClick={() => setActiveTab('players')}
              className={`
                pb-4 px-2 border-b-2 font-medium transition-colors
                ${activeTab === 'players'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === 'players' ? 'page' : undefined}
            >
              Players ({players.length})
            </button>
            <button
              onClick={() => setActiveTab('constellation')}
              className={`
                pb-4 px-2 border-b-2 font-medium transition-colors
                ${activeTab === 'constellation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === 'constellation' ? 'page' : undefined}
            >
              Constellation
            </button>
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`
                pb-4 px-2 border-b-2 font-medium transition-colors
                ${activeTab === 'tournaments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={activeTab === 'tournaments' ? 'page' : undefined}
            >
              Tournaments ({tournaments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Constellation Tab */}
      {activeTab === 'constellation' && (
        <div>
          <PlayerConstellation players={players} />
        </div>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div>
          {players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <PublicCard
                  key={player.id}
                  hover
                  onClick={() => router.push(`/players/${player.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Player Photo */}
                    {player.photo ? (
                      <OptimizedImage
                        src={player.photo}
                        alt={player.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {player.name}
                      </h3>
                      
                      {/* Roles */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {player.roles.map((role) => (
                          <RoleBadge key={role} role={role} size="sm" />
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Matches</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {player.stats.totalMatches}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Points</p>
                          <p className="text-sm font-semibold text-blue-600">
                            {player.stats.totalPoints}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Win Rate</p>
                          <p className="text-sm font-semibold text-green-600">
                            {player.stats.winRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </PublicCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No players yet
              </h3>
              <p className="text-gray-600">
                This club doesn't have any players at the moment
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && (
        <div className="space-y-8">
          {/* Active Tournaments */}
          {activeTournaments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                Active Tournaments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTournaments.map((tournament) => (
                  <PublicCard
                    key={tournament.id}
                    hover
                    onClick={() => router.push(`/tournaments/${tournament.id}`)}
                    className="cursor-pointer border-2 border-green-200 bg-green-50/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {tournament.name}
                      </h3>
                      <StatusBadge status={tournament.status} size="sm" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        Started: {new Date(tournament.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="flex items-center gap-2">
                          <span>👥</span>
                          {tournament.participantCount} participants
                        </p>
                        <p className="flex items-center gap-2">
                          <span>⚽</span>
                          {tournament.matchCount} matches
                        </p>
                      </div>
                    </div>
                  </PublicCard>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tournaments */}
          {upcomingTournaments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upcoming Tournaments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingTournaments.map((tournament) => (
                  <PublicCard
                    key={tournament.id}
                    hover
                    onClick={() => router.push(`/tournaments/${tournament.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {tournament.name}
                      </h3>
                      <StatusBadge status={tournament.status} size="sm" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        Starts: {new Date(tournament.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="flex items-center gap-2">
                          <span>👥</span>
                          {tournament.participantCount} participants
                        </p>
                        <p className="flex items-center gap-2">
                          <span>⚽</span>
                          {tournament.matchCount} matches
                        </p>
                      </div>
                    </div>
                  </PublicCard>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tournaments */}
          {completedTournaments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Completed Tournaments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedTournaments.map((tournament) => (
                  <PublicCard
                    key={tournament.id}
                    hover
                    onClick={() => router.push(`/tournaments/${tournament.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {tournament.name}
                      </h3>
                      <StatusBadge status={tournament.status} size="sm" />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        {new Date(tournament.startDate).toLocaleDateString()} - {' '}
                        {tournament.endDate && new Date(tournament.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="flex items-center gap-2">
                          <span>👥</span>
                          {tournament.participantCount} participants
                        </p>
                        <p className="flex items-center gap-2">
                          <span>⚽</span>
                          {tournament.matchCount} matches
                        </p>
                      </div>
                    </div>
                  </PublicCard>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {tournaments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tournaments yet
              </h3>
              <p className="text-gray-600">
                This club hasn't hosted any tournaments yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}