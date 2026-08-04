import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "terang" | "gelap" | "sistem";

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  divider: string;
  inputBg: string;
  modalOverlay: string;
  statusBarStyle: "dark-content" | "light-content";
  isDark: boolean;
}

export const lightColors: ThemeColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  subtext: "#64748B",
  border: "#E2E8F0",
  divider: "#F1F5F9",
  inputBg: "#F8FAFC",
  modalOverlay: "rgba(15, 23, 42, 0.5)",
  statusBarStyle: "dark-content",
  isDark: false,
};

// 💡 MODE GELAP ELEGAN (Deep Slate & Charcoal - tidak hitam mentah/legam)
export const darkColors: ThemeColors = {
  background: "#0F172A", // Slate 900
  card: "#1E293B",       // Slate 800
  text: "#F8FAFC",       // Slate 50
  subtext: "#94A3B8",    // Slate 400
  border: "#334155",      // Slate 700
  divider: "#334155",
  inputBg: "#0F172A",
  modalOverlay: "rgba(0, 0, 0, 0.75)",
  statusBarStyle: "light-content",
  isDark: true,
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "terang",
  setThemeMode: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("terang");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("setting_theme");
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (e) {
      console.log("Gagal memuat tema", e);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem("setting_theme", mode);
  };

  // Tentukan warna aktif berdasarkan mode
  let colors = lightColors;
  if (themeMode === "gelap") {
    colors = darkColors;
  } else if (themeMode === "sistem") {
    colors = systemScheme === "dark" ? darkColors : lightColors;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);