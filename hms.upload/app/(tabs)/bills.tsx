import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

export default function Bills() {
  const bills = useQuery(api.bills.getBills);
  const tenants = useQuery(api.tenants.getTenants);
  const houses = useQuery(api.houses.getHouses);

  const deleteBill = useMutation(api.bills.deleteBill);

  if (
    bills === undefined ||
    tenants === undefined ||
    houses === undefined
  ) {
    return (
      <View style={styles.loading}>
        <Text>Loading Bills...</Text>
      </View>
    );
  }

  function tenantName(id: any) {
  if (!tenants) return "Unknown Tenant";

  const tenant = tenants.find(
    (t) => t._id.toString() === id.toString()
  );

  return tenant ? tenant.fullName : "Unknown Tenant";
}

function houseNumber(id: any) {
  if (!houses) return "Unknown House";

  const house = houses.find(
    (h) => h._id.toString() === id.toString()
  );

  return house ? house.houseNumber : "Unknown House";
}

  function removeBill(id: any) {
    Alert.alert(
      "Delete Bill",
      "Are you sure you want to delete this bill?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBill({ id });
              Alert.alert("Deleted", "Bill deleted successfully.");
            } catch (error: any) {
              console.log(error);
              Alert.alert("Delete Failed", error?.message || "Could not delete this bill.");
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bills</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/bill/generate")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {bills.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="receipt-outline"
            size={90}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No Bills Generated
          </Text>

          <Text style={styles.emptyText}>
            Tap + to generate monthly bills.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.house}>
                  House {houseNumber(item.houseId)}
                </Text>

                <Text style={styles.tenant}>
                  {tenantName(item.tenantId)}
                </Text>

                <Text style={styles.month}>
                  {item.month}
                </Text>

                <Text style={styles.total}>
                  Ksh {item.total.toLocaleString()}
                </Text>

                <View
                  style={{
                    marginTop: 10,
                    backgroundColor:
                      item.status === "Paid"
                        ? "#DCFCE7"
                        : "#FEE2E2",
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color:
                        item.status === "Paid"
                          ? "#15803D"
                          : "#B91C1C",
                      fontWeight: "bold",
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                {item.status === "Unpaid" && (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/bill/payment",
                        params: {
                          id: item._id,
                        },
                      })
                    }
                  >
                    <Ionicons
                      name="cash-outline"
                      size={24}
                      color="#16A34A"
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => removeBill(item._id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color="red"
                  />
                </TouchableOpacity>
              </View>
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
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: 18,
  },

  header: {
    marginTop: 50,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  addButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },

  emptyText: {
    color: "#666",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  house: {
    fontWeight: "bold",
    fontSize: 20,
  },

  tenant: {
    marginTop: 5,
    fontSize: 15,
  },

  month: {
    marginTop: 5,
    color: "#666",
  },

  total: {
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 18,
  },

  actions: {
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
  },
});