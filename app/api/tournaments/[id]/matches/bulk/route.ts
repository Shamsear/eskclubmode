import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";
import { updatePlayerStatistics } from "@/lib/match-utils";

interface BulkMatch {
  playerAName: string;
  playerBName: string;
  playerAGoals: number;
  playerBGoals: number;
  matchDate: string;
  walkover?: string; // 'normal', 'both', or player name
  playerAExtraPoints?: number;
  playerBExtraPoints?: number;
}

export async function POST(
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

    // Get tournament with participants and point system
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { matches } = body as { matches: BulkMatch[] };

    if (!Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        { error: "No matches provided" },
        { status: 400 }
      );
    }

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];
    const affectedPlayerIds = new Set<number>();

    for (const match of matches) {
      try {
        // Find players by name
        const playerA = tournament.participants.find(
          p => p.player.name.toLowerCase() === match.playerAName.toLowerCase()
        );
        const playerB = tournament.participants.find(
          p => p.player.name.toLowerCase() === match.playerBName.toLowerCase()
        );

        if (!playerA || !playerB) {
          errors.push(`Players not found: ${match.playerAName} vs ${match.playerBName}`);
          skipped++;
          continue;
        }

        // Handle walkover
        const walkover = match.walkover?.toLowerCase() || 'normal';
        let walkoverWinnerId: number | null = null;
        let playerAOutcome: 'WIN' | 'DRAW' | 'LOSS';
        let playerBOutcome: 'WIN' | 'DRAW' | 'LOSS';
        let playerAPoints = 0;
        let playerBPoints = 0;

        if (walkover === 'both') {
          // Both forfeited
          walkoverWinnerId = 0;
          playerAOutcome = 'LOSS';
          playerBOutcome = 'LOSS';
          playerAPoints = 0;
          playerBPoints = 0;
        } else if (walkover === match.playerAName.toLowerCase()) {
          // Player A won by walkover
          walkoverWinnerId = playerA.player.id;
          playerAOutcome = 'WIN';
          playerBOutcome = 'LOSS';
          
          // Get walkover points from template if available
          if (tournament.pointSystemTemplateId) {
            const template = await prisma.pointSystemTemplate.findUnique({
              where: { id: tournament.pointSystemTemplateId },
              select: {
                pointsForWalkoverWin: true,
                pointsForWalkoverLoss: true,
              },
            });
            if (template) {
              playerAPoints = template.pointsForWalkoverWin;
              playerBPoints = template.pointsForWalkoverLoss;
            } else {
              playerAPoints = 3;
              playerBPoints = -3;
            }
          } else {
            playerAPoints = 3;
            playerBPoints = -3;
          }
        } else if (walkover === match.playerBName.toLowerCase()) {
          // Player B won by walkover
          walkoverWinnerId = playerB.player.id;
          playerAOutcome = 'LOSS';
          playerBOutcome = 'WIN';
          
          // Get walkover points from template if available
          if (tournament.pointSystemTemplateId) {
            const template = await prisma.pointSystemTemplate.findUnique({
              where: { id: tournament.pointSystemTemplateId },
              select: {
                pointsForWalkoverWin: true,
                pointsForWalkoverLoss: true,
              },
            });
            if (template) {
              playerBPoints = template.pointsForWalkoverWin;
              playerAPoints = template.pointsForWalkoverLoss;
            } else {
              playerBPoints = 3;
              playerAPoints = -3;
            }
          } else {
            playerBPoints = 3;
            playerAPoints = -3;
          }
        } else {
          // Normal match - determine outcomes by goals
          if (match.playerAGoals > match.playerBGoals) {
            playerAOutcome = 'WIN';
            playerBOutcome = 'LOSS';
          } else if (match.playerAGoals < match.playerBGoals) {
            playerAOutcome = 'LOSS';
            playerBOutcome = 'WIN';
          } else {
            playerAOutcome = 'DRAW';
            playerBOutcome = 'DRAW';
          }

          // Calculate points normally
          const calculatePoints = (outcome: string, goalsScored: number, goalsConceded: number) => {
            let points = 0;
            if (outcome === 'WIN') points += tournament.pointsPerWin;
            else if (outcome === 'DRAW') points += tournament.pointsPerDraw;
            else points += tournament.pointsPerLoss;
            
            points += goalsScored * tournament.pointsPerGoalScored;
            points += goalsConceded * tournament.pointsPerGoalConceded;
            
            return points;
          };

          playerAPoints = calculatePoints(playerAOutcome, match.playerAGoals, match.playerBGoals);
          playerBPoints = calculatePoints(playerBOutcome, match.playerBGoals, match.playerAGoals);
        }

        // Add extra points if provided
        if (match.playerAExtraPoints) {
          playerAPoints += match.playerAExtraPoints;
        }
        if (match.playerBExtraPoints) {
          playerBPoints += match.playerBExtraPoints;
        }

        // Create match with results
        await prisma.match.create({
          data: {
            tournamentId,
            matchDate: new Date(match.matchDate),
            ...(walkoverWinnerId !== null && { walkoverWinnerId }),
            results: {
              create: [
                {
                  playerId: playerA.player.id,
                  outcome: playerAOutcome,
                  goalsScored: match.playerAGoals,
                  goalsConceded: match.playerBGoals,
                  pointsEarned: playerAPoints,
                  basePoints: playerAPoints,
                  conditionalPoints: 0,
                },
                {
                  playerId: playerB.player.id,
                  outcome: playerBOutcome,
                  goalsScored: match.playerBGoals,
                  goalsConceded: match.playerAGoals,
                  pointsEarned: playerBPoints,
                  basePoints: playerBPoints,
                  conditionalPoints: 0,
                },
              ],
            },
          },
        });

        // Track affected players for statistics update
        affectedPlayerIds.add(playerA.player.id);
        affectedPlayerIds.add(playerB.player.id);

        added++;
      } catch (error) {
        errors.push(`Failed to add match ${match.playerAName} vs ${match.playerBName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }

    // Update statistics for all affected players
    if (affectedPlayerIds.size > 0) {
      await updatePlayerStatistics(tournamentId, Array.from(affectedPlayerIds));
    }

    return NextResponse.json({
      success: true,
      added,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully added ${added} match(es)`,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
