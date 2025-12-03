import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchCreateSchema } from "@/lib/validations/match";
import { calculatePointsWithRules, updatePlayerStatistics, PointSystemConfig } from "@/lib/match-utils";
import { 
  createErrorResponse, 
  NotFoundError, 
  UnauthorizedError, 
  ValidationError,
} from "@/lib/errors";

// GET /api/tournaments/[id]/matches - Get all matches for a tournament
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
      throw new ValidationError("Invalid tournament ID");
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Get all matches for the tournament
    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
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
      orderBy: {
        matchDate: "desc",
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/tournaments/[id]/matches - Create a new match with results
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
      throw new ValidationError("Invalid tournament ID");
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = matchCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { matchDate, stageId, stageName, results } = validationResult.data;

    // Check if tournament exists and get its point system
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        pointSystemTemplateId: true,
        pointsPerWin: true,
        pointsPerDraw: true,
        pointsPerLoss: true,
        pointsPerGoalScored: true,
        pointsPerGoalConceded: true,
      },
    });

    if (!tournament) {
      throw new NotFoundError("Tournament");
    }

    // Fetch point system configuration (stage-specific, template, or inline)
    let pointSystemConfig: PointSystemConfig;
    
    // If a stage is selected, try to use stage-specific points
    if (stageId && tournament.pointSystemTemplateId) {
      const stagePoint = await prisma.stagePoint.findFirst({
        where: {
          id: stageId,
          pointSystemTemplateId: tournament.pointSystemTemplateId,
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
          where: { id: tournament.pointSystemTemplateId },
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
            pointsPerWin: tournament.pointsPerWin,
            pointsPerDraw: tournament.pointsPerDraw,
            pointsPerLoss: tournament.pointsPerLoss,
            pointsPerGoalScored: tournament.pointsPerGoalScored,
            pointsPerGoalConceded: tournament.pointsPerGoalConceded,
          };
        }
      }
    } else if (tournament.pointSystemTemplateId) {
      // Use point system template with conditional rules
      const template = await prisma.pointSystemTemplate.findUnique({
        where: { id: tournament.pointSystemTemplateId },
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
          pointsPerWin: tournament.pointsPerWin,
          pointsPerDraw: tournament.pointsPerDraw,
          pointsPerLoss: tournament.pointsPerLoss,
          pointsPerGoalScored: tournament.pointsPerGoalScored,
          pointsPerGoalConceded: tournament.pointsPerGoalConceded,
        };
      }
    } else {
      // Use inline configuration (backward compatibility)
      pointSystemConfig = {
        pointsPerWin: tournament.pointsPerWin,
        pointsPerDraw: tournament.pointsPerDraw,
        pointsPerLoss: tournament.pointsPerLoss,
        pointsPerGoalScored: tournament.pointsPerGoalScored,
        pointsPerGoalConceded: tournament.pointsPerGoalConceded,
      };
    }

    // Verify all players are participants in the tournament
    const playerIds = results.map(r => r.playerId);
    const participants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        playerId: { in: playerIds },
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

    if (participants.length !== playerIds.length) {
      const participantIds = participants.map(p => p.playerId);
      const nonParticipantIds = playerIds.filter(id => !participantIds.includes(id));
      
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

    // Calculate points for each result with detailed breakdown
    const resultsWithPoints = results.map(result => {
      const calculation = calculatePointsWithRules(result, pointSystemConfig);
      return {
        ...result,
        pointsEarned: calculation.totalPoints,
        basePoints: calculation.basePoints,
        conditionalPoints: calculation.conditionalPoints,
      };
    });

    // Create match with results in a transaction
    const match = await prisma.$transaction(async (tx) => {
      // Create the match
      const newMatch = await tx.match.create({
        data: {
          tournamentId,
          matchDate: new Date(matchDate),
          ...(stageId && { stageId }),
          ...(stageName && { stageName }),
        },
      });

      // Create match results
      await tx.matchResult.createMany({
        data: resultsWithPoints.map(result => ({
          matchId: newMatch.id,
          playerId: result.playerId,
          outcome: result.outcome,
          goalsScored: result.goalsScored,
          goalsConceded: result.goalsConceded,
          pointsEarned: result.pointsEarned,
          basePoints: result.basePoints,
          conditionalPoints: result.conditionalPoints,
        })),
      });

      // Fetch the complete match with results
      return await tx.match.findUnique({
        where: { id: newMatch.id },
        include: {
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

    // Update player statistics
    await updatePlayerStatistics(tournamentId, playerIds);

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
