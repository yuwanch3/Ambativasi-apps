import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LevelCard } from "../../../components/LevelCard";
import { ScreenShell } from "../../../components/ScreenShell";
import { useLanguage } from "../../../context/LanguageContext";
import { useTheme } from "../../../context/ThemeContext";

export default function MateriScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const levels = [
    {
      id: 1,
      image: require("../../../assets/icons/icon-Chemical-EOR.png"),
      judul: language === "id" ? "Surfaktan" : "Surfactant",
      sub:
        language === "id"
          ? "IFT, Microemulsion & Screening Criteria"
          : "IFT, Microemulsion & Screening Criteria",
      path: "/materi/chemical-eor/babMateri?bab=surfaktan",
    },
    {
      id: 2,
      image: require("../../../assets/icons/icon-Chemical-EOR.png"),
      judul: language === "id" ? "Alkaline" : "Alkaline",
      sub:
        language === "id"
          ? "Caustic Flooding & Emulsifikasi"
          : "Caustic Flooding & Emulsification",
      path: "/materi/chemical-eor/babMateri?bab=alkaline",
    },
    {
      id: 3,
      image: require("../../../assets/icons/icon-Chemical-EOR.png"),
      judul: language === "id" ? "Polimer" : "Polymer",
      sub:
        language === "id"
          ? "Mobility Ratio, HPAM & Sweep Efficiency"
          : "Mobility Ratio, HPAM & Sweep Efficiency",
      path: "/materi/chemical-eor/babMateri?bab=polimer",
    },
  ];

  return (
    <ScreenShell>
      <View style={styles.mainContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
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
            {language === "id"
              ? "Kembali ke Chemical EOR"
              : "Back to Chemical EOR"}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("select_level")}
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
