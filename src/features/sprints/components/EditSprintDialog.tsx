import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  TextInput,
} from "react-native-paper";
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { sprintApi, type Sprint } from "../../../api/sprintApi";
import { formatFullDate } from "../../backlog/utils/backlog.utils";
import { colors } from "../../../theme/theme";

interface EditSprintDialogProps {
  visible: boolean;
  onDismiss: () => void;
  sprint: Sprint | null;
  onUpdated: (sprint: Sprint) => void;
}

export default function EditSprintDialog({
  visible,
  onDismiss,
  sprint,
  onUpdated,
}: EditSprintDialogProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pickerFor, setPickerFor] = useState<"start" | "end" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sprint && visible) {
      setName(sprint.name);
      setGoal(sprint.goal ?? "");
      setStartDate(new Date(sprint.startDate));
      setEndDate(new Date(sprint.endDate));
      setError("");
    }
  }, [sprint, visible]);

  const handleSubmit = async () => {
    if (!sprint || !(sprint._id ?? sprint.id) || !name.trim()) return;
    if (endDate.getTime() <= startDate.getTime()) {
      setError("End date must be after the start date");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await sprintApi.updateSprint((sprint._id ?? sprint.id)!, {
        name: name.trim(),
        goal: goal.trim() || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      onUpdated(updated);
      onDismiss();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to update sprint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={{ borderRadius: 16 }}
        >
          <Dialog.Title>Edit Sprint</Dialog.Title>
          <Dialog.Content>
            {!!error && (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            )}
            <TextInput
              mode="outlined"
              label="Sprint name"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 12 }}
              autoFocus
            />
            <TextInput
              mode="outlined"
              label="Goal (optional)"
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={2}
              style={{ marginBottom: 12 }}
            />

            <TextInput
              mode="outlined"
              label="Start date"
              value={formatFullDate(startDate.toISOString())}
              showSoftInputOnFocus={false}
              right={<TextInput.Icon icon="calendar" />}
              onFocus={() => {
                Keyboard.dismiss();
                setPickerFor("start");
              }}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              mode="outlined"
              label="End date"
              value={formatFullDate(endDate.toISOString())}
              showSoftInputOnFocus={false}
              right={<TextInput.Icon icon="calendar" />}
              onFocus={() => {
                Keyboard.dismiss();
                setPickerFor("end");
              }}
            />

            {pickerFor && (
              <DateTimePicker
                value={pickerFor === "start" ? startDate : endDate}
                mode="date"
                onChange={(event, selected) => {
                  if (Platform.OS === "android") {
                    setPickerFor(null);
                  }
                  if (event.type === "set" && selected) {
                    if (Platform.OS !== "android") setPickerFor(null);
                    if (pickerFor === "start") setStartDate(selected);
                    else setEndDate(selected);
                  } else if (event.type === "dismissed") {
                    setPickerFor(null);
                  }
                }}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onDismiss} textColor={colors.textSecondary}>
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              disabled={!name.trim() || saving}
              loading={saving}
              mode="contained"
            >
              Save Changes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
