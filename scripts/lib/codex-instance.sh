# shellcheck shell=bash
# Shared helpers for nova-campanha.sh / migrar-wfrp.sh (spec 078).
# MUST NOT write host Caddyfile, cloudflared config, or hub/campanhas.json.

CODEX_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODEX_REPO_ROOT="$(cd "$CODEX_LIB_DIR/../.." && pwd)"

codex_die() {
  echo "erro: $*" >&2
  exit 1
}

codex_instances_root() {
  if [[ -n "${CODEX_ROOT_OVERRIDE:-}" ]]; then
    echo "$CODEX_ROOT_OVERRIDE"
    return
  fi
  echo "${CODEX_INSTANCES_ROOT:-/opt}"
}

codex_validate_slug() {
  local slug="$1"
  [[ "$slug" =~ ^[a-z0-9-]+$ ]] || codex_die "nome inválido '$slug' (use [a-z0-9-]+)"
}

codex_require_tty() {
  if [[ ! -t 0 ]]; then
    codex_die "é necessário um TTY para o prompt de senha (não passe senha por argumento)"
  fi
}

codex_port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -qE ":${port}[[:space:]]"
    return $?
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  codex_die "instale ss (iproute2) ou lsof para verificar portas"
}

codex_assert_ports_free() {
  local api="$1" web="$2"
  [[ "$api" =~ ^[0-9]+$ && "$web" =~ ^[0-9]+$ ]] || codex_die "portas devem ser números"
  if codex_port_in_use "$api"; then
    codex_die "porta API $api já está em uso"
  fi
  if codex_port_in_use "$web"; then
    codex_die "porta web $web já está em uso"
  fi
}

codex_assert_dest_free() {
  local dest="$1"
  if [[ -e "$dest" ]]; then
    codex_die "destino já existe: $dest"
  fi
}

codex_prompt_admin() {
  local user pass pass2
  read -r -p "ADMIN_USER [gm]: " user
  user="${user:-gm}"
  read -r -s -p "ADMIN_PASSWORD: " pass
  echo
  read -r -s -p "Confirmar senha: " pass2
  echo
  [[ -n "$pass" ]] || codex_die "senha vazia"
  [[ "$pass" == "$pass2" ]] || codex_die "senhas não coincidem"
  CODEX_ADMIN_USER="$user"
  CODEX_ADMIN_PASSWORD="$pass"
}

codex_hash_password() {
  local pass="$1"
  if command -v caddy >/dev/null 2>&1; then
    printf '%s\n' "$pass" | caddy hash-password
    return
  fi
  echo ""
}

codex_sistema_label() {
  case "$1" in
    wfrp4e) echo "WFRP4e" ;;
    wod) echo "World of Darkness" ;;
    *) echo "$1" ;;
  esac
}

codex_hostname_from_url() {
  local url="$1"
  url="${url#https://}"
  url="${url#http://}"
  echo "${url%%/*}"
}

