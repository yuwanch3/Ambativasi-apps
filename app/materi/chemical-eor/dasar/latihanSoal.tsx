import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../../../../components/navbar";
import { Sidebar } from "../../../../components/sidebar";

// 💡 IMPORT DIRECT GEMINI SERVICE
import { generateSoalDirectGemini } from "../../../../src/service/geminiService";

// 💡 IMPORT RINGKASAN MATERI UNTUK SOAL LEBIH SESUAI ISI BUKU
import { getRingkasanMateri } from "../../../../src/data/ringkasanMateri";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useTheme } from "../../../../context/ThemeContext";
import { useLanguage } from "../../../../context/LanguageContext";

const { width } = Dimensions.get("window");

interface SoalAI {
  no: number;
  tipe_soal: "standar" | "full" | "drag_drop" | "fill_blank";
  pertanyaan: string;
  pilihan?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  jawaban_benar: string | string[];
}

import API_URL, { apiFetch } from "../../../../config";

// ==========================================
// KOMPONEN DRAGGABLE KATA INTERAKTIF
// ==========================================
interface DraggableChipProps {
  abjad: string;
  teks: string;
  onDropSuccess: (abjad: string) => void;
  dropZoneLayout: any;
  isUsed: boolean;
  isReadOnly?: boolean;
}

function DraggableChip({
  abjad,
  teks,
  onDropSuccess,
  dropZoneLayout,
  isUsed,
  isReadOnly,
}: DraggableChipProps) {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isUsed) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [isUsed]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isUsed && !isReadOnly,
      onMoveShouldSetPanResponder: () => !isUsed && !isReadOnly,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gestureState) => {
        setIsDragging(false);

        if (dropZoneLayout.current) {
          const {
            absoluteX,
            absoluteY,
            width: dzW,
            height: dzH,
          } = dropZoneLayout.current;
          const touchX = gestureState.moveX;
          const touchY = gestureState.moveY;

          if (
            touchX >= absoluteX &&
            touchX <= absoluteX + dzW &&
            touchY >= absoluteY &&
            touchY <= absoluteY + dzH
          ) {
            onDropSuccess(abjad);
          }
        }

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  if (isUsed) {
    return (
      <View
        style={[
          styles.chipKataDrag,
          styles.chipKataPlaceholder,
          {
            backgroundColor: colors.isDark ? "#1E293B" : "#E2E8F0",
            borderColor: colors.border,
          },
        ]}
      />
    );
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        { transform: pan.getTranslateTransform() },
        styles.chipKataDrag,
        { backgroundColor: colors.card, borderColor: colors.border },
        isDragging && [
          styles.chipKataActiveDrag,
          { backgroundColor: colors.isDark ? "#064E3B" : "#DCFCE7" },
        ],
        isReadOnly && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.txtChipKata, { color: colors.text }]}>{teks}</Text>
    </Animated.View>
  );
}

