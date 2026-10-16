import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

export default function ViewMessage() {
  const { id } = useLocalSearchParams();

  const messages = useQuery(api.messages.getMessages);
  const tenants = useQuery(api.tenants.getTenants);

  const sendMessage = useMutation(api.messages.sendMessage);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  if (messages === undefined || tenants === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>
          Loading message...
        </Text>
      </View>
    );
  }

  const selectedMessage = messages.find(
    (item) => item._id.toString() === id?.toString()
  );

  if (!selectedMessage) {
    return (
      <View style={styles.loading}>
        <Text>Message not found.</Text>
      </View>
    );
  }

  const tenant = tenants.find(
    (item) =>
      item._id.toString() ===
      selectedMessage.tenantId.toString()
  );

  const tenantName = tenant
    ? tenant.fullName
    : "Unknown Tenant";

  const isTenantMessage =
    selectedMessage.sender === "tenant";

 async function sendReply() {
  if (!selectedMessage) {
    Alert.alert(
      "Error",
      "Message not found."
    );
    return;
  }

  if (!reply.trim()) {
    Alert.alert(
      "Error",
      "Please enter a reply."
    );
    return;
  }

  try {
    setSending(true);

    await sendMessage({
      tenantId: selectedMessage.tenantId,
      sender: "landlord",
      subject: `Re: ${selectedMessage.subject}`,
      message: reply.trim(),
      sentAt: new Date().toLocaleString(),
      status: "Unread",
    });

    Alert.alert(
      "Success",
      "Reply sent successfully."
    );

    setReply("");

  } catch (error) {
    console.log(error);

    Alert.alert(
      "Error",
      "Failed to send reply."
    );

  } finally {
    setSending(false);
  }
}

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#2563EB"
        />

        <Text style={styles.backText}>
          Back to Messages
        </Text>
      </TouchableOpacity>

      <View style={styles.messageCard}>

        <View style={styles.senderRow}>

          <View style={styles.senderIcon}>
            <Ionicons
              name={
                isTenantMessage
                  ? "person-outline"
                  : "mail-outline"
              }
              size={24}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.senderName}>
              {isTenantMessage
                ? tenantName
                : "Landlord"}
            </Text>

            <Text style={styles.senderType}>
              {isTenantMessage
                ? "Tenant Message"
                : "Landlord Message"}
            </Text>
          </View>

        </View>

        <View style={styles.line} />

        <Text style={styles.subject}>
          {selectedMessage.subject}
        </Text>

        <Text style={styles.date}>
          {selectedMessage.sentAt}
        </Text>

        <Text style={styles.messageText}>
          {selectedMessage.message}
        </Text>

      </View>

      {isTenantMessage && (

        <View style={styles.replyCard}>

          <Text style={styles.replyTitle}>
            Reply to {tenantName}
          </Text>

          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            multiline
            value={reply}
            onChangeText={setReply}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendReply}
            disabled={sending}
          >

            <Ionicons
              name="send"
              size={20}
              color="#fff"
            />

            <Text style={styles.sendText}>
              {sending
                ? "Sending..."
                : "Send Reply"}
            </Text>

          </TouchableOpacity>

        </View>

      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 18,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 55,
    marginBottom: 20,
  },

  backText: {
    marginLeft: 8,
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },

  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  senderRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  senderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  senderName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  senderType: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 13,
  },

  line: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  subject: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
  },

  date: {
    marginTop: 7,
    fontSize: 13,
    color: "#9CA3AF",
  },

  messageText: {
    marginTop: 25,
    fontSize: 16,
    color: "#374151",
    lineHeight: 25,
  },

  replyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    marginBottom: 40,
    elevation: 2,
  },

  replyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  replyInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    textAlignVertical: "top",
  },

  sendButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});