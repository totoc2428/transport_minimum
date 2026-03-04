/**
 * Barre latérale avec contrôles et liste des points
 */

import { useStore } from "../store";
import type { ToolMode } from "../types";

const tools: { mode: ToolMode; icon: string; label: string }[] = [
  { mode: "warehouse", icon: "📦", label: "Entrepôt" },
  { mode: "store", icon: "🏪", label: "Magasin" },
  { mode: "select", icon: "✋", label: "Sélection" },
  { mode: "delete", icon: "🗑️", label: "Supprimer" },
];

export function Sidebar() {
  const {
    warehouses,
    stores,
    toolMode,
    selectedPointId,
    solution,
    isLoading,
    error,
    setToolMode,
    updatePoint,
    solve,
    reset,
  } = useStore();

  const totalSupply = warehouses.reduce((sum, w) => sum + w.stock, 0);
  const totalDemand = stores.reduce((sum, s) => sum + s.demand, 0);
  const isBalanced = totalSupply === totalDemand;

  const selectedWarehouse = warehouses.find((w) => w.id === selectedPointId);
  const selectedStore = stores.find((s) => s.id === selectedPointId);
  const selectedPoint = selectedWarehouse || selectedStore;

  return (
    <div className="sidebar">
      <h1>🚚 Transport Minimum</h1>

      {/* Outils */}
      <section>
        <h2>Outils</h2>
        <div className="tools">
          {tools.map((tool) => (
            <button
              key={tool.mode}
              className={`tool-btn ${toolMode === tool.mode ? "active" : ""}`}
              onClick={() => setToolMode(tool.mode)}
              title={tool.label}
            >
              <span className="icon">{tool.icon}</span>
              <span className="label">{tool.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Édition du point sélectionné */}
      {selectedPoint && (
        <section>
          <h2>Édition</h2>
          <div className="edit-form">
            <label>
              Nom:
              <input
                type="text"
                value={selectedPoint.name}
                onChange={(e) =>
                  updatePoint(selectedPoint.id, { name: e.target.value })
                }
              />
            </label>
            {selectedWarehouse && (
              <label>
                Stock:
                <input
                  type="number"
                  min="1"
                  value={selectedWarehouse.stock}
                  onChange={(e) =>
                    updatePoint(selectedPoint.id, {
                      stock: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
              </label>
            )}
            {selectedStore && (
              <label>
                Demande:
                <input
                  type="number"
                  min="1"
                  value={selectedStore.demand}
                  onChange={(e) =>
                    updatePoint(selectedPoint.id, {
                      demand: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
              </label>
            )}
          </div>
        </section>
      )}

      {/* Résumé */}
      <section>
        <h2>Résumé</h2>
        <div className="summary">
          <div className="stat">
            <span className="icon">📦</span>
            <span>{warehouses.length} entrepôts</span>
            <span className="value">{totalSupply} unités</span>
          </div>
          <div className="stat">
            <span className="icon">🏪</span>
            <span>{stores.length} magasins</span>
            <span className="value">{totalDemand} unités</span>
          </div>
          <div className={`balance ${isBalanced ? "ok" : "error"}`}>
            {isBalanced
              ? "✅ Offre = Demande"
              : `⚠️ Déséquilibre: ${totalSupply - totalDemand}`}
          </div>
        </div>
      </section>

      {/* Actions */}
      <section>
        <h2>Actions</h2>
        <div className="actions">
          <button
            className="primary"
            onClick={solve}
            disabled={
              isLoading ||
              !isBalanced ||
              warehouses.length === 0 ||
              stores.length === 0
            }
          >
            {isLoading ? "⏳ Calcul..." : "🧮 Calculer"}
          </button>
          <button onClick={reset}>🗑️ Réinitialiser</button>
        </div>
        {error && <div className="error-msg">❌ {error}</div>}
      </section>

      {/* Solution */}
      {solution && (
        <section>
          <h2>Solution</h2>
          <div className="solution">
            <div className="total-cost">
              Coût total: <strong>{solution.total_cost}</strong>
            </div>
            <h3>Flux optimaux:</h3>
            <ul className="flows-list">
              {solution.flows.map((flow, i) => (
                <li key={i}>
                  <span className="from">📦 {flow.warehouse_name}</span>
                  <span className="arrow">→</span>
                  <span className="to">🏪 {flow.store_name}</span>
                  <span className="qty">{flow.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Instructions */}
      <section className="instructions">
        <h2>Instructions</h2>
        <ul>
          <li>📦 Cliquez pour placer des entrepôts</li>
          <li>🏪 Cliquez pour placer des magasins</li>
          <li>✋ Glissez pour déplacer les points</li>
          <li>📝 Modifiez les quantités dans le panneau</li>
          <li>🧮 Calculez la solution optimale</li>
        </ul>
      </section>
    </div>
  );
}
