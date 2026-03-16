import { prisma } from "./prisma";

/**
 * Get the club a player was in at a specific date
 */
export async function getPlayerClubAtDate(playerId: number, date: Date) {
  const clubStats = await prisma.playerClubStats.findFirst({
    where: {
      playerId,
      joinedAt: { lte: date },
      OR: [
        { leftAt: null },
        { leftAt: { gt: date } }
      ]
    },
    select: {
      clubId: true,
      club: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      }
    }
  });

  return clubStats;
}

/**
 * Calculate player stats grouped by club based on transfer dates
 */
export async function calculatePlayerStatsByClub(playerId: number, tournamentId?: number) {
  // Get all match results for the player
  const matchResults = await prisma.matchResult.findMany({
    where: {
      playerId,
      ...(tournamentId ? { match: { tournamentId } } : {})
    },
    include: {
      match: {
        select: {
          matchDate: true,
          tournamentId: true
        }
      }
    }
  });

  // Get all club periods for the player
  const clubPeriods = await prisma.playerClubStats.findMany({
    where: { playerId },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      }
    },
    orderBy: { joinedAt: 'asc' }
  });

  // Group matches by club
  const statsByClub: Record<string, {
    clubId: number | null;
    club: { id: number; name: string; logo: string | null } | null;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    totalPoints: number;
    joinedAt: Date;
    leftAt: Date | null;
  }> = {};

  for (const matchResult of matchResults) {
    const matchDate = matchResult.match.matchDate;
    
    // Find which club period this match belongs to
    const clubPeriod = clubPeriods.find(period => {
      const joinedAt = new Date(period.joinedAt);
      const leftAt = period.leftAt ? new Date(period.leftAt) : null;
      
      return matchDate >= joinedAt && (!leftAt || matchDate < leftAt);
    });

    const clubKey = clubPeriod?.clubId?.toString() || 'free-agent';
    
    if (!statsByClub[clubKey]) {
      statsByClub[clubKey] = {
        clubId: clubPeriod?.clubId || null,
        club: clubPeriod?.club || null,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        totalPoints: 0,
        joinedAt: clubPeriod?.joinedAt || new Date(),
        leftAt: clubPeriod?.leftAt || null
      };
    }

    const stats = statsByClub[clubKey];
    stats.matchesPlayed++;
    stats.goalsScored += matchResult.goalsScored;
    stats.goalsConceded += matchResult.goalsConceded;
    stats.totalPoints += matchResult.pointsEarned;

    if (matchResult.outcome === 'WIN') stats.wins++;
    else if (matchResult.outcome === 'DRAW') stats.draws++;
    else if (matchResult.outcome === 'LOSS') stats.losses++;
  }

  return Object.values(statsByClub);
}

/**
 * Calculate club stats from all players, considering transfer dates
 */
export async function calculateClubStats(clubId: number, tournamentId?: number) {
  // Get all players who were ever in this club
  const clubPeriods = await prisma.playerClubStats.findMany({
    where: { clubId },
    select: {
      playerId: true,
      joinedAt: true,
      leftAt: true
    }
  });

  const playerIds = [...new Set(clubPeriods.map(p => p.playerId))];

  // Get all match results for these players
  const matchResults = await prisma.matchResult.findMany({
    where: {
      playerId: { in: playerIds },
      ...(tournamentId ? { match: { tournamentId } } : {})
    },
    include: {
      match: {
        select: {
          matchDate: true,
          tournamentId: true
        }
      }
    }
  });

  // Filter matches that happened while player was in this club
  const clubMatches = matchResults.filter(matchResult => {
    const matchDate = matchResult.match.matchDate;
    const playerPeriod = clubPeriods.find(period => 
      period.playerId === matchResult.playerId &&
      matchDate >= period.joinedAt &&
      (!period.leftAt || matchDate < period.leftAt)
    );
    return !!playerPeriod;
  });

  // Calculate stats
  const stats = {
    matchesPlayed: clubMatches.length,
    wins: clubMatches.filter(m => m.outcome === 'WIN').length,
    draws: clubMatches.filter(m => m.outcome === 'DRAW').length,
    losses: clubMatches.filter(m => m.outcome === 'LOSS').length,
    goalsScored: clubMatches.reduce((sum, m) => sum + m.goalsScored, 0),
    goalsConceded: clubMatches.reduce((sum, m) => sum + m.goalsConceded, 0),
    totalPoints: clubMatches.reduce((sum, m) => sum + m.pointsEarned, 0)
  };

  return stats;
}

/**
 * Get player stats with club at match time for leaderboard
 */
export async function getPlayerStatsWithClub(tournamentId?: number) {
  // Get all match results
  const matchResults = await prisma.matchResult.findMany({
    where: tournamentId ? { match: { tournamentId } } : {},
    include: {
      match: {
        select: {
          matchDate: true,
          tournamentId: true
        }
      },
      player: {
        select: {
          id: true,
          name: true,
          photo: true,
          clubId: true,
          club: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      }
    }
  });

  // Group by player
  const playerStatsMap = new Map<number, {
    player: any;
    currentClub: any;
    stats: {
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      totalPoints: number;
    };
  }>();

  for (const matchResult of matchResults) {
    const playerId = matchResult.player.id;
    
    if (!playerStatsMap.has(playerId)) {
      playerStatsMap.set(playerId, {
        player: matchResult.player,
        currentClub: matchResult.player.club,
        stats: {
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsScored: 0,
          goalsConceded: 0,
          totalPoints: 0
        }
      });
    }

    const playerData = playerStatsMap.get(playerId)!;
    playerData.stats.matchesPlayed++;
    playerData.stats.goalsScored += matchResult.goalsScored;
    playerData.stats.goalsConceded += matchResult.goalsConceded;
    playerData.stats.totalPoints += matchResult.pointsEarned;

    if (matchResult.outcome === 'WIN') playerData.stats.wins++;
    else if (matchResult.outcome === 'DRAW') playerData.stats.draws++;
    else if (matchResult.outcome === 'LOSS') playerData.stats.losses++;
  }

  return Array.from(playerStatsMap.values()).map(data => ({
    player: {
      id: data.player.id,
      name: data.player.name,
      photo: data.player.photo,
      club: data.currentClub
    },
    stats: {
      ...data.stats,
      winRate: data.stats.matchesPlayed > 0 
        ? (data.stats.wins / data.stats.matchesPlayed) * 100 
        : 0
    }
  }));
}
