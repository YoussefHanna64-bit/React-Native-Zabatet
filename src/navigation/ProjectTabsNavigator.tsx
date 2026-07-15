import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import BoardsScreen from "../screens/BoardsScreen";
import BacklogScreen from "../screens/BacklogScreen";
import SprintsScreen from "../screens/SprintsScreen";
import TeamScreen from "../screens/TeamScreen";
import type { ProjectTabParamList } from "./types";
import { colors } from "../theme/theme";

const Tab = createBottomTabNavigator<ProjectTabParamList>();

const ICONS: Record<
  keyof ProjectTabParamList,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  Dashboard: "view-dashboard-outline",
  Boards: "view-column-outline",
  Backlog: "format-list-bulleted",
  Sprints: "run-fast",
  Team: "account-group-outline",
};

export default function ProjectTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={ICONS[route.name as keyof ProjectTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Boards" component={BoardsScreen} />
      <Tab.Screen name="Backlog" component={BacklogScreen} />
      <Tab.Screen name="Sprints" component={SprintsScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
    </Tab.Navigator>
  );
}
