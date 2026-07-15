import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Avatar, Button, Text } from "react-native-paper";
import type { DrawerHeaderProps } from "@react-navigation/drawer";

import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { colors, getInitials } from "../../theme/theme";

const ROUTE_TITLES: Record<string, string> = {
  Dashboard: "Dashboard",
  Boards: "Boards",
  Backlog: "Backlog",
  Sprints: "Sprints",
  Team: "Team",
};

export default function AppHeader({ navigation, route }: DrawerHeaderProps) {
  const { user } = useAuth();
  const { currentWorkspace, refresh } = useWorkspace();

  const nestedState = (route as any).state;
  const activeTabName: string | undefined = nestedState
    ? nestedState.routeNames?.[nestedState.index]
    : undefined;
  const title = activeTabName
    ? (ROUTE_TITLES[activeTabName] ?? activeTabName)
    : "Dashboard";

  return (
    <Appbar.Header style={styles.header} elevated={false}>
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />

      <View style={styles.titleBlock}>
        <Text style={styles.breadcrumb} numberOfLines={1}>
          {user?.name ?? "N/A"} {">"} {currentWorkspace?.name ?? ""} {">"}
        </Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <Avatar.Text
        size={34}
        label={getInitials(user?.name)}
        style={{
          backgroundColor: colors.primary,
          marginLeft: 8,
          marginRight: 8,
        }}
        onTouchEnd={() => (navigation as any).getParent()?.navigate("Profile")}
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    elevation: 0,
  },
  titleBlock: {
    flex: 1,
  },
  breadcrumb: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  createBtn: {
    borderRadius: 20,
    marginRight: 4,
  },
  createBtnLabel: {
    fontSize: 12,
  },
});
