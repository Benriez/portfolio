#!/usr/bin/env node
// scripts/diff-content.mjs
//
// Compare OpenDesign content manifest against the Astro content
// manifest. Both manifests use the same nested { hr, eng } shape for
// fields that vary by mode.
//
// Whitespace is normalized for comparison.

import { readFile, writeFile } from "node:fs/promises";

const PLACEHOLDER_PATTERNS = [
  /^\[handle\]$/,
  /^\[email@domain\.de\]$/,
  /^\[website\.de\]$/,
  /^https?:\/\/github\.com\/\[handle\]$/,
  /^mailto:\[email@domain\.de\]$/,
  /^https?:\/\/www\.linkedin\.com\/in\/\[handle\]$/,
  /^https?:\/\/\[website\.de\]$/,
  /^github\.com\/\[handle\]$/,
  /^linkedin\.com\/in\/\[handle\]$/,
];

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

function isPlaceholder(value) {
  if (typeof value !== "string") return false;
  return PLACEHOLDER_PATTERNS.some((p) => p.test(value));
}

function isPlaceholderObject(value) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  if (value.href && isPlaceholder(value.href)) return true;
  if (value.text && isPlaceholder(value.text)) return true;
  return false;
}

function classifyDiff(refVal, astVal) {
  if (isPlaceholder(refVal) && !isPlaceholder(astVal) && astVal !== "") {
    return "REFERENCE_PLACEHOLDER_RESOLVED";
  }
  if (isPlaceholder(refVal) && (astVal === "" || astVal == null)) {
    return "REFERENCE_PLACEHOLDER_OMITTED";
  }
  const nRef = normalizeWhitespace(refVal);
  const nAst = normalizeWhitespace(astVal);
  if (nRef === nAst && refVal !== astVal) {
    return "NORMALIZED_WHITESPACE_ONLY";
  }
  return "REAL_CONTENT_DIFFERENCE";
}

function hrefScheme(href) {
  if (!href || typeof href !== "string") return "";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "tel";
  try {
    const u = new URL(href);
    if (u.hostname.includes("github")) return "github";
    if (u.hostname.includes("linkedin")) return "linkedin";
    if (u.hostname.includes("website") || u.hostname.includes("benrieder")) return "website";
    if (u.hostname.includes("google")) return "location";
  } catch {
    /* not a URL */
  }
  return "";
}

function matchByHref(a, b) {
  const aRest = a.filter((x) => x && typeof x === "object" && x.href);
  const bRest = b.filter((x) => x && typeof x === "object" && x.href);
  const aMap = new Map();
  for (const item of aRest) {
    const key = hrefScheme(item.href) || item.href;
    if (!aMap.has(key)) aMap.set(key, []);
    aMap.get(key).push(item);
  }
  const matchedA = new Set();
  const paired = [];
  for (let i = 0; i < bRest.length; i += 1) {
    const bItem = bRest[i];
    const key = hrefScheme(bItem?.href) || bItem?.href;
    const bucket = aMap.get(key);
    if (bucket && bucket.length > 0) {
      paired.push({ a: bucket.shift(), b: bItem, aIdx: -1, bIdx: i });
      matchedA.add(key);
    } else {
      paired.push({ a: null, b: bItem, aIdx: -1, bIdx: i });
    }
  }
  for (const [_key, items] of aMap) {
    for (const aItem of items) {
      paired.push({ a: aItem, b: null, aIdx: -1, bIdx: -1 });
    }
  }
  return paired;
}

