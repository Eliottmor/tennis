import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { BASE_WINNER_POINTS, BASE_LOSER_POINTS, STRAIGHT_SETS_BONUS, WIN_STREAK_BONUS, BAGEL_SET_BONUS } from "../src/utils/points";

export const reportMatch = mutation({
  args: {
    ladderId: v.id("ladders"),
    matchDate: v.number(),
    winnerId: v.id("users"),
    loserId: v.id("users"),
    sets: v.array(v.object({
      setNumber: v.number(),
      winnerGames: v.number(),
      loserGames: v.number(),
      winnerTiebreak: v.optional(v.number()),
      loserTiebreak: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Make sure both players belong to the ladder
    const checkMember = async (userId: Id<"users">) => {
      const m = await ctx.db
        .query("ladder_members")
        .withIndex("by_ladder_and_user", (q) =>
          q.eq("ladderId", args.ladderId).eq("userId", userId)
        )
        .unique();
      if (!m) throw new Error("Both players must be ladder members");
    };
    await Promise.all([checkMember(args.winnerId), checkMember(args.loserId)]);

    const now = Date.now();
    let winnerPointsAwarded = BASE_WINNER_POINTS;
    let loserPointsAwarded = BASE_LOSER_POINTS;
    let straightSets = false;
    let winStreakBonus = false;
    let bagelSetsWonByWinner = 0;

    if (args.sets.length === 2 && args.sets[0].winnerGames > args.sets[0].loserGames && args.sets[1].winnerGames > args.sets[1].loserGames) {
      winnerPointsAwarded += STRAIGHT_SETS_BONUS;
      straightSets = true;
    }

    // Get winner's current ladder member data for win streak check
    const winnerMember = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder_and_user", (q) =>
        q.eq("ladderId", args.ladderId).eq("userId", args.winnerId)
      )
      .unique();

    // Check for 3-match win streak by looking at current winStreak
    if (winnerMember && winnerMember.winStreak === 2) {
      winStreakBonus = true;
      winnerPointsAwarded += WIN_STREAK_BONUS;
    }

    for (const s of args.sets) {
      if (s.winnerGames === 6 && s.loserGames === 0) {
        bagelSetsWonByWinner += 1;
      }
    }

    // Add bonus points for bagel sets
    if (bagelSetsWonByWinner > 0) {
      winnerPointsAwarded += bagelSetsWonByWinner * BAGEL_SET_BONUS;
    }

    const matchId = await ctx.db.insert("matches", {
      ladderId: args.ladderId,
      matchDate: args.matchDate,
      winnerId: args.winnerId,
      loserId: args.loserId,
      createdAt: now,
      winnerPointsAwarded: winnerPointsAwarded,
      loserPointsAwarded: loserPointsAwarded,
      straightSets: straightSets,
      winStreakBonus: winStreakBonus,
      bagelSetsWonByWinner: bagelSetsWonByWinner,
    });

    for (const s of args.sets) {
      await ctx.db.insert("match_sets", {
        matchId,
        setNumber: s.setNumber,
        winnerGames: s.winnerGames,
        loserGames: s.loserGames,
        winnerTiebreak: s.winnerTiebreak,
        loserTiebreak: s.loserTiebreak,
      });
    }

    // Update win streaks in ladder_members
    // Winner's streak increases by 1
    if (winnerMember) {
      await ctx.db.patch(winnerMember._id, {
        winStreak: winnerMember.winStreak + 1,
        lastMatchAt: args.matchDate,
        ladderPoints: winnerMember.ladderPoints + winnerPointsAwarded,
      });
    }

    // Loser's streak resets to 0
    const loserMember = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder_and_user", (q) =>
        q.eq("ladderId", args.ladderId).eq("userId", args.loserId)
      )
      .unique();

    if (loserMember) {
      await ctx.db.patch(loserMember._id, {
        winStreak: 0,
        lastMatchAt: args.matchDate,
        ladderPoints: loserMember.ladderPoints + loserPointsAwarded,
      });
    }

    return matchId;
  },
});

/**
 * 1) All singles matches for a user within a ladder (newest first),
 *    with sets attached and user info.
 */
export const listUserMatchesInLadder = query({
  args: {
    ladderId: v.id("ladders"),
    userId: v.id("users"),
    limit: v.optional(v.number()),      // optional soft cap (e.g., 50)
  },
  returns: v.object({
    matches: v.array(v.object({
      _id: v.id("matches"),
      _creationTime: v.number(),
      ladderId: v.id("ladders"),
      matchDate: v.number(),
      winnerId: v.id("users"),
      loserId: v.id("users"),
      createdAt: v.number(),
      winnerPointsAwarded: v.optional(v.number()),
      loserPointsAwarded: v.optional(v.number()),
      winStreakBonus: v.optional(v.boolean()),
      straightSets: v.optional(v.boolean()),
      bagelSetsWonByWinner: v.optional(v.number()),
      sets: v.array(v.object({
        _id: v.id("match_sets"),
        _creationTime: v.number(),
        matchId: v.id("matches"),
        setNumber: v.number(),
        winnerGames: v.number(),
        loserGames: v.number(),
        winnerTiebreak: v.optional(v.number()),
        loserTiebreak: v.optional(v.number()),
      })),
      opponent: v.object({
        _id: v.id("users"),
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
        city: v.optional(v.string()),
        status: v.optional(v.string()),
      }),
    })),
  }),
  handler: async (ctx, { ladderId, userId, limit }) => {
    // Get user info
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

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

    // Attach sets and opponent info for each match
    const matches = await Promise.all(
      trimmed.map(async (m) => {
        const sets = await ctx.db
          .query("match_sets")
          .withIndex("by_match", (q) => q.eq("matchId", m._id))
          .collect();
        // sort sets by setNumber just in case
        sets.sort((a, b) => a.setNumber - b.setNumber);
        
        // Get opponent info
        const opponentId = m.winnerId === userId ? m.loserId : m.winnerId;
        const opponent = await ctx.db.get(opponentId);
        if (!opponent) {
          throw new Error("Opponent not found");
        }
        
        return { 
          ...m,
          sets,
          opponent: {
            _id: opponent._id,
            name: opponent.name,
            email: opponent.email,
            imageUrl: opponent.imageUrl,
          }
        };
      })
    );

    return {
      matches,
    };
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

/**
 * Get recent opponents for a user in a ladder (last 10 unique opponents)
 */
export const getRecentOpponents = query({
  args: {
    ladderId: v.id("ladders"),
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { ladderId, userId, limit = 10 }) => {
    // Get all matches for the user in this ladder
    const won = await ctx.db
      .query("matches")
      .withIndex("by_winner", (q) => q.eq("winnerId", userId))
      .collect();

    const lost = await ctx.db
      .query("matches")
      .withIndex("by_loser", (q) => q.eq("loserId", userId))
      .collect();

    const matches = [...won, ...lost]
      .filter((m) => m.ladderId === ladderId)
      .sort((a, b) => b.matchDate - a.matchDate);

    // Extract unique opponent IDs, keeping most recent first
    const opponentIds = new Set<Id<"users">>();
    const opponents: Id<"users">[] = [];

    for (const match of matches) {
      const opponentId = match.winnerId === userId ? match.loserId : match.winnerId;
      if (!opponentIds.has(opponentId)) {
        opponentIds.add(opponentId);
        opponents.push(opponentId);
        if (opponents.length >= limit) break;
      }
    }

    // Get user details for opponents
    const opponentDetails = await Promise.all(
      opponents.map(async (opponentId) => {
        const user = await ctx.db.get(opponentId);
        return user;
      })
    );

    return opponentDetails.filter(Boolean); // Filter out null values
  },
});

/**
 * Get all users in a ladder except the current user
 */
export const getOpponentsInLadder = query({
  args: {
    ladderId: v.id("ladders"),
  },
  handler: async (ctx, { ladderId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUserEmail = identity.email ?? "N/A";

    // Get all ladder members
    const ladderMembers = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder", (q) => q.eq("ladderId", ladderId))
      .collect();

    const userDetails = await Promise.all(
      ladderMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return user;
      })
    );

    // Filter out current user by email and null values
    return userDetails.filter((user): user is NonNullable<typeof user> =>
      user !== null && user.email !== currentUserEmail
    );
  },
});

