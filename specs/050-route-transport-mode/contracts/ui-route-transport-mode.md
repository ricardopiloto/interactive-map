# UI Contract: Route Transport Mode

**Feature**: `050-route-transport-mode`  
**Date**: 2026-08-05

## Panel: Calcular rota (`RoutePlannerPanel`)

### Controls

| Aspect | Contract |
|--------|----------|
| Modo | Explicit choice **Transporte pago** \| **Transporte próprio** (radios or equivalent) |
| Default on open | Always **pago** (each `open` false→true); do not remember prior mode |
| Velocidade | Visible **only** in **próprio**; initial value **4**; hidden/inaccessible in **pago** |
| Reset speed | Entering **próprio** from **pago** (or after open then choosing próprio) → field **4** |
| Ritmo / ordenação | Unchanged; available in both modes |
| Old free mph | Removed as primary control (replaced by mode model) |

### Recalculation

| Trigger | Recalculate when De/Para valid? |
|---------|--------------------------------|
| Change **modo** Pago ↔ Próprio | **Yes** (FR-010) |
| Change **ordenação** | **Yes** (existing) |
| Change **velocidade** alone | **No** (FR-011) — wait for Calcular or mode/ordenação |
| Change **ritmo** | Existing behavior (no new requirement to auto-recalc) |
| Click **Calcular** | **Yes** |

### Requests

| Mode | API call |
|------|----------|
| Pago | `modo_transporte=pago` — do **not** send `velocidade_media_mph` |
| Próprio | `modo_transporte=proprio` + `velocidade_media_mph` from field (must be valid `> 0`) |

### Validation (próprio)

- Empty / non-numeric / ≤ 0 → clear error; **no** plan request; clear or keep list empty per existing error UX (no silent bad calc).

### Results list

- Show time as today.
- Show Dentro / Fora: table values in **pago**; **0** / **0** (or equivalent zero labels) in **próprio** — do not hide cost rows.
- First row selection / badges for ordenação unchanged.

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-001, FR-006, US1–2 | Mode replaces free speed as primary |
| FR-010–012 | Auto mode recalc; no speed-only recalc; open → pago |
| FR-008, US3 | Invalid own speed blocked |
| FR-009, SC-002 | Zero costs visible in próprio |
| SC-001 | Mode identifiable in ≤ 1 min |
