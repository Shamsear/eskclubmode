import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PlayersListClient } from "@/components/PlayersListClient";
import { getClubBasic } from "@/lib/data/clubs";
import { getPlayersByClub } from "@/lib/data/players";

interface Player {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  place?: string | null;
  dateOfBirth?: string | null;
  photo?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    id: number;
    role: string;
  }>;
}

interface Club {
  id: number;
  name: string;
}

export default async function PlayersListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();

  const { id } = await params;
  const club = await getClubBasic(id);
  
  if (!club) {
    notFound();
  }

  const result = await getPlayersByClub(id);
  const players: Player[] = result.players;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/clubs/${id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {club.name}
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            <p className="text-gray-600 mt-1">
              Manage all team members for {club.name}
            </p>
          </div>
          <Link href={`/dashboard/clubs/${id}/players/new`}>
            <Button variant="primary">Add Player</Button>
          </Link>
        </div>
      </div>

      <PlayersListClient players={players} clubId={id} />
    </div>
  );
}
