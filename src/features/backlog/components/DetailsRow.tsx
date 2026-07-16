import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { muted } from "../constants/backlog.constants";

export default function DetailsRow({
  icon,
  label,
  children,
}: {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  label: {
    color: muted,
    fontSize: 12,
    fontWeight: "700",
  },
});
