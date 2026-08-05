# Quickstart: Revalidate 048 and 050 After 052

**Feature**: `053-revalidate-048-050`  
**Date**: 2026-08-05

Validação orquestrada. Detalhe dos cenários: quickstarts originais. Registo: [contracts/validation-ledger.md](./contracts/validation-ledger.md). Ver [research.md](./research.md).

## Prerequisites

- Frontend + backend a correr
- Modo GM disponível para **Rede de rotas**
- Rede com segmentos mistos (estrada/rio/trilha) e idle para hover
- **Calcular rota** com De/Para que incluam trechos tarifados (estrada/rio)
- 052 aplicada (mapa da campanha pré-047 no desktop)

## 0 — Static smoke (≤ 2 min)

1. Confirm digitizer stroke still ~1 / hover ~2.3 (not reverted to pré-048 ~1.5 / ~3.5).
2. Confirm Calcular rota UI still exposes Pago / Próprio (not only legacy free speed).
3. Confirm CampaignMap presentation still matches 052 restore intent (no 047 left nudge / no 051 stage shrink as product goal).

**Expect**: Signals consistent with research §2. Record notes in ledger metadata if anything looks wrong before UI runs.

## 1 — Block 048 (≤ 10 min) — SC-001

1. Open `specs/048-refine-segment-stroke/quickstart.md`.
2. Run scenarios **A–E** (mandatory) and **F** (recommended).
3. Mark each row in the 053 ledger.

**Expect**: Overall 048 **PASS**. If FAIL after valid environment → remediação scoped to digitizer stroke/UX only → re-run → PASS.

## 2 — Block 050 (≤ 15 min) — SC-002

1. Open `specs/050-route-transport-mode/quickstart.md`.
2. Run scenarios **A–G** (mandatory) and **H** (recommended).
3. Optionally run the API curls in that quickstart.
4. Mark each row in the 053 ledger.

**Expect**: Overall 050 **PASS**. If FAIL → remediação scoped to transport mode / planner only → re-run → PASS.

## 3 — Baseline 052 guard — SC-004

1. Desktop campaign map: quick spot-check that pins still look like pós-052 (not re-broken by any remediação).
2. If both blocks PASS with no remediação: confirm no intentional CampaignMap.css edit was made for 053.

**Expect**: Guard PASS.

## 4 — Close

1. Ensure every mandatory scenario has `PASS`/`FAIL` (not blank) — SC-005.
2. Set feature close gates in the ledger when SC-003 is met.

## Non-goals

- Do not re-test mobile pin alignment as a 048/050 criterion.
- Do not “improve” strokes or transport UX beyond restoring 048/050 on FAIL.
- Do not delete specs 047–052.
