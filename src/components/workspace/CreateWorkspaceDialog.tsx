import { useState } from "react";
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

interface CreateWorkspaceDialogProps {
  visible: boolean;
  onClose: () => void;
  onWorkspaceCreated: () => void;
}

export default function CreateWorkspaceDialog({
  visible,
  onClose,
  onWorkspaceCreated,
}: CreateWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setWorkspaceName("");
    setWorkspaceDescription("");
    setError("");
    onClose();
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/workspaces", {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
      });
      onWorkspaceCreated(); 
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Error creating workspace");
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
          onDismiss={handleClose}
          style={{ borderRadius: 16 }}
        >
          <Dialog.Title
            style={{ fontWeight: "700", color: colors.textPrimary }}
          >
            Create Workspace
          </Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              Workspaces are shared environments where your team can collaborate
              on projects and boards.
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
            <Button onPress={handleClose} textColor={colors.textSecondary}>
              Cancel
            </Button>
            <Button
              onPress={handleCreateWorkspace}
              disabled={!workspaceName.trim() || saving}
              loading={saving}
              mode="contained"
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
