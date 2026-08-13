import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Modal,
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
import { useTheme } from "../../../../context/ThemeContext";
import { useLanguage } from "../../../../context/LanguageContext";

const { width } = Dimensions.get("window");
import API_URL, { apiFetch } from "../../../../config";
import { saveProgress } from "../../../../src/utils/progressTracker";

// Struktur Data Soal Adaptif 4 Variasi
interface SoalAI {
  no: number;
  tipe_soal?: "standar" | "multiple_choice" | "drag_drop" | "fill_blank";
  pertanyaan: string;
  pilihan?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  jawaban_benar: string | string[];
}

// 💡 PEMBERSIH KATA OTOMATIS (MENGABAIKAN HARAKAT ARAB & HURUF BESAR/KECIL)
const bersihkanDanLuruskanTeks = (teks: string): string => {
  if (!teks) return "";
  return teks
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670]/g, "") // Hapus total tanda harakat Tajwid Al-Qur'an
    .replace(/[أإآ]/g, "ا"); // Penyelarasan Alif Hamzah agar tidak kaku
};

// 💡 LOGIKA PENGUJI JAWABAN TOLERAN MULTI-VARIAN
const checkApakahBenar = (soal: SoalAI, jawabanUserText: string | string[]): boolean => {
  if (!soal) return false;
  const targetUser = jawabanUserText || "";

  if (soal.tipe_soal === "fill_blank") {
    const cleanUser = bersihkanDanLuruskanTeks(typeof targetUser === "string" ? targetUser : "");
    
    // Jika format berbentuk array bawaan backend
    if (Array.isArray(soal.jawaban_benar)) {
      return soal.jawaban_benar.some(opsi => bersihkanDanLuruskanTeks(opsi) === cleanUser);
    }
    
    // Antisipasi jika AI mengirim string tunggal atau string representasi array
    if (typeof soal.jawaban_benar === "string") {
      try {
        if (soal.jawaban_benar.startsWith("[")) {
          const parsed: string[] = JSON.parse(soal.jawaban_benar);
          if (Array.isArray(parsed)) {
            return parsed.some(opsi => bersihkanDanLuruskanTeks(opsi) === cleanUser);
          }
        }
      } catch (e) {}
      return bersihkanDanLuruskanTeks(soal.jawaban_benar) === cleanUser;
    }
    return false;
  }
  // Tipe multiple_choice: bandingkan set abjad (jawaban benar bisa lebih dari satu)
  if (soal.tipe_soal === "multiple_choice") {
    const kunci = Array.isArray(soal.jawaban_benar)
      ? soal.jawaban_benar
      : [String(soal.jawaban_benar)];
    const pilihanUser = Array.isArray(targetUser) ? targetUser : [];
    if (kunci.length === 0) return false;
    if (pilihanUser.length !== kunci.length) return false;
    const kunciSorted = [...kunci].sort();
    const pilihanSorted = [...pilihanUser].sort();
    return kunciSorted.every((v, i) => v === pilihanSorted[i]);
  }

  
  return soal.jawaban_benar === targetUser;
};

