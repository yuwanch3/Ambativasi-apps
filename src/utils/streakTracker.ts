import AsyncStorage from "@react-native-async-storage/async-storage";

import { getAccountId, getScopedStorageKey } from "./accountSession";

const STORAGE_PREFIX = "app_streak_";
const GLOBAL_KEY = "app_streak";
const DAY_MS = 86400000;

interface StreakData {
  dates: string[];
  longestStreak: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const d = new Date(Date.now() - DAY_MS);
  return d.toISOString().slice(0, 10);
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function isConsecutive(a: string, b: string): boolean {
  const diff = parseDate(b).getTime() - parseDate(a).getTime();
  return diff === DAY_MS;
}

// 💡 Migrasi data streak global lama → per akun (sekali saja).
const migrateGlobalStreak = async (accountId: string) => {
  try {
    const globalRaw = await AsyncStorage.getItem(GLOBAL_KEY);
    if (!globalRaw) return;
    const perAccount = await AsyncStorage.getItem(`${STORAGE_PREFIX}${accountId}`);
    if (!perAccount) {
      await AsyncStorage.setItem(`${STORAGE_PREFIX}${accountId}`, globalRaw);
    }
    await AsyncStorage.removeItem(GLOBAL_KEY);
  } catch {}
};

export async function getStreakData(): Promise<StreakData> {
  try {
    const accountId = await getAccountId();
    if (accountId) await migrateGlobalStreak(accountId);
    const key = await getScopedStorageKey(STORAGE_PREFIX);
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { dates: [], longestStreak: 0 };
}

export async function recordActivity(dateStr?: string): Promise<void> {
  const today = dateStr || getToday();
  const data = await getStreakData();

  if (data.dates.includes(today)) return;

  data.dates.push(today);
  data.dates.sort();

  let currentStreak = 1;
  let longest = data.longestStreak;
  for (let i = data.dates.length - 1; i >= 1; i--) {
    if (isConsecutive(data.dates[i - 1], data.dates[i])) {
      currentStreak++;
    } else {
      break;
    }
  }
  if (currentStreak > longest) longest = currentStreak;

  data.longestStreak = longest;
  try {
    const key = await getScopedStorageKey(STORAGE_PREFIX);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export async function getCurrentStreak(): Promise<number> {
  const data = await getStreakData();
  const today = getToday();
  const yesterday = getYesterday();
  const sorted = [...data.dates].sort().reverse();

  if (sorted.length === 0) return 0;
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (isConsecutive(sorted[i], sorted[i - 1])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getLast7Days(): Promise<{ date: string; active: boolean }[]> {
  const data = await getStreakData();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, active: data.dates.includes(dateStr) });
  }
  return result;
}