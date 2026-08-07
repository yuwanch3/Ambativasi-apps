import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import SoundTouchableOpacity from "../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import API_URL, { apiFetch } from "../config";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { getSubjectSummary } from "../src/utils/progressTracker";
import ShareCard, { ShareCardData } from "../src/utils/shareProgress";
import { getCurrentStreak } from "../src/utils/streakTracker";

const XP_PER_LEVEL = 500;

const DEFAULT_PROMO_ID =
  "Yuk belajar bareng di Ambativasi! 📲 Materi, latihan, ujian & AI — makin pinter, gratis!";
const DEFAULT_PROMO_EN =
  "Let's learn together on Ambativasi! 📲 Lessons, quizzes, exams & AI — get smarter, free!";

export default function ShareProgressScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const id = language === "id";

  const cardRef = useRef<View>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [promo, setPromo] = useState(id ? DEFAULT_PROMO_ID : DEFAULT_PROMO_EN);
  const [data, setData] = useState<ShareCardData | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (!session) {
        router.replace("../auth/login");
        return;
      }
      const user = JSON.parse(session);
      const username = user.username || "User";
      const email = user.email || "";

      const summaries = await getSubjectSummary();
      const streak = await getCurrentStreak();

      let profileImage: string | null = null;
      try {
        const response = await apiFetch(
          `${API_URL}/get-profile.php?email=${encodeURIComponent(email)}`
        );
        const json = await response.json();
        if (json.status === "success" && json.profile_image) {
          profileImage = `${API_URL}/${json.profile_image}`;
        }
      } catch (e) {
        console.log("Gagal ambil foto profil", e);
      }

      const subjects = summaries
        .filter((s) => s.latihanAttempts > 0 || s.ujianAttempts > 0)
        .map((s) => ({
          name: s.subjectName || s.subjectId,
          bestScore: Math.max(s.latihanBestScore, s.ujianBestScore),
        }));

      const totalLatihan = summaries.reduce((sum, s) => sum + s.totalLatihan, 0);
      const totalUjian = summaries.reduce((sum, s) => sum + s.totalUjian, 0);

      let totalXp = 0;
      try {
        const response = await apiFetch(
          `${API_URL}/get-leaderboard.php?email=${encodeURIComponent(email)}`
        );
        const json = await response.json();
        if (json.status === "success" && json.me) {
          totalXp = json.me.total_xp || 0;
        }
      } catch (e) {
        console.log("Gagal ambil XP", e);
      }

      const dateStr = new Date().toLocaleDateString(language, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      setData({
        username,
        date: dateStr,
        profileImage,
        streak,
        totalLatihan,
        totalUjian,
        totalXp,
        level: Math.floor(totalXp / XP_PER_LEVEL) + 1,
        xpInLevel: totalXp % XP_PER_LEVEL,
        subjects,
        promoMessage: id ? DEFAULT_PROMO_ID : DEFAULT_PROMO_EN,
        lang: language,
      });
    } catch (e) {
      console.log("Gagal load data share", e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || !data) return;
    try {
      setSharing(true);
      const uri = await captureRef(cardRef, {
        result: "tmpfile",
        format: "png",
        quality: 1,
      });

      const hd = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 1, format: SaveFormat.PNG }
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(hd.uri, {
          mimeType: "image/png",
          dialogTitle: id ? "Bagikan Progress" : "Share Progress",
          UTI: "public.png",
        });
      } else {
        alert(id ? "Fitur berbagi tidak tersedia di perangkat ini." : "Sharing is not available on this device.");
      }
    } catch (e) {
      console.log("Gagal share", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.card} />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <SoundTouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </SoundTouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {id ? "Bagikan Progress" : "Share Progress"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.subtext }]}>
            {id ? "Pamerkan pencapaianmu" : "Show off your achievement"}
          </Text>
        </View>
        <Ionicons name="share-social" size={22} color="#25D366" />
      </View>

      {loading || !data ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* EDIT PESAN PROMO */}
          <Text style={[styles.previewLabel, { color: colors.subtext }]}>
            {id ? "Pesan promosi" : "Promo message"}
          </Text>
          <View
            style={[
              styles.promoInputWrap,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="megaphone" size={16} color="#F59E0B" />
            <TextInput
              style={[styles.promoInput, { color: colors.text }]}
              value={promo}
              onChangeText={setPromo}
              placeholder={
                id ? "Tulis pesan promosi..." : "Write a promo message..."
              }
              placeholderTextColor={colors.subtext}
              multiline
              maxLength={160}
            />
            <Text style={[styles.promoCount, { color: colors.subtext }]}>
              {promo.length}/160
            </Text>
          </View>

          {/* PREVIEW KARTU */}
          <Text style={[styles.previewLabel, { color: colors.subtext }]}>
            {id ? "Pratinjau kartu" : "Card preview"}
          </Text>
          <View ref={cardRef} collapsable={false} style={styles.cardWrap}>
            {data && <ShareCard data={{ ...data, promoMessage: promo }} />}
          </View>

          {/* TOMBOL SHARE */}
          <SoundTouchableOpacity
            style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
            onPress={handleShare}
            activeOpacity={0.85}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>
                  {id ? "Bagikan ke WhatsApp" : "Share to WhatsApp"}
                </Text>
              </>
            )}
          </SoundTouchableOpacity>
          <Text style={[styles.shareHint, { color: colors.subtext }]}>
            {id
              ? "Akan terbuka menu berbagi — pilih WhatsApp untuk mengirim gambar."
              : "A share sheet will open — pick WhatsApp to send the image."}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  headerSub: { fontSize: 12, marginTop: 1 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  previewLabel: { fontSize: 12, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  promoInputWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  promoInput: { flex: 1, fontSize: 13, marginLeft: 8, padding: 0, minHeight: 20 },
  promoCount: { fontSize: 10, marginLeft: 6, marginTop: 2 },
  cardWrap: { alignItems: "stretch" },
  shareBtn: {
    marginTop: 24,
    backgroundColor: "#25D366",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#128C7E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  shareBtnDisabled: { opacity: 0.7 },
  shareBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", marginLeft: 8 },
  shareHint: { fontSize: 12, textAlign: "center", marginTop: 12, lineHeight: 18 },
});