#!/usr/bin/env bash
# scripts/check-public-release.sh
#
# Public release audit. Confirms the repository is safe to make public.
# Run with `pnpm run verify:public-release` from repo root.
#
# This script MUST NOT touch network, GitHub, or filesystem paths
# outside the repo.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

red() { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }

# Patterns that should NEVER appear in a public repo.
CRITICAL_PATTERNS=(
  'BEGIN [A-Z]+ PRIVATE KEY' # Any private key block
  'AKIA[0-9A-Z]{16}'         # AWS access key id
  'ghp_[A-Za-z0-9]{36}'      # GitHub PAT
  'github_pat_[A-Za-z0-9_]{82}' # GitHub fine-grained PAT
  'sk-[A-Za-z0-9]{32,}'      # OpenAI API key style
  'xox[baprs]-[A-Za-z0-9-]+'  # Slack tokens
)

# Locally meaningful patterns.
LOCAL_PATTERNS=(
  '/Users/benny/'
  '/Users/benny/Code/agent-garden'
  '/Users/benny/Code/Portfolio/opendesign'
  '/Users/benny/.bodin'
  'hermes_pi_ed25519'
  'Tailscale'
  'flashback@100\.127\.113\.104'
)

# Placeholder leakage.
PLACEHOLDER_PATTERNS=(
  '\[handle\]'
  '\[email@domain\.de\]'
  '\[website\.de\]'
  '\[TODO\]'
  '\[TBD\]'
  '\[FIXME\]'
)

fail=0
critical_hit=0
local_hit=0
placeholder_hit=0

files_to_scan=$(rg --files --hidden -g '!.git' -g '!node_modules' -g '!dist' -g '!.astro' -g '!playwright-report' -g '!test-results' 2>/dev/null || true)

if [[ -z "$files_to_scan" ]]; then
  files_to_scan="$(find . -type f \( -path './.git' -o -path './node_modules' -o -path './dist' -o -path './.astro' -o -path './playwright-report' -o -path './test-results' \) -prune -o -type f -print | sed 's|^\./||')"
fi

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  # Skip binary files
  if file "$file" 2>/dev/null | grep -q 'binary'; then
    continue
  fi
  for pattern in "${CRITICAL_PATTERNS[@]}"; do
    if rg -q --pcre2 "$pattern" "$file" 2>/dev/null; then
      red "  CRITICAL HIT: $file matched $pattern"
      critical_hit=1
      fail=1
    fi
  done
done <<< "$files_to_scan"

# Banned frameworks check (should not appear in stack listings)
if rg -qi "tailwind|react \b|vue \b|angular" docs src/data README.md 2>/dev/null; then
  yellow "  WARN: Banned framework name found in docs/data — verify intent"
  # Don't fail on this — it's a warning.
fi

# Public contact placeholders must be removed
while IFS= read -r pattern; do
  if rg -q "$pattern" src 2>/dev/null; then
    red "  PLACEHOLDER LEAK: $pattern still present in src/"
    placeholder_hit=1
    fail=1
  fi
done <<< "$(printf '%s\n' "${PLACEHOLDER_PATTERNS[@]}")"

# Local paths must not appear
while IFS= read -r pattern; do
  if rg -q -F "$pattern" src public docs README.md 2>/dev/null; then
    red "  LOCAL PATH LEAK: $pattern found in tracked content"
    local_hit=1
    fail=1
  fi
done <<< "$(printf '%s\n' "${LOCAL_PATTERNS[@]}")"

# Generated junk check
for generated in "dist" ".astro" "playwright-report" "test-results" ".pnpm-store"; do
  if [[ -d "$generated" ]]; then
    yellow "  Generated directory present: $generated (must be in .gitignore)"
  fi
done

# OpenDesign metadata should not be in the production repo
if [[ -d "../opendesign" ]]; then
  if rg -q "DESIGN-MANIFEST|DESIGN-HANDOFF" src public docs 2>/dev/null; then
    red "  OpenDesign vendor metadata found in repo"
    fail=1
  fi
fi

echo ""
if [[ "$fail" -ne 0 ]]; then
  red "check-public-release: FAILED"
  echo ""
  echo "Failure summary:"
  [[ $critical_hit -ne 0 ]] && echo "  - critical pattern hits found"
  [[ $local_hit -ne 0 ]] && echo "  - local-path leak found"
  [[ $placeholder_hit -ne 0 ]] && echo "  - placeholder leak found"
  exit 1
fi

green "check-public-release: PASS"
echo ""
echo "Audit summary:"
echo "  - critical pattern hits: $critical_hit"
echo "  - local-path leaks: $local_hit"
echo "  - placeholder leaks: $placeholder_hit"
