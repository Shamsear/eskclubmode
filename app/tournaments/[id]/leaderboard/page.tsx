import { notFound } from 'next/navigation';
import Link from 'next/link';
import LeaderboardStream from '@/components/public/LeaderboardStream';
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
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
    <div className="min-h-screen bg-[#E4E5E7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link href="/tournaments" className="hover:text-[#FF6600] transition-colors font-medium">
                Tournaments
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href={`/tournaments/${data.tournament.id}`} className="hover:text-[#FF6600] transition-colors font-medium">
                {data.tournament.name}
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#1A1A1A] font-semibold">Leaderboard</li>
          </ol>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 via-transparent to-[#CC2900]/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v8.32c0 4.27-2.94 8.27-7 9.27-4.06-1-7-5-7-9.27V7.68l7-3.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
                    Leaderboard
                  </h1>
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl">
                {data.tournament.name}
              </p>
            </div>

            <Link
              href={`/tournaments/${data.tournament.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tournament
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {data.rankings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 font-medium">Total Players</div>
                <svg className="w-6 h-6 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-[#1A1A1A]">{data.rankings.length}</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FFB700] transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 font-medium">Total Matches</div>
                <svg className="w-6 h-6 text-[#FFB700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-[#1A1A1A]">
                {Math.round(data.rankings.reduce((sum, r) => sum + r.stats.matchesPlayed, 0) / 2)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#CC2900] transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 font-medium">Total Goals</div>
                <span className="text-3xl">⚽</span>
              </div>
              <div className="text-4xl font-bold text-[#1A1A1A]">
                {data.rankings.reduce((sum, r) => sum + r.stats.goalsScored, 0)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#FF6600] transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600 font-medium">Current Leader</div>
                <span className="text-3xl">🏆</span>
              </div>
              <div className="text-xl font-bold text-[#FF6600] truncate">
                {data.rankings[0]?.player.name || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Leaderboard */}
        <LeaderboardStream tournament={data.tournament} rankings={data.rankings} />
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
      <div className="min-h-screen bg-[#E4E5E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-300 rounded-lg w-1/3"></div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 w-16 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <LeaderboardContent tournamentId={tournamentId} />
    </Suspense>
  );
}
