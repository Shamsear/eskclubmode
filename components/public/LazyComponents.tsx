'use client';

import dynamic from 'next/dynamic';
import { PublicSkeletons } from './PublicSkeletons';
import { CompactErrorFallback } from './PublicErrorBoundary';

/**
 * Lazy-loaded Player Constellation component
 * Heavy D3.js visualization - only load when needed
 */
export const LazyPlayerConstellation = dynamic(
  () => import('./PlayerConstellation'),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4" />
              <p className="text-gray-600">Loading constellation view...</p>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for D3.js component
  }
);

/**
 * Lazy-loaded Performance Heatmap component
 * Heavy visualization - only load when needed
 */
export const LazyPerformanceHeatmap = dynamic(
  () => import('./PerformanceHeatmap'),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-[300px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-purple-600 mb-3" />
              <p className="text-gray-600 text-sm">Loading heatmap...</p>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Lazy-loaded Match Theater component
 * Complex component with animations
 */
export const LazyMatchTheater = dynamic(
  () => import('./MatchTheater').then(mod => mod.MatchTheater),
  {
    loading: () => <PublicSkeletons.MatchTheater />,
  }
);

/**
 * Lazy-loaded Leaderboard Stream component
 * Can be large with many entries
 */
export const LazyLeaderboardStream = dynamic(
  () => import('./LeaderboardStream'),
  {
    loading: () => <PublicSkeletons.Leaderboard count={10} />,
  }
);

/**
 * Lazy-loaded Tournament Journey Map component
 */
export const LazyTournamentJourneyMap = dynamic(
  () => import('./TournamentJourneyMap'),
  {
    loading: () => <PublicSkeletons.TournamentJourney />,
  }
);

/**
 * Generic lazy component wrapper with custom loading state
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent?: React.ComponentType
) {
  return dynamic(importFn, {
    loading: LoadingComponent
      ? () => <LoadingComponent />
      : () => (
          <div className="flex items-center justify-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
          </div>
        ),
  });
}

/**
 * Lazy component with error boundary
 */
export function createLazyComponentWithError<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent?: React.ComponentType,
  ErrorComponent?: React.ComponentType<{ error?: Error; onReset?: () => void }>
) {
  const LazyComponent = dynamic(importFn, {
    loading: LoadingComponent
      ? () => <LoadingComponent />
      : () => (
          <div className="flex items-center justify-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
          </div>
        ),
  });

  return function LazyComponentWithError(props: P) {
    const ErrorWrapper = ErrorComponent || CompactErrorFallback;
    return (
      <ErrorWrapper>
        <LazyComponent {...props} />
      </ErrorWrapper>
    );
  };
}
