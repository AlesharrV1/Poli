// usePuntosStore.ts
import { create } from "zustand";

interface PuntoTuristico {
  PuntoHist_ID: string;
  Nombre: string;
  Latitud: number;
  Longitud: number;
  Tipo?: string;
}

type Store = {
  puntos: PuntoTuristico[];
  setPuntos: (puntos: PuntoTuristico[]) => void;
};

export const usePuntosStore = create<Store>((set) => ({
  puntos: [],
  setPuntos: (puntos) => set({ puntos }),
}));
