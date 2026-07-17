import { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Chip, Menu } from "react-native-paper";

import type { SprintDoc } from "../types/boards.types";
import { SPRINT_STATUS_COLOR } from "../constants/boards.constants";
import { colors } from "../../../theme/theme";

interface SprintFilterProps {
  sprints: SprintDoc[];
  selectedSprintId: string;
  onChange: (id: string) => void;
  loading: boolean;
}

export default function SprintFilter({
  sprints,
  selectedSprintId,
  onChange,
  loading,
}: SprintFilterProps) {
  const [visible, setVisible] = useState(false);
  const selected = sprints.find((s) => s._id === selectedSprintId);

  if (loading)
    return (
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{ marginHorizontal: 8 }}
      />
    );
  if (sprints.length === 0) return null;

  const chipColor = selected
    ? SPRINT_STATUS_COLOR[selected.status]
    : { color: colors.textSecondary, bg: colors.border };

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Chip
          icon="lightning-bolt-outline"
          onPress={() => setVisible(true)}
          style={[
            styles.chip,
            {
              backgroundColor: chipColor.bg,
              borderColor: `${chipColor.color}40`,
            },
          ]}
          textStyle={[styles.chipText, { color: chipColor.color }]}
        >
          {selected ? selected.name : "All Sprints"}
        </Chip>
      }
    >
      <Menu.Item
        title="All Sprints"
        onPress={() => {
          onChange("");
          setVisible(false);
        }}
      />
      {sprints.map((s) => (
        <Menu.Item
          key={s._id}
          title={`${s.name} · ${s.status}`}
          onPress={() => {
            onChange(s._id);
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
