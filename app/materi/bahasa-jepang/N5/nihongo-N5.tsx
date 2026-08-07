import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../../../../components/navbar";
import { Sidebar } from "../../../../components/sidebar";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useLanguage } from "../../../../context/LanguageContext";
import { useTheme } from "../../../../context/ThemeContext";

const { width } = Dimensions.get("window");
import API_URL, { apiFetch } from "../../../../config";

export default function MateriScreen() {
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

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../../../auth/login");
      } else {
        const parsedSession = JSON.parse(session);
        setUserData({
          username: parsedSession.username || "User",
          email: parsedSession.email || "",
        });

        // 💡 SINKRONISASI FOTO PROFIL
        try {
          const responseProfile = await apiFetch(`${API_URL}/get-profile.php?email=${parsedSession.email}`,
          );
          const dataProfile = await responseProfile.json();
          if (dataProfile.status === "success" && dataProfile.profile_image) {
            setProfileImage(
              `${API_URL}/${dataProfile.profile_image}`,
            );
          }
        } catch (e) {
          console.log("Avatar gagal disinkronkan di tingkat screen", e);
        }

        setLoading(false);
      }
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("../../../auth/login");
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
      router.replace("../../../auth/login");
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

  const levels = [
    {
      id: 1,
      image: require("../../../../assets/icons/icon-bab1.png"),
      judul: language === "id" ? "BAB 1" : "CHAPTER 1",
      sub:
        language === "id"
          ? "Perkenalan diri & Pola Kalimat Dasar"
          : "Self-introduction & Basic Sentence Patterns",
      path: "/materi/bahasa-jepang/N5/bab1/materiBab1",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

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
            {t("back_to_level")}
          </Text>
        </SoundTouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("select_bab")}
          </Text>

          {levels.map((level) => (
            <SoundTouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push(level.path as any)}
            >
              <View style={styles.levelCardLeft}>
                <View style={[styles.levelBadge]}>
                  <Image
                    source={level.image}
                    style={styles.badgeImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.levelTitle, { color: colors.text }]}>
                    {level.judul}
                  </Text>
                  <Text
                    style={[styles.levelSubtitle, { color: colors.subtext }]}
                    numberOfLines={1}
                  >
                    {level.sub}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.subtext}
              />
            </SoundTouchableOpacity>
          ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#0f172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  levelCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
  },
  levelTitle: { fontSize: 16, fontWeight: "bold" },
  levelSubtitle: { fontSize: 12, marginTop: 2 },
});