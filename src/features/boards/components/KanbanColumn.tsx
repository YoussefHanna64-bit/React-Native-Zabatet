import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";

import type { TaskDoc, TaskStatus } from "../types/boards.types";
import { COLUMN_DOT } from "../constants/boards.constants";
import TaskCard from "./TaskCard";
import { colors } from "../../../theme/theme";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskDoc[];
  loadingTasks: boolean;
  onCardPress: (task: TaskDoc) => void;
  onMoveTask: (taskId: string, to: TaskStatus) => void;
}

export default function KanbanColumn({
  status,
  tasks,
  loadingTasks,
  onCardPress,
  onMoveTask,
}: KanbanColumnProps) {
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: COLUMN_DOT[status] }]} />
        <Text style={styles.headerTitle}>{status}</Text>
        <Chip compact style={styles.countChip} textStyle={styles.countChipText}>
          {tasks.length}
        </Chip>
        {totalPoints > 0 && (
          <Text style={styles.ptsText}>{totalPoints}pts</Text>
        )}
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {loadingTasks ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
        ) : tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks</Text>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => onCardPress(task)}
              onMove={(to) => onMoveTask(task._id, to)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: 270,
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 14,
  },
  countChip: {
    height: 20,
    justifyContent: "center",
    backgroundColor: colors.border,
  },
  countChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  ptsText: {
    color: colors.textFaint,
    fontWeight: "500",
    fontSize: 11,
    marginLeft: "auto",
  },
  body: {
    flex: 1,
  },
  emptyText: {
    color: colors.textFaint,
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
  },
});
