'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from './ui/OptimizedImage';

interface MatchResult {
  id: number;
  playerId: number;
  outcome: 'WIN' | 'DRAW' | 'LOSS';
  goalsScored: number;
  goalsConceded: number;
  pointsEarned: number;
  player: {
    id: number;
    name: string;
    photo: string | null;
  };
}

interface Match {
  id: number;
  matchDate: string;
  stageName: string | null;
  walkoverWinnerId: number | null;
  tournament: {
    id: number;
    name: string;
    club: {
      id: number;
      name: string;
    } | null;
  };
  results: MatchResult[];
  stage: {
    id: number;
    stageName: string;
    stageOrder: number;
  } | null;
}

export function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/matches');
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-5 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-100 rounded-lg"></div>
              <div className="h-20 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border-2 border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchMatches}
          className="px-6 py-3 bg-[#FF6600] text-white rounded-lg hover:bg-[#CC2900] transition-colors font-semibold border-t-2 border-[#FFB700]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#FFB700]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-[#FF6600]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
            No matches yet
          </h3>
          <p className="text-gray-600">
            Matches will appear here once tournaments have started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const [player1, player2] = match.results;
        const isWalkover = match.walkoverWinnerId !== null;
        
        return (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="block bg-white rounded-xl border-2 border-gray-200 hover:border-[#FF6600] hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Match Header */}
            <div className="bg-gradient-to-r from-[#FF6600] to-[#CC2900] px-3 sm:px-4 py-2.5 sm:py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-white font-bold text-xs sm:text-sm flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="truncate">{match.tournament.name}</span>
                  {match.tournament.club && <span className="hidden md:inline">• {match.tournament.club.name}</span>}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {match.stageName && (
                    <span className="px-2 py-0.5 sm:py-1 bg-white/20 text-white text-xs font-semibold rounded">
                      {match.stageName}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-white/90 text-xs">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(match.matchDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Content */}
            {isWalkover ? (
              <div className="p-4 sm:p-6">
                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                      {match.walkoverWinnerId === 0 ? 'Both players forfeited' : 'Walkover'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                  {/* Player 1 */}
                  <div className={`flex-1 flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg ${
                    player1?.outcome === 'WIN' ? 'bg-green-50' : player1?.outcome === 'DRAW' ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {player1?.player.photo ? (
                        <OptimizedImage
                          src={player1.player.photo}
                          alt={player1.player.name}
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#E4E5E7] rounded-full flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
                          <span className="text-[#1A1A1A] font-bold text-sm sm:text-base md:text-lg">
                            {player1?.player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1A1A1A] text-sm sm:text-base md:text-lg truncate">
                          {player1?.player.name}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold ${
                            player1?.outcome === 'WIN' ? 'bg-green-600 text-white' :
                            player1?.outcome === 'DRAW' ? 'bg-gray-500 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {player1?.outcome}
                          </span>
                          <span className="text-xs text-gray-500">
                            {player1?.pointsEarned} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                        {player1?.goalsScored}
                      </div>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex md:flex-col items-center justify-center gap-2 md:gap-1 md:self-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFB700]/10 rounded-full flex items-center justify-center border-2 border-[#FFB700] flex-shrink-0">
                      <span className="text-[#FF6600] font-bold text-xs sm:text-sm">VS</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      {player1?.goalsScored !== undefined && player2?.goalsScored !== undefined && 
                        `${Math.abs((player1.goalsScored - player1.goalsConceded) - (player2.goalsScored - player2.goalsConceded))} GD`
                      }
                    </span>
                  </div>

                  {/* Player 2 */}
                  <div className={`flex-1 flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg ${
                    player2?.outcome === 'WIN' ? 'bg-green-50' : player2?.outcome === 'DRAW' ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="text-left flex-shrink-0">
                      <div className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                        {player2?.goalsScored}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex-1 text-right min-w-0">
                        <h3 className="font-bold text-[#1A1A1A] text-sm sm:text-base md:text-lg truncate">
                          {player2?.player.name}
                        </h3>
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                          <span className="text-xs text-gray-500">
                            {player2?.pointsEarned} pts
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold ${
                            player2?.outcome === 'WIN' ? 'bg-green-600 text-white' :
                            player2?.outcome === 'DRAW' ? 'bg-gray-500 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {player2?.outcome}
                          </span>
                        </div>
                      </div>
                      {player2?.player.photo ? (
                        <OptimizedImage
                          src={player2.player.photo}
                          alt={player2.player.name}
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#E4E5E7] rounded-full flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
                          <span className="text-[#1A1A1A] font-bold text-sm sm:text-base md:text-lg">
                            {player2?.player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
