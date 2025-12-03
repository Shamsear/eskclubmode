import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";
import { RoleType } from "@prisma/client";

interface BulkMember {
  name: string;
  email: string;
  phone?: string;
  state?: string;
  district?: string;
  dateOfBirth?: string;
  role?: string;
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
    const clubId = parseInt(id);

    if (isNaN(clubId)) {
      return NextResponse.json(
        { error: "Invalid club ID" },
        { status: 400 }
      );
    }

    // Verify club exists
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { members } = body as { members: BulkMember[] };

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "No members provided" },
        { status: 400 }
      );
    }

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const member of members) {
      try {
        // Check if player with this email already exists
        const existing = await prisma.player.findUnique({
          where: { email: member.email },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Prepare place field
        const place = member.district && member.state
          ? `${member.district}, ${member.state}`
          : null;

        // Prepare date of birth
        const dateOfBirth = member.dateOfBirth
          ? new Date(member.dateOfBirth)
          : null;

        // Determine role (default to PLAYER)
        const role = member.role && Object.values(RoleType).includes(member.role as RoleType)
          ? (member.role as RoleType)
          : RoleType.PLAYER;

        // Create player with role
        await prisma.player.create({
          data: {
            clubId,
            name: member.name,
            email: member.email,
            phone: member.phone || null,
            place,
            dateOfBirth,
            roles: {
              create: {
                role,
              },
            },
          },
        });

        added++;
      } catch (error) {
        errors.push(`Failed to add ${member.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      added,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully added ${added} member(s)`,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
