import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatMessage, chatWithGemini } from "../src/service/chatService";

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string, context?: { subject?: string; topic?: string }) => Promise<void>;
  clearHistory: () => Promise<void>;
  setContext: (subject?: string, topic?: string) => void;
  currentSubject?: string;
  currentTopic?: string;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isTyping: false,
  sendMessage: async () => {},
  clearHistory: async () => {},
  setContext: () => {},
});

const STORAGE_PREFIX = "chat_history_";
const GLOBAL_KEY = "chat_history";

// 💡 Ambil identitas akun aktif (user.id paling stabil; fallback email/username).
const getAccountId = async (): Promise<string | null> => {
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

// 💡 Migrasi history global lama → key per akun (sekali saja).
const migrateGlobalHistory = async (accountId: string) => {
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

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | undefined>();
  const [currentTopic, setCurrentTopic] = useState<string | undefined>();
  const activeAccountRef = useRef<string | null>(null);

  const storageKeyFor = (accountId: string) => `${STORAGE_PREFIX}${accountId}`;

  const loadHistory = async () => {
    try {
      const accountId = await getAccountId();
      if (accountId) {
        await migrateGlobalHistory(accountId);
      }
      activeAccountRef.current = accountId;
      if (!accountId) {
        setMessages([]);
        return;
      }
      const stored = await AsyncStorage.getItem(storageKeyFor(accountId));
      setMessages(stored ? JSON.parse(stored) : []);
    } catch {
      setMessages([]);
    }
  };

  const saveHistory = async (msgs: ChatMessage[]) => {
    try {
      const accountId = activeAccountRef.current ?? (await getAccountId());
      if (accountId) {
        await AsyncStorage.setItem(storageKeyFor(accountId), JSON.stringify(msgs));
      }
    } catch {}
  };

  // 💡 Muat ulang history setiap kali akun berubah (login/logout/ganti akun).
  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const accountId = await getAccountId();
      if (accountId !== activeAccountRef.current) {
        activeAccountRef.current = accountId;
        if (!accountId) {
          setMessages([]);
          return;
        }
        const stored = await AsyncStorage.getItem(storageKeyFor(accountId));
        setMessages(stored ? JSON.parse(stored) : []);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(
    async (content: string, context?: { subject?: string; topic?: string }) => {
      const userMsg: ChatMessage = { role: "user", content, timestamp: Date.now() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsTyping(true);

      try {
        const reply = await chatWithGemini(updated, context || {
          subject: currentSubject,
          topic: currentTopic,
        });
        const assistantMsg: ChatMessage = { role: "assistant", content: reply, timestamp: Date.now() };
        const final = [...updated, assistantMsg];
        setMessages(final);
        saveHistory(final);
      } catch (error: any) {
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: `⚠️ ${error.message || "Gagal terhubung ke AI."}`,
          timestamp: Date.now(),
        };
        const final = [...updated, errorMsg];
        setMessages(final);
        saveHistory(final);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, currentSubject, currentTopic]
  );

  const clearHistory = async () => {
    setMessages([]);
    try {
      const accountId = activeAccountRef.current ?? (await getAccountId());
      if (accountId) {
        await AsyncStorage.removeItem(storageKeyFor(accountId));
      }
    } catch {}
  };

  const setContext = (subject?: string, topic?: string) => {
    setCurrentSubject(subject);
    setCurrentTopic(topic);
  };

  return (
    <ChatContext.Provider
      value={{ messages, isTyping, sendMessage, clearHistory, setContext, currentSubject, currentTopic }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);