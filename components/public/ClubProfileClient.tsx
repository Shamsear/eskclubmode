'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicCard } from './PublicCard';
import { RoleBadge } from './Badge';
import { PublicSkeletons } from './PublicSkeletons';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

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

interface ClubStats {
  totalPlayers: number;
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
      <div className="bg-[#E4E5E7] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border-2 border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-800 font-bold text-lg mb-2">Error loading club profile</p>
            <p className="text-red-600 text-sm mb-6">{error}</p>
            <button
              onClick={fetchClubProfile}
              className="px-6 py-3 bg-[#FF6600] text-white rounded-lg hover:bg-[#CC2900] transition-colors font-semibold border-t-2 border-[#FFB700]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="bg-[#E4E5E7] min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PublicSkeletons.PlayerProfile />
        </div>
      </div>
    );
  }

  const { club, players, stats } = data;

  // Sort players by role hierarchy: MANAGER > CAPTAIN > MENTOR > PLAYER
  const roleOrder = { MANAGER: 1, CAPTAIN: 2, MENTOR: 3, PLAYER: 4 };
  const sortedPlayers = [...players].sort((a, b) => {
    // Get the highest priority role for each player
    const aHighestRole = Math.min(...a.roles.map(role => roleOrder[role]));
    const bHighestRole = Math.min(...b.roles.map(role => roleOrder[role]));
    return aHighestRole - bHighestRole;
  });

  return (
    <div className="bg-[#E4E5E7] min-h-screen">
      {/* Hero Section with Club Info */}
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
            {/* Club Logo */}
            <div className="flex-shrink-0">
              {club.logo ? (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-[#FF6600] overflow-hidden shadow-2xl bg-white transform hover:scale-105 transition-transform duration-300">
                  <OptimizedImage
                    src={club.logo}
                    alt={`${club.name} logo`}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#CC2900] border-4 border-[#FFB700] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <span className="text-6xl sm:text-7xl font-bold text-white">
                    {club.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Club Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                {club.name}
              </h1>
              
              {club.description && (
                <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-3xl leading-relaxed">
                  {club.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/90">
                    Since {new Date(club.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-white/90">{stats.totalPlayers} Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Players */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#CC2900] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalPlayers}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Players</div>
          </div>

          {/* Total Goals */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FFB700] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalGoals}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Goals</div>
          </div>

          {/* Average Points per Player */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#CC2900] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#CC2900] to-[#FF6600] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalPlayers > 0 ? Math.round(players.reduce((sum, p) => sum + p.stats.totalPoints, 0) / stats.totalPlayers) : 0}
            </div>
            <div className="text-sm text-gray-600 font-medium">Avg Points</div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6600] to-[#FFB700] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
              {stats.totalPlayers > 0 ? (players.reduce((sum, p) => sum + p.stats.winRate, 0) / stats.totalPlayers).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Avg Win Rate</div>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#FF6600] to-[#CC2900] rounded-full"></div>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Club Roster
            </h2>
          </div>
          <p className="text-gray-600 ml-7">
            Meet the talented members of {club.name}
          </p>
        </div>

        {/* Players Grid */}
        {sortedPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => router.push(`/players/${player.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-transparent hover:border-[#FF6600] transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Player Photo */}
                    <div className="relative flex-shrink-0">
                      {player.photo ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-3 border-[#FF6600] shadow-lg group-hover:border-[#FFB700] transition-colors">
                          <OptimizedImage
                            src={player.photo}
                            alt={player.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center shadow-lg group-hover:from-[#FFB700] group-hover:to-[#FF6600] transition-all">
                          <span className="text-3xl font-bold text-white">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Active Indicator */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 truncate group-hover:text-[#FF6600] transition-colors">
                        {player.name}
                      </h3>
                      
                      {/* Roles */}
                      <div className="flex flex-wrap gap-1">
                        {player.roles.map((role) => (
                          <RoleBadge key={role} role={role} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-gray-100">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1 font-medium">Matches</div>
                      <div className="text-lg font-bold text-[#1A1A1A]">
                        {player.stats.totalMatches}
                      </div>
                    </div>
                    <div className="text-center border-x-2 border-gray-100">
                      <div className="text-xs text-gray-500 mb-1 font-medium">Points</div>
                      <div className="text-lg font-bold text-[#FF6600]">
                        {player.stats.totalPoints}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1 font-medium">Win Rate</div>
                      <div className="text-lg font-bold text-[#FFB700]">
                        {player.stats.winRate.toFixed(0)}%
                      </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              No Players Yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              This club is just getting started. Check back soon to see the roster!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}