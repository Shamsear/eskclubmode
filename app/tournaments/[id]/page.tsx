import { notFound } from 'next/navigation';
import TournamentDetailClient from '@/components/public/TournamentDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournamentData(id: number) {
  try {
    // Use VERCEL_URL for server-side rendering on Vercel, or NEXT_PUBLIC_BASE_URL for client-side
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/public/tournaments/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch tournament: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tournamentId = parseInt(id);

  if (isNaN(tournamentId)) {
    notFound();
  }

  const data = await getTournamentData(tournamentId);

  if (!data) {
    notFound();
  }

  return <TournamentDetailClient initialData={data} tournamentId={tournamentId} />;
}
