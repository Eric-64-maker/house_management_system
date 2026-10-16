import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function EditTenant() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const tenants = useQuery(api.tenants.getTenants);
  const houses = useQuery(api.houses.getHouses);

  const updateTenant = useMutation(api.tenants.updateTenant);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [houseId, setHouseId] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenants || !id) return;

    const tenant = tenants.find((t) => t._id === id);

    if (!tenant) return;

    setFullName(tenant.fullName);
    setPhone(tenant.phone);
    setEmail(tenant.email);
    setNationalId(tenant.nationalId);
    setHouseId(String(tenant.houseId));
    setMoveInDate(tenant.moveInDate);
    setEmergencyContact(tenant.emergencyContact);
  }, [tenants, id]);

  if (tenants === undefined || houses === undefined) {
    return <Text style={{ marginTop: 100, textAlign: "center" }}>Loading...</Text>;
  }

  async function saveChanges() {
    if (
      !fullName ||
      !phone ||
      !email ||
      !nationalId ||
      !houseId ||
      !moveInDate ||
      !emergencyContact
    ) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      await updateTenant({
        id: id as any,
        fullName,
        phone,
        email,
        nationalId,
        houseId: houseId as any,
        moveInDate,
        emergencyContact,
      });

      Alert.alert("Success", "Tenant updated successfully.");

      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update tenant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Tenant</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="National ID"
        value={nationalId}
        onChangeText={setNationalId}
      />

      <View style={styles.picker}>
        <Picker
          selectedValue={houseId}
          onValueChange={(value) => setHouseId(value)}
        >
          <Picker.Item label="Select House" value="" />

          {houses.map((house) => (
            <Picker.Item
              key={house._id}
              label={`House ${house.houseNumber}`}
              value={house._id}
            />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Move In Date"
        value={moveInDate}
        onChangeText={setMoveInDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Emergency Contact"
        value={emergencyContact}
        onChangeText={setEmergencyContact}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={saveChanges}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Updating..." : "UPDATE TENANT"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  picker: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },

  button: {
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});