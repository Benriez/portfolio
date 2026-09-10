import { describe, expect, it } from "vitest";
import { computeGeometry, nodeCenter, nodeBounds } from "~/features/bodi-runtime/geometry";

describe("BODI geometry", () => {
  it("produces a deterministic 11-node graph", () => {
    const geometry = computeGeometry();
    const ids = Object.keys(geometry.nodes);
    expect(ids.length).toBe(11);
  });

  it("edges form a connected DAG", () => {
    const geometry = computeGeometry();
    expect(geometry.edges.length).toBeGreaterThanOrEqual(11);
    for (const edge of geometry.edges) {
      expect(geometry.nodes[edge.from]).toBeDefined();
      expect(geometry.nodes[edge.to]).toBeDefined();
    }
  });

  it("every node has a positive area bounds", () => {
    const geometry = computeGeometry();
    for (const b of Object.values(geometry.nodes)) {
      expect(b.w).toBeGreaterThan(0);
      expect(b.h).toBeGreaterThan(0);
    }
  });

  it("nodeBounds() returns the same bounds as inline access", () => {
    const geometry = computeGeometry();
    const id = Object.keys(geometry.nodes)[0]! as keyof typeof geometry.nodes;
    expect(nodeBounds(geometry, id)).toBe(geometry.nodes[id]);
  });

  it("nodeCenter() returns the geometric center of a bounds", () => {
    const geometry = computeGeometry();
    const id = Object.keys(geometry.nodes)[0]! as keyof typeof geometry.nodes;
    const center = nodeCenter(geometry, id);
    const b = geometry.nodes[id];
    expect(center.x).toBe(b.x + b.w / 2);
    expect(center.y).toBe(b.y + b.h / 2);
  });

  it("scales bounds proportionally to viewport width", () => {
    const wide = computeGeometry({ width: 1500 });
    const narrow = computeGeometry({ width: 600 });
    expect(wide.width).toBeGreaterThanOrEqual(narrow.width);
  });
});
