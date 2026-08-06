# Quickstart: Route Type Coverage

**Feature**: `056-route-type-coverage`  
**Date**: 2026-08-05

Validação manual/API. Ver [contracts/api-route-type-coverage.md](./contracts/api-route-type-coverage.md) e [research.md](./research.md).

## Prerequisites

- Backend on `:8000` with campaign DB where Altdorf=`1`, Ubersreik=`5`
- Frontend optional for overlay smoke

## Scenarios

### A — Canonical Mais rápida (SC-001, FR-001)

```bash
curl -sS "http://127.0.0.1:8000/api/routes/plan?\
origem_waypoint_id=1&destino_waypoint_id=5&\
ritmo=normal&modo_transporte=pago&\
ordenacao=mais_rapida&preferencia_via=nenhuma" | python3 -c "
import json,sys
rotas=json.load(sys.stdin)['rotas']
print('n=',len(rotas))
for i,r in enumerate(rotas):
    print(i+1, r['tipos'], r['distancia_milhas'], r.get('tempo_texto'))
assert len(rotas)<=6
assert any(r['tipos']==['estrada'] for r in rotas), 'missing pure estrada'
print('OK pure estrada present')
"
```

**Expect**: ≤6; at least one `tipos == ['estrada']`; first item is fastest among returned.

### B — Both pures when both exist (SC-002)

Same call as A.

**Expect**: ≥1 `['rio']` and ≥1 `['estrada']` (Altdorf–Ubersreik).

### C — Preferência rio still covers estrada (FR-006)

Same as A with `preferencia_via=rio`.

**Expect**: Still ≥1 `['estrada']`.

### D — Mais barata regression (SC-004)

`ordenacao=mais_barata`.

**Expect**: Pure estrada still present; first item cheapest Dentro among returned.

### E — UI overlay (optional)

Calcular Altdorf→Ubersreik; select the **Estrada** row; map overlay follows the road path (not the river-only path).

## Non-goals

- Do not validate digitizer.
- Do not require new API params.
