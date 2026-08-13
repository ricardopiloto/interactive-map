# Contract: CLI — `nova-campanha.sh`

**Feature**: `078-multideploy-hub`

## Invocation

```bash
./scripts/nova-campanha.sh <nome-campanha> <porta-api> <porta-web> <sistema> [options]
```

Example: `./scripts/nova-campanha.sh wod-noturno 8020 8091 wod`

### Options / env

| Name | Meaning |
|------|---------|
| `CODEX_INSTANCES_ROOT` | Default `/opt` |
| `--root <path>` | Override root (same as env) |
| `--url <https://…>` | Used in CORS + printed Caddy/hub snippets |
| `--repo <url-or-path>` | Clone source (default: origin of current repo) |

## Preconditions (abort, no files created)

1. `nome-campanha` matches `^[a-z0-9-]+$`
2. Both ports are integers and **free** on the host
3. Destination `<root>/codex-<nome>/` does **not** exist
4. TTY available for password prompt (else abort with message)

## Effects

1. Create destination directory (clone)
2. Write `.env` and `docker-compose.override.yml`
3. Print Caddy block, cloudflared ingress + `tunnel route dns` hint, hub JSON entry
4. Print next manual step: `cd … && docker compose up --build -d`

## Non-effects

- MUST NOT edit host Caddyfile, cloudflared `config.yml`, or `hub/campanhas.json`
- MUST NOT run `docker compose up`

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Prepared |
| 1 | Usage / validation / ports / exists / no TTY |
