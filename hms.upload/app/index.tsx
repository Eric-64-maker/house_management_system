import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../convex/_generated/api";

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && user === undefined)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Signed in: send each person to the right place
  if (isAuthenticated && user) {
    if (user.role === "admin" && user.status === "approved") {
      return <Redirect href="/(tabs)/dashboard" />;
    }
    if (user.role === "tenant" && user.status === "approved") {
      return <Redirect href="/tenant/home" />;
    }
    return (
      <View style={styles.loading}>
        <Ionicons
          name={user.status === "rejected" ? "close-circle-outline" : "time-outline"}
          size={64}
          color={user.status === "rejected" ? "#DC2626" : "#F59E0B"}
        />
        <Text style={[styles.title, { marginTop: 16, fontSize: 22 }]}>
          {user.status === "rejected" ? "Account Rejected" : "Waiting for Approval"}
        </Text>
        <Text style={[styles.subtitle, { marginBottom: 24 }]}>
          {user.status === "rejected"
            ? "Your account was rejected. Please contact the landlord."
            : "Your account is waiting for landlord approval."}
        </Text>
        <TouchableOpacity onPress={() => void signOut()}>
          <Text style={{ color: "#DC2626", fontWeight: "600" }}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Signed in but the user record is gone: clear the stale session
  if (isAuthenticated && user === null) {
    void signOut();
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logo}>
          <Ionicons name="home" size={55} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>House Manager</Text>
        <Text style={styles.subtitle}>
          Manage property and rental activities easily.
        </Text>
      </View>

      <View style={styles.roles}>
        <Text style={styles.continueText}>Continue as</Text>

        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/login?role=landlord")}
          >
            <View style={styles.iconBox}>
              <Ionicons name="business-outline" size={32} color="#2563EB" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Landlord / Admin</Text>
              <Text style={styles.cardDescription}>
                Manage houses, tenants, bills and reports
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
          </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/login?role=tenant")}
        >
          <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="person-outline" size={32} color="#16A34A" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Tenant</Text>
            <Text style={styles.cardDescription}>
              View bills, messages and your rental account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>House Management System</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 25,
    paddingVertical: 60,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    marginTop: 30,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  roles: {
    gap: 18,
  },
  continueText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  cardDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  adminHint: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    paddingHorizontal: 20,
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
  },
});
