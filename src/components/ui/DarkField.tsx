import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, TextInput } from "react-native-paper";

interface DarkFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  error?: boolean;
}

export default function DarkField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
}: DarkFieldProps) {
  const [reveal, setReveal] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        mode="outlined"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        secureTextEntry={isPassword && !reveal}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        dense
        outlineColor={error ? "#f87171" : "rgba(255,255,255,0.12)"}
        activeOutlineColor={error ? "#f87171" : "#6366f1"}
        textColor="#fff"
        style={styles.input}
        theme={{
          colors: { onSurfaceVariant: "#94a3b8", background: "transparent" },
        }}
        right={
          isPassword ? (
            <TextInput.Icon
              icon={reveal ? "eye-off" : "eye"}
              color="#94a3b8"
              onPress={() => setReveal((v) => !v)}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 4,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
