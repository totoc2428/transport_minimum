/**
 * Types pour l'application Transport Minimum
 */

export interface Point {
  id: string;
  x: number;
  y: number;
  name: string;
}

export interface Warehouse extends Point {
  type: 'warehouse';
  stock: number;
}

export interface Store extends Point {
  type: 'store';
  demand: number;
}

export type MapPoint = Warehouse | Store;

export interface Flow {
  from_warehouse: number;
  to_store: number;
  warehouse_name: string;
  store_name: string;
  quantity: number;
  cost: number;
  total_cost: number;
}

export interface SolveResponse {
  total_cost: number;
  flows: Flow[];
  cost_matrix: number[][];
}

export type ToolMode = 'warehouse' | 'store' | 'select' | 'delete';
