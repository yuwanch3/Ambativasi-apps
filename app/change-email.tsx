import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import SoundTouchableOpacity from "../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL, { apiFetch } from "../config";

import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";

import Toast from "react-native-toast-message";

import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const CODE_COOLDOWN_SECONDS = 60;
const DRAFT_KEY = "changeEmailDraft";

export default function ChangeEmailScreen() {
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

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code" | "new_email">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownEnd, setCountdownEnd] = useState(0);
  const timerRef = useRef<any>(null);
  const [warning, setWarning] = useState<{ title: string; message: string } | null>(
    null,
  );

  const replacePlaceholders = (template: string, values: Record<string, string>) => {
    let out = template;
    for (const [key, val] of Object.entries(values)) {
      out = out.replace(new RegExp(`\\{${key}\\}`, "g"), val);
    }
    return out;
  };

  const showWarning = (title: string, message: string) => {
    setWarning({ title, message });
  };

  const runCountdownTick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCountdown = (seconds: number = CODE_COOLDOWN_SECONDS) => {
    setCountdown(seconds);
    setCountdownEnd(Date.now() + seconds * 1000);
    runCountdownTick();
  };

  useEffect(() => {
    const draft = { stage, currentEmail, code, newEmail, countdownEnd };
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(() => {});
  }, [stage, currentEmail, code, newEmail, countdownEnd]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

      const draftRaw = await AsyncStorage.getItem(DRAFT_KEY);
      if (draftRaw) {
        try {
          const draft = JSON.parse(draftRaw);
          if (draft) {
            setStage(draft.stage || "email");
            setCurrentEmail(draft.currentEmail || parsedSession.email || "");
            setCode(draft.code || "");
            setNewEmail(draft.newEmail || "");
            if (draft.countdownEnd > Date.now()) {
              const remaining = Math.ceil((draft.countdownEnd - Date.now()) / 1000);
              setCountdown(remaining);
              setCountdownEnd(draft.countdownEnd);
              runCountdownTick();
            }
          }
        } catch (e) {
          console.log("Gagal membaca draft", e);
        }
      } else {
        setCurrentEmail(parsedSession.email || "");
      }

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
      await AsyncStorage.removeItem(DRAFT_KEY);
      await AsyncStorage.removeItem("userSession");
      router.replace("../auth/login");
    } catch (error) {
      console.log("Gagal menghapus session", error);
    }
  };

  const handleSendCode = async () => {
    const trimmed = currentEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailRegex.test(trimmed)) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        language === "id"
          ? "Masukkan alamat email terdaftar yang valid!"
          : "Please enter a valid registered email!",
      );
      return;
    }

    setSending(true);
    try {
      const response = await apiFetch(
        `${API_URL}/send-verification-code.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        },
      );
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
        startCountdown();
        setCurrentEmail(trimmed);
        setStage("code");
        setCode("");
        Toast.show({
          type: "success",
          text1: language === "id" ? "Kode Terkirim" : "Code Sent",
          text2: replacePlaceholders(t("code_sent_to"), { email: trimmed }),
          position: "top",
          visibilityTime: 3000,
        });
      } else {
        showWarning(
          language === "id" ? "Gagal" : "Failed",
          result.message ||
            (language === "id"
              ? "Email tidak terdaftar!"
              : "Email is not registered!"),
        );
      }
    } catch (error) {
      console.log("Error kirim kode:", error);
      showWarning(
        language === "id" ? "Error Koneksi" : "Connection Error",
        language === "id"
          ? "Gagal mengirim kode verifikasi."
          : "Failed to send verification code.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        t("enter_code_first"),
      );
      return;
    }

    setVerifying(true);
    try {
      const response = await apiFetch(`${API_URL}/verify-code.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, code: code.trim() }),
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
        setStage("new_email");
        Toast.show({
          type: "success",
          text1: language === "id" ? "Terverifikasi" : "Verified",
          text2: t("email_verified_continue"),
          position: "top",
          visibilityTime: 2500,
        });
      } else {
        showWarning(
          language === "id" ? "Kode Salah" : "Wrong Code",
          result.message ||
            (language === "id"
              ? "Kode verifikasi tidak valid atau sudah kedaluwarsa."
              : "Invalid or expired verification code."),
        );
      }
    } catch (error) {
      console.log("Error verifikasi kode:", error);
      showWarning(
        language === "id" ? "Error Koneksi" : "Connection Error",
        language === "id"
          ? "Gagal memverifikasi kode."
          : "Failed to verify code.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveNewEmail = async () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        language === "id"
          ? "Masukkan alamat email baru yang valid!"
          : "Please enter a valid new email address!",
      );
      return;
    }

    if (trimmedEmail === currentEmail) {
      showWarning(
        language === "id" ? "Perhatian" : "Warning",
        t("email_must_differ"),
      );
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch(`${API_URL}/update-email.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_email: currentEmail,
          new_email: trimmedEmail,
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
        const currentSessionRaw = await AsyncStorage.getItem("userSession");
        let sessionData = currentSessionRaw
          ? JSON.parse(currentSessionRaw)
          : {};
        sessionData.email = trimmedEmail;
        await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
        await AsyncStorage.removeItem(DRAFT_KEY);

        setUserData({
          username: userData?.username || "User",
          email: trimmedEmail,
        });

        Toast.show({
          type: "success",
          text1: language === "id" ? "Sukses" : "Success",
          text2:
            language === "id"
              ? "Alamat email berhasil diperbarui!"
              : "Email address updated successfully!",
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
              ? "Gagal memperbarui email."
              : "Failed to update email."),
        );
      }
    } catch (error) {
      console.log("Error update email:", error);
      showWarning(
        language === "id" ? "Error Koneksi" : "Connection Error",
        language === "id"
          ? "Gagal memperbarui email."
          : "Failed to update email.",
      );
    } finally {
      setSaving(false);
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
        <View
          style={[
            styles.pageHeader,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("change_email_title")}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* KETERANGAN DI ATAS FORM */}
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            {t("change_email_subtitle")}
          </Text>

          {/* LANGKAH 1: MASUKKAN EMAIL LAMA */}
          {stage === "email" && (
            <View>
              <Text style={[styles.stepSub, { color: colors.subtext }]}>
                {language === "id" ? "Langkah 1" : "Step 1"} —{" "}
                {t("current_email")}
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={colors.subtext} />
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t("current_email")}
                  placeholderTextColor={colors.subtext}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={currentEmail}
                  onChangeText={setCurrentEmail}
                />
              </View>

              <SoundTouchableOpacity
                style={[styles.btnPrimary, sending && { opacity: 0.7 }]}
                onPress={handleSendCode}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>
                    {t("send_verification_code")}
                  </Text>
                )}
              </SoundTouchableOpacity>

              <Text style={[styles.hint, { color: colors.subtext }]}>
                {language === "id"
                  ? "Kode verifikasi dikirim ke email terdaftar di atas untuk memastikan bahwa ini akun milikmu. Perlu beberapa menit."
                  : "A verification code will be sent to the registered email above to confirm that this account is yours. It may take a few minutes."}
              </Text>
            </View>
          )}

          {/* LANGKAH 2: MASUKKAN KODE VERIFIKASI */}
          {stage === "code" && (
            <View>
              <Text style={[styles.stepSub, { color: colors.subtext }]}>
                {language === "id" ? "Langkah 2" : "Step 2"} —{" "}
                {t("verification_code")}
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              >
                <Ionicons name="keypad-outline" size={18} color={colors.subtext} />
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t("verification_code_placeholder")}
                  placeholderTextColor={colors.subtext}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              <SoundTouchableOpacity
                style={[styles.btnPrimary, verifying && { opacity: 0.7 }]}
                onPress={handleVerifyCode}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>{t("verify_code_btn")}</Text>
                )}
              </SoundTouchableOpacity>

              <SoundTouchableOpacity
                style={styles.linkButton}
                onPress={handleSendCode}
                disabled={countdown > 0 || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={[styles.linkButtonText, { color: "#2563EB" }]}>
                    {countdown > 0
                      ? replacePlaceholders(t("resend_in"), {
                          s: String(countdown),
                        })
                      : t("resend_code")}
                  </Text>
                )}
              </SoundTouchableOpacity>
            </View>
          )}

          {/* LANGKAH 3: EMAIL BARU */}
          {stage === "new_email" && (
            <View>
              <Text style={[styles.stepSub, { color: colors.subtext }]}>
                {language === "id" ? "Langkah 3" : "Step 3"} —{" "}
                {t("enter_new_email")}
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={colors.subtext} />
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder={t("enter_new_email")}
                  placeholderTextColor={colors.subtext}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  onChangeText={setNewEmail}
                />
              </View>

              <SoundTouchableOpacity
                style={[styles.btnPrimary, saving && { opacity: 0.7 }]}
                onPress={handleSaveNewEmail}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>{t("save_new_email")}</Text>
                )}
              </SoundTouchableOpacity>
            </View>
          )}
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
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
    justifyContent: "center",
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
  headerSub: { fontSize: 12, textAlign: "center", marginTop: 2 },
  body: {
    padding: 20,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  stepSub: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
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
  btnPrimary: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
    textAlign: "center",
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