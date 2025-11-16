import { v, ConvexError } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Create a new ladder
 */
export const createLadder = mutation({
  args: {
    name: v.string(),
    password: v.optional(v.string()),
    startDate: v.number(), // Unix timestamp
    endDate: v.number(),   // Unix timestamp
    createdBy: v.id("users"),
    autoAddCreator: v.optional(v.boolean()),
    algorithm: v.optional(v.string()),
  },
  returns: v.object({
    ladderId: v.id("ladders"),
  }),
  handler: async (ctx, args) => {
    // Validate dates
    if (args.startDate >= args.endDate) {
      throw new Error("Start date must be before end date");
    }
    
    // Check if user exists
    const user = await ctx.db.get(args.createdBy);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Create the ladder
    const ladderId = await ctx.db.insert("ladders", {
      name: args.name,
      password: args.password,
      startDate: args.startDate,
      endDate: args.endDate,
      createdBy: args.createdBy,
      isActive: true,
      algorithm: args.algorithm || "points_v1",
    });
    
    // Automatically add the creator as a member
    if (args.autoAddCreator) {
      await ctx.db.insert("ladder_members", {
        ladderId,
        userId: args.createdBy,
        joinedAt: Date.now(),
        ladderPoints: 0,
        winStreak: 0,
      });
    }
    
    return { ladderId };
  },
});

/**
 * Add a user to a ladder
 */
export const addUserToLadder = mutation({
  args: {
    ladderId: v.id("ladders"),
    password: v.optional(v.string()), // Required if ladder has password protection
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      throw new ConvexError({ code: "USER_NOT_AUTHENTICATED" });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", userIdentity.email ?? ""))
      .unique()

    if (!user) throw new ConvexError({ code: "USER_NOT_FOUND" });

    const ladder = await ctx.db.get(args.ladderId);
    if (!ladder) {
      throw new ConvexError({ code: "LADDER_NOT_FOUND" });
    }
    if (!ladder.isActive) {
      throw new ConvexError({ code: "LADDER_INACTIVE" });
    }

    // Check if ladder has ended
    if (Date.now() > ladder.endDate) {
      throw new ConvexError({ code: "LADDER_ENDED" });
    }

    // Check if ladder has password protection
    if (ladder.password && ladder.password !== args.password) {
      throw new ConvexError({ code: "INVALID_PASSWORD" });
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder_and_user", (q) =>
        q.eq("ladderId", args.ladderId).eq("userId", user._id)
      )
      .unique();

    if (existingMembership) {
      throw new ConvexError({ code: "ALREADY_MEMBER" });
    }

    // Add user to ladder
    await ctx.db.insert("ladder_members", {
      ladderId: args.ladderId,
      userId: user._id,
      joinedAt: Date.now(),
      ladderPoints: 0,
      winStreak: 0,
    });

    return {
      success: true,
      message: "User added to ladder",
    }
  },
});

export const getAllLadders = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("ladders"),
    _creationTime: v.number(),
    name: v.string(),
    hasPassword: v.boolean(),
    startDate: v.number(),
    endDate: v.number(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    // Inline user info for convenience:
    creator: v.optional(v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
    })),
  })),
  handler: async (ctx) => {
    // 1) Fetch ladders
    const ladders = await ctx.db.query("ladders").collect()

    // 2) Collect unique user IDs
    const userIds = Array.from(
      new Set(ladders.map(l => l.createdBy) as Id<"users">[])
    )

    // 3) Batch fetch users in parallel and index by id
    const users = await Promise.all(userIds.map(id => ctx.db.get(id)))
    const usersById = new Map(
      users.filter(Boolean).map(u => [u!._id, u!])
    )

    // 4) Shape the response with an inline `creator`
    return ladders.map(ladder => {
      const u = usersById.get(ladder.createdBy)
      return {
        _id: ladder._id,
        _creationTime: ladder._creationTime,
        name: ladder.name,
        hasPassword: !!ladder.password,
        startDate: ladder.startDate,
        endDate: ladder.endDate,
        createdBy: ladder.createdBy,
        isActive: ladder.isActive,
        creator: u && {
          _id: u._id,
          name: u.name,
          email: u.email,
        },
      }
    })
  },
})

/**
 * Get a single ladder by ID with full details
 */
export const getLadderById = query({
  args: {
    ladderId: v.id("ladders"),
  },
  returns: v.object({
    _id: v.id("ladders"),
    _creationTime: v.number(),
    name: v.string(),
    hasPassword: v.boolean(),
    startDate: v.number(),
    endDate: v.number(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const ladder = await ctx.db.get(args.ladderId);
    if (!ladder) {
      throw new Error("Ladder not found");
    }
    return {
      _id: ladder._id,
      _creationTime: ladder._creationTime,
      name: ladder.name,
      hasPassword: !!ladder.password,
      startDate: ladder.startDate,
      endDate: ladder.endDate,
      createdBy: ladder.createdBy,
      isActive: ladder.isActive,
    };
  },
});

/**
 * Remove a user from a ladder
 */
export const removeUserFromLadder = mutation({
  args: {
    ladderId: v.id("ladders"),
    userId: v.id("users"),
    removedBy: v.id("users"), // User performing the removal
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if ladder exists
    const ladder = await ctx.db.get(args.ladderId);
    if (!ladder) {
      throw new Error("Ladder not found");
    }
    
    // Only ladder creator can remove users
    if (ladder.createdBy !== args.removedBy) {
      throw new Error("Only ladder creator can remove users");
    }
    
    // Check if user is a member
    const membership = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder_and_user", (q) => 
        q.eq("ladderId", args.ladderId).eq("userId", args.userId)
      )
      .unique();
    
    if (!membership) {
      throw new Error("User is not a member of this ladder");
    }

    // Delete the membership record completely
    await ctx.db.delete(membership._id);
    console.log(`User ${args.userId} removed from ladder ${args.ladderId} by ${args.removedBy}`);

    return null;
  },
});

/**
 * Get all ladders created by a user
 */
export const getLaddersByUser = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(v.object({
    _id: v.id("ladders"),
    name: v.string(),
    password: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    memberCount: v.number(),
  })),
  handler: async (ctx, args) => {
    const ladders = await ctx.db
      .query("ladders")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .collect();
    
    // Get member count for each ladder
    const laddersWithMemberCount = await Promise.all(
      ladders.map(async (ladder) => {
        const memberCount = await ctx.db
          .query("ladder_members")
          .withIndex("by_ladder", (q) => q.eq("ladderId", ladder._id))
          .collect();
        
        return {
          ...ladder,
          memberCount: memberCount.length,
        };
      })
    );
    
    return laddersWithMemberCount;
  },
});

