import { StyleSheet } from "react-native";
import { Chip, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Priority } from "../types/boards.types";
import { PRIORITY_CONFIG } from "../constants/boards.constants";

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Medium;
  return (
    <Chip
      compact
      style={[
        styles.chip,
        { backgroundColor: cfg.bg, borderColor: `${cfg.color}30` },
      ]}
      textStyle={[styles.text, { color: cfg.color }]}
      icon={() => (
        <MaterialCommunityIcons name="flag" size={11} color={cfg.color} />
      )}
    >
      <Text style={[styles.text, { color: cfg.color }]}>{priority}</Text>
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 24,
    justifyContent: "center",
    borderWidth: 1,
  },
  text: {
    fontWeight: "700",
    fontSize: 11,
  },
});
