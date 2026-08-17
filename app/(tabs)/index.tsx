import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

import { Navbar } from "../../components/navbar";
import { Sidebar } from "../../components/sidebar";
import API_URL, { apiFetch } from "../../config";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import {
  getSubjectSummary,
  SubjectSummary,
} from "../../src/utils/progressTracker";
import { getCurrentStreak, getLast7Days } from "../../src/utils/streakTracker";

const { width } = Dimensions.get("window");

const SUBJECT_ICONS = {
  chemical: { name: "flask" as const, color: "#16A34A", bg: "#DCFCE7" },
  nihongo: { name: "language" as const, color: "#2563EB", bg: "#DBEAFE" },
  tajwid: { name: "book" as const, color: "#CA8A04", bg: "#FEF9C3" },
  petrofisika: { name: "radio" as const, color: "#9333EA", bg: "#F3E8FF" },
  minho: { name: "language" as const, color: "#2563EB", bg: "#DBEAFE" },
};

const STREAK_TIERS = [
  { min: 7, flame: "#A855F7", bg: "rgba(168,85,247,0.18)" },
  { min: 5, flame: "#EF4444", bg: "rgba(239,68,68,0.18)" },
  { min: 3, flame: "#F97316", bg: "rgba(249,115,22,0.18)" },
  { min: 1, flame: "#FACC15", bg: "rgba(250,204,21,0.18)" },
  { min: 0, flame: "#94A3B8", bg: "transparent" },
];

function getStreakTier(streak: number) {
  return (
    STREAK_TIERS.find((t) => streak >= t.min) ||
    STREAK_TIERS[STREAK_TIERS.length - 1]
  );
}

