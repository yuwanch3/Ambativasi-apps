export interface BabMateri {
  id: string;
  sumberData: string;
  judulId: string;
  judulEn: string;
}

export const BAB_CHEMICAL_EOR: BabMateri[] = [
  {
    id: "surfaktan",
    sumberData: "CHEMICAL_EOR_SURFAKTAN",
    judulId: "Surfaktan",
    judulEn: "Surfactant",
  },
  {
    id: "alkaline",
    sumberData: "CHEMICAL_EOR_ALKALINE",
    judulId: "Alkaline",
    judulEn: "Alkaline",
  },
  {
    id: "polimer",
    sumberData: "CHEMICAL_EOR_POLIMER",
    judulId: "Polimer",
    judulEn: "Polymer",
  },
];
