import type { NodeId, RuntimeGeometry, Bounds } from "./types";

/**
 * Pure layout of the BODI visualization pipeline.
 *
 * The NodeId values match the OpenDesign reference's `data-key` attributes:
 *   task, gate, memory, graph, runtime, verify, persist, continue, recover,
 *   fail, bounded-attempt, supervisor, exhausted.
 *
 * Step indices mirror the reference's `data-step` ordering.
 */

/** Reference data-step ordering (`.rt-node[data-step=...]`). */
export const STEP_ORDER: ReadonlyArray<NodeId> = [
  "task",
  "gate",
  "memory",
  "graph",
  "runtime",
  "verify",
  "recover",
  "supervisor",
  "bounded-attempt",
  "fail",
  "persist",
  "continue",
  "exhausted",
];

/**
 * Layout footprint used by every node.
 */
const NODE_W = 240;
const NODE_H = 38;
const ROW_GAP = 0;
const PAD_X = 0;
const PAD_Y = 26;

const COLUMN_X = 0;
const SUB_GRAPH_Y = PAD_Y + 6 * NODE_H + 28;

/** Edges in the reference DAG (mirrors app.js EDGES). */
const EDGES: ReadonlyArray<{ from: NodeId; to: NodeId }> = [
  { from: "task", to: "gate" },
  { from: "gate", to: "memory" },
  { from: "memory", to: "graph" },
  { from: "graph", to: "runtime" },
  { from: "runtime", to: "verify" },
  { from: "verify", to: "fail" },
  { from: "fail", to: "recover" },
  { from: "recover", to: "supervisor" },
  { from: "supervisor", to: "bounded-attempt" },
  { from: "bounded-attempt", to: "verify" },
  { from: "bounded-attempt", to: "exhausted" },
];

export function computeGeometry(viewport?: { readonly width: number }): RuntimeGeometry {
  const targetW = viewport?.width ?? 880;
  const widthScale = Math.min(1.4, Math.max(0.9, targetW / 880));

  const nodes: Partial<Record<NodeId, Bounds>> = {};
  for (const id of STEP_ORDER) {
    const stepIndex = stepIndexOf(id);
    nodes[id] = {
      x: PAD_X + COLUMN_X,
      y: PAD_Y + stepIndex * (NODE_H + ROW_GAP),
      w: NODE_W * widthScale,
      h: NODE_H,
    };
  }

  const required = STEP_ORDER.map((id) => {
    const b = nodes[id];
    if (!b) throw new Error(`Bounds missing for ${id}`);
    return [id, b] as const;
  });
  const finalBounds: Record<NodeId, Bounds> = Object.fromEntries(required) as Record<
    NodeId,
    Bounds
  >;

  return {
    width: targetW,
    height: PAD_Y + STEP_ORDER.length * (NODE_H + ROW_GAP) + 60,
    nodes: finalBounds,
    edges: [...EDGES],
  };
}

function stepIndexOf(id: NodeId): number {
  switch (id) {
    case "task":
      return 0;
    case "gate":
      return 1;
    case "memory":
      return 2;
    case "graph":
      return 3;
    case "runtime":
      return 4;
    case "verify":
      return 5;
    case "recover":
      return 6;
    case "supervisor":
      return 7;
    case "bounded-attempt":
      return 8;
    case "fail":
      return 9;
    case "persist":
      return 10;
    case "continue":
      return 11;
    case "exhausted":
      return 12;
    default:
      return 0;
  }
}

export function nodeBounds(geometry: RuntimeGeometry, id: NodeId): Bounds {
  return geometry.nodes[id];
}

export function nodeCenter(geometry: RuntimeGeometry, id: NodeId): { x: number; y: number } {
  const b = nodeBounds(geometry, id);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export function subGraphY(): number {
  return SUB_GRAPH_Y;
}
