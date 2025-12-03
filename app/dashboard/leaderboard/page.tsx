import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";

async function getClubLeaderboard() {
  try {
    // Get all clubs with their players' stats
    const clubs = await prisma.club.findMany({
      include: {
        players: {
          include: {
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
        },
        _count: {
          select: {
            players: true,
            tournaments: true,
          },
        },
      },
    });

    // Calculate club statistics
    const clubStats = clubs.map((club) => {
      const allStats = club.players.flatMap((player) => player.playerStats);
      
      const totalPoints = allStats.reduce((sum, stat) => sum + stat.totalPoints, 0);
      const totalMatches = allStats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
      const totalWins = allStats.reduce((sum, stat) => sum + stat.wins, 0);
      const totalDraws = allStats.reduce((sum, stat) => sum + stat.draws, 0);
      const totalLosses = allStats.reduce((sum, stat) => sum + stat.losses, 0);
      const totalGoalsScored = allStats.reduce((sum, stat) => sum + stat.goalsScored, 0);
      const totalGoalsConceded = allStats.reduce((sum, stat) => sum + stat.goalsConceded, 0);
      const goalDifference = totalGoalsScored - totalGoalsConceded;
      const avgPointsPerMatch = totalMatches > 0 ? (totalPoints / totalMatches).toFixed(2) : '0.00';

      return {
        id: club.id,
        name: club.name,
        logo: club.logo,
        totalPoints,
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        goalDifference,
        avgPointsPerMatch: parseFloat(avgPointsPerMatch),
        playerCount: club._count.players,
        tournamentCount: club._count.tournaments,
      };
    });

    // Sort by total points, then goal difference, then goals scored
    clubStats.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.totalGoalsScored - a.totalGoalsScored;
    });

    return clubStats;
  } catch (error) {
    console.error('Error fetching club leaderboard:', error);
    return [];
  }
}

export default async function ClubLeaderboardPage() {
  await requireAuth();
  const clubStats = await getClubLeaderboard();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Club Leaderboard" },
        ]}
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Club Leaderboard</h1>
              <p className="text-emerald-100 mt-1">Rankings based on cumulative player performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{clubStats.length}</p>
          <p className="text-sm text-white text-opacity-90">Total Clubs</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold">
            {clubStats.reduce((sum, club) => sum + club.totalMatches, 0)}
          </p>
          <p className="text-sm text-white text-opacity-90">Total Matches</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">
            {clubStats.reduce((sum, club) => sum + club.playerCount, 0)}
          </p>
          <p className="text-sm text-white text-opacity-90">Total Players</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold">
            {clubStats.reduce((sum, club) => sum + club.totalGoalsScored, 0)}
          </p>
          <p className="text-sm text-white text-opacity-90">Total Goals</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Club</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Players</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">W/D/L</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Goals</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">GD</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Avg Pts</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Total Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubStats.map((club, index) => (
                <tr key={club.id} className="hover:bg-gray-50 transition-colors group">
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
                    <Link href={`/dashboard/clubs/${club.id}`} className="flex items-center gap-3 group-hover:text-emerald-600 transition-colors">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-700">{club.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{club.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{club.playerCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{club.totalMatches}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <span className="text-green-600 font-semibold">{club.totalWins}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-yellow-600 font-semibold">{club.totalDraws}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600 font-semibold">{club.totalLosses}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {club.totalGoalsScored} - {club.totalGoalsConceded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`font-semibold ${
                      club.goalDifference > 0 ? 'text-green-600' : 
                      club.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {club.goalDifference > 0 ? '+' : ''}{club.goalDifference}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {club.avgPointsPerMatch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-bold shadow-md">
                      {club.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {clubStats.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No club data available</h3>
          <p className="text-gray-600 mb-6">Create clubs and add tournament results to see the leaderboard.</p>
        </div>
      )}
    </div>
  );
}
