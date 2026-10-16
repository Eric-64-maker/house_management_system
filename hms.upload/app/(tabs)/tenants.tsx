import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";

export default function Tenants() {
  const tenants = useQuery(api.tenants.getTenants);
  const deleteTenant = useMutation(api.tenants.deleteTenant);

  if (tenants === undefined) {
    return (
      <View style={styles.loading}>
        <Text>Loading tenants...</Text>
      </View>
    );
  }

  function removeTenant(id: any) {
    Alert.alert(
      "Delete Tenant",
      "Are you sure you want to delete this tenant?",
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
              await deleteTenant({ id });
              Alert.alert("Deleted", "Tenant deleted successfully.");
            } catch (error: any) {
              console.log(error);
              Alert.alert("Delete Failed", error?.message || "Could not delete this tenant.");
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tenants</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/tenant/add")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {tenants.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={90} color="#CBD5E1" />

          <Text style={styles.emptyTitle}>No Tenants Found</Text>

          <Text style={styles.emptyText}>
            Tap + to register your first tenant.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tenants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.fullName}</Text>

                <Text>{item.phone}</Text>

                <Text>{item.email}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/tenant/edit",
                      params: { id: item._id },
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={24}
                    color="#2563EB"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeTenant(item._id)}
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
    backgroundColor: "#2563EB",
    width: 55,
    height: 55,
    borderRadius: 30,
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
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  actions: {
    justifyContent: "space-around",
  },
});