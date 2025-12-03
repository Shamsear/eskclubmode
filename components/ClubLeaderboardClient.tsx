'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Club {
  id: number;
  name: string;
  logo: string | null;
  totalPoints: number;
  totalMatches: number;
  totalWins: number;
  totalDraws: number;
  totalLosses: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
  goalDifference: number;
  avgPointsPerMatch: number;
  playerCount: number;
  tournamentCount: number;
}

interface Tournament {
  id: number;
  name: string;
}

interface ClubLeaderboardClientProps {
  clubs: Club[];
  tournaments: Tournament[];
}

export function ClubLeaderboardClient({ clubs, tournaments }: ClubLeaderboardClientProps) {
  const [selectedTournament, setSelectedTournament] = useState<string>('all');

  return (
    <>
      {/* Tournament Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="flex border-b border-gray-200 min-w-max">
            <button
              onClick={() => setSelectedTournament('all')}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                selectedTournament === 'all'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overall Stats
            </button>
            {tournaments.map((tournament) => (
              <button
                key={tournament.id}
                onClick={() => setSelectedTournament(tournament.id.toString())}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  selectedTournament === tournament.id.toString()
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {tournament.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Club</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Players</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Matches</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">W/D/L</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Goals</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">GD</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Avg Pts</th>
                <th className="px-3 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubs.map((club, index) => (
                <tr key={club.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {index === 0 && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">🥇</span>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">🥈</span>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs sm:text-sm">🥉</span>
                        </div>
                      )}
                      {index > 2 && (
                        <span className="text-base sm:text-lg font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/clubs/${club.id}`} className="flex items-center gap-2 sm:gap-3 group-hover:text-emerald-600 transition-colors">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-base sm:text-lg font-bold text-emerald-700">{club.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{club.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 hidden sm:table-cell">{club.playerCount}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 hidden md:table-cell">{club.totalMatches}</td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-xs sm:text-sm">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      <span className="text-green-600 font-semibold">{club.totalWins}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-yellow-600 font-semibold">{club.totalDraws}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-semibold">{club.totalLosses}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 hidden lg:table-cell">
                    {club.totalGoalsScored} - {club.totalGoalsConceded}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center hidden lg:table-cell">
                    <span className={`font-semibold ${
                      club.goalDifference > 0 ? 'text-green-600' : 
                      club.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 hidden xl:table-cell">
                    {club.avgPointsPerMatch}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md">
                      {club.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-6">
            {selectedTournament === 'all' 
              ? 'Create clubs and add tournament results to see the leaderboard.'
              : 'No data available for the selected tournament.'}
          </p>
        </div>
      )}
    </>
  );
}
