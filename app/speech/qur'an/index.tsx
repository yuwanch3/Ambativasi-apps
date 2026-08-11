// ============================================================
// 1. IMPORT LIBRARY
// ============================================================
import { useAudioPlayer } from "expo-audio";
import { useFonts } from "expo-font";
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { WebView } from "react-native-webview";

import { Ionicons } from "@expo/vector-icons";

import API_URL, { apiFetch } from "../../../config";
import { useLanguage } from "../../../context/LanguageContext";
import {
    useTheme,
    type ThemeColors,
} from "../../../context/ThemeContext";
import { getSession } from "../../../src/utils/session";
import { getCurrentStreak, recordActivity } from "../../../src/utils/streakTracker";
import { JUZ_AMMA_PART_1, type SurahOption } from "./data/juzAmmaPart1";
import { JUZ_AMMA_PART_2 } from "./data/juzAmmaPart2";
import { QURAN_FONT_DATA_URI } from "./data/quranFont";

// ============================================================
// 2. TYPE DATA UNTUK STATUS KATA DAN PROGRES AYAT
// ============================================================
type WordStatus = "idle" | "correct" | "wrong";

type VerseProgress = {
  statuses: WordStatus[];
  matchedWords: number;
  hasWrong: boolean;
  isComplete: boolean;
};

// ============================================================
// 3. KONSTANTA APLIKASI
// ============================================================
const SURAH_OPTIONS: SurahOption[] = [...JUZ_AMMA_PART_1, ...JUZ_AMMA_PART_2];

const WAVE_BAR_HEIGHTS = [
  34, 20, 28, 42, 24, 32, 38, 22, 30, 46, 36, 26, 40, 28, 34, 44,
];

// ============================================================
// 4. FUNGSI PEMBANTU PEMROSESAN TEKS ARAB
// ============================================================

