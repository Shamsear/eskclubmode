'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PlayerStats {
  player: { id: number; name: string; photo: string | null; club: { id: number; name: string; logo: string | null } | null };
  stats: { matchesPlayed: number; wins: number; draws: number; losses: number; goalsScored: number; goalsConceded: number; totalPoints: number; winRate: number; cleanSheets?: number };
}

const rankStyles = [
  'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
  'bg-gradient-to-br from-gray-400 to-gray-600 text-white',
  'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
];

export default function PlayersTable({ players }: { players: PlayerStats[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter players based on search query
  const filteredPlayers = players.filter(player => {
    const query = searchQuery.toLowerCase();
    const playerName = player.player.name.toLowerCase();
    const clubName = player.player.club?.name.toLowerCase() || 'free agent';
    return playerName.includes(query) || clubName.includes(query);
  });

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#707070]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by player name or club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#1E1E1E] bg-[#111] text-white placeholder-[#555] focus:outline-none focus:border-[#FF6600] transition-colors text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#707070] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-[#707070]">
            Found {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Desktop Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 hidden md:block">
        <div className="rounded-2xl overflow-hidden border border-[#1E1E1E]" style={{ background: "#111" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(90deg,#FF6600,#CC2900)" }}>
                  {['Rank', 'Player', 'Matches', 'W / D / L', 'Goals', 'Clean Sheets', 'Win Rate', 'Points'].map(h => (
                    <th key={h} className={`px-5 py-4 text-xs font-bold text-white uppercase tracking-widest ${h === 'Rank' || h === 'Player' ? 'text-left' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((item, index) => (
                  <tr key={item.player.id} className="border-t border-[#1A1A1A] hover:bg-[#FF6600]/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${index < 3 ? rankStyles[index] : 'bg-[#1A1A1A] text-[#707070]'}`}>{index + 1}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/players/${item.player.id}`} className="flex items-center gap-3 group">
                        {item.player.photo ? (
                          <img src={item.player.photo} alt={item.player.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#FF6600]/40 group-hover:border-[#FF6600] transition-colors" />
                        ) : (
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>
                            {item.player.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white group-hover:text-[#FFB700] transition-colors text-sm">{item.player.name}</div>
                          <div className="text-[#555] text-xs mt-0.5">{item.player.club?.name || 'Free Agent'}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-center text-white font-semibold text-sm">{item.stats.matchesPlayed}</td>
                    <td className="px-5 py-4 text-center text-sm">
                      <span className="text-green-400 font-semibold">{item.stats.wins}</span>
                      <span className="text-[#333] mx-1">/</span>
                      <span className="text-yellow-400 font-semibold">{item.stats.draws}</span>
                      <span className="text-[#333] mx-1">/</span>
                      <span className="text-red-400 font-semibold">{item.stats.losses}</span>
                    </td>
                    <td className="px-5 py-4 text-center text-white font-semibold text-sm">{item.stats.goalsScored}–{item.stats.goalsConceded}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold" style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>
                        🧤 {item.stats.cleanSheets || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-[#FFB700] font-bold text-sm">{item.stats.winRate.toFixed(1)}%</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {item.stats.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:hidden">
        <div className="space-y-3">
          {filteredPlayers.map((item, index) => (
            <Link key={item.player.id} href={`/players/${item.player.id}`} className="block rounded-2xl border border-[#1E1E1E] bg-[#111] hover:border-[#FF6600]/40 transition-all duration-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${index < 3 ? rankStyles[index] : 'bg-[#1A1A1A] text-[#707070]'}`}>{index + 1}</div>
                  <div className="text-right">
                    <div className="text-2xl font-black" style={{ background: "linear-gradient(135deg,#FFB700,#FF6600)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{item.stats.totalPoints}</div>
                    <div className="text-[#555] text-xs">pts</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {item.player.photo ? (
                    <img src={item.player.photo} alt={item.player.name} className="w-11 h-11 rounded-full object-cover border-2 border-[#FF6600]/40 flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6600,#CC2900)" }}>{item.player.name.charAt(0)}</div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate text-sm">{item.player.name}</div>
                    <div className="text-[#555] text-xs truncate">{item.player.club?.name || 'Free Agent'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1A1A1A] text-center">
                  <div>
                    <div className="text-[#555] text-xs mb-0.5">Matches</div>
                    <div className="text-white font-bold text-sm">{item.stats.matchesPlayed}</div>
                  </div>
                  <div>
                    <div className="text-[#555] text-xs mb-0.5">W/D/L</div>
                    <div className="text-xs font-semibold">
                      <span className="text-green-400">{item.stats.wins}</span>/
                      <span className="text-yellow-400">{item.stats.draws}</span>/
                      <span className="text-red-400">{item.stats.losses}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#555] text-xs mb-0.5">Win Rate</div>
                    <div className="text-[#FFB700] font-bold text-sm">{item.stats.winRate.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div>
                    <div className="text-[#555] text-xs mb-0.5">Goals</div>
                    <div className="text-white font-bold text-sm">{item.stats.goalsScored}–{item.stats.goalsConceded}</div>
                  </div>
                  <div>
                    <div className="text-[#555] text-xs mb-0.5">Clean Sheets</div>
                    <div className="text-[#3B82F6] font-bold text-sm">{item.stats.cleanSheets || 0}</div>
                  </div>
                  <div>
                    <div className="text-[#555] text-xs mb-0.5">Goal Diff</div>
                    <div className={`font-bold text-sm ${(item.stats.goalsScored - item.stats.goalsConceded) > 0 ? 'text-green-400' : (item.stats.goalsScored - item.stats.goalsConceded) < 0 ? 'text-red-400' : 'text-[#555]'}`}>
                      {(item.stats.goalsScored - item.stats.goalsConceded) > 0 ? '+' : ''}{item.stats.goalsScored - item.stats.goalsConceded}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center py-16 rounded-2xl border border-[#1E1E1E]" style={{ background: "#111" }}>
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No players found</h3>
            <p className="text-[#707070]">Try adjusting your search query</p>
          </div>
        </div>
      )}
    </>
  );
}
