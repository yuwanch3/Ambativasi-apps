import AsyncStorage from "@react-native-async-storage/async-storage";

// 💡 Ambil identitas akun aktif (user.id paling stabil; fallback email/username).
export const getAccountId = async (): Promise<string | null> => {
  try {
    const session = await AsyncStorage.getItem("userSession");
    if (!session) return null;
    const parsed = JSON.parse(session);
    const id =
      parsed?.id != null
        ? String(parsed.id)
        : parsed?.user_id != null
          ? String(parsed.user_id)
          : parsed?.email
            ? String(parsed.email).toLowerCase().trim()
            : null;
    return id;
  } catch {
    return null;
  }
};

// 💡 Key storage ber-scope per akun. Saat belum ada akun (logout), pakai key global.
export const getScopedStorageKey = async (prefix: string): Promise<string> => {
  const id = await getAccountId();
  return id ? `${prefix}${id}` : prefix;
};
