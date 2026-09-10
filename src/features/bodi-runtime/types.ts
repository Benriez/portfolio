/**
 * Domain types for the BODI runtime visualization.
 *
 * The portfolio does NOT run the real BODI runtime.
 * It displays a deterministic visualization of Agent Garden semantics.
 */

/** Graph node labels used in the visualization. */
export type NodeId =
  | "graph-active"
  | "tick"
  | "verify"
  | "pass"
  | "fail"
  | "persist"
  | "continue"
  | "recover"
  | "supervisor"
  | "bounded-attempt"
  | "exhausted";

export type PhaseId = "normal" | "recovery" | "exhausted";

export type Aspect = "hr" | "engineering" | "neutral";

export interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface RuntimeGeometry {
  readonly width: number;
  readonly height: number;
  readonly nodes: Record<NodeId, Bounds>;
  readonly edges: Array<{ from: NodeId; to: NodeId }>;
}

export interface GraphNodeDefinition {
  readonly id: NodeId;
  readonly label: Record<Aspect, string>;
}

export interface RuntimeLabelSet {
  readonly nodes: Record<NodeId, GraphNodeDefinition>;
  readonly phases: Record<
    PhaseId,
    { title: Record<Aspect, string>; caption: Record<Aspect, string> }
  >;
}

export interface TickFrame {
  readonly phase: PhaseId;
  readonly active: ReadonlyArray<NodeId>;
  readonly done: ReadonlyArray<NodeId>;
  readonly attempt: number;
}
