import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { SprintGroup, TaskDoc } from "../types/backlog.types";
import TaskRow from "./TaskRow";
import { formatShortDate } from "../utils/backlog.utils";
import { muted, purple, text } from "../constants/backlog.constants";

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  Active: { color: "#047857", bg: "#D1FAE5" },
  Planned: { color: "#344054", bg: "#F2F4F7" },
  Completed: { color: purple, bg: "#EEF2FF" },
};

export default function SprintSection({
  group,
  issueNumbers,
  commentCounts,
  onOpenTask,
  defaultExpanded = true,
}: {
  group: SprintGroup;
  issueNumbers: Record<string, string>;
  commentCounts: Record<string, number>;
  onOpenTask: (task: TaskDoc) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const badge = group.statusLabel ? STATUS_BADGE[group.statusLabel] : null;

  return (
    <View style={styles.section}>
      <TouchableRipple
        onPress={() => setExpanded((v) => !v)}
        style={styles.header}
      >
        <View style={styles.headerInner}>
          <MaterialCommunityIcons
            name={expanded ? "chevron-down" : "chevron-right"}
            size={20}
            color={muted}
          />
          <Text style={styles.title}>{group.title}</Text>
          {badge && (
            <Text
              style={[
                styles.badge,
                { color: badge.color, backgroundColor: badge.bg },
              ]}
            >
              {group.statusLabel}
            </Text>
          )}
          {group.sprint?.startDate && group.sprint?.endDate && (
            <Text style={styles.dates}>
              {formatShortDate(group.sprint.startDate)} –{" "}
              {formatShortDate(group.sprint.endDate)}
            </Text>
          )}
          <Text style={styles.count}>{group.tasks.length}</Text>
        </View>
      </TouchableRipple>

      {expanded && (
        <View>
          {group.tasks.length === 0 ? (
            <Text style={styles.empty}>
              No tasks in this {group.id === "no-sprint" ? "group" : "sprint"}
            </Text>
          ) : (
            group.tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                issueKey={issueNumbers[task._id] ?? ""}
                commentsCount={commentCounts[task._id] ?? 0}
                onOpen={() => onOpenTask(task)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 4,
    borderBottomWidth: 8,
    borderBottomColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
    color: text,
  },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  dates: {
    fontSize: 11,
    color: muted,
  },
  count: {
    marginLeft: "auto",
    fontSize: 12,
    color: muted,
    fontWeight: "600",
  },
  empty: {
    color: muted,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontStyle: "italic",
  },
});
