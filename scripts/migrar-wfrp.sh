#!/usr/bin/env bash
# Reconfigura a campanha WFRP actual para <root>/codex-wfrp.
# Não edita Caddyfile, cloudflared nem hub/campanhas.json.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/codex-instance.sh
source "$SCRIPT_DIR/lib/codex-instance.sh"

usage() {
  cat <<'EOF'
uso: migrar-wfrp.sh <porta-api> <porta-web> [opções]

destino fixo: codex-wfrp

opções:
  --root <path>     CODEX_INSTANCES_ROOT (default /opt)
  --source <path>   instalação actual (default /var/www/interactive-map)
  --url <https://…> snippets / CORS
EOF
  exit 1
}

[[ $# -ge 2 ]] || usage

PORTA_API="$1"
PORTA_WEB="$2"
shift 2

CODEX_ROOT_OVERRIDE=""
SOURCE="/var/www/interactive-map"
URL="https://codex-wfrp.1nodado.com.br"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) CODEX_ROOT_OVERRIDE="$2"; shift 2 ;;
    --source) SOURCE="$2"; shift 2 ;;
    --url) URL="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) codex_die "opção desconhecida: $1" ;;
  esac
done

SLUG="wfrp"
PROJECT="codex-wfrp"
SISTEMA="wfrp4e"

[[ -d "$SOURCE" ]] || codex_die "origem não existe: $SOURCE"
[[ -f "$SOURCE/docker-compose.yml" || -d "$SOURCE/backend" ]] || \
  codex_die "origem não parece um checkout Codex: $SOURCE"

echo "se for reutilizar as mesmas portas da instância actual, pare os containers de origem primeiro."
codex_assert_ports_free "$PORTA_API" "$PORTA_WEB"

ROOT="$(codex_instances_root)"
DEST="${ROOT}/codex-wfrp"
codex_assert_dest_free "$DEST"

CODEX_ADMIN_USER="gm"
CODEX_ADMIN_PASSWORD=""
HASH=""

if [[ -f "$SOURCE/.env" ]]; then
  _env_get() {
    grep -E "^${1}=" "$SOURCE/.env" | tail -n1 | cut -d= -f2-
  }
  CODEX_ADMIN_USER="$(_env_get ADMIN_USER)"
  CODEX_ADMIN_USER="${CODEX_ADMIN_USER:-gm}"
  CODEX_ADMIN_PASSWORD="$(_env_get ADMIN_PASSWORD)"
  HASH="$(_env_get ADMIN_PASSWORD_HASH)"
fi

if [[ -z "$CODEX_ADMIN_PASSWORD" ]]; then
  codex_require_tty
  codex_prompt_admin
  HASH="$(codex_hash_password "$CODEX_ADMIN_PASSWORD")"
elif [[ -z "$HASH" ]]; then
  HASH="$(codex_hash_password "$CODEX_ADMIN_PASSWORD")"
fi

codex_clone_or_copy "$DEST" "$SOURCE"

if [[ -d "$SOURCE/data" ]]; then
  mkdir -p "$DEST/data"
  cp -a "$SOURCE/data/." "$DEST/data/"
fi
if [[ -d "$SOURCE/backend/data" ]]; then
  mkdir -p "$DEST/backend/data"
  cp -a "$SOURCE/backend/data/." "$DEST/backend/data/"
fi
if [[ -d "$SOURCE/uploads" ]]; then
  mkdir -p "$DEST/uploads"
  cp -a "$SOURCE/uploads/." "$DEST/uploads/"
fi
if [[ -d "$SOURCE/backend/uploads" ]]; then
  mkdir -p "$DEST/backend/uploads"
  cp -a "$SOURCE/backend/uploads/." "$DEST/backend/uploads/"
fi

codex_write_override "$DEST" "$PROJECT" "$PORTA_API" "$PORTA_WEB"
codex_write_env "$DEST" "$SISTEMA" "$PROJECT" "$PORTA_API" "$PORTA_WEB" \
  "$URL" "$CODEX_ADMIN_USER" "$CODEX_ADMIN_PASSWORD" "$HASH"

echo "migração preparada em ${DEST}"
codex_print_snippets "$SLUG" "$SISTEMA" "$PORTA_API" "$PORTA_WEB" "$URL" \
  "$CODEX_ADMIN_USER" "$HASH" "Ecos de Reikland" "Ricardo"

echo ""
echo "próximo passo (manual):"
echo "  cd ${DEST} && docker compose up --build -d"
echo "este script NÃO altera Caddyfile, cloudflared nem hub/campanhas.json"
echo "(snippets acima — colar à mão)"
