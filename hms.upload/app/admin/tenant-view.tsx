import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";

export default function AdminTenantView() {
  const tenants = useQuery(api.tenants.getTenants);
  const houses = useQuery(api.houses.getHouses);
  const bills = useQuery(api.bills.getBills);
  const messages = useQuery(api.messages.getMessages);
  const [tenantId, setTenantId] = useState("");

  const tenant = useMemo(
    () => tenants?.find((item) => item._id === tenantId),
    [tenants, tenantId]
  );

  if (tenants === undefined || houses === undefined || bills === undefined || messages === undefined) {
    return <View style={styles.loading}><Text>Loading tenant dashboard...</Text></View>;
  }

  const house = tenant ? houses.find((item) => item._id === tenant.houseId) : null;
  const myBills = tenant ? bills.filter((item) => item.tenantId === tenant._id) : [];
  const myMessages = tenant ? messages.filter((item) => item.tenantId === tenant._id) : [];
  const outstanding = myBills.filter((item) => item.status === "Unpaid").reduce((sum, item) => sum + item.total, 0);
  const unread = myMessages.filter((item) => item.status === "Unread").length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back to Landlord Dashboard</Text></TouchableOpacity>
      <Text style={styles.title}>Tenant Dashboard</Text>
      <Text style={styles.subtitle}>Administrator preview</Text>

      <Text style={styles.label}>Select Tenant</Text>
      <Picker selectedValue={tenantId} onValueChange={setTenantId} style={styles.picker}>
        <Picker.Item label="Select a tenant" value="" />
        {tenants.map((item) => <Picker.Item key={item._id} label={item.fullName} value={item._id} />)}
      </Picker>

      {!tenant ? (
        <View style={styles.empty}><Ionicons name="person-outline" size={60} color="#94A3B8" /><Text style={styles.emptyText}>Choose a tenant to open their dashboard.</Text></View>
      ) : (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.name}>{tenant.fullName}</Text>
            <Text style={styles.small}>{tenant.email}</Text>
          </View>

          <View style={styles.card}><Ionicons name="home" size={32} color="#2563EB" /><Text style={styles.cardTitle}>My House</Text><Text style={styles.value}>{house ? `House ${house.houseNumber}` : "Not found"}</Text>{house && <Text style={styles.small}>{house.houseType}</Text>}</View>
          <View style={styles.row}>
            <View style={styles.half}><Ionicons name="receipt-outline" size={30} color="#DC2626" /><Text style={styles.value}>Ksh {outstanding.toLocaleString()}</Text><Text style={styles.small}>Outstanding</Text></View>
            <View style={styles.half}><Ionicons name="chatbubble-outline" size={30} color="#7C3AED" /><Text style={styles.value}>{unread}</Text><Text style={styles.small}>Unread messages</Text></View>
          </View>

          <View style={styles.card}><Text style={styles.cardTitle}>Account Information</Text><Text style={styles.small}>Phone: {tenant.phone}</Text><Text style={styles.small}>Move-in: {tenant.moveInDate}</Text><Text style={styles.small}>Bills: {myBills.length}</Text><Text style={styles.small}>Messages: {myMessages.length}</Text></View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#F4F7FC" },
  content: { padding: 20, paddingBottom: 50 },
  back: { color: "#2563EB", fontWeight: "600", marginBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "#111827" },
  subtitle: { color: "#64748B", marginTop: 5, marginBottom: 20 },
  label: { fontWeight: "600", color: "#374151", marginBottom: 8 },
  picker: { backgroundColor: "#fff", marginBottom: 20 },
  headerCard: { backgroundColor: "#2563EB", borderRadius: 18, padding: 22, marginBottom: 16 },
  welcome: { color: "#DBEAFE" },
  name: { color: "#fff", fontSize: 26, fontWeight: "bold", marginTop: 4 },
  small: { color: "#64748B", marginTop: 7 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginTop: 8 },
  value: { fontSize: 21, fontWeight: "bold", color: "#111827", marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  half: { width: "48%", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center", elevation: 2 },
  empty: { alignItems: "center", padding: 50 },
  emptyText: { color: "#64748B", marginTop: 15, textAlign: "center" },
});
