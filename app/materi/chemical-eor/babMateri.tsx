import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
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

// 💡 IMPORT DATA SUMBER MATERI
import { SUMBER_MATERI_CHEMICAL_EOR } from "../../../src/data/materiSumber";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useLanguage } from "../../../context/LanguageContext";
import { useTheme } from "../../../context/ThemeContext";

const { width } = Dimensions.get("window");
import API_URL, { apiFetch } from "../../../config";

export default function MateriBabScreen() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  // --- PARAM LEVEL (bab) ---
  const params = useLocalSearchParams();
  const babId = String(params.bab || "surfaktan");
  const data = SUMBER_MATERI_CHEMICAL_EOR[babId] || SUMBER_MATERI_CHEMICAL_EOR["surfaktan"];

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // --- STATE MODAL KONFIRMASI LATIHAN SOAL ---
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // --- DROPDOWN ANIMASI ---
  const [isMateriOpen, setIsMateriOpen] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(0));

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

        // 💡 AMBIL FOTO PROFIL
        try {
          const responseProfile = await apiFetch(
            `${API_URL}/get-profile.php?email=${parsedSession.email}`,
          );
          const dataProfile = await responseProfile.json();
          if (dataProfile.status === "success" && dataProfile.profile_image) {
            setProfileImage(`${API_URL}/${dataProfile.profile_image}`);
          }
        } catch (e) {
          console.log("Avatar gagal dimuat di materi chemical eor screen", e);
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

  const toggleMateriDropdown = () => {
    const toValue = isMateriOpen ? 0 : 1;
    setIsMateriOpen(!isMateriOpen);

    Animated.timing(dropdownAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userSession");
      router.replace("../../../auth/login");
    } catch (error) {
      console.log("Gagal menghapus session", error);
    }
  };

  // 💡 EKSEKUSI PINDAH KE HALAMAN LATIHAN SOAL SETELAH DIKONFIRMASI
  const handleStartQuiz = () => {
    setIsQuizModalOpen(false);
    router.push({
      pathname: "/materi/chemical-eor/dasar/latihanSoal",
      params: {
        tipe_sumber: "pdf",
        sumber_data: data.sumberData,
        judul_bab:
          language === "id"
            ? `Kuis ${data.judulId}`
            : `${data.judulEn} Quiz`,
      },
    });
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
      image: require("../../../assets/icons/icon-materi.png"),
      judul:
        language === "id"
          ? `Materi ${data.judulId}`
          : `${data.judulEn} Material`,
      sub: language === "id" ? "PDF dan Video" : "PDF and Video",
      path: "",
    },
    {
      id: 2,
      image: require("../../../assets/icons/icon-soal.png"),
      judul: language === "id" ? "Latihan Soal" : "Practice Questions",
      sub: language === "id" ? "10 Soal Chemical EOR" : "10 Chemical EOR Questions",
      path: "",
    },
  ];

  const arrowRotation = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const dropdownOpacity = dropdownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

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
        userData={userData}
        profileImage={profileImage}
      />

      {/* ==================== KONTEN UTAMA ==================== */}
      <View style={styles.mainContent}>
        {/* TOMBOL KEMBALI */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            {language === "id" ? "Kembali ke Tingkatan" : "Back to Level"}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === "id" ? "Semangat Belajar" : "Keep Learning!"}
          </Text>

          {levels.map((level) => {
            if (level.id === 1) {
              return (
                <View
                  key={level.id}
                  style={[
                    styles.dropdownGroupContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.levelCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        marginBottom: 0,
                      },
                    ]}
                    onPress={toggleMateriDropdown}
                    activeOpacity={0.7}
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
                        <Text
                          style={[styles.levelTitle, { color: colors.text }]}
                        >
                          {level.judul}
                        </Text>
                        <Text
                          style={[
                            styles.levelSubtitle,
                            { color: colors.subtext },
                          ]}
                          numberOfLines={1}
                        >
                          {level.sub}
                        </Text>
                      </View>
                    </View>
                    <Animated.View
                      style={{ transform: [{ rotate: arrowRotation }] }}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.subtext}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  <Animated.View
                    style={[
                      styles.dropdownContent,
                      {
                        backgroundColor: colors.isDark ? "#0F172A" : "#F8FAFC",
                        height: dropdownHeight,
                        opacity: dropdownOpacity,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.subMenuItem,
                        { borderColor: colors.border },
                      ]}
                      onPress={() =>
                        router.push(
                          `/materi/chemical-eor/pdfBab?bab=${babId}` as any,
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color={colors.isDark ? "#4ADE80" : "#16A34A"}
                      />
                      <Text
                        style={[
                          styles.subMenuItemText,
                          { color: colors.text },
                        ]}
                      >
                        {language === "id"
                          ? "Buka Materi PDF"
                          : "Open PDF Material"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.subMenuItem, { borderBottomWidth: 0 }]}
                      onPress={() =>
                        router.push(
                          `/materi/chemical-eor/videoBab?bab=${babId}` as any,
                        )
                      }
                    >
                      <Ionicons
                        name="play-circle-outline"
                        size={18}
                        color={colors.isDark ? "#60A5FA" : "#2563EB"}
                      />
                      <Text
                        style={[styles.subMenuItemText, { color: colors.text }]}
                      >
                        {language === "id"
                          ? "Tonton Video Pembelajaran"
                          : "Watch Learning Video"}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setIsQuizModalOpen(true)}
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
            );
          })}
        </ScrollView>
      </View>

      {/* ==================== MODAL KONFIRMASI LATIHAN SOAL ==================== */}
      <Modal visible={isQuizModalOpen} transparent animationType="fade">
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
                  color={colors.isDark ? "#4ADE80" : "#16A34A"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === "id" ? "Konfirmasi Kuis" : "Quiz Confirmation"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsQuizModalOpen(false)}>
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
                onPress={() => setIsQuizModalOpen(false)}
              >
                <Text style={[styles.btnModalCancelText, { color: colors.text }]}>
                  {language === "id" ? "Batal" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnModalConfirm,
                  { backgroundColor: colors.isDark ? "#16A34A" : "#16A34A" },
                ]}
                onPress={handleStartQuiz}
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

  dropdownGroupContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownContent: {
    paddingHorizontal: 16,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subMenuItemText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },

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
