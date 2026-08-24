import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT TOAST DAN CONFIG URL
import Toast from "react-native-toast-message";
import API_URL, { apiFetch } from "../../config";

// 💡 IMPORT CONTEXT BAHASA & TEMA GLOBAL REAL-TIME
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function App() {
  // --- BAHASA & TEMA GLOBAL REAL-TIME ---
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =================================================================
  // LOGIC: CEK STATUS SERVER (PHP NGROK)
  // =================================================================
  const [isServerAlive, setIsServerAlive] = useState<boolean | null>(null);

  useEffect(() => {
    cekKoneksiServer();
  }, []);

  const cekKoneksiServer = async () => {
    try {
      // Menembak file cek-status.php di server XAMPP via gerbang Ngrok
      const response = await apiFetch(`${API_URL}/cek-status.php`, { method: "GET" });
      if (response.ok) {
        setIsServerAlive(true); // Server hidup, lolos masuk ke halaman login
      } else {
        throw new Error();
      }
    } catch (error) {
      setIsServerAlive(false); // Server mati / Ngrok mati
      Alert.alert(
        language === "id" ? "Server Offline ⚙️" : "Server Offline ⚙️",
        language === "id"
          ? "Mohon maaf, server sedang dalam perbaikan atau dimatikan sementara. Silakan coba lagi nanti."
          : "Sorry, the server is under maintenance or temporarily shut down. Please try again later.",
        [{ text: language === "id" ? "Coba Lagi" : "Try Again", onPress: () => cekKoneksiServer() }]
      );
    }
  };
  // =================================================================

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: language === "id" ? "Semua kolom wajib diisi!" : "All fields are required!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: language === "id" ? "Format email tidak valid!" : "Invalid email format!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch(`${API_URL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const json = await response.json();

      if (json.success) {
        const sessionUser = {
          ...(json.user || {}),
          username: json.user?.username || "",
          email: json.user?.email || email,
          auth_token: json.user?.auth_token || "",
        };
        await AsyncStorage.setItem("userSession", JSON.stringify(sessionUser));

        Toast.show({
          type: "success",
          text1: language === "id" ? "Sukses" : "Success",
          text2: json.message,
          position: "top",
          visibilityTime: 2000,
        });

        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1500);
      } else {
        Toast.show({
          type: "error",
          text1: language === "id" ? "Login Gagal" : "Login Failed",
          text2: json.message,
          position: "top",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          language === "id"
            ? "Terjadi kesalahan jaringan atau server mati!"
            : "Network error or server is down!",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =================================================================
  // RENDERING CONDITION
  // =================================================================
  if (isServerAlive === null) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: colors.subtext }}>
          {language === "id" ? "Memeriksa koneksi server..." : "Checking server connection..."}
        </Text>
      </View>
    );
  }

  if (isServerAlive === false) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>⚠️ SERVER MAINTENANCE ⚠️</Text>
        <Text style={{ textAlign: "center", paddingHorizontal: 32, marginTop: 10, color: colors.subtext, lineHeight: 20 }}>
          {language === "id"
            ? "Aplikasi tidak dapat digunakan sementara waktu karena server pusat sedang mati atau dalam perbaikan."
            : "The app cannot be used temporarily because the central server is down or under maintenance."}
        </Text>
        <SoundTouchableOpacity style={styles.retryButton} onPress={cekKoneksiServer}>
          <Text style={styles.loginButtonText}>
            {language === "id" ? "Coba Hubungkan Lagi" : "Try Connecting Again"}
          </Text>
        </SoundTouchableOpacity>
      </View>
    );
  }
  // =================================================================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/ambativasi-icon.png")}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: colors.text }]}>Ambativasi</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {language === "id" ? "Masuk untuk melanjutkan" : "Sign in to continue"}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.subtext}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View
          style={[
            styles.passwordContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.subtext}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <SoundTouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={colors.subtext}
            />
          </SoundTouchableOpacity>
        </View>

        <SoundTouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
          <Text style={[styles.forgotPassword, { color: colors.isDark ? "#60A5FA" : "#2563EB" }]}>
            {language === "id" ? "Lupa Kata Sandi?" : "Forgot Password?"}
          </Text>
        </SoundTouchableOpacity>

        <SoundTouchableOpacity
          style={[
            styles.loginButton,
            isSubmitting && [
              styles.buttonDisabled,
              { backgroundColor: colors.isDark ? "#1E3A8A" : "#93C5FD" },
            ],
          ]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>
              {language === "id" ? "Masuk" : "Sign In"}
            </Text>
          )}
        </SoundTouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={{ color: colors.subtext }}>
            {language === "id" ? "Belum punya akun? " : "Don't have an account? "}
          </Text>
          <SoundTouchableOpacity onPress={() => router.push("/auth/register")}>
            <Text style={[styles.registerText, { color: colors.isDark ? "#60A5FA" : "#2563EB" }]}>
              {language === "id" ? "Daftar" : "Sign Up"}
            </Text>
          </SoundTouchableOpacity>
        </View>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    marginBottom: 10,
    width: 100,
    height: 100,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },

  form: {
    width: "100%",
  },

  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 16,
    borderWidth: 1,
    fontSize: 15,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    height: 55,
    marginBottom: 16,
    borderWidth: 1,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 15,
  },

  eyeButton: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  forgotPassword: {
    textAlign: "right",
    marginBottom: 24,
    fontWeight: "500",
  },

  loginButton: {
    backgroundColor: "#2563EB",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  registerText: {
    fontWeight: "bold",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
  },
  retryButton: {
    backgroundColor: "#2563EB",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
  },
});
