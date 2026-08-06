import API_URL, { apiFetch } from "../../config";

export interface SoalAI {
  no: number;
  tipe_soal: "standar" | "full" | "drag_drop" | "fill_blank";
  pertanyaan: string;
  pilihan?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  jawaban_benar: string | string[];
}

export async function generateSoalDirectGemini(
  sumberData: string,
  jumlahSoal: number = 10,
  bahasaSoal: string = "Indonesia",
  ringkasanMateri: string = ""
): Promise<SoalAI[]> {
  try {
    const response = await apiFetch(`${API_URL}/generate-soal.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sumberData, jumlahSoal, bahasaSoal, ringkasanMateri }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Gagal meracik soal via Gemini API.");
    }

    return data.soal as SoalAI[];
  } catch (error: any) {
    console.error("Error generate soal:", error);
    throw error;
  }
}