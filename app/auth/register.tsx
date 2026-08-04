import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT TOAST DAN CONFIG CENTRAL URL
import Toast from "react-native-toast-message";
import API_URL, { apiFetch } from "../../config";

// 💡 IMPORT CONTEXT BAHASA & TEMA GLOBAL REAL-TIME
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function App() {
  // --- BAHASA & TEMA GLOBAL REAL-TIME ---
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validasi input kosong
    if (!username || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: language === "id" ? "Semua kolom wajib diisi!" : "All fields are required!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    // Validasi format email
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

    // Validasi panjang password
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          language === "id"
            ? "Password minimal harus 6 karakter!"
            : "Password must be at least 6 characters!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch(`${API_URL}/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Toast.show({
          type: "success",
          text1: language === "id" ? "Sukses" : "Success",
          text2: json.message,
          position: "top",
          visibilityTime: 2000,
        });

        setTimeout(() => {
          router.replace("/auth/login");
        }, 1500);
      } else {
        Toast.show({
          type: "error",
          text1: language === "id" ? "Gagal" : "Failed",
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
            ? "Terjadi kesalahan jaringan atau IP salah!"
            : "Network error or wrong IP address!",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/icon-keren.png")}
          style={styles.logo}
        />
        <Text style={[styles.title, { color: colors.text }]}>Ambativasi</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {language === "id" ? "Daftar untuk melanjutkan" : "Sign Up to continue"}
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
          placeholder={language === "id" ? "Nama Pengguna" : "Username"}
          placeholderTextColor={colors.subtext}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

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
            placeholder={language === "id" ? "Kata Sandi" : "Password"}
            placeholderTextColor={colors.subtext}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={colors.subtext}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
          <Text style={[styles.forgotPassword, { color: colors.isDark ? "#60A5FA" : "#2563EB" }]}>
            {language === "id" ? "Lupa Kata Sandi?" : "Forgot Password?"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.registerButton,
            isSubmitting && [
              styles.buttonDisabled,
              { backgroundColor: colors.isDark ? "#1E3A8A" : "#93C5FD" },
            ],
          ]}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>
              {language === "id" ? "Daftar" : "Sign Up"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={{ color: colors.subtext }}>
            {language === "id" ? "Sudah punya akun? " : "Have an account? "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={[styles.registerText, { color: colors.isDark ? "#60A5FA" : "#2563EB" }]}>
              {language === "id" ? "Masuk" : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
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

  registerButton: {
    backgroundColor: "#2563EB",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  registerContainer: {
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
});