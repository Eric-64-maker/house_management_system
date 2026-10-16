import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./users";

export const getBills = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User account not found.");

    const bills = await ctx.db.query("bills").collect();
    if (user.role === "admin") return bills;

    if (user.role === "tenant" && user.tenantId) {
      return bills.filter((bill) => bill.tenantId === user.tenantId);
    }
    return [];
  },
});

export const addBill = mutation({
  args: {
    tenantId: v.id("tenants"),
    houseId: v.id("houses"),
    month: v.string(),
    rent: v.number(),
    water: v.number(),
    electricity: v.number(),
    otherCharges: v.number(),
    total: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("bills", args);
  },
});

export const markAsPaid = mutation({
  args: {
    id: v.id("bills"),
    paymentMethod: v.string(),
    reference: v.string(),
    paymentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    void user;
    const bill = await ctx.db.get(args.id);
    if (!bill) throw new ConvexError("Bill not found.");
    await ctx.db.patch(args.id, {
      status: "Paid",
      paymentMethod: args.paymentMethod,
      reference: args.reference,
      paymentDate: args.paymentDate,
    });
  },
});

export const deleteBill = mutation({
  args: { id: v.id("bills") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const bill = await ctx.db.get(args.id);
    if (!bill) throw new ConvexError("Bill not found.");
    await ctx.db.delete(args.id);
  },
});
