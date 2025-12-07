import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TournamentFilter from '@/components/leaderboard/TournamentFilter';

interface PageProps {
  searchParams: Promise<{ tournament?: string }>;
}

interface PlayerStats {
  player: {
    id: number;
    name: string;
    photo: string | null;
    club: {
      id: number;
      name: string;
      logo: string | null;
    };
  };
  stats: {
    totalMatches: number;
    totalWins: number;
    totalDraws: number;
    totalLosses: number;
    totalGoalsScored: number;
    totalGoalsConceded: number;
    totalPoints: number;
    winRate: number;
  };
}

async function getPlayersLeaderboard(tournamentId?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = tournamentId 
    ? `${baseUrl}/api/public/leaderboard/players?tournament=${tournamentId}`
    : `${baseUrl}/api/public/leaderboard/players`;
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching players leaderboard:', error);
    return null;
  }
}

async function getTournaments() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/public/tournaments`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tournaments || [];
  } catch (error) {
    return [];
  }
}

async function PlayersLeaderboardContent({ tournamentId }: { tournamentId?: string }) {
  const [data, tournaments] = await Promise.all([
    getPlayersLeaderboard(tournamentId),
    getTournaments()
  ]);

  if (!data) {
    notFound();
  }

  const selectedTournament = tournamentId 
    ? tournaments.find((t: any) => t.id === parseInt(tournamentId))
    : null;

  return (
    <div className="min-h-screen bg-[#E4E5E7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-[#FF6600] transition-colors font-medium">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/leaderboard/players" className="hover:text-[#FF6600] transition-colors font-medium">
                Leaderboard
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#1A1A1A] font-semibold">Players</li>
          </ol>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/20 via-transparent to-[#CC2900]/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFB700] to-[#FF6600] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-4xl">👥</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#FFB700] bg-clip-text text-transparent">
              Players Leaderboard
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              {selectedTournament ? selectedTournament.name : 'Overall Rankings'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
        <TournamentFilter 
          currentTournamentId={tournamentId}
          tournaments={tournaments}
          leaderboardType="players"
        />
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#FF6600] to-[#CC2900] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Player</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Matches</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">W/D/L</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Goals</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Win Rate</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.players.map((item: PlayerStats, index: number) => (
                  <tr key={item.player.id} className="hover:bg-[#FFB700]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/players/${item.player.id}`} className="flex items-center gap-3 group">
                        {item.player.photo ? (
                          <img src={item.player.photo} alt={item.player.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#FF6600]" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6600] to-[#CC2900] flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{item.player.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#1A1A1A] group-hover:text-[#FF6600] transition-colors">
                            {item.player.name}
                          </div>
                          <div className="text-sm text-gray-600">{item.player.club.name}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">{item.stats.totalMatches}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 font-semibold">{item.stats.totalWins}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-yellow-600 font-semibold">{item.stats.totalDraws}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600 font-semibold">{item.stats.totalLosses}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {item.stats.totalGoalsScored} - {item.stats.totalGoalsConceded}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-[#FFB700]">
                      {item.stats.winRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-[#FF6600]">{item.stats.totalPoints}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function PlayersLeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tournamentId = params.tournament;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#E4E5E7] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6600] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading leaderboard...</p>
      </div>
    </div>}>
      <PlayersLeaderboardContent tournamentId={tournamentId} />
    </Suspense>
  );
}
