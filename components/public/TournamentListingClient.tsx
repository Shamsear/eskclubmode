'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PublicCard, CardContent } from './PublicCard';
import { StatusBadge } from './Badge';
import { PublicSkeletons } from './PublicSkeletons';
import { SearchBar, HighlightedText } from './SearchBar';
import { FilterPanel, FilterConfig } from './FilterPanel';
import { SearchEmptyState, FilterEmptyState } from './EmptyState';
import { applyFilters, getActiveFilterCount } from '@/lib/utils/filterUtils';

interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string | null;
  participantCount: number;
  matchCount: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface TournamentListResponse {
  tournaments: Tournament[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export default function TournamentListingClient() {
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterConfig>({});
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tournaments for client-side filtering
      const response = await fetch(`/api/public/tournaments?page=1&pageSize=1000`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }

      const data: TournamentListResponse = await response.json();
      setAllTournaments(data.tournaments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters with AND logic
  const filteredTournaments = useMemo(() => {
    const filterConfig = {
      ...filters,
      search: searchQuery,
    };
    
    return applyFilters(allTournaments, filterConfig, ['name']);
  }, [allTournaments, filters, searchQuery]);

  // Paginate filtered results
  const paginatedTournaments = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTournaments.slice(startIndex, endIndex);
  }, [filteredTournaments, page]);

  const totalPages = Math.ceil(filteredTournaments.length / pageSize);
  const activeFilterCount = getActiveFilterCount(filters);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Error loading tournaments</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchTournaments}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Search Bar */}
        <div className="lg:col-span-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tournaments by name..."
            onClear={handleClearSearch}
          />
        </div>

        {/* Filter Panel */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            filterSections={[
              {
                id: 'status',
                title: 'Status',
                type: 'checkbox',
                options: [
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                ],
              },
              {
                id: 'participantCount',
                title: 'Participants',
                type: 'range',
                min: 0,
                max: 100,
              },
            ]}
          />
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {paginatedTournaments.length} of {filteredTournaments.length} tournaments
          {(searchQuery || activeFilterCount > 0) && (
            <span className="ml-2 text-primary-600 font-medium">
              (filtered from {allTournaments.length} total)
            </span>
          )}
        </div>
      )}

      {/* Tournament Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <PublicSkeletons.Card key={i} />
          ))}
        </div>
      ) : paginatedTournaments.length === 0 ? (
        searchQuery ? (
          <SearchEmptyState
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
          />
        ) : activeFilterCount > 0 ? (
          <FilterEmptyState
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tournaments found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no tournaments available at the moment.
            </p>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedTournaments.map((tournament, index) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="group"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <PublicCard
                  hover
                  className="h-full transition-all duration-300 group-hover:border-primary-300"
                >
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        <HighlightedText text={tournament.name} highlight={searchQuery} />
                      </h3>
                      <StatusBadge status={tournament.status} size="sm" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {formatDate(tournament.startDate)}
                          {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span>{tournament.participantCount} players</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span>{tournament.matchCount} matches</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
                        View Details
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </CardContent>
                </PublicCard>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`
                          w-10 h-10 rounded-lg font-medium transition-colors
                          ${
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                        aria-label={`Page ${pageNum}`}
                        aria-current={page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span key={pageNum} className="text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
