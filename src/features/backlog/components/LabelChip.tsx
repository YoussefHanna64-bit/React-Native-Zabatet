import { StyleSheet, View, Text } from "react-native";
import { labelStyles } from "../constants/backlog.constants";

export default function LabelChip({ label }: { label: string }) {
  const cfg = labelStyles[label.toLowerCase()] ?? {
    color: "#667085",
    bg: "#F2F4F7",
  };

  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  text: {
    fontWeight: "600",
    fontSize: 11,
  },
});