// ==========================================
// HALAMAN UTAMA LATIHAN SOAL KUIS (10 SOAL)
// ==========================================
export default function SubUjianChemicalEOR() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const router = useRouter();
  const params = useLocalSearchParams();
  const { tipe_sumber, sumber_data, judul_bab } = params;

  // 🔒 STATE PENANDA KUNCI JAWABAN READ-ONLY VIA ASYNCSTORAGE
  const [isReadOnlyState, setIsReadOnlyState] = useState(false);

  // --- STATE LAYOUT ---
  const [loadingSession, setLoadingSession] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // --- STATE KUIS AI ---
  const [listSoal, setListSoal] = useState<SoalAI[]>([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [indeksAktif, setIndeksAktif] = useState(0);
  const [jawabanUser, setJawabanUser] = useState<Record<number, string>>({});
  const [shuffledOptions, setShuffledOptions] = useState<[string, string][]>(
    [],
  );

  // --- REF PENAHAN LAYOUT DROP ZONE ---
  const dropZoneRef = useRef<View>(null);
  const dropZoneLayoutData = useRef<any>(null);

  // --- STATE CUSTOM MODAL & ANIMASI ---
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [showExitModal, setShowExitModal] = useState(false);
  const [exitTarget, setExitTarget] = useState<
    "back" | "dashboard" | "profile" | "pengaturan" | "chat" | "shareProgress"
  >("back");

  const fadeExitAnim = useRef(new Animated.Value(0)).current;
  const scaleExitAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (listSoal.length > 0 && listSoal[indeksAktif]) {
      const targetSoal = listSoal[indeksAktif];
      if (targetSoal.pilihan) {
        const opsiAsli = Object.entries(targetSoal.pilihan);
        const opsiAcak = [...opsiAsli].sort(() => Math.random() - 0.5);
        setShuffledOptions(opsiAcak);
      } else {
        setShuffledOptions([]);
      }
    }
  }, [indeksAktif, listSoal]);

  // 🔒 CEK ASYNCSTORAGE SETIAP KALI HALAMAN DIFOKUSKAN & HANDLE BACK PRESS
  useFocusEffect(
    useCallback(() => {
      const checkReadOnlyMode = async () => {
        const flag = await AsyncStorage.getItem("isKuisReadOnly");
        if (flag === "true") {
          setIsReadOnlyState(true);
        }
      };
      checkReadOnlyMode();

      const backAction = () => {
        if (!loadingAI && !loadingSession && !showFinishedModal) {
          handleBukaModalKeluar("back");
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      // Otomatis dilepas saat berpindah layar (misal ke /chat)
      return () => backHandler.remove();
    }, [loadingAI, loadingSession, showFinishedModal]),
  );

  const checkSession = async () => {
    try {
      // Clear flag read-only saat kuis dimuat pertama kali
      await AsyncStorage.removeItem("isKuisReadOnly");
      setIsReadOnlyState(false);

      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../../../../auth/login");
      } else {
        const parsedSession = JSON.parse(session);
        setUserData({
          username: parsedSession.username || "User",
          email: parsedSession.email || "",
        });

        try {
          const responseProfile = await apiFetch(
            `${API_URL}/get-profile.php?email=${parsedSession.email}`,
          );
          const dataProfile = await responseProfile.json();
          if (dataProfile.status === "success" && dataProfile.profile_image) {
            setProfileImage(`${API_URL}/${dataProfile.profile_image}`);
          }
        } catch (e) {
          console.log("Avatar gagal dimuat kawan", e);
        }

        setLoadingSession(false);
        ambilSoalLangsungDariAI();
      }
    } catch (error) {
      router.replace("../../../../auth/login");
    }
  };

  const ambilSoalLangsungDariAI = async () => {
    try {
      setLoadingAI(true);
      const dataSoal = await generateSoalDirectGemini(
        sumber_data ? String(sumber_data) : "CHEMICAL_EOR_DASAR",
        10,
        "Indonesia",
        getRingkasanMateri(String(sumber_data || "CHEMICAL_EOR_DASAR")),
      );
      setListSoal(dataSoal);
    } catch (error: any) {
      Alert.alert("Error Gemini", error.message);
    } finally {
      setLoadingAI(false);
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
    await AsyncStorage.removeItem("userSession");
    router.replace("../../../../auth/login");
  };

  // 🔒 CEK READ-ONLY SEBELUM UBAH JAWABAN
  const pilihJawaban = (nilai: string) => {
    if (isReadOnlyState) return;
    setJawabanUser({ ...jawabanUser, [indeksAktif]: nilai });
  };

  // 🔒 CEK READ-ONLY SEBELUM HAPUS JAWABAN DRAG
  const bersihkanJawabanDrag = () => {
    if (isReadOnlyState) return;
    const dataBaru = { ...jawabanUser };
    delete dataBaru[indeksAktif];
    setJawabanUser(dataBaru);
  };

  const handleSelesaiKuis = () => {
    setShowFinishedModal(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const navigasiKeReview = async () => {
    try {
      await AsyncStorage.setItem("dataSoalKuis", JSON.stringify(listSoal));
      await AsyncStorage.setItem(
        "jawabanUserKuis",
        JSON.stringify(jawabanUser),
      );
      setShowFinishedModal(false);
      router.push({
        pathname: "./reviewJawaban",
        params: {
          judul_bab: String(
            judul_bab ||
              (language === "id"
                ? "Chemical EOR Dasar"
                : "Basic Chemical EOR"),
          ),
          tipe_sumber: String(tipe_sumber || "text"),
          sumber_data: String(sumber_data || "CHEMICAL_EOR_DASAR"),
        },
      });
    } catch (e) {
      Alert.alert(
        "Error",
        language === "id"
          ? "Gagal memuat review kuis."
          : "Failed to load quiz review.",
      );
    }
  };

  const handleBukaModalKeluar = (
    target: "back" | "dashboard" | "profile" | "pengaturan" | "chat" | "shareProgress" = "back",
  ) => {
    setExitTarget(target);
    setShowExitModal(true);
    Animated.parallel([
      Animated.timing(fadeExitAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleExitAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTutupModalKeluar = () => {
    Animated.parallel([
      Animated.timing(fadeExitAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleExitAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowExitModal(false));
  };

  const ukurDropZone = () => {
    if (dropZoneRef.current) {
      setTimeout(() => {
        dropZoneRef.current?.measure((x, y, w, h, px, py) => {
          if (w > 0 && h > 0) {
            dropZoneLayoutData.current = {
              absoluteX: px,
              absoluteY: py,
              width: w,
              height: h,
            };
          }
        });
      }, 100);
    }
  };

  if (loadingSession || loadingAI) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={[styles.teksLoading, { color: colors.subtext }]}>
          {language === "id"
            ? "Sedang meracik 10 butir soal via AI..."
            : "Generating 10 practice questions via AI..."}
        </Text>
      </View>
    );
  }

  const soalSaatIni = listSoal[indeksAktif];
  const jenisTipe = soalSaatIni?.tipe_soal || "standar";
  const userHasPicked = jawabanUser[indeksAktif];

  const isMateriChemicalEOR =
    sumber_data?.toString().toLowerCase().includes("chemical") ||
    sumber_data?.toString().toLowerCase().includes("eor") ||
    sumber_data?.toString().toLowerCase().includes("polymer") ||
    sumber_data?.toString().toLowerCase().includes("surfactant") ||
    sumber_data?.toString().toLowerCase().includes("alkaline") ||
    judul_bab?.toString().toLowerCase().includes("chemical");

  // Pastikan RTL HANYA aktif jika materi tersebut benar-benar Tajwid/Arab
  const wajibRTL = jenisTipe === "full" && !isMateriChemicalEOR;

  const renderTeksDragDrop = (fullText: string) => {
    if (!fullText.includes("___"))
      return (
        <Text style={[styles.teksPertanyaan, { color: colors.text }]}>
          {fullText}
        </Text>
      );
    const bagian = fullText.split("___");
    return (
      <View
        style={[
          styles.dragTextRow,
          wajibRTL && { flexDirection: "row-reverse" },
        ]}
      >
        <Text style={[styles.teksPertanyaan, { color: colors.text }]}>
          {bagian[0]}
        </Text>
        <TouchableOpacity
          ref={dropZoneRef}
          onLayout={ukurDropZone}
          activeOpacity={0.8}
          disabled={isReadOnlyState}
          onPress={bersihkanJawabanDrag}
          style={[
            styles.dropZoneBox,
            { backgroundColor: colors.isDark ? "#064E3B" : "#F0FDF4" },
            userHasPicked && styles.dropZoneBoxIsi,
          ]}
        >
          <Text
            style={[styles.dropZoneText, userHasPicked && { color: "#FFF" }]}
          >
            {userHasPicked && soalSaatIni?.pilihan
              ? soalSaatIni.pilihan[
                  userHasPicked as keyof typeof soalSaatIni.pilihan
                ]
              : language === "id"
                ? " Tarik Ke Sini "
                : " Drag Here "}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.teksPertanyaan, { color: colors.text }]}>
          {bagian[1]}
        </Text>
      </View>
    );
  };

  const renderTeksFillBlank = (fullText: string) => {
    if (!fullText.includes("___"))
      return (
        <Text style={[styles.teksPertanyaan, { color: colors.text }]}>
          {fullText}
        </Text>
      );
    const bagian = fullText.split("___");
    return (
      <View
        style={[
          styles.dragTextRow,
          wajibRTL && { flexDirection: "row-reverse" },
        ]}
      >
        <Text style={[styles.teksPertanyaan, { color: colors.text }]}>
          {bagian[0]}
        </Text>
        <TextInput
          style={[
            styles.inputTeksBlank,
            {
              backgroundColor: colors.isDark ? "#1E293B" : "#EFF6FF",
              color: colors.text,
            },
          ]}
          placeholder={language === "id" ? "Ketik..." : "Type..."}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isReadOnlyState}
          value={userHasPicked || ""}
          onChangeText={(teks) => pilihJawaban(teks)}
        />
        <Text style={[styles.teksPertanyaan, { color: colors.text }]}>
          {bagian[1]}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => handleBukaModalKeluar("back")}
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
            {language === "id" ? "Kembali ke BAB" : "Back to CHAPTER"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {judul_bab ||
            (language === "id"
              ? "Chemical EOR Dasar"
              : "Basic Chemical EOR")}
        </Text>

        {/* --- NAVIGASI NOMOR SOAL --- */}
        <View style={{ marginBottom: 15 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wrapperAngka}
          >
            {listSoal.map((_, indeks) => (
              <TouchableOpacity
                key={indeks}
                style={[
                  styles.tombolAngka,
                  {
                    backgroundColor: colors.isDark ? "#334155" : "#E2E8F0",
                    borderColor: colors.border,
                  },
                  indeksAktif === indeks && styles.angkaAktif,
                  jawabanUser[indeks] !== undefined &&
                    indeksAktif !== indeks &&
                    styles.angkaSudahDijawab,
                ]}
                onPress={() => setIndeksAktif(indeks)}
              >
                <Text
                  style={[
                    styles.teksAngka,
                    { color: colors.isDark ? "#94A3B8" : "#475569" },
                    (indeksAktif === indeks ||
                      jawabanUser[indeks] !== undefined) && { color: "#fff" },
                  ]}
                >
                  {indeks + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- KARTU PERTANYAAN DINAMIS --- */}
        <View
          style={[
            styles.kartuSoal,
            { backgroundColor: colors.card, borderColor: colors.border },
            wajibRTL && [
              styles.kartuSoalArab,
              { backgroundColor: colors.isDark ? "#1E293B" : "#F8FAFF" },
            ],
          ]}
        >
          <View style={styles.rowTipeBadge}>
            <Text style={[styles.nomorSoalTitle, { color: colors.subtext }]}>
              {language === "id"
                ? `Pertanyaan ${indeksAktif + 1} dari ${listSoal.length}`
                : `Question ${indeksAktif + 1} of ${listSoal.length}`}
            </Text>

            {/* BADGE TIPE SOAL */}
            <View
              style={[
                styles.badgeTipeSoal,
                jenisTipe === "drag_drop"
                  ? { backgroundColor: colors.isDark ? "#064E3B" : "#DCFCE7" }
                  : jenisTipe === "full"
                    ? { backgroundColor: colors.isDark ? "#1E3A8A" : "#DBEAFE" }
                    : jenisTipe === "fill_blank"
                      ? {
                          backgroundColor: colors.isDark
                            ? "#451A1A"
                            : "#FEE2E2",
                        }
                      : {
                          backgroundColor: colors.isDark
                            ? "#334155"
                            : "#E2E8F0",
                        },
              ]}
            >
              <Text
                style={[
                  styles.txtTipeBadge,
                  jenisTipe === "drag_drop"
                    ? { color: colors.isDark ? "#4ADE80" : "#166534" }
                    : jenisTipe === "full"
                      ? { color: colors.isDark ? "#93C5FD" : "#1E40AF" }
                      : jenisTipe === "fill_blank"
                        ? { color: colors.isDark ? "#F87171" : "#991B1B" }
                        : { color: colors.isDark ? "#F8FAFC" : "#334155" },
                ]}
              >
                {jenisTipe.toUpperCase()}
              </Text>
            </View>
          </View>

          {jenisTipe === "drag_drop" ? (
            renderTeksDragDrop(soalSaatIni?.pertanyaan)
          ) : jenisTipe === "fill_blank" ? (
            renderTeksFillBlank(soalSaatIni?.pertanyaan)
          ) : (
            <Text
              style={[
                styles.teksPertanyaan,
                { color: colors.text },
                wajibRTL && styles.teksPertanyaanArab,
              ]}
            >
              {soalSaatIni?.pertanyaan}
            </Text>
          )}
        </View>

        {/* --- AREA PILIHAN JAWABAN --- */}
        {jenisTipe === "drag_drop" ? (
          <View style={styles.dragDropWrapper}>
            <Text style={[styles.pilihKataLabel, { color: colors.subtext }]}>
              {language === "id"
                ? "Seret kata melayang di bawah ke kotak putus-putus. Tap kotak jawaban untuk membatalkan:"
                : "Drag floating words below into the dashed box. Tap answer box to clear:"}
            </Text>
            <View style={styles.wordBankGrid}>
              {shuffledOptions.map(([abjad, teksOpsi]) => (
                <DraggableChip
                  key={abjad}
                  abjad={abjad}
                  teks={teksOpsi}
                  onDropSuccess={pilihJawaban}
                  dropZoneLayout={dropZoneLayoutData}
                  isUsed={userHasPicked === abjad}
                  isReadOnly={isReadOnlyState}
                />
              ))}
            </View>
          </View>
        ) : jenisTipe === "fill_blank" ? (
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.fillBlankHintBox,
                {
                  backgroundColor: colors.isDark ? "#1E3A8A" : "#EFF6FF",
                  borderColor: colors.isDark ? "#2563EB" : "#BFDBFE",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#2563EB"
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.fillBlankHintText,
                  { color: colors.isDark ? "#93C5FD" : "#1E40AF" },
                ]}
              >
                {language === "id"
                  ? "Gunakan keyboard smartphone kamu untuk mengetik isi kata yang dirasa paling tepat pada ruang input kosong di atas."
                  : "Use your device keyboard to type the most appropriate word into the blank space above."}
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {soalSaatIni &&
              soalSaatIni.pilihan &&
              Object.entries(soalSaatIni.pilihan).map(([abjad, teksOpsi]) => {
                const isSelected = userHasPicked === abjad;
                return (
                  <TouchableOpacity
                    key={abjad}
                    disabled={isReadOnlyState}
                    style={[
                      styles.tombolOpsi,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      isSelected && [
                        styles.opsiTerpilih,
                        {
                          backgroundColor: colors.isDark
                            ? "#064E3B"
                            : "#F0FDF4",
                        },
                      ],
                      wajibRTL && { flexDirection: "row-reverse" },
                      isReadOnlyState && { opacity: 0.8 },
                    ]}
                    onPress={() => pilihJawaban(abjad)}
                  >
                    <View
                      style={[
                        styles.badgeAbjad,
                        {
                          backgroundColor: colors.isDark
                            ? "#334155"
                            : "#F1F5F9",
                        },
                        isSelected && styles.badgeAbjadTerpilih,
                      ]}
                    >
                      <Text
                        style={[
                          styles.teksAbjad,
                          { color: colors.subtext },
                          isSelected && { color: "#fff" },
                        ]}
                      >
                        {abjad}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.teksOpsiText,
                        { color: colors.text },
                        wajibRTL && styles.teksOpsiArab,
                        isSelected && {
                          fontWeight: "600",
                          color: colors.isDark ? "#4ADE80" : "#16A34A",
                        },
                      ]}
                    >
                      {teksOpsi}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        )}

        {/* --- TOMBOL NAVIGASI BAWAH --- */}
        <View style={styles.navigasiBawah}>
          <TouchableOpacity
            disabled={indeksAktif === 0}
            style={[styles.tombolNav, indeksAktif === 0 && { opacity: 0.4 }]}
            onPress={() => setIndeksAktif(indeksAktif - 1)}
          >
            <Text style={styles.teksNav}>
              {language === "id" ? "◄ Sebelumnya" : "◄ Previous"}
            </Text>
          </TouchableOpacity>

          {indeksAktif === listSoal.length - 1 ? (
            <TouchableOpacity
              style={[styles.tombolNav, { backgroundColor: "#16A34A" }]}
              onPress={handleSelesaiKuis}
            >
              <Text style={styles.teksNav}>
                {language === "id" ? "Selesai ✔" : "Finish ✔"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.tombolNav}
              onPress={() => setIndeksAktif(indeksAktif + 1)}
            >
              <Text style={styles.teksNav}>
                {language === "id" ? "Selanjutnya ►" : "Next ►"}
              </Text>
            </TouchableOpacity>
          )}
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
        onNavigateDashboard={() => {
          toggleSidebar(false);
          handleBukaModalKeluar("dashboard");
        }}
        onNavigateProfile={() => {
          toggleSidebar(false);
          handleBukaModalKeluar("profile");
        }}
        onNavigateSettings={() => {
          toggleSidebar(false);
          handleBukaModalKeluar("pengaturan");
        }}
        onNavigateChat={() => {
          toggleSidebar(false);
          handleBukaModalKeluar("chat");
        }}
        onNavigateShareProgress={() => {
          toggleSidebar(false);
          handleBukaModalKeluar("shareProgress");
        }}
      />

      {/* ==================== MODAL SELESAI ==================== */}
      <Modal
        visible={showFinishedModal}
        transparent={true}
        statusBarTranslucent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card },
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.modalIconWrapper}>
              <Ionicons name="checkmark-circle" size={80} color="#16A34A" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === "id" ? "Kuis Selesai!" : "Quiz Completed!"}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>
              {language === "id"
                ? "Selamat, kamu telah menyelesaikan kuis latihan Chemical EOR Dasar ini."
                : "Congratulations, you have completed this Basic Chemical EOR practice quiz."}
            </Text>
            <TouchableOpacity
              style={styles.modalButtonUtama}
              onPress={navigasiKeReview}
            >
              <Text style={styles.modalButtonText}>
                {language === "id"
                  ? "Lihat Review Jawaban ►"
                  : "View Answer Review ►"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButtonSekunder,
                {
                  backgroundColor: colors.isDark ? "#334155" : "#F1F5F9",
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                setShowFinishedModal(false);
                fadeAnim.setValue(0);
                scaleAnim.setValue(0.8);
                router.back();
              }}
            >
              <Text
                style={[styles.modalButtonTextSekunder, { color: colors.text }]}
              >
                {language === "id" ? "Kembali ke Bab" : "Back to Chapter"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* ==================== MODAL PERINGATAN KELUAR ==================== */}
      <Modal
        visible={showExitModal}
        transparent={true}
        statusBarTranslucent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card },
              { opacity: fadeExitAnim, transform: [{ scale: scaleExitAnim }] },
            ]}
          >
            <View style={styles.modalIconWrapper}>
              <Ionicons name="warning" size={76} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {language === "id" ? "Meninggalkan Kuis?" : "Exit Quiz?"}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>
              {language === "id"
                ? "Apakah kamu yakin ingin keluar? Seluruh progres saat ini akan hilang."
                : "Are you sure you want to exit? All current progress will be lost."}
            </Text>
            <TouchableOpacity
              style={styles.modalButtonUtama}
              onPress={handleTutupModalKeluar}
            >
              <Text style={styles.modalButtonText}>
                {language === "id"
                  ? "Tidak, Lanjutkan Latihan"
                  : "No, Continue Practice"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
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
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.modalButtonTextKeluarYa}>
                {language === "id" ? "Ya, Saya Yakin Keluar" : "Yes, Exit"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  teksLoading: { marginTop: 12, fontSize: 14, textAlign: "center" },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 16,
  },
  backButtonText: { fontSize: 15, fontWeight: "600", marginLeft: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  wrapperAngka: { paddingVertical: 4 },
  tombolAngka: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
  },
  angkaAktif: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  angkaSudahDijawab: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  teksAngka: { fontSize: 14, fontWeight: "bold" },
  kartuSoal: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
  },
  kartuSoalArab: { borderColor: "#2563EB" },
  nomorSoalTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6 },
  teksPertanyaan: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
  teksPertanyaanArab: {
    fontSize: 22,
    textAlign: "right",
    lineHeight: 38,
    fontWeight: "600",
  },
  tombolOpsi: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  opsiTerpilih: { borderColor: "#16A34A", borderWidth: 2 },
  badgeAbjad: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeAbjadTerpilih: { backgroundColor: "#16A34A" },
  teksAbjad: { fontWeight: "bold", fontSize: 14 },
  teksOpsiText: { flex: 1, fontSize: 15 },
  teksOpsiArab: { fontSize: 19, textAlign: "right", paddingHorizontal: 10 },
  navigasiBawah: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  tombolNav: {
    backgroundColor: "#1E293B",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  teksNav: { color: "#FFF", fontWeight: "bold", fontSize: 14 },

  rowTipeBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeTipeSoal: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  txtTipeBadge: { fontSize: 10, fontWeight: "bold" },
  dragTextRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    lineHeight: 40,
  },
  dropZoneBox: {
    minWidth: 120,
    height: 38,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#16A34A",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    paddingHorizontal: 10,
  },
  dropZoneBoxIsi: { borderStyle: "solid", backgroundColor: "#16A34A" },
  dropZoneText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16A34A",
    textAlign: "center",
  },
  inputTeksBlank: {
    minWidth: 120,
    height: 38,
    borderWidth: 2,
    borderColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 6,
  },
  dragDropWrapper: { flex: 1, paddingTop: 5, overflow: "visible" },
  pilihKataLabel: {
    fontSize: 13,
    marginBottom: 10,
    fontStyle: "italic",
    lineHeight: 18,
  },
  wordBankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingTop: 10,
    overflow: "visible",
  },
  chipKataDrag: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
  },
  chipKataPlaceholder: { borderStyle: "dashed", opacity: 0.4, elevation: 0 },
  chipKataActiveDrag: {
    borderColor: "#16A34A",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 99999,
  },
  txtChipKata: { fontSize: 15, fontWeight: "bold" },
  fillBlankHintBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  fillBlankHintText: { flex: 1, fontSize: 13, lineHeight: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalIconWrapper: { marginBottom: 16, marginTop: 8 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  modalSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  modalButtonUtama: {
    backgroundColor: "#16A34A",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  modalButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  modalButtonSekunder: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  modalButtonTextSekunder: { fontSize: 15, fontWeight: "600" },
  modalButtonKeluarYa: {
    backgroundColor: "#EF4444",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  modalButtonTextKeluarYa: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});