import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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

const STORAGE_KEY = "chat_history";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string | undefined>();
  const [currentTopic, setCurrentTopic] = useState<string | undefined>();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch {}
  };

  const saveHistory = async (msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch {}
  };

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
    await AsyncStorage.removeItem(STORAGE_KEY);
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
