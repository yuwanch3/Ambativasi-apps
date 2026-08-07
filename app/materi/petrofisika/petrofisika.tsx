import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoundTouchableOpacity from "../../../components/SoundTouchableOpacity";
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
      image: require("../../../assets/icons/icon-petrophysics.png"),
      judul: language === "id" ? "Seri 1: Routine Core Analysis" : "Series 1: Routine Core Analysis",
      sub:
        language === "id"
          ? "Porositas, Permeabilitas & Saturasi Air"
          : "Porosity, Permeability & Water Saturation",
      path: "/materi/petrofisika/seriMateri?seri=seri-1",
    },
    {
      id: 2,
      image: require("../../../assets/icons/icon-petrophysics.png"),
      judul: language === "id" ? "Seri 2: Special Core Analysis" : "Series 2: Special Core Analysis",
      sub:
        language === "id"
          ? "Wettability, IFT, Capillary Pressure & Kr"
          : "Wettability, IFT, Capillary Pressure & Kr",
      path: "/materi/petrofisika/seriMateri?seri=seri-2",
    },
    {
      id: 3,
      image: require("../../../assets/icons/icon-petrophysics.png"),
      judul: language === "id" ? "Seri 3: Digital Core Analysis" : "Series 3: Digital Core Analysis",
      sub:
        language === "id"
          ? "Digital Rock Physics, Simulasi & Software"
          : "Digital Rock Physics, Simulation & Software",
      path: "/materi/petrofisika/seriMateri?seri=seri-3",
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
              ? "Kembali ke Petrofisika"
              : "Back to Petrophysics"}
          </Text>
        </SoundTouchableOpacity>

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