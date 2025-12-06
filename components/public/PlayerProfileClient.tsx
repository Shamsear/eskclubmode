'use client';

import React from 'react';
import { PublicCard, CardHeader, CardTitle, CardContent } from './PublicCard';
import { RoleBadge, Badge } from './Badge';
import { StatCard } from './StatCard';
import PerformanceHeatmap from './PerformanceHeatmap';

interface PlayerProfileData {
  player: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    place: string | null;
    dateOfBirth: string | null;
    photo: string | null;
    club: {
      id: number;
      name: string;
      logo: string | null;
    };
    roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  };
  stats: {
    totalTournaments: number;
    totalMatches: number;
    totalWins: number;
    totalDraws: number;
    totalLosses: number;
    totalGoalsScored: number;
    totalGoalsConceded: number;
    totalPoints: number;
    winRate: number;
  };
  recentMatches: Array<{
    id: number;
    date: string;
    tournament: {
      id: number;
      name: string;
    };
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
  }>;
  tournaments: Array<{
    id: number;
    name: string;
    startDate: string;
    rank: number | null;
    totalPoints: number;
  }>;
}

interface PlayerProfileClientProps {
  initialData: PlayerProfileData;
}

export default function PlayerProfileClient({ initialData }: PlayerProfileClientProps) {
  const { player, stats, recentMatches, tournaments } = initialData;

  const outcomeConfig = {
    WIN: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✓',
      label: 'Win',
    },
    DRAW: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '=',
      label: 'Draw',
    },
    LOSS: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '✗',
      label: 'Loss',
    },
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Player Header */}
      <PublicCard variant="elevated" padding="lg">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Player Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden mx-auto sm:mx-0">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-blue-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {player.name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {player.roles.map((role) => (
                  <RoleBadge key={role} role={role} size="md" />
                ))}
              </div>
            </div>

            {/* Contact & Location */}
            <div className="space-y-2 text-sm text-gray-600">
              {player.place && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{player.place}</span>
                </div>
              )}
              {player.phone && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{player.phone}</span>
                </div>
              )}
            </div>

            {/* Club */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {player.club.logo ? (
                <img
                  src={player.club.logo}
                  alt={player.club.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">
                    {player.club.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500">Club</div>
                <div className="font-medium text-gray-900">{player.club.name}</div>
              </div>
            </div>
          </div>
        </div>
      </PublicCard>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Tournaments"
          value={stats.totalTournaments}
          color="primary"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          }
        />
        <StatCard
          label="Matches"
          value={stats.totalMatches}
          color="neutral"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          }
        />
        <StatCard
          label="Total Points"
          value={stats.totalPoints}
          color="success"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          }
        />
        <StatCard
          label="Win Rate"
          value={stats.winRate}
          format="percentage"
          color="warning"
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          }
        />
      </div>

      {/* Performance Stats */}
      <PublicCard variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Performance Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.totalWins}</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">{stats.totalDraws}</div>
              <div className="text-sm text-gray-600">Draws</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{stats.totalLosses}</div>
              <div className="text-sm text-gray-600">Losses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalGoalsScored}</div>
              <div className="text-sm text-gray-600">Goals Scored</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.totalGoalsConceded}</div>
              <div className="text-sm text-gray-600">Goals Conceded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {stats.totalGoalsScored - stats.totalGoalsConceded > 0 ? '+' : ''}
                {stats.totalGoalsScored - stats.totalGoalsConceded}
              </div>
              <div className="text-sm text-gray-600">Goal Difference</div>
            </div>
          </div>
        </CardContent>
      </PublicCard>

      {/* Performance Heatmap */}
      <PublicCard variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Performance Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceHeatmap matches={recentMatches} />
        </CardContent>
      </PublicCard>

      {/* Match History Timeline */}
      <PublicCard variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Recent Match History</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMatches.length > 0 ? (
            <div className="space-y-4">
              {recentMatches.map((match) => {
                const config = outcomeConfig[match.outcome];
                return (
                  <div
                    key={match.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Outcome Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 font-bold text-lg ${config.color}`}
                        aria-label={`Match outcome: ${config.label}`}
                      >
                        {config.icon}
                      </span>
                    </div>

                    {/* Match Details */}
                    <div className="flex-1 space-y-2">
                      <div className="font-medium text-gray-900">
                        {match.tournament.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(match.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{match.goalsScored}</div>
                        <div className="text-gray-600">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{match.goalsConceded}</div>
                        <div className="text-gray-600">Conceded</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{match.pointsEarned}</div>
                        <div className="text-gray-600">Points</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No match history available
            </div>
          )}
        </CardContent>
      </PublicCard>

      {/* Tournament Participation */}
      <PublicCard variant="default" padding="lg">
        <CardHeader>
          <CardTitle>Tournament Participation</CardTitle>
        </CardHeader>
        <CardContent>
          {tournaments.length > 0 ? (
            <div className="space-y-3">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{tournament.name}</div>
                    <div className="text-sm text-gray-600">
                      Started {new Date(tournament.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {tournament.rank && (
                      <Badge variant="primary" size="md">
                        Rank #{tournament.rank}
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {tournament.totalPoints}
                      </div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tournament participation yet
            </div>
          )}
        </CardContent>
      </PublicCard>
    </div>
  );
}
