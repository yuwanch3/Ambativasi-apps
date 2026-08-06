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

import { LevelCard } from "../../components/LevelCard";
import { ScreenShell } from "../../components/ScreenShell";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function MateriScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();

  const levels = [
    {
      id: 1,
      image: require("../../assets/icons/ba.png"),
      judul:
        language === "id"
          ? "Latih Bicara Qur'anmu"
          : "Practice Reciting the Quran",
      sub:
        language === "id"
          ? "Latih Kemampuan Berbicara Qur'anmu"
          : "Practice Your Quranic Speaking Skills",
      path: "/speech/qur'an",
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
            color={colors.isDark ? "#FEF3C7" : "#78350F"}
          />
          <Text
            style={[
              styles.backButtonText,
              { color: colors.isDark ? "#FEF3C7" : "#78350F" },
            ]}
          >
            {t("back_to_dashboard")}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("select_materi")}
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
