# Quickstart: Disc Portrait

**Feature**: `069-disc-portrait`  
**Purpose**: Visual check of portraits in Relações discs ([spec.md](./spec.md)).

## Prerequisites

- App running; `/relacoes`
- At least one personagem **with** portrait and one **without** (GM: Editar → upload / clear `retrato`)

## Scenarios

### 1. Fill disc when portrait exists (US1 / SC-001, SC-003)

1. Open `/relacoes`.
2. Find a personagem with a portrait.
3. Expect the **disc** to show the face filling the circle (no initials, no letterbox bars, no overflow past the border).
4. Name and papel remain **under** the disc.

### 2. Initials when no portrait (US1 / SC-002)

1. Find a personagem without a portrait.
2. Expect the usual two-letter initials inside the disc.

### 3. Same asset as ficha (FR-003)

1. Select a personagem with a portrait.
2. Compare disc vs detail-panel image: same file; panel may show the **full** picture (`contain`); disc is the **cropped** circle.

### 4. States still apply (US2)

1. Select a node with a portrait → halo around the circle.
2. A **morto** with portrait → photo desaturated; name struck through.
3. Select another node → unrelated portrait discs fade (~28%) like text-only discs.

### 5. Update / remove (US3 / SC-005)

1. GM: add a portrait to a character that had initials → after save / list refresh, that disc shows the photo.
2. Remove the portrait → disc returns to initials.
3. (Optional) Break the URL (invalid path) → disc shows initials, not empty.

## Contract

[ui-disc-portrait.md](./contracts/ui-disc-portrait.md)
