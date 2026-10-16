import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

export default function TenantMessages() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const tenant = useQuery(api.tenants.getCurrentTenant);
  const messages = useQuery(api.messages.getTenantMessages);

  const markAsRead = useMutation(api.messages.markAsRead);
  const sendMessage = useMutation(api.messages.sendMessage);

  if (
    tenant === undefined ||
    messages === undefined
  ) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading messages...
        </Text>
      </View>
    );
  }

  if (!tenant) {
    return (
      <View style={styles.empty}>
        <Ionicons
          name="time-outline"
          size={70}
          color="#F59E0B"
        />

        <Text style={styles.emptyTitle}>
          Account Pending
        </Text>

        <Text style={styles.emptyText}>
          Your account must be approved before you
          can receive messages.
        </Text>
      </View>
    );
  }

  const myMessages = messages
    .filter(
      (item) => item.tenantId === tenant._id
    )
    .sort((a, b) =>
      b.sentAt.localeCompare(a.sentAt)
    );

  async function openMessage(item: any) {
    setSelectedMessage(item);

    if (
      item.status === "Unread" &&
      item.sender !== "tenant"
    ) {
      try {
        await markAsRead({
          id: item._id,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function sendReply() {
    if (!reply.trim()) {
      Alert.alert(
        "Error",
        "Please enter a reply."
      );
      return;
    }

    if (!tenant) {
      Alert.alert(
        "Error",
        "Tenant information not found."
      );
      return;
    }

    setSending(true);

    try {
      await sendMessage({
        tenantId: tenant._id,
        sender: "tenant",
        subject: selectedMessage?.subject || "Tenant Reply",
        message: reply.trim(),
        sentAt: new Date().toLocaleString(),
        status: "Unread",
      });

      Alert.alert(
        "Success",
        "Reply sent successfully."
      );

      setReply("");
      setSelectedMessage(null);

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

  if (selectedMessage) {
    return (
      <View style={styles.container}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedMessage(null)}
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
            <Ionicons
              name={
                selectedMessage.sender === "tenant"
                  ? "person-outline"
                  : "business-outline"
              }
              size={20}
              color="#2563EB"
            />

            <Text style={styles.senderText}>
              {selectedMessage.sender === "tenant"
                ? "You"
                : "Landlord"}
            </Text>
          </View>

          <Text style={styles.subject}>
            {selectedMessage.subject}
          </Text>

          <Text style={styles.date}>
            {selectedMessage.sentAt}
          </Text>

          <View style={styles.line} />

          <Text style={styles.messageText}>
            {selectedMessage.message}
          </Text>

        </View>

        <View style={styles.replyBox}>

          <Text style={styles.replyTitle}>
            Reply to Landlord
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

      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        My Messages
      </Text>

      {myMessages.length === 0 ? (

        <View style={styles.emptyMessages}>

          <Ionicons
            name="chatbubble-outline"
            size={75}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No Messages
          </Text>

          <Text style={styles.emptyText}>
            Messages from your landlord will appear here.
          </Text>

        </View>

      ) : (

        <FlatList
          data={myMessages}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          renderItem={({ item }) => (

            <TouchableOpacity
              style={[
                styles.messageItem,
                item.status === "Unread" &&
                item.sender !== "tenant"
                  ? styles.unreadItem
                  : null,
              ]}
              onPress={() => openMessage(item)}
            >

              <View
                style={[
                  styles.messageIcon,
                  item.sender === "tenant"
                    ? styles.tenantMessageIcon
                    : null,
                ]}
              >
                <Ionicons
                  name={
                    item.sender === "tenant"
                      ? "send-outline"
                      : "mail-outline"
                  }
                  size={24}
                  color="#2563EB"
                />
              </View>

              <View style={styles.messageInfo}>

                <View style={styles.messageTopRow}>

                  <Text
                    style={[
                      styles.messageSubject,
                      item.status === "Unread" &&
                      item.sender !== "tenant"
                        ? styles.unreadSubject
                        : null,
                    ]}
                  >
                    {item.subject}
                  </Text>

                  <Text style={styles.senderLabel}>
                    {item.sender === "tenant"
                      ? "You"
                      : "Landlord"}
                  </Text>

                </View>

                <Text
                  style={styles.preview}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>

                <Text style={styles.date}>
                  {item.sentAt}
                </Text>

              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#9CA3AF"
              />

            </TouchableOpacity>

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
    backgroundColor: "#F4F7FC",
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

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 45,
    marginBottom: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 45,
    marginBottom: 20,
  },

  backText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  messageItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },

  messageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  tenantMessageIcon: {
    backgroundColor: "#DCFCE7",
  },

  messageInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  messageTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  messageSubject: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },

  unreadSubject: {
    fontWeight: "bold",
    color: "#111827",
  },

  senderLabel: {
    fontSize: 11,
    color: "#2563EB",
    marginLeft: 5,
  },

  preview: {
    color: "#6B7280",
    marginTop: 4,
  },

  date: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 5,
  },

  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },

  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  senderText: {
    marginLeft: 7,
    color: "#2563EB",
    fontWeight: "600",
  },

  subject: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
  },

  line: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },

  messageText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 25,
  },

  replyBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },

  replyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  replyInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },

  sendButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FC",
    padding: 30,
  },

  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "bold",
    marginTop: 15,
    color: "#111827",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },
});