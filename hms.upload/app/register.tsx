import { useAuthActions } from "@convex-dev/auth/react";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function Register() {
  const { signIn } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
    }, [])
  );

  async function createAccount() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password Too Short", "Your password must be at least 8 characters.");
      return;
    }

    try {
      setSaving(true);
      await signIn("password", {
        flow: "signUp",
        email: cleanEmail,
        password,
        name: cleanName,
        phone: cleanPhone,
      });
      Alert.alert(
        "Registration Successful",
        "Your account has been submitted for approval. You can use the app once the landlord approves it.",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error: any) {
      Alert.alert("Registration Failed", (typeof error?.data === "string" ? error.data : "") || "Something went wrong while creating your account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Tenant Registration</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.button} onPress={createAccount} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Creating Account..." : "Create Account"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/login?role=tenant")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FC" },
  content: { padding: 24, paddingTop: 65, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: "bold", color: "#1E293B", marginBottom: 30 },
  input: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", fontSize: 16 },
  button: { backgroundColor: "#2563EB", padding: 18, borderRadius: 12, marginTop: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
  link: { textAlign: "center", marginTop: 24, color: "#2563EB", fontWeight: "600" },
});
