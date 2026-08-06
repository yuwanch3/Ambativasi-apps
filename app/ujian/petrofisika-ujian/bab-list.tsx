import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
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
import { SERI_PETROFISIKA } from "../../../src/data/materiPetrofisika";

export default function BabListScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams();
  const seriId = params.seri ? String(params.seri) : "seri-1";

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedExamPath, setSelectedExamPath] = useState<string>("");

  const seri = useMemo(
    () => SERI_PETROFISIKA.find((s) => s.id === seriId) || SERI_PETROFISIKA[0],
    [seriId]
  );

  const levels = useMemo(
    () =>
      seri.bab.map((bab, indeks) => ({
        id: indeks + 1,
        image: seri.image,
        judul: language === "id" ? bab.judulId : bab.judulEn,
        sub: language === "id" ? "Ujian BAB materi Petrofisika" : "Petrophysics chapter exam",
        path: `/ujian/petrofisika-ujian/fundamental/ujian-petrofisika?sumber_data=${bab.sumberData}&judul_bab=${encodeURIComponent(
          language === "id" ? bab.judulId : bab.judulEn
        )}&tipe_sumber=text`,
      })),
    [seri, language]
  );

  const handleOpenExamModal = (path: string) => {
    setSelectedExamPath(path);
    setIsExamModalOpen(true);
  };

  const handleStartExam = () => {
    setIsExamModalOpen(false);
    if (selectedExamPath) {
      router.push(selectedExamPath as any);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.mainContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            {language === "id" ? "Kembali ke Seri" : "Back to Series"}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === "id" ? seri.judulId : seri.judulEn}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
            {language === "id" ? "Pilih BAB untuk mulai ujian" : "Select a chapter to start"}
          </Text>

          {levels.map((level) => (
            <LevelCard
              key={level.id}
              item={level}
              onPress={handleOpenExamModal}
            />
          ))}
        </ScrollView>
      </View>

      <Modal visible={isExamModalOpen} transparent animationType="fade">
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={colors.isDark ? "#60A5FA" : "#2563EB"}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === "id" ? "Konfirmasi Soal" : "Quiz Confirmation"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsExamModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalMessage, { color: colors.subtext }]}>
              {language === "id"
                ? "Apakah anda yakin ingin mengerjakan latihan soal ini?"
                : "Are you sure you want to attempt this practice quiz?"}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.btnModalCancel,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setIsExamModalOpen(false)}
              >
                <Text style={[styles.btnModalCancelText, { color: colors.text }]}>
                  {language === "id" ? "Batal" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnModalConfirm, { backgroundColor: "#2563EB" }]}
                onPress={handleStartExam}
              >
                <Text style={styles.btnModalConfirmText}>
                  {language === "id" ? "Mulai Soal" : "Start Quiz"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  btnModalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  btnModalCancelText: {
    fontWeight: "600",
    fontSize: 14,
  },
  btnModalConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnModalConfirmText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
