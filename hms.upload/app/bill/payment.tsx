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

export default function Payment() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const bills = useQuery(api.bills.getBills);
  const markAsPaid = useMutation(api.bills.markAsPaid);

  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [bill, setBill] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!bills) return;

    const selectedBill = bills.find((b) => b._id === id);

    if (selectedBill) {
      setBill(selectedBill);

      const today = new Date().toISOString().split("T")[0];
      setPaymentDate(today);
    }
  }, [bills, id]);

  if (bills === undefined || bill === null) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function savePayment() {
    if (!reference.trim()) {
      Alert.alert("Error", "Enter payment reference.");
      return;
    }

    try {
      setSaving(true);

      await markAsPaid({
        id: bill._id,
        paymentMethod,
        reference,
        paymentDate,
      });

      Alert.alert("Success", "Payment recorded successfully.");

      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Receive Payment</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Monthly Bill</Text>

        <Text style={styles.amount}>
          Ksh {bill.total.toLocaleString()}
        </Text>

        <Text>{bill.month}</Text>

        <Text>Status: {bill.status}</Text>
      </View>

      <Text style={styles.label}>Payment Method</Text>

      <View style={styles.picker}>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value)}
        >
          <Picker.Item label="M-Pesa" value="M-Pesa" />
          <Picker.Item label="Cash" value="Cash" />
          <Picker.Item label="Bank" value="Bank" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Reference Number"
        value={reference}
        onChangeText={setReference}
      />

      <TextInput
        style={styles.input}
        placeholder="Payment Date"
        value={paymentDate}
        onChangeText={setPaymentDate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={savePayment}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "MARK AS PAID"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },

  amount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#16A34A",
    marginVertical: 10,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },

  picker: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    overflow: "hidden",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});