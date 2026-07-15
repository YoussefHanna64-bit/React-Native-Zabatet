import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <LinearGradient
      colors={["#0f0c29", "#1a1a3e", "#24243e"]}
      style={styles.page}
    >
      <View pointerEvents="none" style={[styles.blob, styles.blob1]} />
      <View pointerEvents="none" style={[styles.blob, styles.blob2]} />
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blob1: {
    width: 400,
    height: 400,
    top: -140,
    left: -140,
    backgroundColor: "rgba(99,102,241,0.16)",
  },
  blob2: {
    width: 320,
    height: 320,
    bottom: -100,
    right: -100,
    backgroundColor: "rgba(168,85,247,0.14)",
  },
});
