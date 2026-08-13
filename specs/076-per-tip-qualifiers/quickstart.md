# Quickstart: Per-Tip Qualifiers

**Feature**: `076-per-tip-qualifiers`  
**Purpose**: Validate per-sense `Tipo (Qual)` and migration ([spec.md](./spec.md)).

## Prerequisites

- App running; Modo GM on `/relacoes`
- Backend migrated (restart uvicorn after deploy)
- Optional: seed with Marcus↔Tomas (Mentor) and Helga↔Ranulf (Medo directed)

## Scenarios

### 1. Duas vias — distinct quals on tips (US1, SC-001)

1. + Conexão → Duas vias → A vê B **Inimizade** + qual **Medo**; B vê A **Romance** + qual **Admiração**.
2. Save; select either endpoint.
3. **Expect** graph tip labels: `Inimizade (Medo)` and `Romance (Admiração)` at ends (no `(Medo)` alone in mid).
4. **Expect** detail: primary `Inimizade (Medo)` or `Romance (Admiração)` by perspective; “Vê-te como…” shows other side with its qual.

### 2. Per-tip autocomplete (US2)

1. Duas vias: open AB qual suggestions → list for Inimizade (+ Medo), not Romance list.
2. Open BA qual suggestions → list for Romance (+ Medo) only.
3. Recíproco Aliado → single field; Mentor…Segredo + Medo.

### 3. One-sided qual (US1 edge)

1. Duas vias: qual only on AB side.
2. **Expect** AB tip `Tipo (Qual)`; other tip plain `Tipo`.

### 4. Direction + tips (US3)

1. Duas vias with quals on both ends + direction A→B.
2. **Expect** both tip labels intact; mid shows arrow only (no qual text mid).

### 5. Mode collapse (FR-009)

1. Duas vias with different quals → switch to Recíproco → save.
2. Re-open: only primary sense qual remains.

### 6. Migration from 075 (SC-003)

1. DB row that had pair `qualificador` on a **duas vias** link before upgrade.
2. **Expect** both tips show that text until GM edits.
3. Reciprocal legacy row: qual only on single sense.

### 7. Player / secret sense (SC-004)

1. Without GM: public duas vias with one secret sense.
2. **Expect** no `Tipo (Qual)` for hidden sense; visible sense shows qual.

## Contracts

- [api-vinculos-per-tip-qualifiers.md](./contracts/api-vinculos-per-tip-qualifiers.md)
- [ui-per-tip-qualifiers.md](./contracts/ui-per-tip-qualifiers.md)
