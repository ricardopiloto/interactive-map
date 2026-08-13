# Research: Known Direction Vínculos

**Feature**: `073-known-direction-vinculos`  
**Date**: 2026-08-12

## 1. Persistence of “conhecido”

**Decision**: Add `conhecido_ab: bool` and `conhecido_ba: bool`, both **NOT NULL DEFAULT true**. Meaningful only when `tipo_ba` is set (duas vias). Reciprocal (`tipo_ba is null`): flags ignored for player visibility; only `publico` applies.

**Rationale**: Matches FR-001 / FR-007 / FR-010; migration of existing rows → both true (FR-009).

**Alternatives considered**:
- Single enum `visibilidade_jogador = ambas|ab|ba|nenhuma` — harder to map in named GM form fields.
- Drop `publico` for duas vias — rejected by clarification A.

## 2. Público as master switch

**Decision**: Player sees a pair iff `publico` **and** (reciprocal **or** `conhecido_ab` **or** `conhecido_ba`). Private pairs never appear on public list even if flags are true.

**Rationale**: Clarification session Q1 → A.

## 3. Public API must redact secrets

**Decision**: `GET /api/vinculos` continues to return only `publico` rows that pass the filter above. Before serialize, **null out** tip fields the player must not see:

| Condition | Public payload |
|-----------|----------------|
| Reciprocal | Unchanged (`tipo_ba=null`) |
| Duas vias, both known | Full tipos/notas (071) |
| Duas vias, only AB known | Keep `tipo_ab`/`nota_ab`; set `tipo_ba=null`, `nota_ba=""` |
| Duas vias, only BA known | Keep `tipo_ba`/`nota_ba`; set `tipo_ab=null`, `nota_ab=""` (schema: `tipo_ab` Optional on Read) |
| Neither known | Row omitted |

Do **not** send `conhecido_*` on the public response (optional omit) — absence/null of a tip is enough. Admin Read includes `conhecido_ab` / `conhecido_ba` always.

**Rationale**: Today public returns full `tipo_ab`/`tipo_ba`; without redaction, Network tab leaks GM-only romance. Security gate for FR-004/005.

**Alternatives considered**: FE-only hide — unsafe. Collapse-to-reciprocal by rewriting both tips to the known tipo — breaks detail when only reverse is known (clarification Q2 → B).

## 4. Frontend view rules (player payload)

**Decision**: Extend `vinculoDirection.ts`:

- `isDuasVias`: both tip tipos non-null and unequal.
- `playerEdgeMode`: `hidden` | `reciprocal_like` | `duas_vias` (from which tips present after redact / or from flags when GM).
- Graph: `reciprocal_like` → single colour + mid label rules like reciprocal (068); `duas_vias` → gradient + end labels (071).
- Detail: primary tipo/note only if forward tip present; “vê-te como…” only if reverse tip present and (GM or duas / partial). Never fabricate forward tipo.

GM uses admin payload (always both tips + flags) → always full 071 rendering for duas vias.

**Rationale**: Clarifications Q2–Q3; FR-002 vs FR-004/005.

## 5. GM form

**Decision**: In `VinculoFormDialog` duas vias mode, checkbox (or toggle) per sense: “Conhecido pelos jogadores” next to each “X vê Y” block. Defaults **checked**. Hidden/disabled in recíproco mode. `publico` checkbox unchanged.

**Rationale**: FR-006, FR-010.

## 6. Seed / demo

**Decision**: Prefer a dedicated public pair for quickstart (e.g. Brother Tomas ↔ Lila Natch if present in seed, else create/adjust): `romance` one way unknown, `amizade` the other known, `publico=true`. Keep Elara↔Marcus as full duas vias both known (SC-004 regression).

**Rationale**: SC-001 / SC-003 without manual setup.

## 7. Version

**Decision**: Minor bump **0.10.0** (player-visible behaviour change + API fields).
