# Quickstart: Two-Way Vínculos

**Feature**: `071-two-way-vinculos`  
**Purpose**: Validate asymmetric pair in graph + detail + GM form ([spec.md](./spec.md)).

## Prerequisites

- App running with seed (or GM-created) Elara↔Marcus: Elara→Marcus **aliado**, Marcus→Elara **romance**, público
- `/relacoes`

## Scenarios

### 1. Idle graph shows both natures (US1 / SC-001)

1. Open `/relacoes` with **no** selection.
2. Find the Elara–Marcus line: colour shifts from aliado (by Elara) to romance (by Marcus) with a mid fade; short labels near each end.
3. A reciprocal edge elsewhere: single colour, **no** idle label.

### 2. Tipo chips (US1)

1. Turn off Romance, leave Aliado on → Elara–Marcus **stays**.
2. Turn off Aliado too → the pair **disappears**.

### 3. Select each end (US2 / SC-002)

1. Select **Elara**: detail lists Marcus as **Aliado** and shows that he sees her as **Romance**; line labels match.
2. Select **Marcus**: primary tipo **Romance**; secondary aliado from Elara.

### 4. GM create / flip (US3 / SC-003)

1. GM: + Conexão → Duas vias between two other characters → save → see gradient + labels.
2. Edit back to Recíproco → single colour / mid label on focus only.
3. As player: private pair hidden; after GM marks público, both perspectives visible.

## Contracts

- [api-vinculos-two-way.md](./contracts/api-vinculos-two-way.md)
- [ui-two-way-vinculos.md](./contracts/ui-two-way-vinculos.md)
