import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TenantProfile() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>

        <Text style={styles.name}>Tenant Profile</Text>
        <Text style={styles.subtitle}>
          View and manage your profile information
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={22} color="#2563EB" />
          <View style={styles.info}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>Not available</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="mail-outline" size={22} color="#2563EB" />
          <View style={styles.info}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>Not available</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="call-outline" size={22} color="#2563EB" />
          <View style={styles.info}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>Not available</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="home-outline" size={22} color="#2563EB" />
          <View style={styles.info}>
            <Text style={styles.label}>House Number</Text>
            <Text style={styles.value}>Not assigned</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    backgroundColor: "#2563EB",
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    fontSize: 14,
    color: "#DBEAFE",
    marginTop: 5,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  info: {
    marginLeft: 15,
  },

  label: {
    fontSize: 13,
    color: "#64748B",
  },

  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginTop: 3,
  },
});