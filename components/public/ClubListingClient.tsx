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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Club Universe
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
          Explore clubs through immersive 3D cards and discover their achievements
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Search clubs"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[...Array(6)].map((_, i) => (
            <PublicSkeletons.ClubCard key={i} />
          ))}
        </div>
      )}

      {/* Clubs Grid */}
      {!loading && filteredClubs.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredClubs.map((club, index) => (
              <div
                key={club.id}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                <Card3D
                  onClick={() => handleClubClick(club.id)}
                  className="h-full"
                >
                <div className="p-6">
                  {/* Club Logo */}
                  <div className="flex justify-center mb-4">
                    {club.logo ? (
                      <OptimizedImage
                        src={club.logo}
                        alt={`${club.name} logo`}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {club.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Club Name */}
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    {club.name}
                  </h3>

                  {/* Club Description */}
                  {club.description && (
                    <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex justify-around items-center py-4 border-t border-b border-gray-200 my-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {club.playerCount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Players</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {club.tournamentCount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Tournaments</p>
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
              </Card3D>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 sm:mt-12 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
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

      {/* Empty State */}
      {!loading && filteredClubs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
