# Implementation Plan: Relações e Rota (reconstrução estrutural)

**Branch**: `116-relacoes-rota-reconstrucao` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/116-relacoes-rota-reconstrucao/spec.md`

## Summary

Reutilizar o **painel flutuante** da spec 115 (`MapSidePanel`) em **Relações** (busca/filtro/lista ↔ detalhe de personagem; retirar `RelacoesSideColumn` + `RelacoesDetailPanel`) e em **Rota** (formulário + cartões de resultado no painel; mapa full-bleed com destaque da rota seleccionada). Manter `GraphStage` + layout radial (105) e o motor/formatação do planejador (106); só a casca e o hosting mudam. Página Rota torna-se a superfície canónica do planeamento (mapa + painel).

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens 110

**Primary Dependencies**: `MapSidePanel` (115), `GraphStage` / `graphLayout`, `RoutePlannerPanel` logic + `campaignApi.planRoutes` (ou equivalentes já usados), `RouteOverlay` / `CampaignMap`, `PersonagemFormDialog` / `VinculoFormDialog` / ConfirmDialog, `EditModeContext`, react-i18next, `@tabler/icons-react`

**Storage**: N/A

**Testing**: quickstart + capturas claro/escuro/móvel vs. `frontend-next` RelacoesPage/RotaPage; `tsc`; sem pytest

**Target Platform**: Browser; breakpoint ~860px (folha inferior — paridade 115)

**Project Type**: web app frontend

**Performance Goals**: N/A (mesmo grafo / mesmo cálculo de rota)

**Constraints**: MUST NOT reimplementar algoritmo de rota; MUST NOT redesenhar motor de layout do grafo se radial já correcto; MUST NOT inventar segundo sistema de painel; MUST NOT mudar ACL/API; depende de 110+114+115

**Scale/Scope**: `RelacoesPage`, `RotaPage`, rehost do conteúdo do `RoutePlannerPanel` no painel, limpeza de coluna/detalhe antigos, i18n `relacoes`/`comum`/`mapa` conforme strings novas, CSS de destaque de rota com acento da campanha

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova. **N/A**. **PASS**
- **II. Testes primeiro**: UI polish — quickstart/captura. **PASS**
- **III. Produção legada**: Só `frontend/`. **PASS**
- **IV. Simplicidade**: Reutilizar MapSidePanel + GraphStage + cálculo 106. **PASS**
- **V. i18n**: pt-BR+en para casca nova. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/116-relacoes-rota-reconstrucao/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── shared-floating-panel.md
│   ├── relacoes-panel.md
│   └── rota-panel.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/map/MapSidePanel.tsx       # FROM 115 — shared shell (reuse, do not fork)
frontend/src/components/map/MapSidePanel.css
frontend/src/pages/RelacoesPage.tsx                # GraphStage + MapSidePanel; drop side column + detail panel
frontend/src/pages/RelacoesPage.css
frontend/src/components/relacoes/GraphStage.tsx    # keep layout engine; optional legend/CSS shell only
frontend/src/components/relacoes/RelacoesSideColumn.tsx   # stop using (delete or orphan)
frontend/src/components/relacoes/RelacoesDetailPanel.tsx  # stop using — content moves into panel body
frontend/src/pages/RotaPage.tsx                    # CampaignMap + MapSidePanel + planner content
frontend/src/pages/RotaPage.css
frontend/src/components/routes/RoutePlannerPanel.tsx  # extract/rehost form+results into panel slots (or thin wrapper)
frontend/src/components/routes/RouteOverlay.tsx / CampaignMap.css  # selected stroke → campaign accent
frontend/src/pages/MapPage.tsx                     # remove legacy route-tab planner as canonical UX (optional cleanup if still present post-115)
frontend/src/locales/{pt-BR,en}/relacoes.json | comum.json
frontend-next/.../RelacoesPage.* | RotaPage.* | MapSidePanel.*   # visual reference only
```

**Structure Decision**: Produção `frontend/` only; protótipo é planta. Painel único = o da 115.

## Complexity Tracking

Nenhuma violação.
