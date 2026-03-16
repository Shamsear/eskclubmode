import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PlayerStatsClient } from "@/components/PlayerStatsClient";
import { getPlayerStatsWithClub } from "@/lib/stats-utils";

async function getPlayerOverallStats() {
  try {
    // Get stats calculated from match results with transfer date awareness
    const playerStatsData = await getPlayerStatsWithClub();

    // Get all match results to calculate tournaments played and clean sheets
    const allMatchResults = await prisma.matchResult.findMany({
      include: {
        match: {
          select: {
            tournamentId: true
          }
        }
      }
    });

    // Calculate tournaments played per player (distinct tournament IDs)
    const tournamentCountMap = new Map<number, number>();
    const playerTournaments = new Map<number, Set<number>>();
    
    for (const result of allMatchResults) {
      if (result.match.tournamentId) {
        if (!playerTournaments.has(result.playerId)) {
          playerTournaments.set(result.playerId, new Set());
        }
        playerTournaments.get(result.playerId)!.add(result.match.tournamentId);
      }
    }
    
    for (const [playerId, tournaments] of playerTournaments.entries()) {
      tournamentCountMap.set(playerId, tournaments.size);
    }

    // Calculate clean sheets per player
    const cleanSheetsMap = new Map<number, number>();
    for (const result of allMatchResults) {
      if (result.goalsConceded === 0) {
        cleanSheetsMap.set(result.playerId, (cleanSheetsMap.get(result.playerId) || 0) + 1);
      }
    }

    // Transform to match the expected format
    const playerStats = playerStatsData.map((data) => {
      const goalDifference = data.stats.goalsScored - data.stats.goalsConceded;
      const winRate = data.stats.matchesPlayed > 0 
        ? (data.stats.wins / data.stats.matchesPlayed) * 100 
        : 0;
      const avgPointsPerMatch = data.stats.matchesPlayed > 0 
        ? data.stats.totalPoints / data.stats.matchesPlayed 
        : 0;
      const avgGoalsPerMatch = data.stats.matchesPlayed > 0 
        ? data.stats.goalsScored / data.stats.matchesPlayed 
        : 0;
      const cleanSheets = cleanSheetsMap.get(data.player.id) || 0;
      const tournamentsPlayed = tournamentCountMap.get(data.player.id) || 0;

      return {
        id: data.player.id,
        name: data.player.name,
        email: data.player.email,
        photo: data.player.photo,
        club: data.player.club,
        totalPoints: data.stats.totalPoints,
        totalMatches: data.stats.matchesPlayed,
        totalWins: data.stats.wins,
        totalDraws: data.stats.draws,
        totalLosses: data.stats.losses,
        totalGoalsScored: data.stats.goalsScored,
        totalGoalsConceded: data.stats.goalsConceded,
        cleanSheets,
        goalDifference,
        winRate,
        avgPointsPerMatch,
        avgGoalsPerMatch,
        tournamentsPlayed,
      };
    });

    // Filter out players with 0 matches
    const activePlayers = playerStats.filter(player => player.totalMatches > 0);

    // Sort by total points, then win rate, then goal difference
    activePlayers.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.goalDifference - a.goalDifference;
    });

    return activePlayers;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return [];
  }
}

export default async function PlayerStatsPage() {
  await requireAuth();
  const playerStats = await getPlayerOverallStats();
  
  // Get all tournaments for filtering
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      startDate: 'desc',
    },
  });

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

      <PlayerStatsClient players={playerStats} tournaments={tournaments} />
    </div>
  );
}
