#!/usr/bin/env bash
# Aposentado (spec 099): campanhas novas = Campaign Codex.
set -euo pipefail

echo "Aposentado: o modelo multi-instância (nova-campanha.sh) já não é o procedimento corrente." >&2
echo "Use o Campaign Codex: \`uv run python -m app.cli campanha criar\` ou a UI /painel." >&2
echo "Corte / runbook: docs/runbook-corte-campaign-codex.md" >&2
exit 1
