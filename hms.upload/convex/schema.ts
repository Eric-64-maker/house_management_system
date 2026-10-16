import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Convex Auth's users table with the House Manager profile fields.
  // Fields are optional so existing development documents do not immediately
  // become invalid while the authentication system is migrated.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    role: v.optional(v.union(v.literal("admin"), v.literal("tenant"))),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
    tenantId: v.optional(v.id("tenants")),
    createdAt: v.optional(v.string()),

    // Legacy field kept optional only so old development documents remain readable.
    password: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_status", ["status"]),

  houses: defineTable({
    houseNumber: v.string(),
    houseType: v.string(),
    rent: v.number(),
    status: v.string(),
    description: v.optional(v.string()),
  }),

  tenants: defineTable({
    userId: v.optional(v.id("users")),
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    nationalId: v.string(),
    houseId: v.id("houses"),
    moveInDate: v.string(),
    emergencyContact: v.string(),
  }).index("by_userId", ["userId"]),

  bills: defineTable({
    tenantId: v.id("tenants"),
    houseId: v.id("houses"),
    month: v.string(),
    rent: v.number(),
    water: v.number(),
    electricity: v.number(),
    otherCharges: v.number(),
    total: v.number(),
    status: v.string(),
    paymentMethod: v.optional(v.string()),
    reference: v.optional(v.string()),
    paymentDate: v.optional(v.string()),
  }),

  messages: defineTable({
    tenantId: v.id("tenants"),
    sender: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    email: v.optional(v.string()),
    sentAt: v.string(),
    status: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_tenantId", ["tenantId"]),
});
