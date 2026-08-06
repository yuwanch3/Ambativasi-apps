export interface BabMateri {
  id: string;
  sumberData: string;
  judulId: string;
  judulEn: string;
}

export interface SeriMateri {
  id: string;
  image: number;
  judulId: string;
  judulEn: string;
  subId: string;
  subEn: string;
  bab: BabMateri[];
}

export const SERI_PETROFISIKA: SeriMateri[] = [
  {
    id: "seri-1",
    image: require("../../assets/icons/icon-petrophysics.png"),
    judulId: "Seri 1: Routine Core Analysis",
    judulEn: "Series 1: Routine Core Analysis",
    subId: "Ujian materi inti Petrofisika",
    subEn: "Petrophysics core material exam",
    bab: [
      {
        id: "porositas",
        sumberData: "PETROFISIKA_SERI1_POROSITAS",
        judulId: "Porosity",
        judulEn: "Porosity",
      },
      {
        id: "permeabilitas",
        sumberData: "PETROFISIKA_SERI1_PERMEABILITAS",
        judulId: "Permeabilitas",
        judulEn: "Permeability",
      },
      {
        id: "compressibility",
        sumberData: "PETROFISIKA_SERI1_COMPRESSIBILITY",
        judulId: "Compressibility",
        judulEn: "Compressibility",
      },
      {
        id: "salinitas",
        sumberData: "PETROFISIKA_SERI1_SALINITAS",
        judulId: "Salinitas, Densitas, Specific Gravity & Mineral",
        judulEn: "Salinity, Density, Specific Gravity & Minerals",
      },
      {
        id: "water-saturation",
        sumberData: "PETROFISIKA_SERI1_WATER_SATURATION",
        judulId: "Water Saturation",
        judulEn: "Water Saturation",
      },
    ],
  },
  {
    id: "seri-2",
    image: require("../../assets/icons/icon-petrophysics.png"),
    judulId: "Seri 2: Special Core Analysis",
    judulEn: "Series 2: Special Core Analysis",
    subId: "Ujian materi khusus Petrofisika",
    subEn: "Petrophysics special material exam",
    bab: [
      {
        id: "wettability",
        sumberData: "PETROFISIKA_SERI2_WETTABILITY",
        judulId: "Wettability",
        judulEn: "Wettability",
      },
      {
        id: "core-resistivity",
        sumberData: "PETROFISIKA_SERI2_RESISTIVITY",
        judulId: "Core Resistivity & Hukum Archie",
        judulEn: "Core Resistivity & Archie's Law",
      },
      {
        id: "interfacial-tension",
        sumberData: "PETROFISIKA_SERI2_INTERFACIAL_TENSION",
        judulId: "Interfacial Tension",
        judulEn: "Interfacial Tension",
      },
      {
        id: "capillary-pressure",
        sumberData: "PETROFISIKA_SERI2_CAPILLARY_PRESSURE",
        judulId: "Capillary Pressure",
        judulEn: "Capillary Pressure",
      },
      {
        id: "relative-permeability",
        sumberData: "PETROFISIKA_SERI2_RELATIVE_PERMEABILITY",
        judulId: "Relative Permeability",
        judulEn: "Relative Permeability",
      },
    ],
  },
  {
    id: "seri-3",
    image: require("../../assets/icons/icon-petrophysics.png"),
    judulId: "Seri 3: Digital Core Analysis",
    judulEn: "Series 3: Digital Core Analysis",
    subId: "Ujian materi digital Petrofisika",
    subEn: "Petrophysics digital material exam",
    bab: [
      {
        id: "digital-rock-physics",
        sumberData: "PETROFISIKA_SERI3_DIGITAL_ROCK_PHYSICS",
        judulId: "Digital Rock Physics",
        judulEn: "Digital Rock Physics",
      },
      {
        id: "komputasi-software",
        sumberData: "PETROFISIKA_SERI3_KOMPUTASI_SOFTWARE",
        judulId: "Komputasi & Software",
        judulEn: "Computation & Software",
      },
      {
        id: "porositas-digital",
        sumberData: "PETROFISIKA_SERI3_POROSITAS",
        judulId: "Porositas",
        judulEn: "Porosity",
      },
      {
        id: "permeabilitas-digital",
        sumberData: "PETROFISIKA_SERI3_PERMEABILITAS",
        judulId: "Permeabilitas",
        judulEn: "Permeability",
      },
      {
        id: "saturasi-air-digital",
        sumberData: "PETROFISIKA_SERI3_SATURASI_AIR",
        judulId: "Saturasi Air",
        judulEn: "Water Saturation",
      },
      {
        id: "kompresibilitas-digital",
        sumberData: "PETROFISIKA_SERI3_KOMPRESIBILITAS",
        judulId: "Kompresibilitas",
        judulEn: "Compressibility",
      },
    ],
  },
];
