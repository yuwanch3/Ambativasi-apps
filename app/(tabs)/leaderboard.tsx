import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL, { apiFetch } from "../../config";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

const XP_PER_LEVEL = 500;

interface LeaderboardEntry {
  rank: number;
  username: string;
  email: string;
  profile_image: string | null;
  total_xp: number;
  level: number;
}

const RANK_COLORS: Record<number, string> = {
  1: "#F59E0B",
  2: "#94A3B8",
  3: "#CD7F32",
};

const PODIUM_COLORS: Record<number, string> = {
  1: "#F59E0B",
  2: "#94A3B8",
  3: "#CD7F32",
};

const PODIUM_HEIGHTS: Record<number, number> = {
  1: 92,
  2: 68,
  3: 52,
};

const PODIUM_ORDER = [2, 1, 3];

function Avatar({
  username,
  profileImage,
  size,
  ringColor,
}: {
  username: string;
  profileImage: string | null;
  size: number;
  ringColor?: string;
}) {
  if (profileImage) {
    return (
      <Image
        source={{ uri: `${API_URL}/${profileImage}` }}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
          ringColor && { borderWidth: 3, borderColor: ringColor },
        ]}
      />
    );
  }
  const initials = (username.trim().charAt(0) || "?").toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        styles.avatarFallback,
        { width: size, height: size, borderRadius: size / 2 },
        ringColor && { borderWidth: 3, borderColor: ringColor },
      ]}
    >
      <Text style={[styles.avatarInitial, { fontSize: size * 0.42 }]}>
        {initials}
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (!session) return;
      const user = JSON.parse(session);

      const response = await apiFetch(
        `${API_URL}/get-leaderboard.php?email=${encodeURIComponent(
          user.email
        )}&limit=20`
      );
      const json = await response.json();
      if (json.status === "success") {
        setLeaderboard(json.leaderboard || []);
        setMe(json.me);
        setError(false);
      } else {
        setError(true);
      }
    } catch (e) {
      console.log("Gagal load leaderboard", e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [loadLeaderboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const podiumMap: Record<number, LeaderboardEntry | undefined> = {};
  for (const entry of leaderboard) {
    if (entry.rank <= 3) podiumMap[entry.rank] = entry;
  }

  const listEntries = leaderboard.filter((e) => e.rank > 3);
  const myEmail = me?.email;
  const myOutsideTop = me && me.rank > leaderboard.length;

  const levelProgress = me ? me.total_xp % XP_PER_LEVEL : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* HEADER ATAS */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.headerIcon}>
            <Ionicons name="trophy" size={20} color="#F59E0B" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {language === "id" ? "Peringkat" : "Leaderboard"}
            </Text>
            <Text style={[styles.headerSub, { color: colors.subtext }]}>
              {language === "id"
                ? "Naikkan peringkatmu, kumpulkan XP!"
                : "Rise up the ranks, earn XP!"}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.subtext} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {language === "id" ? "Gagal memuat data" : "Failed to load data"}
          </Text>
          <SoundTouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              loadLeaderboard();
            }}
          >
            <Text style={styles.retryBtnText}>
              {language === "id" ? "Coba Lagi" : "Retry"}
            </Text>
          </SoundTouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.subtext}
            />
          }
        >
          {/* KARTU STATUS SAYA */}
          {me && (
            <View
              style={[
                styles.myCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.myCardTop}>
                <View style={styles.myCardUser}>
                  <Avatar
                    username={me.username}
                    profileImage={me.profile_image}
                    size={44}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.myName, { color: colors.text }]} numberOfLines={1}>
                      {me.username}
                    </Text>
                    <View style={styles.myMetaRow}>
                      <Text style={[styles.myRankText, { color: colors.subtext }]}>
                        #{me.rank ?? "-"}
                      </Text>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>Lv. {me.level}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.myXpBox}>
                  <Ionicons name="flash" size={18} color="#F59E0B" />
                  <Text style={[styles.myXpText, { color: colors.text }]}>
                    {me.total_xp.toLocaleString()}
                  </Text>
                  <Text style={[styles.myXpLabel, { color: colors.subtext }]}>XP</Text>
                </View>
              </View>
              <View style={styles.levelBarWrap}>
                <View
                  style={[
                    styles.levelBarTrack,
                    { backgroundColor: colors.inputBg },
                  ]}
                >
                  <View
                    style={[
                      styles.levelBarFill,
                      { width: `${(levelProgress / XP_PER_LEVEL) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.levelBarLabel, { color: colors.subtext }]}>
                  {levelProgress} / {XP_PER_LEVEL} XP ke Lv. {me.level + 1}
                </Text>
              </View>
            </View>
          )}

          {/* PODIUM TOP 3 */}
          {leaderboard.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {language === "id" ? "Podium Juara" : "Champion Podium"}
              </Text>
              <View style={styles.podiumRow}>
                {PODIUM_ORDER.map((rank) => {
                  const entry = podiumMap[rank];
                  const isFirst = rank === 1;
                  return (
                    <View key={rank} style={styles.podiumCol}>
                      {entry ? (
                        <>
                          {isFirst && (
                            <View style={styles.crown}>
                              <Ionicons name="medal" size={22} color="#F59E0B" />
                            </View>
                          )}
                          <Avatar
                            username={entry.username}
                            profileImage={entry.profile_image}
                            size={isFirst ? 64 : 52}
                            ringColor={PODIUM_COLORS[rank]}
                          />
                          <Text
                            style={[styles.podiumName, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {entry.username}
                          </Text>
                          <Text
                            style={[styles.podiumXp, { color: colors.subtext }]}
                          >
                            {entry.total_xp.toLocaleString()} XP
                          </Text>
                          <View
                            style={[
                              styles.pedestal,
                              {
                                height: PODIUM_HEIGHTS[rank],
                                backgroundColor: PODIUM_COLORS[rank],
                                opacity: colors.isDark ? 0.85 : 0.9,
                              },
                            ]}
                          >
                            <Text style={styles.pedestalRank}>{rank}</Text>
                          </View>
                        </>
                      ) : (
                        <View style={styles.podiumEmpty}>
                          <Ionicons name="person-outline" size={28} color={colors.subtext} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* DAFTAR PERINGKAT */}
          {listEntries.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {language === "id" ? "Papan Peringkat" : "Ranking Board"}
              </Text>
              {listEntries.map((entry, index) => (
                <Row
                  key={entry.email}
                  entry={entry}
                  colors={colors}
                  isMine={entry.email === myEmail}
                  showDivider={index < listEntries.length - 1}
                />
              ))}

              {/* POSISI SAYA DI LUAR TOP */}
              {myOutsideTop && (
                <>
                  <View style={styles.myOutsideDivider}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dividerLabel, { color: colors.subtext }]}>
                      {language === "id" ? "Posisi kamu" : "Your position"}
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  </View>
                  <Row entry={me} colors={colors} isMine />
                </>
              )}
            </View>
          )}

          {leaderboard.length === 0 && (
            <View style={styles.centerBox}>
              <Ionicons name="trophy-outline" size={48} color={colors.subtext} />
              <Text style={[styles.errorTitle, { color: colors.text }]}>
                {language === "id"
                  ? "Belum ada pemain"
                  : "No players yet"}
              </Text>
              <Text style={[styles.emptySub, { color: colors.subtext }]}>
                {language === "id"
                  ? "Kerjakan latihan & ujian untuk mulai kumpulkan XP!"
                  : "Complete practice & exams to start earning XP!"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Row({
  entry,
  colors,
  isMine,
  showDivider,
}: {
  entry: LeaderboardEntry;
  colors: ReturnType<typeof useTheme>["colors"];
  isMine: boolean;
  showDivider?: boolean;
}) {
  const { language } = useLanguage();
  const rankColor = RANK_COLORS[entry.rank] || colors.subtext;
  return (
    <View
      style={[
        styles.row,
        showDivider && { borderBottomWidth: 1, borderBottomColor: colors.divider },
        isMine && {
          backgroundColor: colors.isDark ? "#172554" : "#EFF6FF",
          borderRadius: 12,
          paddingHorizontal: 10,
        },
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: colors.inputBg }]}>
        <Text style={[styles.rankText, { color: rankColor }]}>{entry.rank}</Text>
      </View>
      <Avatar username={entry.username} profileImage={entry.profile_image} size={38} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
          {entry.username}
        </Text>
        {isMine && (
          <Text style={[styles.youLabel, { color: "#2563EB" }]}>
            {language === "id" ? "Kamu" : "You"}
          </Text>
        )}
      </View>
      <View style={styles.rowLevelBadge}>
        <Text style={[styles.rowLevelText, { color: colors.subtext }]}>Lv. {entry.level}</Text>
      </View>
      <Text style={[styles.rowXp, { color: colors.text }]}>
        {entry.total_xp.toLocaleString()}
        <Text style={[styles.rowXpUnit, { color: colors.subtext }]}> XP</Text>
      </Text>
    </View>
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
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  headerSub: { fontSize: 12, marginTop: 1 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorTitle: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  emptySub: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 20 },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  retryBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  // KARTU SAYA
  myCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  myCardTop: { flexDirection: "row", alignItems: "center" },
  myCardUser: { flex: 1, flexDirection: "row", alignItems: "center" },
  myName: { fontSize: 16, fontWeight: "bold" },
  myMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  myRankText: { fontSize: 13, fontWeight: "700", marginRight: 8 },
  levelBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelBadgeText: { fontSize: 11, fontWeight: "800", color: "#2563EB" },
  myXpBox: { flexDirection: "row", alignItems: "center" },
  myXpText: { fontSize: 18, fontWeight: "800", marginLeft: 2 },
  myXpLabel: { fontSize: 11, fontWeight: "700", marginLeft: 2, marginTop: 4 },
  levelBarWrap: { marginTop: 14 },
  levelBarTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  levelBarFill: { height: "100%", backgroundColor: "#F59E0B", borderRadius: 4 },
  levelBarLabel: { fontSize: 11, marginTop: 6, textAlign: "right" },

  // SECTION
  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 12 },

  // PODIUM
  podiumRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around" },
  podiumCol: { alignItems: "center", width: "31%" },
  crown: { marginBottom: 4 },
  podiumName: { fontSize: 13, fontWeight: "700", marginTop: 8, maxWidth: "100%" },
  podiumXp: { fontSize: 11, marginTop: 2, marginBottom: 6 },
  pedestal: {
    width: 72,
    borderRadius: 10,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 6,
  },
  pedestalRank: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  podiumEmpty: { height: 92, justifyContent: "center" },

  // ROW
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rankText: { fontSize: 15, fontWeight: "900" },
  rowName: { fontSize: 14, fontWeight: "600" },
  youLabel: { fontSize: 11, fontWeight: "700", marginTop: 1 },
  rowLevelBadge: {
    marginRight: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  rowLevelText: { fontSize: 10, fontWeight: "800" },
  rowXp: { fontSize: 13, fontWeight: "800" },
  rowXpUnit: { fontSize: 10, fontWeight: "600" },
  myOutsideDivider: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: 12, fontWeight: "700", marginHorizontal: 10 },
  avatar: { backgroundColor: "#DBEAFE" },
  avatarFallback: { justifyContent: "center", alignItems: "center" },
  avatarInitial: { color: "#2563EB", fontWeight: "900" },
});