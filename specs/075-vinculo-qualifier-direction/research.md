# Research: Vínculo Qualifier & Direction

**Feature**: `075-vinculo-qualifier-direction`  
**Date**: 2026-08-12

## 1. Persistence shape

**Decision**:

| Field | Storage |
|-------|---------|
| `qualificador` | `VARCHAR(80)` NOT NULL DEFAULT `''` (empty = absent) |
| `direcao` | `VARCHAR(20)` NULL — `NULL` = mútuo; else `a_para_b` \| `b_para_a` relative to **canonical** `personagem_a_id < personagem_b_id` |

**Rationale**: Matches doc §9; pair-level; FR-009 migration trivial.

**Alternatives considered**: Separate table for qualifiers — overkill. Enum for qualifier — rejected (free text).

## 2. Canonical mapping for `direcao`

**Decision**: Persist always vs stored A/B ids. On create/update, when the GM form’s named order is swapped relative to canonical ids, flip `a_para_b` ↔ `b_para_a` (same pattern as `_to_canonical_fields` for tipos). UI labels direction as “{NomeX} → {NomeY}” / mútuo, never raw enum.

**Rationale**: Consistent with 071 id order; FR naming requirement.

## 3. Autocomplete suggestions

**Decision**: Static map in `qualificadorSuggestions.ts` (and optional mirror constant in backend only if validating — **no** server-side enum validation of free text). Reciprocal: list for `tipo_ab` + always include `Medo`. Duas vias: union of both tip lists + `Medo`, dedupe preserving stable order (tipo_ab list first, then tipo_ba extras, Medo once at end or already in list).

Suggestion table (from doc §6.1):

| Tipo | Suggestions |
|------|-------------|
| aliado | Mentor, Protegido, Patrono, Devedor, Segredo |
| amizade | Segredo, Companheiro de guerra |
| inimizade | Rival, Traidor, Antigo aliado |
| romance | (none besides Medo) |
| familia | Pai/Mãe, Irmão/Irmã, Tutor |
| conhecido | Rival, Desconfiança, Contato |
| *all* | Medo |

**Rationale**: Clarification Q2 → A; FR-002–004.

## 4. Graph / detail labels

**Decision** (clarification Q1 → B):

- **Reciprocal**: mid/focus label text = `formatTipo(displayTipo)` + optional ` (qual)` + optional ` →` (Unicode arrow) when `direcao` set. Arrow points along the edge from the “from” disc to “to” disc (orientation of glyph / placement so reading matches a→b).
- **Duas vias**: end labels = tip tipos only; **mid** label = `(qual)` and/or `→` if either present (if only direção, show arrow alone or `→`; if only qual, `(Qual)`).
- **Detail list**: primary tip label uses `Tipo (Qual)` + arrow if direção; “vê-te como…” unchanged (no second qualifier).

**Rationale**: Spec FR-006/006a/007.

## 5. Public API

**Decision**: Include `qualificador` and `direcao` on public reads for visible pairs (not secret). No redaction — unlike tip tipos under 073.

**Rationale**: Display metadata for all viewers of a visible edge.

## 6. Version

**Decision**: Minor **0.11.0**.
