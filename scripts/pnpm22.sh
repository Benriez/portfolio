#!/bin/bash
# scripts/pnpm22.sh
#
# Local-toolchain shim: invokes pnpm 12.3.4 under Node 22+, using the
# npm-installed native binary directly and bypassing the corepack shim.
#
# Why this exists: pnpm 12 is too new for the corepack version shipped
# with Homebrew node@22, so the standard `pnpm` binary in the Homebrew
# shim directory fails signature verification. This wrapper resolves the
# situation by preferring the working binary in npm's global prefix.
#
# CI is unaffected — GitHub Actions sets up Node 22 and pnpm 12.3.4
# directly via actions/setup-node + pnpm/action-setup.
set -euo pipefail

NPM_GLOBAL_BIN="/opt/homebrew/lib/node_modules/pnpm"
NODE22_BIN_DIR="/opt/homebrew/opt/node@22/bin"

if [[ -x "${NODE22_BIN_DIR}/node" ]]; then
  PATH="${NODE22_BIN_DIR}:${PATH}"
fi
if [[ -x "${NPM_GLOBAL_BIN}/pnpm" ]]; then
  PATH="${NPM_GLOBAL_BIN}:${PATH}"
fi

export PATH

exec "${NPM_GLOBAL_BIN}/pnpm" "$@"
