/**
 * Store Zustand pour l'état global de l'application
 */

import { create } from "zustand";
import type {
  MapPoint,
  SolveResponse,
  Store,
  ToolMode,
  Warehouse,
} from "./types";

interface AppState {
  // Points sur la carte
  warehouses: Warehouse[];
  stores: Store[];

  // Outil sélectionné
  toolMode: ToolMode;

  // Point sélectionné pour édition
  selectedPointId: string | null;

  // Solution calculée
  solution: SolveResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setToolMode: (mode: ToolMode) => void;
  addWarehouse: (x: number, y: number) => void;
  addStore: (x: number, y: number) => void;
  updatePoint: (id: string, updates: Partial<MapPoint>) => void;
  deletePoint: (id: string) => void;
  selectPoint: (id: string | null) => void;
  movePoint: (id: string, x: number, y: number) => void;
  solve: () => Promise<void>;
  clearSolution: () => void;
  reset: () => void;
}

let warehouseCounter = 0;
let storeCounter = 0;

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>((set, get) => ({
  warehouses: [],
  stores: [],
  toolMode: "warehouse",
  selectedPointId: null,
  solution: null,
  isLoading: false,
  error: null,

  setToolMode: (mode) => set({ toolMode: mode, selectedPointId: null }),

  addWarehouse: (x, y) => {
    warehouseCounter++;
    const warehouse: Warehouse = {
      id: generateId(),
      type: "warehouse",
      x,
      y,
      name: `Entrepôt ${warehouseCounter}`,
      stock: 100,
    };
    set((state) => ({
      warehouses: [...state.warehouses, warehouse],
      solution: null,
    }));
  },

  addStore: (x, y) => {
    storeCounter++;
    const store: Store = {
      id: generateId(),
      type: "store",
      x,
      y,
      name: `Magasin ${storeCounter}`,
      demand: 50,
    };
    set((state) => ({
      stores: [...state.stores, store],
      solution: null,
    }));
  },

  updatePoint: (id, updates) => {
    set((state) => {
      const warehouseIndex = state.warehouses.findIndex((w) => w.id === id);
      if (warehouseIndex !== -1) {
        const newWarehouses = [...state.warehouses];
        newWarehouses[warehouseIndex] = {
          ...newWarehouses[warehouseIndex],
          ...updates,
        } as Warehouse;
        return { warehouses: newWarehouses, solution: null };
      }

      const storeIndex = state.stores.findIndex((s) => s.id === id);
      if (storeIndex !== -1) {
        const newStores = [...state.stores];
        newStores[storeIndex] = {
          ...newStores[storeIndex],
          ...updates,
        } as Store;
        return { stores: newStores, solution: null };
      }

      return {};
    });
  },

  deletePoint: (id) => {
    set((state) => ({
      warehouses: state.warehouses.filter((w) => w.id !== id),
      stores: state.stores.filter((s) => s.id !== id),
      selectedPointId:
        state.selectedPointId === id ? null : state.selectedPointId,
      solution: null,
    }));
  },

  selectPoint: (id) => set({ selectedPointId: id }),

  movePoint: (id, x, y) => {
    const state = get();
    const warehouse = state.warehouses.find((w) => w.id === id);
    if (warehouse) {
      set((s) => ({
        warehouses: s.warehouses.map((w) => (w.id === id ? { ...w, x, y } : w)),
        solution: null,
      }));
      return;
    }
    set((s) => ({
      stores: s.stores.map((st) => (st.id === id ? { ...st, x, y } : st)),
      solution: null,
    }));
  },

  solve: async () => {
    const { warehouses, stores } = get();

    if (warehouses.length === 0 || stores.length === 0) {
      set({ error: "Ajoutez au moins un entrepôt et un magasin" });
      return;
    }

    const totalSupply = warehouses.reduce((sum, w) => sum + w.stock, 0);
    const totalDemand = stores.reduce((sum, s) => sum + s.demand, 0);

    if (totalSupply !== totalDemand) {
      set({
        error: `L'offre totale (${totalSupply}) doit égaler la demande totale (${totalDemand})`,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouses: warehouses.map((w) => ({
            x: w.x,
            y: w.y,
            name: w.name,
            stock: w.stock,
          })),
          stores: stores.map((s) => ({
            x: s.x,
            y: s.y,
            name: s.name,
            demand: s.demand,
          })),
          cost_mode: "euclidean",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Erreur de calcul");
      }

      const solution: SolveResponse = await response.json();
      set({ solution, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erreur inconnue",
        isLoading: false,
      });
    }
  },

  clearSolution: () => set({ solution: null, error: null }),

  reset: () => {
    warehouseCounter = 0;
    storeCounter = 0;
    set({
      warehouses: [],
      stores: [],
      selectedPointId: null,
      solution: null,
      error: null,
    });
  },
}));
