# Implementation Plan: Borda escura no pin do grupo

**Branch**: `004-group-pin-border` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-group-pin-border/spec.md` (clarificação: substituir borda accent por escura).

## Summary

Trocar a borda accent do ícone do grupo (mapa + legenda) por borda escura alinhada aos pins de local (`var(--color-bg)` / contorno escuro do tema), nos formatos bandeira e brasão. Sem mudanças de API, dados ou fluxos.

## Technical Context

**Language/Version**: TypeScript / CSS (frontend existente)

**Primary Dependencies**: React SPA; estilos em `CampaignMap.css`

**Storage**: N/A

**Testing**: Validação visual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (ajuste visual pontual)

**Performance Goals**: Inalterado

**Constraints**:
- Substituir accent — não empilhar bordas
- Ambos os formatos + legenda
- Pins de local intactos
- `clip-path` na bandeira pode cortar `border` — ver research

**Scale/Scope**: 1 arquivo CSS principal (`CampaignMap.css`); possível ajuste mínimo se drop-shadow for necessário

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Escopo só visual do ícone do grupo | PASS |
| Sem mudança de auth/dados | PASS |
| Paridade com decisão de clarificação (substituir accent) | PASS |

**Post-design re-check**: PASS — sem contratos API; UI contract documenta aparência esperada.

## Project Structure

### Documentation (this feature)

```text
specs/004-group-pin-border/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-group-border.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/
├── CampaignMap.css          # .campaign-map__party* e .campaign-map__legend-party*
└── CampaignMap.tsx          # sem mudança esperada (classes já existem)
```

**Structure Decision**: Alteração cirúrgica de CSS no mapa; sem novos componentes.

## Complexity Tracking

> Nenhuma violação de constituição a justificar.
