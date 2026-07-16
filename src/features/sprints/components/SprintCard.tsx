import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { IconButton, Menu, ProgressBar, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { Sprint } from "../../../api/sprintApi";
import type { TaskDoc } from "../../backlog/types/backlog.types";
import StatusChip from "../../backlog/components/StatusChip";
import { formatFullDate } from "../../backlog/utils/backlog.utils";
import { SPRINT_STATUS_COLOR } from "../../boards/constants/boards.constants";
import { colors } from "../../../theme/theme";

interface SprintCardProps {
  sprint: Sprint;
  tasks: TaskDoc[];
  onStart: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
  onOpenTask: (task: TaskDoc) => void;
}

export default function SprintCard({
  sprint,
  tasks,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  onAddTask,
  onOpenTask,
}: SprintCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rawStatus = sprint.status ?? "Planned";
  const status = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)) as
    "Planned" | "Active" | "Completed";
  const statusColor =
    SPRINT_STATUS_COLOR[status] ?? SPRINT_STATUS_COLOR.Planned;

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const totalPts = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const donePts = tasks
    .filter((t) => t.status === "Done")
    .reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const progress = total > 0 ? done / total : 0;

  const confirmDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      "Delete sprint",
      `Delete "${sprint.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{sprint.name}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
            >
              <Text style={[styles.statusText, { color: statusColor.color }]}>
                {status}
              </Text>
            </View>
          </View>
          {!!sprint.goal && (
            <Text style={styles.goal} numberOfLines={2}>
              {sprint.goal}
            </Text>
          )}
          <Text style={styles.dates}>
            {formatFullDate(String(sprint.startDate))} –{" "}
            {formatFullDate(String(sprint.endDate))}
          </Text>
        </View>

        <Menu
          visible={menuOpen}
          onDismiss={() => setMenuOpen(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={18}
              onPress={() => setMenuOpen(true)}
            />
          }
        >
          {status === "Planned" && (
            <Menu.Item
              leadingIcon="play-outline"
              title="Start Sprint"
              onPress={() => {
                setMenuOpen(false);
                onStart();
              }}
            />
          )}
          {status === "Active" && (
            <Menu.Item
              leadingIcon="check-circle-outline"
              title="Complete Sprint"
              onPress={() => {
                setMenuOpen(false);
                onComplete();
              }}
            />
          )}
          <Menu.Item
            leadingIcon="pencil-outline"
            title="Edit"
            onPress={() => {
              setMenuOpen(false);
              onEdit();
            }}
          />
          <Menu.Item
            leadingIcon="delete-outline"
            title="Delete"
            titleStyle={{ color: colors.error }}
            onPress={confirmDelete}
          />
        </Menu>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>
            {done}/{total} tasks · {donePts}/{totalPts} pts
          </Text>
          <Text style={styles.progressPct}>
            {total > 0 ? Math.round(progress * 100) : 0}%
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color={statusColor.color}
          style={styles.progressBar}
        />
      </View>

      <View style={styles.taskList}>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks in this sprint yet</Text>
        ) : (
          tasks.slice(0, 6).map((task) => (
            <View
              key={task._id}
              style={styles.taskRow}
              onTouchEnd={() => onOpenTask(task)}
            >
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.title}
              </Text>
              <StatusChip status={task.status ?? "Backlog"} />
            </View>
          ))
        )}
        {tasks.length > 6 && (
          <Text style={styles.moreText}>+{tasks.length - 6} more</Text>
        )}
      </View>

      <View style={styles.addTaskRow} onTouchEnd={onAddTask}>
        <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
        <Text style={styles.addTaskText}>Add task to sprint</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  goal: {
    color: colors.textSecondary,
    fontSize: 12.5,
    marginTop: 4,
  },
  dates: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 4,
  },
  progressBlock: {
    marginTop: 14,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11.5,
  },
  progressPct: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  taskList: {
    marginTop: 14,
    gap: 8,
  },
  emptyText: {
    color: colors.textFaint,
    fontSize: 12,
    fontStyle: "italic",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskTitle: {
    flex: 1,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  moreText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  addTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addTaskText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12.5,
  },
});
