import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Divider, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import AuthBackground from "../components/ui/AuthBackground";
import DarkField from "../components/ui/DarkField";
import GradientButton from "../components/ui/GradientButton";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateUser({ name: name.trim() });
      setSuccess("Name updated successfully");
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    
  };

  return (
    <AuthBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {!!user?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {!!success && <Text style={styles.successBanner}>{success}</Text>}
          {!!error && <Text style={styles.errorBanner}>{error}</Text>}

          <Text style={styles.sectionLabel}>Full name</Text>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <DarkField label="" value={name} onChangeText={setName} />
            </View>
            {!editing ? (
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#94a3b8"
                style={styles.editIcon}
                onPress={() => {
                  setEditing(true);
                  setSuccess("");
                }}
              />
            ) : (
              <MaterialCommunityIcons
                name={saving ? "loading" : "content-save-outline"}
                size={20}
                color="#a5b4fc"
                style={styles.editIcon}
                onPress={handleSave}
              />
            )}
          </View>

          <Text style={styles.sectionLabel}>Email address</Text>
          <DarkField
            label=""
            value={user?.email ?? ""}
            onChangeText={() => {}}
          />

          <Divider style={[styles.divider, { marginTop: 24 }]} />

          <GradientButton title="Sign out" onPress={handleLogout} />
        </View>
      </ScrollView>
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
    maxWidth: 440,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 24,
  },
  avatarSection: {
    alignItems: "center",
    gap: 4,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  userName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  userEmail: {
    color: "#94a3b8",
    fontSize: 14,
  },
  roleBadge: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(99,102,241,0.2)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
  },
  roleText: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 20,
  },
  successBanner: {
    color: "#86efac",
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 13,
  },
  errorBanner: {
    color: "#fca5a5",
    backgroundColor: "rgba(239,68,68,0.12)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 13,
  },
  sectionLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  editIcon: {
    marginTop: -2,
  },
});
