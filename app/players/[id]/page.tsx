import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/public/PlayerProfileClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlayerData(id: number) {
  try {
    // Fetch player data and recent matches in parallel
    const [player, recentMatches, tournamentStats, roles] = await Promise.all([
      prisma.player.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          place: true,
          dateOfBirth: true,
          photo: true,
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      }),
      // Fetch only recent 10 matches
      prisma.matchResult.findMany({
        where: { playerId: id },
        include: {
          match: {
            select: {
              id: true,
              matchDate: true,
              stageName: true,
              tournament: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          match: {
            matchDate: 'desc',
          },
        },
        take: 10,
      }),
      // Fetch tournament stats
      prisma.tournamentPlayerStats.findMany({
        where: { playerId: id },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              startDate: true,
            },
          },
        },
      }),
      // Fetch player roles
      prisma.playerRole.findMany({
        where: { playerId: id },
        select: { role: true },
      }),
    ]);

    if (!player) {
      return null;
    }

    // Calculate overall stats from tournament stats (more efficient)
    const totalMatches = tournamentStats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
    const totalWins = tournamentStats.reduce((sum, stat) => sum + stat.wins, 0);
    const totalDraws = tournamentStats.reduce((sum, stat) => sum + stat.draws, 0);
    const totalLosses = tournamentStats.reduce((sum, stat) => sum + stat.losses, 0);
    const totalGoalsScored = tournamentStats.reduce((sum, stat) => sum + stat.goalsScored, 0);
    const totalGoalsConceded = tournamentStats.reduce((sum, stat) => sum + stat.goalsConceded, 0);
    const totalPoints = tournamentStats.reduce((sum, stat) => sum + stat.totalPoints, 0);

    return {
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        place: player.place,
        dateOfBirth: player.dateOfBirth?.toISOString() || null,
        photo: player.photo,
        club: player.club || { id: 0, name: 'Free Agent', logo: null },
        roles: roles.map(r => r.role as 'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'),
      },
      stats: {
        totalTournaments: tournamentStats.length,
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        totalPoints,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
      },
      recentMatches: recentMatches.map(result => ({
        id: result.id,
        date: result.match.matchDate.toISOString(),
        tournament: result.match.tournament,
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
      })),
      tournaments: tournamentStats.map(stat => ({
        id: stat.tournament.id,
        name: stat.tournament.name,
        startDate: stat.tournament.startDate?.toISOString() || new Date().toISOString(),
        rank: null, // Rank would need to be calculated separately
        totalPoints: stat.totalPoints,
      })),
    };
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    notFound();
  }

  const data = await getPlayerData(playerId);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PlayerProfileClient initialData={data} />
    </div>
  );
}
