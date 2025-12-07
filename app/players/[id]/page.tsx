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

    return {
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        place: player.place,
        dateOfBirth: player.dateOfBirth?.toISOString() || null,
        photo: player.photo,
        gender: player.gender,
        state: player.state,
        district: player.district,
        isFreeAgent: player.isFreeAgent,
        club: player.club,
      },
      stats: {
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        totalPoints,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
      },
      recentMatches: player.matchResults.map(result => ({
        id: result.id,
        matchId: result.matchId,
        outcome: result.outcome,
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
        match: result.match,
      })),
      tournamentStats: player.tournamentStats,
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
