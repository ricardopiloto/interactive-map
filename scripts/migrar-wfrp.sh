#!/usr/bin/env bash
# Aposentado (spec 099): instâncias WFRP/WoD importam-se com campanha importar-legado.
set -euo pipefail

echo "Aposentado: migrar-wfrp.sh já não reconfigura instâncias. Use o Campaign Codex." >&2
echo "Import legado: uv run python -m app.cli campanha importar-legado …" >&2
echo "Corte / runbook: docs/runbook-corte-campaign-codex.md" >&2
exit 1
