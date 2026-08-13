import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Notifications from "expo-notifications";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT TOAST NOTIFICATION
import Toast from "react-native-toast-message";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../../components/navbar";
import { Sidebar } from "../../components/sidebar";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

// 💡 ONLINE: Pastikan alamat Ngrok ini selalu sama dengan terowongan aktifmu
import API_URL, { apiFetch } from "../../config";

// 💡 KONFIGURASI HANDLER NOTIFIKASI EXPO (MUNCUL MESKIPUN APP DIBUKA / DICLOSE)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ReminderItem {
  id: string;
  hour: number;
  minute: number;
  active: boolean;
  notificationId?: string;
}

export default function PengaturanScreen() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { themeMode, setThemeMode, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // --- STATE LAYOUT & SIDEBAR ---
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // --- STATE PENGATURAN NOTIFIKASI MULTI-REMINDER ---
  const [isDailyReminder, setIsDailyReminder] = useState(true);
  const [reminders, setReminders] = useState<ReminderItem[]>([
    { id: "1", hour: 8, minute: 0, active: true },
  ]);
  const [cacheSize, setCacheSize] = useState("0.0 KB");

  // --- STATE TEMPORARY INPUT WAKTU REMINDER BARU ---
  const [tempHour, setTempHour] = useState("08");
  const [tempMinute, setTempMinute] = useState("00");

  // --- STATE MODAL INTERAKSI ---
  const [activeModal, setActiveModal] = useState<
    | "theme"
    | "language"
    | "notification"
    | "clear_cache"
    | null
  >(null);

  useFocusEffect(
    React.useCallback(() => {
      checkSession();
      loadSettings();
      requestNotificationPermissions();
    }, []),
  );

  // 💡 MINTA IZIN NOTIFIKASI DARI OS HP & DAFTARKAN CHANNEL ANDROID
  const requestNotificationPermissions = async () => {
    try {
      if (Platform.OS === "android") {
        // 💡 Hapus channel versi lama (sound channel tidak bisa diubah setelah dibuat
        // sekali di Android). Channel baru dibuat fresh supaya sound "ding" aktif.
        try {
          await Notifications.deleteNotificationChannelAsync(
            "study-reminder-channel-v4",
          );
        } catch (e) {
          console.log("Channel lama tidak ada / gagal dihapus", e);
        }

        await Notifications.setNotificationChannelAsync(
          "study-reminder-channel-v5",
          {
            name: "Pengingat Belajar",
            importance: Notifications.AndroidImportance.MAX,
            sound: "ding", // 👈 File suara mp3 tanpa ekstensi
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#16A34A",
          },
        );
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    } catch (e) {
      console.log("Gagal meminta izin notifikasi / mendaftarkan channel", e);
    }
  };

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("../auth/login");
      } else {
        const parsedSession = JSON.parse(session);
        setUserData({
          username: parsedSession.username || "User",
          email: parsedSession.email || "",
        });

        // Ambil data foto profil terbaru dari database MySQL
        try {
          const response = await apiFetch(`${API_URL}/get-profile.php?email=${parsedSession.email}`,
          );
          const data = await response.json();

          if (data.status === "success" && data.profile_image) {
            setProfileImage(`${API_URL}/${data.profile_image}`);
          } else {
            setProfileImage(null);
          }
        } catch (e) {
          console.log("Gagal memuat foto profil", e);
        }

        setLoading(false);
      }
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("../auth/login");
    }
  };

  // 💡 MENGHITUNG UKURAN CACHE SEMENTARA SECARA REAL-TIME DARI FILE SYSTEM
  const calculateCacheSize = async () => {
    try {
      if (!FileSystem.cacheDirectory) {
        setCacheSize("0.0 KB");
        return;
      }
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.cacheDirectory,
      );
      let totalBytes = 0;

      for (const file of files) {
        const fileUri = `${FileSystem.cacheDirectory}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists && !fileInfo.isDirectory && fileInfo.size) {
          totalBytes += fileInfo.size;
        }
      }

      if (totalBytes === 0) {
        setCacheSize("0.0 KB");
      } else if (totalBytes < 1024 * 1024) {
        setCacheSize(`${(totalBytes / 1024).toFixed(1)} KB`);
      } else {
        setCacheSize(`${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch (e) {
      console.log("Gagal menghitung ukuran cache", e);
      setCacheSize("0.0 KB");
    }
  };

  // 💡 MENGHAPUS SELURUH FILE CACHE DARI SYSTEM TANPA MERUSAK SESSION/PENGATURAN
  const clearAppCache = async () => {
    try {
      if (FileSystem.cacheDirectory) {
        const files = await FileSystem.readDirectoryAsync(
          FileSystem.cacheDirectory,
        );
        for (const file of files) {
          await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${file}`, {
            idempotent: true,
          });
        }
      }

      // Hapus data cache temporary AsyncStorage jika ada (Menjaga userSession & preferensi)
      const allKeys = await AsyncStorage.getAllKeys();
      const essentialKeys = [
        "userSession",
        "setting_reminder",
        "setting_reminders_list",
        "app_language",
        "app_theme",
        "language",
        "theme",
      ];
      const cacheKeys = allKeys.filter(
        (key) =>
          !essentialKeys.includes(key) &&
          (key.startsWith("cache_") || key.includes("temp")),
      );
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }

      await calculateCacheSize();
    } catch (e) {
      console.log("Gagal membersihkan cache", e);
    }
  };

  const loadSettings = async () => {
    try {
      const savedReminder = await AsyncStorage.getItem("setting_reminder");
      if (savedReminder !== null) setIsDailyReminder(JSON.parse(savedReminder));

      const savedRemindersList = await AsyncStorage.getItem(
        "setting_reminders_list",
      );
      if (savedRemindersList !== null) {
        setReminders(JSON.parse(savedRemindersList));
      }

      // Hitung ukuran cache riil
      await calculateCacheSize();
    } catch (e) {
      console.log("Gagal memuat preferensi pengaturan", e);
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

  // 💡 SCHEDULE ALARM NOTIFIKASI KE SISTEM HP VIA EXPO NOTIFICATIONS
  const syncNotificationsWithSystem = async (
    reminderList: ReminderItem[],
    masterOn: boolean,
  ) => {
    try {
      // Batalkan semua notifikasi terdahulu agar tidak duplikat
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!masterOn) return;

      for (const item of reminderList) {
        if (item.active) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title:
                language === "id"
                  ? "Waktunya Belajar! 📖"
                  : "Time to Study! 📖",
              body:
                language === "id"
                  ? "Yuk luangkan waktu sebentar untuk belajar hari ini."
                  : "Let's take a moment to study for today.",
              sound: "ding", // 👈 Panggil suara custom
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: item.hour,
              minute: item.minute,
              channelId: "study-reminder-channel-v5", // 👈 Terhubung ke Notification Channel Android
            },
          });
        }
      }
    } catch (err) {
      console.log("Gagal menjadwalkan notifikasi sistem", err);
    }
  };

  const handleMasterToggleReminder = async (val: boolean) => {
    setIsDailyReminder(val);
    await AsyncStorage.setItem("setting_reminder", JSON.stringify(val));
    await syncNotificationsWithSystem(reminders, val);
  };

  const handleAddReminder = async () => {
    if (reminders.length >= 3) {
      Toast.show({
        type: "error",
        text1: language === "id" ? "Batas Maksimal" : "Maximum Limit",
        text2:
          language === "id"
            ? "Kamu hanya dapat menambahkan maksimal 3 jadwal pengingat!"
            : "You can only set a maximum of 3 daily reminders!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    const h = parseInt(tempHour, 10);
    const m = parseInt(tempMinute, 10);

    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Toast.show({
        type: "error",
        text1: language === "id" ? "Format Waktu Salah" : "Invalid Time Format",
        text2:
          language === "id"
            ? "Harap masukkan Jam (00-23) dan Menit (00-59) dengan benar!"
            : "Please enter valid Hour (00-23) and Minute (00-59)!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    const newReminder: ReminderItem = {
      id: Date.now().toString(),
      hour: h,
      minute: m,
      active: true,
    };

    const updatedList = [...reminders, newReminder];
    setReminders(updatedList);
    await AsyncStorage.setItem(
      "setting_reminders_list",
      JSON.stringify(updatedList),
    );

    if (isDailyReminder) {
      await syncNotificationsWithSystem(updatedList, true);
    }

    Toast.show({
      type: "success",
      text1: language === "id" ? "Sukses" : "Success",
      text2:
        language === "id"
          ? "Jadwal pengingat baru berhasil ditambahkan!"
          : "New reminder added successfully!",
      position: "top",
      visibilityTime: 2500,
    });
  };

  const handleDeleteReminder = async (id: string) => {
    const updatedList = reminders.filter((r) => r.id !== id);
    setReminders(updatedList);
    await AsyncStorage.setItem(
      "setting_reminders_list",
      JSON.stringify(updatedList),
    );

    if (isDailyReminder) {
      await syncNotificationsWithSystem(updatedList, true);
    }
  };

  const handleToggleSingleReminder = async (id: string, val: boolean) => {
    const updatedList = reminders.map((r) =>
      r.id === id ? { ...r, active: val } : r,
    );
    setReminders(updatedList);
    await AsyncStorage.setItem(
      "setting_reminders_list",
      JSON.stringify(updatedList),
    );

    if (isDailyReminder) {
      await syncNotificationsWithSystem(updatedList, true);
    }
  };

  const handleSelectTheme = (mode: "terang" | "gelap" | "sistem") => {
    setThemeMode(mode);
    setActiveModal(null);
  };

  const handleSelectLanguage = async (lang: "id" | "en") => {
    await setLanguage(lang);
    setActiveModal(null);
  };

  // 💡 HAPUS ALERT.ALERT BAWAAN -> GANTI DENGAN MODAL KUSTOM
  const handleClearCache = () => {
    setActiveModal("clear_cache");
  };

  const confirmClearCache = async () => {
    await clearAppCache();
    setActiveModal(null);
    Toast.show({
      type: "success",
      text1: language === "id" ? "Sukses" : "Success",
      text2:
        language === "id"
          ? "Cache aplikasi berhasil dibersihkan kawan!"
          : "App cache cleared successfully!",
      position: "top",
      visibilityTime: 2500,
    });
  };

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

  const activeOptionStyle = {
    borderColor: colors.isDark ? "#4ADE80" : "#16A34A",
    backgroundColor: colors.isDark ? "#064E3B" : "#F0FDF4",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* ==================== NAVBAR ATAS ==================== */}
      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={userData}
        profileImage={profileImage}
      />

      {/* ==================== KONTEN UTAMA ==================== */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ==================== SEKSI 1: AKUN & KEAMANAN ==================== */}
        <Text style={[styles.sectionHeader, { color: colors.subtext }]}>
          {t("account_security")}
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push("/change-email")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#1E3A8A" : "#EFF6FF" },
              ]}
            >
              <Ionicons name="mail-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("change_email")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {userData?.email || t("change_email_sub")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push("/change-password")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#7F1D1D" : "#FEF2F2" },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("change_password")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {t("change_password_sub")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>
        </View>

        {/* ==================== SEKSI 2: TAMPILAN & BAHASA ==================== */}
        <Text style={[styles.sectionHeader, { color: colors.subtext }]}>
          {t("app_preferences")}
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => setActiveModal("theme")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#334155" : "#F1F5F9" },
              ]}
            >
              <Ionicons
                name="color-palette-outline"
                size={20}
                color={colors.isDark ? "#94A3B8" : "#475569"}
              />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("display_mode")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {themeMode === "terang"
                  ? t("light_mode")
                  : themeMode === "gelap"
                    ? t("dark_mode")
                    : t("system_mode")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => setActiveModal("language")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#14532D" : "#F0FDF4" },
              ]}
            >
              <Ionicons name="language-outline" size={20} color="#16A34A" />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("app_language")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {language === "id" ? t("indonesian") : t("english")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>
        </View>

        {/* ==================== SEKSI 3: NOTIFIKASI ==================== */}
        <Text style={[styles.sectionHeader, { color: colors.subtext }]}>
          {t("notifications")}
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => setActiveModal("notification")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#7C2D12" : "#FFF7ED" },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#EA580C"
              />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("daily_reminder")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {isDailyReminder
                  ? language === "id"
                    ? `${reminders.length} Jadwal Pengingat Aktif`
                    : `${reminders.length} Active Reminders`
                  : language === "id"
                    ? "Notifikasi Dinonaktifkan"
                    : "Notifications Disabled"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>
        </View>

        {/* ==================== SEKSI 4: PENYIMPANAN ==================== */}
        <Text style={[styles.sectionHeader, { color: colors.subtext }]}>
          {t("storage")}
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SoundTouchableOpacity style={styles.rowItem} onPress={handleClearCache}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#581C87" : "#FAF5FF" },
              ]}
            >
              <Ionicons name="trash-bin-outline" size={20} color="#9333EA" />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("clear_cache")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {cacheSize}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>
        </View>

        {/* ==================== SEKSI 5: BANTUAN & LEGALITAS ==================== */}
        <Text style={[styles.sectionHeader, { color: colors.subtext }]}>
          {t("help_docs")}
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push("/help-center")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#1E3A8A" : "#EFF6FF" },
              ]}
            >
              <Ionicons name="help-circle-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("faq")}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                {language === "id"
                  ? "Pertanyaan umum & hubungi dukungan"
                  : "FAQs & contact support"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push("/privacy-policy")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#14532D" : "#F0FDF4" },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#16A34A"
              />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t("privacy_policy")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <SoundTouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push("/terms")}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.isDark ? "#4C1D95" : "#F5F3FF" },
              ]}
            >
              <Ionicons name="document-text-outline" size={20} color="#7C3AED" />
            </View>
            <View style={styles.rowTextWrapper}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {language === "id" ? "Syarat & Ketentuan" : "Terms & Conditions"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </SoundTouchableOpacity>
        </View>

        {/* ==================== FOOTER VERSI ==================== */}
        <View style={styles.footerInfo}>
          <Text style={[styles.versionText, { color: colors.subtext }]}>
            Ambativasi App
          </Text>
          <Text style={[styles.versionNumber, { color: colors.subtext }]}>
            Versi 1.0.8 (Build 2026)
          </Text>
        </View>
      </ScrollView>

      {/* ==================== SIDEBAR / DRAWER MENU ==================== */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={userData}
        profileImage={profileImage}
        onLogout={handleLogout}
      />

      {/* ==================== MODAL: ATUR NOTIFIKASI REMINDER ==================== */}
      <Modal
        visible={activeModal === "notification"}
        transparent
        animationType="slide"
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text, marginBottom: 0 },
                ]}
              >
                {language === "id" ? "Pengingat Belajar" : "Study Reminder"}
              </Text>
              <SoundTouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </SoundTouchableOpacity>
            </View>

            {/* Master Switch Pengingat */}
            <View
              style={[
                styles.masterSwitchRow,
                { borderColor: colors.border, backgroundColor: colors.inputBg },
              ]}
            >
              <Text style={[styles.masterSwitchText, { color: colors.text }]}>
                {language === "id"
                  ? "Aktifkan Notifikasi"
                  : "Enable Notifications"}
              </Text>
              <Switch
                value={isDailyReminder}
                onValueChange={handleMasterToggleReminder}
                trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
                thumbColor={isDailyReminder ? "#16A34A" : "#F8FAFC"}
              />
            </View>

            {/* Daftar Reminders (Maksimal 3) */}
            <Text
              style={[
                styles.subLabel,
                { color: colors.subtext, marginTop: 14 },
              ]}
            >
              {language === "id"
                ? `Jadwal Pengingat (${reminders.length}/3):`
                : `Reminder Schedules (${reminders.length}/3):`}
            </Text>

            <ScrollView style={{ maxHeight: 180, marginVertical: 8 }}>
              {reminders.map((item) => {
                const formattedTime = `${item.hour.toString().padStart(2, "0")}:${item.minute.toString().padStart(2, "0")}`;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.reminderCardItem,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="alarm-outline"
                        size={22}
                        color="#EA580C"
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[
                          styles.reminderTimeText,
                          { color: colors.text },
                        ]}
                      >
                        {formattedTime} WIB
                      </Text>
                    </View>

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Switch
                        disabled={!isDailyReminder}
                        value={item.active}
                        onValueChange={(val) =>
                          handleToggleSingleReminder(item.id, val)
                        }
                        trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
                        thumbColor={item.active ? "#16A34A" : "#F8FAFC"}
                      />
                      <SoundTouchableOpacity
                        style={{ marginLeft: 10 }}
                        onPress={() => handleDeleteReminder(item.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </SoundTouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Form Tambah Waktu Alarm Baru jika < 3 */}
            {reminders.length < 3 && isDailyReminder && (
              <View
                style={[
                  styles.addTimeBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBg,
                  },
                ]}
              >
                <Text style={[styles.addTimeTitle, { color: colors.text }]}>
                  {language === "id"
                    ? "Tambah Jam Notifikasi"
                    : "Add Notification Time"}
                </Text>
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={tempHour}
                    onChangeText={setTempHour}
                  />
                  <Text style={[styles.timeColon, { color: colors.text }]}>
                    :
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={tempMinute}
                    onChangeText={setTempMinute}
                  />
                  <SoundTouchableOpacity
                    style={styles.btnAddTime}
                    onPress={handleAddReminder}
                  >
                    <Ionicons name="add" size={24} color="#FFF" />
                  </SoundTouchableOpacity>
                </View>
              </View>
            )}

            <SoundTouchableOpacity
              style={[styles.btnPrimary, { marginTop: 12 }]}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.btnPrimaryText}>
                {language === "id" ? "Selesai" : "Done"}
              </Text>
            </SoundTouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: BERSIHKAN CACHE (KUSTOM & RESPONSIF METAMORFISME TEMA) ==================== */}
      <Modal
        visible={activeModal === "clear_cache"}
        transparent
        animationType="fade"
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.text, marginBottom: 0 },
                ]}
              >
                {t("clear_cache")}
              </Text>
              <SoundTouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.subtext} />
              </SoundTouchableOpacity>
            </View>

            <Text
              style={{
                color: colors.subtext,
                fontSize: 14,
                lineHeight: 22,
                marginVertical: 12,
              }}
            >
              {language === "id"
                ? "Apakah kamu yakin ingin membersihkan data cache sementara aplikasi?"
                : "Are you sure you want to clear app temporary cache data?"}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <SoundTouchableOpacity
                style={[
                  styles.btnModalCancel,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setActiveModal(null)}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {t("cancel")}
                </Text>
              </SoundTouchableOpacity>

              <SoundTouchableOpacity
                style={styles.btnModalDanger}
                onPress={confirmClearCache}
              >
                <Text
                  style={{ color: "#FFF", fontWeight: "bold", fontSize: 14 }}
                >
                  {t("clear_cache")}
                </Text>
              </SoundTouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: MODE TAMPILAN ==================== */}
      <Modal visible={activeModal === "theme"} transparent animationType="fade">
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("select_display_mode")}
            </Text>

            <SoundTouchableOpacity
              style={[
                styles.selectOption,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                themeMode === "terang" && activeOptionStyle,
              ]}
              onPress={() => handleSelectTheme("terang")}
            >
              <Text style={[styles.selectOptionText, { color: colors.text }]}>
                {t("light_mode")}
              </Text>
              {themeMode === "terang" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.isDark ? "#4ADE80" : "#16A34A"}
                />
              )}
            </SoundTouchableOpacity>

            <SoundTouchableOpacity
              style={[
                styles.selectOption,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                themeMode === "gelap" && activeOptionStyle,
              ]}
              onPress={() => handleSelectTheme("gelap")}
            >
              <Text style={[styles.selectOptionText, { color: colors.text }]}>
                {t("dark_mode")}
              </Text>
              {themeMode === "gelap" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.isDark ? "#4ADE80" : "#16A34A"}
                />
              )}
            </SoundTouchableOpacity>

            <SoundTouchableOpacity
              style={[
                styles.selectOption,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                themeMode === "sistem" && activeOptionStyle,
              ]}
              onPress={() => handleSelectTheme("sistem")}
            >
              <Text style={[styles.selectOptionText, { color: colors.text }]}>
                {t("system_mode")}
              </Text>
              {themeMode === "sistem" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.isDark ? "#4ADE80" : "#16A34A"}
                />
              )}
            </SoundTouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: BAHASA ==================== */}
      <Modal
        visible={activeModal === "language"}
        transparent
        animationType="fade"
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("select_app_language")}
            </Text>
            <SoundTouchableOpacity
              style={[
                styles.selectOption,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                language === "id" && activeOptionStyle,
              ]}
              onPress={() => handleSelectLanguage("id")}
            >
              <Text style={[styles.selectOptionText, { color: colors.text }]}>
                {t("indonesian")}
              </Text>
              {language === "id" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.isDark ? "#4ADE80" : "#16A34A"}
                />
              )}
            </SoundTouchableOpacity>
            <SoundTouchableOpacity
              style={[
                styles.selectOption,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                language === "en" && activeOptionStyle,
              ]}
              onPress={() => handleSelectLanguage("en")}
            >
              <Text style={[styles.selectOptionText, { color: colors.text }]}>
                {t("english")}
              </Text>
              {language === "en" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.isDark ? "#4ADE80" : "#16A34A"}
                />
              )}
            </SoundTouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: FAQ ==================== */}
      {/* ==================== MODAL: PRIVASI ==================== */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowTextWrapper: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
  footerInfo: {
    alignItems: "center",
    marginVertical: 28,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  versionNumber: {
    fontSize: 12,
    marginTop: 2,
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
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },
  masterSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  masterSwitchText: {
    fontSize: 15,
    fontWeight: "600",
  },
  reminderCardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  reminderTimeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addTimeBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  addTimeTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timeInput: {
    width: 50,
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  timeColon: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  btnAddTime: {
    backgroundColor: "#16A34A",
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaryText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  btnModalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  btnModalDanger: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  selectOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectOptionText: {
    fontSize: 15,
    fontWeight: "600",
  },
});