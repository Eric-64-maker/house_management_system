import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api } from "../../convex/_generated/api";

export default function TabLayout() {
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (user === null) {
      router.replace("/");
      return;
    }
    if (user && (user.role !== "admin" || user.status !== "approved")) {
      router.replace("/tenant/home");
    }
  }, [user, isAuthenticated, isLoading]);

  if (isLoading || user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Checking administrator access...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#DC2626"
            style={{ marginRight: 18 }}
            onPress={() => {
              void signOut().then(() => router.replace("/"));
            }}
          />
        ),
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="houses" options={{ title: "Houses", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="tenants" options={{ title: "Tenants", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="report" options={{ title: "Reports", tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="bills" options={{ title: "Bills", tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="approvals" options={{ title: "Approvals", tabBarIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}