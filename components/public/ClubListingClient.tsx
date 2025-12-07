'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card3D } from './PublicCard';
import { AchievementBadge } from './Badge';
import { PublicSkeletons } from './PublicSkeletons';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface Club {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  playerCount: number;
  tournamentCount: number;
  achievements: Array<{
    type: 'tournament_win' | 'top_scorer' | 'most_active';
    label: string;
  }>;
}

interface ClubListResponse {
  clubs: Club[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export default function ClubListingClient() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchClubs();
  }, [page]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/clubs?page=${page}&pageSize=12`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }

      const data: ClubListResponse = await response.json();
      setClubs(data.clubs);
      setTotalPages(Math.ceil(data.pagination.total / data.pagination.pageSize));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClubClick = (clubId: number) => {
    router.push(`/clubs/${clubId}`);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Error loading clubs</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <button
            onClick={fetchClubs}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clubs by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF6600] focus:border-[#FFB700] transition-colors text-[#1A1A1A] placeholder-gray-400"
            aria-label="Search clubs"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#FF6600]"
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
      {!loading && filteredClubs.length > 0 && (
        <div className="text-sm text-[#1A1A1A]">
          Showing <span className="font-semibold">{filteredClubs.length}</span> {filteredClubs.length === 1 ? 'club' : 'clubs'}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <PublicSkeletons.ClubCard key={i} />
          ))}
        </div>
      )}

      {/* Clubs Grid */}
      {!loading && filteredClubs.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClubs.map((club, index) => (
              <div
                key={club.id}
                onClick={() => handleClubClick(club.id)}
                className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#FFB700] transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                  opacity: 0,
                }}
              >
                <div className="p-6">
                  {/* Club Logo */}
                  <div className="flex justify-center mb-4">
                    {club.logo ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FFB700] group-hover:scale-110 transition-transform duration-300">
                        <OptimizedImage
                          src={club.logo}
                          alt={`${club.name} logo`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#FF6600] flex items-center justify-center border-2 border-[#FFB700] group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl font-bold text-white">
                          {club.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Club Name */}
                  <h3 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#FF6600] transition-colors text-center mb-2">
                    {club.name}
                  </h3>

                  {/* Club Description */}
                  {club.description && (
                    <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2 min-h-[40px]">
                      {club.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex justify-around items-center py-4 border-t-2 border-b-2 border-[#FFB700]/20 my-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#FF6600]">
                        {club.playerCount}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">Players</p>
                    </div>
                    <div className="w-px h-12 bg-[#FFB700]/30" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#FF6600]">
                        {club.tournamentCount}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">Tournaments</p>
                    </div>
                  </div>

                  {/* Achievements */}
                  {club.achievements.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {club.achievements.map((achievement, idx) => (
                        <AchievementBadge
                          key={idx}
                          type={achievement.type}
                          label={achievement.label}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

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
              <span className="px-4 py-2 text-[#1A1A1A] font-semibold">
                Page {page} of {totalPages}
              </span>
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

      {/* Empty State */}
      {!loading && filteredClubs.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-[#FFB700]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
            No clubs found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'No clubs are available at the moment'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-[#FF6600] text-white rounded-lg hover:bg-[#CC2900] transition-colors font-semibold border-t-2 border-[#FFB700]"
            >
              Clear Search
            </button>
          )}
        </div>
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
