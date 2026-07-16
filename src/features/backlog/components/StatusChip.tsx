import { StyleSheet, View, Text } from "react-native";
import type { TaskStatus } from "../types/backlog.types";
import { statusStyles } from "../constants/backlog.constants";

export default function StatusChip({ status }: { status: TaskStatus }) {
  const cfg = statusStyles[status];

  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  text: {
    fontWeight: "500",
    fontSize: 12,
  },
});
