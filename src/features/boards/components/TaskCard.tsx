import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Avatar,
  Chip,
  IconButton,
  Menu,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { TaskDoc, TaskStatus } from "../types/boards.types";
import { COLUMN_ORDER, LABEL_COLORS } from "../constants/boards.constants";
import {
  avatarColor,
  formatDate,
  initials,
  resolveAssigneeName,
} from "../utils/boards.utils";
import PriorityBadge from "./PriorityBadge";
import { colors } from "../../../theme/theme";

interface TaskCardProps {
  task: TaskDoc;
  onPress: () => void;
  
  onMove: (to: TaskStatus) => void;
}

export default function TaskCard({ task, onPress, onMove }: TaskCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const assigneeName = resolveAssigneeName(task.assignee);

  return (
    <TouchableRipple onPress={onPress} style={styles.card} borderless>
      <View>
        {task.labels.length > 0 && (
          <View style={styles.labelsRow}>
            {task.labels.map((lbl, i) => {
              const cfg = LABEL_COLORS[lbl] ?? {
                color: "#757575",
                bg: "#F5F5F5",
              };
              return (
                <Chip
                  key={`${lbl}-${i}`}
                  compact
                  style={[
                    styles.labelChip,
                    { backgroundColor: cfg.bg, borderColor: `${cfg.color}30` },
                  ]}
                  textStyle={[styles.labelText, { color: cfg.color }]}
                >
                  {lbl}
                </Chip>
              );
            })}
          </View>
        )}

        <Text style={styles.title} numberOfLines={3}>
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          {task.storyPoints != null && (
            <Text style={styles.pts}>{task.storyPoints} pts</Text>
          )}
        </View>

        <View style={styles.footerRow}>
          {assigneeName ? (
            <Avatar.Text
              size={24}
              label={initials(assigneeName)}
              style={{ backgroundColor: avatarColor(assigneeName) }}
              labelStyle={styles.avatarLabel}
            />
          ) : (
            <Avatar.Text
              size={24}
              label="?"
              style={{ backgroundColor: "#E0E0E0" }}
              labelStyle={styles.avatarLabel}
            />
          )}

          <View style={styles.datesRow}>
            {task.dueDate && (
              <View style={styles.dateItem}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={11}
                  color={colors.textFaint}
                />
                <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
              </View>
            )}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-horizontal"
                  size={16}
                  style={styles.moveBtn}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                leadingIcon="swap-horizontal"
                title="Move to…"
                disabled
              />
              {COLUMN_ORDER.filter((s) => s !== task.status).map((s) => (
                <Menu.Item
                  key={s}
                  title={s}
                  onPress={() => {
                    setMenuVisible(false);
                    onMove(s);
                  }}
                />
              ))}
            </Menu>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  labelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  labelChip: {
    height: 22,
    justifyContent: "center",
    borderWidth: 1,
  },
  labelText: {
    fontWeight: "700",
    fontSize: 10,
  },
  title: {
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 19,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  pts: {
    color: colors.textMuted,
    fontWeight: "500",
    fontSize: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dateText: {
    color: colors.textFaint,
    fontSize: 11,
  },
  moveBtn: {
    margin: 0,
  },
});
