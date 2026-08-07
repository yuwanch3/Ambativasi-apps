// ==========================================
// SUMBER MATERI (PDF + VIDEO) PER LEVEL
// Dipakai menu materi Petrofisika (Seri 1/2/3)
// & Chemical EOR (BAB Surfaktan/Alkaline/Polimer)
// ==========================================

export interface MateriSumber {
  id: string;
  judulId: string;
  judulEn: string;
  subId: string;
  subEn: string;
  pdfUrl: string;
  videoId: string;
  sumberData: string;
}

// ---------- PETROFISIKA: 3 SERI ----------
export const SUMBER_MATERI_PETROFISIKA: Record<string, MateriSumber> = {
  "seri-1": {
    id: "seri-1",
    judulId: "Seri 1: Routine Core Analysis",
    judulEn: "Series 1: Routine Core Analysis",
    subId: "Porositas, Permeabilitas & Saturasi Air",
    subEn: "Porosity, Permeability & Water Saturation",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=1sQQzEmqGS55qNL9pq-fpDELxLJLOUDkU",
    videoId: "PeJ-el7k81s",
    sumberData: "PETROFISIKA_SERI1",
  },
  "seri-2": {
    id: "seri-2",
    judulId: "Seri 2: Special Core Analysis",
    judulEn: "Series 2: Special Core Analysis",
    subId: "Wettability, IFT, Capillary Pressure & Relative Permeability",
    subEn: "Wettability, IFT, Capillary Pressure & Relative Permeability",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=1OacrW5_knhXwmnDd8BR8_JdAqsCdGs5v",
    videoId: "dZRmW4o4vBk",
    sumberData: "PETROFISIKA_SERI2",
  },
  "seri-3": {
    id: "seri-3",
    judulId: "Seri 3: Digital Core Analysis",
    judulEn: "Series 3: Digital Core Analysis",
    subId: "Digital Rock Physics, Simulasi & Software",
    subEn: "Digital Rock Physics, Simulation & Software",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=1w-0sOMAMs1PY1tMwJugLDEnt6iAZ9Ws3",
    videoId: "wQT_Y0NrMeU",
    sumberData: "PETROFISIKA_SERI3",
  },
};

// ---------- CHEMICAL EOR: 3 BAB ----------
export const SUMBER_MATERI_CHEMICAL_EOR: Record<string, MateriSumber> = {
  surfaktan: {
    id: "surfaktan",
    judulId: "Surfaktan",
    judulEn: "Surfactant",
    subId: "IFT, Microemulsion & Screening Criteria",
    subEn: "IFT, Microemulsion & Screening Criteria",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=1sNi5znXKjXRj1OJmJkAPeM98-mMqtmRx",
    videoId: "BuwKSXmiGRI",
    sumberData: "CHEMICAL_EOR_SURFAKTAN",
  },
  alkaline: {
    id: "alkaline",
    judulId: "Alkaline",
    judulEn: "Alkaline",
    subId: "Caustic Flooding, In-situ Surfactant & Emulsifikasi",
    subEn: "Caustic Flooding, In-situ Surfactant & Emulsification",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=10Un6pZifvFdSzLSFTP-rKIojXTp6yn29",
    videoId: "6IxK9KDYk_0",
    sumberData: "CHEMICAL_EOR_ALKALINE",
  },
  polimer: {
    id: "polimer",
    judulId: "Polimer",
    judulEn: "Polymer",
    subId: "Mobility Ratio, HPAM & Sweep Efficiency",
    subEn: "Mobility Ratio, HPAM & Sweep Efficiency",
    pdfUrl:
      "https://www.nstauthority.co.uk/media/4283/polymer-eor-industry-starter-pack-ver3.pdf",
    videoId: "gF1xFFFw2SY",
    sumberData: "CHEMICAL_EOR_POLIMER",
  },
};

// ---------- BAHASA JEPANG: N5 BAB 1 ----------
export const SUMBER_MATERI_BAHASA_JEPANG: Record<string, MateriSumber> = {
  "bab1-bin": {
    id: "bab1-bin",
    judulId: "Minna no Nihongo BAB 1 (B.Indonesia)",
    judulEn: "Minna no Nihongo Chapter 1 (Indonesian)",
    subId: "PDF Materi Bahasa Indonesia",
    subEn: "Indonesian PDF Material",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=16qaavcuqhneWbFnmbgdib0ii8utynl6w",
    videoId: "lrhkh5WPfy8",
    sumberData: "NIHONGO_BAB1",
  },
  "bab1-bjp": {
    id: "bab1-bjp",
    judulId: "Minna no Nihongo BAB 1 (B.Jepang)",
    judulEn: "Minna no Nihongo Chapter 1 (Japanese)",
    subId: "PDF Materi Bahasa Jepang",
    subEn: "Japanese PDF Material",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=1pLqTfVTcFSxa4S15bCSjY55g9FgAJe-3",
    videoId: "lrhkh5WPfy8",
    sumberData: "NIHONGO_BAB1",
  },
};

// ---------- TAJWID: AL-FATIHAH ----------
export const SUMBER_MATERI_TAJWID: Record<string, MateriSumber> = {
  "al-fatihah": {
    id: "al-fatihah",
    judulId: "Tajwid Surah Al-Fatihah",
    judulEn: "Tajweed of Surah Al-Fatihah",
    subId: "PDF Materi Tajwid Al-Fatihah",
    subEn: "Tajweed Al-Fatihah PDF Material",
    pdfUrl:
      "https://docs.google.com/uc?export=download&id=1ag9eYSeJaul5QvWuWXVPkLUf7WIWLci8",
    videoId: "QwUTyC4rd7c",
    sumberData: "TJ_AL_FATIHAH",
  },
};
