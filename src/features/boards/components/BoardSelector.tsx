import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  HelperText,
  IconButton,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

import api from "../../../api/api";
import type { BoardDoc } from "../types/boards.types";
import { colors } from "../../../theme/theme";



function CreateBoardDialog({
  visible,
  onDismiss,
  workspaceId,
  onCreated,
}: {
  visible: boolean;
  onDismiss: () => void;
  workspaceId: string;
  onCreated: (board: BoardDoc) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/boards", {
        name: name.trim(),
        workspaceId,
      });
      onCreated(data.data ?? data);
      setName("");
      onDismiss();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create board");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>New Board</Dialog.Title>
        <Dialog.Content>
          {!!error && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}
          <TextInput
            mode="outlined"
            label="Board name"
            value={name}
            onChangeText={setName}
            autoFocus
            dense
          />
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
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}



export interface BoardSelectorProps {
  boards: BoardDoc[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBoardCreated: (board: BoardDoc) => void;
  workspaceId: string | null;
  loading: boolean;
}

export default function BoardSelector({
  boards,
  selectedId,
  onSelect,
  onBoardCreated,
  workspaceId,
  loading,
}: BoardSelectorProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            style={{ marginHorizontal: 12 }}
            color={colors.primary}
          />
        ) : boards.length === 0 ? (
          <Text style={styles.emptyText}>No boards yet</Text>
        ) : (
          boards.map((board) => {
            const selected = selectedId === board._id;
            return (
              <Chip
                key={board._id}
                selected={selected}
                onPress={() => onSelect(board._id)}
                icon="view-dashboard-outline"
                style={[styles.chip, selected && styles.chipSelected]}
                textStyle={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
              >
                {board.name}
              </Chip>
            );
          })
        )}
        <IconButton
          icon="plus"
          size={20}
          mode="contained-tonal"
          disabled={!workspaceId}
          onPress={() => setCreateOpen(true)}
        />
      </ScrollView>

      {workspaceId && (
        <CreateBoardDialog
          visible={createOpen}
          onDismiss={() => setCreateOpen(false)}
          workspaceId={workspaceId}
          onCreated={(board) => {
            onBoardCreated(board);
            setCreateOpen(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: colors.priorityMediumBg,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.textFaint,
    fontSize: 13,
    marginHorizontal: 8,
  },
  dialog: {
    borderRadius: 16,
  },
});