function getSubjectIcon(id: string): {
  name: string;
  color: string;
  bg: string;
} {
  for (const [key, val] of Object.entries(SUBJECT_ICONS)) {
    if (id.includes(key)) return val;
  }
  return { name: "school", color: "#64748B", bg: "#E2E8F0" };
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>(
    [],
  );
  const [streak, setStreak] = useState(0);
  const [last7Days, setLast7Days] = useState<
    { date: string; active: boolean }[]
  >([]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
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
          `${API_URL}/get-profile.php?email=${parsedSession.email}`,
        );
        const data = await response.json();
        if (data.status === "success" && data.profile_image) {
          setProfileImage(`${API_URL}/${data.profile_image}`);
        }
      } catch (e) {
        console.log("Gagal sinkron foto profil", e);
      }

      const summaries = await getSubjectSummary();
      setSubjectSummaries(summaries);
      setStreak(await getCurrentStreak());
      setLast7Days(await getLast7Days());
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

  const totalLatihan = subjectSummaries.reduce((s, x) => s + x.totalLatihan, 0);
  const totalUjian = subjectSummaries.reduce((s, x) => s + x.totalUjian, 0);
  const totalActivity = totalLatihan + totalUjian;

  const streakTier = getStreakTier(streak);
  const streakLabel =
    streak === 0
      ? language === "id"
        ? "Mulai streak hari ini!"
        : "Start your streak today!"
      : streak < 3
        ? language === "id"
          ? "Ayo pertahankan!"
          : "Keep it up!"
        : streak < 5
          ? language === "id"
            ? "Makin konsisten! 🔥"
            : "Getting consistent! 🔥"
          : streak < 7
            ? language === "id"
              ? "Hebat, jangan putus!"
              : "Great, don't stop!"
            : language === "id"
              ? "Luar biasa! 🔥"
              : "Amazing! 🔥";

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
      edges={["top"]}
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
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome */}
        <View
          style={[
            styles.welcomeCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeTextWrap}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                  {t("welcome")}, {userData?.username || "User"}
                </Text>
                <Text style={[styles.welcomeEmoji, { marginLeft: 6 }]}>👋</Text>
              </View>

              <Text style={[styles.welcomeSub, { color: colors.subtext }]}>
                {totalActivity > 0
                  ? language === "id"
                    ? `${totalActivity} aktivitas belajar`
                    : `${totalActivity} learning activities`
                  : language === "id"
                    ? "Mulai belajar sekarang!"
                    : "Start learning now!"}
              </Text>
            </View>
            <View
              style={[
                styles.ringOuter,
                { borderColor: totalActivity > 0 ? "#16A34A" : colors.border },
              ]}
            >
              <View
                style={[styles.ringInner, { backgroundColor: colors.inputBg }]}
              >
                <Text
                  style={[
                    styles.ringNumber,
                    { color: totalActivity > 0 ? "#16A34A" : colors.subtext },
                  ]}
                >
                  {subjectSummaries.length}
                </Text>
                <Text style={[styles.ringLabel, { color: colors.subtext }]}>
                  {language === "id" ? "Mapel" : "Subj"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Streak */}
        <View
          style={[
            styles.streakCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.streakLeft}>
            <View
              style={[
                styles.streakFlameWrap,
                { backgroundColor: streakTier.bg },
              ]}
            >
              <Ionicons name="flame" size={32} color={streakTier.flame} />
            </View>
            <View>
              <Text style={[styles.streakNumber, { color: colors.text }]}>
                {streak}{" "}
                {language === "id" ? "hari" : `day${streak !== 1 ? "s" : ""}`}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.subtext }]}>
                {streakLabel}
              </Text>
            </View>
          </View>
          <View style={styles.calendarRow}>
            {last7Days.map((day, i) => {
              const dayNames =
                language === "id"
                  ? ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
                  : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const d = new Date(day.date + "T00:00:00");
              return (
                <View key={i} style={styles.calendarDay}>
                  <View
                    style={[
                      styles.calendarDot,
                      {
                        backgroundColor: day.active
                          ? streakTier.flame
                          : colors.inputBg,
                        borderColor: day.active
                          ? streakTier.flame
                          : colors.border,
                      },
                    ]}
                  >
                    {day.active && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                  <Text
                    style={[styles.calendarLabel, { color: colors.subtext }]}
                  >
                    {dayNames[d.getDay()]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Subject Progress */}
        {subjectSummaries.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {language === "id" ? "Progress Belajar" : "Learning Progress"}
            </Text>
          </View>
        )}

        {subjectSummaries.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectScroller}
          >
            {subjectSummaries.map((subject) => {
              const icon = getSubjectIcon(subject.subjectId);
              const bestScore = Math.max(
                subject.latihanBestScore,
                subject.ujianBestScore,
              );
              const scoreColor =
                bestScore >= 80
                  ? "#16A34A"
                  : bestScore >= 50
                    ? "#CA8A04"
                    : "#DC2626";
              const totalAttempts =
                subject.latihanAttempts + subject.ujianAttempts;

              return (
                <SoundTouchableOpacity
                  key={subject.subjectId}
                  style={[
                    styles.subjectCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/statistik",
                      params: {
                        subjectId: subject.subjectId,
                        subjectName: subject.subjectName,
                      },
                    })
                  }
                >
                  <View style={styles.subjectTop}>
                    <View
                      style={[
                        styles.subjectIconWrap,
                        {
                          backgroundColor: colors.isDark
                            ? "rgba(255,255,255,0.05)"
                            : icon.bg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={icon.name as any}
                        size={22}
                        color={icon.color}
                      />
                    </View>
                    <Text
                      style={[styles.subjectName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {subject.subjectName || subject.subjectId}
                    </Text>
                  </View>

                  <View style={styles.subjectScoreWrap}>
                    <Text
                      style={[styles.subjectScoreBig, { color: scoreColor }]}
                    >
                      {totalAttempts > 0 ? `${bestScore}` : "-"}
                    </Text>
                    <Text
                      style={[
                        styles.subjectScorePct,
                        { color: colors.subtext },
                      ]}
                    >
                      %
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.subjectScoreLabel,
                      { color: colors.subtext },
                    ]}
                  >
                    {language === "id" ? "Skor terbaik" : "Best score"}
                  </Text>

                  {totalAttempts > 0 && (
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${bestScore}%`,
                            backgroundColor: scoreColor,
                          },
                        ]}
                      />
                    </View>
                  )}

                  <View style={styles.subjectStatsRow}>
                    <View style={styles.subjectStatChip}>
                      <Ionicons
                        name="document-text-outline"
                        size={12}
                        color="#16A34A"
                      />
                      <Text
                        style={[
                          styles.subjectStatText,
                          { color: colors.subtext },
                        ]}
                      >
                        {subject.latihanAttempts}x
                      </Text>
                    </View>
                    <View style={styles.subjectStatChip}>
                      <Ionicons
                        name="clipboard-outline"
                        size={12}
                        color="#2563EB"
                      />
                      <Text
                        style={[
                          styles.subjectStatText,
                          { color: colors.subtext },
                        ]}
                      >
                        {subject.ujianAttempts}x
                      </Text>
                    </View>
                  </View>
                </SoundTouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Activity / Empty State */}
        {subjectSummaries.length === 0 && (
          <View style={styles.emptySection}>
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="rocket-outline"
                size={48}
                color={colors.subtext}
                style={{ opacity: 0.3, marginBottom: 12 }}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {language === "id" ? "Belum ada aktivitas" : "No activity yet"}
              </Text>
              <Text style={[styles.emptySub, { color: colors.subtext }]}>
                {language === "id"
                  ? "Kerjakan latihan soal atau ujian untuk mulai melacak progress!"
                  : "Do practice questions or exams to start tracking progress!"}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === "id" ? "Menu Cepat" : "Quick Menu"}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <SoundTouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/materi")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.isDark ? "#14532D" : "#F0FDF4" },
              ]}
            >
              <Image
                source={require("../../assets/images/icon-materi.png")}
                style={styles.actionImg}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              {t("materi")}
            </Text>
            <Text style={[styles.actionSub, { color: colors.subtext }]}>
              {t("learning_materials")}
            </Text>
          </SoundTouchableOpacity>

          <SoundTouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/ujian")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.isDark ? "#1E3A8A" : "#EFF6FF" },
              ]}
            >
              <Image
                source={require("../../assets/images/icon-exam.png")}
                style={styles.actionImg}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              {t("ujian")}
            </Text>
            <Text style={[styles.actionSub, { color: colors.subtext }]}>
              {t("start_exam")}
            </Text>
          </SoundTouchableOpacity>

          <SoundTouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/speech" as any)} // TODO: ganti route sesuai kebutuhan
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.isDark ? "#78350F" : "#FEF3C7" },
              ]}
            >
              <Image
                source={require("../../assets/images/speech-arab-no-bg.png")}
                style={styles.actionImg}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              {language === "id" ? "Bicara" : "Speech"}
            </Text>
            <Text style={[styles.actionSub, { color: colors.subtext }]}>
              {language === "id"
                ? "Latih Berbicaramu"
                : "Practice Your Speaking"}
            </Text>
          </SoundTouchableOpacity>
        </View>
      </ScrollView>

      {/* Chat Bubble */}
      <SoundTouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.floatingBubble,
          {
            backgroundColor: colors.isDark ? "#2563EB" : "#1D4ED8",
            shadowColor: colors.isDark ? "#000" : "#1E40AF",
          },
        ]}
        onPress={() => router.push("/chat" as any)}
      >
        <Ionicons name="sparkles" size={26} color="#FFFFFF" />
      </SoundTouchableOpacity>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={userData}
        profileImage={profileImage}
        onLogout={handleLogout}
        applyBottomInset={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  /* Welcome */
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcomeTextWrap: { flex: 1, marginRight: 16 },
  welcomeEmoji: { fontSize: 24, marginBottom: 4 },
  welcomeTitle: { fontSize: 20, fontWeight: "bold" },
  welcomeSub: { fontSize: 13, marginTop: 3 },
  ringOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  ringInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  ringNumber: { fontSize: 20, fontWeight: "bold" },
  ringLabel: { fontSize: 10, marginTop: -1 },

  /* Streak */
  streakCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  streakLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10, minWidth: 120 },
  streakFlameWrap: { borderRadius: 12, padding: 4 },
  streakNumber: { fontSize: 20, fontWeight: "bold" },
  streakLabel: { fontSize: 12, marginTop: 1, flexShrink: 1 },
  calendarRow: { flexDirection: "row", gap: 8, marginLeft: 10, flexShrink: 1 },
  calendarDay: { alignItems: "center" },
  calendarDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  calendarLabel: { fontSize: 9, fontWeight: "500" },

  /* Section */
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },

  /* Subject Cards (horizontal scroll) */
  subjectScroller: { paddingRight: 4, gap: 12, paddingBottom: 4 },
  subjectCard: {
    width: 150,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  subjectTop: { alignItems: "center", marginBottom: 12 },
  subjectIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectName: { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  subjectScoreWrap: { flexDirection: "row", alignItems: "baseline" },
  subjectScoreBig: { fontSize: 30, fontWeight: "bold" },
  subjectScorePct: { fontSize: 15, fontWeight: "bold", marginLeft: 1 },
  subjectScoreLabel: { fontSize: 10, marginTop: 2, marginBottom: 8 },
  progressBarBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(148,163,184,0.2)",
    overflow: "hidden",
    width: "100%",
  },
  progressBarFill: { height: 5, borderRadius: 2.5 },
  subjectStatsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  subjectStatChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(148,163,184,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectStatText: { fontSize: 11, fontWeight: "600" },

  /* Empty */
  emptySection: { marginBottom: 20 },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.7,
    paddingHorizontal: 20,
  },

  /* Quick Actions */
  actionRow: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionIcon: {
    padding: 6,
    borderRadius: 16,
    marginBottom: 8,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  actionImg: { width: 50, height: 50 },
  actionTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
  actionSub: { fontSize: 10, marginTop: 3, textAlign: "center" },

  /* Chat Bubble */
  floatingBubble: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 24 : 30,
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    zIndex: 99,
  },
});