import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export interface ShareSubject {
  name: string;
  bestScore: number;
}

export interface ShareCardData {
  username: string;
  date: string;
  profileImage: string | null;
  streak: number;
  totalLatihan: number;
  totalUjian: number;
  totalXp: number;
  level: number;
  xpInLevel: number;
  subjects: ShareSubject[];
  promoMessage: string;
  lang: "id" | "en";
}

const XP_PER_LEVEL = 500;

const SUBJECT_PALETTE = ["#FBBF24", "#34D399", "#60A5FA", "#F472B6", "#A78BFA"];

export default function ShareCard({ data }: { data: ShareCardData }) {
  const id = data.lang === "id";
  return (
    <LinearGradient
      colors={["#1E3A8A", "#312E81", "#4C1D95"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.decoCircleTop} />
      <View style={styles.decoCircleBottom} />

      {/* HEADER BRAND */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot}>
            <Ionicons name="school" size={13} color="#1E3A8A" />
          </View>
          <Text style={styles.brand}>Ambativasi</Text>
          <View style={styles.usersPill}>
            <Ionicons name="people" size={11} color="#FBBF24" />
            <Text style={styles.usersPillText}>
              {id ? "Komunitas" : "Community"}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{data.date}</Text>
      </View>
      <Text style={styles.tagline}>{id ? "Belajar Makin Asik 🚀" : "Learning Made Fun 🚀"}</Text>

      {/* GREETING */}
      <View style={styles.greetRow}>
        <View style={styles.avatar}>
          {data.profileImage ? (
            <Image source={{ uri: data.profileImage }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitial}>
              {(data.username.trim().charAt(0) || "?").toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.greetTextWrap}>
          <Text style={styles.greet} numberOfLines={1}>
            {id ? "Halo" : "Hi"}, {data.username}! 👋
          </Text>
          <Text style={styles.greetSub}>
            {id ? "Ini progress belajarku:" : "This is my learning progress:"}
          </Text>
        </View>
      </View>

      {/* STREAK */}
      <View style={styles.streakBox}>
        <View style={styles.streakIcon}>
          <Ionicons name="flame" size={40} color="#FBBF24" />
        </View>
        <View style={styles.streakTextWrap}>
          <Text style={styles.streakNum}>{data.streak}</Text>
          <Text style={styles.streakLabel}>
            {id ? "hari streak" : "day streak"} 🔥
          </Text>
        </View>
        <Text style={styles.streakEmoji}>🏆</Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <StatBox
          icon="document-text"
          value={data.totalLatihan}
          label={id ? "Latihan" : "Practice"}
        />
        <StatBox icon="clipboard" value={data.totalUjian} label={id ? "Ujian" : "Exams"} />
        <StatBox icon="flash" value={data.totalXp} label="XP" />
      </View>

      {/* SUBJECTS */}
      {data.subjects.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>
            {id ? "Skor terbaik per mapel" : "Best score per subject"}
          </Text>
          <View style={styles.subjectWrap}>
            {data.subjects.slice(0, 4).map((s, i) => (
              <View
                key={i}
                style={[
                  styles.subjectChip,
                  { backgroundColor: SUBJECT_PALETTE[i % SUBJECT_PALETTE.length] },
                ]}
              >
                <Text style={styles.subjectChipName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.subjectChipScore}>{s.bestScore}%</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* LEVEL PROGRESS */}
      <View style={styles.levelWrap}>
        <View style={styles.levelTop}>
          <Text style={styles.levelLabel}>
            {id ? "Level" : "Level"} {data.level}
          </Text>
          <Text style={styles.levelXp}>
            {data.xpInLevel}/{XP_PER_LEVEL} XP
          </Text>
        </View>
        <View style={styles.levelBarTrack}>
          <View
            style={[
              styles.levelBarFill,
              { width: `${(data.xpInLevel / XP_PER_LEVEL) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* PROMO BANNER */}
      {data.promoMessage.trim().length > 0 && (
        <View style={styles.promoBox}>
          <Ionicons name="megaphone" size={16} color="#1E293B" />
          <Text style={styles.promoText}>{data.promoMessage}</Text>
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerBrand}>Ambativasi • {id ? "Belajar Makin Asik" : "Learn Smarter"}</Text>
      </View>
    </LinearGradient>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: "document-text" | "clipboard" | "flash";
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={18} color="rgba(255,255,255,0.85)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
  },
  decoCircleTop: {
    position: "absolute",
    top: -70,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  decoCircleBottom: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  brand: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", letterSpacing: 0.3 },
  usersPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.18)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  usersPillText: { color: "#FBBF24", fontSize: 10, fontWeight: "800", marginLeft: 3 },
  date: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  tagline: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2, marginLeft: 34 },

  greetRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  greetTextWrap: { flex: 1, marginLeft: 12 },
  greet: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  greetSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 52, height: 52, borderRadius: 26 },
  avatarInitial: { color: "#1E293B", fontSize: 22, fontWeight: "900" },

  streakBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  streakIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(251,191,36,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  streakTextWrap: { flex: 1 },
  streakNum: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", lineHeight: 36 },
  streakLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },
  streakEmoji: { fontSize: 26 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 14,
  },
  statValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 4 },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", marginTop: 2 },

  sectionLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
  },
  subjectWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  subjectChipName: { color: "#1E293B", fontSize: 12, fontWeight: "800", maxWidth: 120 },
  subjectChipScore: { color: "#1E293B", fontSize: 12, fontWeight: "900", marginLeft: 6 },

  levelWrap: { marginTop: 20 },
  levelTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  levelLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  levelXp: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
  levelBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  levelBarFill: { height: "100%", borderRadius: 5, backgroundColor: "#FBBF24" },

  footer: { marginTop: 20 },
  footerDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 12 },
  footerBrand: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  promoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FBBF24",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 20,
    gap: 8,
  },
  promoText: { color: "#1E293B", fontSize: 12, fontWeight: "700", lineHeight: 17, flex: 1 },
});
