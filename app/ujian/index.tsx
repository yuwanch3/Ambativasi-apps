import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { LevelCard } from "../../components/LevelCard";
import { ScreenShell } from "../../components/ScreenShell";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function SoalScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const levels = [
    {
      id: 1,
      image: require("../../assets/icons/icon-bahasa-jepang.png"),
      judul: language === "id" ? "Bahasa Jepang" : "Japanese Language",
      sub:
        language === "id"
          ? "Ujian Soal Bahasa Jepang"
          : "Japanese Exam Questions",
      path: "/ujian/bahasa-jepang-ujian/subUjian-Nihongo",
    },
    {
      id: 2,
      image: require("../../assets/icons/icon-tajwid.png"),
      judul: language === "id" ? "Tajwid" : "Tajweed",
      sub: language === "id" ? "Ujian Soal Tajwid" : "Tajweed Exam Questions",
      path: "/ujian/tajwid-islam-ujian/tajwid-ujian",
    },
    {
      id: 3,
      image: require("../../assets/icons/icon-petrophysics.png"),
      judul: language === "id" ? "Petrofisika" : "Petrophysics",
      sub:
        language === "id"
          ? "Ujian Soal Petrofisika"
          : "Petrophysics Exam Questions",
      path: "/ujian/petrofisika-ujian/petrofisika-ujian",
    },
    {
      id: 4,
      image: require("../../assets/icons/icon-Chemical-EOR.png"),
      judul: "Chemical EOR",
      sub:
        language === "id"
          ? "Ujian Soal Chemical EOR"
          : "Chemical EOR Exam Questions",
      path: "/ujian/chemical-eor-ujian/chemical-eor-ujian",
    },
  ];

  return (
    <ScreenShell>
      <View style={styles.mainContent}>
        <SoundTouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.isDark ? "#60A5FA" : "#2563EB"}
          />
          <Text
            style={[
              styles.backButtonText,
              { color: colors.isDark ? "#60A5FA" : "#2563EB" },
            ]}
          >
            {language === "id" ? "Kembali ke Dashboard" : "Back to Dashboard"}
          </Text>
        </SoundTouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === "id" ? "Pilih Materi" : "Select Material"}
          </Text>

          {levels.map((level) => (
            <LevelCard
              key={level.id}
              item={level}
              onPress={(path) => router.push(path as any)}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  scrollContainer: { flex: 1, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
});