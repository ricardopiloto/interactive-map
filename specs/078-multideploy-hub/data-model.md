# Data Model: Multi-Deploy & Hub Índice

**Feature**: `078-multideploy-hub`  
**Date**: 2026-08-13

## Instance directory (filesystem, not DB)

Path: `<CODEX_INSTANCES_ROOT>/codex-<slug>/`  
Default root: `/opt`

| Artefact | Notes |
|----------|--------|
| `.git/` | Clone independente para `git pull` |
| `.env` | `SISTEMA`, `MODULOS_ATIVOS`, `ADMIN_*`, `CORS_ORIGINS`, `COMPOSE_PROJECT_NAME`, `PORTA_API`, `PORTA_WEB` |
| `docker-compose.yml` | Copiado do repo |
| `docker-compose.override.yml` | Portas host + `container_name` únicos |
| Volumes Compose | `<project>_mapa-data`, `<project>_mapa-uploads` |

**Slug**: `[a-z0-9-]+` (nome-campanha do CLI). Pasta = `codex-<slug>`.

## `.env` fields (instance)

| Key | Source |
|-----|--------|
| `SISTEMA` | CLI arg |
| `MODULOS_ATIVOS` | omit unless CLI `--modulos`; defaults 077 apply |
| `ADMIN_USER` / `ADMIN_PASSWORD` | prompt |
| `ADMIN_PASSWORD_HASH` | `caddy hash-password` |
| `CORS_ORIGINS` | derived from printed hostname or `--url` |
| `COMPOSE_PROJECT_NAME` | `codex-<slug>` |
| `PORTA_API` / `PORTA_WEB` | CLI args |
| `DEBUG` | `false` |

## Hub entry (`campanhas.json` item)

Array of objects. **Not** written by scripts (manual / printed snippet).

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `nome` | string | yes | Display title |
| `sistema` | string | yes | Human label (ex. `WFRP4e`) |
| `mestre` | string | yes | Display name |
| `url` | string (https URL) | yes | Instance origin |
| `capa_url` | string | no | Path or URL; omit → card without image |

**Validation (hub client)**: skip entries missing `nome` or `url`; still render the rest (partial list OK).

## Snippet payloads (stdout only)

- Caddy site block: hostname, `reverse_proxy 127.0.0.1:<PORTA_WEB>`, basicauth hash from env
- cloudflared ingress: hostname → `http://127.0.0.1:<PORTA_WEB>`
- Hub JSON object: one `campanhas.json` entry (pretty-printed) for the operator to paste

## Explicitly out of model

- No shared campaign DB
- No hub admin API
- No DNS records created by scripts
