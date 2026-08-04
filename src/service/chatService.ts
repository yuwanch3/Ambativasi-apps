import API_URL, { apiFetch } from "../../config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export async function chatWithGemini(
  messages: ChatMessage[],
  context?: { subject?: string; topic?: string }
): Promise<string> {
  try {
    const response = await apiFetch(`${API_URL}/asisten-ai.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Gagal memproses chat.");
    }

    return data.reply;
  } catch (error: any) {
    console.error("Chat Error:", error);
    throw error;
  }
}
