# Implementation Plan: Mapa (reconstrução estrutural)

**Branch**: `115-mapa-reconstrucao` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/115-mapa-reconstrucao/spec.md`

## Summary

Substituir `SideMenu` flush + `PinModal` por um painel flutuante único (busca pílula, chips Tudo/Locais/Personagens, lista ↔ detalhe com «Voltar»). Restilizar controlos de zoom do `CampaignMap` para pílula/círculo translúcido no canto inferior direito, **reutilizando** `--map-zoom` / escala inversa dos pinos. FAB «+» em Modo edição. Digitalizador de rotas fora do redesenho — só mover o ponto de entrada se dependia do SideMenu.

## Technical Context

**Language/Version**: TypeScript / React (Vite); CSS tokens 110

**Primary Dependencies**: `react-zoom-pan-pinch` (já em uso), `EditModeContext`, `useCampaignData`, `LocalFormDialog` / ConfirmDialog, `@tabler/icons-react`, react-i18next

**Storage**: N/A

**Testing**: quickstart + capturas claro/escuro/móvel; `tsc`; sem pytest

**Target Platform**: Browser; breakpoint ~860px (folha inferior)

**Project Type**: web app frontend

**Performance Goals**: N/A (mesmo transform/pan)

**Constraints**: MUST NOT reimplementar zoom/pan; MUST NOT abrir popover de pino; MUST NOT redesenhar RouteDigitizer; MUST NOT mudar ACL/API

**Scale/Scope**: `MapPage.tsx` layout, novo `MapSidePanel` (+ CSS), restyle `CampaignMap` controls, remover uso de `PinModal`/`SideMenu` no mapa, i18n `mapa.json`, entrada mínima GM para digitizer/arcos/grupo

## Constitution Check

*GATE: before Phase 0 — re-check after Phase 1*

- **I. Isolamento**: Sem API nova. **N/A**. **PASS**
- **II. Testes primeiro**: UI polish — quickstart/captura. **PASS**
- **III. Produção legada**: Só `frontend/`. **PASS**
- **IV. Simplicidade**: Reutilizar `--map-zoom` + drawers existentes. **PASS**
- **V. i18n**: pt-BR+en para filtros/voltar/FAB/vazio. **PASS**
- **VI. Migrações**: N/A. **PASS**

Post-design: unchanged. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/115-mapa-reconstrucao/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── map-panel.md
│   └── map-controls.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/pages/MapPage.tsx              # layout: full-bleed map + floating panel + FAB
frontend/src/pages/MapPage.css
frontend/src/components/map/MapSidePanel.tsx    # NEW — shell flutuante / folha móvel
frontend/src/components/map/MapSidePanel.css
frontend/src/components/map/MapPanelContent.tsx  # NEW (optional) — search/list/detail body
frontend/src/components/map/CampaignMap.tsx      # keep TransformWrapper + --map-zoom; wire selection
frontend/src/components/map/CampaignMap.css      # restyle .campaign-map__controls → pill/circle
frontend/src/components/common/PinModal.tsx      # stop using from MapPage (delete or leave unused)
frontend/src/components/sidebar/SideMenu.tsx     # stop using from MapPage
frontend/src/locales/{pt-BR,en}/mapa.json
frontend-next/.../MapSidePanel.* | MapPage.*     # visual reference only
```

**Structure Decision**: Produção `frontend/` only; protótipo é planta.

## Complexity Tracking

Nenhuma violação.
