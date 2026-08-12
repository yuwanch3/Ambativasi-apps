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

function player(
  slot: () => ReturnType<typeof createAudioPlayer> | null,
  source: any,
) {
  let p = slot();
  if (!p) {
    try {
      p = createAudioPlayer(source);
    } catch {
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
