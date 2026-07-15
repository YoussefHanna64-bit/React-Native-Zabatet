import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

export default function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <View style={styles.brand}>
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        style={[
          styles.logoIcon,
          { width: size, height: size, borderRadius: size / 4 },
        ]}
      >
        <Text style={[styles.logoIconText, { fontSize: size * 0.5 }]}>Z</Text>
      </LinearGradient>
      <Text style={styles.logoText}>Zabatet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    color: "#fff",
    fontWeight: "800",
  },
  logoText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
    letterSpacing: -0.5,
  },
});
