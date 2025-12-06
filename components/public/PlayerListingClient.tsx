'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicCard } from './PublicCard';
import { RoleBadge } from './Badge';
import { PlayerProfileSkeleton } from './PublicSkeletons';

interface Player {
  id: number;
  name: string;
  photo: string | null;
  place: string | null;
  club: {
    id: number;
    name: string;
    logo: string | null;
  };
  roles: Array<'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'>;
  stats: {
    totalMatches: number;
    totalPoints: number;
    totalGoalsScored: number;
    winRate: number;
  };
}

interface PlayerListingResponse {
  players: Player[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export default function PlayerListingClient() {
  const router = useRouter();
  const [data, setData] = useState<PlayerListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: '20',
        });

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        const response = await fetch(`/api/public/players?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [debouncedSearch, page]);

  const handlePlayerClick = (playerId: number) => {
    router.push(`/players/${playerId}`);
  };

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.pageSize) : 0;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Error loading players</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search players by name, email, or place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search players"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Results Count */}
      {data && !loading && (
        <div className="text-sm text-gray-600">
          Showing {data.players.length} of {data.pagination.total} players
        </div>
      )}

      {/* Player Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <PlayerProfileSkeleton key={i} />
          ))}
        </div>
      ) : data && data.players.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.players.map((player) => (
            <PublicCard
              key={player.id}
              hover
              padding="none"
              onClick={() => handlePlayerClick(player.id)}
              className="overflow-hidden"
            >
              {/* Player Photo */}
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                {player.photo ? (
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {player.name}
                  </h3>
                  {player.place && (
                    <p className="text-sm text-gray-600 truncate">{player.place}</p>
                  )}
                </div>

                {/* Club */}
                <div className="flex items-center gap-2">
                  {player.club.logo ? (
                    <img
                      src={player.club.logo}
                      alt={player.club.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        {player.club.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {player.club.name}
                  </span>
                </div>

                {/* Roles */}
                <div className="flex flex-wrap gap-1.5">
                  {player.roles.map((role) => (
                    <RoleBadge key={role} role={role} size="sm" />
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {player.stats.totalMatches}
                    </div>
                    <div className="text-xs text-gray-600">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {player.stats.totalPoints}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {player.stats.winRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Win Rate</div>
                  </div>
                </div>
              </div>
            </PublicCard>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg
            className="mx-auto w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600 font-medium">No players found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your search criteria
          </p>
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
