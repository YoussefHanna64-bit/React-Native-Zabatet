import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  Button,
  Dialog,
  HelperText,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import api from "../../api/api";
import { colors } from "../../theme/theme";

interface Workspace {
  _id: string;
  name: string;
  description?: string;
}

interface EditWorkspaceDialogProps {
  visible: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  onWorkspaceUpdated: () => void;
}

export default function EditWorkspaceDialog({
  visible,
  onClose,
  workspace,
  onWorkspaceUpdated,
}: EditWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (workspace && visible) {
      setWorkspaceName(workspace.name);
      
      setWorkspaceDescription(workspace.description || "");
    }
  }, [workspace, visible]);

  const handleUpdateWorkspace = async () => {
    if (!workspace || !workspaceName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
      });
      onWorkspaceUpdated(); 
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Error updating workspace");
    } finally {
      setSaving(false);
    }
  };

  const unchanged =
    workspaceName === workspace?.name &&
    workspaceDescription === (workspace?.description || "");

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <Dialog
          visible={visible}
          onDismiss={onClose}
          style={{ borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontWeight: "700", color: colors.textPrimary }}
          >
            Edit Workspace
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              Update the name and description of your workspace.
            </Text>
            {!!error && (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            )}
            <TextInput
              mode="outlined"
              label="Workspace Name"
              value={workspaceName}
              onChangeText={setWorkspaceName}
              autoFocus
              style={{ marginBottom: 12 }}
            />
            <TextInput
              mode="outlined"
              label="Description (Optional)"
              value={workspaceDescription}
              onChangeText={setWorkspaceDescription}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onClose} textColor={colors.textSecondary}>
              Cancel
            </Button>
            <Button
              onPress={handleUpdateWorkspace}
              disabled={!workspaceName.trim() || saving || unchanged}
              loading={saving}
              mode="contained"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
