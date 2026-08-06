# UI Contract: Preferência de Via

**Feature**: `054-prefer-river-road`  
**Date**: 2026-08-05

## Control

In `RoutePlannerPanel`, add a fieldset (same pattern as ordenação / modo):

| Value | Label |
|-------|-------|
| `nenhuma` | Sem preferência |
| `rio` | Por rio |
| `estrada` | Por estrada |

- Radio group; exactly one selected
- Default / on panel open: `nenhuma`
- Placement: near existing ordenação / modo controls (readable, no redesign of whole panel)

## Behavior

| Event | Effect |
|-------|--------|
| Open panel | Reset preferência → `nenhuma` (with modo → pago) |
| Change preferência | If De/Para válidos → auto `calcular` with new value (FR-006) |
| Change ordenação / modo | Existing auto-recalc; include current preferência in request |
| Calcular click | Send `preferencia_via` with other params |

## API wiring

`campaignApi.planRoute(..., preferenciaVia)` → query `preferencia_via`.

## Non-goals

- No “por trilha” option
- No change to result row layout beyond existing badges
- Digitizer unchanged
