import { StyleSheet, View } from "react-native";
import { Avatar, Text, TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { TaskDoc } from "../types/backlog.types";
import LabelChip from "./LabelChip";
import StatusChip from "./StatusChip";

import {
  avatarColor,
  formatShortDate,
  getAssigneeName,
  initials,
} from "../utils/backlog.utils";

import { line, muted, statusDot, text } from "../constants/backlog.constants";

export default function TaskRow({
  task,
  issueKey,
  commentsCount,
  onOpen,
}: {
  task: TaskDoc;
  issueKey: string;
  commentsCount: number;
  onOpen: () => void;
}) {
  const status = task.status ?? "Backlog";
  const assigneeName = getAssigneeName(task);

  return (
    <TouchableRipple onPress={onOpen} style={styles.row}>
      <View>
        <View style={styles.topLine}>
          <View
            style={[styles.statusDot, { backgroundColor: statusDot[status] }]}
          />
          <Text style={styles.issueKey}>{issueKey}</Text>
          <StatusChip status={status} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>

        {(task.labels ?? []).length > 0 && (
          <View style={styles.labelsRow}>
            {(task.labels ?? []).slice(0, 3).map((label) => (
              <LabelChip key={label} label={label} />
            ))}
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Avatar.Text
              size={20}
              label={
                assigneeName === "Unassigned" ? "?" : initials(assigneeName)
              }
              style={{ backgroundColor: avatarColor(assigneeName) }}
              labelStyle={styles.avatarLabel}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {assigneeName.split(" ")[0]}
            </Text>
          </View>

          {task.storyPoints != null && (
            <View style={styles.metaItem}>
              <Text style={styles.ptsChip}>{task.storyPoints}pt</Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={13}
              color={muted}
            />
            <Text style={styles.metaText}>{formatShortDate(task.dueDate)}</Text>
          </View>

          {commentsCount > 0 && (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={13}
                color={muted}
              />
              <Text style={styles.metaText}>{commentsCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: line,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  issueKey: {
    color: muted,
    fontSize: 12,
  },
  title: {
    color: text,
    fontSize: 15,
    marginBottom: 6,
  },
  labelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatarLabel: {
    fontSize: 9,
    fontWeight: "700",
  },
  metaText: {
    color: "#475467",
    fontSize: 12,
  },
  ptsChip: {
    color: "#667085",
    fontSize: 12,
    backgroundColor: "#F8F9FB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
});
