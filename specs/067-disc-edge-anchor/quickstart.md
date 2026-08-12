# Quickstart: Disc Edge Anchor

**Feature**: `067-disc-edge-anchor`  
**Purpose**: Visual check that vínculo lines meet disc centres ([spec.md](./spec.md)).

## Prerequisites

- App running (frontend + backend); seed relações from 066 (`uv run python -m app.seed` if needed)
- Open `/relacoes` with at least one public vínculo

## Scenarios

### 1. Centro do disco (US1 / SC-001, SC-002, SC-004)

1. Select a personagem with ≥1 visible vínculo.
2. After the ~0.6s animation, lines appear.
3. Each end should aim at the **middle of the initials disc**, not the name/papel block.
4. Repeat for ≥5 different focus characters (incl. one without `papel`, one `morto` if present).

**Pass**: 0 lines that look like they enter between disc and name.

### 2. Atrás do disco / halo (FR-003)

1. Select a node (halo visible).
2. Confirm the line does **not** paint over initials or the halo ring; it disappears under the disc and looks flush with the rim (no gap).

### 3. Arrastar + etiqueta (US2 / SC-003)

1. Drag a linked node; release.
2. The line follows the **disc**, not a point below it.
3. The type label stays at the midpoint between the two discs.
4. Open the detail panel (narrower stage); re-select — still disc-centre to disc-centre.

### 4. Regression (FR-006)

1. Initial view still has **no** lines until selection.
2. Lines still appear only **after** the position animation.
3. Player vs GM visibility of `publico` unchanged.

## Contracts

[ui-disc-edge-anchor.md](./contracts/ui-disc-edge-anchor.md)
