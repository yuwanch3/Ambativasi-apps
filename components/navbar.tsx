import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import SoundTouchableOpacity from "../components/SoundTouchableOpacity";
// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

interface NavbarProps {
  onOpenSidebar: () => void;
  userData: { username: string; email: string } | null;
  profileImage: string | null;
  onNavigateProfile?: () => void; // 💡 TAMBAHAN PROPS OPASIONAL UNTUK TRIGGER MODAL
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  userData,
  profileImage,
  onNavigateProfile,
}) => {
  // 💡 AMBIL WARNA TEMA & BAHASA REAL-TIME
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleProfilePress = () => {
    if (onNavigateProfile) {
      onNavigateProfile();
    } else {
      router.push("/profile");
    }
  };

  return (
    <View
      style={[
        styles.navbar,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <SoundTouchableOpacity style={styles.navButton} onPress={onOpenSidebar}>
        <Ionicons name="menu" size={26} color={colors.text} />
      </SoundTouchableOpacity>

      <Text style={[styles.navbarTitle, { color: colors.text }]}>Ambativasi</Text>

      <SoundTouchableOpacity
        style={styles.profileAvatar}
        onPress={handleProfilePress}
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.avatarImageNavbar}
          />
        ) : (
          <Text style={styles.avatarText}>
            {userData?.username
              ? userData.username.charAt(0).toUpperCase()
              : "U"}
          </Text>
        )}
      </SoundTouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navButton: { padding: 4, width: 40 },
  navbarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  avatarImageNavbar: {
    width: "100%",
    height: "100%",
  },
});