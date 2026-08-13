# Quickstart: Seletor de Idioma em Combo-box

**Feature**: `082-language-combobox`  
**Purpose**: Validate custom language combobox ([spec.md](./spec.md), [contracts/ui-language-combobox.md](./contracts/ui-language-combobox.md)).

## Prerequisites

- Frontend running (`npm run dev`); backend optional for chrome-only checks
- Branch / build with 082 implemented
- Clear or note `localStorage` key used by i18next (`i18nextLng`) between persistence tests

## Scenarios

### 1. Single trigger (US1, FR-001, FR-002)

1. Open `/` (Mapa).
2. **Expect**: One language control with **PT** or **EN** plus chevron; **not** two adjacent PT/EN buttons.
3. Open `/relacoes` → same control left of GM toggle.

### 2. List labels follow UI locale (FR-003, Clarify Q2)

1. UI in PT-BR; open combobox.
2. **Expect**: **Português** and **Inglês**; active row highlighted (no checkmark).
3. Choose **Inglês**.
4. Reopen list.
5. **Expect**: **Portuguese** and **English**; trigger shows **EN**.

### 3. Persist (US1, SC-002)

1. Set EN via combobox.
2. Reload.
3. **Expect**: Trigger **EN**; nav in English.

### 4. Instant switch (SC-001)

1. Open combobox → choose other language.
2. **Expect**: Menu closes; labels update in &lt;1 s; no full navigation reload.

### 5. Escape / outside click (FR-007)

1. Open list; press Escape.
2. **Expect**: Closes; language unchanged; focus on trigger.
3. Open again; click outside header control.
4. **Expect**: Same — close, no change, focus on trigger.

### 6. Keyboard only (US2, SC-004)

1. Tab to language trigger.
2. Enter/Space opens; arrows move; Enter selects.
3. **Expect**: Language changes; focus back on trigger.
4. Open; Escape cancels; focus on trigger.

### 7. Narrow viewport (SC-003)

1. Set width ≤800px.
2. **Expect**: Combobox visible and compact; GM toggle still reachable (not covered/pushed off).

### 8. Build

```bash
cd frontend && npm run build
```

**Expect**: Clean `tsc -b` + vite build.
