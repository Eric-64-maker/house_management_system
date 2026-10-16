import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Dashboard() {
  const houses = useQuery(api.houses.getHouses);
  const tenants = useQuery(api.tenants.getTenants);
  const bills = useQuery(api.bills.getBills);

  if (
    houses === undefined ||
    tenants === undefined ||
    bills === undefined
  ) {
    return (
      <View style={styles.loading}>
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  const occupied = houses.filter(
    (h) => h.status === "Occupied"
  ).length;

  const vacant = houses.filter(
    (h) => h.status === "Vacant"
  ).length;

  const unpaidBills = bills.filter(
    (b) => b.status === "Unpaid"
  ).length;

  const dashboardData = [
    {
      title: "Total Houses",
      value: houses.length,
      color: "#2563EB",
      icon: "home-outline",
    },
    {
      title: "Occupied",
      value: occupied,
      color: "#16A34A",
      icon: "business-outline",
    },
    {
      title: "Vacant",
      value: vacant,
      color: "#F59E0B",
      icon: "bed-outline",
    },
    {
      title: "Tenants",
      value: tenants.length,
      color: "#7C3AED",
      icon: "people-outline",
    },
    {
      title: "Pending Bills",
      value: unpaidBills,
      color: "#DC2626",
      icon: "receipt-outline",
    },
    {
      title: "Messages",
      value: 0,
      color: "#0891B2",
      icon: "chatbubble-outline",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.title}>Landlord Dashboard</Text>
        </View>

        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color="#fff" />
        </View>
      </View>

      <View style={styles.grid}>
        {dashboardData.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.card}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={28}
                color="white"
              />
            </View>

            <Text style={styles.number}>
              {item.value}
            </Text>

            <Text style={styles.label}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/house/add")}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="#2563EB"
          />
          <Text style={styles.actionText}>
            Add New House
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/tenant/add")}
        >
          <Ionicons
            name="person-add-outline"
            size={24}
            color="#16A34A"
          />
          <Text style={styles.actionText}>
            Register Tenant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/admin/tenant-view")}
        >
          <Ionicons name="person-outline" size={24} color="#0891B2" />
          <Text style={styles.actionText}>Open Tenant Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/bill/generate")}
        >
          <Ionicons
            name="receipt-outline"
            size={24}
            color="#DC2626"
          />
          <Text style={styles.actionText}>
            Generate Bills
          </Text>
        </TouchableOpacity>

      </View>
      <TouchableOpacity
  style={styles.actionButton}
  onPress={() => router.push("/(tabs)/report")}
>
  <Ionicons
    name="bar-chart-outline"
    size={24}
    color="#7C3AED"
  />
  <Text style={styles.actionText}>
    Reports
  </Text>
</TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 18,
  },

  header: {
    marginTop: 60,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcome: {
    color: "#6B7280",
    fontSize: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 5,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 4,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  number: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  label: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },

  section: {
    marginTop: 25,
    marginBottom: 40,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  actionButton: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },

  actionText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "600",
  },
});