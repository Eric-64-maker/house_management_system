import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function GenerateBills() {
  const houses = useQuery(api.houses.getHouses);
  const tenants = useQuery(api.tenants.getTenants);

  const addBill = useMutation(api.bills.addBill);

  const [month, setMonth] = useState("July 2026");
  const [water, setWater] = useState("0");
  const [electricity, setElectricity] = useState("0");
  const [otherCharges, setOtherCharges] = useState("0");
  const [saving, setSaving] = useState(false);

  if (houses === undefined || tenants === undefined) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const housesData = houses;
  const tenantsData = tenants;

  const occupiedHouses = housesData.filter(
    (house) => house.status === "Occupied"
  );

  async function generateBills() {
    try {
      setSaving(true);

      for (const house of occupiedHouses) {
        const tenant = tenantsData.find(
          (t) => t.houseId.toString() === house._id.toString()
        );

        if (!tenant) continue;

        const rent = house.rent;
        const waterAmount = Number(water);
        const electricityAmount = Number(electricity);
        const otherAmount = Number(otherCharges);

        const total =
          rent +
          waterAmount +
          electricityAmount +
          otherAmount;

        await addBill({
          tenantId: tenant._id,
          houseId: house._id,
          month,
          rent,
          water: waterAmount,
          electricity: electricityAmount,
          otherCharges: otherAmount,
          total,
          status: "Unpaid",
        });
      }

      Alert.alert(
        "Success",
        "Monthly bills generated successfully."
      );

      router.back();
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Failed to generate bills."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Generate Monthly Bills
      </Text>

      <TextInput
        style={styles.input}
        value={month}
        onChangeText={setMonth}
        placeholder="Month"
      />

      <TextInput
        style={styles.input}
        value={water}
        onChangeText={setWater}
        keyboardType="numeric"
        placeholder="Water Charge"
      />

      <TextInput
        style={styles.input}
        value={electricity}
        onChangeText={setElectricity}
        keyboardType="numeric"
        placeholder="Electricity Charge"
      />

      <TextInput
        style={styles.input}
        value={otherCharges}
        onChangeText={setOtherCharges}
        keyboardType="numeric"
        placeholder="Other Charges"
      />

      <Text style={styles.subtitle}>
        Bills To Be Generated
      </Text>

      <FlatList
        data={occupiedHouses}
        keyExtractor={(item) => item._id}
        style={{ marginBottom: 20 }}
        renderItem={({ item }) => {
          const tenant = tenantsData.find(
            (t) => t.houseId.toString() === item._id.toString()
          );

          return (
            <View style={styles.card}>
              <Text style={styles.house}>
                House {item.houseNumber}
              </Text>

              <Text>
                {tenant?.fullName ?? "No Tenant"}
              </Text>

              <Text>
                Rent: Ksh {item.rent}
              </Text>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={generateBills}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Generating..." : "Generate Bills"}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },

  subtitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 18,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  house: {
    fontWeight: "bold",
    fontSize: 18,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});