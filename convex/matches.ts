import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

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

    const matchId = await ctx.db.insert("matches", {
      ladderId: args.ladderId,
      matchDate: args.matchDate,
      winnerId: args.winnerId,
      loserId: args.loserId,
      createdAt: now,
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

    return matchId;
  },
});

