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
import { StaggerContainer, StaggerItem, AnimatedContainer } from '@/lib/animations';

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
      {/* Search Bar - Full Width */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tournaments by name..."
          onClear={handleClearSearch}
        />
      </div>

      {/* Main Content: Tournament List + Sidebar Filter */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tournament List - Left Side */}
        <div className="flex-1">
          {/* Results Count */}
          {!loading && (
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-[#1A1A1A]">
                <span className="font-semibold">{paginatedTournaments.length}</span> of <span className="font-semibold">{filteredTournaments.length}</span> tournaments
                {(searchQuery || activeFilterCount > 0) && (
                  <span className="ml-2 text-[#FF6600] font-medium">
                    (filtered from {allTournaments.length} total)
                  </span>
                )}
              </div>
              {(searchQuery || activeFilterCount > 0) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-[#FF6600] hover:text-[#CC2900] font-medium transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Tournament Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-[#FFB700]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#FF6600]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No tournaments found
            </h3>
            <p className="text-gray-600">
              There are no tournaments available at the moment.
            </p>
          </div>
        )
      ) : (
        <>
            <StaggerContainer speed="fast">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {paginatedTournaments.map((tournament, index) => (
                <StaggerItem key={tournament.id}>
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="group block h-full"
                  >
                    <div className="h-full bg-white rounded-xl border-2 border-gray-200 hover:border-[#FFB700] transition-all duration-300 overflow-hidden hover:scale-105 hover:-translate-y-1">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#FF6600] transition-colors line-clamp-2 flex-1">
                            <HighlightedText text={tournament.name} highlight={searchQuery} />
                          </h3>
                          <StatusBadge status={tournament.status} size="sm" />
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 flex-shrink-0 text-[#FF6600]"
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
                            <span className="text-xs">
                              {formatDate(tournament.startDate)}
                              {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <div className="w-6 h-6 bg-[#FFB700]/10 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-3.5 h-3.5 text-[#FF6600]"
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
                              </div>
                              <span className="font-medium">{tournament.participantCount}</span>
                              <span>players</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <div className="w-6 h-6 bg-[#FFB700]/10 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-3.5 h-3.5 text-[#FF6600]"
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
                              </div>
                              <span className="font-medium">{tournament.matchCount}</span>
                              <span>matches</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t-2 border-[#FFB700]/20">
                          <span className="text-sm font-semibold text-[#FF6600] group-hover:text-[#CC2900] flex items-center gap-2 transition-colors">
                            View Tournament
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
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
              </div>
            </StaggerContainer>

            {/* Pagination */}
            {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-[#1A1A1A] hover:border-[#FFB700] hover:bg-[#FFB700]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
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
                          w-10 h-10 rounded-lg font-semibold transition-all
                          ${
                            page === pageNum
                              ? 'bg-[#FF6600] text-white border-2 border-[#FFB700] scale-110'
                              : 'bg-white border-2 border-gray-200 text-[#1A1A1A] hover:border-[#FFB700] hover:bg-[#FFB700]/5'
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
                      <span key={pageNum} className="text-gray-400 font-bold">
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
                className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-[#1A1A1A] hover:border-[#FFB700] hover:bg-[#FFB700]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
            )}
          </>
          )}
        </div>

        {/* Filter Sidebar - Right Side */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-20">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
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
        </aside>
      </div>

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
