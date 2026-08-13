# Quickstart: Vínculos Sort by Name

**Feature**: `072-vinculos-sort-name`  
**Purpose**: Confirm A→Z order in the Relações detail vínculo list ([spec.md](./spec.md)).

## Prerequisites

- App running; `/relacoes`
- A personagem with ≥3 visible vínculos (e.g. Brother Tomas)

## Scenarios

### 1. Ascending by name (US1 / SC-001)

1. Select the personagem.
2. Read **Vínculos (n)** top to bottom.
3. Expect neighbour names in alphabetical order (A→Z), ignoring case/accents as Portuguese would.

### 2. Empty / single (US1)

1. Select someone with 0 or 1 link.
2. Expect empty message or a single row; no errors.

### 3. Content unchanged (SC-003)

1. Spot-check tipo, note, “vê-te como…” (if duas vias), and GM buttons still correct on each row.

## Contract

[ui-vinculos-sort-name.md](./contracts/ui-vinculos-sort-name.md)
