# Implementation Plan: Ocultar placeholder quando o mapa já existe

**Branch**: `002-hide-map-placeholder` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-hide-map-placeholder/spec.md`

## Summary

Garantir que a mensagem “Mapa da campanha — envie a imagem pelo painel GM” só apareça quando a imagem de fundo **não** estiver disponível ou falhar ao carregar. Com `campaign-map` (ou URL equivalente) carregada com sucesso, a mensagem **não** deve ser visível na visão pública nem no mapa do admin. Correção principal no componente `CampaignMap`: visibilidade do placeholder dirigida por estado (e/ou CSS que respeite `hidden`), em vez de `display: grid` permanente que pode sobrepor o atributo `hidden`.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend existente)

**Primary Dependencies**: React; `CampaignMap` já usa `<img onError>`; sem novas libs

**Storage**: N/A (sem mudança de banco); imagem continua em `/uploads/map/campaign-map.*`

**Testing**: Validação manual via quickstart (com e sem arquivo de mapa)

**Target Platform**: SPA existente (Vite); desktop e mobile

**Project Type**: Web UI fix (componente de mapa)

**Performance Goals**: Sem impacto; empty state imediato após `onError` / `onLoad`

**Constraints**: Mutuamente exclusivo imagem vs. mensagem; aplicar em MapPage e AdminPage (ambos usam `CampaignMap`)

**Scale/Scope**: 1 componente + CSS; 0 endpoints novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Mudança mínima, só UI empty state | PASS |
| Sem auth/dados novos | PASS |
| Spec FR-001–004 cobertos | PASS |

**Post-design re-check**: PASS — sem entidades novas; contrato UI documentado.

## Project Structure

### Documentation (this feature)

```text
specs/002-hide-map-placeholder/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-map-empty-state.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/
├── CampaignMap.tsx      # estado showPlaceholder: false até onError; true só se falha/ausência
└── CampaignMap.css      # [hidden] / .is-hidden → display:none; não deixar display:grid vencer
```

**Structure Decision**: Alterar apenas o componente compartilhado `CampaignMap` (cobre `/` e `/admin`).

## Complexity Tracking

> Sem violações.
