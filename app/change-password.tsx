import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SoundTouchableOpacity from "../components/SoundTouchableOpacity";

import API_URL, { apiFetch } from "../config";

import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";

import Toast from "react-native-toast-message";

import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const { language, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const showWarning = (title: string, message: string) => {
    setWarning({ title, message });
  };

  const checkSession = async () => {
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
          `${API_URL}/get-profile.php?email=${encodeURIComponent(parsedSession.email)}`,
        );
        const data = await response.json();
        if (data.status === "success" && data.profile_image) {
          setProfileImage(`${API_URL}/${data.profile_image}`);
        }
      } catch (e) {
        console.log("Gagal memuat foto profil", e);
      }
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

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        language === "id"
          ? "Lengkapi semua kolom kata sandi!"
          : "Please fill in all password fields!",
      );
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        t("password_min_length"),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        t("password_not_match"),
      );
      return;
    }

    if (oldPassword === newPassword) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        t("password_same_as_old"),
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiFetch(`${API_URL}/change-password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData?.email,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch {
        showWarning(
          language === "id" ? "Error Server" : "Server Error",
          language === "id"
            ? "Respon dari server tidak valid!"
            : "Invalid server response!",
        );
        return;
      }

      if (result.status === "success" || result.success) {
        Toast.show({
          type: "success",
          text1: language === "id" ? "Sukses" : "Success",
          text2:
            language === "id"
              ? "Kata sandi kamu berhasil diperbarui!"
              : "Your password has been updated successfully!",
          position: "top",
          visibilityTime: 2500,
        });

        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showWarning(
          language === "id" ? "Gagal" : "Failed",
          result.message ||
            (language === "id"
              ? "Kata sandi lama tidak sesuai!"
              : "Incorrect old password!"),
        );
      }
    } catch (error) {
      console.log("Error update password:", error);
      showWarning(
        language === "id" ? "Error Koneksi" : "Connection Error",
        language === "id"
          ? "Gagal memperbarui kata sandi."
          : "Failed to update password.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      checkSession();
    }, []),
  );

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
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* NAVBAR ATAS MODULAR */}
      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={userData}
        profileImage={profileImage}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER JUDUL */}
        <View style={styles.body}>
          {/* KETERANGAN DI ATAS FORM */}
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("change_password_subtitle")}
          </Text>

          {/* INPUT KATA SANDI LAMA */}
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colors.subtext}
            />
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("current_password")}
              placeholderTextColor={colors.subtext}
              secureTextEntry={!showOldPass}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <SoundTouchableOpacity
              style={styles.eyeIconWrapper}
              onPress={() => setShowOldPass(!showOldPass)}
            >
              <Ionicons
                name={showOldPass ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.subtext}
              />
            </SoundTouchableOpacity>
          </View>

          {/* INPUT KATA SANDI BARU */}
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons name="key-outline" size={18} color={colors.subtext} />
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("new_password_new")}
              placeholderTextColor={colors.subtext}
              secureTextEntry={!showNewPass}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <SoundTouchableOpacity
              style={styles.eyeIconWrapper}
              onPress={() => setShowNewPass(!showNewPass)}
            >
              <Ionicons
                name={showNewPass ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.subtext}
              />
            </SoundTouchableOpacity>
          </View>

          {/* INPUT KONFIRMASI SANDI BARU */}
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={colors.subtext}
            />
            <TextInput
              style={[styles.inputField, { color: colors.text }]}
              placeholder={t("confirm_new_password")}
              placeholderTextColor={colors.subtext}
              secureTextEntry={!showConfirmPass}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <SoundTouchableOpacity
              style={styles.eyeIconWrapper}
              onPress={() => setShowConfirmPass(!showConfirmPass)}
            >
              <Ionicons
                name={showConfirmPass ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.subtext}
              />
            </SoundTouchableOpacity>
          </View>

          <SoundTouchableOpacity
            style={[styles.btnPrimary, submitting && { opacity: 0.7 }]}
            onPress={handleSavePassword}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>{t("save_password")}</Text>
            )}
          </SoundTouchableOpacity>
        </View>
      </ScrollView>

      {/* SIDEBAR / DRAWER MODULAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={userData}
        profileImage={profileImage}
        onLogout={handleLogout}
      />

      {/* MODAL WARNING */}
      <Modal
        visible={warning !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setWarning(null)}
      >
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
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Ionicons
                  name="warning-outline"
                  size={24}
                  color="#F59E0B"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {warning?.title ||
                    (language === "id" ? "Perhatian" : "Warning")}
                </Text>
              </View>
              <SoundTouchableOpacity onPress={() => setWarning(null)}>
                <Ionicons name="close" size={22} color={colors.subtext} />
              </SoundTouchableOpacity>
            </View>

            <Text style={[styles.modalMessage, { color: colors.subtext }]}>
              {warning?.message}
            </Text>

            <View style={styles.modalActions}>
              <SoundTouchableOpacity
                style={[styles.btnModalConfirm, { backgroundColor: "#2563EB" }]}
                onPress={() => setWarning(null)}
              >
                <Text style={styles.btnModalConfirmText}>
                  {language === "id" ? "Oke" : "OK"}
                </Text>
              </SoundTouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  pageHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTextWrap: { alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "bold", textAlign: "center" },
  body: {
    padding: 20,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  inputField: {
    flex: 1,
    height: 52,
    fontSize: 15,
  },
  eyeIconWrapper: { padding: 4 },
  btnPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  btnPrimaryText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
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
