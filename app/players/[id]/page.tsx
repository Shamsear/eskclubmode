import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/public/PlayerProfileClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlayerData(id: number) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/players/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch player');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    notFound();
  }

  const data = await getPlayerData(playerId);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PlayerProfileClient initialData={data} />
    </div>
  );
}
