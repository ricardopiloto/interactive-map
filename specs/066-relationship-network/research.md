# Research: Relationship Network

**Feature**: `066-relationship-network`  
**Date**: 2026-08-11

## 1. Personagem vs NPC table

**Decision**: Evolve the existing `npc` SQLModel table in place: add `tipo` (`pj` | `npc`, default `npc`) and `papel` (optional string). Keep physical table name `npc` and `local_npc` link for SQLite simplicity; expose domain name **Personagem** in schemas, routes, and frontend types. Existing rows migrate as `tipo=npc`.

**Rationale**: Clarification locked unify; no Alembic — `ALTER TABLE` + `create_all` match `database.py`. Renaming the SQLite table would require copy/rebuild; API/UX can say Personagem while PK and `local_npc` stay stable. Map pin association via Local `npc_ids` continues to work against the same ids.

**Alternatives considered**:
- Separate `personagem` table + sync with `npc` — rejected (duplicate retrato/status; contradicts clarification).
- Rename table to `personagem` immediately — deferred; optional later cleanup, not needed for v1.

## 2. API naming (`/npcs` vs `/personagens`)

**Decision**: Add canonical `/api/personagens` and `/api/admin/personagens`. Keep thin compatibility aliases on `/api/npcs` and `/api/admin/npcs` that delegate to the same handlers (or redirect) until the map frontend is fully switched; prefer migrating FE types in the same feature.

**Rationale**: Spec and `docs/relationship-map.md` use Personagem; map currently hardcodes NPC. Dual path during one feature avoids breaking mid-migration; aliases removed only if fully unused by end of implement.

**Alternatives considered**: Big-bang rename only — higher risk of missed SideMenu/PinModal call sites.

## 3. Vínculo storage and symmetry

**Decision**: New table `vinculo` with `personagem_a_id`, `personagem_b_id`, `tipo`, `nota`, `publico` (bool, default `false`). Store undirected edges with **canonical order** `min(a,b)` as `personagem_a_id` and `max(a,b)` as `personagem_b_id` plus unique constraint on `(personagem_a_id, personagem_b_id)` so A↔B cannot duplicate. Reject self-links. On Personagem DELETE, cascade-delete all vínculos referencing that id (ORM cascade or explicit query).

**Rationale**: Spec: symmetric only; default privado; delete cascade. Canonical ordering simplifies uniqueness without undirected graph libraries.

**Alternatives considered**: Two directed rows — out of scope. Soft-delete — YAGNI.

## 4. Player vs GM vínculo visibility

**Decision**:
- `GET /api/vinculos` → only `publico == true`
- `GET /api/admin/vinculos` → all (Basic Auth)
- `GET /api/personagens` → all characters (no hide-by-role)
- RelacoesPage: if `isGm`, load admin vinculos; else public vinculos

**Rationale**: Matches clarification B + existing public/admin split; no per-request role bit on public routes.

**Alternatives considered**: Single endpoint with optional auth — more branching and cache confusion.

## 5. Graph rendering approach

**Decision**: Custom layout in React (absolute/SVG): compute ring angles from node count and measured node box (~172×112); animate positions with CSS transitions (~0.6s); draw edges as SVG lines behind nodes; show edges only after position transition ends. Optional `react-zoom-pan-pinch` for stage zoom/pan (already in repo) or simple transform state. No D3/Cytoscape.

**Rationale**: Spec is ring-centric, not force-directed; dependency-light; matches Nocturne control.

**Alternatives considered**: Force-graph libs — overkill and fight ring layout.

## 6. Navigation / shared chrome

**Decision**: React Router routes: `/` → MapPage, `/relacoes` → RelacoesPage. Extract shared **CodexHeader** (marca, Mapa | Relações, GM +Personagem/+Conexão on Relações only, GM toggle). Map page keeps SideMenu tabs; Relações is a full page without campaign map background.

**Rationale**: Spec US3 + doc §2; App already uses react-router-dom with a single map route.

## 7. Seed content

**Decision**: Extend `seed.py` after existing NPC flush: ensure ~4 PJ + ~7 NPC personagens (merge with existing map NPCs where names overlap, or add PJs + complementary NPCs); create ~15 vínculos with short notes; mark a **subset** `publico=true` so player/GM visibility is testable (SC-001a).

**Rationale**: FR-013 + visibility success criteria.

## 8. Labels / spacing props

**Decision**: Frontend component props `rotulosVinculo` default `foco`, `espacamento` default mid-range (~240) within 180–380 — no server persistence.

**Rationale**: Spec assumptions; config stays client-side.
