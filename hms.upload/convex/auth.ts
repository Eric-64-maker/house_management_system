import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

const PasswordProvider = Password({
  validatePasswordRequirements(password: string) {
    if (password.length < 8) {
      throw new ConvexError("Password must be at least 8 characters long.");
    }
  },
  profile(params): { email: string; name?: string; phone?: string } {
  const email = String(params.email ?? "").trim().toLowerCase();
  const name = String(params.name ?? "").trim();
  const phone = String(params.phone ?? "").trim();
  const flow = params.flow as "signUp" | "signIn" | undefined;

  if (!email || !email.includes("@")) {
    throw new ConvexError("Enter a valid email address.");
  }

  // Sign-in sends only email + password — don't require name/phone.
  if (flow === "signIn") {
    return { email };
  }

  // Sign-up flow: require the profile fields.
  if (!name) throw new ConvexError("Full name is required.");
  if (!phone) throw new ConvexError("Phone number is required.");

  return { email, name, phone };
},
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [PasswordProvider],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, profile }) {
      // Only run on first account creation
      if (existingUserId) return;

      await ctx.db.patch(userId, {
        role: "tenant",
        status: "pending",
        phone: profile.phone as string | undefined,
        createdAt: new Date().toISOString(),
      });
    },
  },
});