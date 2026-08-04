import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../../../../components/navbar";
import { Sidebar } from "../../../../components/sidebar";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useTheme } from "../../../../context/ThemeContext";
import { useLanguage } from "../../../../context/LanguageContext";

const { width } = Dimensions.get("window");
import API_URL, { apiFetch } from "../../../../config";

export default function VideoBab1Screen() {
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

  // ID Video YouTube kamu
  const videoId = "PeJ-el7k81s"

  // State untuk melacak status full screen
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../../../../auth/login");
      } else {
        const parsedSession = JSON.parse(session);
        setUserData({
          username: parsedSession.username || "User",
          email: parsedSession.email || "",
        });

        // 💡 AMBIL FOTO PROFIL
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
          console.log("Avatar gagal dimuat di Video screen", e);
        }

        setLoading(false);
      }
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("../../../../auth/login");
    }
  };

  // --- KUNCI OTOMATIS LANDSCAPE / PORTRAIT SAAT FULL SCREEN ---
  const onFullScreenChange = useCallback(async (isFull: boolean) => {
    setIsFullScreen(isFull);
    if (isFull) {
      // Jika user klik full screen, paksa layar jadi landscape mendatar
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
    } else {
      // Jika keluar dari full screen, kembalikan layar tegak portrait
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }
  }, []);

  // Pastikan saat user keluar dari halaman ini, orientasi layar di-reset ke portrait bawaan HP
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

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
      router.replace("../../../../auth/login");
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
      edges={["top"]}
    >
      {/* Sembunyikan Header bawaan Expo agar tidak double */}
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* ==================== NAVBAR ATAS ==================== */}
      {/* HANYA MUNCUL JIKA TIDAK SEDANG FULL SCREEN */}
      {!isFullScreen && (
        <Navbar
          onOpenSidebar={() => toggleSidebar(true)}
          userData={userData}
          profileImage={profileImage}
        />
      )}

      {/* ==================== KONTEN UTAMA ==================== */}
      <View style={styles.mainContent}>
        {/* TOMBOL KEMBALI: HANYA MUNCUL JIKA TIDAK SEDANG FULL SCREEN */}
        {!isFullScreen && (
          <TouchableOpacity
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
          </TouchableOpacity>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.videoTitleText, { color: colors.text }]}>
            {language === "id"
              ? "Video Pembelajaran: Fundamental"
              : "Learning Video: Fundamental"}
          </Text>

          {/* PEMUTAR VIDEO YOUTUBE */}
          <View style={styles.videoWrapper}>
            <YoutubePlayer
              height={isFullScreen ? Dimensions.get("window").height : 220}
              play={false}
              videoId={videoId}
              onChangeState={(state: string) =>
                console.log("Status Video:", state)
              }
              onFullScreenChange={onFullScreenChange}
              initialPlayerParams={{
                preventFullScreen: false,
                cc_load_policy: 0,
                rel: 0,
              }}
            />
          </View>

          {/* DESKRIPSI TAMBAHAN DI BAWAH VIDEO */}
          {!isFullScreen && (
            <View
              style={[
                styles.descriptionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.descriptionHeader, { color: colors.text }]}
              >
                {language === "id" ? "Tentang Materi Ini" : "About This Material"}
              </Text>
              <Text
                style={[styles.descriptionBody, { color: colors.subtext }]}
              >
                {language === "id"
                  ? "Silakan tonton video tutorial di atas untuk memahami apa itu petrofisika?, sifat fisik dan kimia batuan serta interaksinya dengan fluida secara mendalam. Kamu bisa menjeda (pause), memajukan, atau mempercepat video menggunakan kontrol bawaan yang tersedia di layar pemutar."
                  : "Please watch the tutorial video above to gain an in-depth understanding of petrophysics, the physical and chemical properties of rocks, and their interactions with fluids. You can pause, fast-forward, or speed up the video using the built-in controls available on the player screen."}
              </Text>
            </View>
          )}
        </ScrollView>
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
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  scrollContainer: { flex: 1, marginTop: 4 },
  videoTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // CONTAINER UNTUK MENJAGA PLAYER TETAP PROPORSIONAL DAN RAPI
  videoWrapper: {
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  descriptionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  descriptionBody: { fontSize: 14, lineHeight: 22 },
});