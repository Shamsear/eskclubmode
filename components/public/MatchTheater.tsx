'use client';

import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface MatchTheaterData {
  match: {
    id: number;
    date: string;
    stageName: string | null;
    tournament: {
      id: number;
      name: string;
    };
  };
  results: Array<{
    player: {
      id: number;
      name: string;
      photo: string | null;
      club: {
        id: number;
        name: string;
        logo: string | null;
      };
    };
    outcome: 'WIN' | 'DRAW' | 'LOSS';
    goalsScored: number;
    goalsConceded: number;
    pointsEarned: number;
    basePoints: number;
    conditionalPoints: number;
  }>;
}

interface MatchTheaterProps {
  data: MatchTheaterData;
}

const outcomeConfig = {
  WIN: {
    label: 'Victory',
    icon: '🏆',
    bgGradient: 'from-green-500 to-emerald-600',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
  },
  DRAW: {
    label: 'Draw',
    icon: '🤝',
    bgGradient: 'from-yellow-500 to-amber-600',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-500',
  },
  LOSS: {
    label: 'Defeat',
    icon: '⚔️',
    bgGradient: 'from-red-500 to-rose-600',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
  },
};

export function MatchTheater({ data }: MatchTheaterProps) {
  const matchDate = new Date(data.match.date);

  return (
    <div className="min-h-screen bg-[#E4E5E7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link href="/matches" className="hover:text-[#FF6600] transition-colors font-medium">
                Matches
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href={`/tournaments/${data.match.tournament.id}`} className="hover:text-[#FF6600] transition-colors font-medium">
                {data.match.tournament.name}
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#1A1A1A] font-semibold">Match #{data.match.id}</li>
          </ol>
        </nav>
      </div>

      {/* Hero Section */}
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
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
              Match Details
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-6">
              {data.match.tournament.name}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={data.match.date} className="text-white/90 text-sm">
                  {matchDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              {data.match.stageName && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[#FFB700]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
                  </svg>
                  <span className="text-white/90 text-sm">{data.match.stageName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Total Players</div>
              <svg className="w-6 h-6 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">{data.results.length}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FFB700] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Total Goals</div>
              <span className="text-3xl">⚽</span>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">
              {data.results.reduce((sum, r) => sum + r.goalsScored, 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#CC2900] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Winners</div>
              <span className="text-3xl">🏆</span>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">
              {data.results.filter((r) => r.outcome === 'WIN').length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Total Points</div>
              <svg className="w-6 h-6 text-[#FF6600]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#1A1A1A]">
              {data.results.reduce((sum, r) => sum + r.pointsEarned, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Player Performance Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Player Performances
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.results.map((result) => (
            <PlayerPerformanceCard
              key={result.player.id}
              result={result}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlayerPerformanceCardProps {
  result: MatchTheaterData['results'][0];
}

function PlayerPerformanceCard({ result }: PlayerPerformanceCardProps) {
  const config = outcomeConfig[result.outcome];
  const goalDiff = result.goalsScored - result.goalsConceded;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#FF6600] group">
      {/* Outcome Banner */}
      <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <span className="text-white font-bold text-lg">{config.label}</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {result.pointsEarned} pts
        </div>
      </div>

      <div className="p-6">
        {/* Player Info */}
        <Link
          href={`/players/${result.player.id}`}
          className="block group/player mb-6"
        >
          <div className="flex items-center gap-4">
            {result.player.photo ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FF6600] flex-shrink-0">
                <OptimizedImage
                  src={result.player.photo}
                  alt={result.player.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover group-hover/player:scale-110 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {result.player.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#1A1A1A] group-hover/player:text-[#FF6600] transition-colors truncate">
                {result.player.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {result.player.club.logo && (
                  <OptimizedImage
                    src={result.player.club.logo}
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="truncate">{result.player.club.name}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Performance Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between py-2 border-b-2 border-gray-100">
            <span className="text-sm text-gray-600 font-medium">Goals Scored</span>
            <span className="text-xl font-bold text-[#FF6600]">
              {result.goalsScored}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b-2 border-gray-100">
            <span className="text-sm text-gray-600 font-medium">Goals Conceded</span>
            <span className="text-xl font-bold text-[#CC2900]">
              {result.goalsConceded}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b-2 border-gray-100">
            <span className="text-sm text-gray-600 font-medium">Goal Difference</span>
            <span className={`text-xl font-bold ${
              goalDiff > 0 ? 'text-green-600' : goalDiff < 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {goalDiff > 0 ? '+' : ''}{goalDiff}
            </span>
          </div>
        </div>

        {/* Points Breakdown */}
        {(result.basePoints > 0 || result.conditionalPoints > 0) && (
          <div className="pt-4 border-t-2 border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
              Points Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Points</span>
                <span className="font-bold text-[#1A1A1A]">{result.basePoints}</span>
              </div>
              {result.conditionalPoints > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bonus Points</span>
                  <span className="font-bold text-green-600">
                    +{result.conditionalPoints}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Bar */}
      <div className="h-1 bg-gradient-to-r from-[#FF6600] via-[#FFB700] to-[#CC2900] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
}
