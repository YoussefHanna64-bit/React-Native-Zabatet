import { MD3LightTheme, type MD3Theme } from "react-native-paper";


export const colors = {
  
  primary: "#7C4DFF",
  primaryDark: "#651FFF",
  primaryDarker: "#4527A0",

  
  authGradientFrom: "#0f0c29",
  authGradientVia: "#1a1a3e",
  authGradientTo: "#24243e",
  authAccentFrom: "#6366f1",
  authAccentTo: "#8b5cf6",
  authTextMuted: "#94a3b8",
  authTextFaint: "#64748b",
  authInputBg: "rgba(255,255,255,0.06)",
  authInputBorder: "rgba(255,255,255,0.12)",
  authCardBg: "rgba(255,255,255,0.06)",
  authCardBorder: "rgba(255,255,255,0.1)",

  
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceMuted: "#FAFAFA",
  border: "#F0F0F0",
  borderStrong: "#E0E0E0",

  
  textPrimary: "#1A1A2E",
  textSecondary: "#757575",
  textMuted: "#9E9E9E",
  textFaint: "#BDBDBD",

  
  statusBacklog: "#9E9E9E",
  statusTodo: "#2196F3",
  statusInProgress: "#FF9800",
  statusReview: "#9C27B0",
  statusDone: "#4CAF50",

  
  priorityLow: "#4CAF50",
  priorityLowBg: "#E8F5E9",
  priorityMedium: "#7C4DFF",
  priorityMediumBg: "#EDE7F6",
  priorityHigh: "#FF9800",
  priorityHighBg: "#FFF3E0",

  
  error: "#D32F2F",
  errorBg: "#FFEBEE",
  success: "#4CAF50",
} as const;

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.primaryDark,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
  },
  roundness: 12,
};


export function avatarColor(name: string): string {
  const palette = [
    "#7C4DFF",
    "#E91E63",
    "#009688",
    "#FF5722",
    "#3F51B5",
    "#0288D1",
    "#F57C00",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
