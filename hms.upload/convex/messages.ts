import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { requireAdmin } from "./users";

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User account not found.");

    const messages = await ctx.db.query("messages").collect();
    if (user.role === "admin") return messages;
    if (user.role === "tenant" && user.tenantId) {
      return messages.filter((message) => message.tenantId === user.tenantId);
    }
    return [];
  },
});

export const getTenantMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");
    const user = await ctx.db.get(userId);
    if (!user?.tenantId) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_tenantId", (q) => q.eq("tenantId", user.tenantId!))
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    tenantId: v.id("tenants"),
    sender: v.string(),
    subject: v.string(),
    message: v.string(),
    sentAt: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User account not found.");

    if (user.role === "admin") {
      return await ctx.db.insert("messages", args);
    }

    if (user.role === "tenant" && user.tenantId === args.tenantId && args.sender === "tenant") {
      return await ctx.db.insert("messages", args);
    }

    throw new ConvexError("You are not allowed to send this message.");
  },
});

export const markAsRead = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be logged in.");
    const user = await ctx.db.get(userId);
    const message = await ctx.db.get(args.id);
    if (!user || !message) throw new ConvexError("Message not found.");

    if (user.role !== "admin" && message.tenantId !== user.tenantId) {
      throw new ConvexError("You are not allowed to modify this message.");
    }

    await ctx.db.patch(args.id, { status: "Read" });
  },
});

export const deleteMessage = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found.");
    await ctx.db.delete(args.id);
  },
});
