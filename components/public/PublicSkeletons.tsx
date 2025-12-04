'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
}

// Tournament Card Skeleton
export function TournamentCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 shadow-md p-6"
        >
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// Match Theater Skeleton
export function MatchTheaterSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Match Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-8 w-12" />
              </div>
              <div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-8 w-12" />
              </div>
              <div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Leaderboard Skeleton
export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="p-4 flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="hidden md:flex gap-8">
              <div>
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
              <div>
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
              <div>
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Player Profile Skeleton
export function PlayerProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-32 w-32 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Match History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <Skeleton className="h-4 w-24" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Club Card Skeleton
export function ClubCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 shadow-md p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Stat Card Skeleton
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border-2 border-gray-200 p-6"
        >
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// Tournament Journey Skeleton
export function TournamentJourneySkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 border border-gray-200 rounded-lg p-4"
          >
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Export all skeletons as a namespace
export const PublicSkeletons = {
  Card: CardSkeleton,
  TournamentCard: TournamentCardSkeleton,
  MatchTheater: MatchTheaterSkeleton,
  Leaderboard: LeaderboardSkeleton,
  PlayerProfile: PlayerProfileSkeleton,
  ClubCard: ClubCardSkeleton,
  StatCard: StatCardSkeleton,
  TournamentJourney: TournamentJourneySkeleton,
};
