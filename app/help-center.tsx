import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SoundTouchableOpacity from "../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL, { apiFetch } from "../config";

import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";

import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const SUPPORT_EMAIL = "ambativasi2829@gmail.com";

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const isId = language === "id";

  const faqs: { q: string; a: string }[] = isId
    ? [
        {
          q: "Bagaimana cara menggunakan Ambativasi untuk belajar?",
          a: "Pilih menu Materi di halaman utama, lalu pilih bab yang ingin dipelajari. Setiap bab berisi rangkuman materi, latihan soal, dan opsi PDF serta video untuk mendalami topik.",
        },
        {
          q: "Bagaimana cara mengerjakan latihan soal?",
          a: "Masuk ke menu Materi, pilih bab, lalu tekan tombol Latihan Soal. Soal akan muncul satu per satu. Jawab lalu lihat hasilnya di Review Jawaban. Skor otomatis tersimpan di akunmu.",
        },
        {
          q: "Apakah soal AI digenerate secara otomatis?",
          a: "Ya. Sebagian soal diracik secara otomatis berbasis kecerdasan buatan Gemini API sesuai dengan materi bab yang dipilih, sehingga soal yang muncul selalu relevan dan bervariasi.",
        },
        {
          q: "Apakah riwayat kuis dan skor tersimpan?",
          a: "Ya. Skor dan review jawaban tersimpan otomatis di sistem aplikasi, sehingga kamu bisa melihat progress belajar dan berbagi hasilnya ke teman-temanmu.",
        },
        {
          q: "Bagaimana cara mengubah email atau kata sandi?",
          a: "Buka menu Pengaturan, lalu pilih Ubah Email atau Ubah Kata Sandi. Untuk email, kamu perlu memverifikasi identitas dengan kode yang dikirim ke email lamamu.",
        },
        {
          q: "Bagaimana cara menggunakan fitur Tilawah / Juz Amma?",
          a: "Masuk ke menu Tilawah, pilih surat dan ayat yang ingin dibaca, lalu tekan tombol Rekam. Aplikasi akan mengenali bacaanmu dan memberi tahu ayat mana yang sudah benar.",
        },
        {
          q: "Bagaimana cara mengubah tema atau bahasa aplikasi?",
          a: "Buka menu Pengaturan, lalu pilih Mode Tampilan untuk mengubah tema terang/gelap, dan pilih Bahasa Aplikasi untuk mengganti antara Bahasa Indonesia dan English.",
        },
        {
          q: "Data apa saja yang disimpan aplikasi ini?",
          a: "Aplikasi menyimpan username, email, skor latihan, dan progress belajar. Data ini hanya digunakan untuk sinkronisasi akun dan tidak pernah dibagikan ke pihak ketiga. Lihat Kebijakan Privasi untuk detail.",
        },
        {
          q: "Bagaimana cara menghubungi tim dukungan?",
          a: "Kamu bisa mengirimkan pertanyaan atau laporan melalui email ke ambativasi2829@gmail.com. Tim kami akan merespons secepat mungkin.",
        },
      ]
    : [
        {
          q: "How do I use Ambativasi to study?",
          a: "Open the Subjects menu on the home page, then choose the chapter you want to learn. Each chapter contains material summaries, practice questions, and PDF/video options to go deeper.",
        },
        {
          q: "How do I do practice questions?",
          a: "Go to the Subjects menu, choose a chapter, then tap the Practice Questions button. Questions appear one by one. Answer them and check your results in Answer Review. Your score is saved automatically to your account.",
        },
        {
          q: "Are questions generated automatically by AI?",
          a: "Yes. Some questions are created automatically using Gemini API artificial intelligence based on the chapter material you selected, so the questions are always relevant and varied.",
        },
        {
          q: "Are my quiz history and scores saved?",
          a: "Yes. Scores and answer reviews are saved automatically in the app system, so you can track your learning progress and share your results with friends.",
        },
        {
          q: "How do I change my email or password?",
          a: "Open the Settings menu, then choose Change Email or Change Password. For email, you must verify your identity with a code sent to your old email.",
        },
        {
          q: "How do I use the Tilawah / Juz Amma feature?",
          a: "Open the Tilawah menu, choose the surah and ayah you want to read, then tap the Record button. The app recognizes your recitation and tells you which ayah is correct.",
        },
        {
          q: "How do I change the theme or app language?",
          a: "Open the Settings menu, then choose Display Mode to switch between light/dark theme, and App Language to switch between Indonesian and English.",
        },
        {
          q: "What data does this app store?",
          a: "The app stores your username, email, practice scores, and learning progress. This data is only used for account synchronization and is never shared with third parties. See the Privacy Policy for details.",
        },
        {
          q: "How can I contact the support team?",
          a: "You can send questions or reports via email to ambativasi2829@gmail.com. Our team will respond as soon as possible.",
        },
      ];

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../auth/login");
        return;
      }
      const parsedSession = JSON.parse(session);
      setUserData({
        username: parsedSession.username || "User",
        email: parsedSession.email || "",
      });

      try {
        const response = await apiFetch(
          `${API_URL}/get-profile.php?email=${encodeURIComponent(parsedSession.email)}`,
        );
        const data = await response.json();
        if (data.status === "success" && data.profile_image) {
          setProfileImage(`${API_URL}/${data.profile_image}`);
        }
      } catch (e) {
        console.log("Gagal memuat foto profil", e);
      }
      setLoading(false);
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

  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(isId ? "Pertanyaan Ambativasi" : "Ambativasi Question")}`);
  };

  useFocusEffect(
    React.useCallback(() => {
      checkSession();
    }, []),
  );

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={userData}
        profileImage={profileImage}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER JUDUL */}
        <View
          style={[
            styles.pageHeader,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.headerIconWrap}>
            <Ionicons name="help-circle" size={34} color="#2563EB" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isId ? "Pusat Bantuan" : "Help Center"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.subtext }]}>
            {isId
              ? "Temukan jawaban atas pertanyaan yang sering ditanyakan"
              : "Find answers to frequently asked questions"}
          </Text>
        </View>

        <View style={styles.body}>
          {/* KATEGORI: AKUN & BELAJAR */}
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
            {isId ? "FAQ UMUM" : "GENERAL FAQ"}
          </Text>

          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.faqCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isOpen ? "#2563EB" : colors.border,
                  },
                ]}
              >
                <SoundTouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => setOpenIndex(isOpen ? null : index)}
                >
                  <View style={styles.faqTitleWrap}>
                    <Ionicons
                      name={isOpen ? "remove-circle" : "add-circle-outline"}
                      size={20}
                      color="#2563EB"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={[styles.faqTitle, { color: colors.text }]}>
                      {item.q}
                    </Text>
                  </View>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.subtext}
                  />
                </SoundTouchableOpacity>

                {isOpen && (
                  <View
                    style={[
                      styles.faqAnswerWrap,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[styles.faqAnswer, { color: colors.subtext }]}
                    >
                      {item.a}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* AJUKAN PERTANYAAN */}
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
            {isId ? "MASIH ADA PERTANYAAN?" : "STILL HAVE A QUESTION?"}
          </Text>
          <View
            style={[
              styles.contactCard,
              {
                backgroundColor: colors.isDark ? "#0C1B3A" : "#EFF6FF",
                borderColor: "#2563EB",
              },
            ]}
          >
            <Ionicons name="mail-outline" size={28} color="#2563EB" />
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              {isId ? "Hubungi Tim Dukungan" : "Contact Support Team"}
            </Text>
            <Text style={[styles.contactDesc, { color: colors.subtext }]}>
              {isId
                ? "Tidak menemukan jawaban? Kirim pertanyaanmu melalui email dan kami akan merespons secepatnya."
                : "Can't find an answer? Send your question via email and we will respond as soon as possible."}
            </Text>
            <SoundTouchableOpacity
              style={[styles.contactBtn, { backgroundColor: "#2563EB" }]}
              onPress={openEmail}
            >
              <Ionicons name="mail" size={18} color="#FFF" />
              <Text style={styles.contactBtnText}>{SUPPORT_EMAIL}</Text>
            </SoundTouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  content: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  pageHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerIconWrap: { marginBottom: 6 },
  headerTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  headerSub: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  body: {
    padding: 16,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  faqCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  faqTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  faqAnswerWrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    alignItems: "center",
    marginTop: 4,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  contactDesc: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  contactBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});