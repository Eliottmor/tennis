import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", identity.email ?? "N/A"),
      )
      .unique();
    if (user !== null) {
      if (user.name !== identity.name || user.imageUrl !== identity.pictureUrl?.toString()) {
        await ctx.db.patch(user._id, { name: identity.name, imageUrl: identity.pictureUrl?.toString() ?? undefined });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "N/A",
      lastLogin: typeof identity.lastLogin === 'number' ? identity.lastLogin : Date.now(),
      imageUrl: identity.pictureUrl?.toString() ?? undefined,
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
