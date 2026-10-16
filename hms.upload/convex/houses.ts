import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./users";

export const getHouses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User account not found.");

    if (user.role === "admin") {
      return await ctx.db.query("houses").collect();
    }

    if (user.role === "tenant" && user.tenantId) {
      const tenant = await ctx.db.get(user.tenantId);
      if (!tenant) return [];
      const house = await ctx.db.get(tenant.houseId);
      return house ? [house] : [];
    }

    return [];
  },
});

export const addHouse = mutation({
  args: {
    houseNumber: v.string(),
    houseType: v.string(),
    rent: v.number(),
    status: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("houses", args);
  },
});

export const updateHouse = mutation({
  args: {
    id: v.id("houses"),
    houseNumber: v.string(),
    houseType: v.string(),
    rent: v.number(),
    status: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteHouse = mutation({
  args: { id: v.id("houses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const tenant = await ctx.db
      .query("tenants")
      .filter((q) => q.eq(q.field("houseId"), args.id))
      .first();

    if (tenant) {
      throw new ConvexError("Cannot delete an occupied house. Remove the tenant first.");
    }

    const bills = await ctx.db
      .query("bills")
      .filter((q) => q.eq(q.field("houseId"), args.id))
      .collect();

    if (bills.length > 0) {
      throw new ConvexError("Cannot delete a house that has billing records.");
    }

    await ctx.db.delete(args.id);
  },
});
