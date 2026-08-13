# Research: Multi-Deploy & Hub Índice

**Feature**: `078-multideploy-hub`  
**Date**: 2026-08-13

## 1. Como criar a pasta da instância

**Decision**: `git clone --depth 1` do repositório actual (URL remota ou path local) para `<CODEX_INSTANCES_ROOT>/codex-<nome>/`. Fallback: `rsync`/`cp -a` do working tree **excluindo** `.venv`, `node_modules`, `data/`, `uploads/` se clone falhar (dev).

**Rationale**: RFC §2.3; cada pasta tem o seu `.git` para `git pull` independente (US3).

**Alternatives considered**: Symlink único do código — rejeitado (update acoplado; RFC exige pastas isoladas). Git worktree — rejeitado (mais frágil para Docker volumes).

## 2. Portas e Compose no mesmo host

**Decision**:

- `docker-compose.yml` base continua a **expor** 8000/80 internamente.
- Scaffold gera `docker-compose.override.yml` com `ports: "${PORTA_API}:8000"` / `"${PORTA_WEB}:80"` e `container_name` prefixado `codex-<nome>-api|web`.
- `COMPOSE_PROJECT_NAME=codex-<nome>` no `.env` para volumes `codex-<nome>_mapa-data` distintos.
- Caddy do **host** faz `reverse_proxy 127.0.0.1:<porta-web>` (e API se necessário via path no mesmo site).

**Rationale**: Compose actual usa `expose` + nomes fixos `mapa-api` — colide na 2.ª instância. Portas no host são o contrato do RFC (`porta-api`, `porta-web`).

**Alternatives considered**: Uma rede Docker partilhada + Caddy no compose por instância — rejeitado (Caddy do host já existe).

## 3. Verificação de portas

**Decision**: `ss -ltn` (fallback `lsof -iTCP -sTCP:LISTEN`) nas duas portas; abortar **antes** de criar pasta se ocupadas. Se pasta destino já existir, abortar.

**Rationale**: FR-002; evita conflito que já ocorreu em produção.

## 4. Senha e hash Caddy

**Decision**: `read -s` duas vezes (confirmação); escrever `ADMIN_PASSWORD` no `.env` da instância; se `caddy` no PATH, `caddy hash-password` → `ADMIN_PASSWORD_HASH`; senão imprimir comando para o sysadmin preencher.

**Rationale**: Clarification Q3; hash necessário para snippet Caddy (FR-003/004).

## 5. Hub estático

**Decision**: Directório `hub/` no monorepo: `index.html` + `app.js` faz `fetch('campanhas.json')` (cache-bust `?t=` opcional **não** — JSON sem cache agressivo via `Cache-Control: no-cache` no `Caddyfile.example`). Sem framework. Servido como site Caddy separado (ex. apex `1nodado.com.br`).

**Rationale**: Clarification Q1; RFC §3; SC-002 testável com refresh.

**Alternatives considered**: Embed JSON no HTML no build — rejeitado na clarify.

## 6. `migrar-wfrp.sh`

**Decision**:

1. Resolve origem (env `CODEX_WFRP_SOURCE` ou `/var/www/interactive-map` documentado no README).
2. Destino: `<root>/codex-wfrp/` — se existir, abortar.
3. Copia código (clone/rsync) + **dados**: `data/mapa.db` e `uploads/` se existirem na origem (bind mounts ou cópia de volumes via `docker cp` se só volume nomeado).
4. Gera `.env` WFRP (`SISTEMA=wfrp4e`, módulos default fadiga) reusando senhas da origem se `.env` origem existir; senão prompt.
5. Gera override de portas (args ou defaults documentados: reutilizar portas actuais se passadas).
6. Imprime snippets Caddy + entrada JSON de hub; **não** escreve Caddyfile nem `hub/campanhas.json`.

**Rationale**: Clarifications Q4–Q5; FR-010; volumes Compose nomeados exigem cópia explícita de SQLite/uploads.

**Alternatives considered**: `docker compose` rename in-place — rejeitado (nomes `mapa-*` e path `/var/www` vs `/opt/codex-wfrp`).

## 7. Runbook (US3)

**Decision**: `docs/runbook-instancias.md` — por pasta: `git pull && docker compose up --build -d`; aviso de **não** actualizar todas em loop nesta fase.

**Rationale**: FR-009; RFC §4 risco aceite.

## 8. Versioning

**Decision**: Bump **0.13.0** na implementação da frente B.

**Rationale**: Incremento shippable; 2.0.0 quando 077–080 fecharem.
