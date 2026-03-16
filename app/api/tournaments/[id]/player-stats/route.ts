import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";
import { getPlayerStatsWithClub } from "@/lib/stats-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const tournamentId = parseInt(id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    // Get stats calculated from match results with transfer date awareness
    const playerStatsData = await getPlayerStatsWithClub(tournamentId);

    // Get clean sheets for this tournament
    const cleanSheetsData = await prisma.matchResult.groupBy({
      by: ['playerId'],
      _count: {
        _all: true
      },
      where: {
        goalsConceded: 0,
        match: {
          tournamentId
        }
      }
    });

    const cleanSheetsMap = new Map(
      cleanSheetsData.map(cs => [cs.playerId, cs._count._all])
    );

    // Transform the data to match the Player interface
    const players = playerStatsData.map((data) => {
      const goalDifference = data.stats.goalsScored - data.stats.goalsConceded;
      const winRate = data.stats.matchesPlayed > 0 
        ? (data.stats.wins / data.stats.matchesPlayed) * 100 
        : 0;
      const avgPointsPerMatch = data.stats.matchesPlayed > 0 
        ? data.stats.totalPoints / data.stats.matchesPlayed 
        : 0;
      const avgGoalsPerMatch = data.stats.matchesPlayed > 0 
        ? data.stats.goalsScored / data.stats.matchesPlayed 
        : 0;
      const cleanSheets = cleanSheetsMap.get(data.player.id) || 0;

      return {
        id: data.player.id,
        name: data.player.name,
        email: data.player.email,
        photo: data.player.photo,
        club: data.player.club,
        totalPoints: data.stats.totalPoints,
        totalMatches: data.stats.matchesPlayed,
        totalWins: data.stats.wins,
        totalDraws: data.stats.draws,
        totalLosses: data.stats.losses,
        totalGoalsScored: data.stats.goalsScored,
        totalGoalsConceded: data.stats.goalsConceded,
        cleanSheets,
        goalDifference,
        winRate: parseFloat(winRate.toFixed(1)),
        avgPointsPerMatch: parseFloat(avgPointsPerMatch.toFixed(2)),
        avgGoalsPerMatch: parseFloat(avgGoalsPerMatch.toFixed(2)),
        tournamentsPlayed: 1, // For a specific tournament, it's always 1
      };
    });

    // Sort by total points, then win rate, then goal difference
    players.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.goalDifference - a.goalDifference;
    });

    return NextResponse.json({
      success: true,
      players,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
