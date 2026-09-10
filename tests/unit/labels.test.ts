import { describe, expect, it } from "vitest";
import { runtimeLabels, nodeLabel } from "~/features/bodi-runtime/labels";

describe("BODI labels", () => {
  it("every node label has HR, engineering and neutral aspects", () => {
    for (const def of Object.values(runtimeLabels.nodes)) {
      expect(def.label.hr).toBeTruthy();
      expect(def.label.engineering).toBeTruthy();
      expect(def.label.neutral).toBeTruthy();
    }
  });

  it("every phase has a title and caption in HR + engineering + neutral", () => {
    for (const phase of Object.values(runtimeLabels.phases)) {
      expect(phase.title.hr).toBeTruthy();
      expect(phase.title.engineering).toBeTruthy();
      expect(phase.title.neutral).toBeTruthy();
      expect(phase.caption.hr).toBeTruthy();
      expect(phase.caption.engineering).toBeTruthy();
      expect(phase.caption.neutral).toBeTruthy();
    }
  });

  it("nodeLabel() returns the requested aspect", () => {
    expect(nodeLabel(runtimeLabels, "verify", "hr")).toBe(runtimeLabels.nodes.verify.label.hr);
    expect(nodeLabel(runtimeLabels, "verify", "engineering")).toBe(
      runtimeLabels.nodes.verify.label.engineering,
    );
    expect(nodeLabel(runtimeLabels, "verify", "neutral")).toBe(
      runtimeLabels.nodes.verify.label.neutral,
    );
  });

  it("labels never reference private Agent Garden paths or secrets", () => {
    const flat = JSON.stringify(runtimeLabels);
    expect(flat).not.toMatch(/(?:\/Users|\.bodin|Tailscale|homebrew\/opt)/i);
    expect(flat).not.toMatch(/[A-Z0-9]{32,}/);
  });
});
