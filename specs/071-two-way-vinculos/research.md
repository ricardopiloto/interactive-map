# Research: Two-Way Vínculos

**Feature**: `071-two-way-vinculos`  
**Date**: 2026-08-12

## 1. One row vs two directed rows

**Decision**: Keep **one** `vinculo` row per unordered pair (`a_id < b_id`). Store both perspectives on that row.

**Rationale**: FR-002 (max one pair); existing unique constraint and cascade delete stay valid; público-por-par is natural; filters/isolate already walk one edge list.

**Alternatives considered**:
- Two directed rows — breaks uniqueness UX, doubles público flags, rejected by clarification B path.
- Separate `vinculo_sentido` child table — overkill for two optional fields.

## 2. Field shape

**Decision**:

| Field | Meaning |
|-------|---------|
| `tipo_ab` | How `personagem_a` sees `personagem_b` (required) |
| `tipo_ba` | How `personagem_b` sees `personagem_a`; **null = reciprocal** (treat as `tipo_ab`) |
| `nota_ab` | Note for a→b (used as the single note when reciprocal) |
| `nota_ba` | Note for b→a; empty when reciprocal |
| `publico` | Unchanged — one flag for the pair |

`duas_vias` is **derived**: `tipo_ba is not None and tipo_ba != tipo_ab`. If GM sends `tipo_ba == tipo_ab`, normalize to reciprocal (`tipo_ba = null`, merge notes into `nota_ab`).

**Migration**: Rename/copy existing `tipo` → `tipo_ab`, `nota` → `nota_ab`; add `tipo_ba` NULL, `nota_ba` DEFAULT `''`. SQLite via `_migrate_sqlite` ALTER + backfill (no Alembic).

**Rationale**: FR-001, FR-009, FR-010; minimal break for clients that only read `tipo` — API still exposes `tipo` as alias of `tipo_ab` for one release **or** bump clients in the same change (preferred: update frontend in lockstep; drop bare `tipo` from Read after migration).

**API Read** (lockstep with frontend):

```json
{
  "id": 1,
  "personagem_a_id": 1,
  "personagem_b_id": 5,
  "tipo_ab": "aliado",
  "tipo_ba": "romance",
  "nota_ab": "Companheiros de estrada",
  "nota_ba": "Ele sonha com mais",
  "publico": true
}
```

Reciprocal: `"tipo_ba": null`, `"nota_ba": ""`.

## 3. Canonical ids vs form labels

**Decision**: Persist always with `a < b`. In the GM dialog, label fields by **name**: “{Nome A} vê {Nome B} como…” using the selected people, then map into `tipo_ab` / `tipo_ba` after canonicalization on save.

**Rationale**: Same as 066 create path; avoids teaching the GM about id order.

## 4. Graph stroke (fade)

**Decision**: For `duas_vias`, draw one `<line>` (or path) stroked with an SVG `<linearGradient>` whose stops are the tip colour of a at offset 0 and tip colour of b at offset 1 (soft mid stops if needed for a visible blend). Gradient `gradientUnits="userSpaceOnUse"` with `x1,y1,x2,y2` = disc centres so the fade follows the edge. Labels at ~20% and ~80% along the segment (near each disc), always shown for asymmetric edges (even idle/dim). Reciprocal edges: solid single colour; mid label only when highlight-ready (068).

**Rationale**: Clarification A + fade request; SC-001.

**Alternatives considered**: Two parallel polylines — rejected; mid “Aliado / Romance” chip — hides who-sees-whom.

## 5. Dash pattern when one side is “conhecido”

**Decision**: If either tip is `conhecido`, use dashed stroke for the whole edge (or only if both are conhecido). Prefer: dashed if **either** side is conhecido (keeps asymmetry visible via colour/labels).

**Rationale**: Simple; conhecido remains the “weak link” cue.

## 6. Filters & isolate

**Decision**: Edge matches filter if `tipo_ab ∈ chips` **OR** effective `tipo_ba ∈ chips`. Isolate: neighbour if any edge exists between focus and other (unchanged).

**Rationale**: FR-007.

## 7. Detail panel

**Decision**: For selected S and neighbour O:

- Primary line: O’s name + tipo **S→O** (colour of that tip) + note S→O  
- Secondary (only if duas vias): muted text “vê-te como {tipo O→S}” (+ note O→S if any)

Reciprocal: one tipo, one note (current layout).

**Rationale**: FR-004, SC-002.

## 8. Seed

**Decision**: Change Elara–Marcus from reciprocal aliado to duas vias: Elara→Marcus `aliado`, Marcus→Elara `romance`, both notes filled, `publico=true` so players see the example.

**Rationale**: Quickstart / SC-001 without GM setup.
