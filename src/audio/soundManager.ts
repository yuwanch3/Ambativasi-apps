import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  if (Platform.OS !== "web") {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
}

let clickPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let correctPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let wrongPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let navigatePlayer: ReturnType<typeof createAudioPlayer> | null = null;
let alertPlayer: ReturnType<typeof createAudioPlayer> | null = null;

function player(
  slot: () => ReturnType<typeof createAudioPlayer> | null,
  source: any,
) {
  let p = slot();
  if (!p) {
    try {
      p = createAudioPlayer(source);
    } catch (e) {
      return null;
    }
  }
  return p;
}

export function playClick() {
  ensureInitialized();
  const p = player(() => clickPlayer, require("../../assets/sounds/click.mp3"));
  if (!p) return;
  clickPlayer = p;
  p.seekTo(0);
  p.play();
}

export function playCorrect() {
  ensureInitialized();
  const p = player(
    () => correctPlayer,
    require("../../assets/sounds/correct.mp3"),
  );
  if (!p) return;
  correctPlayer = p;
  p.seekTo(0);
  p.play();
}

export function playWrong() {
  ensureInitialized();
  const p = player(
    () => wrongPlayer,
    require("../../assets/sounds/wrong.mp3"),
  );
  if (!p) return;
  wrongPlayer = p;
  p.seekTo(0);
  p.play();
}

export function playNavigate() {
  ensureInitialized();
  const p = player(
    () => navigatePlayer,
    require("../../assets/sounds/navigate.mp3"),
  );
  if (!p) return;
  navigatePlayer = p;
  p.seekTo(0);
  p.play();
}

export function playAlert() {
  ensureInitialized();
  const p = player(
    () => alertPlayer,
    require("../../assets/sounds/alert.mp3"),
  );
  if (!p) return;
  alertPlayer = p;
  p.seekTo(0);
  p.play();
}
