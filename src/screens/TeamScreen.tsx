import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  Dialog,
  HelperText,
  IconButton,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  useDashboardData,
  avatarColor,
  getInitials,
} from "../api/DashboardAPI";
import api from "../api/api";
import { colors } from "../theme/theme";

function RoleChip({ role }: { role?: string }) {
  if (!role) return null;
  const isOwner = role === "Owner";
  return (
    <Chip
      compact
      icon={() => (
        <MaterialCommunityIcons
          name={isOwner ? "trophy-outline" : "account-outline"}
          size={11}
          color={isOwner ? "#E65100" : "#9E9E9E"}
        />
      )}
      style={{ height: 20, backgroundColor: isOwner ? "#FFF3E0" : "#F5F5F5" }}
      textStyle={{
        fontSize: 10,
        fontWeight: "700",
        color: isOwner ? "#E65100" : "#9E9E9E",
      }}
    >
      {role}
    </Chip>
  );
}

export default function TeamScreen() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { loading, error, memberStats, workspaceId, ownerId, refresh } =
    useDashboardData(currentWorkspace?.name);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      await api.post(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail,
      });
      setInviteOpen(false);
      setInviteEmail("");
      refresh();
    } catch (err: any) {
      setInviteError(err?.response?.data?.message ?? "Failed to invite member");
    } finally {
      setInviteLoading(false);
    }
  };

  const doRemove = async (memberId: string) => {
    setRemoveLoading(memberId);
    setActionError("");
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      refresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? "Failed to remove member");
    } finally {
      setRemoveLoading(null);
    }
  };

  const handleRemove = (memberId: string) => {
    Alert.alert(
      "Remove member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => doRemove(memberId),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Team Management</Text>
          <Text style={styles.subheading}>
            Manage your workspace members and view their performance
          </Text>
        </View>
        <Button
          mode="contained"
          icon="account-plus-outline"
          onPress={() => setInviteOpen(true)}
          compact
        >
          Add Member
        </Button>
      </View>

      {(!!error || !!actionError) && (
        <View style={styles.errorBanner}>
          <Text style={{ color: colors.error }}>{error || actionError}</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Workspace Members</Text>
          <Chip
            compact
            style={{ height: 20, backgroundColor: colors.priorityMediumBg }}
            textStyle={{
              fontSize: 10,
              fontWeight: "700",
              color: colors.primary,
            }}
          >
            {memberStats.length} members
          </Chip>
        </View>

        {memberStats.length === 0 ? (
          <Text style={styles.emptyText}>No members found</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {memberStats.map((m) => (
              <View key={m._id} style={styles.memberRow}>
                <Avatar.Text
                  size={40}
                  label={getInitials(m.name)}
                  style={{ backgroundColor: avatarColor(m.name) }}
                  labelStyle={{ fontSize: 13, fontWeight: "700" }}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.name}
                    </Text>
                    <RoleChip role={m.role} />
                  </View>
                  <View style={styles.emailRow}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={12}
                      color={colors.textMuted}
                    />
                    <Text style={styles.memberEmail} numberOfLines={1}>
                      {m.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsBlock}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{m.taskCount}</Text>
                    <Text style={styles.statLabel}>tasks</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {m.points}
                    </Text>
                    <Text style={styles.statLabel}>pts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                      {m.doneCount}
                    </Text>
                    <Text style={styles.statLabel}>done</Text>
                  </View>
                </View>

                {user?._id === ownerId && (
                  <IconButton
                    icon={
                      removeLoading === m._id ? "loading" : "delete-outline"
                    }
                    size={18}
                    iconColor="#FF5252"
                    disabled={m._id === ownerId || removeLoading === m._id}
                    onPress={() => handleRemove(m._id)}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      <Portal>
        <Dialog
          visible={inviteOpen}
          onDismiss={() => setInviteOpen(false)}
          style={{ borderRadius: 16 }}
        >
          <Dialog.Title>Invite Member</Dialog.Title>
          <Dialog.Content>
            <Text
              style={{
                color: colors.textSecondary,
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              Enter the email address of the user you want to invite to this
              workspace. They must already have an account.
            </Text>
            {!!inviteError && (
              <HelperText type="error" visible>
                {inviteError}
              </HelperText>
            )}
            <TextInput
              mode="outlined"
              label="Email Address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              disabled={inviteLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setInviteOpen(false)}
              disabled={inviteLoading}
              textColor={colors.textSecondary}
            >
              Cancel
            </Button>
            <Button
              onPress={handleInvite}
              disabled={!inviteEmail || inviteLoading}
              loading={inviteLoading}
              mode="contained"
            >
              Invite
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  heading: {
    fontWeight: "700",
    fontSize: 19,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.errorBg,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textFaint,
    textAlign: "center",
    paddingVertical: 24,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  memberName: {
    fontWeight: "600",
    fontSize: 13.5,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memberEmail: {
    color: colors.textSecondary,
    fontSize: 11.5,
  },
  statsBlock: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontWeight: "700",
    color: colors.textPrimary,
    fontSize: 13,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 9,
  },
});
