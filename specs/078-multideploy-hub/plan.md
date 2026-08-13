# Implementation Plan: Multi-Deploy & Hub Índice

**Branch**: `078-multideploy-hub` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/078-multideploy-hub/spec.md`

**Release**: Codex v2.0.0 — Frente B (version bump **0.13.0** na implementação; tag **2.0.0** quando 077–080 fecharem)

## Summary

Isolar cada campanha num deploy próprio (mesmo código, pasta + `.env` + containers distintos) via **`scripts/nova-campanha.sh`**, publicar um **hub estático** (`hub/`) que faz fetch de `campanhas.json` em runtime, documentar **runbook de update** por instância, e entregar **`scripts/migrar-wfrp.sh`** para reconfigurar a campanha WFRP actual como `codex-wfrp` **sem** editar Caddyfile nem `campanhas.json` (imprime snippets).

## Technical Context

**Language/Version**: Bash (POSIX-friendly scripts) + HTML/CSS/JS vanilla (hub); Compose YAML  
**Primary Dependencies**: Docker Compose, `ss`/`ss -ltn` para portas, `caddy hash-password` no PATH do sysadmin  
**Storage**: Por instância — SQLite + uploads em volumes Compose únicos; hub = ficheiros estáticos  
**Testing**: Manual quickstart (dry-run local com `CODEX_INSTANCES_ROOT` temporário)  
**Target Platform**: Host Linux (produção `/opt`; dev override)  
**Project Type**: Ops + site estático no monorepo (não altera runtime da app Codex salvo compose/env)  
**Performance Goals**: Hub lista cartões em &lt;1 s após JSON carregado  
**Constraints**: Clarifications 2026-08-13 locked; scripts **não** escrevem Caddyfile/`campanhas.json`; senha só via prompt; ~5 instâncias  
**Scale/Scope**: 2 scripts + `hub/` + override compose + runbook + snippets Caddy/cloudflared  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (5/5): **PASS**
- Isolamento por pasta/deploy, não multi-tenant na app: **PASS**
- Hub sem auth / sem dados de lore: **PASS**
- Scripts preparam e imprimem; não aplicam proxy: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/078-multideploy-hub/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-nova-campanha.md
│   ├── cli-migrar-wfrp.md
│   ├── campanhas-json.md
│   └── ui-hub.md
└── tasks.md
```

### Source Code (repository root)

```text
scripts/nova-campanha.sh
scripts/migrar-wfrp.sh
scripts/lib/codex-instance.sh          # port check, env fill, print snippets, root resolve
deploy/docker-compose.override.tpl.yml # ports + unique project names
deploy/snippets/caddy.site.tpl
deploy/snippets/cloudflared.ingress.tpl
deploy/snippets/campanhas.entry.tpl.json

hub/index.html
hub/styles.css
hub/app.js                             # fetch campanhas.json
hub/campanhas.json
hub/capas/                             # optional cover assets
hub/Caddyfile.example

docs/runbook-instancias.md             # git pull + compose rebuild; CODEX_INSTANCES_ROOT
docker-compose.yml                     # unique names via COMPOSE_PROJECT_NAME / override
.env.example                           # CORS per-instance domain reminder
README.md / CHANGELOG.md               # 0.13.0
```

**Structure Decision**: Ops artefacts live in `scripts/` + `hub/` + `deploy/snippets/`; Codex app unchanged except compose uniqueness so N instâncias coexistem no mesmo host.

## Complexity Tracking

> None.
