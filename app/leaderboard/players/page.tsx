import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TournamentFilter from '@/components/leaderboard/TournamentFilter';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { getPlayerStatsWithClub } from '@/lib/stats-utils';
import PlayersTable from '@/components/leaderboard/PlayersTable';

export const metadata: Metadata = {
  title: 'Players Leaderboard — Eskimos Club',
  description: 'Players ranked by points, wins, goals and win rate across all tournaments.',
};

interface PageProps {
  searchParams: Promise<{ tournament?: string; filter?: string }>;
}

interface PlayerStats {
  player: { id: number; name: string; photo: string | null; club: { id: number; name: string; logo: string | null } | null };
  stats: { matchesPlayed: number; wins: number; draws: number; losses: number; goalsScored: number; goalsConceded: number; totalPoints: number; winRate: number; cleanSheets?: number };
}

async function getPlayersLeaderboard(tournamentId?: string, filter?: string) {
  try {
    const playerStats = await getPlayerStatsWithClub(
      tournamentId ? parseInt(tournamentId) : undefined
    );
    
    // Get clean sheets for each player
    const cleanSheetsData = await prisma.matchResult.groupBy({
      by: ['playerId'],
      _count: {
        _all: true
      },
      where: {
        goalsConceded: 0,
        ...(tournamentId ? { match: { tournamentId: parseInt(tournamentId) } } : {})
      }
    });

    const cleanSheetsMap = new Map(
      cleanSheetsData.map(cs => [cs.playerId, cs._count._all])
    );

    // Add clean sheets to player stats
    const enrichedStats = playerStats.map(ps => ({
      ...ps,
      stats: {
        ...ps.stats,
        cleanSheets: cleanSheetsMap.get(ps.player.id) || 0
      }
    }));
    
    // Sort based on filter
    switch (filter) {
      case 'golden-boot':
        enrichedStats.sort((a, b) => b.stats.goalsScored - a.stats.goalsScored);
        break;
      case 'golden-glove':
        enrichedStats.sort((a, b) => b.stats.cleanSheets! - a.stats.cleanSheets!);
        break;
      case 'golden-ball':
      case 'overall':
      default:
        enrichedStats.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
        break;
    }
    
    return { players: enrichedStats };
  } catch { 
    return null; 
  }
}

async function getTournaments() {
  try { return await prisma.tournament.findMany({ select: { id: true, name: true }, orderBy: { startDate: 'desc' } }); }
  catch { return []; }
}

const rankStyles = [
  'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
  'bg-gradient-to-br from-gray-400 to-gray-600 text-white',
  'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
];

