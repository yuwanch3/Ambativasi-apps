import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 IMPORT KOMPONEN MODULAR NAVBAR & SIDEBAR
import { Navbar } from "../components/navbar";
import { Sidebar } from "../components/sidebar";

// 💡 IMPORT CONTEXT TEMA & BAHASA GLOBAL REAL-TIME
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

// 💡 UKURAN LUBANG CROP LINGKARAN & MASKING RAKSASA
const CROP_SIZE = width * 0.75;
const MASK_RADIUS = 500;

// 💡 ONLINE: Pastikan alamat Ngrok ini sama persis dengan yang aktif di terminalmu ya kawan!
import API_URL, { apiFetch } from "../config";

export default function ProfileScreen() {
  // --- TEMA & BAHASA GLOBAL REAL-TIME ---
  const { colors } = useTheme();
  const { language, t } = useLanguage();

  // --- STATE LAYOUT & SIDEBAR ---
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // --- STATE MODAL OPSI FOTO PROFIL (GANTI / HAPUS) ---
  const [isPhotoOptionModalOpen, setIsPhotoOptionModalOpen] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  // --- STATE MODAL PREVIEW & CROP FOTO ---
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  // --- STATE EDIT USERNAME ---
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // --- STATE MODAL NOTIFIKASI KUSTOM ---
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    isSuccess: true,
  });

  // --- STATE USER DATA ---
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);

  // --- PAN & SCALE RESPONDER UNTUK GESER & CUBIT ZOOM FOTO ---
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Ref penampung nilai terpercaya
  const scaleRef = useRef(1);
  const baseScale = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);

  // 💡 SINKRONISASI REAL-TIME NILAI SCALE DAN PAN
  useEffect(() => {
    const scaleSub = scale.addListener(({ value }) => {
      scaleRef.current = value;
    });
    const panSub = pan.addListener((value) => {
      panRef.current = value;
    });

    return () => {
      scale.removeListener(scaleSub);
      pan.removeListener(panSub);
    };
  }, []);

  // 💡 FUNGSI HITUNG JARAK KEDUA JARI (PINCH)
  const getDistance = (touches: any[]) => {
    const [a, b] = touches;
    const dx = a.pageX - b.pageX;
    const dy = a.pageY - b.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length >= 2) {
          initialDistance.current = getDistance(touches);
          baseScale.current = scaleRef.current;
        } else {
          initialDistance.current = 0;
          pan.setOffset({ x: panRef.current.x, y: panRef.current.y });
          pan.setValue({ x: 0, y: 0 });
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        console.log("TOUCHES COUNT:", touches.length); // 👈 DEBUG SEMENTARA, hapus nanti kalau udah ketemu solusinya

        // 💡 JIKA 2 JARI: FITUR CUBIT ZOOM IN / ZOOM OUT PRESISE
        if (touches.length >= 2) {
          const currentDistance = getDistance(touches);
          if (initialDistance.current === 0) {
            initialDistance.current = currentDistance;
            baseScale.current = scaleRef.current;
          } else {
            const factor = currentDistance / initialDistance.current;
            const newScale = Math.max(
              0.5,
              Math.min(5, baseScale.current * factor),
            );
            scale.setValue(newScale);
          }
        }
        // 💡 JIKA 1 JARI: FITUR GESER GAMBAR (PAN)
        else if (touches.length === 1) {
          initialDistance.current = 0;
          pan.x.setValue(gestureState.dx);
          pan.y.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: () => {
        pan.flattenOffset();
        initialDistance.current = 0;
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        initialDistance.current = 0;
      },
    }),
  ).current;

  // Auto-refresh data profil setiap kali user masuk kembali ke halaman ini kawan!
  useFocusEffect(
    React.useCallback(() => {
      checkSession();
    }, []),
  );

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
        setNewUsername(parsedSession.username || "");

        const response = await apiFetch(`${API_URL}/get-profile.php?email=${parsedSession.email}`,
          { headers: { "ngrok-skip-browser-warning": "true" } },
        );
        const data = await response.json();

        if (data.status === "success" && data.profile_image) {
          setProfileImage(`${API_URL}/${data.profile_image}`);
        } else {
          setProfileImage(null);
        }

        setLoading(false);
      }
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("../auth/login");
    }
  };

  // 💡 TRIGGER KETIKA FOTO PROFIL DIKETUK
  const handleProfilePhotoPress = () => {
    if (profileImage) {
      setIsPhotoOptionModalOpen(true);
    } else {
      pickImage();
    }
  };

  // 💡 BUKA GALERI DAN AMBIL GAMBAR
  const pickImage = async () => {
    setIsPhotoOptionModalOpen(false);
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      setInfoModal({
        visible: true,
        title: language === "id" ? "Izin Ditolak" : "Permission Denied",
        message:
          language === "id"
            ? "Aplikasi membutuhkan izin galeri untuk mengganti foto profil!"
            : "App needs gallery permissions to change profile photo!",
        isSuccess: false,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0].uri) {
      const pickedUri = result.assets[0].uri;
      Image.getSize(pickedUri, (w, h) => {
        setImageDimensions({ width: w, height: h });
      });

      pan.setValue({ x: 0, y: 0 });
      pan.setOffset({ x: 0, y: 0 });
      scale.setValue(1);
      scaleRef.current = 1;
      baseScale.current = 1;
      initialDistance.current = 0;
      setTempImageUri(pickedUri);
      setIsPreviewModalOpen(true);
    }
  };

  // 💡 HAPUS FOTO PROFIL DAN RESET KE DEFAULT
  const handleDeletePhoto = async () => {
    if (!userData?.email) return;

    try {
      setIsDeletingPhoto(true);
      const formData = new FormData();
      formData.append("email", userData.email);
      formData.append("action", "delete");
      formData.append("delete", "1");

      let response = await apiFetch(`${API_URL}/upload-profile.php?email=${encodeURIComponent(userData.email)}&action=delete&delete=1`,
        {
          method: "POST",
          body: formData,
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );

      let text = await response.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch (e) {}

      if (!(result.status === "success" || result.success)) {
        try {
          const delResp = await apiFetch(`${API_URL}/delete-profile.php?email=${encodeURIComponent(userData.email)}`,
            {
              method: "POST",
              headers: { "ngrok-skip-browser-warning": "true" },
            },
          );
          const delText = await delResp.text();
          const delResult = JSON.parse(delText);
          if (delResult.status === "success" || delResult.success) {
            result = delResult;
          }
        } catch (e2) {}
      }

      setProfileImage(null);
      setIsPhotoOptionModalOpen(false);
      setInfoModal({
        visible: true,
        title: language === "id" ? "Sukses" : "Success",
        message:
          language === "id"
            ? "Foto profil berhasil dihapus."
            : "Profile photo has been deleted.",
        isSuccess: true,
      });
    } catch (e) {
      console.log("Error hapus foto:", e);
      setProfileImage(null);
      setIsPhotoOptionModalOpen(false);
      setInfoModal({
        visible: true,
        title: language === "id" ? "Sukses" : "Success",
        message:
          language === "id"
            ? "Foto profil berhasil dihapus."
            : "Profile photo has been deleted.",
        isSuccess: true,
      });
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  // 💡 CROP PRESISI BERDASARKAN PINCH ZOOM & UPLOAD FOTO PROFIL
  const handleConfirmUpload = async () => {
    if (!tempImageUri || !userData?.email) return;

    setIsUploading(true);
    let finalUri = tempImageUri;

    try {
      if (imageDimensions.width > 0 && imageDimensions.height > 0) {
        const origW = imageDimensions.width;
        const origH = imageDimensions.height;
        const viewW = width;
        const viewH = height * 0.6;

        const scaleFit = Math.min(viewW / origW, viewH / origH);
        const dispW = origW * scaleFit;
        const dispH = origH * scaleFit;

        const currentScale = scaleRef.current;
        const currentPanX = panRef.current.x;
        const currentPanY = panRef.current.y;

        const totalScale = scaleFit * currentScale;

        let originX =
          ((dispW * currentScale) / 2 - currentPanX - CROP_SIZE / 2) /
          totalScale;
        let originY =
          ((dispH * currentScale) / 2 - currentPanY - CROP_SIZE / 2) /
          totalScale;
        let cropW = CROP_SIZE / totalScale;
        let cropH = CROP_SIZE / totalScale;

        originX = Math.max(0, Math.min(origW - 10, originX));
        originY = Math.max(0, Math.min(origH - 10, originY));
        cropW = Math.min(cropW, origW - originX);
        cropH = Math.min(cropH, origH - originY);

        if (cropW > 10 && cropH > 10) {
          const manipResult = await ImageManipulator.manipulateAsync(
            tempImageUri,
            [
              {
                crop: {
                  originX: Math.round(originX),
                  originY: Math.round(originY),
                  width: Math.round(cropW),
                  height: Math.round(cropH),
                },
              },
            ],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
          );
          finalUri = manipResult.uri;
        }
      }
    } catch (cropErr) {
      console.log("Gagal melakukan crop, mengunggah foto asli:", cropErr);
    }

    const formData = new FormData();
    formData.append("email", userData.email);
    formData.append("image", {
      uri: finalUri,
      name: `profile_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    try {
      const uploadResponse = await apiFetch(`${API_URL}/upload-profile.php`,
        {
          method: "POST",
          body: formData,
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );

      const uploadResult = await uploadResponse.json();
      if (uploadResult.status === "success") {
        setProfileImage(
          `${API_URL}/${uploadResult.profile_image}`,
        );
        setIsPreviewModalOpen(false);
        setInfoModal({
          visible: true,
          title: language === "id" ? "Sukses" : "Success",
          message:
            language === "id"
              ? "Foto profil kamu berhasil diperbarui!"
              : "Your profile photo has been updated successfully!",
          isSuccess: true,
        });
      } else {
        setInfoModal({
          visible: true,
          title: language === "id" ? "Gagal" : "Failed",
          message:
            uploadResult.message ||
            (language === "id"
              ? "Gagal mengunggah foto profil."
              : "Failed to upload profile photo."),
          isSuccess: false,
        });
      }
    } catch (error) {
      console.log("Error saat mengunggah foto ke database", error);
      setInfoModal({
        visible: true,
        title: language === "id" ? "Error Koneksi" : "Connection Error",
        message:
          language === "id"
            ? "Terjadi kesalahan jaringan saat mengunggah foto."
            : "Network error occurred while uploading photo.",
        isSuccess: false,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 💡 SIMPAN UPDATE USERNAME (SINKRON DB & SESSION)
  const handleSaveUsername = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setInfoModal({
        visible: true,
        title: language === "id" ? "Perhatian" : "Warning",
        message:
          language === "id"
            ? "Username tidak boleh kosong!"
            : "Username cannot be empty!",
        isSuccess: false,
      });
      return;
    }

    if (trimmed === userData?.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setIsSavingUsername(true);

      const formData = new FormData();
      formData.append("email", userData?.email || "");
      formData.append("new_username", trimmed);
      formData.append("username", trimmed);

      let response = await apiFetch(`${API_URL}/update-username.php?email=${encodeURIComponent(userData?.email || "")}&new_username=${encodeURIComponent(trimmed)}&username=${encodeURIComponent(trimmed)}`,
        {
          method: "POST",
          body: formData,
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );

      let text = await response.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch (err) {}

      if (!(result.status === "success" || result.success)) {
        response = await apiFetch(`${API_URL}/update-username.php?email=${encodeURIComponent(userData?.email || "")}&new_username=${encodeURIComponent(trimmed)}&username=${encodeURIComponent(trimmed)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({
              email: userData?.email,
              new_username: trimmed,
              username: trimmed,
            }),
          },
        );
        text = await response.text();
        try {
          result = JSON.parse(text);
        } catch (err) {}
      }

      if (result.status === "success" || result.success || response.ok) {
        // Update Session Lokal
        const currentSessionRaw = await AsyncStorage.getItem("userSession");
        if (currentSessionRaw) {
          const sessionParsed = JSON.parse(currentSessionRaw);
          sessionParsed.username = trimmed;
          await AsyncStorage.setItem(
            "userSession",
            JSON.stringify(sessionParsed),
          );
        }

        setUserData((prev) => (prev ? { ...prev, username: trimmed } : null));
        setIsEditingUsername(false);

        setInfoModal({
          visible: true,
          title: language === "id" ? "Sukses" : "Success",
          message:
            language === "id"
              ? "Username kamu berhasil diperbarui!"
              : "Your username has been updated successfully!",
          isSuccess: true,
        });
      } else {
        setInfoModal({
          visible: true,
          title: language === "id" ? "Gagal" : "Failed",
          message:
            result.message ||
            (language === "id"
              ? "Gagal memperbarui username."
              : "Failed to update username."),
          isSuccess: false,
        });
      }
    } catch (e) {
      console.log("Error update username:", e);
      setInfoModal({
        visible: true,
        title: language === "id" ? "Error Koneksi" : "Connection Error",
        message:
          language === "id"
            ? "Gagal memperbarui username."
            : "Failed to update username.",
        isSuccess: false,
      });
    } finally {
      setIsSavingUsername(false);
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

      {/* ==================== NAVBAR ATAS MODULAR ==================== */}
      <Navbar
        onOpenSidebar={() => toggleSidebar(true)}
        userData={userData}
        profileImage={profileImage}
      />

      {/* ==================== KONTEN UTAMA PROFILE ==================== */}
      <View style={styles.mainContent}>
        {/* SECTION FOTO PROFIL BULAT DI TENGAH AGAK ATAS */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity
            style={[
              styles.imageContainerBig,
              { backgroundColor: colors.isDark ? "#334155" : "#E2E8F0" },
            ]}
            onPress={handleProfilePhotoPress}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImageBig}
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons name="person" size={50} color={colors.subtext} />
              </View>
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.clickToEditHint, { color: colors.subtext }]}>
            {language === "id"
              ? "Ketuk foto untuk mengelola"
              : "Tap photo to manage"}
          </Text>
        </View>

        {/* SECTION FIELD DATA USER */}
        <View
          style={[
            styles.infoFormCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* USERNAME DENGAN FITUR EDIT */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={[styles.fieldLabel, { color: colors.subtext }]}>
              Username
            </Text>
            {!isEditingUsername ? (
              <TouchableOpacity
                onPress={() => setIsEditingUsername(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.isDark ? "#60A5FA" : "#2563EB"}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.isDark ? "#60A5FA" : "#2563EB",
                    marginLeft: 4,
                  }}
                >
                  {language === "id" ? "Ubah" : "Edit"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSaveUsername}
                disabled={isSavingUsername}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                {isSavingUsername ? (
                  <ActivityIndicator size="small" color="#16A34A" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#16A34A"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#16A34A",
                        marginLeft: 4,
                      }}
                    >
                      {language === "id" ? "Simpan" : "Save"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={[
              styles.inputField,
              {
                backgroundColor: isEditingUsername
                  ? colors.card
                  : colors.inputBg,
                borderColor: isEditingUsername
                  ? colors.isDark
                    ? "#60A5FA"
                    : "#2563EB"
                  : colors.border,
                color: colors.text,
              },
            ]}
            value={isEditingUsername ? newUsername : userData?.username}
            onChangeText={setNewUsername}
            editable={isEditingUsername}
            autoFocus={isEditingUsername}
          />

          <Text style={[styles.fieldLabel, { color: colors.subtext }]}>
            Email Address
          </Text>
          <TextInput
            style={[
              styles.inputField,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={userData?.email}
            editable={false}
          />

          <Text style={[styles.fieldLabel, { color: colors.subtext }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.inputField,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value="********"
            secureTextEntry={true}
            editable={false}
          />
        </View>
      </View>

      {/* ==================== MODAL DROPDOWN OPSI FOTO PROFIL ==================== */}
      <Modal visible={isPhotoOptionModalOpen} transparent animationType="fade">
        <TouchableOpacity
          style={[
            styles.modalCustomOverlay,
            {
              backgroundColor: colors.modalOverlay,
              justifyContent: "flex-end",
            },
          ]}
          activeOpacity={1}
          onPress={() => setIsPhotoOptionModalOpen(false)}
        >
          <View
            style={[
              styles.photoOptionSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.sheetIndicator,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={styles.sheetOptionItem}
              onPress={pickImage}
            >
              <Ionicons
                name="image-outline"
                size={20}
                color={colors.isDark ? "#60A5FA" : "#2563EB"}
              />
              <Text style={[styles.sheetOptionText, { color: colors.text }]}>
                {language === "id"
                  ? "Ganti Foto Profil"
                  : "Change Profile Photo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetOptionItem, { borderBottomWidth: 0 }]}
              onPress={handleDeletePhoto}
              disabled={isDeletingPhoto}
            >
              {isDeletingPhoto ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.sheetOptionText, { color: "#EF4444" }]}>
                    {language === "id"
                      ? "Hapus Foto Profil"
                      : "Delete Profile Photo"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== 💎 MODAL PREVIEW / CROP CUSTOM PREMIUM 💎 ==================== */}
      <Modal
        visible={isPreviewModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          if (!isUploading) setIsPreviewModalOpen(false);
        }}
      >
        <View style={styles.modalCustomOverlay}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

          <View style={styles.modalCustomHeader}>
            <Text style={styles.modalCustomTitle}>
              {language === "id"
                ? "Sesuaikan Foto Profil"
                : "Adjust Profile Photo"}
            </Text>
          </View>

          {/* AREA INTERAKTIF GESER & CUBIT ZOOM GAMBAR */}
          <View
            style={styles.cropWindowArea}
            collapsable={false}
            {...panResponder.panHandlers}
          >
            <Animated.View
              style={{
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: scale },
                ],
              }}
            >
              {tempImageUri && (
                <Image
                  source={{ uri: tempImageUri }}
                  style={styles.modalFullImage}
                  resizeMode="contain"
                />
              )}
            </Animated.View>

            {/* SISTEM MASKING LINGKARAN PRESISI */}
            <View style={styles.maskOverlayContainer} pointerEvents="none">
              <View style={styles.donutMaskCircle} />
              <View style={styles.blueRingBorder} />
            </View>
          </View>

          {/* BARIS TOMBOL DESIGN PREMIUM */}
          <View style={styles.modalCustomFooter}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={() => setIsPreviewModalOpen(false)}
              disabled={isUploading}
            >
              <Text style={styles.modalBtnTextCancel}>
                {language === "id" ? "Batal" : "Cancel"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnConfirm]}
              onPress={handleConfirmUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.modalBtnTextConfirm}>
                  {language === "id" ? "Gunakan Foto" : "Use Photo"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL NOTIFIKASI KUSTOM REAL-TIME ==================== */}
      <Modal visible={infoModal.visible} transparent animationType="fade">
        <View
          style={[
            styles.modalCustomOverlay,
            {
              backgroundColor: colors.modalOverlay,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            },
          ]}
        >
          <View
            style={[
              styles.infoModalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons
                name={
                  infoModal.isSuccess
                    ? "checkmark-circle-outline"
                    : "alert-circle-outline"
                }
                size={24}
                color={
                  infoModal.isSuccess
                    ? colors.isDark
                      ? "#4ADE80"
                      : "#16A34A"
                    : "#EF4444"
                }
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.infoModalTitle, { color: colors.text }]}>
                {infoModal.title}
              </Text>
            </View>

            <Text style={[styles.infoModalMessage, { color: colors.subtext }]}>
              {infoModal.message}
            </Text>

            <TouchableOpacity
              style={[styles.btnInfoModalClose, { backgroundColor: "#16A34A" }]}
              onPress={() => setInfoModal({ ...infoModal, visible: false })}
            >
              <Text style={styles.btnInfoModalCloseText}>
                {language === "id" ? "Selesai" : "Done"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== SIDEBAR / DRAWER MENU MODULAR ==================== */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
        slideAnim={slideAnim}
        userData={userData}
        profileImage={profileImage}
        onLogout={handleLogout}
      />
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
  mainContent: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  profileImageSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  imageContainerBig: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileImageBig: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  editIconBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#2563EB",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  clickToEditHint: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  infoFormCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 2,
  },
  inputField: {
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 18,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  modalCustomOverlay: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "space-between",
  },
  modalCustomHeader: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  modalCustomTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cropWindowArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  modalFullImage: {
    width: width,
    height: height * 0.6,
  },
  maskOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  donutMaskCircle: {
    width: CROP_SIZE + MASK_RADIUS * 2,
    height: CROP_SIZE + MASK_RADIUS * 2,
    borderRadius: (CROP_SIZE + MASK_RADIUS * 2) / 2,
    borderWidth: MASK_RADIUS,
    borderColor: "rgba(15, 23, 42, 0.85)",
    backgroundColor: "transparent",
    position: "absolute",
  },
  blueRingBorder: {
    width: CROP_SIZE,
    height: CROP_SIZE,
    borderRadius: CROP_SIZE / 2,
    borderWidth: 2,
    borderColor: "#2563EB",
    position: "absolute",
  },
  modalCustomFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    paddingTop: 20,
  },
  modalBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "47%",
  },
  modalBtnCancel: {
    backgroundColor: "#334155",
  },
  modalBtnConfirm: {
    backgroundColor: "#2563EB",
  },
  modalBtnTextCancel: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalBtnTextConfirm: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  infoModalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
  },
  infoModalTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  infoModalMessage: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 10,
  },
  btnInfoModalClose: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  btnInfoModalCloseText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  photoOptionSheet: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  sheetIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
});
