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

export default function PrivacyPolicyScreen() {
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
          title: "1. Pendahuluan",
          body: `Kebijakan Privasi ini menjelaskan bagaimana ${APP_NAME} ("kami", "aplikasi") mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi yang kamu berikan saat menggunakan aplikasi. Dengan mengunduh, menginstal, dan menggunakan aplikasi ini, kamu menyetujui praktik yang dijelaskan dalam kebijakan ini.`,
        },
        {
          title: "2. Informasi yang Kami Kumpulkan",
          body: `Kami mengumpulkan informasi berikut: (a) Informasi akun: nama pengguna (username) dan alamat email yang kamu daftarkan; (b) Data penggunaan: skor latihan, riwayat jawaban, dan progres belajar; (c) Data perangkat: informasi dasar perangkat seperti sistem operasi dan versi aplikasi untuk keperluan teknis. Kami tidak mengumpulkan data biometrik, lokasi, atau kontak secara otomatis.`,
        },
        {
          title: "3. Cara Kami Menggunakan Informasi",
          body: `Informasi yang kami kumpulkan digunakan untuk: (a) membuat dan mengelola akunmu; (b) menyinkronkan progres belajar dan skor antar perangkat; (c) menghasilkan soal latihan yang relevan; (d) memberikan dukungan pelanggan; dan (e) memperbaiki serta mengembangkan fitur aplikasi. Kami tidak menjual atau menyewakan informasi pribadimu kepada pihak mana pun.`,
        },
        {
          title: "4. Penyimpanan dan Keamanan Data",
          body: `Data pribadimu disimpan di server yang dilindungi dengan langkah-langkah keamanan teknis yang wajar, termasuk enkripsi pada proses pengiriman data. Akses ke data dibatasi hanya untuk keperluan operasional dan teknis. Meskipun kami berupaya melindungi data dengan baik, tidak ada metode transmisi atau penyimpanan data yang sepenuhnya aman, sehingga kami tidak dapat menjamin keamanan mutlak.`,
        },
        {
          title: "5. Kode Verifikasi dan Keamanan Akun",
          body: `Untuk menjaga keamanan akun, saat kamu mengubah alamat email, aplikasi mengirimkan kode verifikasi satu kali (one-time code) ke email terdaftar. Kode ini berlaku sementara dan otomatis kedaluwarsa setelah waktu tertentu. Kami menghimbau kamu untuk tidak membagikan kode verifikasi atau kata sandi kepada siapa pun.`,
        },
        {
          title: "6. Berbagi Data dengan Pihak Ketiga",
          body: `Kami hanya membagikan data kepada pihak ketiga apabila diperlukan untuk menjalankan layanan inti aplikasi, misalnya layanan server dan penyedia email untuk pengiriman kode verifikasi. Pihak ketiga tersebut hanya memproses data sesuai instruksi kami dan terikat kewajiban kerahasiaan. Kami tidak mengizinkan pihak ketiga menggunakan datamu untuk kepentingan lain.`,
        },
        {
          title: "7. Layanan AI dan Data Latihan",
          body: `Sebagian soal latihan dihasilkan secara otomatis menggunakan layanan kecerdasan buatan (AI). Input yang digunakan untuk menghasilkan soal adalah materi dari bab yang kamu pilih, bukan data pribadimu. Kami berupaya memastikan soal yang dihasilkan sesuai dan relevan, namun jawaban serta hasil AI tidak digunakan untuk mengidentifikasi pengguna.`,
        },
        {
          title: "8. Hak Pengguna",
          body: `Kamu berhak untuk: (a) mengakses informasi akun yang kami simpan; (b) memperbarui atau mengubah email dan kata sandi; (c) meminta penghapusan akun dan data terkait; (d) menolak pengumpulan data yang tidak diperlukan. Untuk menggunakan hak-hak tersebut, hubungi kami melalui email yang tercantum pada bagian akhir kebijakan ini.`,
        },
        {
          title: "9. Privasi Anak-anak",
          body: `Aplikasi ini ditujukan untuk pengguna umum. Kami tidak dengan sengaja mengumpulkan informasi pribadi dari anak-anak di bawah usia yang disyaratkan tanpa persetujuan orang tua atau wali. Jika kamu mengetahui bahwa seorang anak telah memberikan data pribadi kepada kami, silakan hubungi kami agar data tersebut dapat dihapus.`,
        },
        {
          title: "10. Perubahan Kebijakan Privasi",
          body: `Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan akan ditampilkan pada halaman ini dengan tanggal pembaruan terbaru. Penggunaan aplikasi setelah perubahan kebijakan dianggap sebagai persetujuan terhadap kebijakan yang telah diperbarui.`,
        },
        {
          title: "11. Kontak Kami",
          body: `Jika kamu memiliki pertanyaan, keluhan, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi kami melalui email: ${APP_EMAIL}. Kami akan meninjau dan merespons setiap permintaan secepat mungkin.`,
        },
      ]
    : [
        {
          title: "1. Introduction",
          body: `This Privacy Policy explains how ${APP_NAME} ("we", "the app") collects, uses, stores, and protects the personal information you provide when using the application. By downloading, installing, and using this app, you agree to the practices described in this policy.`,
        },
        {
          title: "2. Information We Collect",
          body: `We collect the following information: (a) Account information: the username and email address you register; (b) Usage data: practice scores, answer history, and learning progress; (c) Device data: basic device information such as operating system and app version for technical purposes. We do not automatically collect biometric, location, or contact data.`,
        },
        {
          title: "3. How We Use Your Information",
          body: `The information we collect is used to: (a) create and manage your account; (b) synchronize learning progress and scores across devices; (c) generate relevant practice questions; (d) provide customer support; and (e) improve and develop app features. We do not sell or rent your personal information to anyone.`,
        },
        {
          title: "4. Data Storage and Security",
          body: `Your personal data is stored on servers protected with reasonable technical security measures, including encryption during data transmission. Access to data is restricted to operational and technical purposes only. Although we strive to protect your data well, no method of data transmission or storage is completely secure, so we cannot guarantee absolute security.`,
        },
        {
          title: "5. Verification Codes and Account Security",
          body: `To keep your account secure, when you change your email address, the app sends a one-time verification code to your registered email. This code is temporary and automatically expires after a certain period. We strongly advise you not to share verification codes or passwords with anyone.`,
        },
        {
          title: "6. Sharing Data with Third Parties",
          body: `We only share data with third parties when necessary to operate core app services, such as hosting servers and email providers for sending verification codes. These third parties only process data according to our instructions and are bound by confidentiality obligations. We do not allow third parties to use your data for other purposes.`,
        },
        {
          title: "7. AI Services and Practice Data",
          body: `Some practice questions are generated automatically using artificial intelligence (AI) services. The input used to generate questions is the material from the chapter you select, not your personal data. We ensure generated questions are appropriate and relevant, but AI answers and results are not used to identify users.`,
        },
        {
          title: "8. User Rights",
          body: `You have the right to: (a) access the account information we store; (b) update or change your email and password; (c) request deletion of your account and related data; (d) refuse unnecessary data collection. To exercise these rights, contact us via the email listed at the end of this policy.`,
        },
        {
          title: "9. Children's Privacy",
          body: `This application is intended for general users. We do not knowingly collect personal information from children below the required age without parental or guardian consent. If you become aware that a child has provided personal data to us, please contact us so that the data can be deleted.`,
        },
        {
          title: "10. Changes to This Privacy Policy",
          body: `We may update this Privacy Policy from time to time. Any changes will be shown on this page with the latest update date. Continued use of the app after changes to the policy is considered acceptance of the updated policy.`,
        },
        {
          title: "11. Contact Us",
          body: `If you have questions, complaints, or requests regarding this Privacy Policy, please contact us via email: ${APP_EMAIL}. We will review and respond to every request as soon as possible.`,
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
            <Ionicons name="shield-checkmark" size={34} color="#16A34A" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isId ? "Kebijakan Privasi" : "Privacy Policy"}
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