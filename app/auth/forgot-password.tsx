import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import SoundTouchableOpacity from "../../components/SoundTouchableOpacity";
import { SafeAreaView } from "react-native-safe-area-context";
import API_URL, { apiFetch } from "../../config";

// 💡 IMPORT TOAST DAN CONFIG CENTRAL URL
import Toast from "react-native-toast-message";

// 💡 IMPORT CONTEXT BAHASA & TEMA GLOBAL REAL-TIME
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function ForgotPasswordScreen() {
  // --- BAHASA & TEMA GLOBAL REAL-TIME ---
  const { language } = useLanguage();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  const handleResetPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: language === "id" ? "Silakan masukkan email Anda!" : "Please enter your email!",
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
      const response = await apiFetch(`${API_URL}/forgot-password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const json = await response.json();

      if (json.success) {
        setCountdown(60);

        Toast.show({
          type: "success",
          text1: language === "id" ? "Sukses" : "Success",
          text2: json.message,
          position: "top",
          visibilityTime: 2500,
        });

        setTimeout(() => {
          router.replace("/auth/login");
        }, 1800);
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
            ? "Terjadi kesalahan jaringan atau server PHP mati!"
            : "Network error or PHP server is down!",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || countdown > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === "id" ? "Reset Password" : "Reset Password"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {language === "id"
            ? "Masukkan email yang terdaftar untuk menerima link pembuatan password baru."
            : "Enter your registered email to receive a password reset link."}
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
          editable={!isButtonDisabled}
        />

        <SoundTouchableOpacity
          style={[
            styles.resetButton,
            isButtonDisabled && [
              styles.buttonDisabled,
              { backgroundColor: colors.isDark ? "#1E3A8A" : "#93C5FD" },
            ],
          ]}
          onPress={handleResetPassword}
          disabled={isButtonDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.resetButtonText}>
              {countdown > 0
                ? language === "id"
                  ? `Coba Lagi dalam ${countdown}s`
                  : `Try Again in ${countdown}s`
                : language === "id"
                ? "Kirim Instruksi"
                : "Send Instructions"}
            </Text>
          )}
        </SoundTouchableOpacity>

        <SoundTouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={[styles.backButtonText, { color: colors.isDark ? "#60A5FA" : "#2563EB" }]}>
            {language === "id" ? "Kembali ke Login" : "Back to Login"}
          </Text>
        </SoundTouchableOpacity>
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
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
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
  resetButton: {
    backgroundColor: "#2563EB",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resetButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backButton: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});