import type { NodeId, RuntimeGeometry, Bounds } from "./types";

/**
 * Pure layout of the BODI visualization pipeline.
 *
 * Returns a fixed vertical-pipeline layout that matches the OpenDesign
 * reference exactly. Eight nodes with the reference's data-key ordering
 * (Step 0..7, where Step 3 expands into 5 sub-graph cells 01..05).
 *
 * No DOM dependencies.
 */

/** Reference data-step ordering (`.rt-node[data-step=...]`). */
export const STEP_ORDER: ReadonlyArray<NodeId> = [
  "graph-active",
  "tick",
  "verify",
  "pass",
  "fail",
  "recover",
  "supervisor",
  "bounded-attempt",
  "persist",
  "continue",
  "exhausted",
];

/**
 * Layout footprint used by every node. The reference is content-driven
 * (no hard pixel grid) — the BODI runtime stretches to its container, so
 * the geometry is computed in container units rather than absolute pixels.
 */
const NODE_W = 240;
const NODE_H = 38;
const ROW_GAP = 0; /* nodes are stacked tight, separated by hairline borders */
const PAD_X = 0;
const PAD_Y = 26;

const COLUMN_X = 0;
const SUB_GRAPH_Y = PAD_Y + 6 * NODE_H + 28;

/** Edges in the reference DAG. */
const EDGES: ReadonlyArray<{ from: NodeId; to: NodeId }> = [
  { from: "graph-active", to: "tick" },
  { from: "tick", to: "verify" },
  { from: "verify", to: "pass" },
  { from: "verify", to: "fail" },
  { from: "pass", to: "persist" },
  { from: "persist", to: "continue" },
  { from: "fail", to: "recover" },
  { from: "recover", to: "supervisor" },
  { from: "supervisor", to: "bounded-attempt" },
  { from: "bounded-attempt", to: "verify" },
  { from: "bounded-attempt", to: "exhausted" },
];

/**
 * Compute the BODI runtime geometry. Heights scale with the requested
 * viewport so the side recovery pane aligns on the right rail.
 */
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

/** Lookup the step index of a node (0-based). Mirrors reference data-step. */
function stepIndexOf(id: NodeId): number {
  switch (id) {
    case "graph-active":
      return 0;
    case "tick":
      return 1;
    case "verify":
      return 2;
    case "pass":
      return 3;
    case "fail":
      return 4;
    case "recover":
      return 5;
    case "supervisor":
      return 6;
    case "bounded-attempt":
      return 7;
    case "persist":
      return 8;
    case "continue":
      return 9;
    case "exhausted":
      return 10;
    default:
      return 0;
  }
}

/** Lookup the bounds of a single node by id. */
export function nodeBounds(geometry: RuntimeGeometry, id: NodeId): Bounds {
  return geometry.nodes[id];
}

/** Convenience: center of a node in absolute coordinates. */
export function nodeCenter(geometry: RuntimeGeometry, id: NodeId): { x: number; y: number } {
  const b = nodeBounds(geometry, id);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

/** Y coordinate where the recovery side panel begins. */
export function subGraphY(): number {
  return SUB_GRAPH_Y;
}
