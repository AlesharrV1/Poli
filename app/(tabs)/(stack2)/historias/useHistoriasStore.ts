import { create } from 'zustand';

interface HitoHistorico {
  id_hito_historico: string;
  titulo: string;
  descripcion: string;
  fecha: string;
}

interface Historia {
  id_historia: string;
  titulo: string;
  descripcion: string;
  fecha?: string; // opcional por si no lo tienes
  imagen_url?: string; // opcional por si aún no lo tienes
  estado?: boolean; // <-- IMPORTANTE: opcional y en minúscula
  hitos_historicos?: HitoHistorico[];
}

interface HistoriasState {
  historias: Historia[];
  setHistorias: (data: Historia[]) => void;
}
interface HitoHistorico {
  fecha: string;
  descripcion: string;
}

export const useHistoriasStore = create<HistoriasState>((set) => ({
  historias: [],
  setHistorias: (data) => set({ historias: data }),
}));

