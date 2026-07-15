import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

import AuthStackNavigator from "./AuthStackNavigator";
import MainDrawerNavigator from "./MainDrawerNavigator";
import LoadingScreen from "../screens/LoadingScreen";
import GetStartedScreen from "../screens/GetStartedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import type { RootStackParamList } from "./types";
import { colors } from "../theme/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthStackNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AuthedRoot} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: "#fff",
          title: "",
        }}
      />
    </Stack.Navigator>
  );
}


function AuthedRoot() {
  const { loading, currentWorkspace } = useWorkspace();

  if (loading) return <LoadingScreen />;
  if (!currentWorkspace) return <GetStartedScreen />;
  return <MainDrawerNavigator />;
}
