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

export default function AddMessage() {
  const tenants = useQuery(api.tenants.getTenants);
  const sendMessage = useMutation(api.messages.sendMessage);

  const [tenantId, setTenantId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (tenants === undefined) {
    return <Text style={{ marginTop: 100, textAlign: "center" }}>Loading...</Text>;
  }

  async function saveMessage() {
    if (
      !tenantId ||
      !subject.trim() ||
      !message.trim()
    ) {
      Alert.alert(
        "Error",
        "Please fill in all fields."
      );
      return;
    }

    try {
      setSaving(true);
await sendMessage({
  tenantId: tenantId as any,
  sender: "Admin",
  subject: subject,
  message: message,
  sentAt: new Date().toISOString(),
  status: "Unread",
});
      Alert.alert(
        "Success",
        "Message sent successfully."
      );

      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Failed to send message."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Send Message
      </Text>

      <Text style={styles.label}>
        Select Tenant
      </Text>

      <Picker
        selectedValue={tenantId}
        onValueChange={(value) => setTenantId(value)}
        style={styles.input}
      >
        <Picker.Item
          label="Select Tenant"
          value=""
        />

        {tenants.map((tenant) => (
          <Picker.Item
            key={tenant._id}
            label={tenant.fullName}
            value={tenant._id}
          />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={[styles.input, { height: 150 }]}
        placeholder="Message"
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={saveMessage}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Sending..." : "Send Message"}
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

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});