/**
 * Get all members of a ladder with their win/loss records
 */
export const getLadderMembers = query({
  args: {
    ladderId: v.id("ladders"),
  },
  returns: v.array(v.object({
    _id: v.id("ladder_members"),
    userId: v.id("users"),
    userName: v.string(),
    userEmail: v.string(),
    joinedAt: v.number(),
    wins: v.number(),
    losses: v.number(),
    points: v.number(),
    winStreak: v.number(),
  })),
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder", (q) => q.eq("ladderId", args.ladderId))
      .collect();
    
    // Get user details and win/loss stats for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) {
          throw new Error("User not found");
        }
        
        // Calculate win/loss record for this user in this ladder
        const won = await ctx.db
          .query("matches")
          .withIndex("by_winner", (q) => q.eq("winnerId", member.userId))
          .collect();

        const lost = await ctx.db
          .query("matches")
          .withIndex("by_loser", (q) => q.eq("loserId", member.userId))
          .collect();

        const matches = [...won, ...lost].filter((m) => m.ladderId === args.ladderId);
        
        let wins = 0;
        let losses = 0;
        
        for (const match of matches) {
          if (match.winnerId === member.userId) {
            wins += 1;
          } else {
            losses += 1;
          }
        }
        
        return {
          _id: member._id,
          userId: member.userId,
          userName: user.name,
          userEmail: user.email,
          joinedAt: member.joinedAt,
          wins,
          losses,
          points: member.ladderPoints,
          winStreak: member.winStreak,
        };
      })
    );
    
    return membersWithDetails;
  },
});

/**
 * Get all ladders a user is a member of
 */
export const getUserLadders = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(v.object({
    _id: v.id("ladders"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    joinedAt: v.number(),
  })),
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("ladder_members")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get ladder details for each membership
    const userLadders = await Promise.all(
      memberships.map(async (membership) => {
        const ladder = await ctx.db.get(membership.ladderId);
        if (!ladder) {
          throw new Error("Ladder not found");
        }

        return {
          _id: ladder._id,
          name: ladder.name,
          startDate: ladder.startDate,
          endDate: ladder.endDate,
          createdBy: ladder.createdBy,
          isActive: ladder.isActive,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return userLadders;
  },
});

/**
 * Check if a user is a member of a specific ladder
 */
export const isUserMemberOfLadder = query({
  args: {
    ladderId: v.id("ladders"),
    userId: v.optional(v.id("users")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // If no userId is provided, return false
    if (!args.userId) {
      return false;
    }
    
    const membership = await ctx.db
      .query("ladder_members")
      .withIndex("by_ladder_and_user", (q) =>
        q.eq("ladderId", args.ladderId).eq("userId", args.userId!)
      )
      .unique();

    return !!membership;
  },
});

// ===== CRON JOB HELPER FUNCTIONS =====

/**
 * Get all active ladders that have expired (endDate < now)
 * This is used by the cron job to find ladders to deactivate
 */
export const getExpiredLadders = internalQuery({
  args: {},
  returns: v.array(v.object({
    _id: v.id("ladders"),
    name: v.string(),
    endDate: v.number(),
  })),
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("ladders")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.lt(q.field("endDate"), now)
        )
      )
      .collect();
  },
});

/**
 * Deactivate a ladder (set isActive to false)
 * This is used by the cron job to deactivate expired ladders
 */
export const deactivateLadder = internalMutation({
  args: { 
    ladderId: v.id("ladders") 
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ladderId, { isActive: false });
    return null;
  },
});

/**
 * Manually activate/deactivate a ladder (for admin use)
 */
export const setLadderActiveStatus = mutation({
  args: { 
    ladderId: v.id("ladders"),
    isActive: v.boolean(),
    updatedBy: v.id("users")
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ladder = await ctx.db.get(args.ladderId);
    if (!ladder) {
      throw new Error("Ladder not found");
    }
    
    // Only ladder creator can change active status
    if (ladder.createdBy !== args.updatedBy) {
      throw new Error("Only ladder creator can change ladder status");
    }
    
    await ctx.db.patch(args.ladderId, { isActive: args.isActive });
    return null;
  },
});

/**
 * Main cron job function to deactivate expired ladders
 * This is called by the scheduler every hour
 */
export const deactivateExpiredLadders = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all expired ladders
    const expiredLadders = await ctx.runQuery(internal.ladders.getExpiredLadders, {});
    
    console.log(`Found ${expiredLadders.length} expired ladders to deactivate`);
    
    // Deactivate each expired ladder
    for (const ladder of expiredLadders) {
      await ctx.runMutation(internal.ladders.deactivateLadder, { 
        ladderId: ladder._id 
      });
      console.log(`Deactivated ladder: ${ladder.name} (ended: ${new Date(ladder.endDate).toISOString()})`);
    }
    
    return null;
  },
});
