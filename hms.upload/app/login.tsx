import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
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
import { api } from "../convex/_generated/api";

function errorMessage(error: unknown, fallback: string) {
  const e = error as any;
  const data = e?.data;
  if (typeof data === "string") return data;
  const msg = String(e?.message ?? "");
  if (/InvalidAccountId|InvalidSecret/i.test(msg)) return "Incorrect email or password.";
  if (/Uncaught ConvexError:\s*(.*)/i.test(msg)) return msg.replace(/^.*Uncaught ConvexError:\s*/i, "").split("\n")[0];
  return fallback;
}

export default function Login() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const isLandlord = role === "landlord";

  const { signIn, signOut } = useAuthActions();
  const bootstrapAdmin = useMutation(api.users.bootstrapAdmin);

  // Landlord accounts can be created once, using the ADMIN_BOOTSTRAP_CODE
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setCode("");
    setCreatingAdmin(false);
  }, [role]);

  async function submit() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert("Missing Information", "Please enter your email and password.");
      return;
    }
    if (creatingAdmin && (!name.trim() || !phone.trim() || !code.trim())) {
      Alert.alert("Missing Information", "Name, phone and the setup code are required.");
      return;
    }

    try {
      setBusy(true);
      if (creatingAdmin) {
        await signIn("password", {
          flow: "signUp",
          email: cleanEmail,
          password,
          name: name.trim(),
          phone: phone.trim(),
        });
        await bootstrapAdmin({ code: code.trim() });
      } else {
        await signIn("password", { flow: "signIn", email: cleanEmail, password });
      }
      // The root screen decides where this user belongs (admin / tenant / pending)
      router.replace("/");
    } catch (error) {
      if (creatingAdmin) {
        // Don't leave a half-created non-admin session behind
        try { await signOut(); } catch {}
      }
      Alert.alert(
        creatingAdmin ? "Setup Failed" : "Login Failed",
        errorMessage(error, "Incorrect email or password.")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {creatingAdmin ? "Create Landlord Account" : isLandlord ? "Landlord Login" : "Tenant Login"}
        </Text>
        <Text style={styles.subtitle}>
          {creatingAdmin
            ? "First-time setup. You need the administrator setup code."
            : isLandlord
            ? "Login to manage your properties"
            : "Login to access your tenant account"}
        </Text>
      </View>

      {creatingAdmin && (
        <>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Your full name" value={name} onChangeText={setName} />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </>
      )}

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {creatingAdmin && (
        <>
          <Text style={styles.label}>Administrator Setup Code</Text>
          <TextInput
            style={styles.input}
            placeholder="ADMIN_BOOTSTRAP_CODE"
            autoCapitalize="none"
            secureTextEntry
            value={code}
            onChangeText={setCode}
          />
        </>
      )}

      <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        <Text style={styles.buttonText}>
          {busy ? "Please wait..." : creatingAdmin ? "Create Account" : "Login"}
        </Text>
      </TouchableOpacity>

      {isLandlord ? (
        <TouchableOpacity onPress={() => setCreatingAdmin((v) => !v)}>
          <Text style={styles.link}>
            {creatingAdmin ? "I already have an account" : "First time? Create landlord account"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>Create Tenant Account</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FC" },
  content: { flexGrow: 1, padding: 24, paddingTop: 70, paddingBottom: 40 },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: "bold", color: "#1E293B" },
  subtitle: { fontSize: 16, color: "#6B7280", marginTop: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
  },
  button: { backgroundColor: "#2563EB", padding: 18, borderRadius: 12, marginTop: 10 },
  buttonText: { color: "#FFFFFF", textAlign: "center", fontWeight: "bold", fontSize: 18 },
  link: { textAlign: "center", marginTop: 25, color: "#2563EB", fontWeight: "600" },
  back: { textAlign: "center", marginTop: 25, color: "#64748B" },
});
