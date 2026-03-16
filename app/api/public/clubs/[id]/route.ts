import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, NotFoundError, ValidationError } from "@/lib/errors";
import { calculatePlayerStatsByClub, calculateClubStats } from "@/lib/stats-utils";

// GET /api/public/clubs/[id] - Get club profile with members and tournaments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clubId = parseInt(id);

    if (isNaN(clubId)) {
      throw new ValidationError("Invalid club ID");
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        players: {
          include: {
            roles: {
              select: {
                role: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
        tournaments: {
          include: {
            _count: {
              select: {
                participants: true,
                matches: true,
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundError("Club");
    }

    // Get stats for each player based on transfer dates
    const playersWithStats = await Promise.all(
      club.players.map(async (player) => {
        // Get stats for this player across all clubs
        const allClubStats = await calculatePlayerStatsByClub(player.id);
        
        // Sum up all stats (regardless of club)
        const totalMatches = allClubStats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
        const totalWins = allClubStats.reduce((sum, stat) => sum + stat.wins, 0);
        const totalPoints = allClubStats.reduce((sum, stat) => sum + stat.totalPoints, 0);
        const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

        return {
          id: player.id,
          name: player.name,
          photo: player.photo,
          roles: player.roles.map((r) => r.role),
          stats: {
            totalMatches,
            totalPoints,
            winRate: Math.round(winRate * 100) / 100,
          },
        };
      })
    );

    // Transform tournaments
    const now = new Date();
    const tournaments = club.tournaments.map((tournament) => {
      let status: "upcoming" | "active" | "completed";
      if (tournament.startDate > now) {
        status = "upcoming";
      } else if (!tournament.endDate || tournament.endDate >= now) {
        status = "active";
      } else {
        status = "completed";
      }

      return {
        id: tournament.id,
        name: tournament.name,
        startDate: tournament.startDate.toISOString(),
        endDate: tournament.endDate?.toISOString() || null,
        participantCount: tournament._count.participants,
        matchCount: tournament._count.matches,
        status,
      };
    });

    // Calculate aggregate club stats based on transfer dates
    const clubStatsData = await calculateClubStats(clubId);

    const totalMatches = await prisma.match.count({
      where: {
        tournament: {
          clubId: clubId,
        },
      },
    });

    const response = {
      club: {
        id: club.id,
        name: club.name,
        logo: club.logo,
        description: club.description,
        createdAt: club.createdAt.toISOString(),
      },
      players: playersWithStats,
      tournaments,
      stats: {
        totalPlayers: club.players.length,
        totalTournaments: club.tournaments.length,
        totalMatches,
        totalGoals: clubStatsData.goalsScored,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return createErrorResponse(error);
  }
}
