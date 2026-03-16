import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transferId = parseInt(id);

    if (isNaN(transferId)) {
      return NextResponse.json(
        { error: "Invalid transfer ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { transferDate: transferDateStr } = body;

    if (!transferDateStr) {
      return NextResponse.json(
        { error: "Transfer date is required" },
        { status: 400 }
      );
    }

    const transferDate = new Date(transferDateStr);

    // Get the transfer to update
    const transfer = await prisma.playerTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    // Use transaction to update related records
    const result = await prisma.$transaction(async (tx) => {
      // Update the transfer date
      const updatedTransfer = await tx.playerTransfer.update({
        where: { id: transferId },
        data: { transferDate },
      });

      // Update the club stats periods
      // Find the club stats that ended with this transfer
      const previousClubStats = await tx.playerClubStats.findFirst({
        where: {
          playerId: transfer.playerId,
          leftAt: transfer.transferDate,
        },
      });

      if (previousClubStats) {
        await tx.playerClubStats.update({
          where: { id: previousClubStats.id },
          data: { leftAt: transferDate },
        });
      }

      // Find the club stats that started with this transfer
      const newClubStats = await tx.playerClubStats.findFirst({
        where: {
          playerId: transfer.playerId,
          joinedAt: transfer.transferDate,
        },
      });

      if (newClubStats) {
        await tx.playerClubStats.update({
          where: { id: newClubStats.id },
          data: { joinedAt: transferDate },
        });
      }

      return updatedTransfer;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating transfer:", error);
    return NextResponse.json(
      { error: "Failed to update transfer" },
      { status: 500 }
    );
  }
}