function compareValues(a, b, path) {
  // a = reference value, b = astro value (semantic ordering).
  // Normalize null and empty string as "absent".
  if (a == null) a = "";
  if (b == null) b = "";
  if (a === "" && b === "") return [];
  if (a === "" && b !== "") {
    return [{ path, status: "MISSING", ref: a, ast: b, classification: classifyDiff(a, b) }];
  }
  if (a !== "" && b === "") {
    const classification = isPlaceholderObject(a)
      ? "REFERENCE_PLACEHOLDER_OMITTED"
      : classifyDiff(a, b);
    return [{ path, status: "EXTRA", ref: a, ast: b, classification }];
  }
  // Both sides are mode-pair objects: compare each mode separately
  if (isModePair(a) && isModePair(b)) {
    const out = [];
    const hr = normalizeWhitespace(a.hr);
    const bhr = normalizeWhitespace(b.hr);
    if (hr !== bhr) {
      out.push({
        path: `${path}.hr`,
        status: "DIFFERENT",
        ref: hr,
        ast: bhr,
        classification: classifyDiff(a.hr, b.hr),
      });
    }
    const eng = normalizeWhitespace(a.eng);
    const beng = normalizeWhitespace(b.eng);
    if (eng !== beng) {
      out.push({
        path: `${path}.eng`,
        status: "DIFFERENT",
        ref: eng,
        ast: beng,
        classification: classifyDiff(a.eng, b.eng),
      });
    }
    return out;
  }
  const na = normalizeWhitespace(a);
  const nb = normalizeWhitespace(b);
  if (na !== nb) {
    return [{ path, status: "DIFFERENT", ref: na, ast: nb, classification: classifyDiff(a, b) }];
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
        if (
          path.endsWith("contact.actions") &&
          a.length > 0 &&
          b.length > 0 &&
          a.every((x) => x && typeof x === "object" && "href" in x) &&
          b.every((x) => x && typeof x === "object" && "href" in x)
        ) {
          const pairs = matchByHref(a, b);
          for (const { a: aItem, b: bItem } of pairs) {
            out.push(...compareFieldGroups(aItem, bItem, `${path}[*]`));
          }
        } else {
          if (a.length !== b.length) {
            out.push({
              path,
              status: "DIFFERENT",
              note: `array length ${a.length} vs ${b.length}`,
            });
          }
          const max = Math.max(a.length, b.length);
          for (let i = 0; i < max; i += 1) {
            out.push(...compareFieldGroups(a[i], b[i], `${path}[${i}]`));
          }
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
    const isContactActions = prefix.endsWith("contact.actions");
    if (
      isContactActions &&
      a.length > 0 &&
      b.length > 0 &&
      a.every((x) => x && typeof x === "object" && "href" in x) &&
      b.every((x) => x && typeof x === "object" && "href" in x)
    ) {
      const pairs = matchByHref(a, b);
      for (const { a: aItem, b: bItem } of pairs) {
        out.push(...compareFieldGroups(aItem, bItem, `${prefix}[*]`));
      }
      return out;
    }
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

const resolved = diffs.filter((d) => d.classification === "REFERENCE_PLACEHOLDER_RESOLVED").length;
const omitted = diffs.filter((d) => d.classification === "REFERENCE_PLACEHOLDER_OMITTED").length;
const whitespaceOnly = diffs.filter(
  (d) => d.classification === "NORMALIZED_WHITESPACE_ONLY",
).length;
const realDiff = diffs.filter((d) => d.classification === "REAL_CONTENT_DIFFERENCE").length;

await writeFile(
  "/tmp/portfolio-content-diff.json",
  JSON.stringify(
    {
      total,
      missing,
      different,
      extra,
      classification: {
        REFERENCE_PLACEHOLDER_RESOLVED: resolved,
        REFERENCE_PLACEHOLDER_OMITTED: omitted,
        NORMALIZED_WHITESPACE_ONLY: whitespaceOnly,
        REAL_CONTENT_DIFFERENCE: realDiff,
      },
      diffs: diffs,
    },
    null,
    2,
  ),
);

// eslint-disable-next-line no-console
console.log(`Total: ${total}, MISSING: ${missing}, DIFFERENT: ${different}, EXTRA: ${extra}`);
// eslint-disable-next-line no-console
console.log(`Classification:`);
// eslint-disable-next-line no-console
console.log(`  REFERENCE_PLACEHOLDER_RESOLVED: ${resolved}`);
// eslint-disable-next-line no-console
console.log(`  REFERENCE_PLACEHOLDER_OMITTED: ${omitted}`);
// eslint-disable-next-line no-console
console.log(`  NORMALIZED_WHITESPACE_ONLY: ${whitespaceOnly}`);
// eslint-disable-next-line no-console
console.log(`  REAL_CONTENT_DIFFERENCE: ${realDiff}`);
// eslint-disable-next-line no-console
console.log("Diff entries:");
// eslint-disable-next-line no-console
console.log(
  diffs
    .map(
      (d) =>
        `${d.path}: ${d.status} [${d.classification}]` +
        (d.ref != null ? ` ref=${JSON.stringify(d.ref).slice(0, 80)}` : "") +
        (d.ast != null ? ` ast=${JSON.stringify(d.ast).slice(0, 80)}` : "") +
        (d.note ? ` (${d.note})` : ""),
    )
    .join("\n"),
);
