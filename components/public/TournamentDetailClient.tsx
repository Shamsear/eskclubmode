'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicCard, CardContent, CardHeader, CardTitle } from './PublicCard';
import { StatCard } from './StatCard';
import TournamentJourneyMap from './TournamentJourneyMap';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface TournamentDetailData {
  tournament: {
    id: number;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    club: {
      id: number;
      name: string;
      logo: string | null;
    } | null;
    pointSystem: {
      pointsPerWin: number;
      pointsPerDraw: number;
      pointsPerLoss: number;
      pointsPerGoalScored: number;
      pointsPerGoalConceded: number;
    };
  };
  stages: Array<{
    id: number;
    name: string;
    order: number;
    matchCount: number;
  }>;
  stats: {
    totalMatches: number;
    completedMatches: number;
    totalGoals: number;
    participantCount: number;
  };
}

interface TournamentDetailClientProps {
  initialData: TournamentDetailData;
  tournamentId: number;
}

export default function TournamentDetailClient({
  initialData,
  tournamentId,
}: TournamentDetailClientProps) {
  const router = useRouter();
  const { tournament, stages, stats } = initialData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatus = (): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

    if (startDate > now) {
      return 'upcoming';
    } else if (!endDate || endDate >= now) {
      return 'active';
    } else {
      return 'completed';
    }
  };

  const status = getStatus();
  const completionPercentage =
    stats.totalMatches > 0
      ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
      : 0;

  return (
    <div className="bg-[#E4E5E7] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link href="/tournaments" className="hover:text-[#FF6600] transition-colors font-medium">
                Tournaments
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#1A1A1A] font-semibold truncate">{tournament.name}</li>
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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                {tournament.name}
              </h1>
              
              {tournament.description && (
                <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-3xl leading-relaxed">
                  {tournament.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/90 text-sm">
                    {formatDate(tournament.startDate)}
                    {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
                  </span>
                </div>

                <div className={`
                  px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm border-2
                  ${status === 'upcoming' ? 'bg-blue-500/20 text-blue-200 border-blue-400' : 
                    status === 'active' ? 'bg-green-500/20 text-green-200 border-green-400 animate-pulse' : 
                    'bg-gray-500/20 text-gray-200 border-gray-400'}
                `}>
                  {status === 'active' && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              </div>
            </div>
            
            {tournament.club && (
              <div 
                onClick={() => router.push(`/clubs/${tournament.club?.id}`)}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
              >
                {tournament.club?.logo ? (
                  <div className="w-16 h-16 rounded-lg border-2 border-[#FF6600] overflow-hidden bg-white">
                    <OptimizedImage
                      src={tournament.club.logo}
                      alt={tournament.club.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {tournament.club?.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/70 mb-1">Organized by</p>
                  <p className="text-lg font-bold text-white group-hover:text-[#FFB700] transition-colors">
                    {tournament.club?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Participants */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#CC2900] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.participantCount}
            </div>
            <div className="text-sm text-gray-600 font-medium">Participants</div>
          </div>

          {/* Total Matches */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FFB700] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalMatches}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Matches</div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#CC2900] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#CC2900] to-[#FF6600] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.completedMatches}
            </div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>

          {/* Total Goals */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#FFB700] rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">⚽</span>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalGoals}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Goals</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {stats.totalMatches > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Tournament Progress</h3>
                <p className="text-sm text-gray-600">{stats.completedMatches} of {stats.totalMatches} matches completed</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#FF6600]">
                  {completionPercentage}%
                </div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6600] via-[#FFB700] to-[#CC2900] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
                role="progressbar"
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tournament Journey Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {stages.length > 0 && (
          <div className="mb-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
                <h2 className="text-3xl font-bold text-[#1A1A1A]">
                  Tournament Journey
                </h2>
              </div>
              <p className="text-gray-600 ml-7">
                Navigate through the tournament stages
              </p>
            </div>
            <TournamentJourneyMap stages={stages} tournamentId={tournamentId} />
          </div>
        )}
      </div>

      {/* Point System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
              <h2 className="text-3xl font-bold text-[#1A1A1A]">
                Point System
              </h2>
            </div>
            <p className="text-gray-600 ml-7">
              How points are awarded in this tournament
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-green-700">Win</span>
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-green-600">
                {tournament.pointSystem.pointsPerWin}
              </div>
              <div className="text-xs text-green-600 mt-1">points</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-yellow-700">Draw</span>
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-yellow-600">
                {tournament.pointSystem.pointsPerDraw}
              </div>
              <div className="text-xs text-yellow-600 mt-1">points</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200 hover:border-red-400 transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-red-700">Loss</span>
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-red-600">
                {tournament.pointSystem.pointsPerLoss}
              </div>
              <div className="text-xs text-red-600 mt-1">points</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FF6600]/10 to-[#FFB700]/10 rounded-xl p-6 border-2 border-[#FF6600]/30 hover:border-[#FF6600] transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#CC2900]">Goal Scored</span>
                <span className="text-xl">⚽</span>
              </div>
              <div className="text-4xl font-bold text-[#FF6600]">
                +{tournament.pointSystem.pointsPerGoalScored}
              </div>
              <div className="text-xs text-[#CC2900] mt-1">per goal</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-purple-700">Goal Conceded</span>
                <span className="text-xl">🥅</span>
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {tournament.pointSystem.pointsPerGoalConceded}
              </div>
              <div className="text-xs text-purple-600 mt-1">per goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/tournaments/${tournamentId}/leaderboard`}
            className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-[#FF6600] to-[#CC2900] text-white rounded-xl font-bold text-center transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
              </svg>
              <span className="text-lg">View Leaderboard</span>
            </div>
          </Link>
          
          <Link
            href={`/tournaments/${tournamentId}/matches`}
            className="group px-8 py-5 bg-white hover:bg-gray-50 text-[#1A1A1A] border-3 border-[#FF6600] rounded-xl font-bold text-center transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-lg group-hover:text-[#FF6600] transition-colors">View All Matches</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
