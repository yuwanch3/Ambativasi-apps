# Ambativasi — Aplikasi Belajar Interaktif

**Ambativasi** adalah aplikasi mobile belajar yang menggabungkan **materi pembelajaran**, **latihan soal (ujian)**, dan **latihan membaca Al-Qur'an berbasis suara** dalam satu platform. Dibangun dengan **React Native (Expo SDK 54)** dan memanfaatkan **backend API + database terpusat** sehingga progres belajar tersinkron di semua perangkat.

> **Versi saat ini:** 1.0.4 · Package: `org.misa.ambativasi`

---

## 🎓 Apa Itu Ambativasi?

Ambativasi adalah aplikasi belajar interaktif untuk materi teknis dan keagamaan yang dikemas ringkas, lengkap dengan:

- 📚 **Materi pembelajaran** dalam format PDF, video, dan teks interaktif.
- ✍️ **Latihan soal / ujian** dengan koreksi otomatis dan pembahasan jawaban.
- 🎙️ **Latihan membaca Al-Qur'an** dengan *speech recognition* (deteksi bacaan real-time).
- 🏆 **Gamifikasi**: XP, level, streak, dan leaderboard.
- 🤖 **Asisten AI** untuk menjawab pertanyaan materi.
- 📈 **Pelacakan progres** dan pembagian progres belajar.

### Materi yang Tersedia

| Mata Pelajaran | Kategori |
|---|---|
| **Nihongo (Bahasa Jepang)** | N5 — kosakata, tata bahasa, latihan |
| **Chemical EOR** | Enhanced Oil Recovery — konsep dasar |
| **Petrofisika** | Fundamental & konsep seri |
| **Tajwid Islam** | Surat Al-Fatihah & kaidah bacaan |

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Materi Interaktif** | Teks, PDF, dan video per bab |
| **Latihan Soal** | Kuis & ujian per bab dengan skor otomatis |
| **Speech Recognition** | Latihan melafalkan ayat Al-Qur'an (Juz Amma), koreksi per kata real-time |
| **Leaderboard & XP** | Kompetisi antar pengguna, level & streak harian |
| **Asisten AI** | Chat tanya-jawab materi |
| **Auth Aman** | Register, login, lupa kata sandi, ubah email/kata sandi |
| **Multi Bahasa** | Indonesia & English |
| **Tema** | Mode terang & gelap |
| **Statistik & Streak** | Riwayat belajar, progres per mata pelajaran |
| **Bagikan Progres** | Ekspor & bagikan pencapaian |

---

## 🚀 Instalasi & Menjalankan

### Prasyarat

- Node.js (LTS) & npm
- Expo CLI
- Perangkat Android/iOS dengan aplikasi **Expo Go**, atau emulator

### Langkah

```bash
# 1. Install dependency
npm install

# 2. Jalankan aplikasi
npx expo start
```

Kemudian pindai QR code dengan Expo Go (Android) atau tekan `a` untuk emulator Android.

### Build APK

```bash
# Build APK via EAS (perlu akun Expo)
eas build -p android --profile preview
```

---

## 🔌 Arsitektur & Backend

- **Frontend:** React Native + Expo Router (file-based routing), Context API untuk tema, bahasa, dan sesi.
- **Backend:** REST API berbasis PHP + MySQL, di-host di **InfinityFree** (`ambativasi.page.gd/ambativasi-api`).
- **Autentikasi:** Token (auth token) disimpan di sesi lokal dan dikirim sebagai `Authorization: Bearer <token>` pada setiap request.
- **Keamanan API:** Perlindungan anti-bot slowAES challenge + enkripsi transaksi.

### Struktur Folder Utama

```
app/
├── (tabs)/          # Halaman utama: Home, Chat, Leaderboard, Pengaturan
├── auth/            # Login, register, lupa kata sandi, reset
├── materi/          # Materi per mata pelajaran (PDF/video/kuis)
├── speech/          # Latihan membaca Al-Qur'an (speech recognition)
├── ujian/           # Latihan soal / ujian per bab
└── statistik/       # Statistik & streak belajar
src/
├── context/         # Context: tema, bahasa, sesi, chat
├── data/            # Data materi & sumber belajar
└── utils/           # Utilitas progres, streak, XP
```

---

## 📋 Changelog

### v1.0.4 (terbaru)

- ⬆️ **Pembaruan versi** ke 1.0.4 (build 2026).
- 🔐 **Autentikasi token** pada semua request API (`Authorization: Bearer <token>`) — sesi login lebih aman dan konsisten.
- 🐛 **Perbaikan sesi login**: `auth_token`, username, dan email kini tersimpan utuh saat login.
- 🧹 **Pembersihan kode**:
  - Hapus file data yang tidak terpakai (`materiChemicalEor.ts`).
  - Hapus *header development* `ngrok-skip-browser-warning` di halaman profil & pengaturan.
- 🏷️ **Penamaan komponen sesuai standar React** (komponen PDF diubah ke penamaan kapital) — memenuhi aturan *rules-of-hooks*.
- ⚡ **Perbaikan hook speech recognition**: pemanggilan `useSpeechRecognitionEvent` dipindah ke atas *early return* — mencegah pelanggaran urutan hooks.
- 🌍 **Migrasi backend** dari localhost ke server InfinityFree (`ambativasi.page.gd`).
- 🧰 **Penyempurnaan konfigurasi**: file `.gitattributes` agar line-ending kode konsisten lintas platform.

### v1.0.3

- Migrasi lengkap fitur voice recognition.
- Perombakan logic soal & materi (update besar).

---

## 🛠️ Teknologi

- **React Native 0.81** · **Expo SDK 54** · **Expo Router 6**
- React 19, TypeScript 5.9
- `expo-speech-recognition`, `react-native-pdf`, `react-native-youtube-iframe`
- `@react-native-async-storage/async-storage`, `react-native-toast-message`
- Backend: PHP + MySQL (InfinityFree)

---

## 📄 Lisensi

Proyek bersifat privat. Tidak boleh didistribusikan ulang tanpa izin pemilik.
