import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

export default function TenantHome() {
  const tenant = useQuery(api.tenants.getCurrentTenant);
  const houses = useQuery(api.houses.getHouses);
  const bills = useQuery(api.bills.getBills);
  const messages = useQuery(api.messages.getMessages);

  if (
    tenant === undefined ||
    houses === undefined ||
    bills === undefined ||
    messages === undefined
  ) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.loading}>
        <Ionicons
          name="time-outline"
          size={70}
          color="#F59E0B"
        />

        <Text style={styles.pendingTitle}>
          Account Pending
        </Text>

        <Text style={styles.pendingText}>
          Your registration has not been approved by the
          landlord yet.
        </Text>
      </View>
    );
  }

  const house = houses.find(
    (item) => item._id === tenant.houseId
  );

  const myBills = bills.filter(
    (bill) => bill.tenantId === tenant._id
  );

  const unpaidBills = myBills.filter(
    (bill) => bill.status === "Unpaid"
  );

  const outstandingAmount = unpaidBills.reduce(
    (total, bill) => total + bill.total,
    0
  );

  const myMessages = messages.filter(
    (message) => message.tenantId === tenant._id
  );

  const unreadMessages = myMessages.filter(
    (message) => message.status === "Unread"
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>
          Welcome back
        </Text>

        <Text style={styles.name}>
          {tenant.fullName}
        </Text>

        <Text style={styles.subtitle}>
          Tenant Dashboard
        </Text>
      </View>

      <View style={styles.houseCard}>
        <View style={styles.houseIcon}>
          <Ionicons
            name="home"
            size={32}
            color="#fff"
          />
        </View>

        <View style={styles.houseInfo}>
          <Text style={styles.cardLabel}>
            My House
          </Text>

          <Text style={styles.houseNumber}>
            {house
              ? `House ${house.houseNumber}`
              : "House Not Found"}
          </Text>

          {house && (
            <Text style={styles.houseType}>
              {house.houseType}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: "#DC2626" },
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={28}
              color="#fff"
            />
          </View>

          <Text style={styles.number}>
            Ksh {outstandingAmount}
          </Text>

          <Text style={styles.label}>
            Outstanding Bills
          </Text>
        </View>

        <View style={styles.card}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: "#7C3AED" },
            ]}
          >
            <Ionicons
              name="chatbubble-outline"
              size={28}
              color="#fff"
            />
          </View>

          <Text style={styles.number}>
            {unreadMessages.length}
          </Text>

          <Text style={styles.label}>
            Unread Messages
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={22}
              color="#2563EB"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>
                Full Name
              </Text>

              <Text style={styles.infoValue}>
                {tenant.fullName}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={22}
              color="#16A34A"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>
                Phone
              </Text>

              <Text style={styles.infoValue}>
                {tenant.phone}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#7C3AED"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>
                Email
              </Text>

              <Text style={styles.infoValue}>
                {tenant.email}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#F59E0B"
            />

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>
                Move-in Date
              </Text>

              <Text style={styles.infoValue}>
                {tenant.moveInDate}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Quick Summary
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Total Bills
          </Text>

          <Text style={styles.summaryValue}>
            {myBills.length}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Paid Bills
          </Text>

          <Text
            style={[
              styles.summaryValue,
              { color: "#16A34A" },
            ]}
          >
            {
              myBills.filter(
                (bill) => bill.status === "Paid"
              ).length
            }
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Messages
          </Text>

          <Text
            style={[
              styles.summaryValue,
              { color: "#7C3AED" },
            ]}
          >
            {myMessages.length}
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FC",
    padding: 30,
  },

  loadingText: {
    marginTop: 15,
    color: "#6B7280",
    fontSize: 16,
  },

  pendingTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 20,
    color: "#111827",
  },

  pendingText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 18,
  },

  header: {
    marginTop: 45,
    marginBottom: 25,
  },

  welcome: {
    fontSize: 16,
    color: "#6B7280",
  },

  name: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 5,
  },

  houseCard: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    elevation: 4,
  },

  houseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  houseInfo: {
    marginLeft: 15,
  },

  cardLabel: {
    color: "#DBEAFE",
    fontSize: 14,
  },

  houseNumber: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 3,
  },

  houseType: {
    color: "#DBEAFE",
    marginTop: 3,
  },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    elevation: 3,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  number: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },

  label: {
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoText: {
    marginLeft: 14,
  },

  infoLabel: {
    color: "#6B7280",
    fontSize: 13,
  },

  infoValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  summaryText: {
    fontSize: 16,
    color: "#374151",
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
  },

  bottomSpace: {
    height: 40,
  },
});