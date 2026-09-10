import type { NodeId, RuntimeGeometry, Bounds } from "./types";

/**
 * Pure layout of the BODI graph.
 *
 * Takes a list of node bounds (in a virtual coordinate system) and produces
 * a complete {@link RuntimeGeometry} describing a fixed graph layout. No DOM
 * dependencies, no animation timings.
 */

/** The 11-node graph used in the visualization. */
const NODES_ORDERED: ReadonlyArray<NodeId> = [
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

/** Density-tolerant layout chosen for 768px+ viewports. */
const DEFAULT_WIDTH = 980;
const DEFAULT_HEIGHT = 360;

const COL_WIDTH = 130;
const ROW_HEIGHT = 64;
const COL_GAP = 60;
const ROW_GAP = 28;
const PAD_X = 28;
const PAD_Y = 28;

const COL_INDEX: Record<NodeId, number> = {
  "graph-active": 0,
  tick: 1,
  verify: 2,
  pass: 3,
  fail: 3,
  recover: 4,
  supervisor: 4,
  "bounded-attempt": 5,
  persist: 6,
  continue: 6,
  exhausted: 5,
};

const ROW_INDEX: Record<NodeId, number> = {
  "graph-active": 0,
  tick: 0,
  verify: 0,
  pass: 0,
  fail: 1,
  recover: 1,
  supervisor: 2,
  "bounded-attempt": 3,
  persist: 0,
  continue: 0,
  exhausted: 4,
};

/** Edges in the visualization graph. The DAG is finite and acyclic. */
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
 * Compute the full {@link RuntimeGeometry} for the BODI runtime visualization.
 *
 * @param viewport - Optional target viewport size, used only for resolution-aware
 *   down-scaling; the returned layout is the same shape regardless.
 */
export function computeGeometry(viewport?: { readonly width: number }): RuntimeGeometry {
  const targetW = viewport?.width ?? DEFAULT_WIDTH;
  const fitScale = Math.min(1, targetW / DEFAULT_WIDTH);

  const nodeBounds: Partial<Record<NodeId, Bounds>> = {};

  for (const id of NODES_ORDERED) {
    const col = COL_INDEX[id];
    const row = ROW_INDEX[id];
    const x = PAD_X + col * (COL_WIDTH + COL_GAP);
    const y = PAD_Y + row * (ROW_HEIGHT + ROW_GAP);
    nodeBounds[id] = { x, y, w: COL_WIDTH, h: ROW_HEIGHT };
  }

  // All nodes are required.
  const required = NODES_ORDERED.map((id) => {
    const bounds = nodeBounds[id];
    if (!bounds) {
      throw new Error(`Bounds missing for ${id}`);
    }
    return [id, bounds] as const;
  });

  const finalBounds: Record<NodeId, Bounds> = Object.fromEntries(required) as Record<
    NodeId,
    Bounds
  >;

  return {
    width: DEFAULT_WIDTH * fitScale,
    height: DEFAULT_HEIGHT * fitScale,
    nodes: finalBounds,
    edges: [...EDGES],
  };
}

/** Look up the bounds of a single node by id. */
export function nodeBounds(geometry: RuntimeGeometry, id: NodeId): Bounds {
  return geometry.nodes[id];
}

/** Convenience: center of a node in absolute coordinates. */
export function nodeCenter(geometry: RuntimeGeometry, id: NodeId): { x: number; y: number } {
  const b = nodeBounds(geometry, id);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}
