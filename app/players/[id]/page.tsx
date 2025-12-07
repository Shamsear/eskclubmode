import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/public/PlayerProfileClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlayerData(id: number) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        matchResults: {
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
        },
        tournamentStats: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                startDate: true,
              },
            },
          },
        },
      },
    });

    if (!player) {
      return null;
    }

    // Calculate overall stats
    const totalMatches = player.matchResults.length;
    const totalWins = player.matchResults.filter(r => r.outcome === 'WIN').length;
    const totalDraws = player.matchResults.filter(r => r.outcome === 'DRAW').length;
    const totalLosses = player.matchResults.filter(r => r.outcome === 'LOSS').length;
    const totalGoalsScored = player.matchResults.reduce((sum, r) => sum + r.goalsScored, 0);
    const totalGoalsConceded = player.matchResults.reduce((sum, r) => sum + r.goalsConceded, 0);
    const totalPoints = player.matchResults.reduce((sum, r) => sum + r.pointsEarned, 0);

    // Get player roles
    const roles = await prisma.playerRole.findMany({
      where: { playerId: id },
      select: { role: true },
    });

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
        totalTournaments: player.tournamentStats.length,
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        totalPoints,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
      },
      recentMatches: player.matchResults.slice(0, 10).map(result => ({
        id: result.id,
        date: result.match.matchDate.toISOString(),
        tournament: result.match.tournament,
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
      })),
      tournaments: player.tournamentStats.map(stat => ({
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
