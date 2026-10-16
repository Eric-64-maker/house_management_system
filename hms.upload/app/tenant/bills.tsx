import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

export default function TenantBills() {
  const tenant = useQuery(api.tenants.getCurrentTenant);
  const bills = useQuery(api.bills.getBills);

  if (
    tenant === undefined ||
    bills === undefined
  ) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading your bills...
        </Text>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.empty}>
        <Ionicons
          name="time-outline"
          size={70}
          color="#F59E0B"
        />

        <Text style={styles.emptyTitle}>
          Account Pending
        </Text>

        <Text style={styles.emptyText}>
          Your landlord has not approved your
          registration yet.
        </Text>
      </View>
    );
  }

  const myBills = bills
    .filter(
      (bill) => bill.tenantId === tenant._id
    )
    .sort((a, b) =>
      b.month.localeCompare(a.month)
    );

  const unpaidBills = myBills.filter(
    (bill) => bill.status === "Unpaid"
  );

  const totalOutstanding = unpaidBills.reduce(
    (sum, bill) => sum + bill.total,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        My Bills
      </Text>

      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="wallet-outline"
            size={30}
            color="#fff"
          />
        </View>

        <View>
          <Text style={styles.summaryLabel}>
            Outstanding Amount
          </Text>

          <Text style={styles.summaryAmount}>
            Ksh {totalOutstanding}
          </Text>
        </View>
      </View>

      {myBills.length === 0 ? (
        <View style={styles.emptyBills}>
          <Ionicons
            name="receipt-outline"
            size={75}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No Bills Yet
          </Text>

          <Text style={styles.emptyText}>
            Your bills will appear here when the
            landlord generates them.
          </Text>
        </View>
      ) : (
        <FlatList
          data={myBills}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          renderItem={({ item }) => (
            <View style={styles.billCard}>
              <View style={styles.billHeader}>
                <View>
                  <Text style={styles.month}>
                    {item.month}
                  </Text>

                  <Text style={styles.billStatus}>
                    {item.status}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusIcon,
                    {
                      backgroundColor:
                        item.status === "Paid"
                          ? "#DCFCE7"
                          : "#FEE2E2",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.status === "Paid"
                        ? "checkmark-circle"
                        : "alert-circle"
                    }
                    size={25}
                    color={
                      item.status === "Paid"
                        ? "#16A34A"
                        : "#DC2626"
                    }
                  />
                </View>
              </View>

              <View style={styles.line} />

              <View style={styles.row}>
                <Text style={styles.label}>
                  Rent
                </Text>

                <Text style={styles.amount}>
                  Ksh {item.rent}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Water
                </Text>

                <Text style={styles.amount}>
                  Ksh {item.water}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Electricity
                </Text>

                <Text style={styles.amount}>
                  Ksh {item.electricity}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Other Charges
                </Text>

                <Text style={styles.amount}>
                  Ksh {item.otherCharges}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalAmount}>
                  Ksh {item.total}
                </Text>
              </View>

              {item.status === "Paid" && (
                <View style={styles.paymentBox}>
                  <Text style={styles.paymentTitle}>
                    Payment Details
                  </Text>

                  {item.paymentMethod && (
                    <Text style={styles.paymentText}>
                      Method: {item.paymentMethod}
                    </Text>
                  )}

                  {item.reference && (
                    <Text style={styles.paymentText}>
                      Reference: {item.reference}
                    </Text>
                  )}

                  {item.paymentDate && (
                    <Text style={styles.paymentText}>
                      Date: {item.paymentDate}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FC",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 45,
    marginBottom: 20,
  },

  summary: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  summaryIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 14,
  },

  summaryAmount: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 3,
  },

  billCard: {
    backgroundColor: "#fff",
    borderRadius: 17,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },

  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  month: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  billStatus: {
    marginTop: 5,
    fontWeight: "600",
    color: "#6B7280",
  },

  statusIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  line: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: "#6B7280",
    fontSize: 15,
  },

  amount: {
    color: "#111827",
    fontWeight: "600",
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
  },

  paymentBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
  },

  paymentTitle: {
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 5,
  },

  paymentText: {
    color: "#166534",
    marginTop: 3,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F4F7FC",
  },

  emptyBills: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 15,
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },
});