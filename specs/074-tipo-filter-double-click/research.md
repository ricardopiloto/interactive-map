# Research: Tipo Filter Double-Click

**Feature**: `074-tipo-filter-double-click`  
**Date**: 2026-08-12

## 1. Click vs double-click coordination

**Decision**: On chip `click`, schedule `toggleTipo` with a short timeout (~250–300ms). On `dblclick`, cancel the pending toggle and run solo/restore instead. Do not rely on raw `click`+`click`+`dblclick` without cancellation (causes flicker; restore path can briefly hit zero active tipos).

**Rationale**: Spec edge case — dblclick must not introduce zero-tipos; FR-004/001 must both hold on final state without ugly intermediates.

**Alternatives considered**:
- Ignore coordination (end state often OK) — rejected (empty-network flash on restore).
- `detail === 2` only on click — brittle across browsers vs explicit `onDoubleClick`.

## 2. Solo / restore state rules

**Decision**:

```text
onDoubleClick(tipo):
  if activeTipos.size === 1 && activeTipos.has(tipo):
    setActiveTipos(new Set(VINCULO_TIPOS))  // restore all
  else:
    setActiveTipos(new Set([tipo]))         // isolate
```

**Rationale**: FR-001–003; matches Assumptions.

## 3. API surface between column and page

**Decision**: Extend props with `onSoloOrToggleRestoreTipo(tipo)` (or `onDoubleClickTipo`) handled in `RelacoesPage`; keep `onToggleTipo` for delayed single click. Alternatively handle delay inside the column and call two callbacks — prefer page owns Set mutations for one source of truth.

**Rationale**: `activeTipos` already lives on the page.

## 4. Version

**Decision**: Patch **0.10.1** (UX shortcut on existing filter).
