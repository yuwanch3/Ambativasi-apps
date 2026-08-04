import AsyncStorage from "@react-native-async-storage/async-storage";

import API_URL, { apiFetch } from "../../config";
import { getCurrentStreak, recordActivity } from "./streakTracker";

export interface ProgressEntry {
  subjectId: string;
  subjectName: string;
  levelId: string;
  levelName: string;
  babId: string;
  babName: string;
  type: "latihan" | "ujian";
  score: number;
  total: number;
  date: string;
  timestamp: number;
}

const STORAGE_KEY = "app_progress";

export async function getAllProgress(): Promise<ProgressEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function submitXP(entry: ProgressEntry) {
  try {
    const session = await AsyncStorage.getItem("userSession");
    if (!session) return;
    const user = JSON.parse(session);
    if (!user.email) return;

    const streak = await getCurrentStreak();
    await apiFetch(`${API_URL}/submit-xp.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        type: entry.type,
        correct: entry.score,
        total: entry.total,
        streak,
      }),
    });
  } catch (e) {
    console.log("Gagal kirim XP ke server", e);
  }
}

export async function saveProgress(entry: ProgressEntry) {
  try {
    const all = await getAllProgress();
    all.push(entry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    await recordActivity();
    await submitXP(entry);
  } catch (e) {
    console.log("Gagal simpan progress", e);
  }
}

export interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  latihanAttempts: number;
  ujianAttempts: number;
  latihanBestScore: number;
  ujianBestScore: number;
  lastActivity: string | null;
  totalLatihan: number;
  totalUjian: number;
}

export async function getSubjectSummary(): Promise<SubjectSummary[]> {
  const all = await getAllProgress();
  const map = new Map<string, ProgressEntry[]>();
  for (const e of all) {
    const key = e.subjectId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  const result: SubjectSummary[] = [];
  for (const [subjectId, entries] of map) {
    const subjectName = entries[0].subjectName;
    const latihan = entries.filter(e => e.type === "latihan");
    const ujian = entries.filter(e => e.type === "ujian");
    result.push({
      subjectId,
      subjectName,
      latihanAttempts: latihan.length,
      ujianAttempts: ujian.length,
      latihanBestScore: latihan.length ? Math.max(...latihan.map(e => e.score)) : 0,
      ujianBestScore: ujian.length ? Math.max(...ujian.map(e => e.score)) : 0,
      lastActivity: all.length ? all[all.length - 1].date : null,
      totalLatihan: latihan.length,
      totalUjian: ujian.length,
    });
  }
  return result;
}
