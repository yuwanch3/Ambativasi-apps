import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. IMPORT TOAST DAN CONFIG CENTRAL URL
import Toast from "react-native-toast-message";
import API_URL, { apiFetch } from "../../config";

// 💡 IMPORT CONTEXT BAHASA & TEMA GLOBAL REAL-TIME
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function ResetPasswordScreen() {
  // --- BAHASA & TEMA GLOBAL REAL-TIME ---
  const { language } = useLanguage();
  const { colors } = useTheme();

  const { email, token } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
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

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          language === "id"
            ? "Konfirmasi password tidak cocok!"
            : "Password confirmation does not match!",
        position: "top",
        visibilityTime: 2500,
      });
      return;
    }

    try {
      const response = await apiFetch(`${API_URL}/update-password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          token: token,
        }),
      });

      const json = await response.json();

      if (json.success) {
        Toast.show({
          type: "success",
          text1: language === "id" ? "Sukses" : "Success",
          text2:
            language === "id"
              ? "Password berhasil diubah!"
              : "Password updated successfully!",
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          language === "id"
            ? "Gagal terhubung ke server backend."
            : "Failed to connect to backend server.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={[styles.title, { color: colors.text }]}>
        {language === "id" ? "Buat Password Baru" : "Create New Password"}
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>
        {language === "id"
          ? "Masukkan password baru untuk email:"
          : "Enter a new password for email:"}
        {"\n"}
        {email}
      </Text>

      <View
        style={[
          styles.passwordContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.passwordInput, { color: colors.text }]}
          placeholder={language === "id" ? "Password Baru" : "New Password"}
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

      <View
        style={[
          styles.passwordContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.passwordInput, { color: colors.text }]}
          placeholder={
            language === "id"
              ? "Konfirmasi Password Baru"
              : "Confirm New Password"
          }
          placeholderTextColor={colors.subtext}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={22}
            color={colors.subtext}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>
          {language === "id" ? "Simpan & Login" : "Save & Sign In"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
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
  button: {
    backgroundColor: "#2563EB",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});