// Menghapus harakat dan menyamakan bentuk huruf Arab agar mudah dibandingkan.
function normalizeArabic(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/[^\u0621-\u064a\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Menggabungkan awalan Arab seperti ب, و, ف, ل, ك yang kadang dipisah oleh speech recognition.
function mergeArabicPrefixWords(text: string, removeHarakat = true): string[] {
  const preparedText = removeHarakat
    ? normalizeArabic(text)
    : text.replace(/\s+/g, " ").trim();

  const words = preparedText.split(/\s+/).filter(Boolean);

  const mergedWords: string[] = [];

  for (let index = 0; index < words.length; index += 1) {
    const currentWord = words[index];
    const nextWord = words[index + 1];

    const normalizedCurrentWord = normalizeArabic(currentWord);

    const isArabicPrefix = ["ب", "و", "ف", "ل", "ك"].includes(
      normalizedCurrentWord,
    );

    if (isArabicPrefix && nextWord) {
      mergedWords.push(`${currentWord}${nextWord}`);

      index += 1;
      continue;
    }

    mergedWords.push(currentWord);
  }

  return mergedWords;
}

// Mengamankan teks sebelum dimasukkan ke HTML WebView.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Menghitung jumlah perbedaan karakter antara dua kata.
function calculateEditDistance(firstText: string, secondText: string): number {
  const rows = firstText.length + 1;
  const columns = secondText.length + 1;

  const distances = Array.from({ length: rows }, () =>
    Array<number>(columns).fill(0),
  );

  for (let row = 0; row < rows; row += 1) {
    distances[row][0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    distances[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost =
        firstText[row - 1] === secondText[column - 1] ? 0 : 1;

      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return distances[rows - 1][columns - 1];
}

// Skor kemiripan 0-1 untuk penyelarasan kata.
// Huruf pertama harus sama; jika beda dianggap tidak cocok sama sekali.
function calculateSimilarity(spokenText: string, expectedText: string): number {
  const spoken = normalizeArabic(spokenText);
  const expected = normalizeArabic(expectedText);

  if (!spoken || !expected) {
    return 0;
  }

  if (spoken === expected) {
    return 1;
  }

  if (spoken[0] !== expected[0]) {
    return 0;
  }

  const longestLength = Math.max(spoken.length, expected.length);

  const editDistance = calculateEditDistance(spoken, expected);

  return Math.max(0, 1 - editDistance / longestLength);
}

// Keputusan tegas benar atau salah sebuah kata.
// Jauh lebih ketat daripada skor penyelarasan:
// hanya kata dengan kemiripan tinggi yang dianggap benar.
// Efeknya kata pendek harus cocok persis (1 huruf beda langsung
// menurunkan skor di bawah ambang), sementara kata panjang masih
// mentoleransi 1 huruf berbeda dari noise speech recognition.
const WORD_CORRECT_THRESHOLD = 0.85;

function isWordCorrect(spokenText: string, expectedText: string): boolean {
  const spoken = normalizeArabic(spokenText);
  const expected = normalizeArabic(expectedText);

  if (!spoken || !expected) {
    return false;
  }

  if (spoken === expected) {
    return true;
  }

  return calculateSimilarity(spoken, expected) >= WORD_CORRECT_THRESHOLD;
}

// Menyelaraskan kata yang diucapkan dengan kata yang diharapkan.
// Dynamic programming (monotone matching) sehingga kata yang
// bertambah atau hilang dari hasil speech recognition tidak
// menggeser penilaian kata-kata berikutnya.
function alignWords(
  spokenWords: string[],
  expectedWords: string[],
): Array<number | null> {
  const spokenCount = spokenWords.length;
  const expectedCount = expectedWords.length;

  const scores: number[][] = [];

  for (let i = 0; i < spokenCount; i += 1) {
    scores[i] = [];

    for (let j = 0; j < expectedCount; j += 1) {
      scores[i][j] = calculateSimilarity(spokenWords[i], expectedWords[j]);
    }
  }

  const dp: number[][] = [];

  for (let i = 0; i <= spokenCount; i += 1) {
    dp[i] = new Array<number>(expectedCount + 1).fill(0);
  }

  const backtrack: string[][] = [];

  for (let i = 0; i <= spokenCount; i += 1) {
    backtrack[i] = new Array<string>(expectedCount + 1).fill("");
  }

  for (let i = 1; i <= spokenCount; i += 1) {
    for (let j = 1; j <= expectedCount; j += 1) {
      const matchScore = dp[i - 1][j - 1] + scores[i - 1][j - 1];
      const skipSpokenScore = dp[i - 1][j];
      const skipExpectedScore = dp[i][j - 1];

      if (matchScore >= skipSpokenScore && matchScore >= skipExpectedScore) {
        dp[i][j] = matchScore;
        backtrack[i][j] = "match";
      } else if (skipSpokenScore >= skipExpectedScore) {
        dp[i][j] = skipSpokenScore;
        backtrack[i][j] = "skipSpoken";
      } else {
        dp[i][j] = skipExpectedScore;
        backtrack[i][j] = "skipExpected";
      }
    }
  }

  // Backtrack untuk mencari pasangan spoken -> expected.
  const matchedExpected: Array<number | null> = new Array(expectedCount).fill(
    null,
  );

  let spokenIndex = spokenCount;
  let expectedIndex = expectedCount;

  while (spokenIndex > 0 && expectedIndex > 0) {
    const choice = backtrack[spokenIndex][expectedIndex];

    if (choice === "match") {
      matchedExpected[expectedIndex - 1] = spokenIndex - 1;
      spokenIndex -= 1;
      expectedIndex -= 1;
    } else if (choice === "skipSpoken") {
      spokenIndex -= 1;
    } else {
      expectedIndex -= 1;
    }
  }

  return matchedExpected;
}

// Membuat status awal semua kata menjadi idle atau hitam.
function getInitialWordStatuses(verseText: string): WordStatus[] {
  return mergeArabicPrefixWords(verseText, false).map(() => "idle");
}

// Memeriksa bacaan pengguna dan menentukan kata benar, salah, atau belum dibaca.
function getVerseProgress(
  spokenText: string,
  verseText: string,
): VerseProgress {
  const spokenWords = mergeArabicPrefixWords(spokenText, true);

  const rawExpectedWords = mergeArabicPrefixWords(verseText, false);

  const expectedWords = rawExpectedWords.map((word) => normalizeArabic(word));

  const statuses: WordStatus[] = rawExpectedWords.map(() => "idle");

  if (spokenWords.length === 0) {
    return {
      statuses,
      matchedWords: 0,
      hasWrong: false,
      isComplete: false,
    };
  }

  const matchedExpected = alignWords(spokenWords, expectedWords);

  // Indeks kata harapan terakhir yang mendapat pasangan ucapan.
  // Kata harapan setelah indeks ini dianggap belum terbaca (idle).
  let lastMatchedIndex = -1;

  for (let index = 0; index < matchedExpected.length; index += 1) {
    if (matchedExpected[index] !== null) {
      lastMatchedIndex = index;
    }
  }

  let matchedWords = 0;
  let hasWrong = false;

  for (let index = 0; index < rawExpectedWords.length; index += 1) {
    if (index > lastMatchedIndex) {
      continue;
    }

    const spokenIndex = matchedExpected[index];

    if (
      spokenIndex !== null &&
      isWordCorrect(spokenWords[spokenIndex], rawExpectedWords[index])
    ) {
      statuses[index] = "correct";
      matchedWords += 1;
    } else {
      statuses[index] = "wrong";
      hasWrong = true;
    }
  }

  const isComplete = matchedWords === rawExpectedWords.length && !hasWrong;

  return {
    statuses,
    matchedWords,
    hasWrong,
    isComplete,
  };
}

// Menambahkan kembali harakat untuk tampilan Teks Terdengar jika kata cocok.
function restoreHarakatFromExpected(
  transcript: string,
  expectedText: string,
): string {
  if (!transcript.trim()) {
    return "";
  }

  const transcriptWords = mergeArabicPrefixWords(transcript, true);

  const expectedWords = mergeArabicPrefixWords(expectedText, false);

  return transcriptWords
    .map((transcriptWord, index) => {
      const expectedWord = expectedWords[index];

      if (!expectedWord) {
        return transcriptWord;
      }

      const normalizedTranscriptWord = normalizeArabic(transcriptWord);

      const normalizedExpectedWord = normalizeArabic(expectedWord);

      if (normalizedTranscriptWord === normalizedExpectedWord) {
        return expectedWord;
      }

      return transcriptWord;
    })
    .join(" ");
}

// Menggabungkan hasil speech recognition bertahap agar kata tidak berulang.
function mergeTranscriptParts(
  finalizedText: string,
  incomingText: string,
): string {
  const finalized = finalizedText.replace(/\s+/g, " ").trim();

  const incoming = incomingText.replace(/\s+/g, " ").trim();

  if (!finalized) {
    return incoming;
  }

  if (!incoming) {
    return finalized;
  }

  const normalizedFinalized = normalizeArabic(finalized);

  const normalizedIncoming = normalizeArabic(incoming);

  if (
    normalizedIncoming === normalizedFinalized ||
    normalizedIncoming.startsWith(normalizedFinalized)
  ) {
    return incoming;
  }

  if (normalizedFinalized.startsWith(normalizedIncoming)) {
    return finalized;
  }

  const finalizedWords = finalized.split(/\s+/);
  const incomingWords = incoming.split(/\s+/);

  const maximumOverlap = Math.min(finalizedWords.length, incomingWords.length);

  let overlapLength = 0;

  for (let length = maximumOverlap; length > 0; length -= 1) {
    const finalizedEnding = finalizedWords
      .slice(-length)
      .map(normalizeArabic)
      .join(" ");

    const incomingBeginning = incomingWords
      .slice(0, length)
      .map(normalizeArabic)
      .join(" ");

    if (finalizedEnding === incomingBeginning) {
      overlapLength = length;
      break;
    }
  }

  return [...finalizedWords, ...incomingWords.slice(overlapLength)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// 5. KOMPONEN UTAMA APLIKASI
// ============================================================
export default function App() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Terjemahan dengan placeholder: tr("key", { ayah: 3 }).
  const tr = (key: string, params?: Record<string, string | number>) => {
    let text = t(key);
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replaceAll(`{${paramKey}}`, String(value));
      });
    }
    return text;
  };

  // Notifikasi modal pengganti Alert.alert default.
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const showNotification = (title: string, message: string) => {
    setNotification({ title, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const styles = createStyles(colors);

  // Font Quran untuk tampilan Teks Terdengar.
  const [fontsLoaded] = useFonts({
    "Amiri Quran": require("../../../assets/fonts/AmiriQuran.ttf"),
  });

  // ----------------------------------------------------------
  // 5A. PEMUTAR SUARA TOMBOL, BERHASIL, DAN SALAH
  // ----------------------------------------------------------
  const buttonSoundPlayer = useAudioPlayer(
    require("../../../assets/sounds/button.mp3"),
  );

  const successSoundPlayer = useAudioPlayer(
    require("../../../assets/sounds/success.mp3"),
  );

  const errorSoundPlayer = useAudioPlayer(
    require("../../../assets/sounds/error.mp3"),
  );

  // ----------------------------------------------------------
  // 5B. STATE SURAT, AYAT, REKAMAN, DAN TAMPILAN
  // ----------------------------------------------------------
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0);

  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

  const [savedAyahIndexes, setSavedAyahIndexes] = useState<
    Record<number, number>
  >({});

  const [isRecognizing, setIsRecognizing] = useState(false);

  const [isPreparing, setIsPreparing] = useState(false);

  const [isAyahCompleted, setIsAyahCompleted] = useState(false);

  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // Menandai bahwa ayat sedang bergerak ke posisi berikutnya.
  const [isVerseTransitioning, setIsVerseTransitioning] = useState(false);

  const [, setCompletedSurahIndexes] = useState<number[]>([]);

  const [isSurahPickerVisible, setIsSurahPickerVisible] = useState(false);

  const [isAyahPickerVisible, setIsAyahPickerVisible] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");

  const [recognizedWordStatuses, setRecognizedWordStatuses] = useState<
    WordStatus[]
  >(
    SURAH_OPTIONS[0]?.verses[0]?.text
      ? getInitialWordStatuses(SURAH_OPTIONS[0].verses[0].text)
      : [],
  );

  const [liveTranscript, setLiveTranscript] = useState("");

  // ----------------------------------------------------------
  // 5C. REF UNTUK MENYIMPAN DATA REKAMAN TANPA RENDER ULANG
  // ----------------------------------------------------------
  const stopRequestedRef = useRef(false);
  const ayahAcceptedRef = useRef(false);
  const finalizedTranscriptRef = useRef("");
  const latestTranscriptRef = useRef("");
  // Menandakan pengguna sedang menjalankan
  // sesi membaca ayat secara otomatis.
  const autoReadingSessionRef = useRef(false);

  // Mencegah perpindahan ayat dijalankan dua kali.
  const isAutoAdvancingRef = useRef(false);

  const latestProgressRef = useRef<VerseProgress | null>(null);

  // ----------------------------------------------------------
  // 5C2. AKUMULATOR XP TILAWAH PER SESI
  // Kata benar dihitung per ayat, lalu disubmit satu kali
  // saat sesi berhenti (aman untuk server dan tidak hangus
  // kalau berhenti di tengah surah).
  // ----------------------------------------------------------
  const sessionStatsRef = useRef<{
    correct: number;
    total: number;
    countedAyahs: Set<string>;
  }>({ correct: 0, total: 0, countedAyahs: new Set() });

  const isSubmittingXpRef = useRef(false);

  const addAyahWords = (ayahKey: string, statuses: WordStatus[]) => {
    if (sessionStatsRef.current.countedAyahs.has(ayahKey)) {
      return;
    }
    const total = statuses.length;
    const correct = statuses.filter((s) => s === "correct").length;
    sessionStatsRef.current.correct += correct;
    sessionStatsRef.current.total += total;
    sessionStatsRef.current.countedAyahs.add(ayahKey);
  };

  const resetSessionStats = () => {
    sessionStatsRef.current = {
      correct: 0,
      total: 0,
      countedAyahs: new Set(),
    };
  };

  const submitTilawahSession = async () => {
    if (isSubmittingXpRef.current) {
      return;
    }
    if (sessionStatsRef.current.total === 0) {
      return;
    }
    isSubmittingXpRef.current = true;
    try {
      const session = await getSession();
      if (!session?.email) {
        return;
      }
      const streak = await getCurrentStreak();
      await apiFetch(`${API_URL}/submit-xp.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.email,
          type: "tilawah",
          correct: sessionStatsRef.current.correct,
          total: sessionStatsRef.current.total,
          streak,
        }),
      });
      await recordActivity();
      resetSessionStats();
    } catch (e) {
      console.log("Gagal kirim XP tilawah ke server", e);
    } finally {
      isSubmittingXpRef.current = false;
    }
  };

  // ----------------------------------------------------------
  // 5D. ANIMASI GELOMBANG SAAT SEDANG MEREKAM
  // ----------------------------------------------------------
  const waveAnimations = useRef(
    WAVE_BAR_HEIGHTS.map(() => new Animated.Value(0.45)),
  ).current;

  useEffect(() => {
    if (!isRecognizing) {
      waveAnimations.forEach((animation) => {
        animation.stopAnimation();
        animation.setValue(0.45);
      });

      return;
    }

    const barAnimations = waveAnimations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 35),
          Animated.timing(animation, {
            toValue: 1,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0.4,
            duration: 280,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    const waveformAnimation = Animated.parallel(barAnimations);

    waveformAnimation.start();

    return () => {
      waveformAnimation.stop();

      waveAnimations.forEach((animation) => {
        animation.setValue(0.45);
      });
    };
  }, [isRecognizing, waveAnimations]);

  // ----------------------------------------------------------
  // 5E. DATA SURAT AKTIF, AYAT AKTIF, AYAT SEBELUM, DAN SESUDAH
  // ----------------------------------------------------------
  const activeSurah = SURAH_OPTIONS[currentSurahIndex] || SURAH_OPTIONS[0];

  // 5I. EVENT SPEECH RECOGNITION
  // ----------------------------------------------------------
  // Event ketika mikrofon mulai mendengarkan.
  useSpeechRecognitionEvent("start", () => {
    setIsPreparing(false);
    setIsRecognizing(true);
    stopRequestedRef.current = false;

    setStatusMessage(tr("speech_reading_ayah", { ayah: activeVerse.ayah }));
  });

  // Event ketika hasil suara masuk secara real-time.
  useSpeechRecognitionEvent("result", (event: any) => {
    if (stopRequestedRef.current || ayahAcceptedRef.current) {
      return;
    }

    const transcript = event.results[0]?.transcript?.trim() ?? "";

    if (!transcript) {
      return;
    }

    const combinedTranscript = mergeTranscriptParts(
      finalizedTranscriptRef.current,
      transcript,
    );

    latestTranscriptRef.current = combinedTranscript;
    setLiveTranscript(combinedTranscript);

    const progress = getVerseProgress(combinedTranscript, activeVerse.text);

    latestProgressRef.current = progress;
    setRecognizedWordStatuses(progress.statuses);

    if (event.isFinal) {
      finalizedTranscriptRef.current = combinedTranscript;
    }

    if (progress.isComplete) {
      // Hanya lanjut otomatis jika transkrip sudah final,
      // agar hasil sementara (partial) tidak memicu perpindahan ayat.
      if (event.isFinal) {
        completeCurrentAyahAutomatically();
      }

      return;
    }

    if (progress.hasWrong) {
      setStatusMessage(
        tr("speech_error_ayah", { ayah: activeVerse.ayah }),
      );
      return;
    }

    if (progress.matchedWords > 0) {
      setStatusMessage(tr("speech_reading_ayah", { ayah: activeVerse.ayah }));
      return;
    }

    setStatusMessage(t("speech_listening"));
  });

  // Event ketika suara tidak cocok atau tidak dikenali.
  useSpeechRecognitionEvent("nomatch", () => {
    if (stopRequestedRef.current || ayahAcceptedRef.current) {
      return;
    }

    setStatusMessage(tr("speech_not_recognized", { ayah: activeVerse.ayah }));
  });

  // Event ketika speech recognition mengalami error.
  useSpeechRecognitionEvent("error", (event: any) => {
    if (
      event.error === "aborted" ||
      stopRequestedRef.current ||
      ayahAcceptedRef.current
    ) {
      return;
    }
    autoReadingSessionRef.current = false;
    isAutoAdvancingRef.current = false;

    setIsPreparing(false);
    setIsRecognizing(false);

    setStatusMessage(
      tr("speech_recognition_failed", { message: event.message }),
    );
  });

  // Event ketika proses mendengarkan berakhir.
  useSpeechRecognitionEvent("end", () => {
    setIsPreparing(false);
    setIsRecognizing(false);

    // Safety net: jika transkrip akhir sudah lengkap dan benar
    // tetapi engine tidak mengirim event final, tetap lanjut.
    if (latestProgressRef.current?.isComplete && !ayahAcceptedRef.current) {
      completeCurrentAyahAutomatically();
    }
  });

  // Mencegah crash jika activeSurah atau verses bernilai undefined
  if (!activeSurah || !activeSurah.verses || activeSurah.verses.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4f7cff" />
          <Text style={{ color: colors.text, marginTop: 12 }}>
            {t("speech_loading_surah")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeVerse =
    activeSurah.verses[currentAyahIndex] || activeSurah.verses[0];

  const previousVerse =
    currentAyahIndex > 0 ? activeSurah.verses[currentAyahIndex - 1] : null;

  const nextVerse =
    currentAyahIndex < activeSurah.verses.length - 1
      ? activeSurah.verses[currentAyahIndex + 1]
      : null;

  const liveTranscriptWithHarakat = restoreHarakatFromExpected(
    liveTranscript,
    activeVerse.text,
  );

  // ----------------------------------------------------------
  // 5F. FUNGSI PEMUTAR SUARA
  // ----------------------------------------------------------
  const playButtonSound = () => {
    buttonSoundPlayer.seekTo(0);
    buttonSoundPlayer.play();
  };

  const playSuccessSound = () => {
    successSoundPlayer.seekTo(0);
    successSoundPlayer.play();
  };

  const playErrorSound = () => {
    errorSoundPlayer.seekTo(0);
    errorSoundPlayer.play();
  };

  // ----------------------------------------------------------
  // 5G. RESET AYAT DAN NAVIGASI KE AYAT ATAU SURAT BERIKUTNYA
  // ----------------------------------------------------------
  const resetCurrentAyah = (verseText: string) => {
    finalizedTranscriptRef.current = "";
    latestTranscriptRef.current = "";
    latestProgressRef.current = null;
    stopRequestedRef.current = false;
    ayahAcceptedRef.current = false;

    setLiveTranscript("");
    setIsAyahCompleted(false);
    setIsVerseTransitioning(false);

    setRecognizedWordStatuses(getInitialWordStatuses(verseText));
  };

  const markSurahAsCompleted = (surahIndex: number) => {
    setCompletedSurahIndexes((currentIndexes) => {
      if (currentIndexes.includes(surahIndex)) {
        return currentIndexes;
      }

      return [...currentIndexes, surahIndex];
    });
  };

  // 5H. AYAT BENAR → NOTIFIKASI → OTOMATIS LANJUT
  // ----------------------------------------------------------
  const completeCurrentAyahAutomatically = () => {
    // Mencegah fungsi berjalan dua kali dari
    // beberapa hasil speech recognition yang sama.
    if (isAutoAdvancingRef.current || ayahAcceptedRef.current) {
      return;
    }

    isAutoAdvancingRef.current = true;
    ayahAcceptedRef.current = true;
    stopRequestedRef.current = true;

    // Simpan posisi ayat yang harus dibaca berikutnya.
    const savedNextAyahIndex = Math.min(
      currentAyahIndex + 1,
      activeSurah.verses.length - 1,
    );

    setSavedAyahIndexes((currentIndexes) => ({
      ...currentIndexes,
      [activeSurah.number]: savedNextAyahIndex,
    }));

    // Jadikan seluruh kata pada ayat aktif berwarna hijau.
    setRecognizedWordStatuses(
      mergeArabicPrefixWords(activeVerse.text, false).map(() => "correct"),
    );

    // Akumulasi XP tilawah: seluruh kata ayat ini dihitung benar.
    addAyahWords(
      `${activeSurah.number}-${activeVerse.ayah}`,
      mergeArabicPrefixWords(activeVerse.text, false).map(
        () => "correct",
      ) as WordStatus[],
    );

    setStatusMessage(
      tr("speech_ayah_correct", { ayah: activeVerse.ayah }),
    );

    // Jalankan animasi perpindahan ayat.
    setIsVerseTransitioning(true);

    // Hentikan mikrofon agar suara notifikasi
    // tidak ikut dikenali sebagai bacaan.
    ExpoSpeechRecognitionModule.stop();

    // Mainkan suara berhasil setelah mikrofon berhenti.
    setTimeout(() => {
      playSuccessSound();
    }, 150);

    const isLastAyah = currentAyahIndex === activeSurah.verses.length - 1;

    const isLastSurah = currentSurahIndex === SURAH_OPTIONS.length - 1;

    // Semua surat Juz Amma selesai.
    if (isLastAyah && isLastSurah) {
      setTimeout(() => {
        autoReadingSessionRef.current = false;
        isAutoAdvancingRef.current = false;

        setIsRecognizing(false);
        setIsPreparing(false);
        setIsVerseTransitioning(false);
        setIsAllCompleted(true);

        // Kirim XP untuk seluruh sesi tilawah yang sudah selesai.
        void submitTilawahSession();

        setStatusMessage(t("speech_all_done_status"));

        showNotification(
          t("speech_all_done_title"),
          t("speech_all_done_message"),
        );
      }, 900);

      return;
    }

    let nextSurahIndex = currentSurahIndex;
    let nextAyahIndex = currentAyahIndex + 1;

    // Setelah ayat terakhir, lanjut ke surat berikutnya.
    if (isLastAyah) {
      nextSurahIndex = currentSurahIndex + 1;
      nextAyahIndex = 0;

      markSurahAsCompleted(currentSurahIndex);
    }

    const nextSurah = SURAH_OPTIONS[nextSurahIndex];

    const nextVerse = nextSurah.verses[nextAyahIndex];

    // Tunggu animasi selesai sebelum mengganti ayat aktif.
    setTimeout(() => {
      // Pertahankan panel sesi membaca agar tombol Rekam
      // tidak muncul sebentar saat pergantian ayat.
      setIsPreparing(true);

      setCurrentSurahIndex(nextSurahIndex);
      setCurrentAyahIndex(nextAyahIndex);

      resetCurrentAyah(nextVerse.text);

      setStatusMessage(
        tr("speech_read_next", { name: nextSurah.name, ayah: nextVerse.ayah }),
      );

      isAutoAdvancingRef.current = false;

      // Mikrofon aktif kembali secara otomatis.
      if (autoReadingSessionRef.current) {
        setTimeout(() => {
          void startRecognitionForVerse(nextSurahIndex, nextAyahIndex, false);
        }, 350);
      }
    }, 850);
  };

  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // MEMULAI REKAMAN UNTUK SURAT DAN AYAT TERTENTU
  // Dipakai saat pertama menekan Rekam dan saat
  // otomatis melanjutkan ke ayat berikutnya.
  // ----------------------------------------------------------
  const startRecognitionForVerse = async (
    surahIndex: number,
    ayahIndex: number,
    shouldResetAyah: boolean,
  ) => {
    const targetSurah = SURAH_OPTIONS[surahIndex];

    const targetVerse = targetSurah.verses[ayahIndex];

    try {
      setIsPreparing(true);

      if (shouldResetAyah) {
        resetCurrentAyah(targetVerse.text);
      }

      const recognitionAvailable =
        ExpoSpeechRecognitionModule.isRecognitionAvailable();

      if (!recognitionAvailable) {
        throw new Error(t("speech_service_unavailable"));
      }

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        autoReadingSessionRef.current = false;

        setIsPreparing(false);

        setStatusMessage(t("speech_mic_denied"));

        showNotification(t("speech_permission_title"), t("speech_permission_message"));

        return;
      }

      setStatusMessage(tr("speech_reading_ayah", { ayah: targetVerse.ayah }));

      ExpoSpeechRecognitionModule.start({
        lang: "ar-SA",
        interimResults: true,
        continuous: true,
        maxAlternatives: 1,
        contextualStrings: targetSurah.verses.map((verse) =>
          normalizeArabic(verse.text),
        ),
      });
    } catch (error) {
      autoReadingSessionRef.current = false;

      setIsPreparing(false);
      setIsRecognizing(false);

      const message =
        error instanceof Error
          ? error.message
          : t("speech_cannot_start");

      setStatusMessage(message);

      showNotification(t("speech_recognition_failed_title"), message);
    }
  };

  // ----------------------------------------------------------
  // 5J. FUNGSI MULAI DAN HENTIKAN REKAMAN
  // ----------------------------------------------------------
  // ----------------------------------------------------------
  // TOMBOL REKAM PERTAMA KALI
  // Memulai sesi membaca otomatis.
  // ----------------------------------------------------------
  const startRecognition = async () => {
    if (isRecognizing || isPreparing || isAllCompleted) {
      return;
    }

    autoReadingSessionRef.current = true;

    await startRecognitionForVerse(currentSurahIndex, currentAyahIndex, true);
  };

  const stopRecognition = async () => {
    autoReadingSessionRef.current = false;

    if (!isRecognizing && !isPreparing) {
      return;
    }

    stopRequestedRef.current = true;

    const checkedProgress = latestTranscriptRef.current
      ? getVerseProgress(latestTranscriptRef.current, activeVerse.text)
      : latestProgressRef.current;

    ExpoSpeechRecognitionModule.stop();
    playButtonSound();

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 150);
    });

    // Akumulasi kata yang benar pada ayat aktif (meski sebagian)
    // lalu kirim XP sesi ini satu kali. Aman: kata yang sudah
    // dihitung saat ayat selesai otomatis tidak dihitung dua kali.
    if (checkedProgress) {
      addAyahWords(
        `${activeSurah.number}-${activeVerse.ayah}`,
        checkedProgress.statuses,
      );
    }
    void submitTilawahSession();

    if (!checkedProgress) {
      setStatusMessage(tr("speech_ayah_not_read", { ayah: activeVerse.ayah }));

      playErrorSound();

      showNotification(
        t("speech_not_read_title"),
        tr("speech_not_read_message", { ayah: activeVerse.ayah }),
      );

      return;
    }

    const allWordsAreGreen =
      checkedProgress.statuses.length > 0 &&
      checkedProgress.statuses.every((status) => status === "correct");

    if (checkedProgress.isComplete || allWordsAreGreen) {
      // Pengguna menekan tombol berhenti secara manual.
      // Ayat tetap dinyatakan benar, tetapi sesi tidak
      // dilanjutkan otomatis ke ayat berikutnya.
      ayahAcceptedRef.current = true;

      setRecognizedWordStatuses(
        mergeArabicPrefixWords(activeVerse.text, false).map(() => "correct"),
      );

      setStatusMessage(
        tr("speech_read_correct", { ayah: activeVerse.ayah }),
      );

      playSuccessSound();

      return;
    }

    if (checkedProgress.hasWrong) {
      setStatusMessage(
        tr("speech_error_ayah", { ayah: activeVerse.ayah }),
      );

      playErrorSound();

      showNotification(
        t("speech_incorrect_title"),
        tr("speech_incorrect_message", { ayah: activeVerse.ayah }),
      );

      return;
    }

    setStatusMessage(tr("speech_not_finished", { ayah: activeVerse.ayah }));

    playErrorSound();

    showNotification(
      t("speech_not_finished_title"),
      tr("speech_not_finished_message", { ayah: activeVerse.ayah }),
    );
  };

  // ----------------------------------------------------------
  // TOMBOL REKAM DAN TOMBOL BERHENTI
  // ----------------------------------------------------------
  const handleRecordButtonPress = () => {
    if (isRecognizing || isPreparing) {
      // Pengguna menghentikan seluruh sesi otomatis.
      autoReadingSessionRef.current = false;
      isAutoAdvancingRef.current = false;

      void stopRecognition();
      return;
    }

    playButtonSound();

    // Sekali ditekan, sesi akan terus berjalan
    // sampai pengguna menekan tombol berhenti.
    autoReadingSessionRef.current = true;

    void startRecognition();
  };

  // ----------------------------------------------------------
  // 5L. FUNGSI TOMBOL PILIH SURAT
  // ----------------------------------------------------------
  const selectSurah = (surahIndex: number) => {
    if (isRecognizing || isPreparing || isVerseTransitioning) {
      return;
    }

    playButtonSound();

    const selectedSurah = SURAH_OPTIONS[surahIndex];

    const savedAyahIndex = savedAyahIndexes[selectedSurah.number] ?? 0;

    const savedVerse = selectedSurah.verses[savedAyahIndex];

    setCurrentSurahIndex(surahIndex);
    setCurrentAyahIndex(savedAyahIndex);
    resetCurrentAyah(savedVerse.text);

    setIsAllCompleted(false);
    setIsSurahPickerVisible(false);
    setIsAyahPickerVisible(false);

    setStatusMessage(
      savedAyahIndex > 0
        ? tr("speech_surah_resumed", { name: selectedSurah.name, ayah: savedVerse.ayah })
        : tr("speech_surah_selected", { name: selectedSurah.name }),
    );
  };

  // ----------------------------------------------------------
  // 5M. FUNGSI TOMBOL PILIH AYAT
  // ----------------------------------------------------------
  const selectAyah = (ayahIndex: number) => {
    if (isRecognizing || isPreparing || isVerseTransitioning) {
      return;
    }

    playButtonSound();

    const selectedVerse = activeSurah.verses[ayahIndex];

    setCurrentAyahIndex(ayahIndex);

    setSavedAyahIndexes((currentIndexes) => ({
      ...currentIndexes,
      [activeSurah.number]: ayahIndex,
    }));

    resetCurrentAyah(selectedVerse.text);

    setIsAllCompleted(false);
    setIsAyahPickerVisible(false);

    setStatusMessage(
      tr("speech_ayah_selected", { name: activeSurah.name, ayah: selectedVerse.ayah }),
    );
  };

  // ----------------------------------------------------------
  // 5N. MEMBENTUK HTML TIGA AYAT DAN WARNA KATA AKTIF
  // ----------------------------------------------------------
  const activeVerseWords = mergeArabicPrefixWords(activeVerse.text, false);

  const activeVerseHtml = activeVerseWords
    .map((word, index) => {
      const status = recognizedWordStatuses[index] ?? "idle";

      const color =
        status === "correct"
          ? "#25b925"
          : status === "wrong"
            ? "#e32636"
            : colors.text;

      return `
        <span style="color: ${color};">
          ${escapeHtml(word)}
        </span>
      `;
    })
    .join(" ");

  const threeAyahHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <style>
      * {
        box-sizing: border-box;
      }

      @font-face {
        font-family: "Amiri Quran";
        src: url("${QURAN_FONT_DATA_URI}") format("truetype");
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background-color: ${colors.background};
      }

      body {
        font-family:
          "Amiri Quran",
          "Noto Naskh Arabic",
          "Traditional Arabic",
          serif;
        direction: rtl;
        text-align: right;
      }

      .verse {
        padding: 12px 8px;
        color: ${colors.text};
        line-height: 2;
        transition: transform 650ms ease, opacity 650ms ease, background-color 650ms ease;
      }

      .previous,
      .next {
        font-size: 23px;
        opacity: 0.58;
      }

      .active {
        margin: 8px 0;
        padding: 18px 10px;
        border-radius: 14px;
        background-color: ${colors.card};
        font-size: 32px;
        font-weight: 500;
        opacity: 1;
      }



     body.transitioning .previous {
  animation: previousVerseUp 700ms ease forwards;
}

body.transitioning .active {
  animation: activeVerseUp 700ms ease forwards;
}

body.transitioning .next {
  animation: nextVerseUp 700ms ease forwards;
}

@keyframes previousVerseUp {
  from {
    transform: translateY(0);
    opacity: 0.58;
  }

  to {
    transform: translateY(-90px);
    opacity: 0;
  }
}

@keyframes activeVerseUp {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
    background-color: ${colors.card};
  }

  to {
    transform: translateY(-105px) scale(0.88);
    opacity: 0.58;
    background-color: transparent;
  }
}

@keyframes nextVerseUp {
  from {
    transform: translateY(0) scale(1);
    opacity: 0.58;
  }

  to {
    transform: translateY(-150px) scale(1.08);
    opacity: 1;
  }
}

      .verse-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        margin-right: 6px;
        border: 1px solid ${colors.border};
        border-radius: 50%;
        color: ${colors.subtext};
        font-family: serif;
        font-size: 14px;
        vertical-align: middle;
      }

      .latin-text {
        font-family: "Inter", sans-serif;
        color: #2dd4bf;
        font-size: 18px;
        font-style: italic;
        margin-top: 4px;
        direction: ltr;
        text-align: left;
      }

      .previous .latin-text,
      .next .latin-text {
        color: #b75a5a;
        opacity: 0.75;
      }
    </style>
  </head>

  <body class="${isVerseTransitioning ? "transitioning" : ""}">
    ${
      previousVerse
        ? `
          <div class="verse previous">
            ${escapeHtml(previousVerse.text)}
            <span class="verse-number">
              ${previousVerse.ayah}
            </span>
            ${
              previousVerse.latin
                ? `<div class="latin-text">${escapeHtml(previousVerse.latin)}</div>`
                : ""
            }
          </div>
        `
        : ""
    }

    <div class="verse active">
      ${activeVerseHtml}
      <span class="verse-number">
        ${activeVerse.ayah}
      </span>
      ${
        activeVerse.latin
          ? `<div class="latin-text">${escapeHtml(activeVerse.latin)}</div>`
          : ""
      }
    </div>

    ${
      nextVerse
        ? `
          <div class="verse next">
            ${escapeHtml(nextVerse.text)}
            <span class="verse-number">
              ${nextVerse.ayah}
            </span>
            ${
              nextVerse.latin
                ? `<div class="latin-text">${escapeHtml(nextVerse.latin)}</div>`
                : ""
            }
          </div>
        `
        : ""
    }
  </body>
</html>
`;

  // ==========================================================
  // 6. TAMPILAN APLIKASI (JSX)
  // ==========================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================================================== */}
        {/* HEADER NAVIGASI SURAT DAN AYAT */}
        {/* ================================================== */}
        <View style={styles.topNavigationContainer}>
          <View style={styles.surahNavigationRow}>
            <Pressable
              style={[
                styles.surahArrowButton,
                currentSurahIndex === 0 && styles.disabledNavigationButton,
              ]}
              disabled={
                currentSurahIndex === 0 ||
                isRecognizing ||
                isPreparing ||
                isVerseTransitioning
              }
              onPress={() => selectSurah(currentSurahIndex - 1)}
            >
              <Text style={styles.surahArrowText}>‹</Text>
            </Pressable>

            <View style={styles.surahNavigationTitle}>
              <Text style={styles.surahNavigationTitleText}>
                {activeSurah.name.toUpperCase()}
              </Text>
            </View>

            <Pressable
              style={[
                styles.surahArrowButton,
                currentSurahIndex === SURAH_OPTIONS.length - 1 &&
                  styles.disabledNavigationButton,
              ]}
              disabled={
                currentSurahIndex === SURAH_OPTIONS.length - 1 ||
                isRecognizing ||
                isPreparing ||
                isVerseTransitioning
              }
              onPress={() => selectSurah(currentSurahIndex + 1)}
            >
              <Text style={styles.surahArrowText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.topControlRow}>
            <Pressable
              style={styles.headerDropdown}
              onPress={() => {
                playButtonSound();

                setIsSurahPickerVisible((currentValue) => !currentValue);

                setIsAyahPickerVisible(false);
              }}
              disabled={
                isRecognizing || isPreparing || isVerseTransitioning
              }
            >
              <Text style={styles.headerDropdownText}>
                {activeSurah.name}
              </Text>

              <Text style={styles.headerDropdownArrow}>
                ▲{'\n'}▼
              </Text>
            </Pressable>

            <Pressable
              style={styles.ayahNumberDropdown}
              onPress={() => {
                playButtonSound();

                setIsAyahPickerVisible((currentValue) => !currentValue);

                setIsSurahPickerVisible(false);
              }}
              disabled={
                isRecognizing || isPreparing || isVerseTransitioning
              }
            >
              <Text style={styles.headerDropdownText}>
                {activeVerse.ayah}
              </Text>

              <Text style={styles.headerDropdownArrow}>
                ▲{'\n'}▼
              </Text>
            </Pressable>
          </View>
        </View>

        {/* DAFTAR SURAT YANG MUNCUL SETELAH TOMBOL PILIH SURAT DITEKAN */}
        {isSurahPickerVisible ? (
          <View style={styles.completedSurahCard}>
            <Text style={styles.completedSurahTitle}>{t("speech_select_juz_amma")}</Text>

            {SURAH_OPTIONS.map((surah, surahIndex) => {
              const isCurrentSurah = surahIndex === currentSurahIndex;

              return (
                <Pressable
                  key={surah.number}
                  style={[
                    styles.completedSurahButton,
                    isCurrentSurah && styles.currentSurahSelection,
                  ]}
                  onPress={() => selectSurah(surahIndex)}
                  disabled={isCurrentSurah}
                >
                  <Text
                    style={[
                      styles.completedSurahButtonText,
                      isCurrentSurah && styles.currentSurahSelectionText,
                    ]}
                  >
                    {surah.number}. {surah.name}
                    {isCurrentSurah ? t("speech_reading_now") : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* ================================================== */}
        {/* KARTU TIGA AYAT */}
        {/* ================================================== */}
        <View style={styles.currentAyahCard}>
          <WebView
            key={`${activeSurah.number}-${activeVerse.ayah}-${recognizedWordStatuses.join("-")}`}
            source={{ html: threeAyahHtml }}
            style={styles.quranWebView}
            originWhitelist={["*"]}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={false}
          />
        </View>

        {/* DAFTAR NOMOR AYAT YANG MUNCUL SETELAH TOMBOL PILIH AYAT DITEKAN */}
        {isAyahPickerVisible ? (
          <View style={styles.ayahPickerCard}>
            <Text style={styles.completedSurahTitle}>
              {tr("speech_select_ayah_title", { name: activeSurah.name })}
            </Text>

            <View style={styles.ayahButtonContainer}>
              {activeSurah.verses.map((verse, ayahIndex) => {
                const isCurrentAyah = ayahIndex === currentAyahIndex;

                return (
                  <Pressable
                    key={verse.ayah}
                    style={[
                      styles.ayahSelectionButton,
                      isCurrentAyah && styles.currentAyahSelection,
                    ]}
                    onPress={() => selectAyah(ayahIndex)}
                    disabled={isCurrentAyah}
                  >
                    <Text
                      style={[
                        styles.ayahSelectionButtonText,
                        isCurrentAyah && styles.currentAyahSelectionText,
                      ]}
                    >
                      {verse.ayah}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* ================================================== */}
        {/* TOMBOL REKAM ATAU PANEL SEDANG MEREKAM */}
        {/* ================================================== */}
        {isRecognizing || isPreparing || isVerseTransitioning ? (
          <View style={styles.recordingPanel}>
            <View style={styles.waveformContainer}>
              {WAVE_BAR_HEIGHTS.map((height, index) => (
                <Animated.View
                  key={`wave-bar-${index}`}
                  style={[
                    styles.waveBar,
                    {
                      height,
                      transform: [
                        {
                          scaleY: waveAnimations[index],
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>

            {/* TULISAN STATUS PANEL REKAMAN */}
            <Text style={styles.recordingText}>
              {isVerseTransitioning
                ? t("speech_correct_next")
                : isPreparing
                  ? t("speech_preparing_mic")
                  : t("speech_recording")}
            </Text>

            {/* TOMBOL BERHENTI HANYA MUNCUL SAAT BENAR-BENAR MEREKAM */}
            {isRecognizing && !isPreparing && !isVerseTransitioning ? (
              <Pressable
                style={styles.circularStopButton}
                onPress={handleRecordButtonPress}
              >
                <View style={styles.stopSquare} />
              </Pressable>
            ) : (
              <ActivityIndicator
                color="#8fb4ff"
                size="large"
                style={styles.preparingIndicator}
              />
            )}
          </View>
        ) : (
          <Pressable
            style={[
              styles.recordButton,
              (isAyahCompleted || isAllCompleted) &&
                styles.disabledRecordButton,
            ]}
            onPress={handleRecordButtonPress}
            disabled={
              isPreparing ||
              isAyahCompleted ||
              isAllCompleted ||
              isVerseTransitioning
            }
          >
            {isPreparing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.recordButtonText}>{t("speech_record")}</Text>
            )}
          </Pressable>
        )}

        {/* PESAN STATUS: MENDENGARKAN, SALAH, BENAR, ATAU BELUM SELESAI */}
        <Text style={styles.statusText}>
          {statusMessage || t("speech_not_started")}
        </Text>

        {/* ================================================== */}
        {/* BAGIAN TEKS TERDENGAR */}
        {/* ================================================== */}
        <Text style={styles.sectionTitle}>{t("speech_heard_text")}</Text>

        <View style={styles.resultCard}>
          <Text
            style={[
              styles.heardTextValue,
              fontsLoaded && { fontFamily: "Amiri Quran" },
            ]}
          >
            {liveTranscriptWithHarakat || "-"}
          </Text>
        </View>
      </ScrollView>

      {/* ================================================== */}
      {/* MODAL NOTIFIKASI (PENGGANTI ALERT DEFAULT) */}
      {/* ================================================== */}
      <Modal
        visible={notification !== null}
        transparent
        animationType="fade"
        onRequestClose={closeNotification}
      >
        <View
          style={[
            styles.notificationOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View
            style={[styles.notificationCard, { backgroundColor: colors.card }]}
          >
            <View
              style={[
                styles.notificationIcon,
                { backgroundColor: colors.inputBg },
              ]}
            >
              <Ionicons name="notifications" size={32} color={colors.isDark ? "#8fb4ff" : "#2563eb"} />
            </View>

            <Text
              style={[styles.notificationTitle, { color: colors.text }]}
            >
              {notification?.title}
            </Text>

            <Text
              style={[styles.notificationMessage, { color: colors.subtext }]}
            >
              {notification?.message}
            </Text>

            <Pressable
              style={styles.notificationCloseButton}
              onPress={closeNotification}
            >
              <Text style={styles.notificationCloseButtonText}>
                {t("speech_close")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// 7. STYLE TAMPILAN (mengikuti tema gelap/terang aplikasi)
// ============================================================
const createStyles = (colors: ThemeColors) => {
  const accent = colors.isDark ? "#8fb4ff" : "#2563eb";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 36,
      paddingBottom: 40,
    },
    // Style header navigasi surat & ayat.
    topNavigationContainer: {
      marginTop: 12,
    },
    surahNavigationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    surahArrowButton: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    surahArrowText: {
      color: accent,
      fontSize: 42,
      fontWeight: "300",
    },
    disabledNavigationButton: {
      opacity: 0.3,
    },
    surahNavigationTitle: {
      flex: 1,
      alignItems: "center",
    },
    surahNavigationTitleText: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "600",
      textAlign: "center",
    },
    topControlRow: {
      marginTop: 14,
      flexDirection: "row",
      gap: 12,
    },
    headerDropdown: {
      flex: 1,
      minHeight: 56,
      paddingLeft: 18,
      paddingRight: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.inputBg,
    },
    ayahNumberDropdown: {
      width: 105,
      minHeight: 56,
      paddingLeft: 18,
      paddingRight: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.inputBg,
    },
    headerDropdownText: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "500",
    },
    headerDropdownArrow: {
      color: colors.subtext,
      fontSize: 11,
      lineHeight: 12,
      textAlign: "center",
    },
    // Style daftar pilihan surat.
    completedSurahCard: {
      marginTop: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.card,
    },
    completedSurahTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    completedSurahButton: {
      marginTop: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 9,
      backgroundColor: colors.inputBg,
    },
    completedSurahButtonText: {
      color: accent,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    // Style surat yang sedang aktif di daftar surat.
    currentSurahSelection: {
      backgroundColor: colors.border,
    },
    currentSurahSelectionText: {
      color: colors.subtext,
    },
    // Style kartu yang menampilkan tiga ayat.
    currentAyahCard: {
      marginTop: 28,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderRadius: 22,
      backgroundColor: colors.card,
    },
    // Style kartu WebView tiga ayat.
    quranWebView: {
      height: 330,
      marginTop: 16,
      backgroundColor: "transparent",
    },
    // Style daftar pilihan ayat.
    ayahPickerCard: {
      marginTop: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.card,
    },
    ayahButtonContainer: {
      marginTop: 10,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    ayahSelectionButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      backgroundColor: colors.inputBg,
    },
    ayahSelectionButtonText: {
      color: accent,
      fontSize: 15,
      fontWeight: "700",
    },
    currentAyahSelection: {
      backgroundColor: colors.border,
    },
    currentAyahSelectionText: {
      color: colors.subtext,
    },
    // Style tombol Rekam sebelum proses dimulai.
    recordButton: {
      alignSelf: "center",
      minWidth: 104,
      marginTop: 36,
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 8,
      backgroundColor: "#4f7cff",
    },
    disabledRecordButton: {
      backgroundColor: colors.border,
    },
    recordButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    // Style panel animasi ketika sedang merekam.
    recordingPanel: {
      marginTop: 36,
      paddingVertical: 10,
      alignItems: "center",
    },
    waveformContainer: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    waveBar: {
      width: 6,
      borderRadius: 4,
      backgroundColor: "#4d8de8",
    },
    recordingText: {
      marginTop: 14,
      color: "#d83b3b",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    // Style tombol berhenti berbentuk lingkaran merah.
    circularStopButton: {
      width: 86,
      height: 86,
      marginTop: 22,
      borderRadius: 43,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ef4444",
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.28,
      shadowRadius: 6,
      elevation: 8,
    },
    stopSquare: {
      width: 30,
      height: 30,
      borderRadius: 5,
      backgroundColor: "#ffffff",
    },
    statusText: {
      marginTop: 10,
      color: colors.text,
      fontSize: 15,
      textAlign: "center",
    },
    // Style judul Teks Terdengar.
    sectionTitle: {
      marginTop: 28,
      color: colors.text,
      fontSize: 18,
      fontWeight: "500",
    },
    // Style kotak Teks Terdengar.
    resultCard: {
      minHeight: 160,
      marginTop: 14,
      paddingHorizontal: 18,
      paddingVertical: 20,
      borderRadius: 22,
      backgroundColor: colors.card,
    },
    heardTextValue: {
      marginTop: 10,
      color: accent,
      fontSize: 28,
      lineHeight: 48,
      textAlign: "right",
      writingDirection: "rtl",
    },
    // Indikator saat berpindah ayat atau menyiapkan mikrofon.
    preparingIndicator: {
      marginTop: 22,
    },
    // ==========================================================
    // Style modal notifikasi pengganti Alert default.
    // ==========================================================
    notificationOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    notificationCard: {
      width: "84%",
      maxWidth: 360,
      borderRadius: 18,
      paddingHorizontal: 22,
      paddingVertical: 26,
      alignItems: "center",
    },
    notificationIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    notificationTitle: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    notificationMessage: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
    },
    notificationCloseButton: {
      marginTop: 20,
      paddingHorizontal: 30,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: "#4f7cff",
    },
    notificationCloseButtonText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "700",
    },
  });
};
