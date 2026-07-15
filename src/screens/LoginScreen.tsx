import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import AuthBackground from "../components/ui/AuthBackground";
import BrandLogo from "../components/ui/BrandLogo";
import DarkField from "../components/ui/DarkField";
import GradientButton from "../components/ui/GradientButton";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      await login(email, password);
      
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <BrandLogo />

            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>
              Sign in to continue to your workspace
            </Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.form}>
              <DarkField
                label="Email address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <DarkField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <GradientButton
                title="Sign in"
                onPress={handleSubmit}
                loading={loading}
                disabled={!email || !password}
              />
            </View>

            <Text style={styles.switchText}>
              Don't have an account?{" "}
              <Text
                style={styles.switchLink}
                onPress={() => navigation.navigate("Signup")}
              >
                Create one
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 24,
  },
  heading: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subheading: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 20,
  },
  error: {
    color: "#fca5a5",
    backgroundColor: "rgba(239,68,68,0.12)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 13,
  },
  form: {
    gap: 16,
    marginBottom: 20,
  },
  switchText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
  },
  switchLink: {
    color: "#818cf8",
    fontWeight: "700",
  },
});
