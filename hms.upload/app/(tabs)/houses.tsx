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

export default function Houses() {
  const houses = useQuery(api.houses.getHouses);
  const deleteHouse = useMutation(api.houses.deleteHouse);

  if (houses === undefined) {
    return (
      <View style={styles.loading}>
        <Text>Loading houses...</Text>
      </View>
    );
  }

  const handleDelete = (id: any) => {
    Alert.alert(
      "Delete House",
      "Are you sure you want to delete this house?",
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
              await deleteHouse({ id });
              Alert.alert("Deleted", "House deleted successfully.");
            } catch (error: any) {
              console.log(error);
              Alert.alert("Delete Failed", error?.message || "Could not delete this house.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.title}>Houses</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/house/add")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {houses.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="home-outline" size={90} color="#CBD5E1" />

          <Text style={styles.emptyTitle}>
            No Houses Found
          </Text>

          <Text style={styles.emptyText}>
            Tap + to add your first house.
          </Text>
        </View>
      ) : (
        <FlatList
          data={houses}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.house}>
                  House {item.houseNumber}
                </Text>

                <Text style={styles.type}>
                  {item.houseType}
                </Text>

                <Text style={styles.rent}>
                  Rent: Ksh {item.rent.toLocaleString()}
                </Text>

                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        item.status === "Occupied"
                          ? "#16A34A"
                          : "#F59E0B",
                    },
                  ]}
                >
                  {item.status}
                </Text>

                {item.description ? (
                  <Text style={styles.description}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    router.push({
                      pathname: "/house/edit",
                      params: { id: item._id },
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={22}
                    color="#2563EB"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color="#DC2626"
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
    paddingHorizontal: 18,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  addButton: {
    backgroundColor: "#2563EB",
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
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
    marginTop: 10,
    color: "#666",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    elevation: 2,
  },

  house: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  type: {
    marginTop: 5,
    color: "#2563EB",
    fontWeight: "600",
  },

  rent: {
    marginTop: 6,
    color: "#555",
  },

  status: {
    marginTop: 8,
    fontWeight: "bold",
  },

  description: {
    marginTop: 6,
    color: "#666",
  },

  actions: {
    justifyContent: "space-around",
    marginLeft: 15,
  },

  iconButton: {
    padding: 6,
  },
});