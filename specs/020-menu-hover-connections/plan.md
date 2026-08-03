# Implementation Plan: Hover no menu mostra conexões

**Branch**: `020-menu-hover-connections` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-menu-hover-connections/spec.md` (linhas no hover do menu/lista GM **só sem seleção**; com seleção, hover só destaca pin; 016/017/019 intactos).

## Summary

Estender o overlay de linhas da 017 para também desenhar saídas quando há **hover** de local no menu (jogador ou GM) e **nenhum** local está selecionado. Com seleção ativa, linhas continuam só do local selecionado. Sem mudança de API, dados ou estilo visual (019).

## Technical Context

**Language/Version**: TypeScript / React (frontend existente)

**Primary Dependencies**: `CampaignMap.tsx` (overlay); `MapPage.tsx` (`selectedLocalId`, `hoveredLocalId`); `SideMenu` / `LocalAdminList` já emitem `onLocalHover`

**Storage**: N/A

**Testing**: Validação visual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (mesmo do Codex)

**Project Type**: Web application (ajuste de regra de UI)

**Performance Goals**: Troca rápida de hover entre itens sem jank; sem pan/zoom (016)

**Constraints**:
- Linhas por hover **somente** se `selectedLocalId == null` (clarificação C)
- Lista GM com paridade (clarificação A)
- Sem pan/zoom no hover (016)
- Estilo de linha inalterado (019)
- Sem backend

**Scale/Scope**: Lógica de origem das linhas em `CampaignMap.tsx` (e/ou helper local); SideMenu/GM já wired

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution placeholder. Gates informais:

| Gate | Status |
|------|--------|
| Spec clarificada (precedência + superfícies) | PASS |
| Sem API/schema | PASS |
| Escopo UI limitado | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract atualiza regra 017; sem dados novos.

## Project Structure

### Documentation (this feature)

```text
specs/020-menu-hover-connections/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-menu-hover-connections.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── components/map/CampaignMap.tsx   # origem das linhas: selected ?? hover (se sem seleção)
├── pages/MapPage.tsx                # já passa selectedLocalId + hoveredLocalId (verificar)
├── components/sidebar/SideMenu.tsx  # onLocalHover já existe
└── components/admin/LocalAdminList.tsx  # onLocalHover já existe (paridade GM)
```

**Structure Decision**: Preferir alterar só a condição de desenho em `CampaignMap.tsx`; callbacks de hover já existem — sem novos props se `hoveredLocalId` já chega ao mapa.

## Complexity Tracking

> Sem violações a justificar.
