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
      "https://docs.google.com/uc?export=download&id=1MTiZuII7XphTNoqfy5zd2dNZcKqo_ife",
    videoId: "PeJ-el7k81s",
    sumberData: "PETROFISIKA_SERI1",
  },
  "seri-2": {
    id: "seri-2",
    judulId: "Seri 2: Special Core Analysis",
    judulEn: "Series 2: Special Core Analysis",
    subId: "Wettability, IFT, Capillary Pressure & Relative Permeability",
    subEn: "Wettability, IFT, Capillary Pressure & Relative Permeability",
    pdfUrl: "https://www.jogmec.go.jp/content/300391376.pdf",
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
      "https://cdn.intechopen.com/pdfs/40517/InTech-Digital_rock_physics_for_fast_and_accurate_special_core_analysis_in_carbonates.pdf",
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
      "https://orbit.dtu.dk/files/51218569/Final_PhD_thesis_May_2012_sbs..PDF",
    videoId: "BuwKSXmiGRI",
    sumberData: "CHEMICAL_EOR_SURFAKTAN",
  },
  alkaline: {
    id: "alkaline",
    judulId: "Alkaline",
    judulEn: "Alkaline",
    subId: "Caustic Flooding, In-situ Surfactant & Emulsifikasi",
    subEn: "Caustic Flooding, In-situ Surfactant & Emulsification",
    pdfUrl: "https://www.mdpi.com/1996-1073/15/10/3820/pdf",
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