export default function ReviewJawabanKuis() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const router = useRouter();
  const params = useLocalSearchParams();
  const { judul_bab, sumber_data } = params;

  // --- STATE LAYOUT ---
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // --- STATE DATA REVIEW ---
  const [listSoal, setListSoal] = useState<SoalAI[]>([]);
  const [jawabanUser, setJawabanUser] = useState<Record<number, string | string[]>>({});
  const [indeksAktif, setIndeksAktif] = useState(0);
  const [skor, setSkor] = useState(0);
  // --- STATE MODAL PERINGATAN KELUAR ---
  const [showExitModal, setShowExitModal] = useState(false);
  // 💡 MENDUKUNG TARGET CHAT
  const [exitTarget, setExitTarget] = useState<"dashboard" | "profile" | "pengaturan" | "chat" | "shareProgress">("dashboard");
  const fadeExitAnim = useRef(new Animated.Value(0)).current;
  const scaleExitAnim = useRef(new Animated.Value(0.8)).current;

  // 🔒 FUNGSI KEMBALI KE SOAL DENGAN STATUS JAWABAN TERKUNCI VIA ASYNCSTORAGE
  const kembaliKeSoalLocked = async () => {
    try {
      await AsyncStorage.setItem("isKuisReadOnly", "true");
    } catch (e) {
      console.log("Gagal set readOnly flag", e);
    }
    router.back();
  };

  useEffect(() => {
    loadReviewData();
  }, []);

  useEffect(() => {
    const backAction = () => {
      kembaliKeSoalLocked();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const loadReviewData = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../../../../auth/login");
        return;
      }
      const parsedSession = JSON.parse(session);
      setUserData({
        username: parsedSession.username || "User",
        email: parsedSession.email || "",
      });

      // 💡 AMBIL FOTO PROFIL: Kueri otomatis ke backend PHP
      try {
        const responseProfile = await apiFetch(`${API_URL}/get-profile.php?email=${parsedSession.email}`);
        const dataProfile = await responseProfile.json();
        if (dataProfile.status === "success" && dataProfile.profile_image) {
          setProfileImage(`${API_URL}/${dataProfile.profile_image}`);
        }
      } catch (e) {
        console.log("Avatar gagal disinkronkan di review kuis", e);
      }

      const dataSoalRaw = await AsyncStorage.getItem("dataSoalKuis");
      const jawabanUserRaw = await AsyncStorage.getItem("jawabanUserKuis");

      if (dataSoalRaw && jawabanUserRaw) {
        const parsedSoal: SoalAI[] = JSON.parse(dataSoalRaw);
        const parsedJawaban: Record<number, string | string[]> = JSON.parse(jawabanUserRaw);
        setListSoal(parsedSoal);
        setJawabanUser(parsedJawaban);

        let tempSkor = 0;
        parsedSoal.forEach((soal: SoalAI, index: number) => {
          if (checkApakahBenar(soal, parsedJawaban[index])) {
            tempSkor++;
          }
        });
        setSkor(tempSkor);
        const total = parsedSoal.length;
        saveProgress({
          subjectId: String(sumber_data || "unknown").toLowerCase(),
          subjectName: String(judul_bab || ""),
          levelId: "",
          levelName: "",
          babId: String(sumber_data || "unknown").toLowerCase(),
          babName: String(judul_bab || ""),
          type: "ujian",
          score: tempSkor,
          total,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        });
      } else {
        router.back();
      }
    } catch (error) {
      console.log("Gagal memuat data review", error);
      router.back();
    } finally {
      setLoading(false);
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

  const handleLogout = () => {
    Alert.alert(
      language === "id" ? "Konfirmasi Log Out" : "Confirm Log Out",
      language === "id"
        ? "Apakah kamu yakin ingin keluar dari akun Ambativasi?"
        : "Are you sure you want to log out of your Ambativasi account?",
      [
        {
          text: language === "id" ? "Batal" : "Cancel",
          style: "cancel",
        },
        {
          text: language === "id" ? "Ya, Keluar" : "Yes, Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userSession");
              toggleSidebar(false);
              router.replace("../../../../auth/login");
            } catch (error) {
              console.log("Gagal menghapus session", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 💡 Modal Peringatan dipicu dari Menu Navigasi Sidebar dan Foto Profil Navbar
  const handleBukaModalKeluar = (target: "dashboard" | "profile" | "pengaturan" | "chat" | "shareProgress" = "dashboard") => {
    setExitTarget(target);
    if (isSidebarOpen) toggleSidebar(false);
    setShowExitModal(true);
    Animated.parallel([
      Animated.timing(fadeExitAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleExitAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  const handleTutupModalKeluar = () => {
    Animated.parallel([
      Animated.timing(fadeExitAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleExitAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowExitModal(false));
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </>
    );
  }

  const soalSaatIni = listSoal[indeksAktif];
  const jenisTipe = soalSaatIni?.tipe_soal || "standar";
  
  const isCurrentCorrect = checkApakahBenar(soalSaatIni, jawabanUser[indeksAktif]);
  const jawabanSalah = !isCurrentCorrect;

  // 💡 DETEKSI MATERI TAJWID & AL-FATIHAH SECARA PRESISI

  const wajibRTL = false;

  const renderTeksPertanyaanReview = (fullText: string = "") => {
    if (!fullText) return "";
    if (!fullText.includes("___")) return fullText;
    let isian = jawabanUser[indeksAktif];
    
    if (isian && jenisTipe !== "fill_blank" && soalSaatIni?.pilihan) {
      isian = soalSaatIni.pilihan[isian as keyof typeof soalSaatIni.pilihan] || isian;
    }
    
    const teksTidakDiisi = language === "id" ? "Tidak Diisi" : "Not Answered";
    return fullText.replace("___", ` [ ${isian || teksTidakDiisi} ] `);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.card} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* ==================== NAVBAR ATAS ==================== */}
      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={userData}
        profileImage={profileImage}
        onNavigateProfile={() => handleBukaModalKeluar("profile")}
      />

      {/* ==================== KONTEN UTAMA ==================== */}
      <View style={styles.mainContent}>
        {/* 🟢 Tombol Kembali Atas: Mengunci status kuis dan kembali ke soal */}
        <SoundTouchableOpacity style={styles.backButton} onPress={kembaliKeSoalLocked}>
          <Ionicons name="arrow-back" size={20} color={colors.isDark ? "#4ADE80" : "#16A34A"} />
          <Text style={[styles.backButtonText, { color: colors.isDark ? "#4ADE80" : "#16A34A" }]}>
            {language === "id" ? "Kembali" : "Back"}
          </Text>
        </SoundTouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {language === "id" ? "Review Hasil: " : "Result Review: "}
          {judul_bab || (language === "id" ? "Ujian AI" : "AI Exam")}
        </Text>

        {/* RINGKASAN SKOR */}
        <View style={[styles.kartuSkor, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoSkorUtama}>
            <Text style={[styles.labelTotalSkor, { color: colors.subtext }]}>
              {language === "id" ? "Skor Kamu" : "Your Score"}
            </Text>
            <Text style={[styles.teksSkor, { color: colors.text }]}>{skor} <Text style={[styles.teksTotalSoal, { color: colors.subtext }]}>/ {listSoal.length}</Text></Text>
          </View>
          <View style={[styles.pembatasSkor, { backgroundColor: colors.border }]} />
          <View style={styles.infoPersentase}>
            <Ionicons name="analytics" size={24} color="#2563EB" />
            <Text style={[styles.teksPersen, { color: colors.isDark ? "#60A5FA" : "#2563EB" }]}>{listSoal.length > 0 ? Math.round((skor / listSoal.length) * 100) : 0}%</Text>
            <Text style={[styles.labelPersen, { color: colors.subtext }]}>
              {language === "id" ? "Akurasi" : "Accuracy"}
            </Text>
          </View>
        </View>

        {/* NAVIGASI NOMOR SOAL */}
        <View style={{ marginBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrapperAngka}>
            {listSoal.map((soal, indeks) => {
              const isCorrect = checkApakahBenar(soal, jawabanUser[indeks]);
              return (
                <SoundTouchableOpacity
                  key={indeks}
                  style={[
                    styles.tombolAngka,
                    { borderColor: colors.border },
                    indeksAktif === indeks && styles.angkaAktif,
                    indeksAktif !== indeks && (isCorrect ? styles.angkaBenar : styles.angkaSalah)
                  ]}
                  onPress={() => setIndeksAktif(indeks)}
                >
                  <Text style={[styles.teksAngka, { color: "#fff" }]}>
                    {indeks + 1}
                  </Text>
                </SoundTouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* KARTU PERTANYAAN */}
        <View style={[styles.kartuSoal, { backgroundColor: colors.card, borderColor: colors.border }, wajibRTL && [styles.kartuSoalArab, { backgroundColor: colors.isDark ? "#1E293B" : "#F8FAFF" }]]}>
          <View style={styles.rowTipeReviewBadge}>
            <Text style={[styles.nomorSoalTitle, { color: colors.subtext }]}>
              {language === "id" ? `Pertanyaan ${indeksAktif + 1}` : `Question ${indeksAktif + 1}`}
            </Text>
            
            {/* BADGE TIPE SOAL DENGAN WARNA TEKS DENGAN KONTRAS TINGGI */}
            <View 
              style={[
                styles.badgeMiniTipe, 
                jenisTipe === "drag_drop"
                  ? { backgroundColor: colors.isDark ? "#064E3B" : "#DCFCE7" }
                  : jenisTipe === "multiple_choice"
                  ? { backgroundColor: colors.isDark ? "#1E3A8A" : "#DBEAFE" }
                  : jenisTipe === "fill_blank"
                  ? { backgroundColor: colors.isDark ? "#451A1A" : "#FEE2E2" }
                  : { backgroundColor: colors.isDark ? "#334155" : "#E2E8F0" }
              ]}
            >
              <Text 
                style={[
                  styles.txtMiniTipe, 
                  jenisTipe === "drag_drop"
                    ? { color: colors.isDark ? "#4ADE80" : "#166534" }
                    : jenisTipe === "multiple_choice"
                    ? { color: colors.isDark ? "#93C5FD" : "#1E40AF" }
                    : jenisTipe === "fill_blank"
                    ? { color: colors.isDark ? "#F87171" : "#991B1B" }
                    : { color: colors.isDark ? "#F8FAFC" : "#334155" }
                ]}
              >
                {jenisTipe.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.teksPertanyaan, { color: colors.text }, wajibRTL && styles.teksPertanyaanArab]}>
            {renderTeksPertanyaanReview(soalSaatIni?.pertanyaan)}
          </Text>
          
          <View 
            style={[
              styles.badgeStatus, 
              jawabanSalah 
                ? [styles.badgeSalah, { backgroundColor: colors.isDark ? "#451A1A" : "#FEF2F2", borderColor: colors.isDark ? "#991B1B" : "#FEE2E2" }] 
                : [styles.badgeBenar, { backgroundColor: colors.isDark ? "#064E3B" : "#F0FDF4", borderColor: colors.isDark ? "#065F46" : "#DCFCE7" }]
            ]}
          >
            <Ionicons 
              name={jawabanSalah ? "close-circle" : "checkmark-circle"} 
              size={16} 
              color={jawabanSalah ? (colors.isDark ? "#F87171" : "#EF4444") : (colors.isDark ? "#4ADE80" : "#16A34A")} 
            />
            <Text style={[styles.teksStatus, { color: jawabanSalah ? (colors.isDark ? "#F87171" : "#EF4444") : (colors.isDark ? "#4ADE80" : "#16A34A") }]}>
              {jawabanSalah 
                ? (language === "id" ? "Jawaban Kamu Salah" : "Your Answer is Incorrect") 
                : (language === "id" ? "Jawaban Kamu Benar" : "Your Answer is Correct")}
            </Text>
          </View>
        </View>

        {/* DAFTAR DATA VERIFIKASI SELEKTIF JAWABAN */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {jenisTipe === "fill_blank" ? (
            <View style={[styles.boxReviewBlank, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.labelReviewBlank, { color: colors.text }]}>
                {language === "id" ? "Jawaban Input Teks Kamu:" : "Your Input Text Answer:"}
              </Text>
              <View style={[styles.inputReviewBlankBox, { backgroundColor: colors.isDark ? "#0F172A" : "#F8FAFC" }, isCurrentCorrect ? styles.borderBenar : styles.borderSalah]}>
                <Text style={[styles.textReviewBlankUser, { color: isCurrentCorrect ? "#16A34A" : "#EF4444" }]}>
                  {jawabanUser[indeksAktif] || (language === "id" ? "(Kosong / Tidak Mengisi)" : "(Blank / Not Answered)")}
                </Text>
                <Ionicons name={isCurrentCorrect ? "checkmark-circle" : "close-circle"} size={20} color={isCurrentCorrect ? "#16A34A" : "#EF4444"} />
              </View>
              
              <Text style={[styles.labelReviewBlank, { color: colors.text, marginTop: 14 }]}>
                {language === "id" ? "Variasi Alternatif Jawaban Yang Sah & Diterima:" : "Valid & Accepted Answer Variants:"}
              </Text>
              <View style={styles.boxAcceptedVariants}>
                {soalSaatIni && (Array.isArray(soalSaatIni.jawaban_benar) ? (
                  soalSaatIni.jawaban_benar.map((kata, i) => (
                    <View key={i} style={[styles.chipVariant, { backgroundColor: colors.isDark ? "#1E3A8A" : "#EFF6FF", borderColor: colors.isDark ? "#2563EB" : "#BFDBFE" }]}><Text style={[styles.textChipVariant, { color: colors.isDark ? "#93C5FD" : "#1E40AF" }]}>{kata}</Text></View>
                  ))
                ) : (
                  <View style={[styles.chipVariant, { backgroundColor: colors.isDark ? "#1E3A8A" : "#EFF6FF", borderColor: colors.isDark ? "#2563EB" : "#BFDBFE" }]}><Text style={[styles.textChipVariant, { color: colors.isDark ? "#93C5FD" : "#1E40AF" }]}>{String(soalSaatIni?.jawaban_benar)}</Text></View>
                ))}
              </View>
            </View>
          ) : (
            soalSaatIni && soalSaatIni.pilihan && Object.entries(soalSaatIni.pilihan).map(([abjad, teksOpsi]) => {
              const isUserAnswer = Array.isArray(jawabanUser[indeksAktif])
                ? jawabanUser[indeksAktif].includes(abjad)
                : jawabanUser[indeksAktif] === abjad;
              const isCorrectAnswer = Array.isArray(soalSaatIni.jawaban_benar)
                ? soalSaatIni.jawaban_benar.includes(abjad)
                : soalSaatIni.jawaban_benar === abjad;
              const isWrongUserAnswer = isUserAnswer && !isCorrectAnswer && jawabanSalah;

              let iconKanan = null;
              if (isCorrectAnswer) {
                iconKanan = <Ionicons name="checkmark-circle" size={20} color="#16A34A" />;
              } else if (isWrongUserAnswer) {
                iconKanan = <Ionicons name="close-circle" size={20} color="#EF4444" />;
              }

              return (
                <View 
                  key={abjad} 
                  style={[
                    styles.tombolOpsi,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isCorrectAnswer && [styles.opsiBenarKunci, { backgroundColor: colors.isDark ? "#064E3B" : "#F0FDF4" }],
                    isWrongUserAnswer && [styles.opsiSalahUser, { backgroundColor: colors.isDark ? "#451A1A" : "#FEF2F2" }],
                    wajibRTL && { flexDirection: 'row-reverse' }
                  ]}
                >
                  <View 
                    style={[
                      styles.badgeAbjad,
                      { backgroundColor: colors.isDark ? "#334155" : "#F1F5F9" },
                      isCorrectAnswer && styles.badgeOpsiBenar,
                      isWrongUserAnswer && styles.badgeOpsiSalah
                    ]}
                  >
                    <Text style={[styles.teksAbjad, { color: colors.subtext }, (isCorrectAnswer || isWrongUserAnswer) && { color: "#fff" }]}>
                      {abjad}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.teksOpsiText,
                      { color: colors.text },
                      wajibRTL && styles.teksOpsiArab,
                      isCorrectAnswer && styles.teksOpsiBenar,
                      isWrongUserAnswer && styles.teksOpsiSalah
                    ]}
                  >
                    {teksOpsi}
                  </Text>
                  {iconKanan}
                </View>
              );
            })
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* TOMBOL NAVIGASI BAWAH */}
        <View style={styles.navigasiBawah}>
          <SoundTouchableOpacity
            disabled={indeksAktif === 0}
            style={[styles.tombolNav, indeksAktif === 0 && { opacity: 0.4 }]}
            onPress={() => setIndeksAktif(indeksAktif - 1)}
          >
            <Text style={styles.teksNav}>
              {language === "id" ? "◄ Sebelumnya" : "◄ Previous"}
            </Text>
          </SoundTouchableOpacity>

          {indeksAktif === listSoal.length - 1 ? (
            /* 🟢 Tombol Selesai Review: Mengunci status kuis dan kembali ke soal */
            <SoundTouchableOpacity
              style={[styles.tombolNav, { backgroundColor: "#16A34A" }]}
              onPress={kembaliKeSoalLocked}
            >
              <Text style={styles.teksNav}>
                {language === "id" ? "Selesai Review ✔" : "Finish Review ✔"}
              </Text>
            </SoundTouchableOpacity>
          ) : (
            <SoundTouchableOpacity
              style={styles.tombolNav}
              onPress={() => setIndeksAktif(indeksAktif + 1)}
            >
              <Text style={styles.teksNav}>
                {language === "id" ? "Selanjutnya ►" : "Next ►"}
              </Text>
            </SoundTouchableOpacity>
          )}
        </View>
      </View>

      {/* ==================== SIDEBAR DRAWER MENU ==================== */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={userData}
        profileImage={profileImage}
        onLogout={handleLogout}
        onNavigateDashboard={() => handleBukaModalKeluar("dashboard")}
        onNavigateProfile={() => handleBukaModalKeluar("profile")}
        onNavigateSettings={() => handleBukaModalKeluar("pengaturan")}
        onNavigateChat={() => handleBukaModalKeluar("chat")}
        onNavigateShareProgress={() => handleBukaModalKeluar("shareProgress")}
      />

      {/* ==================== MODAL PERINGATAN KELUAR ==================== */}
      <Modal visible={showExitModal} transparent={true} statusBarTranslucent={true} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { backgroundColor: colors.card }, { opacity: fadeExitAnim, transform: [{ scale: scaleExitAnim }] }]}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="warning" size={76} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === "id" ? "Meninggalkan Review?" : "Leave Review Page?"}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>
              {language === "id"
                ? "Apakah kamu yakin ingin keluar dari halaman review jawaban?"
                : "Are you sure you want to exit the answer review page?"}
            </Text>
            <SoundTouchableOpacity style={styles.modalButtonUtama} onPress={handleTutupModalKeluar}>
              <Text style={styles.modalButtonText}>
                {language === "id" ? "Tidak, Lanjutkan Review" : "No, Continue Review"}
              </Text>
            </SoundTouchableOpacity>

            <SoundTouchableOpacity 
              style={styles.modalButtonKeluarYa} 
              onPress={() => { 
                setShowExitModal(false); 
                if (exitTarget === "dashboard") {
                  router.replace("/(tabs)"); 
                } else if (exitTarget === "profile") {
                  router.push("/profile");
                } else if (exitTarget === "pengaturan") {
                  router.push("/pengaturan");
                } else if (exitTarget === "chat") {
                  router.push("/chat");
                } else if (exitTarget === "shareProgress") {
                  router.push("/share-progress");
                }
              }}
            >
              <Text style={styles.modalButtonTextKeluarYa}>
                {language === "id" ? "Ya, Keluar" : "Yes, Exit"}
              </Text>
            </SoundTouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  backButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, marginBottom: 12 },
  backButtonText: { fontSize: 15, fontWeight: "600", marginLeft: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  wrapperAngka: { paddingVertical: 4 },
  tombolAngka: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", marginRight: 10, borderWidth: 1 },
  teksAngka: { fontSize: 14, fontWeight: "bold" },
  kartuSoal: { padding: 18, borderRadius: 16, marginBottom: 16, borderWidth: 1, elevation: 1 },
  kartuSoalArab: { borderColor: "#2563EB" },
  nomorSoalTitle: { fontSize: 12, fontWeight: "bold" },
  teksPertanyaan: { fontSize: 16, lineHeight: 24, fontWeight: "500", marginBottom: 12 },
  teksPertanyaanArab: { fontSize: 22, textAlign: 'right', lineHeight: 38, fontWeight: "600" },
  tombolOpsi: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  badgeAbjad: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 12 },
  teksAbjad: { fontWeight: "bold", fontSize: 14 },
  teksOpsiText: { flex: 1, fontSize: 15 },
  teksOpsiArab: { fontSize: 19, textAlign: "right", paddingHorizontal: 10 },
  navigasiBawah: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15 },
  tombolNav: { backgroundColor: "#1E293B", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8 },
  teksNav: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  angkaAktif: { backgroundColor: "#1E293B", borderColor: "#1E293B", borderWidth: 2 },
  angkaBenar: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  angkaSalah: { backgroundColor: "#EF4444", borderColor: "#EF4444" },
  badgeStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4, borderWidth: 1 },
  badgeBenar: {},
  badgeSalah: {},
  teksStatus: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  opsiBenarKunci: { borderColor: "#16A34A", borderWidth: 2 },
  opsiSalahUser: { borderColor: "#EF4444", borderWidth: 2 },
  badgeOpsiBenar: { backgroundColor: "#16A34A" },
  badgeOpsiSalah: { backgroundColor: "#EF4444" },
  teksOpsiBenar: { flex: 1, fontSize: 15, color: "#16A34A", fontWeight: "600" },
  teksOpsiSalah: { flex: 1, fontSize: 15, color: "#EF4444", fontWeight: "600" },
  kartuSkor: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, alignItems: 'center', elevation: 1 },
  infoSkorUtama: { flex: 1, alignItems: 'center' },
  labelTotalSkor: { fontSize: 12, marginBottom: 2 },
  teksSkor: { fontSize: 28, fontWeight: 'bold' },
  teksTotalSoal: { fontSize: 16, fontWeight: 'normal' },
  pembatasSkor: { width: 1, height: '80%', marginHorizontal: 15 },
  infoPersentase: { flex: 1, alignItems: 'center' },
  teksPersen: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  labelPersen: { fontSize: 11, marginTop: 1 },

  rowTipeReviewBadge: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeMiniTipe: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  txtMiniTipe: { fontSize: 10, fontWeight: 'bold' },
  boxReviewBlank: { padding: 16, borderRadius: 16, borderWidth: 1 },
  labelReviewBlank: { fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  inputReviewBlankBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  borderBenar: { borderColor: '#16A34A' },
  borderSalah: { borderColor: '#EF4444' },
  textReviewBlankUser: { fontSize: 15, fontWeight: 'bold', flex: 1 },
  boxAcceptedVariants: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chipVariant: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  textChipVariant: { fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { width: "100%", borderRadius: 24, padding: 24, alignItems: "center", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  modalIconWrapper: { marginBottom: 16, marginTop: 8 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
  modalButtonUtama: { backgroundColor: "#16A34A", width: "100%", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  modalButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  modalButtonKeluarYa: { backgroundColor: "#EF4444", width: "100%", paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#DC2626" },
  modalButtonTextKeluarYa: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});