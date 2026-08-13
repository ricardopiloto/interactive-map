#!/usr/bin/env bash
# Prepara uma nova instância Codex. Não sobe containers nem edita Caddy/hub.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/codex-instance.sh
source "$SCRIPT_DIR/lib/codex-instance.sh"

usage() {
  cat <<'EOF'
uso: nova-campanha.sh <nome-campanha> <porta-api> <porta-web> <sistema> [opções]

opções:
  --root <path>     CODEX_INSTANCES_ROOT (default /opt ou env)
  --url <https://…> CORS + snippets Caddy/hub
  --repo <url|path> origem do clone (default: origin do repo actual)

env: CODEX_INSTANCES_ROOT
EOF
  exit 1
}

[[ $# -ge 4 ]] || usage

SLUG="$1"
PORTA_API="$2"
PORTA_WEB="$3"
SISTEMA="$4"
shift 4

CODEX_ROOT_OVERRIDE=""
URL=""
REPO=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) CODEX_ROOT_OVERRIDE="$2"; shift 2 ;;
    --url) URL="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) codex_die "opção desconhecida: $1" ;;
  esac
done

codex_validate_slug "$SLUG"
codex_assert_ports_free "$PORTA_API" "$PORTA_WEB"

ROOT="$(codex_instances_root)"
DEST="${ROOT}/codex-${SLUG}"
PROJECT="codex-${SLUG}"
[[ -n "$URL" ]] || URL="https://codex-${SLUG}.1nodado.com.br"

codex_assert_dest_free "$DEST"
codex_require_tty
codex_prompt_admin
HASH="$(codex_hash_password "$CODEX_ADMIN_PASSWORD")"

codex_clone_or_copy "$DEST" "$REPO"
codex_write_override "$DEST" "$PROJECT" "$PORTA_API" "$PORTA_WEB"
codex_write_env "$DEST" "$SISTEMA" "$PROJECT" "$PORTA_API" "$PORTA_WEB" \
  "$URL" "$CODEX_ADMIN_USER" "$CODEX_ADMIN_PASSWORD" "$HASH"

echo "instância preparada em ${DEST}"
codex_print_snippets "$SLUG" "$SISTEMA" "$PORTA_API" "$PORTA_WEB" "$URL" \
  "$CODEX_ADMIN_USER" "$HASH" "$SLUG" "Ricardo"

echo ""
echo "próximo passo (manual):"
echo "  cd ${DEST} && docker compose up --build -d"
echo "este script NÃO inicia containers nem altera Caddyfile / campanhas.json"
