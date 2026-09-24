# Research: Crônica de sessões

**Feature**: `112-cronica-sessoes`  
**Date**: 2026-09-22

## 1. Storage location

**Decision**: Tables in per-campaign SQLite (`campanha.db`) via Alembic campaign revision `002_sessao`.

**Rationale**: Spec + constitution — content isolation is free with existing engine resolution; control.db stays metadata-only.

**Alternatives considered**: Store in control.db with campanha_id — rejected (crosses isolation boundary; worse for export).

## 2. Campaign migration style

**Decision**: Explicit `op.create_table` for `sessao`, `sessao_local`, `sessao_npc` in `002_sessao` (not a second `metadata.create_all`). Register models in `app.models` so fresh installs remain consistent. Unique index on `sessao.numero`.

**Rationale**: Existing `001_campaign` stamps full metadata once; incremental DDL is the safe upgrade path (`ensure_campaign_schema` → `upgrade head`).

**Alternatives considered**: Recreate_all — destructive. Only create_all on import — misses upgrades of live DBs.

## 3. Visibility

**Decision**: Mirror NPC: `visivel_para_todos: bool = True`. Public list/get filter with the same predicate; admin list returns all. Anonymous/public never sees `false`. Do **not** change existing local/NPC list endpoints. Public session payloads omit linked NPCs where `not is_visivel_para_jogador(npc)`.

**Rationale**: Clarify default A; matches `personagem_visibility.py`.

**Alternatives considered**: Embed sessions on local/NPC — rejected (scope). Soft-delete instead of visibility — rejected (spec uses visibility flag).

## 4. Numbering

**Decision**: `numero` INTEGER NOT NULL, UNIQUE per campaign DB. Suggest `max(numero)+1` or `1` if empty. Reject duplicates with `NUMERO_DUPLICADO`.

**Rationale**: Clarify default A; SC-003 sort by numero DESC.

**Alternatives considered**: Allow duplicates — rejected. Auto-renumber on conflict — rejected (surprise).

## 5. Navigation & deep links

**Decision**: Add «Sessões» to `CodexHeader` and `CampaignBottomNav`. Chip targets: `/c/{slug}?local={id}` and `/c/{slug}/relacoes?personagem={id}`; teach MapPage/RelacoesPage to read those query params on mount.

**Rationale**: Clarify default A; today selection is only in-memory.

**Alternatives considered**: User-menu only — weaker discovery. Hash routes — inconsistent with app.

## 6. UI patterns

**Decision**: `SessoesPage` under campaign shell; read-only list for all; create/edit via Drawer + MarkdownField; delete via ConfirmDialog; gated by existing EditMode. Reuse MarkdownSafe for display.

**Rationale**: Spec 107 patterns; RelacoesPage is the closest analogue.

## 7. Authz for admin

**Decision**: Admin sessao routes under `/api/c/{slug}/admin/sessoes` with `require_membro` (same as other admin content). UI still requires Edit Mode. Export package: include sessao tables in content JSON when export serializer walks models (verify round-trip in implement — add to export/import content maps if not automatic).

**Rationale**: Consistency with NPC/local admin. Export is campaign-scoped content — sessions belong in the portable package; research flags verification during implement.

**Alternatives considered**: Dono-only write — stricter than other lore; rejected unless product insists.
