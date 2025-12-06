import { PlayerProfileSkeleton } from '@/components/public/PublicSkeletons';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PlayerProfileSkeleton />
    </div>
  );
}
