#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

fail() {
  printf 'ERRO: %s\n' "$*" >&2
  exit 2
}

PROFILE="${1:-all}"
case "$PROFILE" in
  all|--all) PROFILE="all" ;;
  frontend|--frontend) PROFILE="frontend" ;;
  backend|--backend) PROFILE="backend" ;;
  -h|--help)
    printf 'Uso: %s [--frontend|--backend|--all]\n' "$0"
    printf '  --frontend  lint e contraste; adequado a CSS e componentes visuais\n'
    printf '  --backend   nove testes unitários/CLI selecionados\n'
    printf '  --all       backend selecionado + lint + contraste (padrão)\n'
    exit 0
    ;;
  *) fail "opção desconhecida: $PROFILE (use --help)" ;;
esac

if [[ "$PROFILE" == "all" || "$PROFILE" == "backend" ]]; then
  command -v uv >/dev/null 2>&1 || fail "uv não encontrado; instale as dependências do backend conforme backend/README.md"
  [[ -d "$BACKEND_DIR/.venv" ]] || fail "backend/.venv ausente; execute uv sync --group dev uma vez"
fi

if [[ "$PROFILE" == "all" || "$PROFILE" == "frontend" ]]; then
  command -v node >/dev/null 2>&1 || fail "Node.js não encontrado; instale as dependências do frontend conforme frontend/README.md"
  command -v npm >/dev/null 2>&1 || fail "npm não encontrado"
  [[ -x "$FRONTEND_DIR/node_modules/.bin/oxlint" ]] || fail "frontend/node_modules ausente; execute npm install uma vez"
fi

# No dependency sync occurs in this profile; keep uv's metadata cache in a writable temp path.
if [[ "$PROFILE" == "all" || "$PROFILE" == "backend" ]]; then
  export UV_CACHE_DIR="${UV_CACHE_DIR:-${TMPDIR:-/tmp}/interactive-map-uv-cache}"
  mkdir -p "$UV_CACHE_DIR" || fail "não foi possível preparar o cache temporário do uv"
fi

run_step() {
  local label="$1" directory="$2"
  shift 2
  local started ended status
  started="$(date +%s%N)"
  printf '\n==> %s\n' "$label"
  if (cd "$directory" && "$@"); then
    status=0
  else
    status=$?
  fi
  ended="$(date +%s%N)"
  awk -v label="$label" -v start="$started" -v end="$ended" -v result="$status" \
    'BEGIN { printf "<== %s (%.2fs, exit %d)\n", label, (end-start)/1000000000, result }'
  if (( status != 0 )); then
    printf 'FALHOU: etapa "%s" (exit %d)\n' "$label" "$status" >&2
    exit "$status"
  fi
}

printf 'Perfil rápido — diretório: %s\n' "$ROOT_DIR"
if [[ "$PROFILE" == "all" || "$PROFILE" == "backend" ]]; then
  run_step "pytest backend focado (9 testes unitários/CLI)" "$BACKEND_DIR" \
    env DEBUG=false uv run --no-sync pytest -q \
    tests/test_genero_identidade.py::test_genero_from_legacy_mapping \
    tests/test_scripts_aposentados.py tests/test_snippets_codex.py
fi
if [[ "$PROFILE" == "all" || "$PROFILE" == "frontend" ]]; then
  run_step "lint frontend" "$FRONTEND_DIR" npm run lint
  run_step "contraste frontend" "$FRONTEND_DIR" npm run test:contrast
fi

printf '\nPerfil rápido concluído (%s). Build, pytest completo e Playwright não foram executados.\n' "$PROFILE"
