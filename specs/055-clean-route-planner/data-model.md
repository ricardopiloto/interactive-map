# Data Model: Clean Calcular Rota Panel

**Feature**: `055-clean-route-planner` | **Date**: 2026-08-05

No persisted entities. UI session state only.

## Entities

### PanelLayout (conceptual)

| Slot (top → bottom) | Content |
|---------------------|---------|
| 1 | Title + close |
| 2–3 | De, Para |
| 4 | Calcular |
| 5 | Error (if any) |
| 6 | Options block |
| 7 | Results list |

### OptionsBlockState

| Field | Type | Rules |
|-------|------|-------|
| `optionsOpen` | boolean | Default `false`; reset `false` on panel open |
| nested controls | existing | modo, ritmo, ordenacao, preferenciaVia, velocidade |

### OptionsSummary

| Field | Description |
|-------|-------------|
| `fragments` | string[] of non-default labels (see research §2) |
| `visible` | `fragments.length > 0` && `!optionsOpen` (shown in collapsed header) |

### ResultItemView

| Band | Content |
|------|---------|
| Title | Route title + optional first-badge |
| Meta | Single consolidated metrics line |

## State transitions

```text
panel open  → optionsOpen=false; business resets (existing)
user toggles header → optionsOpen flip
modo/ritmo/… change → summary fragments recompute; auto-recalc unchanged
panel close → next open: optionsOpen=false again
```

## Validation

- Summary MUST NOT invent values not reflected in controls.
- Empty fragments ⇒ no summary DOM line.
