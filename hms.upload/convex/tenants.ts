import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./users";

export const getTenants = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("tenants").collect();
  },
});

export const getCurrentTenant = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");

    return await ctx.db
      .query("tenants")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const addTenant = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    nationalId: v.string(),
    houseId: v.id("houses"),
    moveInDate: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const house = await ctx.db.get(args.houseId);
    if (!house) throw new ConvexError("House not found.");
    if (house.status === "Occupied") throw new ConvexError("House is already occupied.");
    await ctx.db.patch(args.houseId, { status: "Occupied" });
    return await ctx.db.insert("tenants", args);
  },
});

export const updateTenant = mutation({
  args: {
    id: v.id("tenants"),
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    nationalId: v.string(),
    houseId: v.id("houses"),
    moveInDate: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new ConvexError("Tenant not found.");

    if (existing.houseId !== args.houseId) {
      const newHouse = await ctx.db.get(args.houseId);
      if (!newHouse) throw new ConvexError("New house not found.");
      if (newHouse.status === "Occupied") throw new ConvexError("New house is already occupied.");
      await ctx.db.patch(existing.houseId, { status: "Vacant" });
      await ctx.db.patch(args.houseId, { status: "Occupied" });
    }

    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteTenant = mutation({
  args: { id: v.id("tenants") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const tenant = await ctx.db.get(args.id);
    if (!tenant) throw new ConvexError("Tenant not found.");

    await ctx.db.patch(tenant.houseId, { status: "Vacant" });

    const bills = await ctx.db.query("bills").collect();
    for (const bill of bills.filter((b) => b.tenantId === args.id)) {
      await ctx.db.delete(bill._id);
    }

    const messages = await ctx.db.query("messages").collect();
    for (const message of messages.filter((m) => m.tenantId === args.id)) {
      await ctx.db.delete(message._id);
    }

    if (tenant.userId) {
      const user = await ctx.db.get(tenant.userId);
      if (user?.tenantId === args.id) {
        await ctx.db.patch(tenant.userId, {
          tenantId: undefined,
          status: "rejected",
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});