async function PlayersLeaderboardContent({ tournamentId, filter }: { tournamentId?: string; filter?: string }) {
  const [data, tournaments] = await Promise.all([getPlayersLeaderboard(tournamentId, filter), getTournaments()]);
  if (!data) notFound();
  const selectedTournament = tournamentId ? tournaments.find((t: any) => t.id === parseInt(tournamentId)) : null;

  const filterTitle = filter === 'golden-boot' ? 'Golden Boot' : filter === 'golden-glove' ? 'Golden Glove' : filter === 'golden-ball' ? 'Golden Ball' : 'Overall Stats';

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Hero */}
      <div className="relative overflow-hidden py-14 sm:py-20" style={{ background: "linear-gradient(180deg,#0D0D0D 0%,#110800 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,183,0,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #FF6600, transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6600] to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFB700]/30 to-transparent" />

        {/* Breadcrumb */}
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-[#555]">
            <li><Link href="/" className="hover:text-[#FFB700] transition-colors">Home</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li><Link href="/leaderboard/players" className="hover:text-[#FFB700] transition-colors">Leaderboard</Link></li>
            <li><span className="text-[#333]">/</span></li>
            <li className="text-[#FFB700] font-semibold">Players</li>
          </ol>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 border border-[#FFB700]/25 text-xs font-bold tracking-widest uppercase text-[#FFB700]" style={{ background: "rgba(255,183,0,0.08)" }}>
            {filter === 'golden-boot' ? '⚽ Golden Boot' : filter === 'golden-glove' ? '🧤 Golden Glove' : filter === 'golden-ball' ? '🏆 Golden Ball' : '👥 Player Rankings'}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 font-['Outfit',sans-serif]">
            {filterTitle}{" "}
            <span style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Leaderboard
            </span>
          </h1>
          <p className="text-[#707070] text-base sm:text-lg">
            {selectedTournament ? selectedTournament.name : 'Overall Rankings — All Tournaments'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-6">
        <TournamentFilter currentTournamentId={tournamentId} tournaments={tournaments} leaderboardType="players" />
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="rounded-2xl border border-[#1E1E1E] p-2" style={{ background: "#111" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link href={`/leaderboard/players${tournamentId ? `?tournament=${tournamentId}` : ''}`} 
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${!filter || filter === 'overall' ? 'bg-gradient-to-br from-[#FF6600] to-[#CC2900]' : 'bg-[#1A1A1A] hover:bg-[#222]'}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(circle at center, rgba(255,183,0,0.15), transparent)" }} />
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className={`text-sm font-bold mb-1 ${!filter || filter === 'overall' ? 'text-white' : 'text-[#707070] group-hover:text-white'}`}>
                  Overall Stats
                </div>
                <div className={`text-xs ${!filter || filter === 'overall' ? 'text-white/70' : 'text-[#555] group-hover:text-[#707070]'}`}>
                  All metrics
                </div>
              </div>
            </Link>

            <Link href={`/leaderboard/players?filter=golden-ball${tournamentId ? `&tournament=${tournamentId}` : ''}`}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${filter === 'golden-ball' ? 'bg-gradient-to-br from-[#FFB700] to-[#FF8C00]' : 'bg-[#1A1A1A] hover:bg-[#222]'}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(circle at center, rgba(255,183,0,0.15), transparent)" }} />
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className={`text-sm font-bold mb-1 ${filter === 'golden-ball' ? 'text-white' : 'text-[#707070] group-hover:text-white'}`}>
                  Golden Ball
                </div>
                <div className={`text-xs ${filter === 'golden-ball' ? 'text-white/70' : 'text-[#555] group-hover:text-[#707070]'}`}>
                  Most points
                </div>
              </div>
            </Link>

            <Link href={`/leaderboard/players?filter=golden-boot${tournamentId ? `&tournament=${tournamentId}` : ''}`}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${filter === 'golden-boot' ? 'bg-gradient-to-br from-[#10B981] to-[#059669]' : 'bg-[#1A1A1A] hover:bg-[#222]'}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(circle at center, rgba(16,185,129,0.15), transparent)" }} />
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-2">⚽</div>
                <div className={`text-sm font-bold mb-1 ${filter === 'golden-boot' ? 'text-white' : 'text-[#707070] group-hover:text-white'}`}>
                  Golden Boot
                </div>
                <div className={`text-xs ${filter === 'golden-boot' ? 'text-white/70' : 'text-[#555] group-hover:text-[#707070]'}`}>
                  Most goals
                </div>
              </div>
            </Link>

            <Link href={`/leaderboard/players?filter=golden-glove${tournamentId ? `&tournament=${tournamentId}` : ''}`}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${filter === 'golden-glove' ? 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]' : 'bg-[#1A1A1A] hover:bg-[#222]'}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(circle at center, rgba(59,130,246,0.15), transparent)" }} />
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-2">🧤</div>
                <div className={`text-sm font-bold mb-1 ${filter === 'golden-glove' ? 'text-white' : 'text-[#707070] group-hover:text-white'}`}>
                  Golden Glove
                </div>
                <div className={`text-xs ${filter === 'golden-glove' ? 'text-white/70' : 'text-[#555] group-hover:text-[#707070]'}`}>
                  Clean sheets
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <PlayersTable players={data.players} />
    </div>
  );
}

export const revalidate = 300;

export default async function PlayersLeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#FF6600] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#707070] text-sm">Loading leaderboard…</p>
        </div>
      </div>
    }>
      <PlayersLeaderboardContent tournamentId={params.tournament} filter={params.filter} />
    </Suspense>
  );
}
