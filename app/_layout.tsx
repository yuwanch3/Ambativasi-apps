import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// --- IMPORT TEMA GLOBAL & CONTEXT ---
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "../context/ThemeContext";

// 💡 IMPORT CONTEXT BAHASA GLOBAL
import { LanguageProvider } from "../context/LanguageContext";

// 💡 IMPORT CONTEXT CHAT AI
import { ChatProvider } from "../context/ChatContext";

// --- TAMBAHAN KODE TOAST DIMULAI DI SINI ---
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

// --- IMPORT UNTUK NAVIGASI BAR & SYSTEM UI ANDROID ---
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e",
        borderRadius: 15,
        height: "auto",
        minHeight: 55,
        width: "85%",
        marginTop: 10,
        paddingVertical: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 14, fontWeight: "bold" }}
      text2Style={{ fontSize: 12, color: "#666" }}
      text2NumberOfLines={0}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444",
        borderRadius: 15,
        height: "auto",
        minHeight: 55,
        width: "85%",
        marginTop: 10,
        paddingVertical: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 14, fontWeight: "bold" }}
      text2Style={{ fontSize: 12, color: "#666" }}
      text2NumberOfLines={0}
    />
  ),
};

function RootLayoutNav() {
  const { colors } = useTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync(colors.background);
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(colors.isDark ? "light" : "dark");

      // 🟢 AUTO-HIDE NAVIGATION BAR
      NavigationBar.setBehaviorAsync("overlay-swipe");
      NavigationBar.setVisibilityAsync("hidden");

      let timeoutId: ReturnType<typeof setTimeout>;

      const subscription = NavigationBar.addVisibilityListener(
        ({ visibility }) => {
          if (visibility === "visible") {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
              NavigationBar.setVisibilityAsync("hidden");
            }, 3000); // 👈 Sembunyi lagi setelah 3 detik
          }
        },
      );

      return () => {
        subscription.remove();
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [colors.isDark, colors.background]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        initialRouteName="auth/login"
        theme={colors.isDark ? DarkTheme : DefaultTheme}
      >
          {/* Halaman Auth */}
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/forgot-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="auth/reset-password"
            options={{ headerShown: false }}
          />

          {/* Core Tabs */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="profile" options={{ headerShown: false }} />

          <Stack.Screen
            name="share-progress"
            options={{ headerShown: false }}
          />

          {/* Halaman Tilawah */}

          {/* Halaman Ujian */}
          <Stack.Screen name="ujian/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="ujian/bahasa-jepang-ujian/subUjian-Nihongo"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/bahasa-jepang-ujian/N5-ujian/nihongo-N5-ujian"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/tajwid-islam-ujian/tajwid-ujian"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/tajwid-islam-ujian/al-fatihah/ujian-alfatihah"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/tajwid-islam-ujian/al-fatihah/review-Jawaban-ujian"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/petrofisika-ujian/petrofisika-ujian"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/petrofisika-ujian/bab-list"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/petrofisika-ujian/fundamental/ujian-petrofisika"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/petrofisika-ujian/fundamental/review-Jawaban-ujian"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/chemical-eor-ujian/chemical-eor-ujian"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/chemical-eor-ujian/dasar/ujian-chemical-eor"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ujian/chemical-eor-ujian/dasar/review-Jawaban-ujian"
            options={{ headerShown: false }}
          />

          {/* Halaman Materi */}
          <Stack.Screen name="materi/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="materi/bahasa-jepang/nihongo"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="materi/bahasa-jepang/N5/nihongo-N5"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/bahasa-jepang/N5/bab1/materiBab1"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/tajwid-islam/tajwid"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="materi/tajwid-islam/al-fatihah/materiAl-fatihah"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/petrofisika/petrofisika"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/petrofisika/seriMateri"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/petrofisika/pdfSeri"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/petrofisika/videoSeri"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/petrofisika/fundamental/materiFundamental"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/chemical-eor"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/babMateri"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/pdfBab"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/videoBab"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/dasar/materiDasar"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/dasar/pdfDasar"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="materi/chemical-eor/dasar/videoDasar"
            options={{ headerShown: false }}
          />

          <Stack.Screen name="speech/index" options={{ headerShown: false }} />

          <Stack.Screen
            name="speech/qur'an/index"
            options={{ headerShown: false }}
          />
        </Stack>

        <StatusBar style={colors.isDark ? "light" : "dark"} />

        <Toast config={toastConfig} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <LanguageProvider>
        <ChatProvider>
          <RootLayoutNav />
        </ChatProvider>
      </LanguageProvider>
    </CustomThemeProvider>
  );
}
