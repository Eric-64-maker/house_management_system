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

export default function Messages() {
  const messages = useQuery(api.messages.getMessages);
  const tenants = useQuery(api.tenants.getTenants);

  const markAsRead = useMutation(api.messages.markAsRead);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  if (messages === undefined || tenants === undefined) {
    return (
      <View style={styles.loading}>
        <Text>Loading Messages...</Text>
      </View>
    );
  }

  function tenantName(id: any) {
    if (!tenants) return "Loading...";

    const tenant = tenants.find(
      (t) => t._id.toString() === id.toString()
    );

    return tenant ? tenant.fullName : "Unknown Tenant";
  }

  async function openMessage(item: any) {
    try {
      if (
        item.status === "Unread" &&
        item.sender === "tenant"
      ) {
        await markAsRead({
          id: item._id,
        });
      }

      router.push({
        pathname: "/message/view",
        params: {
          id: item._id,
        },
      });
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Failed to open message."
      );
    }
  }

  function removeMessage(id: any) {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
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
              await deleteMessage({ id });
            } catch (error) {
              console.log(error);

              Alert.alert(
                "Error",
                "Failed to delete message."
              );
            }
          },
        },
      ]
    );
  }

  const sortedMessages = [...messages].sort((a, b) => {
    return (
      new Date(b.sentAt).getTime() -
      new Date(a.sentAt).getTime()
    );
  });

  const unreadMessages = messages.filter(
    (item) =>
      item.status === "Unread" &&
      item.sender === "tenant"
  ).length;

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Messages
          </Text>

          <Text style={styles.subtitle}>
            {unreadMessages > 0
              ? `${unreadMessages} unread message${
                  unreadMessages > 1 ? "s" : ""
                }`
              : "All messages"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/message/add")}
        >
          <Ionicons
            name="create-outline"
            size={25}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {sortedMessages.length === 0 ? (
        <View style={styles.empty}>

          <Ionicons
            name="chatbubbles-outline"
            size={85}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No Messages
          </Text>

          <Text style={styles.emptyText}>
            Messages and tenant replies will appear here.
          </Text>

        </View>
      ) : (
        <FlatList
          data={sortedMessages}
          keyExtractor={(item) => item._id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          renderItem={({ item }) => {
            const isTenantMessage =
              item.sender === "tenant";

            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  item.status === "Unread" &&
                  isTenantMessage
                    ? styles.unreadCard
                    : null,
                ]}
                onPress={() => openMessage(item)}
              >

                <View
                  style={[
                    styles.iconBox,
                    isTenantMessage
                      ? styles.tenantIcon
                      : styles.landlordIcon,
                  ]}
                >
                  <Ionicons
                    name={
                      isTenantMessage
                        ? "person-outline"
                        : "mail-outline"
                    }
                    size={25}
                    color="#2563EB"
                  />
                </View>

                <View style={styles.content}>

                  <View style={styles.topRow}>

                    <Text
                      style={[
                        styles.tenantName,
                        item.status === "Unread" &&
                        isTenantMessage
                          ? styles.unreadText
                          : null,
                      ]}
                    >
                      {isTenantMessage
                        ? tenantName(item.tenantId)
                        : "Message to Tenant"}
                    </Text>

                    {isTenantMessage && (
                      <View style={styles.replyBadge}>
                        <Text style={styles.replyBadgeText}>
                          Reply
                        </Text>
                      </View>
                    )}

                  </View>

                  <Text style={styles.subject}>
                    {item.subject}
                  </Text>

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

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    removeMessage(item._id)
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color="#DC2626"
                  />
                </TouchableOpacity>

              </TouchableOpacity>
            );
          }}
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
  },

  header: {
    marginTop: 55,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 14,
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  tenantIcon: {
    backgroundColor: "#DBEAFE",
  },

  landlordIcon: {
    backgroundColor: "#F3E8FF",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tenantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },

  unreadText: {
    fontWeight: "bold",
    color: "#111827",
  },

  replyBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  replyBadgeText: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "bold",
  },

  subject: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },

  preview: {
    marginTop: 3,
    color: "#6B7280",
    fontSize: 13,
  },

  date: {
    marginTop: 5,
    fontSize: 11,
    color: "#9CA3AF",
  },

  deleteButton: {
    marginLeft: 8,
    padding: 5,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    color: "#111827",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 21,
  },
});