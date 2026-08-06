# API Contract: Preferência de Via

**Feature**: `054-prefer-river-road`  
**Date**: 2026-08-05

## HTTP: `GET /api/routes/plan`

### New query param

| Param | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| `preferencia_via` | string | no | `nenhuma` | `nenhuma`, `rio`, `estrada` |

Existing params unchanged (`origem_waypoint_id`, `destino_waypoint_id`, `ritmo`, `ordenacao`, `modo_transporte`, `velocidade_media_mph`).

### Semantics

| `preferencia_via` | Discovery | Final sort |
|-------------------|-----------|------------|
| `nenhuma` / omitted | Current weights | Current `ordenacao` keys only |
| `rio` | Soft mult: rio 0.75, estrada 1.25, trilha 1.0 on active weight | `ordenacao` primary, then **higher** rio-miles share |
| `estrada` | Soft mult: estrada 0.75, rio 1.25, trilha 1.0 | `ordenacao` primary, then **higher** estrada-miles share |

Mixed routes always allowed. Empty list only when no path exists.

### Response

`RoutePlanResponse` / `RoutePlanItem` shape **unchanged**.

### Errors

| Condition | Status |
|-----------|--------|
| Invalid `preferencia_via` | 422 |
| Other validation | unchanged |

## Acceptance mapping

| Spec | Contract |
|------|----------|
| FR-002 / FR-003 | soft mult + share tie-break; no hard filter |
| FR-004 | `ordenacao` remains primary sort |
| FR-005 | works with `modo_transporte` / ritmo |
| FR-007 | default `nenhuma` |
| SC-002 | rio vs estrada on mixed De/Para differ coherently |
