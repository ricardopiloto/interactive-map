# Research: Revelação progressiva (Local e Arco)

**Feature**: `113-revelacao-progressiva`  
**Date**: 2026-09-22

## 1. Shared visibility helper

**Decision**: Introduce `backend/app/services/visibility.py` with `is_visivel_para_jogador(entity: Any | None) -> bool` using `getattr(entity, "visivel_para_todos", True)`. Keep `personagem_visibility.py` as a thin re-export (or one-line wrapper) so existing imports keep working; migrate call sites gradually to `visibility` where touched.

**Rationale**: Spec FR-009 — one boolean rule for NPC, Local, Arco, Sessao; avoids three divergent helpers.

**Alternatives considered**: Protocol/Typed overload per model — overkill. Duplicate functions per entity — rejected by spec.

## 2. Schema migration

**Decision**: Campaign Alembic `003_visibilidade_local_arco` (`down_revision=002_sessao`): `batch_alter_table` add `visivel_para_todos` Boolean NOT NULL `server_default=true` on `local` and `arco`, then optionally drop server_default to match ORM (or keep default — either is fine if ORM always sends the value). Existing rows → all public (SC-004).

**Rationale**: Constitution VI; matches NPC/Sessao semantics.

**Alternatives considered**: Fresh create_all only — breaks live DBs at 002. Backfill script outside Alembic — unnecessary.

## 3. Public Local payload rules

**Decision**:
- List/search/get: omit or 404 if `not is_visivel_para_jogador(local)`.
- `saida_ids`: only destinations that are player-visible.
- `arco_id`: if linked arco exists and is hidden → serialize `arco_id=null` (UI «Sem arco»); never return hidden arco id/title on public local.
- `npc_ids` on public local: already filters hidden NPCs; keep that.

**Rationale**: Spec US1 FR-003/004.

**Alternatives considered**: Return arco with redacted title — still leaks existence/id; rejected. Cascade-hide locals when arco hidden — rejected by assumptions.

## 4. Public Arco / NPC cross-links

**Decision**: Public arco list/get filters hidden arcos. Public NPC/Personagem `local_ids` include only visible locais. Public sessão chips omit hidden locais (same as hidden NPCs today).

**Rationale**: US2 + sessao edge case; mirrors `vinculos.py` both-sides check.

## 5. Media ACL for `locals/`

**Decision**: Today `category in ("map", "locals", "covers")` allows all. Change `locals/` so anonymous access is allowed only if some **visible** Local references that file (same pattern as portraits). Members (GM) keep full access. Map/covers unchanged in this feature (capa/mapa are campaign-level).

**Rationale**: Spec edge case — hidden local image must not be fetchable as known content.

**Alternatives considered**: Always allow locals images — leaks spoilers via URL. Per-file ACL table — too heavy.

## 6. Waypoints / routes

**Decision**: Public surfaces that expose `local_id` on a waypoint: treat waypoint as unlinked / omit from player-facing lists that imply the local when the local is hidden. No new waypoint column.

**Rationale**: Spec assumption; avoid scope creep.

## 7. Admin / Edit Mode UI

**Decision**: Expose `visivel_para_todos` on Local/Arco create/update schemas and FE forms (checkbox like Personagem). Reuse existing «oculto» badge/class patterns from Relacoes (`graph-node--oculto` / list `oculto` chip) on map list rows and arco list — same wording keys where possible.

**Rationale**: FR-006/007; SC-003.

## 8. Export / import

**Decision**: Models already dump via `model_dump`; new field round-trips automatically. Import of old packages without the key → SQLModel/default `True`. No package_format bump required.

**Rationale**: Assumption in spec; same as other additive bools.
