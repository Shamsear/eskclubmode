import { notFound } from 'next/navigation';
import { MatchTheater } from '@/components/public/MatchTheater';

interface MatchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getMatchData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/public/matches/${id}`, {
      cache: 'no-store',
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

  return <MatchTheater data={data} />;
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
