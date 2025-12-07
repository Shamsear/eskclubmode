import { notFound } from 'next/navigation';
import TournamentDetailClient from '@/components/public/TournamentDetailClient';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournamentData(id: number) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        pointSystemTemplate: {
          select: {
            id: true,
            name: true,
            stagePoints: {
              select: {
                id: true,
                stageId: true,
                stageName: true,
                stageOrder: true,
                _count: {
                  select: {
                    matches: true,
                  },
                },
              },
              orderBy: {
                stageOrder: "asc",
              },
            },
          },
        },
        matches: {
          select: {
            id: true,
            matchDate: true,
            stageId: true,
            stageName: true,
            results: {
              select: {
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      return null;
    }

    const completedMatches = tournament.matches.filter(
      (match) => match.results.length > 0
    ).length;

    const totalGoals = await prisma.matchResult.aggregate({
      where: {
        match: {
          tournamentId: id,
        },
      },
      _sum: {
        goalsScored: true,
      },
    });

    const stages = tournament.pointSystemTemplate?.stagePoints.map((stage) => ({
      id: stage.id,
      name: stage.stageName,
      order: stage.stageOrder,
      matchCount: stage._count.matches,
    })) || [];

    return {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate?.toISOString() || null,
        club: tournament.club,
        pointSystem: {
          pointsPerWin: tournament.pointsPerWin,
          pointsPerDraw: tournament.pointsPerDraw,
          pointsPerLoss: tournament.pointsPerLoss,
          pointsPerGoalScored: tournament.pointsPerGoalScored,
          pointsPerGoalConceded: tournament.pointsPerGoalConceded,
        },
      },
      stages,
      stats: {
        totalMatches: tournament._count.matches,
        completedMatches,
        totalGoals: totalGoals._sum.goalsScored || 0,
        participantCount: tournament._count.participants,
      },
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    notFound();
  }

  const data = await getTournamentData(tournamentId);

  if (!data) {
    notFound();
  }

  return <TournamentDetailClient initialData={data} tournamentId={tournamentId} />;
}
