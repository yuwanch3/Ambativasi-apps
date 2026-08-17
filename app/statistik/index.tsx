import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { ScreenShell } from "../../components/ScreenShell";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import {
  getAllProgress,
  getSubjectSummary,
  ProgressEntry,
  SubjectSummary,
} from "../../src/utils/progressTracker";

const GREEN = "#16A34A";
const GREEN_BG = "#DCFCE7";
const BLUE = "#2563EB";
const BLUE_BG = "#DBEAFE";

function scorePct(e: ProgressEntry): number {
  return e.total > 0 ? Math.round((e.score / e.total) * 100) : 0;
}

function bestOf(arr: ProgressEntry[]): number {
  return arr.length ? Math.max(...arr.map(scorePct)) : 0;
}

function avgOf(arr: ProgressEntry[]): number {
  return arr.length
    ? Math.round(arr.reduce((s, e) => s + scorePct(e), 0) / arr.length)
    : 0;
}

export default function StatistikScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams();

  const subjectId = params.subjectId ? String(params.subjectId) : "";
  const fallbackName = params.subjectName ? String(params.subjectName) : "";

  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [summaries, setSummaries] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        router.back();
        return true;
      });
      return () => sub.remove();
    }, [])
  );

  const loadData = async () => {
    const [all, summary] = await Promise.all([
      getAllProgress(),
      getSubjectSummary(),
    ]);
    setEntries(all);
    setSummaries(summary);
    setLoading(false);
  };

  const current = entries.filter((e) => e.subjectId === subjectId);
  const currentName =
    current[0]?.subjectName || fallbackName || subjectId || "-";
  const latihan = current.filter((e) => e.type === "latihan");
  const ujian = current.filter((e) => e.type === "ujian");

  const latihanBest = bestOf(latihan);
  const ujianBest = bestOf(ujian);
  const combined =
    latihanBest > 0 && ujianBest > 0
      ? Math.round((latihanBest + ujianBest) / 2)
      : Math.max(latihanBest, ujianBest);

  const history = [...current]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-10);

  const scoreColor =
    combined >= 80 ? GREEN : combined >= 50 ? "#CA8A04" : "#DC2626";

  const gantiMateri = (s: SubjectSummary) => {
    router.setParams({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
    });
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScreenShell>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SoundTouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            {language === "id" ? "Kembali" : "Back"}
          </Text>
        </SoundTouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {language === "id" ? "Statistik Progress" : "Progress Statistics"}
        </Text>
        <Text style={[styles.subjectName, { color: colors.subtext }]}>
          {currentName}
        </Text>

        {summaries.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            style={styles.chipsScroller}
          >
            {summaries.map((s) => {
              const active = s.subjectId === subjectId;
              return (
                <SoundTouchableOpacity
                  key={s.subjectId}
                  activeOpacity={0.8}
                  onPress={() => gantiMateri(s)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? BLUE
                        : colors.isDark
                          ? "#1E293B"
                          : "#F1F5F9",
                      borderColor: active ? BLUE : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? "#FFF" : colors.subtext },
                    ]}
                    numberOfLines={1}
                  >
                    {s.subjectName || s.subjectId}
                  </Text>
                </SoundTouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {current.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="bar-chart-outline"
              size={48}
              color={colors.subtext}
              style={{ opacity: 0.3, marginBottom: 12 }}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {language === "id"
                ? "Belum ada data materi ini"
                : "No data for this subject yet"}
            </Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>
              {language === "id"
                ? "Kerjakan latihan soal atau ujian untuk melihat statistik."
                : "Do practice questions or exams to see statistics."}
            </Text>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardLabel, { color: colors.subtext }]}>
                {language === "id"
                  ? "Progress Gabungan (Materi + Ujian)"
                  : "Combined Progress (Material + Exam)"}
              </Text>
              <View style={styles.combinedRow}>
                <Text style={[styles.combinedBig, { color: scoreColor }]}>
                  {combined}
                </Text>
                <Text style={[styles.combinedPct, { color: colors.subtext }]}>
                  %
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${combined}%`, backgroundColor: scoreColor },
                  ]}
                />
              </View>
              <Text style={[styles.cardHint, { color: colors.subtext }]}>
                {language === "id"
                  ? "Rata-rata skor terbaik latihan & ujian"
                  : "Average of best material & exam scores"}
              </Text>
            </View>

            <View style={styles.twoCol}>
              <View
                style={[
                  styles.card,
                  styles.typeCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor: colors.isDark
                        ? "rgba(22,163,74,0.15)"
                        : GREEN_BG,
                    },
                  ]}
                >
                  <Ionicons name="document-text-outline" size={20} color={GREEN} />
                </View>
                <Text style={[styles.typeTitle, { color: colors.text }]}>
                  {language === "id" ? "Materi (10 Soal)" : "Material (10 Qs)"}
                </Text>
                <Text style={[styles.typeBig, { color: GREEN }]}>
                  {latihan.length}
                </Text>
                <Text style={[styles.typeLabel, { color: colors.subtext }]}>
                  {language === "id" ? "Kali dikerjakan" : "Attempts"}
                </Text>
                <View style={styles.typeDivider} />
                <Text style={[styles.typeStat, { color: colors.text }]}>
                  {language === "id" ? "Terbaik" : "Best"}:{" "}
                  <Text style={{ color: GREEN, fontWeight: "bold" }}>
                    {latihanBest}%
                  </Text>
                </Text>
                <Text style={[styles.typeStat, { color: colors.text }]}>
                  {language === "id" ? "Rata-rata" : "Average"}:{" "}
                  <Text style={{ color: GREEN, fontWeight: "bold" }}>
                    {avgOf(latihan)}%
                  </Text>
                </Text>
              </View>

              <View
                style={[
                  styles.card,
                  styles.typeCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.typeIcon,
                    {
                      backgroundColor: colors.isDark
                        ? "rgba(37,99,235,0.15)"
                        : BLUE_BG,
                    },
                  ]}
                >
                  <Ionicons name="clipboard-outline" size={20} color={BLUE} />
                </View>
                <Text style={[styles.typeTitle, { color: colors.text }]}>
                  {language === "id" ? "Ujian (50 Soal)" : "Exam (50 Qs)"}
                </Text>
                <Text style={[styles.typeBig, { color: BLUE }]}>
                  {ujian.length}
                </Text>
                <Text style={[styles.typeLabel, { color: colors.subtext }]}>
                  {language === "id" ? "Kali dikerjakan" : "Attempts"}
                </Text>
                <View style={styles.typeDivider} />
                <Text style={[styles.typeStat, { color: colors.text }]}>
                  {language === "id" ? "Terbaik" : "Best"}:{" "}
                  <Text style={{ color: BLUE, fontWeight: "bold" }}>
                    {ujianBest}%
                  </Text>
                </Text>
                <Text style={[styles.typeStat, { color: colors.text }]}>
                  {language === "id" ? "Rata-rata" : "Average"}:{" "}
                  <Text style={{ color: BLUE, fontWeight: "bold" }}>
                    {avgOf(ujian)}%
                  </Text>
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardLabel, { color: colors.subtext }]}>
                {language === "id"
                  ? "Riwayat Skor (10 Terakhir)"
                  : "Score History (Last 10)"}
              </Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
                  <Text style={[styles.legendText, { color: colors.subtext }]}>
                    {language === "id" ? "Materi" : "Material"}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: BLUE }]} />
                  <Text style={[styles.legendText, { color: colors.subtext }]}>
                    {language === "id" ? "Ujian" : "Exam"}
                  </Text>
                </View>
              </View>

              <View style={styles.chartRow}>
                {history.map((e, i) => {
                  const v = scorePct(e);
                  const isLatihan = e.type === "latihan";
                  return (
                    <View key={i} style={styles.chartCol}>
                      <Text
                        style={[
                          styles.chartValue,
                          { color: isLatihan ? GREEN : BLUE },
                        ]}
                      >
                        {v}
                      </Text>
                      <View style={styles.chartBarBg}>
                        <View
                          style={[
                            styles.chartBarFill,
                            {
                              height: `${Math.max(v, 8)}%`,
                              backgroundColor: isLatihan ? GREEN : BLUE,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[styles.chartLabel, { color: colors.subtext }]}
                      >
                        {isLatihan ? "M" : "U"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 4,
  },
  backButtonText: { fontSize: 15, fontWeight: "600", marginLeft: 6 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  subjectName: { fontSize: 14, marginTop: 2, marginBottom: 12 },

  chipsScroller: { marginBottom: 16 },
  chipsRow: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600", maxWidth: 160 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  cardHint: { fontSize: 11, marginTop: 8, opacity: 0.7 },

  combinedRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" },
  combinedBig: { fontSize: 42, fontWeight: "bold", flexShrink: 1 },
  combinedPct: { fontSize: 18, fontWeight: "bold", marginLeft: 2, flexShrink: 1 },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(148,163,184,0.2)",
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: { height: 8, borderRadius: 4 },

  twoCol: { flexDirection: "row", gap: 12 },
  typeCard: { flex: 1 },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  typeTitle: { fontSize: 13, fontWeight: "bold" },
  typeBig: { fontSize: 30, fontWeight: "bold", marginTop: 6 },
  typeLabel: { fontSize: 11, marginBottom: 10 },
  typeDivider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.2)",
    marginVertical: 10,
  },
  typeStat: { fontSize: 13, marginBottom: 4 },

  legendRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12 },

  chartRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  chartCol: { flex: 1, alignItems: "center" },
  chartValue: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  chartBarBg: {
    height: 90,
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "rgba(148,163,184,0.1)",
    borderRadius: 6,
    overflow: "hidden",
  },
  chartBarFill: {
    width: "100%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartLabel: { fontSize: 10, marginTop: 4, fontWeight: "600" },

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
});