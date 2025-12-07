import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { MatchTheater } from '@/components/public/MatchTheater';
import { PublicSkeletons } from '@/components/public/PublicSkeletons';
import { PerformanceMonitor } from '@/components/public/PerformanceMonitor';

interface MatchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getMatchData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/public/matches/${id}`, {
      // Use revalidation instead of no-store for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch match data');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching match data:', error);
    throw error;
  }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const data = await getMatchData(id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <PerformanceMonitor pageName={`match-${id}`} />
      <Suspense fallback={<PublicSkeletons.MatchTheater />}>
        <MatchTheater data={data} />
      </Suspense>
    </>
  );
}

export async function generateMetadata({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const data = await getMatchData(id);

  if (!data) {
    return {
      title: 'Match Not Found',
    };
  }

  const matchDate = new Date(data.match.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title: `Match #${data.match.id} - ${data.match.tournament.name} | ${matchDate}`,
    description: `View detailed match results and player performances for ${data.match.tournament.name} on ${matchDate}`,
  };
}
