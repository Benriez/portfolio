#!/usr/bin/env bash
# scripts/verify-docs.sh
#
# Validates documentation freshness and structural consistency.
# Re-runnable; non-fatal warnings are reported but the script exits 0.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

red() { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
fail=0

check_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    red "  MISSING: $file"
    fail=1
  else
    green "  OK: $file"
  fi
}

section() { printf "\n== %s ==\n" "$*"; }

section "Documentation files exist"
for f in \
  README.md \
  docs/architecture.md \
  docs/bodi-runtime.md \
  docs/development.md \
  docs/deployment.md \
  docs/adr/0001-astro-static-architecture.md \
  docs/adr/0002-bodi-runtime-isolation.md
do
  check_file "$f"
done

section "Documented pnpm commands exist in package.json"
expected_commands=(
  "install"
  "check"
  "lint"
  "format:check"
  "typecheck"
  "test"
  "build"
  "preview"
  "test:e2e"
  "verify:docs"
  "verify:public-release"
)
for cmd in "${expected_commands[@]}"; do
  if grep -q "\"$cmd\"" package.json; then
    green "  OK: $cmd"
  else
    red "  MISSING in package.json: $cmd"
    fail=1
  fi
done

section "Relative doc links resolve"
while IFS= read -r line; do
  link="$line"
  # Strip surrounding markdown link brackets
  [[ "$link" =~ ^\[(.+)\]\((.+)\)$ ]] || continue
  target="${BASH_REMATCH[2]}"
  [[ "$target" =~ ^https?:// ]] && continue
  [[ "$target" =~ ^# ]] && continue
  # Only allow relative links starting with ./ or ../
  if [[ ! "$target" =~ ^\.{1,2}/ ]]; then
    continue
  fi
  # Skip if file doesn't exist
  for candidate in \
    "$ROOT/$target" \
    "$ROOT/${target%/index}.md" \
    "$ROOT/${target}.md"
  do
    if [[ -f "$candidate" ]]; then
      green "  RESOLVED: $target"
      continue 2
    fi
  done
  red "  UNRESOLVED DOC LINK: $target"
  fail=1
done < <(rg -oU '\[[^\]]+\]\(([^)]+)\)' docs README.md 2>/dev/null || true)

section "No absolute local paths or secrets in docs"
if rg -n "/Users/benny|homebrew/.docker|Tailscale|\\.bodin" docs README.md 2>/dev/null; then
  red "  Found suspicious paths in docs"
  fail=1
else
  green "  OK"
fi

section "README structure roughly matches repository"
required_readme_sections=(
  "Stack"
  "Architecture"
  "Local setup"
  "Commands"
  "Testing"
  "Accessibility"
  "Deployment"
)
for header in "${required_readme_sections[@]}"; do
  if rg -q "^##? .*${header}" README.md; then
    green "  OK: README mentions ${header}"
  else
    yellow "  MISSING (soft): README does not mention ${header}"
  fi
done

if [[ "$fail" -ne 0 ]]; then
  red "verify-docs: FAILED"
  exit 1
fi

green "verify-docs: PASS"
