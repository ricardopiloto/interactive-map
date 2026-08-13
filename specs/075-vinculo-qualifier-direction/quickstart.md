# Quickstart: Vínculo Qualifier & Direction

**Feature**: `075-vinculo-qualifier-direction`  
**Purpose**: Validate qualifier autocomplete, direction arrows, and labels ([spec.md](./spec.md)).

## Prerequisites

- App running; Modo GM on `/relacoes`
- Optional: seed or create demo pairs

## Scenarios

### 1. Qualifier suggestions (US1)

1. + Conexão → Recíproco → tipo Aliado → open qualifier suggestions.
2. Expect Mentor…Segredo and Medo.
3. Switch to Romance → expect Medo (and free text still works).
4. Switch to Duas vias Aliado + Inimizade → expect union (Mentor + Rival + Medo, Segredo once).

### 2. Persist free text + list pick (US1)

1. Save Aliado + Mentor (mútuo).
2. Select an endpoint → detail shows **Aliado (Mentor)**; graph focus label matches.
3. Save Amizade + free text “Companheiro de guerra” → same surfaces.

### 3. Direction (US2)

1. Edit a pair: Medo + direction A→B → mid/list shows arrow; colours unchanged.
2. Set mútuo → arrow gone.
3. Direction without qualifier → arrow still shown.

### 4. Duas vias mid label (US3 / clarification B)

1. Duas vias tip labels at ends; mid shows `(Medo)` and/or `→` only.
2. GM edit from edge/list restores all fields.

### 5. Legacy (SC-003)

1. Old pair without fields → still reads as plain tipo; no empty `()`.

## Contracts

- [api-vinculos-qualifier-direction.md](./contracts/api-vinculos-qualifier-direction.md)
- [ui-qualifier-direction.md](./contracts/ui-qualifier-direction.md)
