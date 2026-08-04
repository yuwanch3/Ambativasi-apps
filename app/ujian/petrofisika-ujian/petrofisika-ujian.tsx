import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../../../components/navbar";
import { Sidebar } from "../../../components/sidebar";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useTheme } from "../../../context/ThemeContext";
import { useLanguage } from "../../../context/LanguageContext";

const { width } = Dimensions.get("window");
import API_URL, { apiFetch } from "../../../config";

export default function MateriScreen() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [localUserData, setLocalUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);

  // --- STATE MODAL KONFIRMASI LATIHAN SOAL / UJIAN ---
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedExamPath, setSelectedExamPath] = useState<string>("");

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../auth/login");
      } else {
        const parsedSession = JSON.parse(session);
        setLocalUserData({
          username: parsedSession.username || "User",
          email: parsedSession.email || "",
        });

        // 💡 AMBIL FOTO PROFIL: Sinkronisasi instan dari database API PHP
        try {
          const responseProfile = await apiFetch(
            `${API_URL}/get-profile.php?email=${parsedSession.email}`,
          );
          const dataProfile = await responseProfile.json();
          if (dataProfile.status === "success" && dataProfile.profile_image) {
            setProfileImage(`${API_URL}/${dataProfile.profile_image}`);
          } else {
            setProfileImage(null);
          }
        } catch (e) {
          console.log("Avatar gagal dimuat di materi screen", e);
        }

        setLoading(false);
      }
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("../auth/login");
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
      router.replace("../auth/login");
    } catch (error) {
      console.log("Gagal menghapus session", error);
    }
  };

  // 💡 BUKA MODAL KONFIRMASI DENGAN MENYIMPAN PATH UJIAN
  const handleOpenExamModal = (path: string) => {
    setSelectedExamPath(path);
    setIsExamModalOpen(true);
  };

  // 💡 EKSEKUSI MASUK LATIHAN SOAL / UJIAN SETELAH DIKONFIRMASI
  const handleStartExam = () => {
    setIsExamModalOpen(false);
    if (selectedExamPath) {
      router.push(selectedExamPath as any);
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
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Array Level untuk mempermudah render berjajar ke bawah
  const levels = [
    {
      id: 1,
      image: require("../../../assets/icons/icon-fundamental.png"),
      judul: "Fundamental",
      sub:
        language === "id"
          ? "Ujian Materi Petrofisika Fundamental"
          : "Petrophysics Fundamental Exam",
      path: "/ujian/petrofisika-ujian/fundamental/ujian-petrofisika",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* ==================== NAVBAR ATAS ==================== */}
      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={localUserData}
        profileImage={profileImage}
      />

      {/* ==================== KONTEN UTAMA ==================== */}
      <View style={styles.mainContent}>
        {/* TOMBOL KEMBALI */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={colors.isDark ? "#60A5FA" : "#2563EB"}
          />
          <Text
            style={[
              styles.backButtonText,
              { color: colors.isDark ? "#60A5FA" : "#2563EB" },
            ]}
          >
            {language === "id" ? "Kembali ke Ujian" : "Back to Exam"}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === "id" ? "Pilih BAB" : "Select Chapter"}
          </Text>

          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => handleOpenExamModal(level.path)}
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ==================== MODAL KONFIRMASI LATIHAN SOAL ==================== */}
      <Modal visible={isExamModalOpen} transparent animationType="fade">
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={colors.isDark ? "#60A5FA" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === "id" ? "Konfirmasi Soal" : "Quiz Confirmation"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsExamModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalMessage, { color: colors.subtext }]}>
              {language === "id"
                ? "Apakah anda yakin ingin mengerjakan latihan soal ini?"
                : "Are you sure you want to attempt this practice quiz?"}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.btnModalCancel,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setIsExamModalOpen(false)}
              >
                <Text
                  style={[styles.btnModalCancelText, { color: colors.text }]}
                >
                  {language === "id" ? "Batal" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnModalConfirm, { backgroundColor: "#2563EB" }]}
                onPress={handleStartExam}
              >
                <Text style={styles.btnModalConfirmText}>
                  {language === "id" ? "Mulai Soal" : "Start Quiz"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== SIDEBAR ==================== */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={localUserData}
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

  // STYLES MODAL KONFIRMASI
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  btnModalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  btnModalCancelText: {
    fontWeight: "600",
    fontSize: 14,
  },
  btnModalConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnModalConfirmText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
