import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ClubLeaderboardClient } from "@/components/ClubLeaderboardClient";
import { calculateClubStats } from "@/lib/stats-utils";

async function getClubLeaderboard() {
  try {
    // Get all clubs
    const clubs = await prisma.club.findMany({
      include: {
        _count: {
          select: {
            players: true,
            tournaments: true,
          },
        },
      },
    });

    // Calculate club statistics with tournament breakdown
    const clubStats = await Promise.all(clubs.map(async (club) => {
      // Calculate singles match stats based on transfer dates
      const singlesStats = await calculateClubStats(club.id);
      
      // Get team match results (doubles) - these already have clubId
      const teamMatchResults = await prisma.teamMatchResult.findMany({
        where: { clubId: club.id },
        include: {
          match: {
            select: {
              tournamentId: true,
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

      // Combine singles and doubles stats
      let totalPoints = singlesStats.totalPoints;
      let totalMatches = singlesStats.matchesPlayed;
      let totalWins = singlesStats.wins;
      let totalDraws = singlesStats.draws;
      let totalLosses = singlesStats.losses;
      let totalGoalsScored = singlesStats.goalsScored;
      let totalGoalsConceded = singlesStats.goalsConceded;

      // Add team match results (doubles matches)
      totalPoints += teamMatchResults.reduce((sum, result) => sum + result.pointsEarned, 0);
      totalMatches += teamMatchResults.length;
      totalWins += teamMatchResults.filter(r => r.outcome === 'WIN').length;
      totalDraws += teamMatchResults.filter(r => r.outcome === 'DRAW').length;
      totalLosses += teamMatchResults.filter(r => r.outcome === 'LOSS').length;
      totalGoalsScored += teamMatchResults.reduce((sum, result) => sum + result.goalsScored, 0);
      totalGoalsConceded += teamMatchResults.reduce((sum, result) => sum + result.goalsConceded, 0);

      const goalDifference = totalGoalsScored - totalGoalsConceded;
      const avgPointsPerMatch = totalMatches > 0 ? (totalPoints / totalMatches).toFixed(2) : '0.00';

      // Tournament-specific stats
      const tournamentStats: Record<number, any> = {};
      
      // Get singles matches grouped by tournament
      const singlesMatchResults = await prisma.matchResult.findMany({
        where: {
          player: {
            clubStats: {
              some: {
                clubId: club.id
              }
            }
          }
        },
        include: {
          match: {
            select: {
              matchDate: true,
              tournamentId: true
            }
          },
          player: {
            select: {
              id: true,
              clubStats: {
                where: { clubId: club.id },
                select: {
                  joinedAt: true,
                  leftAt: true
                }
              }
            }
          }
        }
      });

      // Filter singles matches that happened while player was in this club
      const clubSinglesMatches = singlesMatchResults.filter(matchResult => {
        const matchDate = matchResult.match.matchDate;
        const playerPeriod = matchResult.player.clubStats.find(period =>
          matchDate >= period.joinedAt &&
          (!period.leftAt || matchDate < period.leftAt)
        );
        return !!playerPeriod;
      });

      // Add singles to tournament stats
      clubSinglesMatches.forEach((result) => {
        const tournamentId = result.match.tournamentId;
        if (!tournamentStats[tournamentId]) {
          tournamentStats[tournamentId] = {
            totalPoints: 0,
            totalMatches: 0,
            totalWins: 0,
            totalDraws: 0,
            totalLosses: 0,
            totalGoalsScored: 0,
            totalGoalsConceded: 0,
          };
        }
        tournamentStats[tournamentId].totalPoints += result.pointsEarned;
        tournamentStats[tournamentId].totalMatches += 1;
        tournamentStats[tournamentId].totalWins += result.outcome === 'WIN' ? 1 : 0;
        tournamentStats[tournamentId].totalDraws += result.outcome === 'DRAW' ? 1 : 0;
        tournamentStats[tournamentId].totalLosses += result.outcome === 'LOSS' ? 1 : 0;
        tournamentStats[tournamentId].totalGoalsScored += result.goalsScored;
        tournamentStats[tournamentId].totalGoalsConceded += result.goalsConceded;
      });

      // Add team match stats
      teamMatchResults.forEach((result) => {
        const tournamentId = result.match.tournamentId;
        if (!tournamentStats[tournamentId]) {
          tournamentStats[tournamentId] = {
            totalPoints: 0,
            totalMatches: 0,
            totalWins: 0,
            totalDraws: 0,
            totalLosses: 0,
            totalGoalsScored: 0,
            totalGoalsConceded: 0,
          };
        }
        tournamentStats[tournamentId].totalPoints += result.pointsEarned;
        tournamentStats[tournamentId].totalMatches += 1;
        tournamentStats[tournamentId].totalWins += result.outcome === 'WIN' ? 1 : 0;
        tournamentStats[tournamentId].totalDraws += result.outcome === 'DRAW' ? 1 : 0;
        tournamentStats[tournamentId].totalLosses += result.outcome === 'LOSS' ? 1 : 0;
        tournamentStats[tournamentId].totalGoalsScored += result.goalsScored;
        tournamentStats[tournamentId].totalGoalsConceded += result.goalsConceded;
      });

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
        tournamentStats,
      };
    }));

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
    <div className="w-full space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Club Leaderboard" },
        ]}
      />

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-x-48 translate-y-48"></div>
        
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

      <ClubLeaderboardClient clubs={clubStats} tournaments={tournaments} />
    </div>
  );
}
