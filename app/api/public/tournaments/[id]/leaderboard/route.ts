import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";

// GET /api/public/tournaments/[id]/leaderboard - Get tournament leaderboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = parseInt(id);

    if (isNaN(tournamentId)) {
      throw new ValidationError("Invalid tournament ID");
    }

    // Verify tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Get player stats with player and club information
    const playerStats = await prisma.tournamentPlayerStats.findMany({
      where: {
        tournamentId: tournamentId,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            photo: true,
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: [
        { totalPoints: "desc" },
        { goalsScored: "desc" },
        { goalsConceded: "asc" },
      ],
    });

    // Transform and rank players
    const rankings = playerStats.map((stat, index) => {
      const goalDifference = stat.goalsScored - stat.goalsConceded;

      return {
        rank: index + 1,
        player: {
          id: stat.player.id,
          name: stat.player.name,
          photo: stat.player.photo,
          club: stat.player.club,
        },
        stats: {
          matchesPlayed: stat.matchesPlayed,
          wins: stat.wins,
          draws: stat.draws,
          losses: stat.losses,
          goalsScored: stat.goalsScored,
          goalsConceded: stat.goalsConceded,
          goalDifference,
          totalPoints: stat.totalPoints,
        },
      };
    });

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
      },
      rankings,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
