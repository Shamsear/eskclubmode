import { MatchTheaterSkeleton } from '@/components/public/PublicSkeletons';

export default function MatchDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-white/20 rounded mb-6" />
            <div className="text-center">
              <div className="h-12 w-64 bg-white/20 rounded mx-auto mb-4" />
              <div className="h-6 w-96 bg-white/20 rounded mx-auto mb-6" />
              <div className="h-4 w-80 bg-white/20 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MatchTheaterSkeleton />
        </div>
      </div>
    </div>
  );
}
