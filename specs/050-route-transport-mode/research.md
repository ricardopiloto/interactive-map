# Research: Route Transport Mode (Paid vs Own)

**Feature**: `050-route-transport-mode` | **Date**: 2026-08-05

## 1. How to express paid vs own on the API

**Decision**: Add query param `modo_transporte` with values `pago` | `proprio`, default **`pago`**. Keep existing `velocidade_media_mph` for own-mode speed only.

**Rationale**: Spec needs distinct semantics — table speeds+costs vs override speed + zero costs. Today omitting mph = table and sending mph = override **but still charges table costs**; FE-only zeroing would lie to “mais barata” and response costs.

**Alternatives considered**:
- Only `velocidade_media_mph` + FE zeros costs — rejected (sort weights and API costs wrong)
- `zerar_custos=true` flag without mode — weaker UX/API clarity; mode is the product concept
- Separate endpoint — unnecessary duplication

## 2. Paid mode and leftover mph

**Decision**: When `modo_transporte=pago`, planner MUST use table speeds (`velocidade_media_mph=None` internally) even if the client sends mph. Router may strip/ignore the query.

**Rationale**: FR-002 — no user speed override in paid mode.

**Alternatives considered**: 422 if mph sent with pago — stricter but breaks careless clients; ignore is enough for this UI.

## 3. Own mode speed default

**Decision**: UI always sends mph when próprio (field default `"4"`). Backend: if `proprio` and mph omitted, default **`4.0`**; if present must be `> 0` (existing validation).

**Rationale**: FR-004 / clarifications; defense in depth if API called without mph.

**Alternatives considered**: Require mph always for próprio with 422 — also fine; default 4 is friendlier and matches product default.

## 4. Zeroing costs in the planner

**Decision**: In `build_graph` (and any path that aggregates costs), when mode is próprio set `custo_dentro_bp` / `custo_fora_bp` to **0** and set `peso_barata` to `0 + 1e-9 * tempo` (time tie-break only). Response route totals stay 0.

**Rationale**: FR-003; “mais barata” with all-zero costs falls through to time (spec edge case) without errors.

**Alternatives considered**: Zero only in response serialization — rejected (graph weight for barata would still use real tariffs).

## 5. UI state: open reset and recalc

**Decision**:
- On `open` false→true: set mode=`pago`, clear/hide speed, reset speed draft to `"4"` for next próprio entry.
- `useEffect` on mode (like ordenação): if De/Para valid, call plan.
- Speed `onChange` does **not** trigger plan.
- Switching pago→próprio resets speed display to `"4"`; próprio→pago hides field; returning to próprio resets to `"4"` (spec assumption).

**Rationale**: FR-010–012; panel currently keeps state while `open=false` (`return null` after hooks), so explicit reset on open is required.

**Alternatives considered**: Remount panel when closed — larger MapPage change; effect on open is smaller.

## 6. Backward compatibility

**Decision**: Default `modo_transporte=pago` preserves table behavior for callers that omit the new param. Callers that only send mph without mode: treat as **pago** and ignore mph **or** document migration — prefer: if mode omitted and mph present, keep **legacy** override+tariffs for one release so old clients don’t break; new UI always sends mode.

**Refined decision**: 
- `modo_transporte` omitted + mph omitted → pago/table (today).
- `modo_transporte` omitted + mph set → **legacy** override speeds **with** table costs (today’s behavior).
- `modo_transporte=pago` → table; ignore mph.
- `modo_transporte=proprio` → mph (default 4) + zero costs.

**Rationale**: Avoid breaking any leftover scripts; new UI always sets mode explicitly.

## 7. CHANGELOG

**Decision**: Note under next patch: Calcular rota — transporte pago vs próprio (default speed 4, zero costs when own).
