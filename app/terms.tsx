import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL, { apiFetch } from "../config";

import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";

import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const APP_NAME = "Ambativasi";
const APP_EMAIL = "ambativasi2829@gmail.com";

export default function TermsScreen() {
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

  const isId = language === "id";

  const sections: { title: string; body: string }[] = isId
    ? [
        {
          title: "1. Penerimaan Ketentuan",
          body: `Dengan mengunduh, menginstal, atau menggunakan aplikasi ${APP_NAME}, kamu dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan ini. Jika kamu tidak setuju dengan sebagian atau seluruh ketentuan ini, mohon jangan menggunakan aplikasi ini.`,
        },
        {
          title: "2. Deskripsi Layanan",
          body: `${APP_NAME} adalah aplikasi pembelajaran yang menyediakan materi belajar, latihan soal, ujian, fitur tilawah, dan asisten belajar. Layanan tersedia untuk perangkat seluler dan dapat diperbarui dari waktu ke waktu tanpa pemberitahuan terlebih dahulu.`,
        },
        {
          title: "3. Akun Pengguna",
          body: `Kamu bertanggung jawab untuk menjaga kerahasiaan kata sandi dan keamanan akunmu. Kamu setuju untuk memberikan informasi yang benar dan akurat saat mendaftar. Kami berhak menonaktifkan akun yang terbukti menggunakan data palsu atau melakukan pelanggaran.`,
        },
        {
          title: "4. Penggunaan yang Diizinkan",
          body: `Aplikasi ini hanya boleh digunakan untuk tujuan pembelajaran pribadi dan non-komersial. Kamu dilarang untuk: (a) memodifikasi, menyalin, atau mendistribusikan konten aplikasi tanpa izin; (b) menggunakan aplikasi untuk aktivitas ilegal; (c) mencoba merusak, meretas, atau mengganggu sistem dan layanan aplikasi.`,
        },
        {
          title: "5. Konten Materi dan Hak Kekayaan Intelektual",
          body: `Seluruh materi, teks, logo, dan konten dalam aplikasi dilindungi oleh hak kekayaan intelektual. Kamu tidak diperbolehkan menggunakan konten tersebut untuk kepentingan komersial tanpa izin tertulis dari pemilik aplikasi.`,
        },
        {
          title: "6. Layanan AI dan Kelengkapan Materi",
          body: `Sebagian soal latihan dihasilkan oleh kecerdasan buatan. Meskipun kami berupaya menyajikan materi yang akurat, kami tidak menjamin kebenaran, kelengkapan, atau kesesuaian materi secara mutlak. Penggunaan materi dan hasil latihan sepenuhnya menjadi tanggung jawab pengguna.`,
        },
        {
          title: "7. Pembatasan Tanggung Jawab",
          body: `Aplikasi disediakan "sebagaimana adanya" (as is). Dalam batas yang diizinkan hukum, kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan atau ketidakmampuan menggunakan aplikasi ini, termasuk kehilangan data belajar.`,
        },
        {
          title: "8. Keamanan Akun dan Kode Verifikasi",
          body: `Kamu setuju untuk tidak membagikan kode verifikasi, kata sandi, atau informasi keamanan akun lainnya kepada pihak lain. Kami tidak bertanggung jawab atas kerugian yang timbul akibat kelalaianmu dalam menjaga kerahasiaan informasi akun.`,
        },
        {
          title: "9. Pembaruan dan Penghentian Layanan",
          body: `Kami dapat menghentikan, membatasi, atau mengubah sebagian atau seluruh layanan kapan saja. Kami juga dapat menonaktifkan akun yang melanggar ketentuan. Pengguna berhak berhenti menggunakan aplikasi dan menghapus akun kapan saja.`,
        },
        {
          title: "10. Perubahan Syarat & Ketentuan",
          body: `Syarat & Ketentuan ini dapat diperbarui sewaktu-waktu. Perubahan akan berlaku setelah ditampilkan pada halaman ini. Dengan tetap menggunakan aplikasi setelah perubahan, kamu dianggap menyetujui ketentuan yang telah diperbarui.`,
        },
        {
          title: "11. Hukum yang Berlaku dan Kontak",
          body: `Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. Jika kamu memiliki pertanyaan terkait Syarat & Ketentuan ini, hubungi kami melalui email: ${APP_EMAIL}.`,
        },
      ]
    : [
        {
          title: "1. Acceptance of Terms",
          body: `By downloading, installing, or using the ${APP_NAME} application, you are deemed to have read, understood, and agreed to all of these Terms & Conditions. If you do not agree with any part of these terms, please do not use this application.`,
        },
        {
          title: "2. Service Description",
          body: `${APP_NAME} is a learning application that provides study materials, practice questions, exams, recitation features, and a study assistant. Services are available on mobile devices and may be updated from time to time without prior notice.`,
        },
        {
          title: "3. User Accounts",
          body: `You are responsible for keeping your password confidential and your account secure. You agree to provide true and accurate information when registering. We reserve the right to disable accounts proven to use false data or commit violations.`,
        },
        {
          title: "4. Permitted Use",
          body: `This application may only be used for personal, non-commercial learning purposes. You are prohibited from: (a) modifying, copying, or distributing app content without permission; (b) using the app for illegal activities; (c) attempting to damage, hack, or disrupt the app's systems and services.`,
        },
        {
          title: "5. Content and Intellectual Property",
          body: `All materials, text, logos, and content within the application are protected by intellectual property rights. You may not use such content for commercial purposes without written permission from the app owner.`,
        },
        {
          title: "6. AI Services and Content Accuracy",
          body: `Some practice questions are generated by artificial intelligence. Although we strive to present accurate material, we do not guarantee the accuracy, completeness, or suitability of the material in any way. Use of the material and practice results is entirely the user's responsibility.`,
        },
        {
          title: "7. Limitation of Liability",
          body: `The application is provided "as is". To the extent permitted by law, we are not liable for any direct or indirect damages arising from the use of, or inability to use, this application, including loss of learning data.`,
        },
        {
          title: "8. Account Security and Verification Codes",
          body: `You agree not to share verification codes, passwords, or other account security information with anyone. We are not responsible for losses arising from your failure to keep account information confidential.`,
        },
        {
          title: "9. Service Updates and Termination",
          body: `We may stop, limit, or change some or all of the services at any time. We may also disable accounts that violate the terms. Users have the right to stop using the application and delete their account at any time.`,
        },
        {
          title: "10. Changes to These Terms",
          body: `These Terms & Conditions may be updated from time to time. Changes will take effect after being displayed on this page. By continuing to use the application after changes, you are considered to accept the updated terms.`,
        },
        {
          title: "11. Governing Law and Contact",
          body: `These terms are governed and interpreted in accordance with the laws of the Republic of Indonesia. If you have questions about these Terms & Conditions, contact us via email: ${APP_EMAIL}.`,
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
            <Ionicons name="document-text" size={34} color="#2563EB" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isId ? "Syarat & Ketentuan" : "Terms & Conditions"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.subtext }]}>
            {APP_NAME} — {isId ? "Terakhir diperbarui: 2026" : "Last updated: 2026"}
          </Text>
        </View>

        <View style={styles.body}>
          {sections.map((sec, index) => (
            <View
              key={index}
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {sec.title}
              </Text>
              <Text style={[styles.sectionBody, { color: colors.subtext }]}>
                {sec.body}
              </Text>
            </View>
          ))}

          <Text style={[styles.footerNote, { color: colors.subtext }]}>
            © 2026 {APP_NAME}. {isId ? "Hak cipta dilindungi." : "All rights reserved."}
          </Text>
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
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 21,
  },
  footerNote: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
});