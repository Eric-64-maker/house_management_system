import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

// ---------- HELPERS ----------
export async function requireUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("You must be logged in.");
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User account not found.");
  return user;
}

export async function requireAdmin(ctx: any) {
  const user = await requireUser(ctx);
  if (user.role !== "admin" || user.status !== "approved") {
    throw new ConvexError("Administrator access required.");
  }
  return user;
}

// ---------- AUTH / CURRENT USER ----------
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// ---------- BOOTSTRAP ADMIN (no login required, one-time only) ----------
export const bootstrapAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // 1. Refuse if an admin already exists — bootstrap is one-shot.
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    if (existingAdmin) {
      throw new ConvexError(
        "An administrator already exists. Bootstrap is closed."
      );
    }

    // 2. The user must have signed up already (their row must exist).
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new ConvexError(
        `No user found with email ${email}. Sign up in the app first.`
      );
    }

    // 3. Promote them.
    await ctx.db.patch(user._id, {
      role: "admin",
      status: "approved",
    });

    return `Promoted ${email} to admin.`;
  },
});

// ---------- LEGACY PASSWORD CLEANUP ----------
export const cleanupLegacyPasswords = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const expected = process.env.ADMIN_BOOTSTRAP_CODE;
    if (!expected || args.code !== expected) {
      throw new ConvexError("Invalid administrator code.");
    }

    const users = await ctx.db.query("users").collect();
    let cleaned = 0;
    for (const user of users) {
      if (user.password !== undefined) {
        await ctx.db.patch(user._id, { password: undefined });
        cleaned += 1;
      }
    }
    return cleaned;
  },
});

// ---------- ADMIN: PENDING USERS ----------
export const getPendingUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// ---------- ADMIN: APPROVE TENANT ----------
export const approveUser = mutation({
  args: {
    userId: v.id("users"),
    houseId: v.id("houses"),
    nationalId: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");
    if (user.role !== "tenant")
      throw new ConvexError("Only tenant accounts can be approved.");
    if (user.status !== "pending")
      throw new ConvexError("This account has already been processed.");

    const house = await ctx.db.get(args.houseId);
    if (!house) throw new ConvexError("Selected house does not exist.");
    if (house.status === "Occupied")
      throw new ConvexError("This house is already occupied.");

    const tenantId = await ctx.db.insert("tenants", {
      userId: args.userId,
      fullName: user.name ?? "Tenant",
      phone: user.phone ?? "",
      email: user.email ?? "",
      nationalId: args.nationalId,
      houseId: args.houseId,
      moveInDate: new Date().toISOString().split("T")[0],
      emergencyContact: args.emergencyContact,
    });

    await ctx.db.patch(args.houseId, { status: "Occupied" });
    await ctx.db.patch(args.userId, { status: "approved", tenantId });

    return tenantId;
  },
});

// ---------- ADMIN: REJECT TENANT ----------
export const rejectUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.id);
    if (!user) throw new ConvexError("User not found.");
    if (user.role !== "tenant")
      throw new ConvexError("Only tenant accounts can be rejected.");
    await ctx.db.patch(args.id, { status: "rejected" });
  },
});