import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Divider, IconButton, Menu, Text } from "react-native-paper";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import {
  useWorkspace,
  type WorkspaceSummary,
} from "../../context/WorkspaceContext";
import api from "../../api/api";
import CreateWorkspaceDialog from "../workspace/CreateWorkspaceDialog";
import EditWorkspaceDialog from "../workspace/EditWorkspaceDialog";
import { colors } from "../../theme/theme";

const PRIMARY_ITEMS: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tab: string;
}[] = [
  { label: "Dashboard", icon: "view-dashboard-outline", tab: "Dashboard" },
  { label: "Boards", icon: "view-column-outline", tab: "Boards" },
  { label: "Backlog", icon: "format-list-bulleted", tab: "Backlog" },
  { label: "Sprints", icon: "run-fast", tab: "Sprints" },
];

const SECONDARY_ITEMS: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tab: string;
}[] = [{ label: "Team", icon: "account-group-outline", tab: "Team" }];

const PROJECT_COLORS = [
  "#4A148C",
  "#6200EA",
  "#3F51B5",
  "#2196F3",
  "#009688",
  "#4CAF50",
];

export default function WorkspaceDrawerContent(
  props: DrawerContentComponentProps,
) {
  const { navigation, state } = props;
  const { user, logout } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace, refresh } =
    useWorkspace();
  const insets = useSafeAreaInsets();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<WorkspaceSummary | null>(null);

  const projectTabsRoute = state.routes.find((r) => r.name === "ProjectTabs");
  const nestedState = (projectTabsRoute as any)?.state;
  const activeTab: string | undefined = nestedState
    ? nestedState.routeNames?.[nestedState.index]
    : undefined;

  const goToTab = (tab: string) => {
    (navigation as any).navigate("ProjectTabs", { screen: tab });
    navigation.closeDrawer();
  };

  const handleDelete = (ws: WorkspaceSummary) => {
    setMenuFor(null);
    Alert.alert(
      "Delete workspace",
      `Are you sure you want to delete workspace "${ws.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/workspaces/${ws._id}`);
              await refresh();
            } catch {
              
            }
          },
        },
      ],
    );
  };

  const renderNavItem = (item: {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    tab: string;
  }) => {
    const isActive = activeTab === item.tab;
    return (
      <View
        key={item.label}
        style={[styles.navItem, isActive && styles.navItemActive]}
        onTouchEnd={() => goToTab(item.tab)}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={20}
          color={isActive ? colors.primaryDark : colors.textSecondary}
        />
        <Text
          style={[styles.navItemText, isActive && styles.navItemTextActive]}
        >
          {item.label}
        </Text>
      </View>
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View style={styles.userBlock}>
        <Text style={styles.userName}>{user?.name ?? "N/A"}</Text>
        <Text style={styles.userEmail}>{user?.email ?? "N/A"}</Text>
      </View>

      <View style={styles.navSection}>{PRIMARY_ITEMS.map(renderNavItem)}</View>

      <Divider style={styles.divider} />

      <View style={styles.navSection}>
        {SECONDARY_ITEMS.map(renderNavItem)}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.projectsHeader}>
        <Text style={styles.projectsLabel}>PROJECTS</Text>
        <IconButton icon="plus" size={18} onPress={() => setCreateOpen(true)} />
      </View>

      <ScrollView style={{ maxHeight: 320 }}>
        {workspaces.map((ws, i) => {
          const isActive = currentWorkspace?._id === ws._id;
          return (
            <View key={ws._id} style={styles.projectRow}>
              <View
                style={styles.projectMain}
                onTouchEnd={() => {
                  selectWorkspace(ws);
                  navigation.closeDrawer();
                }}
              >
                <View
                  style={[
                    styles.projectDot,
                    {
                      backgroundColor:
                        PROJECT_COLORS[i % PROJECT_COLORS.length],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.projectName,
                    isActive && styles.projectNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {ws.name}
                </Text>
              </View>
              <Menu
                visible={menuFor?._id === ws._id}
                onDismiss={() => setMenuFor(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={16}
                    onPress={() => setMenuFor(ws)}
                  />
                }
              >
                <Menu.Item
                  leadingIcon="pencil-outline"
                  title="Edit"
                  onPress={() => {
                    setMenuFor(null);
                    setEditOpen(true);
                  }}
                />
                <Menu.Item
                  leadingIcon="delete-outline"
                  title="Delete"
                  titleStyle={{ color: colors.error }}
                  onPress={() => handleDelete(ws)}
                />
              </Menu>
            </View>
          );
        })}
      </ScrollView>

      <Divider style={styles.divider} />

      <View style={styles.navSection}>
        <View
          style={styles.navItem}
          onTouchEnd={async () => {
            navigation.closeDrawer();
            await logout();
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={colors.error}
          />
          <Text style={[styles.navItemText, { color: colors.error }]}>
            Sign out
          </Text>
        </View>
      </View>

      <CreateWorkspaceDialog
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onWorkspaceCreated={() => {
          setCreateOpen(false);
          refresh();
        }}
      />

      <EditWorkspaceDialog
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        workspace={currentWorkspace}
        onWorkspaceUpdated={() => {
          setEditOpen(false);
          refresh();
        }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userBlock: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userName: {
    fontWeight: "700",
    fontSize: 16,
    color: colors.textPrimary,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  navSection: {
    paddingHorizontal: 12,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: colors.priorityMediumBg,
  },
  navItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  navItemTextActive: {
    color: colors.primaryDark,
    fontWeight: "700",
  },
  divider: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  projectsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 8,
  },
  projectsLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 4,
  },
  projectMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectName: {
    fontSize: 13.5,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  projectNameActive: {
    fontWeight: "700",
  },
});
