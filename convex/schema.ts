import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    name: v.string(),
    lastLogin: v.number(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    availability: v.optional(v.string()),
    city: v.optional(v.string()),
    status: v.optional(v.string()),
  }).index("by_email", ["email"]),
  
  ladders: defineTable({
    name: v.string(),
    password: v.optional(v.string()),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(),   // Unix timestamp
    createdBy: v.id("users"),
    isActive: v.boolean(),
    algorithm: v.string(),
  }).index("by_created_by", ["createdBy"]),
  
  ladder_members: defineTable({
    ladderId: v.id("ladders"),
    userId: v.id("users"),
    joinedAt: v.number(), // Unix timestamp

    ladderPoints: v.number(),
    winStreak: v.number(),
    lastMatchAt: v.optional(v.number()),
  })
    .index("by_ladder", ["ladderId"])
    .index("by_user", ["userId"])
    .index("by_ladder_and_user", ["ladderId", "userId"]),

  matches: defineTable({
    ladderId: v.id("ladders"),
    matchDate: v.number(), // Unix ms
    winnerId: v.id("users"),
    loserId: v.id("users"),
    createdAt: v.number(),

    winnerPointsAwarded: v.optional(v.number()),
    loserPointsAwarded: v.optional(v.number()),

    winStreakBonus: v.optional(v.boolean()),
    straightSets: v.boolean(),
    bagelSetsWonByWinner: v.number()
  })
    .index("by_ladder", ["ladderId"])
    .index("by_winner", ["winnerId"])
    .index("by_loser", ["loserId"]),

  match_sets: defineTable({
    matchId: v.id("matches"),
    setNumber: v.number(),
    winnerGames: v.number(),
    loserGames: v.number(),
    winnerTiebreak: v.optional(v.number()),
    loserTiebreak: v.optional(v.number()),
  })
    .index("by_match", ["matchId"]),
});
