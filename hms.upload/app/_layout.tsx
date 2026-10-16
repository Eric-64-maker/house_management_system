import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Stack } from "expo-router";
import { authStorage } from "../lib/authStorage";
import { convex } from "../lib/convex";

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={authStorage}>
      <Stack screenOptions={{ headerShown: false }} />
    </ConvexAuthProvider>
  );
}
