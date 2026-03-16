'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  club: {
    id: number;
    name: string;
    logo: string | null;
  } | null;
  totalPoints: number;
  totalMatches: number;
  totalWins: number;
  totalDraws: number;
  totalLosses: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
  cleanSheets: number;
  goalDifference: number;
  winRate: number;
  avgPointsPerMatch: number;
  avgGoalsPerMatch: number;
  tournamentsPlayed: number;
}

interface Tournament {
  id: number;
  name: string;
}

interface PlayerStatsClientProps {
  players: Player[];
  tournaments: Tournament[];
}

export function PlayerStatsClient({ players: initialPlayers, tournaments }: PlayerStatsClientProps) {
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedTournament === 'all') {
      setPlayers(initialPlayers);
      return;
    }

    // Fetch tournament-specific stats
    const fetchTournamentStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tournaments/${selectedTournament}/player-stats`);
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players || []);
        } else {
          console.error('Failed to fetch tournament stats');
          setPlayers([]);
        }
      } catch (error) {
        console.error('Error fetching tournament stats:', error);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournamentStats();
  }, [selectedTournament, initialPlayers]);

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
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
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
                    ? 'border-purple-600 text-purple-600 bg-purple-50'
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

      {/* Player Stats Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600 font-medium">Loading tournament statistics...</p>
            </div>
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="w-[10%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">Rank</th>
                <th className="w-[30%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">Player</th>
                <th className="w-[20%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase hidden lg:table-cell">Club</th>
                <th className="w-[10%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase hidden md:table-cell">M</th>
                <th className="w-[15%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">W/D/L</th>
                <th className="w-[10%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase hidden xl:table-cell">GS</th>
                <th className="w-[10%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase hidden xl:table-cell">GC</th>
                <th className="w-[10%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase hidden xl:table-cell">CS</th>
                <th className="w-[10%] px-2 py-3 text-center text-xs font-bold text-gray-700 uppercase">Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player, index) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center">
                      {index === 0 && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">🥇</span>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">🥈</span>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">🥉</span>
                        </div>
                      )}
                      {index > 2 && (
                        <span className="text-xs sm:text-sm font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center ring-1 ring-gray-100 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-purple-700">{player.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{player.name}</div>
                        <div className="text-xs text-gray-500 truncate lg:hidden">
                          {player.club ? player.club.name : "Free Agent"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 hidden lg:table-cell">
                    {player.club ? (
                      <Link href={`/dashboard/clubs/${player.club.id}`} className="flex items-center gap-1.5 group-hover:text-purple-600 transition-colors">
                        {player.club.logo ? (
                          <img src={player.club.logo} alt={player.club.name} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 bg-gradient-to-br from-purple-100 to-pink-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-purple-700">{player.club.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700 truncate">{player.club.name}</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-500">Free Agent</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center text-xs text-gray-600 hidden md:table-cell">{player.totalMatches}</td>
                  <td className="px-2 py-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-0.5 text-xs">
                      <span className="text-green-600 font-semibold">{player.totalWins}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-yellow-600 font-semibold">{player.totalDraws}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600 font-semibold">{player.totalLosses}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center hidden xl:table-cell">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {player.totalGoalsScored}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center hidden xl:table-cell">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {player.totalGoalsConceded}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center hidden xl:table-cell">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {player.cleanSheets}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-xs font-bold shadow-md">
                      {player.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {!isLoading && players.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-6">
            {selectedTournament === 'all' 
              ? 'Add players to clubs and record tournament results to see statistics.'
              : 'No data available for the selected tournament.'}
          </p>
        </div>
      )}
    </>
  );
}
