import { PrismaClient, RoleType, MatchOutcome } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@clubmanagement.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@clubmanagement.com',
      password: hashedPassword,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create sample clubs
  const club1 = await prisma.club.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Manchester United FC',
      logo: '/logos/manchester-united.png',
      description: 'Professional football club based in Manchester',
    },
  });
  console.log('Created club:', club1.name);

  const club2 = await prisma.club.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Lakers Basketball Club',
      logo: '/logos/lakers.png',
      description: 'Professional basketball team',
    },
  });
  console.log('Created club:', club2.name);

  // Create manager (player with MANAGER role)
  const manager1 = await prisma.player.upsert({
    where: { email: 'john.manager@example.com' },
    update: {},
    create: {
      clubId: club1.id,
      name: 'John Manager',
      email: 'john.manager@example.com',
      phone: '+1234567890',
      place: 'Manchester',
      dateOfBirth: new Date('1975-05-15'),
      roles: {
        create: [
          { role: RoleType.MANAGER },
          { role: RoleType.PLAYER },
        ],
      },
    },
  });
  console.log('Created manager:', manager1.name);

  // Create mentor (player with MENTOR role)
  const mentor1 = await prisma.player.upsert({
    where: { email: 'sarah.mentor@example.com' },
    update: {},
    create: {
      clubId: club1.id,
      name: 'Sarah Mentor',
      email: 'sarah.mentor@example.com',
      phone: '+1234567891',
      place: 'Manchester',
      dateOfBirth: new Date('1980-08-20'),
      roles: {
        create: [
          { role: RoleType.MENTOR },
          { role: RoleType.PLAYER },
        ],
      },
    },
  });
  console.log('Created mentor:', mentor1.name);

  // Create captain (player with CAPTAIN role)
  const captain1 = await prisma.player.upsert({
    where: { email: 'mike.captain@example.com' },
    update: {},
    create: {
      clubId: club1.id,
      name: 'Mike Captain',
      email: 'mike.captain@example.com',
      phone: '+1234567892',
      place: 'Manchester',
      dateOfBirth: new Date('1990-03-10'),
      roles: {
        create: [
          { role: RoleType.CAPTAIN },
          { role: RoleType.PLAYER },
        ],
      },
    },
  });
  console.log('Created captain:', captain1.name);

  // Create regular players
  const player1 = await prisma.player.upsert({
    where: { email: 'david.player@example.com' },
    update: {},
    create: {
      clubId: club1.id,
      name: 'David Player',
      email: 'david.player@example.com',
      phone: '+1234567893',
      place: 'Manchester',
      dateOfBirth: new Date('1995-07-25'),
      roles: {
        create: [
          { role: RoleType.PLAYER },
        ],
      },
    },
  });
  console.log('Created player:', player1.name);

  const player2 = await prisma.player.upsert({
    where: { email: 'emma.player@example.com' },
    update: {},
    create: {
      clubId: club1.id,
      name: 'Emma Player',
      email: 'emma.player@example.com',
      phone: '+1234567894',
      place: 'London',
      dateOfBirth: new Date('1998-11-30'),
      roles: {
        create: [
          { role: RoleType.PLAYER },
        ],
      },
    },
  });
  console.log('Created player:', player2.name);

  // Create tournament
  const tournament1 = await prisma.tournament.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clubId: club1.id,
      name: 'Spring Championship 2025',
      description: 'Annual spring tournament for club members',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-31'),
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      pointsPerGoalScored: 1,
      pointsPerGoalConceded: -1,
    },
  });
  console.log('Created tournament:', tournament1.name);

  // Add tournament participants
  const participant1 = await prisma.tournamentParticipant.upsert({
    where: { 
      tournamentId_playerId: {
        tournamentId: tournament1.id,
        playerId: captain1.id,
      }
    },
    update: {},
    create: {
      tournamentId: tournament1.id,
      playerId: captain1.id,
    },
  });
  console.log('Added participant:', captain1.name);

  const participant2 = await prisma.tournamentParticipant.upsert({
    where: { 
      tournamentId_playerId: {
        tournamentId: tournament1.id,
        playerId: player1.id,
      }
    },
    update: {},
    create: {
      tournamentId: tournament1.id,
      playerId: player1.id,
    },
  });
  console.log('Added participant:', player1.name);

  const participant3 = await prisma.tournamentParticipant.upsert({
    where: { 
      tournamentId_playerId: {
        tournamentId: tournament1.id,
        playerId: player2.id,
      }
    },
    update: {},
    create: {
      tournamentId: tournament1.id,
      playerId: player2.id,
    },
  });
  console.log('Added participant:', player2.name);

  // Create matches with results
  const match1 = await prisma.match.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tournamentId: tournament1.id,
      matchDate: new Date('2025-03-15'),
    },
  });
  console.log('Created match 1');

  // Match 1 results: captain1 vs player1 (captain1 wins)
  await prisma.matchResult.upsert({
    where: {
      matchId_playerId: {
        matchId: match1.id,
        playerId: captain1.id,
      }
    },
    update: {},
    create: {
      matchId: match1.id,
      playerId: captain1.id,
      outcome: MatchOutcome.WIN,
      goalsScored: 3,
      goalsConceded: 1,
      pointsEarned: 3 + (3 * 1) + (1 * -1), // 3 (win) + 3 (goals) - 1 (conceded) = 5
    },
  });

  await prisma.matchResult.upsert({
    where: {
      matchId_playerId: {
        matchId: match1.id,
        playerId: player1.id,
      }
    },
    update: {},
    create: {
      matchId: match1.id,
      playerId: player1.id,
      outcome: MatchOutcome.LOSS,
      goalsScored: 1,
      goalsConceded: 3,
      pointsEarned: 0 + (1 * 1) + (3 * -1), // 0 (loss) + 1 (goal) - 3 (conceded) = -2
    },
  });
  console.log('Created match 1 results');

  const match2 = await prisma.match.upsert({
    where: { id: 2 },
    update: {},
    create: {
      tournamentId: tournament1.id,
      matchDate: new Date('2025-03-22'),
    },
  });
  console.log('Created match 2');

  // Match 2 results: player1 vs player2 (draw)
  await prisma.matchResult.upsert({
    where: {
      matchId_playerId: {
        matchId: match2.id,
        playerId: player1.id,
      }
    },
    update: {},
    create: {
      matchId: match2.id,
      playerId: player1.id,
      outcome: MatchOutcome.DRAW,
      goalsScored: 2,
      goalsConceded: 2,
      pointsEarned: 1 + (2 * 1) + (2 * -1), // 1 (draw) + 2 (goals) - 2 (conceded) = 1
    },
  });

  await prisma.matchResult.upsert({
    where: {
      matchId_playerId: {
        matchId: match2.id,
        playerId: player2.id,
      }
    },
    update: {},
    create: {
      matchId: match2.id,
      playerId: player2.id,
      outcome: MatchOutcome.DRAW,
      goalsScored: 2,
      goalsConceded: 2,
      pointsEarned: 1 + (2 * 1) + (2 * -1), // 1 (draw) + 2 (goals) - 2 (conceded) = 1
    },
  });
  console.log('Created match 2 results');

  // Create tournament player statistics
  await prisma.tournamentPlayerStats.upsert({
    where: {
      tournamentId_playerId: {
        tournamentId: tournament1.id,
        playerId: captain1.id,
      }
    },
    update: {},
    create: {
      tournamentId: tournament1.id,
      playerId: captain1.id,
      matchesPlayed: 1,
      wins: 1,
      draws: 0,
      losses: 0,
      goalsScored: 3,
      goalsConceded: 1,
      totalPoints: 5,
    },
  });
  console.log('Created stats for:', captain1.name);

  await prisma.tournamentPlayerStats.upsert({
    where: {
      tournamentId_playerId: {
        tournamentId: tournament1.id,
        playerId: player1.id,
      }
    },
    update: {},
    create: {
      tournamentId: tournament1.id,
      playerId: player1.id,
      matchesPlayed: 2,
      wins: 0,
      draws: 1,
      losses: 1,
      goalsScored: 3,
      goalsConceded: 5,
      totalPoints: -1, // -2 (match 1) + 1 (match 2) = -1
    },
  });
  console.log('Created stats for:', player1.name);

  await prisma.tournamentPlayerStats.upsert({
    where: {
      tournamentId_playerId: {
        tournamentId: tournament1.id,
        playerId: player2.id,
      }
    },
    update: {},
    create: {
      tournamentId: tournament1.id,
      playerId: player2.id,
      matchesPlayed: 1,
      wins: 0,
      draws: 1,
      losses: 0,
      goalsScored: 2,
      goalsConceded: 2,
      totalPoints: 1,
    },
  });
  console.log('Created stats for:', player2.name);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
