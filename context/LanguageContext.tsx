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

    // --- UBAH EMAIL (VERIFIKASI KODE) ---
    change_email_title: "Ubah Email",
    change_email_subtitle: "Verifikasi identitasmu dulu sebelum mengganti email akun.",
    current_email: "Email Terdaftar (Lama)",
    send_verification_code: "Kirim Kode Verifikasi",
    sending_code: "Mengirim kode...",
    verification_code: "Kode Verifikasi",
    verification_code_placeholder: "Masukkan kode dari email",
    verify_code_btn: "Verifikasi Kode",
    verifying_code: "Memverifikasi...",
    enter_new_email: "Masukkan Email Baru",
    save_new_email: "Simpan Email Baru",
    code_sent_to: "Kode verifikasi terkirim ke {email}",
    invalid_code: "Kode verifikasi tidak valid atau sudah kedaluwarsa.",
    code_expired: "Kode kedaluwarsa. Kirim ulang kode baru.",
    resend_code: "Kirim Ulang Kode",
    resend_in: "Kirim ulang dalam {s}s",
    email_verified_continue: "Identitas terverifikasi! Lanjutkan mengisi email baru.",
    email_must_differ: "Email baru harus berbeda dari email saat ini!",
    enter_code_first: "Masukkan kode verifikasi dulu sebelum melanjutkan.",
    old_email_not_registered: "Email tidak terdaftar pada akun mana pun. Periksa kembali email lamamu.",

    // --- UBAH KATA SANDI ---
    change_password_title: "Ubah Kata Sandi",
    change_password_subtitle: "Masukkan kata sandi lama, lalu buat kata sandi baru yang kuat.",
    current_password: "Kata Sandi Lama",
    new_password_new: "Kata Sandi Baru",
    confirm_new_password: "Konfirmasi Kata Sandi Baru",
    password_min_length: "Kata sandi baru minimal 8 karakter.",
    password_not_match: "Konfirmasi kata sandi tidak cocok!",
    password_same_as_old: "Kata sandi baru harus berbeda dari kata sandi lama!",

    // --- SPEECH / TILAWAH ---
    speech_loading_surah: "Memuat data surah...",
    speech_select_surah: "Pilih Surat",
    speech_select_juz_amma: "Pilih Surat Juz Amma",
    speech_reading_now: " — Sedang dibaca",
    speech_surah_label: "Surat {number}",
    speech_ayah_label: "Ayat {number}",
    speech_select_ayah: "Pilih Ayat",
    speech_select_ayah_title: "Pilih Ayat {name}",
    speech_record: "Rekam",
    speech_heard_text: "Teks Terdengar",
    speech_preparing_mic: "Menyiapkan mikrofon...",
    speech_recording: "Sedang merekam...",
    speech_correct_next: "Bacaan benar, lanjut ke ayat berikutnya...",
    speech_not_started: "Belum merekam",
    speech_listening: "Sedang mendengarkan...",
    speech_reading_ayah: "Sedang membaca ayat {ayah}.",
    speech_ayah_correct: "Ayat {ayah} benar. Melanjutkan ke ayat berikutnya...",
    speech_all_done_status: "Seluruh surat Juz Amma selesai dibaca dengan benar.",
    speech_all_done_title: "Alhamdulillah!",
    speech_all_done_message: "Seluruh surat Juz Amma telah selesai dibaca.",
    speech_read_next: "Silakan membaca {name} ayat {ayah}.",
    speech_error_ayah: "Masih terdapat kesalahan pada ayat {ayah}.",
    speech_not_recognized: "Ayat {ayah} belum dapat dikenali.",
    speech_recognition_failed: "Pengenalan suara gagal: {message}",
    speech_service_unavailable: "Layanan pengenalan suara tidak tersedia di perangkat ini.",
    speech_mic_denied: "Izin mikrofon tidak diberikan.",
    speech_permission_title: "Izin diperlukan",
    speech_permission_message: "Izinkan akses mikrofon agar aplikasi dapat mengenali bacaan.",
    speech_cannot_start: "Pengenalan suara tidak dapat dimulai.",
    speech_recognition_failed_title: "Pengenalan suara gagal",
    speech_ayah_not_read: "Ayat {ayah} belum terbaca.",
    speech_not_read_title: "Bacaan belum terbaca",
    speech_not_read_message: "Ayat {ayah} belum berhasil dikenali. Silakan rekam dan baca kembali.",
    speech_read_correct: "Ayat {ayah} berhasil dibaca dengan benar.",
    speech_incorrect_title: "Bacaan belum benar",
    speech_incorrect_message: "Masih terdapat kata yang salah pada ayat {ayah}. Periksa bagian berwarna merah, kemudian rekam kembali.",
    speech_not_finished: "Ayat {ayah} belum selesai dibaca.",
    speech_not_finished_title: "Bacaan belum selesai",
    speech_not_finished_message: "Ayat {ayah} belum dibaca sampai selesai. Bagian berwarna hitam belum terbaca.",
    speech_surah_resumed: "{name} dipilih kembali. Dilanjutkan dari ayat {ayah}.",
    speech_surah_selected: "{name} dipilih. Silakan mulai dari ayat 1.",
    speech_ayah_selected: "{name} ayat {ayah} dipilih. Silakan mulai membaca.",
    speech_close: "Tutup",
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

    // --- CHANGE EMAIL (CODE VERIFICATION) ---
    change_email_title: "Change Email",
    change_email_subtitle: "Verify your identity first before changing your account email.",
    current_email: "Current Email",
    send_verification_code: "Send Verification Code",
    sending_code: "Sending code...",
    verification_code: "Verification Code",
    verification_code_placeholder: "Enter the code from your email",
    verify_code_btn: "Verify Code",
    verifying_code: "Verifying...",
    enter_new_email: "Enter New Email",
    save_new_email: "Save New Email",
    code_sent_to: "Verification code sent to {email}",
    invalid_code: "Invalid or expired verification code.",
    code_expired: "Code expired. Resend a new code.",
    resend_code: "Resend Code",
    resend_in: "Resend in {s}s",
    email_verified_continue: "Identity verified! Continue to enter your new email.",
    email_must_differ: "New email must be different from your current email!",
    enter_code_first: "Enter the verification code before continuing.",
    old_email_not_registered: "Email is not registered to any account. Check your old email.",

    // --- CHANGE PASSWORD ---
    change_password_title: "Change Password",
    change_password_subtitle: "Enter your current password, then create a strong new password.",
    current_password: "Current Password",
    new_password_new: "New Password",
    confirm_new_password: "Confirm New Password",
    password_min_length: "New password must be at least 8 characters.",
    password_not_match: "Passwords do not match!",
    password_same_as_old: "New password must be different from your old password!",

    // --- SPEECH / TILAWAH ---
    speech_loading_surah: "Loading surah data...",
    speech_select_surah: "Select Surah",
    speech_select_juz_amma: "Select Juz Amma Surah",
    speech_reading_now: " — Currently reading",
    speech_surah_label: "Surah {number}",
    speech_ayah_label: "Ayah {number}",
    speech_select_ayah: "Select Ayah",
    speech_select_ayah_title: "Select Ayah of {name}",
    speech_record: "Record",
    speech_heard_text: "Heard Text",
    speech_preparing_mic: "Preparing microphone...",
    speech_recording: "Recording...",
    speech_correct_next: "Correct reading, moving to the next ayah...",
    speech_not_started: "Not recorded yet",
    speech_listening: "Listening...",
    speech_reading_ayah: "Reading ayah {ayah}...",
    speech_ayah_correct: "Ayah {ayah} is correct. Moving to the next ayah...",
    speech_all_done_status: "All Juz Amma surahs have been read correctly.",
    speech_all_done_title: "Alhamdulillah!",
    speech_all_done_message: "You have finished reading all Juz Amma surahs.",
    speech_read_next: "Please read {name} ayah {ayah}.",
    speech_error_ayah: "There are still errors in ayah {ayah}.",
    speech_not_recognized: "Ayah {ayah} could not be recognized.",
    speech_recognition_failed: "Speech recognition failed: {message}",
    speech_service_unavailable: "Speech recognition is not available on this device.",
    speech_mic_denied: "Microphone permission was not granted.",
    speech_permission_title: "Permission required",
    speech_permission_message: "Allow microphone access so the app can recognize your recitation.",
    speech_cannot_start: "Speech recognition could not be started.",
    speech_recognition_failed_title: "Speech recognition failed",
    speech_ayah_not_read: "Ayah {ayah} has not been read.",
    speech_not_read_title: "Reading not detected",
    speech_not_read_message: "Ayah {ayah} was not recognized. Please record and read again.",
    speech_read_correct: "Ayah {ayah} was read correctly.",
    speech_incorrect_title: "Reading not correct",
    speech_incorrect_message: "There are still incorrect words in ayah {ayah}. Check the red highlighted part, then record again.",
    speech_not_finished: "Ayah {ayah} was not finished.",
    speech_not_finished_title: "Reading not finished",
    speech_not_finished_message: "Ayah {ayah} was not read completely. The black part has not been read yet.",
    speech_surah_resumed: "{name} selected again. Continuing from ayah {ayah}.",
    speech_surah_selected: "{name} selected. Please start from ayah 1.",
    speech_ayah_selected: "{name} ayah {ayah} selected. Please start reading.",
    speech_close: "Close",
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