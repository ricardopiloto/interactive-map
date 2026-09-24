#!/usr/bin/env bash
# Imprime snippets Caddy + Cloudflare Tunnel para o Campaign Codex.
# Não escreve Caddyfile, config.yml, hub JSON nem /opt/codex-*.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOSTNAME="campaign-codex.1nodado.com.br"
PORTA_API=""
PORTA_WEB=""

usage() {
  echo "uso: imprimir-snippets-codex.sh --porta-api PORT --porta-web PORT" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --porta-api) PORTA_API="${2:-}"; shift 2 ;;
    --porta-web) PORTA_WEB="${2:-}"; shift 2 ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
done

[[ -n "$PORTA_API" && -n "$PORTA_WEB" ]] || usage

sed \
  -e "s/__HOSTNAME__/${HOSTNAME}/g" \
  -e "s/__PORTA_API__/${PORTA_API}/g" \
  -e "s/__PORTA_WEB__/${PORTA_WEB}/g" \
  "$ROOT/deploy/snippets/caddy.site.tpl"
echo
sed \
  -e "s/__HOSTNAME__/${HOSTNAME}/g" \
  -e "s/__PORTA_WEB__/${PORTA_WEB}/g" \
  "$ROOT/deploy/snippets/cloudflared.ingress.tpl"
echo
echo "# Depois: cloudflared tunnel route dns <TUNNEL_ID> ${HOSTNAME}"
echo "# NÃO configurar redirect dos hosts antigos."