codex_subst() {
  local content="$1"
  shift
  local key val
  while [[ $# -ge 2 ]]; do
    key="$1"
    val="$2"
    content="${content//$key/$val}"
    shift 2
  done
  printf '%s' "$content"
}

codex_write_override() {
  local dest_dir="$1" project="$2" porta_api="$3" porta_web="$4"
  local tpl="$CODEX_REPO_ROOT/deploy/docker-compose.override.tpl.yml"
  local out
  out="$(cat "$tpl")"
  out="$(codex_subst "$out" \
    __COMPOSE_PROJECT_NAME__ "$project" \
    __PORTA_API__ "$porta_api" \
    __PORTA_WEB__ "$porta_web")"
  printf '%s\n' "$out" >"$dest_dir/docker-compose.override.yml"
}

codex_write_env() {
  local dest_dir="$1"
  local sistema="$2"
  local project="$3"
  local porta_api="$4"
  local porta_web="$5"
  local cors="$6"
  local admin_user="$7"
  local admin_pass="$8"
  local admin_hash="$9"

  local example="$dest_dir/.env.example"
  if [[ ! -f "$example" ]]; then
    example="$CODEX_REPO_ROOT/.env.example"
  fi
  local body
  body="$(cat "$example")"

  # Drop commented SISTEMA/MODULOS sample lines; we write canonical keys below.
  {
    printf '%s\n' "$body"
    echo ""
    echo "# --- gerado por scripts (spec 078) ---"
    echo "SISTEMA=${sistema}"
    echo "COMPOSE_PROJECT_NAME=${project}"
    echo "PORTA_API=${porta_api}"
    echo "PORTA_WEB=${porta_web}"
    echo "CORS_ORIGINS=${cors}"
    echo "ADMIN_USER=${admin_user}"
    echo "ADMIN_PASSWORD=${admin_pass}"
    if [[ -n "$admin_hash" ]]; then
      echo "ADMIN_PASSWORD_HASH=${admin_hash}"
    else
      echo "# ADMIN_PASSWORD_HASH=  # gere com: caddy hash-password"
    fi
  } >"$dest_dir/.env"
}

codex_print_snippets() {
  local slug="$1"
  local sistema="$2"
  local porta_api="$3"
  local porta_web="$4"
  local url="$5"
  local admin_user="$6"
  local admin_hash="$7"
  local nome="${8:-$slug}"
  local mestre="${9:-Ricardo}"

  local hostname label hash_display
  hostname="$(codex_hostname_from_url "$url")"
  [[ -n "$hostname" ]] || hostname="codex-${slug}.example.com"
  label="$(codex_sistema_label "$sistema")"
  hash_display="${admin_hash:-COLOQUE_O_HASH_CADDY}"

  echo ""
  echo "======== Caddy (colar no Caddyfile do host; scripts NÃO aplicam) ========"
  codex_subst "$(cat "$CODEX_REPO_ROOT/deploy/snippets/caddy.site.tpl")" \
    __HOSTNAME__ "$hostname" \
    __PORTA_WEB__ "$porta_web" \
    __PORTA_API__ "$porta_api" \
    __ADMIN_USER__ "$admin_user" \
    __ADMIN_PASSWORD_HASH__ "$hash_display"
  echo ""
  echo "======== cloudflared ingress (colar em config.yml) ========"
  codex_subst "$(cat "$CODEX_REPO_ROOT/deploy/snippets/cloudflared.ingress.tpl")" \
    __HOSTNAME__ "$hostname" \
    __PORTA_WEB__ "$porta_web"
  echo ""
  echo "  cloudflared tunnel route dns <TUNNEL_ID> ${hostname}"
  echo ""
  echo "======== entrada hub/campanhas.json (colar manualmente) ========"
  codex_subst "$(cat "$CODEX_REPO_ROOT/deploy/snippets/campanhas.entry.tpl.json")" \
    __NOME__ "$nome" \
    __SISTEMA_LABEL__ "$label" \
    __MESTRE__ "$mestre" \
    __URL__ "$url" \
    __SLUG__ "$slug"
  echo ""
  echo "================================================================"
}

codex_clone_or_copy() {
  local dest="$1"
  local repo="${2:-}"
  mkdir -p "$(dirname "$dest")"
  if [[ -z "$repo" ]]; then
    if git -C "$CODEX_REPO_ROOT" remote get-url origin >/dev/null 2>&1; then
      repo="$(git -C "$CODEX_REPO_ROOT" remote get-url origin)"
    else
      repo="$CODEX_REPO_ROOT"
    fi
  fi
  if [[ "$repo" == /* || "$repo" == ./* || "$repo" == ../* || -d "$repo/.git" ]]; then
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --exclude '.venv' --exclude 'node_modules' --exclude 'data/' \
        --exclude 'uploads/' --exclude '.git' "$repo/" "$dest/"
      if [[ -d "$repo/.git" ]]; then
        git -C "$dest" init -q
        git -C "$dest" remote add origin "$(git -C "$repo" remote get-url origin 2>/dev/null || echo "$repo")" || true
      fi
      return
    fi
  fi
  if git clone --depth 1 "$repo" "$dest"; then
    return
  fi
  mkdir -p "$dest"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude '.venv' --exclude 'node_modules' --exclude 'data/' \
      --exclude 'uploads/' "$CODEX_REPO_ROOT/" "$dest/"
  else
    cp -a "$CODEX_REPO_ROOT/." "$dest/"
    rm -rf "$dest/.venv" "$dest/frontend/node_modules" "$dest/backend/.venv" || true
  fi
}
