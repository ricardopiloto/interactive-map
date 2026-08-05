# Quickstart: Fix Mobile Marker Alignment

**Feature**: `049-fix-mobile-marker-align`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/ui-fix-mobile-marker-align.md](./contracts/ui-fix-mobile-marker-align.md) e [research.md](./research.md). Compare with the bug print (mobile campaign map).

## Prerequisites

- Frontend (+ backend for map data)
- Campaign map with ≥ 3 locais + group pin visible
- DevTools / device: width &lt; 800 and ≥ 800

## Scenarios

### A — Mobile: already not too far left

1. Open campaign map; set viewport &lt; 800px (`map-page--mobile`).
2. Compare pin tips to city art / known points; check group pin.

**Expect**: Locais + grupo **not** perceptibly left of targets (SC-001). 047’s extra left shift gone.

### B — Desktop unchanged

1. Widen to ≥ 800px.

**Expect**: Same good alignment as before this feature (SC-002).

### C — Resize

1. Toggle &lt;800 ↔ ≥800.

**Expect**: Mobile stays corrected; desktop stays correct; no reload needed.

### D — Zoom/pan on mobile

1. Zoom in/out and pan; re-check 3 pins + group.

**Expect**: Alignment remains stable (SC-003).

### E — Exclusions

1. Open Rede de rotas / digitizer; glance segment strokes and `__wp`.
2. Campaign map travel overlay if a route is calculated.

**Expect**: Digitizer/overlay not changed by this feature (FR-007).

### F — Optional residual

1. If after removing 047 pins are OK but still slightly left (or group still left), apply shared **right** nudge per research; re-run A–D.

**Expect**: Final state matches SC-001 without any left nudge.

## Non-goals

- Do not thin segment lines (048)
- Do not chase white grid/seam lines in the old print
