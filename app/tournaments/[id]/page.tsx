import { notFound } from 'next/navigation';
import TournamentDetailClient from '@/components/public/TournamentDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournamentData(id: number) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/tournaments/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch tournament');
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
