# Research: Sistema & Módulos de Mecânica

**Feature**: `077-sistema-modulos`  
**Date**: 2026-08-13

## 1. Resolução de `MODULOS_ATIVOS`

**Decision**:

| `.env` state | Result |
|--------------|--------|
| `MODULOS_ATIVOS` **absent** (unset) | Defaults por `SISTEMA` |
| `MODULOS_ATIVOS=` (empty string) | Override explícito → `[]` |
| `MODULOS_ATIVOS=fadiga,sanidade` | Override explícito → parsed list |

**Defaults por sistema** (v2 launch):

| `SISTEMA` | Default `modulos_ativos` |
|-----------|--------------------------|
| `wfrp4e` | `["fadiga"]` |
| `wod` | `[]` |
| *(outros / desconhecidos)* | `[]` |

**Rationale**: Clarification Q1; protege WFRP se `MODULOS_ATIVOS` omitido; WoD com lista vazia explícita ou default vazio.

**Implementation**: `modulos_ativos_raw: str | None` in Settings with `@model_validator` or `@property modulos_ativos_resolved` — distinguish unset vs empty via `Field(default=None)` and env parse.

**Alternatives considered**: Always explicit env — rejected (risco esquecer fadiga em WFRP prod).

## 2. Filtragem de `extensoes_mecanica`

**Decision**:

- **Write** (admin personagens): strip keys ∉ `modulos_ativos_resolved`; persist only allowed keys; no HTTP error (clarification Q2).
- **Read** (public + admin): return only keys ∈ active modules.
- **Validation** for active keys: module-specific Pydantic sub-schemas (fadiga: `int` ge 0 le 6 or similar WFRP band).

**Rationale**: FR-006; dados universais do personagem inalterados; edge case API silencioso.

**Alternatives considered**: 400 on inactive keys — rejected in clarify.

## 3. `GET /api/config`

**Decision**:

```json
{
  "sistema": "wfrp4e",
  "modulos_ativos": ["fadiga"],
  "has_map_image": true
}
```

- **Auth**: none (public read-only).
- **`has_map_image`**: `True` if any `uploads/map/campaign-map.{webp,jpg,jpeg,png,gif}` exists (same dir as `save_image` category `map`).
- **Cache**: `Cache-Control: public, max-age=60` optional — instance config is static per deploy.

**Rationale**: Clarifications Q3–Q4; FR-005.

**Alternatives considered**: Client-side 404 on image — rejected (flash + duplicate logic).

## 4. Fadiga: personagem vs viagem

**Decision**:

| Concern | Scope in v2 |
|---------|-------------|
| `extensoes_mecanica.fadiga` on **Personagem** | Module `fadiga` — **new** field + FadigaWidget |
| `fadiga_saldo`, `dias_visuais[].fadiga_apos` on **RoutePlan** | **Universal** — unchanged (FR-002 rotas mph) |

**Rationale**: RFC §2 universal entities; spec FR-002; codebase today only has travel fadiga (062–063).

**Production migration**: If production DB has legacy `npc.fadiga` column, step-1 migration copies to JSON; repo has no such column today → migration guarded by `PRAGMA table_info`.

## 5. Frontend module registry

**Decision**:

```ts
IMPLEMENTED_MODULES = new Set(['fadiga'])
componentesPorModulo = { fadiga: FadigaWidget }
```

- Render widget when `modulo ∈ modulos_ativos ∩ IMPLEMENTED_MODULES`.
- If `modulo ∈ modulos_ativos \ IMPLEMENTED_MODULES` and GM mode → discrete banner (clarification Q5).
- Players: omit entirely.

**Rationale**: FR-004; evita UI quebrada para módulos futuros listados por engano.

## 6. Landing route

**Decision**:

- `App.tsx`: on boot, fetch `/api/config`; if `!has_map_image`, `<Route path="/" element={<Navigate to="/relacoes" replace />} />` (or wrapper `LandingRedirect`).
- If `has_map_image`, keep `/` → `MapPage`.
- Deep links `/relacoes` always work.

**Rationale**: FR-008; SC-004.

**Alternatives considered**: MapPage internal redirect — rejected (flash empty map).

## 7. Migração dois passos

**Decision**:

**Deploy 1** (077a):

1. Add `extensoes_mecanica` column default `'{}'`.
2. If legacy `fadiga` column exists: copy values to `{"fadiga": N}`.
3. Ship code reading/writing JSON; **keep** legacy column if present.

**Deploy 2** (077b, after manual validation on prod):

4. Drop legacy `fadiga` column (SQLite table rebuild if needed).

**Rationale**: FR-007; RFC §4; brief restrição produção.

## 8. Versioning

**Decision**: Bump **0.12.0** on frente A merge; aggregate **2.0.0** when 077–080 complete.

**Rationale**: v2 README bundles release; shippable increment for A alone.
