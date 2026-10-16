import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api } from "../../convex/_generated/api";

export default function TenantLayout() {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (user === null) {
      router.replace("/");
      return;
    }
    if (user && user.role !== "tenant") {
      router.replace("/(tabs)/dashboard");
    }
  }, [user, isAuthenticated]);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Checking account...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <Text
            style={{ color: "#DC2626", fontWeight: "600", marginRight: 16 }}
            onPress={() => void signOut().then(() => router.replace("/"))}
          >
            Logout
          </Text>
        ),
      }}
    />
  );
}
