import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";
import { useSession } from "../src/hooks/useSession";
import { useSidebar } from "../src/hooks/useSidebar";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface ScreenShellProps {
  children: React.ReactNode;
  edges?: Array<"top" | "bottom">;
}

export function ScreenShell({ children, edges = ["top"] }: ScreenShellProps) {
  const { colors } = useTheme();
  const session = useSession();
  const sidebar = useSidebar();

  useFocusEffect(
    useCallback(() => {
      session.checkSession();
    }, [])
  );

  if (session.loading) {
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
      edges={edges}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />
      <Navbar
        onOpenSidebar={() => sidebar.toggleSidebar(true)}
        userData={session.userData}
        profileImage={session.profileImage}
      />
      <View style={styles.content}>{children}</View>
      <Sidebar
        isOpen={sidebar.isSidebarOpen}
        onClose={() => sidebar.toggleSidebar(false)}
        slideAnim={sidebar.slideAnim}
        userData={session.userData}
        profileImage={session.profileImage}
        onLogout={sidebar.handleLogout}
      />
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
});
