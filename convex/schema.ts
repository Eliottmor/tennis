import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  users: defineTable({
    name: v.string(),
    lastLogin: v.number(),
    email: v.string(),
  }).index("by_email", ["email"]),
  
  ladders: defineTable({
    name: v.string(),
    password: v.optional(v.string()),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(),   // Unix timestamp
    createdBy: v.id("users"),
    isActive: v.boolean(),
  }).index("by_created_by", ["createdBy"]),
  
  ladder_members: defineTable({
    ladderId: v.id("ladders"),
    userId: v.id("users"),
    joinedAt: v.number(), // Unix timestamp
  })
    .index("by_ladder", ["ladderId"])
    .index("by_user", ["userId"])
    .index("by_ladder_and_user", ["ladderId", "userId"]),
});
