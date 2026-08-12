# Quickstart: Detail Portrait Layout

**Feature**: `070-detail-portrait-layout`  
**Purpose**: Visual check that a long personagem description does not break the Relações ficha portrait ([spec.md](./spec.md)).

## Prerequisites

- App running; `/relacoes`
- At least one personagem **with** portrait and a **long** description (GM: Editar → paste several paragraphs), and one with a **short** description

## Scenarios

### 1. Long description, portrait intact (US1 / SC-001, SC-002)

1. Open `/relacoes` and select the personagem with a long description.
2. Expect the **retrato** in the right sheet: full image, not flattened, not covered by text, not overflowing the slot.
3. Scroll the sheet: description and vínculos are fully readable; portrait size stays the same as at the top of the scroll.

### 2. No portrait + long text (US1)

1. Select a personagem without `retrato` and a long description.
2. Expect the “Sem retrato” box still visible and not crushed.

### 3. Short description unchanged (US2 / SC-003)

1. Select a personagem with one or two sentences (or empty).
2. Expect the same portrait size as today and **no** extra scrollbar if everything already fits.

### 4. Wide token (SC-004)

1. (Optional GM) Put a long string without spaces in the description.
2. Expect the sheet to stay ~300px; text wraps; portrait still intact.

## Contract

[ui-detail-portrait-layout.md](./contracts/ui-detail-portrait-layout.md)
