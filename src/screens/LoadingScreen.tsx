import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AuthBackground from "../components/ui/AuthBackground";

export default function LoadingScreen() {
  return (
    <AuthBackground>
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
