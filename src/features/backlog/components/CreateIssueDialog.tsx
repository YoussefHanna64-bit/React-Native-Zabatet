import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Divider,
  HelperText,
  Menu,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import api from "../../../api/api";
import type {
  BoardDoc,
  Priority,
  SprintDoc,
  TaskDoc,
  TaskStatus,
  UserDoc,
} from "../types/backlog.types";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../constants/backlog.constants";
import { formatFullDate } from "../utils/backlog.utils";
import { colors } from "../../../theme/theme";

const AVAILABLE_LABELS = [
  "backend",
  "frontend",
  "design",
  "bug",
  "performance",
  "api",
  "auth",
];

interface CreateIssueDialogProps {
  visible: boolean;
  onDismiss: () => void;
  board: BoardDoc | null;
  sprints: SprintDoc[];
  teamMembers: UserDoc[];
  onCreated: (task: TaskDoc) => void;

  defaultSprintId?: string;
}

export default function CreateIssueDialog({
  visible,
  onDismiss,
  board,
  sprints,
  teamMembers,
  onCreated,
  defaultSprintId,
}: CreateIssueDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("Backlog");
  const [assigneeId, setAssigneeId] = useState("");
  const [sprintId, setSprintId] = useState(defaultSprintId ?? "");
  const [storyPoints, setStoryPoints] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("Backlog");
    setAssigneeId("");
    setSprintId(defaultSprintId ?? "");
    setStoryPoints("");
    setLabels([]);
    setDueDate(null);
    setError("");
  };

  useEffect(() => {
    if (visible) setSprintId(defaultSprintId ?? "");
  }, [visible, defaultSprintId]);

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !board) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        boardId: board._id,
        labels,
      };
      if (assigneeId) payload.assignee = assigneeId;
      if (sprintId) payload.sprintId = sprintId;
      if (storyPoints) payload.storyPoints = Number(storyPoints);
      if (dueDate) payload.dueDate = dueDate.toISOString();

      const { data } = await api.post("/tasks", payload);
      onCreated(data.data ?? data);
      reset();
      onDismiss();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create issue");
    } finally {
      setSaving(false);
    }
  };

  const selectedAssignee = teamMembers.find((m) => m._id === assigneeId);
  const selectedSprint = sprints.find((s) => s._id === sprintId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onDismiss}
      presentationStyle="pageSheet"
    >
      <Appbar.Header elevated style={{ backgroundColor: colors.surface }}>
        <Appbar.Action icon="close" onPress={onDismiss} />
        <Appbar.Content title="New Issue" />
        <Button
          onPress={handleSubmit}
          disabled={!title.trim() || saving}
          loading={saving}
          mode="contained"
          style={{ marginRight: 8 }}
        >
          Create
        </Button>
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {!!error && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}

          <TextInput
            mode="outlined"
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.field}
            autoFocus
          />
          <TextInput
            mode="outlined"
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.field}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Priority</Text>
          <SegmentedButtons
            value={priority}
            onValueChange={(v) => setPriority(v as Priority)}
            style={styles.field}
            buttons={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))}
          />

          <Text style={styles.label}>Status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.field}
          >
            <View style={styles.rowWrap}>
              {STATUS_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  selected={status === s}
                  onPress={() => setStatus(s)}
                  style={styles.chipOption}
                >
                  {s}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <Divider style={styles.divider} />

          <Menu
            visible={assigneeMenuOpen}
            onDismiss={() => setAssigneeMenuOpen(false)}
            anchor={
              <TextInput
                mode="outlined"
                label="Assignee"
                value={selectedAssignee ? selectedAssignee.name : "Unassigned"}
                showSoftInputOnFocus={false}
                onFocus={() => {
                  Keyboard.dismiss();
                  setAssigneeMenuOpen(true);
                }}
                right={<TextInput.Icon icon="chevron-down" />}
                style={styles.field}
              />
            }
          >
            <Menu.Item
              title="Unassigned"
              onPress={() => {
                setAssigneeId("");
                setAssigneeMenuOpen(false);
              }}
            />
            {teamMembers.map((m) => (
              <Menu.Item
                key={m._id}
                title={m.name}
                onPress={() => {
                  setAssigneeId(m._id);
                  setAssigneeMenuOpen(false);
                }}
              />
            ))}
          </Menu>

          <Menu
            visible={sprintMenuOpen}
            onDismiss={() => setSprintMenuOpen(false)}
            anchor={
              <TextInput
                mode="outlined"
                label="Sprint"
                value={
                  selectedSprint ? selectedSprint.name : "No sprint (Backlog)"
                }
                showSoftInputOnFocus={false}
                onFocus={() => {
                  Keyboard.dismiss();
                  setSprintMenuOpen(true);
                }}
                right={<TextInput.Icon icon="chevron-down" />}
                style={styles.field}
              />
            }
          >
            <Menu.Item
              title="No sprint (Backlog)"
              onPress={() => {
                setSprintId("");
                setSprintMenuOpen(false);
              }}
            />
            {sprints.map((s) => (
              <Menu.Item
                key={s._id}
                title={s.name}
                onPress={() => {
                  setSprintId(s._id);
                  setSprintMenuOpen(false);
                }}
              />
            ))}
          </Menu>

          <TextInput
            mode="outlined"
            label="Story points"
            value={storyPoints}
            onChangeText={(v) => setStoryPoints(v.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            style={styles.field}
          />

          <TextInput
            mode="outlined"
            label="Due date"
            value={dueDate ? formatFullDate(dueDate.toISOString()) : ""}
            showSoftInputOnFocus={false}
            onFocus={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
            right={<TextInput.Icon icon="calendar" />}
            style={styles.field}
          />
          {showDatePicker && (
            <DateTimePicker
              value={
                dueDate && !isNaN(dueDate.getTime()) ? dueDate : new Date()
              }
              mode="date"
              onChange={(event, selected) => {
                if (Platform.OS === "android") {
                  setShowDatePicker(false);
                }
                if (event.type === "set" && selected) {
                  if (Platform.OS !== "android") setShowDatePicker(false);
                  setDueDate(selected);
                } else if (event.type === "dismissed") {
                  setShowDatePicker(false);
                }
              }}
            />
          )}

          <Text style={styles.label}>Labels</Text>
          <View style={styles.rowWrap}>
            {AVAILABLE_LABELS.map((label) => (
              <Chip
                key={label}
                selected={labels.includes(label)}
                onPress={() => toggleLabel(label)}
                style={styles.chipOption}
              >
                {label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  segment: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chipOption: {
    marginRight: 0,
  },
  divider: {
    marginVertical: 8,
  },
});
