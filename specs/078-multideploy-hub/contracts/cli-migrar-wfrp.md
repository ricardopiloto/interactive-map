# Contract: CLI — `migrar-wfrp.sh`

**Feature**: `078-multideploy-hub`

## Invocation

```bash
./scripts/migrar-wfrp.sh <porta-api> <porta-web> [options]
```

Destination slug is **fixed**: `codex-wfrp`.

### Options / env

| Name | Meaning |
|------|---------|
| `CODEX_INSTANCES_ROOT` | Default `/opt` |
| `--root <path>` | Override |
| `--source <path>` | Current WFRP install (default `/var/www/interactive-map`) |
| `--url <https://…>` | Snippets / CORS (default `https://codex-wfrp.1nodado.com.br` or current public URL if documented) |

## Preconditions (abort)

1. Source path exists and looks like a Codex checkout (has `docker-compose.yml` or `backend/`)
2. Ports free **or** already owned by the source instance being migrated (document: if reusing same ports, stop source containers first — operator step printed)
3. `<root>/codex-wfrp` does not exist

## Effects

1. Create `codex-wfrp` from clone + copy `data/` and `uploads/` from source when present
2. `.env` with `SISTEMA=wfrp4e`; copy admin credentials from source `.env` if present, else prompt
3. `docker-compose.override.yml` for given ports
4. Print Caddy, cloudflared, and hub JSON snippets
5. Print reminder: start containers manually; paste hub card; paste Caddy

## Non-effects

- MUST NOT modify source tree except if operator later decommissions it
- MUST NOT edit Caddyfile, cloudflared config, or `hub/campanhas.json`

## Exit codes

Same as `nova-campanha.sh` (0 success, 1 abort).
