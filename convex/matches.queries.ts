// convex/matches.queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * 1) All singles matches for a user within a ladder (newest first),
 *    with sets attached.
 */
export const listUserMatchesInLadder = query({
  args: {
    ladderId: v.id("ladders"),
    userId: v.id("users"),
    limit: v.optional(v.number()),      // optional soft cap (e.g., 50)
  },
  handler: async (ctx, { ladderId, userId, limit }) => {
    // Matches where user is winner
    const won = await ctx.db
      .query("matches")
      .withIndex("by_winner", (q) => q.eq("winnerId", userId))
      .collect();

    // Matches where user is loser
    const lost = await ctx.db
      .query("matches")
      .withIndex("by_loser", (q) => q.eq("loserId", userId))
      .collect();

    // Scope to ladder and combine
    const combined = [...won, ...lost]
      .filter((m) => m.ladderId === ladderId)
      .sort((a, b) => b.matchDate - a.matchDate);

    const trimmed = limit ? combined.slice(0, limit) : combined;

    // Attach sets for each match
    const results = await Promise.all(
      trimmed.map(async (m) => {
        const sets = await ctx.db
          .query("match_sets")
          .withIndex("by_match", (q) => q.eq("matchId", m._id))
          .collect();
        // sort sets by setNumber just in case
        sets.sort((a, b) => a.setNumber - b.setNumber);
        return { match: m, sets };
      })
    );

    return results;
  },
});

/**
 * 2) Aggregate stats for a user in a ladder:
 *    - wins, losses
 *    - sets won/lost
 *    - games won/lost
 *    - lastMatchDate
 */
export const userLadderStats = query({
  args: {
    ladderId: v.id("ladders"),
    userId: v.id("users"),
  },
  handler: async (ctx, { ladderId, userId }) => {
    // Grab matches (reuse the logic above directly for simplicity)
    const won = await ctx.db
      .query("matches")
      .withIndex("by_winner", (q) => q.eq("winnerId", userId))
      .collect();

    const lost = await ctx.db
      .query("matches")
      .withIndex("by_loser", (q) => q.eq("loserId", userId))
      .collect();

    const matches = [...won, ...lost].filter((m) => m.ladderId === ladderId);

    let wins = 0;
    let losses = 0;
    let setsWon = 0;
    let setsLost = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let lastMatchDate: number | null = null;

    for (const m of matches) {
      const sets = await ctx.db
        .query("match_sets")
        .withIndex("by_match", (q) => q.eq("matchId", m._id))
        .collect();

      const userIsWinner = m.winnerId === userId;
      if (userIsWinner) wins += 1;
      else losses += 1;

      for (const s of sets) {
        if (userIsWinner) {
          // perspective is already winner vs loser
          setsWon += s.winnerGames > s.loserGames ? 1 : 0;
          setsLost += s.loserGames > s.winnerGames ? 1 : 0;
          gamesWon += s.winnerGames;
          gamesLost += s.loserGames;
          if (s.winnerTiebreak) gamesWon += s.winnerTiebreak;
          if (s.loserTiebreak) gamesLost += s.loserTiebreak;
        } else {
          // flip perspective
          setsWon += s.loserGames > s.winnerGames ? 1 : 0;
          setsLost += s.winnerGames > s.loserGames ? 1 : 0;
          gamesWon += s.loserGames;
          gamesLost += s.winnerGames;
          if (s.loserTiebreak) gamesWon += s.loserTiebreak;
          if (s.winnerTiebreak) gamesLost += s.winnerTiebreak;
        }
      }

      if (lastMatchDate === null || m.matchDate > lastMatchDate) {
        lastMatchDate = m.matchDate;
      }
    }

    return {
      matches: matches.length,
      wins,
      losses,
      setsWon,
      setsLost,
      gamesWon,
      gamesLost,
      lastMatchDate, // Unix ms | null
    };
  },
});

/**
 * 3) Optional: head-to-head between two users in a ladder.
 */
export const headToHead = query({
  args: {
    ladderId: v.id("ladders"),
    userA: v.id("users"),
    userB: v.id("users"),
  },
  handler: async (ctx, { ladderId, userA, userB }) => {
    // All matches where (A beat B) or (B beat A)
    const aBeatB = await ctx.db
      .query("matches")
      .withIndex("by_winner", (q) => q.eq("winnerId", userA))
      .collect();

    const bBeatA = await ctx.db
      .query("matches")
      .withIndex("by_winner", (q) => q.eq("winnerId", userB))
      .collect();

    const matches = [
      ...aBeatB.filter((m) => m.ladderId === ladderId && m.loserId === userB),
      ...bBeatA.filter((m) => m.ladderId === ladderId && m.loserId === userA),
    ].sort((a, b) => b.matchDate - a.matchDate);

    let aWins = 0;
    let bWins = 0;
    for (const m of matches) {
      if (m.winnerId === userA) aWins++;
      else bWins++;
    }

    // (Optional) attach sets for display
    const detailed = await Promise.all(
      matches.map(async (m) => {
        const sets = await ctx.db
          .query("match_sets")
          .withIndex("by_match", (q) => q.eq("matchId", m._id))
          .collect();
        sets.sort((a, b) => a.setNumber - b.setNumber);
        return { match: m, sets };
      })
    );

    return {
      record: { aWins, bWins, total: matches.length },
      matches: detailed,
    };
  },
});