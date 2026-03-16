# Current Stats Implementation Analysis

## How Stats Are Currently Fetched

### 1. Player Leaderboard (`app/leaderboard/players/page.tsx`)
**Data Source:** `match_results` table
**Method:** Direct aggregation from match results
```typescript
const results = await prisma.matchResult.groupBy({
  by: ['playerId'],
  where: tournamentId ? { match: { tournamentId } } : {},
  _sum: { pointsEarned, goalsScored, goalsConceded },
  _count: { id: true }
});
```
**Issue:** Does NOT consider which club the player was with at match time
- All matches are attributed to the player's CURRENT club
- If player transfers mid-tournament, all stats show under current club

### 2. Club Leaderboard (`app/dashboard/leaderboard/page.tsx`)
**Data Source:** `tournament_player_stats` + `team_match_results`
**Method:** Aggregates from two sources
```typescript
// Singles matches from tournament_player_stats
const allStats = club.players.flatMap(player => player.tournamentStats);

// Doubles matches from team_match_results
const teamMatchResults = club.teamMatches;
```
**Issue:** Same problem - stats attributed to current club
- `tournament_player_stats` doesn't track which club at match time
- `team_match_results` HAS clubId but only for doubles matches

### 3. Player Profile (`app/dashboard/players/[id]/page.tsx`)
**Data Source:** `player_club_stats` table
**Method:** Displays pre-calculated stats
```typescript
const player = await prisma.player.findUnique({
  include: {
    clubStats: {
      include: { club: true },
      orderBy: { joinedAt: 'desc' }
    }
  }
});
```
**Issue:** `player_club_stats` fields are NEVER updated
- Stats fields exist but show 0 for everything
- Only `joinedAt` and `leftAt` are populated during transfers

### 4. Tournament Leaderboard (`app/tournaments/[id]/leaderboard/page.tsx`)
**Data Source:** `tournament_player_stats` (singles) or `team_match_results` (doubles)
**Method:** Direct query
```typescript
// For singles
const stats = await prisma.tournamentPlayerStats.findMany({
  where: { tournamentId: id }
});

// For doubles
const teamStats = await prisma.teamMatchResult.groupBy({
  by: ['clubId', 'playerAId', 'playerBId'],
  where: { match: { tournamentId: id } }
});
```
**Issue:** Singles don't track club, doubles do

## The Core Problem

**Singles Matches (`match_results` table):**
- Has: `playerId`, `matchId`, `outcome`, `goalsScored`, `goalsConceded`, `pointsEarned`
- Missing: `clubId` - NO way to know which club player represented
- Result: All stats attributed to current club

**Doubles Matches (`team_match_results` table):**
- Has: `clubId`, `playerAId`, `playerBId`, `matchId`, `outcome`, etc.
- This DOES track club correctly!
- Result: Doubles stats are correct, singles are not

**Player Club Stats (`player_club_stats` table):**
- Has: `playerId`, `clubId`, `joinedAt`, `leftAt`, stat fields
- Problem: Stat fields are never populated from matches
- Result: Shows 0 for everything

## What Needs to Happen

### Option A: Add clubId to match_results (Database Change)
**Pros:**
- Clean, permanent solution
- Efficient queries
- Historical accuracy

**Cons:**
- Requires database migration
- Need to backfill existing data
- More complex implementation

### Option B: Calculate on-the-fly (No Database Change)
**Pros:**
- No schema changes
- Works with existing data
- Can implement immediately

**Cons:**
- Complex queries with date comparisons
- Performance impact (more joins)
- Need to query transfers for every stat calculation

## Option B Implementation Strategy

For each match result, determine the club by:
1. Get match date from `matches.matchDate`
2. Query `player_club_stats` where:
   - `playerId` = player
   - `joinedAt` <= `matchDate`
   - `leftAt` IS NULL OR `leftAt` > `matchDate`
3. Use the `clubId` from that record

### Files to Update:

1. **Player Leaderboard** (`app/leaderboard/players/page.tsx`)
   - Join with matches table to get match dates
   - Join with player_club_stats to determine club at match time
   - Group by player AND club
   - Show current club in display

2. **Club Leaderboard** (`app/dashboard/leaderboard/page.tsx`)
   - For singles: Join match_results → matches → player_club_stats
   - Filter matches where player was in that club
   - Aggregate correctly

3. **Player Profile** (`app/dashboard/players/[id]/page.tsx`)
   - Calculate stats from match_results instead of player_club_stats
   - For each club period (joinedAt to leftAt):
     - Find all matches in that date range
     - Aggregate stats
   - Display calculated stats

4. **Tournament Leaderboard** (`app/tournaments/[id]/leaderboard/page.tsx`)
   - Similar to player leaderboard
   - Filter by tournament
   - Determine club at match time

5. **Public Player Profile** (`app/players/[id]/page.tsx`)
   - Already fetches match results
   - Need to add club determination logic
   - Show stats broken down by club

## Example Query Pattern

```typescript
// Get player's matches with club at match time
const matchesWithClub = await prisma.matchResult.findMany({
  where: { playerId: playerId },
  include: {
    match: {
      select: {
        matchDate: true,
        tournamentId: true
      }
    }
  }
});

// For each match, determine club
for (const matchResult of matchesWithClub) {
  const clubAtMatchTime = await prisma.playerClubStats.findFirst({
    where: {
      playerId: playerId,
      joinedAt: { lte: matchResult.match.matchDate },
      OR: [
        { leftAt: null },
        { leftAt: { gt: matchResult.match.matchDate } }
      ]
    },
    select: { clubId: true, club: true }
  });
  
  // Now we know which club the player was in for this match
}
```

## Performance Considerations

- This approach requires additional queries
- Consider caching or materialized views for frequently accessed data
- May want to add indexes on `player_club_stats(playerId, joinedAt, leftAt)`

## Recommendation

Start with Option B (calculate on-the-fly) because:
1. No database migration needed
2. Works with existing data immediately
3. Can always migrate to Option A later if performance becomes an issue
4. Easier to test and validate

The key insight: We already have all the data we need in `player_club_stats` (joinedAt/leftAt dates) and `matches` (matchDate). We just need to join them properly when calculating stats.
