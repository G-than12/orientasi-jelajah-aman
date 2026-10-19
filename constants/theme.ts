// constants/theme.ts

export interface ThemeColors {
  isDark: boolean;
  bg: string;
  card: string;
  cardBorder: string;
  cardSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryBg: string;
  divider: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBg: string;
  inputBorder: string;
  badgeBg: string;
  badgeText: string;
  tombolHapusBg: string;
  tombolHapusBorder: string;
  statusBarStyle: "light" | "dark";
}

export const lightTheme: ThemeColors = {
  isDark: false,
  bg: "#f8fafc",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  cardSecondary: "#f1f5f9",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  primary: "#2563eb",
  primaryBg: "#eff6ff",
  divider: "#f1f5f9",
  tabBar: "#ffffff",
  tabBarBorder: "#e2e8f0",
  tabBarActive: "#2563eb",
  tabBarInactive: "#94a3b8",
  inputBg: "#ffffff",
  inputBorder: "#e2e8f0",
  badgeBg: "#eff6ff",
  badgeText: "#2563eb",
  tombolHapusBg: "#fef2f2",
  tombolHapusBorder: "#fecaca",
  statusBarStyle: "dark",
};

export const darkTheme: ThemeColors = {
  isDark: true,
  bg: "#0b0f19",
  card: "#131b2e",
  cardBorder: "#1e293b",
  cardSecondary: "#0f172a",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  primary: "#3b82f6",
  primaryBg: "#172554",
  divider: "#1e293b",
  tabBar: "#0d1322",
  tabBarBorder: "#1e293b",
  tabBarActive: "#60a5fa",
  tabBarInactive: "#64748b",
  inputBg: "#162032",
  inputBorder: "#24324a",
  badgeBg: "#1e293b",
  badgeText: "#60a5fa",
  tombolHapusBg: "#2a1215",
  tombolHapusBorder: "#451a1a",
  statusBarStyle: "light",
};
