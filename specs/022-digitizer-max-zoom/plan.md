# Implementation Plan: Zoom Aumentado na Digitalização de Rotas

**Branch**: `022-digitizer-max-zoom` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-digitizer-max-zoom/spec.md` (teto ~3× o mapa normal na vista Rede de rotas; só roda/pinça; sem botões +/−; mapa do jogador inalterado).

## Summary

Aumentar o `maxScale` do `TransformWrapper` em `RouteDigitizerView` de **4** (igual ao mapa da campanha) para **12** (~3× o teto do mapa normal), e ajustar o passo da roda se necessário para atingir o máximo em poucos segundos. Sem mudanças de backend, modelo, escala km↔px ou UI de botões de zoom. `CampaignMap` permanece em `maxScale={4}`.

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: `react-zoom-pan-pinch` (`TransformWrapper` em `RouteDigitizerView.tsx`); mapa normal em `CampaignMap.tsx` como referência de teto (= 4)

**Storage**: N/A (sem persistência; zoom é só viewport)

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex); GM desktop prioritário

**Project Type**: Web application (ajuste pontual de viewport na digitalização)

**Performance Goals**: Pan/zoom usáveis em zoom 12×; fluidez perfeita não obrigatória (spec)

**Constraints**:
- Teto digitalização ≈ 3× teto mapa normal → `maxScale={12}` se mapa = 4
- Controles: só roda / pinça (sem +/− novos)
- `minScale` e escala km↔px / coordenadas % inalterados
- Mapa do jogador (`CampaignMap`) não herda o teto novo
- Mesmo `TransformWrapper` para todos os modos da vista → SC-004 automático

**Scale/Scope**: 1 arquivo principal (`RouteDigitizerView.tsx`); opcional constante compartilhada se o plano técnico preferir documentar o fator 3×

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Spec clarificada (3×; só roda/pinça) | PASS |
| Sem API/schema | PASS |
| Escopo só viewport da digitalização | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract + data-model N/A; sem dados persistidos; sem violações a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/022-digitizer-max-zoom/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-digitizer-zoom.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/gm/
└── RouteDigitizerView.tsx   # TransformWrapper: maxScale (e opcional wheel.step)

frontend/src/components/map/
└── CampaignMap.tsx          # referência: maxScale={4} — NÃO alterar nesta feature
```

**Structure Decision**: Mudança cirúrgica nas props do `TransformWrapper` da vista Rede de rotas; backend e `CampaignMap` fora do escopo.

## Complexity Tracking

> Sem violações a justificar.
