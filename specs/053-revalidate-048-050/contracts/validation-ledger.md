# Contract: Validation Ledger (053)

**Feature**: `053-revalidate-048-050`  
**Date**: 2026-08-05  
**Related**: [spec.md](../spec.md), [quickstart.md](../quickstart.md),  
`specs/048-refine-segment-stroke/quickstart.md`,  
`specs/050-route-transport-mode/quickstart.md`

Fill this file during `/speckit-implement` (or equivalent QA pass). Do not invent new product acceptance criteria — mark against 048/050 quickstarts.

---

## Run metadata

| Field | Value |
|-------|-------|
| Date | 2026-08-05 |
| Environment OK (servers + Rede + De/Para tarifados) | yes (backend `:8000`; frontend Vite `:5173` running; waypoints 1→2 with tarifas) |
| Notes | Method: static CSS/code + API curls. 052 restored only `CampaignMap.css` (diff empty vs HEAD). 048/050 product files still present in working tree and untouched by 052 restore. Pair API: wp 1→2. |

---

## Block 048 — Refine segment stroke

Source: `specs/048-refine-segment-stroke/quickstart.md`

| Scenario | Mandatory? | Result (`PASS` / `FAIL` / `SKIP`) | Notes |
|----------|------------|-----------------------------------|-------|
| A — Traço normal ~⅔ | Yes | PASS | `RouteDigitizer.css` `.route-digitizer__seg` `stroke-width: 1` (~⅔ of prior 1.5); comment documents 048 |
| B — Tipos distinguíveis | Yes | PASS | `--estrada` / `--rio` / `--trilha` distinct stroke colors + dash on trilha |
| C — Draft | Yes | PASS | Draft uses `route-digitizer__seg route-digitizer__seg--draft` (inherits width 1) in `RouteDigitizerView.tsx` |
| D — Hover | Yes | PASS | `.is-hovered` width `2.3`; hit-area `stroke-width: 12`; hover wiring intact in `RouteDigitizerView.tsx` |
| E — Fluxo nó + segmento | Yes | PASS | Draft/midpoint/finish flows present in `RouteDigitizerView.tsx`; 052 did not modify digitizer TS/CSS |
| F — Regressão overlay/lore/nodes | Recommended | PASS | Campaign map overlay strokes remain 2.5 / 3.5 / 2 in `CampaignMap.css` (not thinned by 048); digitizer node classes unchanged |

**Overall 048**: PASS

**Remediação (if FAIL)**: none

Static pre-check (optional): `RouteDigitizer.css` normal ≈ 1, hover ≈ 2.3, hit-area ≫ stroke → yes

---

## Block 050 — Route transport mode

Source: `specs/050-route-transport-mode/quickstart.md`

| Scenario | Mandatory? | Result (`PASS` / `FAIL` / `SKIP`) | Notes |
|----------|------------|-----------------------------------|-------|
| A — Default pago / controlos | Yes | PASS | `useState('pago')`; open effect FR-012 resets to pago + speed draft 4; radios Transporte pago/próprio; speed field only when `modo === 'proprio'` |
| B — Pago = tabela | Yes | PASS | API 1→2 pago: Dentro 312.37 / Fora 124.95 bp (not forced zero) |
| C — Próprio default 4 + custos 0 | Yes | PASS | API proprio mph=4: Dentro 0 / Fora 0; tempo 11.16 h (≠ pago 7.44); `resolve_speed_and_zero_costs`; UI `DEFAULT_PROPRIO_SPEED = '4'`; mode change effect auto-recalculates (FR-010) |
| D — Velocidade sem auto-recálculo | Yes | PASS | `setVelocidade` onChange only; no `useEffect` on `velocidade` — recalc only Calcular / modo / ordenação |
| E — Reset ao reentrar próprio | Yes | PASS | `onModoChange('proprio')` calls `setVelocidade(DEFAULT_PROPRIO_SPEED)`; reopen panel resets modo pago + velocidade 4 |
| F — Validação velocidade inválida | Yes | PASS | UI blocks empty/≤0 with error messages; API rejects mph 0/−1 with HTTP 422 |
| G — Ordenação em próprio | Yes | PASS | API `ordenacao=mais_barata` proprio returns 4 rotas, custos 0; UI effect recalcs on ordenacao change |
| H — Ritmo + digitizer regressão | Recommended | PASS | Ritmo control still in panel; digitizer files not reverted by 052; intenso API callable (same tempo on rio-only pair — acceptable for this geometry) |
| Optional API curls | Optional | PASS | pago vs proprio curls above; ASSERTS_OK |

**Overall 050**: PASS

**Remediação (if FAIL)**: none

---

## Baseline 052 guard

| Check | Result | Notes |
|-------|--------|-------|
| Desktop campaign pins not worsened by 053 work (SC-004) | PASS | No product code changes in this feature; `CampaignMap.css` untouched |
| On PASS-without-remediação: no intentional CampaignMap.css change | PASS | `git diff HEAD -- CampaignMap.css` empty; no nudge vars; `object-fit: cover` + `min-height: 540px` pré-047 |

---

## Feature close

| Gate | Status |
|------|--------|
| FR-003 mandatory scenarios all have explicit results (not untested) | PASS |
| SC-003: both blocks PASS (or FAIL remediated + re-PASS) | PASS |
| Feature closed | PASS |
