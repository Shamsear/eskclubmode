import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { MatchTheater } from '@/components/public/MatchTheater';
import { PublicSkeletons } from '@/components/public/PublicSkeletons';
import { PerformanceMonitor } from '@/components/public/PerformanceMonitor';
import { prisma } from '@/lib/prisma';

interface MatchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getMatchData(id: string) {
  try {
    const matchId = parseInt(id);
    
    if (isNaN(matchId)) {
      return null;
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            startDate: true,
          },
        },
        stage: {
          select: {
            id: true,
            stageName: true,
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                photo: true,
                club: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
    });

    if (!match) {
      return null;
    }

    // Transform to expected format
    const player1Result = match.results[0];
    const player2Result = match.results[1];

    return {
      match: {
        id: match.id,
        date: match.matchDate.toISOString(),
        stage: match.stage ? match.stage.stageName : match.stageName,
        tournament: {
          id: match.tournament.id,
          name: match.tournament.name,
        },
        player1: player1Result ? {
          id: player1Result.player.id,
          name: player1Result.player.name,
          photo: player1Result.player.photo,
          club: player1Result.player.club,
          score: player1Result.goalsScored,
          outcome: player1Result.outcome,
          pointsEarned: player1Result.pointsEarned,
        } : null,
        player2: player2Result ? {
          id: player2Result.player.id,
          name: player2Result.player.name,
          photo: player2Result.player.photo,
          club: player2Result.player.club,
          score: player2Result.goalsScored,
          outcome: player2Result.outcome,
          pointsEarned: player2Result.pointsEarned,
        } : null,
        isWalkover: match.walkoverWinnerId !== null,
        walkoverWinner: match.walkoverWinnerId ? 
          (match.walkoverWinnerId === player1Result?.playerId ? player1Result?.player : player2Result?.player) : 
          null,
      },
    };
  } catch (error) {
    console.error('Error fetching match data:', error);
    return null;
  }
}

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const data = await getMatchData(id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <PerformanceMonitor pageName={`match-${id}`} />
      <Suspense fallback={<PublicSkeletons.MatchTheater />}>
        <MatchTheater data={data} />
      </Suspense>
    </>
  );
}

export async function generateMetadata({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const data = await getMatchData(id);

  if (!data) {
    return {
      title: 'Match Not Found',
    };
  }

  const matchDate = new Date(data.match.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title: `Match #${data.match.id} - ${data.match.tournament.name} | ${matchDate}`,
    description: `View detailed match results and player performances for ${data.match.tournament.name} on ${matchDate}`,
  };
}
