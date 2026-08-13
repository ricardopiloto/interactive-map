# Quickstart: Multi-Deploy & Hub Índice

**Feature**: `078-multideploy-hub`  
**Purpose**: Validate scaffold, hub fetch, runbook docs, and WFRP migrate script ([spec.md](./spec.md)).

## Prerequisites

- Docker + Compose; `ss` or `lsof`
- Optional: `caddy` binary for hash
- Writable temp root (do **not** use `/opt` on a laptop unless intended)

```bash
export CODEX_INSTANCES_ROOT=/tmp/codex-instances
mkdir -p "$CODEX_INSTANCES_ROOT"
```

## Scenarios

### 1. Scaffold aborts on busy port (US1)

1. Pick a port in use (e.g. `ss -ltn`).
2. `./scripts/nova-campanha.sh teste-busy <busy> 8099 wod`
3. **Expect**: exit ≠ 0; **no** `$CODEX_INSTANCES_ROOT/codex-teste-busy` created.

### 2. Scaffold creates instance (US1)

1. Two free ports, TTY session.
2. `./scripts/nova-campanha.sh wod-noturno 8020 8091 wod --root "$CODEX_INSTANCES_ROOT"`
3. Enter admin user/password when prompted.
4. **Expect**: folder `codex-wod-noturno` with `.env` (`SISTEMA=wod`) and `docker-compose.override.yml`; stdout contains Caddy + cloudflared + JSON snippet; Caddyfile on host **unchanged**.

### 3. Hub fetch without rebuild (US2)

1. Serve `hub/` (Caddy, `python -m http.server`, or `npx serve hub`).
2. Open hub; confirm cards from `campanhas.json`.
3. Add a second object to `hub/campanhas.json`; refresh.
4. **Expect**: new card; no rebuild. Remove `capa_url` on one entry → card still renders.

### 4. Hub empty / bad JSON (US2 edge)

1. Set `campanhas.json` to `[]` → empty message.
2. Set to `{` (invalid) → error message, page usable.

### 5. Runbook exists (US3)

1. Open `docs/runbook-instancias.md`.
2. **Expect**: `git pull` + `docker compose up --build -d` per folder; warning not to loop all instances in v2.

### 6. migrar-wfrp.sh dry copy (US4)

1. Point `--source` at a fixture dir with `docker-compose.yml`, dummy `data/mapa.db`, `uploads/map/`.
2. `./scripts/migrar-wfrp.sh 8010 8081 --root "$CODEX_INSTANCES_ROOT" --source /path/to/fixture`
3. **Expect**: `codex-wfrp` with copied db/uploads; `.env` `SISTEMA=wfrp4e`; snippets printed; fixture `campanhas.json` / Caddyfile not modified.

## Contracts

- [cli-nova-campanha.md](./contracts/cli-nova-campanha.md)
- [cli-migrar-wfrp.md](./contracts/cli-migrar-wfrp.md)
- [campanhas-json.md](./contracts/campanhas-json.md)
- [ui-hub.md](./contracts/ui-hub.md)
