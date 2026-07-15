import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { WorkspaceProvider } from './src/context/WorkspaceContext';
import RootNavigator from './src/navigation/RootNavigator';
import { paperTheme } from './src/theme/theme';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <WorkspaceProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </WorkspaceProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
