import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    notFound();
  }

  // Fetch player to get their club ID
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      clubId: true,
    },
  });

  if (!player) {
    notFound();
  }

  // Redirect to the player's detail page within their club context
  redirect(`/dashboard/clubs/${player.clubId}/players/${playerId}`);
}
