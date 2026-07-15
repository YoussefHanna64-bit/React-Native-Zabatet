import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AuthBackground from "../components/ui/AuthBackground";
import BrandLogo from "../components/ui/BrandLogo";
import GradientButton from "../components/ui/GradientButton";
import CreateWorkspaceDialog from "../components/workspace/CreateWorkspaceDialog";
import { useWorkspace } from "../context/WorkspaceContext";

const FEATURES = [
  "Kanban Boards",
  "Sprint Planning",
  "Backlog",
  "Team Management",
];

export default function GetStartedScreen() {
  const { refresh } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AuthBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.iconBox}>
          <MaterialCommunityIcons
            name="rocket-launch-outline"
            size={48}
            color="#fff"
          />
        </LinearGradient>

        <View style={{ alignItems: "center" }}>
          <BrandLogo />
        </View>

        <Text style={styles.heading}>Welcome aboard! 👋</Text>
        <Text style={styles.subheading}>
          You don't have any projects yet. Create your first workspace to start
          managing tasks, boards, and sprints with your team.
        </Text>

        <View style={styles.pillsRow}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>

        <GradientButton
          title="Create Your First Project"
          onPress={() => setCreateOpen(true)}
        />
        <Text style={styles.helper}>Takes less than 30 seconds to set up</Text>
      </ScrollView>

      <CreateWorkspaceDialog
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onWorkspaceCreated={() => {
          setCreateOpen(false);
          refresh();
        }}
      />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heading: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: "center",
  },
  subheading: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 440,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 32,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
    backgroundColor: "rgba(99,102,241,0.1)",
  },
  pillText: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "500",
  },
  helper: {
    color: "#475569",
    fontSize: 13,
    marginTop: 16,
  },
});
