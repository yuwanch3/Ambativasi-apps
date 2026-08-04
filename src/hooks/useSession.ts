import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import API_URL, { apiFetch } from "../../config";

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem("userSession");
      if (session === null) {
        router.replace("/auth/login");
        return;
      }
      const parsedSession = JSON.parse(session);
      setUserData({
        username: parsedSession.username || "User",
        email: parsedSession.email || "",
      });

      try {
        const response = await apiFetch(
          `${API_URL}/get-profile.php?email=${parsedSession.email}`
        );
        const data = await response.json();
        if (data.status === "success" && data.profile_image) {
          setProfileImage(`${API_URL}/${data.profile_image}`);
        } else {
          setProfileImage(null);
        }
      } catch (e) {
        console.log("Avatar gagal dimuat", e);
      }

      setLoading(false);
    } catch (error) {
      console.log("Gagal memuat session", error);
      router.replace("/auth/login");
    }
  };

  return {
    loading,
    setLoading,
    userData,
    setUserData,
    profileImage,
    setProfileImage,
    checkSession,
  };
}
