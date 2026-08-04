import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

// 💡 KAMUS TRANSLASI APLIKASI
const translations: Record<Language, Record<string, string>> = {
  id: {
    // --- NAVIGASI & UMUM ---
    back_to_dashboard: "Kembali ke Dashboard",
    back_to_materi: "Kembali ke Materi",
    back_to_level: "Kembali ke Tingkatan",
    back_to_bab: "Kembali ke BAB",
    back_to_ujian: "Kembali ke Ujian",
    select_materi: "Pilih Materi",
    select_level: "Pilih Tingkatan",
    select_level_exam: "Pilih Tingkatan Ujian",
    select_bab: "Pilih BAB",
    select_materi_ujian: "Pilih Materi",
    select_exam_level: "Pilih Tingkatan Ujian",
    keep_learning: "Semangat Belajar",

    // --- DASHBOARD & NAV UTAMA ---
    welcome: "Selamat Datang",
    dashboard: "Dashboard",
    materi: "Materi",
    ujian: "Ujian",
    subjects: "Subjects",
    learning_materials: "Pelajari rangkuman materi",
    start_exam: "Mulai Ujian",
    ai_assistant: "AI Asisten",

    // --- SIDEBAR ---
    my_profile: "Profil Saya",
    settings: "Pengaturan",
    logout: "Keluar",
    share_progress: "Bagikan Progress",

    // --- KUIS & SOAL ---
    quiz_completed: "Kuis Selesai!",
    view_answer_review: "Lihat Review Jawaban",
    back_to_chapter: "Kembali ke Bab",
    exit_quiz: "Meninggalkan Kuis?",
    previous: "Sebelumnya",
    next: "Selanjutnya",
    finish: "Selesai",

    // --- PENGATURAN ---
    account_security: "AKUN & KEAMANAN",
    change_email: "Ubah Email",
    change_email_sub: "Perbarui alamat email akunmu",
    change_password: "Ubah Kata Sandi",
    change_password_sub: "Amankan akun dengan sandi baru",
    app_preferences: "PREFERENSI APLIKASI",
    display_mode: "Mode Tampilan",
    app_language: "Bahasa Aplikasi",
    notifications: "NOTIFIKASI",
    daily_reminder: "Pengingat Belajar Harian",
    daily_reminder_sub: "Notifikasi latihan soal setiap hari",
    storage: "PENYIMPANAN",
    clear_cache: "Bersihkan Cache",
    help_docs: "BANTUAN & DOKUMEN",
    faq: "Pusat Bantuan / FAQ",
    privacy_policy: "Kebijakan Privasi & Syarat",

    // --- MODAL & BUTTONS ---
    select_display_mode: "Pilih Mode Tampilan",
    select_app_language: "Pilih Bahasa Aplikasi",
    light_mode: "Mode Terang (Light)",
    dark_mode: "Mode Gelap (Dark)",
    system_mode: "Ikuti Sistem Smartphone",
    indonesian: "Bahasa Indonesia",
    english: "English (Inggris)",
    save_password: "Simpan Kata Sandi",
    save_email: "Simpan Email",
    save: "Simpan",
    cancel: "Batal",
    success: "Sukses",
    failed: "Gagal",
  },
  en: {
    // --- NAVIGASI & UMUM ---
    back_to_dashboard: "Back to Dashboard",
    back_to_materi: "Back to Subject",
    back_to_level: "Back to Levels",
    back_to_bab: "Back to Chapter",
    back_to_ujian: "Back to Exam",
    select_materi: "Select Subject",
    select_level: "Select Level",
    select_level_exam: "Select Exam Level",
    select_bab: "Select Chapter",
    select_materi_ujian: "Select Material",
    select_exam_level: "Select Exam Level",
    keep_learning: "Happy Learning",

    // --- DASHBOARD & NAV UTAMA ---
    welcome: "Welcome",
    dashboard: "Dashboard",
    materi: "Subjects",
    ujian: "Exams",
    subjects: "Subjects",
    learning_materials: "Learn subject summaries",
    start_exam: "Start Exam",
    ai_assistant: "AI Assistant",

    // --- SIDEBAR ---
    my_profile: "My Profile",
    settings: "Settings",
    logout: "Log Out",
    share_progress: "Share Progress",

    // --- KUIS & SOAL ---
    quiz_completed: "Quiz Completed!",
    view_answer_review: "View Answer Review",
    back_to_chapter: "Back to Chapter",
    exit_quiz: "Exit Quiz?",
    previous: "Previous",
    next: "Next",
    finish: "Finish",

    // --- PENGATURAN ---
    account_security: "ACCOUNT & SECURITY",
    change_email: "Change Email",
    change_email_sub: "Update your account email address",
    change_password: "Change Password",
    change_password_sub: "Secure your account with a new password",
    app_preferences: "APP PREFERENCES",
    display_mode: "Display Mode",
    app_language: "App Language",
    notifications: "NOTIFICATIONS",
    daily_reminder: "Daily Study Reminder",
    daily_reminder_sub: "Daily practice notifications",
    storage: "STORAGE",
    clear_cache: "Clear Cache",
    help_docs: "HELP & DOCUMENTS",
    faq: "Help Center / FAQ",
    privacy_policy: "Privacy Policy & Terms",

    // --- MODAL & BUTTONS ---
    select_display_mode: "Select Display Mode",
    select_app_language: "Select App Language",
    light_mode: "Light Mode",
    dark_mode: "Dark Mode",
    system_mode: "System Default",
    indonesian: "Bahasa Indonesia",
    english: "English",
    save_password: "Save Password",
    save_email: "Save Email",
    save: "Save",
    cancel: "Cancel",
    success: "Success",
    failed: "Failed",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem("setting_lang");
      if (savedLang === "en" || savedLang === "id") {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.log("Gagal memuat bahasa", e);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem("setting_lang", lang);
    } catch (e) {
      console.log("Gagal menyimpan bahasa", e);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage harus digunakan di dalam LanguageProvider");
  }
  return context;
};