import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoundTouchableOpacity from "../components/SoundTouchableOpacity";
// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
  userData: { username: string; email: string } | null;
  profileImage: string | null;
  onLogout: () => void;
  onNavigateDashboard?: () => void;
  onNavigateProfile?: () => void;
  onNavigateSettings?: () => void;
  onNavigateChat?: () => void; // 💡 PROPS BARU UNTUK TRIGGER MODAL PADA MENU CHAT AI
  onNavigateShareProgress?: () => void; // 💡 TRIGGER MODAL PADA MENU BAGIKAN PROGRESS
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  slideAnim,
  userData,
  profileImage,
  onLogout,
  onNavigateDashboard,
  onNavigateProfile,
  onNavigateSettings,
  onNavigateChat,
  onNavigateShareProgress,
}) => {
  // 💡 AMBIL WARNA TEMA & BAHASA REAL-TIME
  const { colors } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <View
      style={[styles.sidebarOverlay, { backgroundColor: colors.modalOverlay }]}
    >
      <SoundTouchableOpacity
        style={styles.sidebarCloseArea}
        onPress={onClose}
        activeOpacity={1}
      />
      <Animated.View
        style={[
          styles.sidebarContainer,
          {
            left: slideAnim,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sidebarContentWrapper}>
          {/* Header User */}
          <View style={[styles.sidebarHeader, { borderColor: colors.divider }]}>
            <View style={styles.sidebarUserWrapper}>
              <View
                style={[
                  styles.sidebarAvatar,
                  { backgroundColor: colors.isDark ? "#1E3A8A" : "#bed9fa" },
                ]}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatarImageSidebar}
                  />
                ) : (
                  <Text
                    style={[
                      styles.sidebarAvatarText,
                      { color: colors.isDark ? "#60A5FA" : "#2563EB" },
                    ]}
                  >
                    {userData?.username
                      ? userData.username.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                )}
              </View>
              <View style={styles.sidebarUserInfo}>
                <Text
                  style={[styles.sidebarName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {userData?.username || "User"}
                </Text>
                <Text
                  style={[styles.sidebarEmail, { color: colors.subtext }]}
                  numberOfLines={1}
                >
                  {userData?.email || ""}
                </Text>
              </View>
            </View>
            <SoundTouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={colors.subtext} />
            </SoundTouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.sidebarMenuContainer}>
            {/* 1. Dashboard */}
            <SoundTouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onNavigateDashboard) {
                  onNavigateDashboard();
                } else {
                  router.replace("/(tabs)");
                }
              }}
            >
              <Ionicons
                name="home-outline"
                size={20}
                color={colors.subtext}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("dashboard")}
              </Text>
            </SoundTouchableOpacity>

            {/* 2. Agent AI Chat (Menu Baru di Bawah Dashboard) */}
            <SoundTouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onNavigateChat) {
                  onNavigateChat();
                } else {
                  router.push("/chat" as any);
                }
              }}
            >
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={colors.subtext}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("ai_assistant")}
              </Text>
            </SoundTouchableOpacity>

            {/* 3. Profile */}
            <SoundTouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onNavigateProfile) {
                  onNavigateProfile();
                } else {
                  router.push("/profile");
                }
              }}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.subtext}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("my_profile")}
              </Text>
            </SoundTouchableOpacity>

            {/* 4. Pengaturan */}
            <SoundTouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onNavigateSettings) {
                  onNavigateSettings();
                } else {
                  router.push("/pengaturan");
                }
              }}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={colors.subtext}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("settings")}
              </Text>
            </SoundTouchableOpacity>

            {/* 5. Bagikan Progress */}
            <SoundTouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onNavigateShareProgress) {
                  onNavigateShareProgress();
                } else {
                  router.push("/share-progress");
                }
              }}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color="#25D366"
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("share_progress")}
              </Text>
            </SoundTouchableOpacity>
          </View>
        </View>

        {/* Footer Logout */}
        <View style={styles.sidebarFooter}>
          <SoundTouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#FFF"
              style={styles.menuIcon}
            />
            <Text style={styles.logoutText}>
              {t("logout")}
            </Text>
          </SoundTouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarOverlay: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  sidebarCloseArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  sidebarContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: width * 0.75,
    padding: 20,
    justifyContent: "space-between",
    zIndex: 999,
    borderRightWidth: 1,
  },
  sidebarContentWrapper: { flex: 1 },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
  sidebarUserWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  sidebarAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImageSidebar: { width: "100%", height: "100%" },
  sidebarAvatarText: { fontWeight: "bold", fontSize: 18 },
  sidebarUserInfo: { marginLeft: 12, flex: 1 },
  sidebarName: { fontSize: 16, fontWeight: "bold" },
  sidebarEmail: { fontSize: 12, marginTop: 2 },
  sidebarMenuContainer: { flex: 1, marginTop: 24 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuIcon: { marginRight: 12 },
  menuText: { fontSize: 15, fontWeight: "500" },
  sidebarFooter: {
    justifyContent: "flex-end",
    marginBottom: Platform.OS === "android" ? 20 : 24,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    height: 48,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
});