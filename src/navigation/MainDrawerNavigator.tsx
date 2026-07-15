import { createDrawerNavigator } from "@react-navigation/drawer";

import ProjectTabsNavigator from "./ProjectTabsNavigator";
import WorkspaceDrawerContent from "../components/layout/WorkspaceDrawerContent";
import AppHeader from "../components/layout/AppHeader";
import type { MainDrawerParamList } from "./types";

const Drawer = createDrawerNavigator<MainDrawerParamList>();

export default function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <WorkspaceDrawerContent {...props} />}
      screenOptions={{
        header: (props) => <AppHeader {...props} />,
        drawerType: "front",
        drawerStyle: { width: 300 },
      }}
    >
      <Drawer.Screen
        name="ProjectTabs"
        component={ProjectTabsNavigator}
        options={{ title: "Zabatet" }}
      />
    </Drawer.Navigator>
  );
}
