import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChat } from "../../context/ChatContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function ChatScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { messages, isTyping, sendMessage, clearHistory } = useChat();

  const [input, setInput] = useState("");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");
    await sendMessage(text);
  };

  const handleClear = () => {
    setIsClearModalOpen(false);
    clearHistory();
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.isDark ? "#1E3A8A" : "#DBEAFE" },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={16}
              color={colors.isDark ? "#60A5FA" : "#2563EB"}
            />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [
                  styles.userBubble,
                  { backgroundColor: colors.isDark ? "#1E3A8A" : "#2563EB" },
                ]
              : [
                  styles.aiBubble,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? "#FFF" : colors.text },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: isUser ? "rgba(255,255,255,0.6)" : colors.subtext },
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.card}
      />

      {/* HEADER ATAS */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {language === "id" ? "AI Asisten" : "AI Assistant"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.subtext }]}>
            {language === "id"
              ? "Tanya apa aja tentang belajar"
              : "Ask anything about studying"}
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsClearModalOpen(true)}
            style={styles.headerBtn}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* KONTEN CHAT PENANGANAN KEYBOARD STABIL */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyIcon,
                      {
                        backgroundColor: colors.isDark ? "#1E3A8A" : "#DBEAFE",
                      },
                    ]}
                  >
                    <Ionicons
                      name="sparkles"
                      size={40}
                      color={colors.isDark ? "#60A5FA" : "#2563EB"}
                    />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {language === "id"
                      ? "Halo! Ada yang bisa dibantu?"
                      : "Hi! How can I help?"}
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.subtext }]}>
                    {language === "id"
                      ? "Tanyakan materi pelajaran, minta soal latihan, atau diskusikan topik belajar"
                      : "Ask about lessons, request practice questions, or discuss study topics"}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />

          {isTyping && (
            <View
              style={[
                styles.typingContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <ActivityIndicator size="small" color={colors.subtext} />
              <Text style={[styles.typingText, { color: colors.subtext }]}>
                {language === "id"
                  ? "AI sedang mengetik..."
                  : "AI is typing..."}
              </Text>
            </View>
          )}

          {/* KOLOM INPUT CHAT BAWAH */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder={
                language === "id" ? "Ketik pesan..." : "Type a message..."
              }
              placeholderTextColor={colors.subtext}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() && !isTyping ? "#2563EB" : colors.border,
                },
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Ionicons
                name="send"
                size={18}
                color={input.trim() && !isTyping ? "#FFF" : colors.subtext}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL KONFIRMASI HAPUS */}
      <Modal visible={isClearModalOpen} transparent animationType="fade">
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: colors.modalOverlay },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color="#EF4444"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === "id" ? "Hapus Riwayat" : "Clear History"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsClearModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalMessage, { color: colors.subtext }]}>
              {language === "id"
                ? "Apakah anda yakin ingin menghapus semua percakapan?"
                : "Are you sure you want to delete all conversations?"}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.btnModalCancel,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setIsClearModalOpen(false)}
              >
                <Text
                  style={[styles.btnModalCancelText, { color: colors.text }]}
                >
                  {language === "id" ? "Batal" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnModalConfirm,
                  { backgroundColor: "#EF4444" },
                ]}
                onPress={handleClear}
              >
                <Text style={styles.btnModalConfirmText}>
                  {language === "id" ? "Hapus" : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  headerSub: { fontSize: 12, marginTop: 1 },
  listContent: { padding: 16, paddingBottom: 16 },
  messageRow: { flexDirection: "row", marginBottom: 16, alignItems: "flex-end" },
  userRow: { justifyContent: "flex-end" },
  aiRow: { justifyContent: "flex-start" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 21 },
  timestamp: { fontSize: 10, marginTop: 4, textAlign: "right" },
  emptyContainer: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  typingContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 4 },
  typingText: { fontSize: 12, marginLeft: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },
  btnModalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  btnModalCancelText: {
    fontWeight: "600",
    fontSize: 14,
  },
  btnModalConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnModalConfirmText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
