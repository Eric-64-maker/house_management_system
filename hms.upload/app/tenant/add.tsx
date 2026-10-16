import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function AddTenant() {
  const houses = useQuery(api.houses.getHouses);
  const addTenant = useMutation(api.tenants.addTenant);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [houseId, setHouseId] = useState<Id<"houses"> | "">("");
  const [saving, setSaving] = useState(false);

  async function saveTenant() {
    if (
      !fullName ||
      !phone ||
      !nationalId ||
      !moveInDate ||
      !houseId
    ) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await addTenant({
        fullName,
        phone,
        email,
        nationalId,
        houseId: houseId as Id<"houses">,
        moveInDate,
        emergencyContact,
      });

      Alert.alert("Success", "Tenant added successfully.");

      router.replace("/(tabs)/tenants");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add tenant.");
    } finally {
      setSaving(false);
    }
  }

  if (!houses) {
    return <Text style={{ marginTop: 60 }}>Loading...</Text>;
  }

  const vacantHouses = houses.filter(
    (house) => house.status === "Vacant"
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register Tenant</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="National ID"
        style={styles.input}
        keyboardType="numeric"
        value={nationalId}
        onChangeText={setNationalId}
      />

      <TextInput
        placeholder="Move In Date (YYYY-MM-DD)"
        style={styles.input}
        value={moveInDate}
        onChangeText={setMoveInDate}
      />

      <TextInput
        placeholder="Emergency Contact"
        style={styles.input}
        value={emergencyContact}
        onChangeText={setEmergencyContact}
      />

      <Text style={styles.label}>Select House</Text>

      <Picker
        selectedValue={houseId}
        onValueChange={(value) => setHouseId(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select House" value="" />

        {vacantHouses.map((house) => (
          <Picker.Item
            key={house._id}
            label={`${house.houseNumber} - ${house.houseType}`}
            value={house._id}
          />
        ))}
      </Picker>

      <TouchableOpacity
        style={styles.button}
        onPress={saveTenant}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Register Tenant"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 45,
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  picker: {
    backgroundColor: "#fff",
    marginBottom: 20,
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