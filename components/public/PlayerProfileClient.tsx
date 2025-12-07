'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicCard, CardHeader, CardTitle, CardContent } from './PublicCard';
import { RoleBadge, Badge } from './Badge';
import { StatCard } from './StatCard';
import PerformanceHeatmap from './PerformanceHeatmap';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

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
    matchId: number;
    date: string;
    tournament: {
      id: number;
      name: string;
    };
    stageName: string | null;
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
    opponent: {
      id: number;
      name: string;
      photo: string | null;
      goalsScored: number;
      goalsConceded: number;
    } | null;
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
  const router = useRouter();
  const { player, stats, recentMatches, tournaments } = initialData;

  const outcomeConfig = {
    WIN: {
      color: 'bg-green-50 text-green-700 border-green-200',
      bgGradient: 'from-green-500 to-emerald-600',
      icon: '✓',
      label: 'Win',
    },
    DRAW: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      bgGradient: 'from-yellow-500 to-amber-600',
      icon: '=',
      label: 'Draw',
    },
    LOSS: {
      color: 'bg-red-50 text-red-700 border-red-200',
      bgGradient: 'from-red-500 to-rose-600',
      icon: '✗',
      label: 'Loss',
    },
  };

  const goalDifference = stats.totalGoalsScored - stats.totalGoalsConceded;

  return (
    <div className="bg-[#E4E5E7] min-h-screen">
      {/* Hero Section with Player Info */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 via-transparent to-[#CC2900]/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Player Photo */}
            <div className="flex-shrink-0">
              {player.photo ? (
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl border-4 border-[#FF6600] overflow-hidden shadow-2xl bg-white transform hover:scale-105 transition-transform duration-300">
                  <OptimizedImage
                    src={player.photo}
                    alt={player.name}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#CC2900] border-4 border-[#FFB700] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <span className="text-7xl sm:text-8xl font-bold text-white">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                {player.name}
              </h1>
              
              {/* Roles */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                {player.roles.map((role) => (
                  <RoleBadge key={role} role={role} size="md" />
                ))}
              </div>
              
              {/* Contact & Location */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                {player.place && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white/90">{player.place}</span>
                  </div>
                )}
                {player.phone && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-white/90">{player.phone}</span>
                  </div>
                )}
              </div>

              {/* Club Badge */}
              <div 
                onClick={() => router.push(`/clubs/${player.club.id}`)}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
              >
                {player.club.logo ? (
                  <div className="w-12 h-12 rounded-lg border-2 border-[#FF6600] overflow-hidden bg-white">
                    <OptimizedImage
                      src={player.club.logo}
                      alt={player.club.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {player.club.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs text-white/70">Playing for</div>
                  <div className="font-bold text-white group-hover:text-[#FFB700] transition-colors">{player.club.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tournaments */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#CC2900] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalTournaments}
            </div>
            <div className="text-sm text-gray-600 font-medium">Tournaments</div>
          </div>

          {/* Matches */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FFB700] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalMatches}
            </div>
            <div className="text-sm text-gray-600 font-medium">Matches</div>
          </div>

          {/* Total Points */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#CC2900] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#CC2900] to-[#FF6600] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalPoints}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Points</div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#FFB700] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Performance Statistics
            </h2>
          </div>
          <p className="text-gray-600 ml-7">
            Detailed breakdown of match performance
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {/* Wins */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats.totalWins}</div>
            <div className="text-sm text-gray-600 font-medium">Wins</div>
          </div>

          {/* Draws */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.totalDraws}</div>
            <div className="text-sm text-gray-600 font-medium">Draws</div>
          </div>

          {/* Losses */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-bold text-red-600 mb-2">{stats.totalLosses}</div>
            <div className="text-sm text-gray-600 font-medium">Losses</div>
          </div>

          {/* Goals Scored */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-l-4 border-[#FF6600] hover:shadow-lg transition-shadow">
            <div className="text-4xl font-bold text-[#FF6600] mb-2">{stats.totalGoalsScored}</div>
            <div className="text-sm text-gray-600 font-medium">Goals Scored</div>
          </div>

          {/* Goals Conceded */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-l-4 border-[#CC2900] hover:shadow-lg transition-shadow">
            <div className="text-4xl font-bold text-[#CC2900] mb-2">{stats.totalGoalsConceded}</div>
            <div className="text-sm text-gray-600 font-medium">Goals Conceded</div>
          </div>

          {/* Goal Difference */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center border-l-4 border-[#FFB700] hover:shadow-lg transition-shadow">
            <div className={`text-4xl font-bold mb-2 ${goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {goalDifference > 0 ? '+' : ''}{goalDifference}
            </div>
            <div className="text-sm text-gray-600 font-medium">Goal Diff</div>
          </div>
        </div>

        {/* Performance Heatmap */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-12">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Performance Heatmap</h3>
            <p className="text-gray-600">Visual representation of recent performance</p>
          </div>
          <PerformanceHeatmap matches={recentMatches} />
        </div>

        {/* Match History Timeline */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Recent Match History
            </h2>
          </div>
        </div>

        {recentMatches.length > 0 ? (
          <div className="grid gap-4 mb-12">
            {recentMatches.map((match) => {
              const config = outcomeConfig[match.outcome];
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#FF6600] group"
                >
                  <Link href={`/matches/${match.matchId}`} className="block">
                    <div className="flex flex-col p-6">
                      {/* Tournament & Date */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${config.color} border`}>
                            {config.label}
                          </span>
                          {match.stageName && (
                            <span className="text-xs text-gray-500">{match.stageName}</span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {new Date(match.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
                        {/* Current Player */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                          {player.photo ? (
                            <img src={player.photo} alt={player.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#FF6600] flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-lg font-bold text-white">{player.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-bold text-sm sm:text-base text-[#1A1A1A] truncate">{player.name}</div>
                            <div className="text-xs text-gray-500 truncate">{player.club?.name || 'Free Agent'}</div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 flex-shrink-0">
                          <div className="text-2xl sm:text-3xl font-bold text-[#FF6600]">{match.goalsScored}</div>
                          <div className="text-xl sm:text-2xl font-bold text-gray-400">-</div>
                          <div className="text-2xl sm:text-3xl font-bold text-[#CC2900]">{match.goalsConceded}</div>
                        </div>

                        {/* Opponent */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end w-full sm:w-auto">
                          <div className="text-right min-w-0 flex-1">
                            <div className="font-bold text-sm sm:text-base text-[#1A1A1A] truncate">{match.opponent?.name || 'Walkover'}</div>
                            <div className="text-xs text-gray-500 truncate">Opponent</div>
                          </div>
                          {match.opponent?.photo ? (
                            <img src={match.opponent.photo} alt={match.opponent.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-300 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-base sm:text-lg font-bold text-gray-600">{match.opponent?.name.charAt(0) || '?'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tournament Name */}
                      <div className="text-xs sm:text-sm text-gray-600 text-center pt-3 border-t border-gray-100">
                        <span className="block sm:inline">{match.tournament.name}</span>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline mt-1 sm:mt-0">{match.pointsEarned} points earned</span>
                      </div>
                    </div>
                  </Link>

                  {/* Hover Effect Bar */}
                  <div className="h-1 bg-gradient-to-r from-[#FF6600] via-[#FFB700] to-[#CC2900] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 text-center py-16 mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF6600]/10 to-[#CC2900]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              No Match History
            </h3>
            <p className="text-gray-600">
              No recent matches to display
            </p>
          </div>
        )}

        {/* Tournament Participation */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Tournament Participation
            </h2>
          </div>
        </div>

        {tournaments.length > 0 ? (
          <div className="grid gap-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#FF6600] group"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="font-bold text-xl text-[#1A1A1A] mb-2 group-hover:text-[#FF6600] transition-colors">
                      {tournament.name}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Started {new Date(tournament.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {tournament.rank && (
                      <div className="bg-gradient-to-br from-[#FFB700] to-[#FF6600] text-white px-6 py-3 rounded-xl shadow-lg">
                        <div className="text-xs font-medium mb-1">Rank</div>
                        <div className="text-2xl font-bold">#{tournament.rank}</div>
                      </div>
                    )}
                    <div className="text-center bg-gradient-to-br from-[#FF6600] to-[#CC2900] text-white px-6 py-3 rounded-xl shadow-lg">
                      <div className="text-xs font-medium mb-1">Points</div>
                      <div className="text-2xl font-bold">{tournament.totalPoints}</div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Bar */}
                <div className="h-1 bg-gradient-to-r from-[#FF6600] via-[#FFB700] to-[#CC2900] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF6600]/10 to-[#CC2900]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              No Tournament Participation
            </h3>
            <p className="text-gray-600">
              This player hasn't participated in any tournaments yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
