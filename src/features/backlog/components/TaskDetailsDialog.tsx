import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import type {
  CommentDoc,
  SprintDoc,
  TaskDoc,
  TaskStatus,
  UserDoc,
  Priority,
} from "../types/backlog.types";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../constants/backlog.constants";
import StatusChip from "./StatusChip";
import DetailsRow from "./DetailsRow";
import LabelChip from "./LabelChip";
import {
  avatarColor,
  formatFullDate,
  getAssigneeId,
  getSprintId,
  initials,
  timeAgo,
} from "../utils/backlog.utils";
import { colors } from "../../../theme/theme";

interface TaskDetailsDialogProps {
  visible: boolean;
  onDismiss: () => void;
  task: TaskDoc | null;
  issueKey: string;
  sprints: SprintDoc[];
  teamMembers: UserDoc[];
  comments: CommentDoc[];
  commentsLoading: boolean;
  saving: boolean;
  onPatch: (patch: Partial<TaskDoc>) => Promise<void>;
  onAddComment: (text: string) => Promise<void>;
}

export default function TaskDetailsDialog({
  visible,
  onDismiss,
  task,
  issueKey,
  sprints,
  teamMembers,
  comments,
  commentsLoading,
  saving,
  onPatch,
  onAddComment,
}: TaskDetailsDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
    }
  }, [task?._id]);

  if (!task) return null;

  const status = task.status ?? "Backlog";
  const priority = task.priority ?? "Medium";
  const assigneeId = getAssigneeId(task);
  const sprintId = getSprintId(task);
  const assignee = teamMembers.find((m) => m._id === assigneeId);
  const sprint = sprints.find((s) => s._id === sprintId);

  const commitTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) onPatch({ title: trimmed });
  };

  const commitDescription = () => {
    if (description !== (task.description ?? "")) onPatch({ description });
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      await onAddComment(commentText.trim());
      setCommentText("");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
      presentationStyle="pageSheet"
    >
      <Appbar.Header elevated style={{ backgroundColor: colors.surface }}>
        <Appbar.Action icon="close" onPress={onDismiss} />
        <Appbar.Content
          title={issueKey}
          subtitle={saving ? "Saving…" : undefined}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            mode="flat"
            value={title}
            onChangeText={setTitle}
            onBlur={commitTitle}
            style={styles.titleInput}
            multiline
            underlineColor="transparent"
          />

          <DetailsRow label="STATUS">
            <Menu
              visible={statusMenuOpen}
              onDismiss={() => setStatusMenuOpen(false)}
              anchor={
                <Chip
                  onPress={() => setStatusMenuOpen(true)}
                  style={{ alignSelf: "flex-start" }}
                >
                  <StatusChip status={status} />
                </Chip>
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <Menu.Item
                  key={s}
                  title={s}
                  onPress={() => {
                    setStatusMenuOpen(false);
                    onPatch({ status: s });
                  }}
                />
              ))}
            </Menu>
          </DetailsRow>

          <DetailsRow label="DESCRIPTION">
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              onBlur={commitDescription}
              multiline
              numberOfLines={5}
              placeholder="Add a description…"
            />
          </DetailsRow>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <DetailsRow label="PRIORITY">
                <Menu
                  visible={priorityMenuOpen}
                  onDismiss={() => setPriorityMenuOpen(false)}
                  anchor={
                    <Chip icon="flag" onPress={() => setPriorityMenuOpen(true)}>
                      {priority}
                    </Chip>
                  }
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <Menu.Item
                      key={p}
                      title={p}
                      onPress={() => {
                        setPriorityMenuOpen(false);
                        onPatch({ priority: p as Priority });
                      }}
                    />
                  ))}
                </Menu>
              </DetailsRow>
            </View>

            <View style={styles.gridItem}>
              <DetailsRow label="STORY POINTS">
                <TextInput
                  mode="outlined"
                  dense
                  value={
                    task.storyPoints != null ? String(task.storyPoints) : ""
                  }
                  onChangeText={(v) =>
                    onPatch({
                      storyPoints: v
                        ? Number(v.replace(/[^0-9]/g, ""))
                        : undefined,
                    })
                  }
                  keyboardType="number-pad"
                  placeholder="—"
                />
              </DetailsRow>
            </View>
          </View>

          <DetailsRow label="ASSIGNEE">
            <Menu
              visible={assigneeMenuOpen}
              onDismiss={() => setAssigneeMenuOpen(false)}
              anchor={
                <Chip
                  onPress={() => setAssigneeMenuOpen(true)}
                  avatar={
                    assignee ? (
                      <Avatar.Text
                        size={20}
                        label={initials(assignee.name)}
                        style={{ backgroundColor: avatarColor(assignee.name) }}
                        labelStyle={{ fontSize: 9 }}
                      />
                    ) : undefined
                  }
                >
                  {assignee ? assignee.name : "Unassigned"}
                </Chip>
              }
            >
              <Menu.Item
                title="Unassigned"
                onPress={() => {
                  setAssigneeMenuOpen(false);
                  onPatch({ assignee: null });
                }}
              />
              {teamMembers.map((m) => (
                <Menu.Item
                  key={m._id}
                  title={m.name}
                  onPress={() => {
                    setAssigneeMenuOpen(false);
                    onPatch({ assignee: m._id as any });
                  }}
                />
              ))}
            </Menu>
          </DetailsRow>

          <DetailsRow label="SPRINT">
            <Menu
              visible={sprintMenuOpen}
              onDismiss={() => setSprintMenuOpen(false)}
              anchor={
                <Chip onPress={() => setSprintMenuOpen(true)}>
                  {sprint ? sprint.name : "No sprint (Backlog)"}
                </Chip>
              }
            >
              <Menu.Item
                title="No sprint (Backlog)"
                onPress={() => {
                  setSprintMenuOpen(false);
                  onPatch({ sprintId: null });
                }}
              />
              {sprints.map((s) => (
                <Menu.Item
                  key={s._id}
                  title={s.name}
                  onPress={() => {
                    setSprintMenuOpen(false);
                    onPatch({ sprintId: s._id as any });
                  }}
                />
              ))}
            </Menu>
          </DetailsRow>

          <DetailsRow label="DUE DATE">
            <Chip icon="calendar" onPress={() => setShowDatePicker(true)}>
              {task.dueDate ? formatFullDate(task.dueDate) : "No due date"}
            </Chip>
            {showDatePicker && (
              <DateTimePicker
                value={
                  task.dueDate && !isNaN(new Date(task.dueDate).getTime())
                    ? new Date(task.dueDate)
                    : new Date()
                }
                mode="date"
                onChange={(event, selected) => {
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (event.type === "set" && selected) {
                    if (Platform.OS !== "android") setShowDatePicker(false);
                    onPatch({ dueDate: selected.toISOString() });
                  } else if (event.type === "dismissed") {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}
          </DetailsRow>

          {(task.labels ?? []).length > 0 && (
            <DetailsRow label="LABELS">
              <View style={styles.rowWrap}>
                {(task.labels ?? []).map((label) => (
                  <LabelChip key={label} label={label} />
                ))}
              </View>
            </DetailsRow>
          )}

          <Divider style={styles.divider} />

          <Text style={styles.commentsTitle}>
            Comments {comments.length > 0 ? `(${comments.length})` : ""}
          </Text>

          {commentsLoading ? (
            <ActivityIndicator
              style={{ marginVertical: 16 }}
              color={colors.primary}
            />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet</Text>
          ) : (
            comments.map((c) => {
              const authorName =
                typeof c.userId === "object" && c.userId
                  ? c.userId.name
                  : "Unknown";
              return (
                <View key={c._id} style={styles.commentRow}>
                  <Avatar.Text
                    size={28}
                    label={initials(authorName)}
                    style={{ backgroundColor: avatarColor(authorName) }}
                    labelStyle={{ fontSize: 11 }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{authorName}</Text>
                      <Text style={styles.commentTime}>
                        {timeAgo(c.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.commentInputRow}>
          <TextInput
            mode="outlined"
            placeholder="Add a comment…"
            value={commentText}
            onChangeText={setCommentText}
            style={{ flex: 1 }}
            dense
          />
          <IconButton
            icon="send"
            mode="contained"
            disabled={!commentText.trim() || postingComment}
            loading={postingComment}
            onPress={handleSend}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "700",
    backgroundColor: "transparent",
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  grid: {
    flexDirection: "row",
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  divider: {
    marginVertical: 16,
  },
  commentsTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 12,
  },
  noComments: {
    color: colors.textFaint,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 12,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    fontWeight: "700",
    fontSize: 13,
  },
  commentTime: {
    color: colors.textFaint,
    fontSize: 11,
  },
  commentText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
