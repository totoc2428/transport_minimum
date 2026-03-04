/**
 * Application principale Transport Minimum
 */

import { useEffect, useRef } from "react";
import { Canvas, Sidebar } from "./components";
import { useStore } from "./store";
import "./App.css";

function App() {
  const { warehouses, stores, solve, isLoading } = useStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-calcul avec debounce de 300ms
  useEffect(() => {
    // Annuler le précédent timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Ne pas calculer si pas assez de points ou déjà en cours
    if (warehouses.length === 0 || stores.length === 0 || isLoading) {
      return;
    }

    // Vérifier l'équilibre offre/demande
    const totalSupply = warehouses.reduce((sum, w) => sum + w.stock, 0);
    const totalDemand = stores.reduce((sum, s) => sum + s.demand, 0);
    if (totalSupply !== totalDemand) {
      return; // Ne rien faire si déséquilibré
    }

    // Lancer le calcul après un délai
    debounceRef.current = setTimeout(() => {
      solve();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [warehouses, stores, solve, isLoading]);

  return (
    <div className="app">
      <Sidebar />
      <main className="canvas-container">
        <Canvas width={900} height={700} />
      </main>
    </div>
  );
}

export default App;
