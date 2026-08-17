# Ambativasi — Aplikasi Belajar Interaktif

**Ambativasi** adalah aplikasi mobile belajar yang menggabungkan **materi pembelajaran**, **latihan soal (ujian)**, dan **latihan membaca Al-Qur'an berbasis suara** dalam satu platform. Dibangun dengan **React Native (Expo SDK 54)** dan memanfaatkan **backend API + database terpusat** sehingga progres belajar tersinkron di semua perangkat.

> **Versi saat ini:** 1.0.9 · Package: `org.misa.ambativasi`

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

### v1.1.0 (terbaru)

- 📱 **Layout lebih fleksibel & proporsional di semua HP Android**: berbagai elemen (Streak Card di Beranda, statistik gabungan, teks surah Al-Qur'an, modal crop foto profil) kini menyesuaikan lebar layar secara otomatis — tidak lagi ke-geser/terpotong/tertutup di layar kecil maupun besar.
- 🖼️ **Tampilan PDF materi tidak lagi terpotong**: viewer PDF kini memenuhi area konten secara proporsional (sebelumnya memakai tinggi layar penuh sehingga bagian bawah bisa terpotong oleh nav bar HP).
- ⌨️ **Form login/daftar/reset tidak tertutup keyboard**: halaman auth kini bisa di-scroll dan konten diangkat otomatis saat keyboard muncul di layar kecil.
- 🧭 **Halaman Al-Qur'an (Tilawah) rapi di HP ber-notch**: konten menyesuaikan area aman atas (status bar/notch) secara dinamis, dan panel surah tidak lagi terpotong.
- 💬 **Kolom chat AI tidak lagi tertutup keyboard**: saat mengetik pesan di halaman AI Chat, kolom input beserta tombol kirim kini terangkat otomatis di atas keyboard (diperbaiki untuk Android modern yang edge-to-edge).

### v1.0.9

- 📐 **Tombol logout Sidebar selalu di atas tab navigasi HP**: posisi tombol logout kini menyesuaikan inset bawah layar (system navigation bar) di semua halaman — tidak lagi tertutup/bentrok dengan navigasi bawaan HP saat membuka sidebar di halaman tanpa tab bar (materi, ujian, pusat bantuan, profil, dll).
- 📏 **Posisi tombol logout di halaman utama & Pengaturan dirapikan**: pada halaman dengan tab navigasi (Beranda, AI Chat, dsb) tombol logout kini duduk tepat di atas tab bar dengan jarak yang pas (tidak terlalu ke atas), karena tab bar sendiri yang menangani inset bawah layar.
- 👥 **Data belajar terpisah per akun**: jumlah subject, streak day, dan learning progress kini disimpan khusus per akun (mirip riwayat chat AI) — ganti akun tidak menampilkan data akun lain; data lama otomatis dimigrasi ke akun aktif.

### v1.0.8

- 🧠 **Tipe soal AI baru: Multiple Choice**: menggantikan tipe "Full" di seluruh materi & ujian (Bahasa Jepang, Tajwid, Petrofisika, Chemical EOR). Setiap soal multiple choice memiliki **2–3 jawaban benar** dari 4 opsi A/B/C/D — pengguna mengetuk beberapa opsi sekaligus (toggle), dan dinilai benar hanya jika semua jawaban benar terpilih.
- 🏷️ **Keterangan tipe terlihat di soal**: badge "MULTIPLE_CHOICE" ditampilkan di kartu soal seperti tipe lain, plus petunjuk "Pilih 2-3 jawaban yang benar dari opsi di bawah".
- 🌍 **Bahasa mengikuti materi**: soal multiple choice ditulis dalam bahasa pengantar materi yang dipilih (mis. Bahasa Jepang tetap dengan istilah/aksara Jepang sesuai materinya), bukan paksaan skrip asli.
- 🔄 **Chat AI terpisah per akun**: riwayat chat asisten AI kini disimpan khusus per akun (berdasarkan ID pengguna). Ganti akun → riwayat akun sebelumnya tidak ikut tampil; data lama otomatis dimigrasi ke akun aktif.

### v1.0.7

- 🆘 **Halaman Pusat Bantuan / FAQ baru**: daftar pertanyaan umum yang relevan dengan aplikasi (cara belajar, latihan soal, fitur AI, tilawah, ubah email/kata sandi, dsb). Ketuk pertanyaan untuk melihat jawabannya, plus kartu **"Ajukan Pertanyaan"** untuk menghubungi tim dukungan via email `ambativasi2829@gmail.com`.
- 🛡️ **Halaman Kebijakan Privasi baru**: dokumen resmi 11 pasal (pengumpulan data, keamanan, kode verifikasi, pihak ketiga, layanan AI, hak pengguna, kontak) yang relevan dengan sistem Ambativasi.
- 📜 **Halaman Syarat & Ketentuan baru**: dokumen resmi 11 pasal (akun, penggunaan yang diizinkan, kekayaan intelektual, batasan tanggung jawab, dll).
- 🎨 **Semua halaman baru mendukung tema gelap/terang dan multi-bahasa (Indonesia/English)**, lengkap dengan Navbar dan Sidebar — tombol kembali memakai bawaan sistem HP.
- ⚙️ **Menu Pengaturan diperbarui**: "Pusat Bantuan / FAQ" dan "Kebijakan Privasi" kini membuka halaman penuh, serta menu baru **"Syarat & Ketentuan"**. Modal FAQ & privasi lama dihapus.
- 🧭 **Halaman Ubah Email & Kata Sandi dirapikan**: layout konten di tengah layar, keterangan di atas form, tanpa tombol kembali custom, plus **modal peringatan** di tiap langkah (bukan toast).
- 💾 **Progress ubah email tersimpan sementara**: bila pengguna kembali di tengah alur (email lama → kode verifikasi → email baru), saat membuka lagi lanjut dari tahap terakhir — tidak perlu mengulang dari awal.

### v1.0.6

- 👤 **Ubah Email & Kata Sandi di halaman terpisah**: menu "Ubah Email" dan "Ubah Kata Sandi" di Pengaturan kini membuka halaman khusus (bukan modal) lengkap dengan Navbar, Sidebar, tema gelap/terang, dan multi-bahasa.
- 🔑 **Verifikasi identitas saat ubah email**: pengguna memasukkan email terdaftar, lalu sistem mengirim **kode verifikasi 6 digit** ke email tersebut (berlaku 5 menit, sekali pakai) sebagai konfirmasi sebelum email diganti.
- 🛡️ **Proteksi anti-spam kirim kode**: jeda minimal 60 detik antar pengiriman kode verifikasi — tidak bisa di-spam.
- 🔐 **Ubah kata sandi lebih aman**: form kata sandi lama → baru + konfirmasi dengan validasi panjang (min. 8 karakter), kecocokan, dan beda dari kata sandi lama.
- 🧹 **Pembersihan berkas suara yang tidak terpakai**: file `alert.mp3`, `correct.mp3`, `navigate.mp3`, `wrong.mp3` dihapus beserta kode `playAlert/playCorrect/playNavigate/playWrong` agar aplikasi lebih ringan.

### v1.0.5

- 🧭 **Navigasi surat & ayat baru di fitur Speech Al-Qur'an**: header dengan panah ‹ › untuk berpindah surat, plus dropdown pilih surat & pilih ayat langsung dari atas — mengikuti tema gelap/terang dan multi-bahasa.
- 🗂️ **Menu Materi Tajwid Al-Fatihah dirapikan**: klik "Buka Materi PDF (materi tajwid)" kini langsung membuka file PDF tanpa dropdown bertingkat (membersihkan sisa kode dari materi Bahasa Jepang).
- 📄 **Perbaikan sumber materi PDF Chemical EOR Polimer** (`Mobility Ratio, HPAM & Sweep Efficiency`) ke file Google Drive yang valid — viewer PDF langsung terbuka tanpa unduhan rusak.
- 🧹 **Pembersihan berkas suara**: memastikan seluruh file sound di `assets/sounds` benar-benar terpakai (efek tombol, kuis, dan notifikasi aplikasi).

### v1.0.4

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
- 🐛 **Perbaikan crash saat membuka aplikasi** (`ClassNotFoundException: AnyTypeCache`): dependency `expo-asset` kini di-pin ke `~12.0.13` (SDK 54), mencegah npm menaikkan versi SDK 55 secara tidak sengaja lewat `expo-audio`.

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
