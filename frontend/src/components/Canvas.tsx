/**
 * Composant Canvas pour la visualisation interactive
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import type { MapPoint } from "../types";

const WAREHOUSE_SIZE = 30;
const STORE_RADIUS = 18;

interface CanvasProps {
  width: number;
  height: number;
}

export function Canvas({ width, height }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const {
    warehouses,
    stores,
    toolMode,
    selectedPointId,
    solution,
    addWarehouse,
    addStore,
    selectPoint,
    deletePoint,
    movePoint,
  } = useStore();

  // Dessiner le canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    // Grille
    ctx.strokeStyle = "#2a2a4e";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dessiner les flux si solution existe
    if (solution) {
      const maxFlow = Math.max(...solution.flows.map((f) => f.quantity), 1);

      for (const flow of solution.flows) {
        const warehouse = warehouses[flow.from_warehouse];
        const store = stores[flow.to_store];
        if (!warehouse || !store) continue;

        const lineWidth = 2 + (flow.quantity / maxFlow) * 8;
        const alpha = 0.4 + (flow.quantity / maxFlow) * 0.5;

        // Gradient de couleur basé sur le coût
        const maxCost = Math.max(...solution.flows.map((f) => f.cost), 1);
        const costRatio = flow.cost / maxCost;
        const r = Math.round(100 + costRatio * 155);
        const g = Math.round(200 - costRatio * 150);
        const b = 100;

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(warehouse.x, warehouse.y);
        ctx.lineTo(store.x, store.y);
        ctx.stroke();

        // Label du flux au milieu
        const midX = (warehouse.x + store.x) / 2;
        const midY = (warehouse.y + store.y) / 2;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${flow.quantity}`, midX, midY);
      }
    }

    // Dessiner les entrepôts (carrés bleus)
    for (const w of warehouses) {
      const isSelected = w.id === selectedPointId;

      ctx.fillStyle = isSelected ? "#60a5fa" : "#3b82f6";
      ctx.strokeStyle = isSelected ? "#fff" : "#1d4ed8";
      ctx.lineWidth = isSelected ? 3 : 2;

      ctx.fillRect(
        w.x - WAREHOUSE_SIZE / 2,
        w.y - WAREHOUSE_SIZE / 2,
        WAREHOUSE_SIZE,
        WAREHOUSE_SIZE,
      );
      ctx.strokeRect(
        w.x - WAREHOUSE_SIZE / 2,
        w.y - WAREHOUSE_SIZE / 2,
        WAREHOUSE_SIZE,
        WAREHOUSE_SIZE,
      );

      // Icône entrepôt (simplified)
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📦", w.x, w.y);

      // Label stock
      ctx.fillStyle = "#93c5fd";
      ctx.font = "bold 11px Arial";
      ctx.fillText(`${w.stock}`, w.x, w.y + WAREHOUSE_SIZE / 2 + 12);
    }

    // Dessiner les magasins (cercles verts)
    for (const s of stores) {
      const isSelected = s.id === selectedPointId;

      ctx.fillStyle = isSelected ? "#4ade80" : "#22c55e";
      ctx.strokeStyle = isSelected ? "#fff" : "#15803d";
      ctx.lineWidth = isSelected ? 3 : 2;

      ctx.beginPath();
      ctx.arc(s.x, s.y, STORE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icône magasin
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🏪", s.x, s.y);

      // Label demande
      ctx.fillStyle = "#86efac";
      ctx.font = "bold 11px Arial";
      ctx.fillText(`${s.demand}`, s.x, s.y + STORE_RADIUS + 12);
    }
  }, [warehouses, stores, selectedPointId, solution, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Trouver le point sous le curseur
  const findPointAt = (x: number, y: number): MapPoint | null => {
    for (const w of warehouses) {
      if (
        Math.abs(w.x - x) <= WAREHOUSE_SIZE / 2 &&
        Math.abs(w.y - y) <= WAREHOUSE_SIZE / 2
      ) {
        return w;
      }
    }
    for (const s of stores) {
      const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2);
      if (dist <= STORE_RADIUS) {
        return s;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = findPointAt(x, y);

    if (toolMode === "delete" && point) {
      deletePoint(point.id);
      return;
    }

    if (toolMode === "select" && point) {
      selectPoint(point.id);
      setDraggingId(point.id);
      setDragOffset({ x: point.x - x, y: point.y - y });
      return;
    }

    if (toolMode === "warehouse" && !point) {
      addWarehouse(x, y);
      return;
    }

    if (toolMode === "store" && !point) {
      addStore(x, y);
      return;
    }

    // En mode warehouse/store, cliquer sur un point le sélectionne
    if (point) {
      selectPoint(point.id);
      setDraggingId(point.id);
      setDragOffset({ x: point.x - x, y: point.y - y });
    } else {
      selectPoint(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingId) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(
      20,
      Math.min(width - 20, e.clientX - rect.left + dragOffset.x),
    );
    const y = Math.max(
      20,
      Math.min(height - 20, e.clientY - rect.top + dragOffset.y),
    );

    movePoint(draggingId, x, y);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ cursor: draggingId ? "grabbing" : "crosshair" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
