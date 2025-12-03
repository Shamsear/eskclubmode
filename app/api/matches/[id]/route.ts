import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchUpdateSchema } from "@/lib/validations/match";
import { calculatePointsWithRules, updatePlayerStatistics, PointSystemConfig } from "@/lib/match-utils";
import {
  createErrorResponse,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

// GET /api/matches/[id] - Get a single match by ID
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
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            clubId: true,
            pointSystemTemplateId: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
          },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                photo: true,
              },
            },
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundError("Match");
    }

    return NextResponse.json(match);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// PUT /api/matches/[id] - Update a match and its results
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    const body = await request.json();

    // Validate request body
    const validationResult = matchUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { matchDate, stageId, stageName, results } = validationResult.data;

    // Check if match exists and get tournament info with point system template
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            pointSystemTemplateId: true,
            pointsPerWin: true,
            pointsPerDraw: true,
            pointsPerLoss: true,
            pointsPerGoalScored: true,
            pointsPerGoalConceded: true,
          },
        },
        results: {
          select: {
            playerId: true,
          },
        },
      },
    });

    if (!existingMatch) {
      throw new NotFoundError("Match");
    }

    const tournamentId = existingMatch.tournament.id;
    const oldPlayerIds = existingMatch.results.map(r => r.playerId);

    // If results are being updated, verify all players are participants
    let newPlayerIds: number[] = [];
    let resultsWithPoints: any[] = [];

    if (results) {
      newPlayerIds = results.map(r => r.playerId);

      const participants = await prisma.tournamentParticipant.findMany({
        where: {
          tournamentId,
          playerId: { in: newPlayerIds },
        },
        include: {
          player: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (participants.length !== newPlayerIds.length) {
        const participantIds = participants.map(p => p.playerId);
        const nonParticipantIds = newPlayerIds.filter(id => !participantIds.includes(id));

        // Get player names for better error message
        const nonParticipantPlayers = await prisma.player.findMany({
          where: { id: { in: nonParticipantIds } },
          select: { id: true, name: true },
        });

        const playerNames = nonParticipantPlayers.map(p => p.name).join(", ");
        throw new ValidationError(
          `Player(s) ${playerNames} are not participants in this tournament`
        );
      }

      // Fetch point system configuration (stage-specific, template, or inline)
      let pointSystemConfig: PointSystemConfig;
      
      // Determine which stage to use (updated stageId or existing one)
      const effectiveStageId = stageId !== undefined ? stageId : existingMatch.stageId;
      
      // If a stage is selected, try to use stage-specific points
      if (effectiveStageId && existingMatch.tournament.pointSystemTemplateId) {
        const stagePoint = await prisma.stagePoint.findFirst({
          where: {
            id: effectiveStageId,
            pointSystemTemplateId: existingMatch.tournament.pointSystemTemplateId,
          },
        });

        if (stagePoint) {
          // Use stage-specific points
          pointSystemConfig = {
            pointsPerWin: stagePoint.pointsPerWin,
            pointsPerDraw: stagePoint.pointsPerDraw,
            pointsPerLoss: stagePoint.pointsPerLoss,
            pointsPerGoalScored: stagePoint.pointsPerGoalScored,
            pointsPerGoalConceded: stagePoint.pointsPerGoalConceded,
          };
        } else {
          // Stage not found, fall back to template defaults
          const template = await prisma.pointSystemTemplate.findUnique({
            where: { id: existingMatch.tournament.pointSystemTemplateId },
            include: {
              conditionalRules: true,
            },
          });

          if (template) {
            pointSystemConfig = {
              pointsPerWin: template.pointsPerWin,
              pointsPerDraw: template.pointsPerDraw,
              pointsPerLoss: template.pointsPerLoss,
              pointsPerGoalScored: template.pointsPerGoalScored,
              pointsPerGoalConceded: template.pointsPerGoalConceded,
              conditionalRules: template.conditionalRules,
            };
          } else {
            // Fallback to inline configuration if template not found
            pointSystemConfig = {
              pointsPerWin: existingMatch.tournament.pointsPerWin,
              pointsPerDraw: existingMatch.tournament.pointsPerDraw,
              pointsPerLoss: existingMatch.tournament.pointsPerLoss,
              pointsPerGoalScored: existingMatch.tournament.pointsPerGoalScored,
              pointsPerGoalConceded: existingMatch.tournament.pointsPerGoalConceded,
            };
          }
        }
      } else if (existingMatch.tournament.pointSystemTemplateId) {
        // Use point system template with conditional rules
        const template = await prisma.pointSystemTemplate.findUnique({
          where: { id: existingMatch.tournament.pointSystemTemplateId },
          include: {
            conditionalRules: true,
          },
        });

        if (template) {
          pointSystemConfig = {
            pointsPerWin: template.pointsPerWin,
            pointsPerDraw: template.pointsPerDraw,
            pointsPerLoss: template.pointsPerLoss,
            pointsPerGoalScored: template.pointsPerGoalScored,
            pointsPerGoalConceded: template.pointsPerGoalConceded,
            conditionalRules: template.conditionalRules,
          };
        } else {
          // Fallback to inline configuration if template not found
          pointSystemConfig = {
            pointsPerWin: existingMatch.tournament.pointsPerWin,
            pointsPerDraw: existingMatch.tournament.pointsPerDraw,
            pointsPerLoss: existingMatch.tournament.pointsPerLoss,
            pointsPerGoalScored: existingMatch.tournament.pointsPerGoalScored,
            pointsPerGoalConceded: existingMatch.tournament.pointsPerGoalConceded,
          };
        }
      } else {
        // Use inline configuration (backward compatibility)
        pointSystemConfig = {
          pointsPerWin: existingMatch.tournament.pointsPerWin,
          pointsPerDraw: existingMatch.tournament.pointsPerDraw,
          pointsPerLoss: existingMatch.tournament.pointsPerLoss,
          pointsPerGoalScored: existingMatch.tournament.pointsPerGoalScored,
          pointsPerGoalConceded: existingMatch.tournament.pointsPerGoalConceded,
        };
      }

      // Calculate points for each result with detailed breakdown
      resultsWithPoints = results.map(result => {
        const calculation = calculatePointsWithRules(result, pointSystemConfig);
        return {
          ...result,
          pointsEarned: calculation.totalPoints,
          basePoints: calculation.basePoints,
          conditionalPoints: calculation.conditionalPoints,
        };
      });
    }

    // Update match in a transaction
    const updatedMatch = await prisma.$transaction(async (tx) => {
      // Update match date if provided
      const match = await tx.match.update({
        where: { id: matchId },
        data: {
          ...(matchDate && { matchDate: new Date(matchDate) }),
          ...(stageId !== undefined && { stageId }),
          ...(stageName !== undefined && { stageName }),
        },
      });

      // If results are being updated, delete old results and create new ones
      if (results) {
        // Delete existing results
        await tx.matchResult.deleteMany({
          where: { matchId },
        });

        // Create new results
        await tx.matchResult.createMany({
          data: resultsWithPoints.map(result => ({
            matchId,
            playerId: result.playerId,
            outcome: result.outcome,
            goalsScored: result.goalsScored,
            goalsConceded: result.goalsConceded,
            pointsEarned: result.pointsEarned,
            basePoints: result.basePoints,
            conditionalPoints: result.conditionalPoints,
          })),
        });
      }

      // Fetch the complete updated match
      return await tx.match.findUnique({
        where: { id: matchId },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
            },
          },
          results: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  photo: true,
                },
              },
            },
          },
        },
      });
    });

    // Update statistics for all affected players
    const affectedPlayerIds = [...new Set([...oldPlayerIds, ...newPlayerIds])];
    if (affectedPlayerIds.length > 0) {
      await updatePlayerStatistics(tournamentId, affectedPlayerIds);
    }

    return NextResponse.json(updatedMatch);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// DELETE /api/matches/[id] - Delete a match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new UnauthorizedError();
    }

    const { id } = await params;
    const matchId = parseInt(id);

    if (isNaN(matchId)) {
      throw new ValidationError("Invalid match ID");
    }

    // Check if match exists and get player IDs for statistics update
    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
          },
        },
        results: {
          select: {
            playerId: true,
          },
        },
      },
    });

    if (!existingMatch) {
      throw new NotFoundError("Match");
    }

    const tournamentId = existingMatch.tournament.id;
    const playerIds = existingMatch.results.map(r => r.playerId);
    const resultCount = existingMatch.results.length;

    // Delete the match (cascade will delete results)
    await prisma.match.delete({
      where: { id: matchId },
    });

    // Update statistics for affected players
    if (playerIds.length > 0) {
      await updatePlayerStatistics(tournamentId, playerIds);
    }

    return NextResponse.json(
      {
        message: "Match deleted successfully",
        deletedResults: resultCount,
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
