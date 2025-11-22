import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const authUser = await authComponent.safeGetAuthUser(ctx)

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", identity.email ?? "N/A"),
      )
      .unique();
    if (user !== null) {
      if (user.name !== identity.name || authUser?.image?.toString() !== user.imageUrl) {
        await ctx.db.patch(user._id, { name: identity.name, imageUrl: authUser?.image?.toString() ?? undefined });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "N/A",
      lastLogin: typeof identity.lastLogin === 'number' ? identity.lastLogin : Date.now(),
      imageUrl: authUser?.image?.toString() ?? undefined,
    });
  },
});

export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    return user;
  },
});

export const getCurrentUserByAuth = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      lastLogin: v.number(),
      imageUrl: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      availability: v.optional(v.string()),
      city: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", identity.email ?? "N/A"),
      )
      .unique();
    
    return user ?? null;
  },
});

export const updateUserSettings = mutation({
  args: {
    phoneNumber: v.optional(v.string()),
    availability: v.optional(v.string()),
    city: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called updateUserSettings without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", identity.email ?? "N/A"),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      phoneNumber: args.phoneNumber,
      availability: args.availability,
      city: args.city,
      status: args.status,
    });

    return null;
  },
});
