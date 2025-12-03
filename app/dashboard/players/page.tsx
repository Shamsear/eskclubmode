import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";

async function getPlayerOverallStats() {
  try {
    const players = await prisma.player.findMany({
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        playerStats: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate overall stats for each player
    const playerStats = players.map((player) => {
      const stats = player.playerStats;
      
      const totalPoints = stats.reduce((sum, stat) => sum + stat.totalPoints, 0);
      const totalMatches = stats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
      const totalWins = stats.reduce((sum, stat) => sum + stat.wins, 0);
      const totalDraws = stats.reduce((sum, stat) => sum + stat.draws, 0);
      const totalLosses = stats.reduce((sum, stat) => sum + stat.losses, 0);
      const totalGoalsScored = stats.reduce((sum, stat) => sum + stat.goalsScored, 0);
      const totalGoalsConceded = stats.reduce((sum, stat) => sum + stat.goalsConceded, 0);
      const goalDifference = totalGoalsScored - totalGoalsConceded;
      const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : '0.0';
      const avgPointsPerMatch = totalMatches > 0 ? (totalPoints / totalMatches).toFixed(2) : '0.00';
      const avgGoalsPerMatch = totalMatches > 0 ? (totalGoalsScored / totalMatches).toFixed(2) : '0.00';

      return {
        id: player.id,
        name: player.name,
        email: player.email,
        photo: player.photo,
        club: player.club,
        totalPoints,
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        goalDifference,
        winRate: parseFloat(winRate),
        avgPointsPerMatch: parseFloat(avgPointsPerMatch),
        avgGoalsPerMatch: parseFloat(avgGoalsPerMatch),
        tournamentsPlayed: stats.length,
      };
    });

    // Sort by total points, then win rate, then goal difference
    playerStats.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.goalDifference - a.goalDifference;
    });

    return playerStats;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return [];
  }
}

export default async function PlayerStatsPage() {
  await requireAuth();
  const playerStats = await getPlayerOverallStats();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Player Statistics" },
        ]}
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Player Statistics</h1>
              <p className="text-purple-100 mt-1">Overall performance across all tournaments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{playerStats.length}</p>
          <p className="text-sm text-white text-opacity-90">Total Players</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold">
            {playerStats.reduce((sum, player) => sum + player.totalMatches, 0)}
          </p>
          <p className="text-sm text-white text-opacity-90">Total Matches</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">
            {playerStats.reduce((sum, player) => sum + player.totalWins, 0)}
          </p>
          <p className="text-sm text-white text-opacity-90">Total Wins</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold">
            {playerStats.reduce((sum, player) => sum + player.totalGoalsScored, 0)}
          </p>
          <p className="text-sm text-white text-opacity-90">Total Goals</p>
        </div>
      </div>

      {/* Player Stats Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Player</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Club</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Tournaments</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">W/D/L</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Win %</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Goals</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">GD</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Avg G/M</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Avg Pts</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playerStats.map((player, index) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {index === 0 && (
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">🥇</span>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">🥈</span>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">🥉</span>
                        </div>
                      )}
                      {index > 2 && (
                        <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center ring-2 ring-gray-100">
                          <span className="text-lg font-bold text-purple-700">{player.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/dashboard/clubs/${player.club.id}`} className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                      {player.club.logo ? (
                        <img src={player.club.logo} alt={player.club.name} className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-700">{player.club.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{player.club.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{player.tournamentsPlayed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{player.totalMatches}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className="text-green-600 font-semibold">{player.totalWins}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-yellow-600 font-semibold">{player.totalDraws}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600 font-semibold">{player.totalLosses}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      player.winRate >= 70 ? 'bg-green-100 text-green-800' :
                      player.winRate >= 50 ? 'bg-blue-100 text-blue-800' :
                      player.winRate >= 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {player.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {player.totalGoalsScored} - {player.totalGoalsConceded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`font-semibold ${
                      player.goalDifference > 0 ? 'text-green-600' : 
                      player.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {player.avgGoalsPerMatch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {player.avgPointsPerMatch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm font-bold shadow-md">
                      {player.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {playerStats.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No player data available</h3>
          <p className="text-gray-600 mb-6">Add players to clubs and record tournament results to see statistics.</p>
        </div>
      )}
    </div>
  );
}
