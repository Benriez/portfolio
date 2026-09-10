#!/usr/bin/env node
// scripts/diff-content.mjs
//
// Compare OpenDesign content manifest against the Astro content
// manifest. Both manifests use the same nested { hr, eng } shape for
// fields that vary by mode.
//
// Whitespace is normalized for comparison.

import { readFile, writeFile } from "node:fs/promises";

function normalizeWhitespace(s) {
  if (s == null) return s;
  return String(s).replace(/\s+/g, " ").trim();
}

function isModePair(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "hr" in value &&
    "eng" in value
  );
}

function compareValues(a, b, path) {
  // a = reference value, b = astro value (semantic ordering).
  // Normalize null and empty string as "absent".
  if (a == null) a = "";
  if (b == null) b = "";
  if (a === "" && b === "") return [];
  if (a === "" && b !== "") {
    return [{ path, status: "MISSING", ref: a, ast: b }];
  }
  if (a !== "" && b === "") {
    return [{ path, status: "EXTRA", ref: a, ast: b }];
  }
  // Both sides are mode-pair objects: compare each mode separately
  if (isModePair(a) && isModePair(b)) {
    const out = [];
    const hr = normalizeWhitespace(a.hr);
    const bhr = normalizeWhitespace(b.hr);
    if (hr !== bhr) {
      out.push({ path: `${path}.hr`, status: "DIFFERENT", ref: hr, ast: bhr });
    }
    const eng = normalizeWhitespace(a.eng);
    const beng = normalizeWhitespace(b.eng);
    if (eng !== beng) {
      out.push({ path: `${path}.eng`, status: "DIFFERENT", ref: eng, ast: beng });
    }
    return out;
  }
  const na = normalizeWhitespace(a);
  const nb = normalizeWhitespace(b);
  if (na !== nb) {
    return [{ path, status: "DIFFERENT", ref: na, ast: nb }];
  }
  return [];
}

function compareFieldGroups(ref, ast, prefix) {
  const out = [];
  // Primitive comparison
  if (ref !== null && ast !== null && (typeof ref !== "object" || typeof ast !== "object")) {
    return compareValues(ref, ast, prefix);
  }
  // Both objects
  if (
    ref !== null &&
    typeof ref === "object" &&
    typeof ref !== "string" &&
    !Array.isArray(ref) &&
    ast !== null &&
    typeof ast === "object" &&
    typeof ast !== "string" &&
    !Array.isArray(ast)
  ) {
    const allKeys = new Set([...Object.keys(ref ?? {}), ...Object.keys(ast ?? {})]);
    for (const key of allKeys) {
      const path = `${prefix}.${key}`;
      const refVal = ref?.[key];
      const astVal = ast?.[key];
      if (refVal == null && astVal == null) continue;
      if (Array.isArray(refVal) || Array.isArray(astVal)) {
        const a = refVal ?? [];
        const b = astVal ?? [];
        if (a.length !== b.length) {
          out.push({ path, status: "DIFFERENT", note: `array length ${a.length} vs ${b.length}` });
        }
        const max = Math.max(a.length, b.length);
        for (let i = 0; i < max; i += 1) {
          out.push(...compareFieldGroups(a[i], b[i], `${path}[${i}]`));
        }
      } else {
        out.push(...compareFieldGroups(refVal, astVal, path));
      }
    }
    return out;
  }
  // Both arrays
  if (Array.isArray(ref) || Array.isArray(ast)) {
    const a = ref ?? [];
    const b = ast ?? [];
    if (a.length !== b.length) {
      out.push({
        path: prefix,
        status: "DIFFERENT",
        note: `array length ${a.length} vs ${b.length}`,
      });
    }
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i += 1) {
      out.push(...compareFieldGroups(a[i], b[i], `${prefix}[${i}]`));
    }
    return out;
  }
  return compareValues(ref, ast, prefix);
}

const ref = JSON.parse(await readFile("/tmp/portfolio-opendesign-content-reference.json", "utf8"));
const ast = JSON.parse(await readFile("/tmp/portfolio-astro-content-current.json", "utf8"));

const diffs = compareFieldGroups(ref, ast, "root");
const total = diffs.length;
const missing = diffs.filter((d) => d.status === "MISSING").length;
const different = diffs.filter((d) => d.status === "DIFFERENT").length;
const extra = diffs.filter((d) => d.status === "EXTRA").length;

await writeFile(
  "/tmp/portfolio-content-diff.json",
  JSON.stringify(
    {
      total,
      missing,
      different,
      extra,
      diffs: diffs,
    },
    null,
    2,
  ),
);

// eslint-disable-next-line no-console
console.log(`Total: ${total}, MISSING: ${missing}, DIFFERENT: ${different}, EXTRA: ${extra}`);
// eslint-disable-next-line no-console
console.log("Diff entries:");
// eslint-disable-next-line no-console
console.log(
  diffs
    .map(
      (d) =>
        `${d.path}: ${d.status}` +
        (d.ref != null ? ` ref=${JSON.stringify(d.ref).slice(0, 80)}` : "") +
        (d.ast != null ? ` ast=${JSON.stringify(d.ast).slice(0, 80)}` : "") +
        (d.note ? ` (${d.note})` : ""),
    )
    .join("\n"),
);
