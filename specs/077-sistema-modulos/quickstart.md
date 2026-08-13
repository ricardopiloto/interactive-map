# Quickstart: Sistema & Módulos de Mecânica

**Feature**: `077-sistema-modulos`  
**Purpose**: Validate instance config, personagem extensions, landing, and WFRP migration path ([spec.md](./spec.md)).

## Prerequisites

- Backend + frontend running
- `.env` configurable (see scenarios)
- Restart API after env / migration changes

## Scenarios

### 1. Public config — WFRP defaults (US1, FR-005)

1. Set `SISTEMA=wfrp4e`; omit `MODULOS_ATIVOS`.
2. `curl -s http://localhost:8000/api/config | jq`
3. **Expect**: `sistema: "wfrp4e"`, `modulos_ativos: ["fadiga"]`, `has_map_image` matches file on disk.

### 2. WoD — no character fadiga (US1, SC-001)

1. Set `SISTEMA=wod`, `MODULOS_ATIVOS=` (empty); restart API.
2. Open `/relacoes` → GM → edit personagem.
3. **Expect**: no Fadiga field; `GET /api/personagens` responses have no `fadiga` key in `extensoes_mecanica`.

### 3. Explicit override disables WFRP fadiga (Clarify Q1)

1. Set `SISTEMA=wfrp4e`, `MODULOS_ATIVOS=`; restart.
2. **Expect**: `modulos_ativos: []` in config; no fadiga UI.

### 4. Fadiga persist (US2)

1. WFRP with fadiga active; GM sets personagem fadiga = 2; save.
2. Reload page / restart API.
3. **Expect**: fadiga still 2 in form and API read.

### 5. Inactive key stripped on write (US2 edge)

1. WoD instance (`modulos_ativos: []`).
2. `PUT /api/admin/personagens/{id}` with body including `"extensoes_mecanica": {"fadiga": 3}`.
3. **Expect**: 200; subsequent read has no `fadiga` key (silent strip).

### 6. Landing without map (US3)

1. Remove or rename `uploads/map/campaign-map.*` (or fresh deploy without upload).
2. **Expect**: `has_map_image: false`; opening `/` redirects to `/relacoes`.
3. Upload map via GM → **Expect**: after refresh, `has_map_image: true`, `/` shows map.

### 7. Unimplemented module banner (GM only)

1. Set `MODULOS_ATIVOS=sanidade` (no widget yet); restart.
2. Player: open personagem — **Expect**: no sanidade UI, no banner.
3. GM: open personagem — **Expect**: discrete banner about unavailable module.

### 8. Migration smoke (FR-007)

1. On DB **with** legacy `npc.fadiga` column populated: run deploy 1 migration.
2. **Expect**: `extensoes_mecanica` contains copied values; legacy column still present.
3. After manual validation: deploy 2 drops legacy column.

## Contracts

- [api-config.md](./contracts/api-config.md)
- [api-personagem-extensoes.md](./contracts/api-personagem-extensoes.md)
- [ui-modulos-personagem.md](./contracts/ui-modulos-personagem.md)

## Typecheck

```bash
cd frontend && npm run build --if-present || npx tsc --noEmit
```
