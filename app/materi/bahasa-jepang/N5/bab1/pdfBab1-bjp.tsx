import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../../../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../../../../../components/navbar";
import { Sidebar } from "../../../../../components/sidebar";

// 💡 IMPORT DATA SUMBER MATERI
import { SUMBER_MATERI_BAHASA_JEPANG } from "../../../../../src/data/materiSumber";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useTheme } from "../../../../../context/ThemeContext";
import { useLanguage } from "../../../../../context/LanguageContext";

const { width } = Dimensions.get("window");
import API_URL, { apiFetch } from "../../../../../config";

export default function pdfBab1Screen() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const data = SUMBER_MATERI_BAHASA_JEPANG["bab1-bjp"];
  const onlinePdfUrl = data.pdfUrl;

  // 2. Bungkus dengan gview agar otomatis dirender jadi dokumen interaktif yang BISA DIZOOM
  const webViewSource = {
    uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(onlinePdfUrl)}`,
  };

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("/auth/login");
      } else {
        const parsedSession = JSON.parse(session);
        setUserData({
          username: parsedSession.username || "User",
          email: parsedSession.email || "",
        });

        // 💡 SINKRONISASI FOTO PROFIL
        try {
          const responseProfile = await apiFetch(`${API_URL}/get-profile.php?email=${parsedSession.email}`
          );
          const dataProfile = await responseProfile.json();
          if (dataProfile.status === "success" && dataProfile.profile_image) {
            setProfileImage(
              `${API_URL}/${dataProfile.profile_image}`
            );
          }
        } catch (e) {
          console.log("Avatar gagal dimuat di PDF screen", e);
        }

        setLoading(false);
      }
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("/auth/login");
    }
  };

  const toggleSidebar = (open: boolean) => {
    if (open) {
      setIsSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setIsSidebarOpen(false));
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userSession");
      router.replace("/auth/login");
    } catch (error) {
      console.log("Gagal menghapus session", error);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* MENGHILANGKAN BAR PUTIH BAWAAN EXPO ROUTER YANG DI ATAS */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* ==================== NAVBAR ATAS ==================== */}
      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={userData}
        profileImage={profileImage}
      />

      {/* ==================== KONTEN UTAMA ==================== */}
      <View style={styles.mainContent}>
        {/* TOMBOL KEMBALI */}
        <SoundTouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.isDark ? "#4ADE80" : "#16A34A"}
          />
          <Text
            style={[
              styles.backButtonText,
              { color: colors.isDark ? "#4ADE80" : "#16A34A" },
            ]}
          >
            {language === "id" ? "Kembali ke Menu Materi" : "Back to Material Menu"}
          </Text>
        </SoundTouchableOpacity>

        {/* CONTAINER VIEW UNTUK MENAMPILKAN PDF SECARA FLEKSIBEL */}
        <View
          style={[
            styles.pdfContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <WebView
            originWhitelist={["*"]}
            source={webViewSource}
            style={styles.pdfViewer}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            // ==================== FITUR PAKSA ZOOM (ANDROID & iOS) ====================
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            setSupportZoom={true} // Mengizinkan WebView mendukung fungsi zoom
            builtInZoomControls={true} // Mengaktifkan kontrol zoom bawaan Android
            displayZoomControls={false} // Menyembunyikan tombol (+) dan (-) abu-abu yang mengganggu di layar
            // =========================================================================

            startInLoadingState={true}
            renderLoading={() => (
              <ActivityIndicator
                color={colors.isDark ? "#4ADE80" : "#16A34A"}
                size="large"
                style={{ position: "absolute", top: "45%", left: "45%" }}
              />
            )}
          />
        </View>
      </View>

      {/* ==================== SIDEBAR ==================== */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={userData}
        profileImage={profileImage}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  pdfContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 0,
  },
  pdfViewer: {
    flex: 1,
    width: Dimensions.get("window").width - 42,
    height: Dimensions.get("window").height,
  },
});