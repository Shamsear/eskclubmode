import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/public/PlayerProfileClient';
import { prisma } from '@/lib/prisma';
import { calculatePlayerStatsByClub } from '@/lib/stats-utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlayerData(id: number) {
  try {
    // Fetch player data and recent matches in parallel
    const [player, singlesMatches, teamMatches, roles] = await Promise.all([
      prisma.player.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          place: true,
          dateOfBirth: true,
          photo: true,
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      }),
      // Fetch singles matches
      prisma.matchResult.findMany({
        where: { playerId: id },
        include: {
          match: {
            select: {
              id: true,
              matchDate: true,
              stageName: true,
              isTeamMatch: true,
              tournamentId: true,
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
                      photo: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          match: {
            matchDate: 'desc',
          },
        },
      }),
      // Fetch team matches (doubles)
      prisma.teamMatchResult.findMany({
        where: {
          OR: [
            { playerAId: id },
            { playerBId: id },
          ],
        },
        include: {
          match: {
            select: {
              id: true,
              matchDate: true,
              stageName: true,
              isTeamMatch: true,
              tournamentId: true,
              tournament: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teamResults: {
                include: {
                  club: {
                    select: {
                      id: true,
                      name: true,
                      logo: true,
                    },
                  },
                  playerA: {
                    select: {
                      id: true,
                      name: true,
                      photo: true,
                    },
                  },
                  playerB: {
                    select: {
                      id: true,
                      name: true,
                      photo: true,
                    },
                  },
                },
                orderBy: {
                  teamPosition: 'asc',
                },
              },
            },
          },
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          playerA: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
          playerB: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
        },
        orderBy: {
          match: {
            matchDate: 'desc',
          },
        },
      }),
      // Fetch player roles
      prisma.playerRole.findMany({
        where: { playerId: id },
        select: { role: true },
      }),
    ]);

    if (!player) {
      return null;
    }

    // Calculate stats by club based on transfer dates
    const clubStats = await calculatePlayerStatsByClub(id);

    // Calculate overall stats from club stats
    const totalMatches = clubStats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);
    const totalWins = clubStats.reduce((sum, stat) => sum + stat.wins, 0);
    const totalDraws = clubStats.reduce((sum, stat) => sum + stat.draws, 0);
    const totalLosses = clubStats.reduce((sum, stat) => sum + stat.losses, 0);
    const totalGoalsScored = clubStats.reduce((sum, stat) => sum + stat.goalsScored, 0);
    const totalGoalsConceded = clubStats.reduce((sum, stat) => sum + stat.goalsConceded, 0);
    const totalPoints = clubStats.reduce((sum, stat) => sum + stat.totalPoints, 0);
    // Clean sheets only from singles matches
    const totalCleanSheets = singlesMatches.filter(result => result.goalsConceded === 0).length;

    // Calculate total tournaments from both singles and doubles matches
    const tournamentIds = new Set<number>();
    singlesMatches.forEach(match => {
      if (match.match.tournamentId) {
        tournamentIds.add(match.match.tournamentId);
      }
    });
    teamMatches.forEach(match => {
      if (match.match.tournamentId) {
        tournamentIds.add(match.match.tournamentId);
      }
    });
    const totalTournaments = tournamentIds.size;

    // Get tournament stats for the breakdown
    const tournamentStatsMap = new Map<number, {
      id: number;
      name: string;
      startDate: string;
      matchesPlayed: number;
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      totalPoints: number;
    }>();

    // Process singles matches for tournament stats
    for (const match of singlesMatches) {
      if (match.match.tournament) {
        const tournamentId = match.match.tournament.id;
        if (!tournamentStatsMap.has(tournamentId)) {
          tournamentStatsMap.set(tournamentId, {
            id: tournamentId,
            name: match.match.tournament.name,
            startDate: new Date().toISOString(), // Will be updated from DB
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsScored: 0,
            goalsConceded: 0,
            totalPoints: 0,
          });
        }
        const stats = tournamentStatsMap.get(tournamentId)!;
        stats.matchesPlayed++;
        stats.goalsScored += match.goalsScored;
        stats.goalsConceded += match.goalsConceded;
        stats.totalPoints += match.pointsEarned;
        if (match.outcome === 'WIN') stats.wins++;
        else if (match.outcome === 'DRAW') stats.draws++;
        else if (match.outcome === 'LOSS') stats.losses++;
      }
    }

    // Process team matches for tournament stats
    for (const match of teamMatches) {
      if (match.match.tournament) {
        const tournamentId = match.match.tournament.id;
        if (!tournamentStatsMap.has(tournamentId)) {
          tournamentStatsMap.set(tournamentId, {
            id: tournamentId,
            name: match.match.tournament.name,
            startDate: new Date().toISOString(), // Will be updated from DB
            matchesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsScored: 0,
            goalsConceded: 0,
            totalPoints: 0,
          });
        }
        const stats = tournamentStatsMap.get(tournamentId)!;
        stats.matchesPlayed++;
        stats.goalsScored += match.goalsScored;
        stats.goalsConceded += match.goalsConceded;
        stats.totalPoints += match.pointsEarned;
        if (match.outcome === 'WIN') stats.wins++;
        else if (match.outcome === 'DRAW') stats.draws++;
        else if (match.outcome === 'LOSS') stats.losses++;
      }
    }

    // Get tournament start dates
    const tournaments = await prisma.tournament.findMany({
      where: {
        id: { in: Array.from(tournamentIds) }
      },
      select: {
        id: true,
        startDate: true,
      }
    });

    // Update start dates
    for (const tournament of tournaments) {
      const stats = tournamentStatsMap.get(tournament.id);
      if (stats && tournament.startDate) {
        stats.startDate = tournament.startDate.toISOString();
      }
    }

    // Process singles matches
    const processedSinglesMatches = singlesMatches.slice(0, 10).map(result => {
      const opponent = result.match.results.find(r => r.playerId !== id);
      
      return {
        id: result.id,
        matchId: result.match.id,
        date: result.match.matchDate.toISOString(),
        tournament: result.match.tournament,
        stageName: result.match.stageName,
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
        isTeamMatch: false,
        opponent: opponent ? {
          id: opponent.player.id,
          name: opponent.player.name,
          photo: opponent.player.photo,
          goalsScored: opponent.goalsScored,
          goalsConceded: opponent.goalsConceded,
        } : null,
      };
    });

    // Process team matches
    const processedTeamMatches = teamMatches.slice(0, 10).map(result => {
      // Find partner (the other player in the team)
      const partner = result.playerAId === id ? result.playerB : result.playerA;
      
      // Find opponent team (the other team in the match)
      const opponentTeam = result.match.teamResults?.find(
        tr => tr.playerAId !== id && tr.playerBId !== id
      );
      
      return {
        id: result.id,
        matchId: result.match.id,
        date: result.match.matchDate.toISOString(),
        tournament: result.match.tournament,
        stageName: result.match.stageName,
        outcome: result.outcome as 'WIN' | 'DRAW' | 'LOSS',
        goalsScored: result.goalsScored,
        goalsConceded: result.goalsConceded,
        pointsEarned: result.pointsEarned,
        isTeamMatch: true,
        partner: {
          id: partner.id,
          name: partner.name,
          photo: partner.photo,
        },
        club: result.club,
        opponentTeam: opponentTeam ? {
          club: opponentTeam.club,
          playerA: opponentTeam.playerA,
          playerB: opponentTeam.playerB,
          goalsScored: opponentTeam.goalsScored,
        } : null,
      };
    });

    // Combine and sort all matches by date
    const allMatches = [...processedSinglesMatches, ...processedTeamMatches]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        place: player.place,
        dateOfBirth: player.dateOfBirth?.toISOString() || null,
        photo: player.photo,
        club: player.club || { id: 0, name: 'Free Agent', logo: null },
        roles: roles.map(r => r.role as 'PLAYER' | 'CAPTAIN' | 'MENTOR' | 'MANAGER'),
      },
      stats: {
        totalTournaments,
        totalMatches,
        totalWins,
        totalDraws,
        totalLosses,
        totalGoalsScored,
        totalGoalsConceded,
        totalPoints,
        totalCleanSheets,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
      },
      recentMatches: allMatches,
      tournaments: Array.from(tournamentStatsMap.values()).map(stat => ({
        id: stat.id,
        name: stat.name,
        startDate: stat.startDate,
        rank: null, // Rank would need to be calculated separately
        matchesPlayed: stat.matchesPlayed,
        wins: stat.wins,
        draws: stat.draws,
        losses: stat.losses,
        goalsScored: stat.goalsScored,
        goalsConceded: stat.goalsConceded,
        totalPoints: stat.totalPoints,
      })),
    };
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    notFound();
  }

  const data = await getPlayerData(playerId);

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PlayerProfileClient initialData={data} />
    </div>
  );
}
