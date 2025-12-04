import { notFound } from 'next/navigation';
import Link from 'next/link';
import LeaderboardStream from '@/components/public/LeaderboardStream';
import { PublicSkeletons } from '@/components/public/PublicSkeletons';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LeaderboardData {
  tournament: {
    id: number;
    name: string;
  };
  rankings: Array<{
    rank: number;
    player: {
      id: number;
      name: string;
      photo: string | null;
      club: {
        id: number;
        name: string;
        logo: string | null;
      } | null;
    };
    stats: {
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      goalDifference: number;
      totalPoints: number;
    };
  }>;
}

async function getLeaderboardData(id: number): Promise<LeaderboardData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/tournaments/${id}/leaderboard`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch leaderboard');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return null;
  }
}

async function LeaderboardContent({ tournamentId }: { tournamentId: number }) {
  const data = await getLeaderboardData(tournamentId);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/tournaments" className="hover:text-primary-600 transition-colors">
              Tournaments
            </Link>
            <span>/</span>
            <Link
              href={`/tournaments/${data.tournament.id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {data.tournament.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Leaderboard</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Tournament Leaderboard
              </h1>
              <p className="text-lg text-gray-600">{data.tournament.name}</p>
            </div>

            <Link
              href={`/tournaments/${data.tournament.id}`}
              className="
                inline-flex items-center gap-2 px-4 py-2
                bg-white border border-gray-300 rounded-lg
                text-gray-700 font-medium
                hover:bg-gray-50 transition-colors
                self-start sm:self-auto
              "
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Tournament
            </Link>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>
                Rankings are determined by total points. In case of a tie, goal difference is used,
                followed by goals scored.
              </p>
            </div>
          </div>

          <LeaderboardStream tournament={data.tournament} rankings={data.rankings} />
        </div>

        {/* Stats Summary */}
        {data.rankings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Players</div>
              <div className="text-2xl font-bold text-gray-900">{data.rankings.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Matches</div>
              <div className="text-2xl font-bold text-gray-900">
                {data.rankings.reduce((sum, r) => sum + r.stats.matchesPlayed, 0) / 2}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Goals</div>
              <div className="text-2xl font-bold text-gray-900">
                {data.rankings.reduce((sum, r) => sum + r.stats.goalsScored, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Leader</div>
              <div className="text-lg font-bold text-primary-600 truncate">
                {data.rankings[0]?.player.name || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function LeaderboardPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PublicSkeletons.Leaderboard />
        </div>
      </div>
    }>
      <LeaderboardContent tournamentId={tournamentId} />
    </Suspense>
  );
}
