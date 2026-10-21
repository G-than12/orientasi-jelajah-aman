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
  primaryAccent: string;
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
  bg: "#f4f7fc", // Nuansa langit cerah atmosferik, segar dan bersih
  card: "#ffffff",
  cardBorder: "#e0e7ff", // Border indigo modern beraksen mewah
  cardSecondary: "#eef2ff", // Soft indigo chip & container secondary
  text: "#0f172a", // Slate navy gelap berbobot & kontras tinggi
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  primary: "#4f46e5", // Atmospheric Indigo modern (Apple Weather vibe)
  primaryAccent: "#0ea5e9", // Electric Sky Blue
  primaryBg: "#eef2ff", // Aura indigo lembut
  divider: "rgba(99, 102, 241, 0.08)",
  tabBar: "#ffffff",
  tabBarBorder: "#e0e7ff",
  tabBarActive: "#4f46e5",
  tabBarInactive: "#94a3b8",
  inputBg: "#ffffff",
  inputBorder: "#e0e7ff",
  badgeBg: "#eef2ff",
  badgeText: "#4f46e5",
  tombolHapusBg: "#fef2f2",
  tombolHapusBorder: "#fecaca",
  statusBarStyle: "dark",
};

export const darkTheme: ThemeColors = {
  isDark: true,
  bg: "#070b14", // Deep Atmospheric Midnight
  card: "#0d1527", // Twilight Indigo Night Sky
  cardBorder: "rgba(99, 102, 241, 0.22)", // Indigo aura glow
  cardSecondary: "#131e36",
  text: "#f8fafc", // Starlight crisp white
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  primary: "#6366f1", // Electric Luminous Indigo glow
  primaryAccent: "#38bdf8", // Electric Sky Cyan glow
  primaryBg: "rgba(99, 102, 241, 0.18)",
  divider: "rgba(99, 102, 241, 0.14)",
  tabBar: "#090e1a",
  tabBarBorder: "rgba(99, 102, 241, 0.16)",
  tabBarActive: "#818cf8",
  tabBarInactive: "#64748b",
  inputBg: "#0f172a",
  inputBorder: "rgba(99, 102, 241, 0.25)",
  badgeBg: "rgba(99, 102, 241, 0.2)",
  badgeText: "#a5b4fc",
  tombolHapusBg: "#251217",
  tombolHapusBorder: "#4c1d24",
  statusBarStyle: "light",
};
