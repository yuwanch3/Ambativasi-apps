import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserSession {
  id: number;
  username: string;
  email: string;
  profile_image: string | null;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const raw = await AsyncStorage.getItem("userSession");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem("userSession");
    return null;
  }
}

export async function saveSession(user: UserSession) {
  await AsyncStorage.setItem("userSession", JSON.stringify(user));
}

export async function clearSession() {
  await AsyncStorage.removeItem("userSession");
}
