# Implementation Plan: UX Nocturne & Débitos

**Branch**: `079-ux-nocturne` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/079-ux-nocturne/spec.md`

**Release**: Codex v2.0.0 — Frente C (version bump **0.14.0** na implementação; tag **2.0.0** quando 077–080 fecharem)

## Summary

Corrigir dois débitos de UX — **digitalização de rotas** (coluna lateral 236px com busca, secções colapsáveis, bottom sheet ≤800px) e **pinch-zoom na Rede de Relações** (estado de zoom unificado com roda) — e aplicar a **diretriz visual Nocturne** (elevação/sombra em vez de bordas pesadas; accent blurple só em interactivos; hierarquia reforçada em painéis e diálogos GM). Sem alterações de backend, modelo de dados ou protocolos de criação no mapa.

**Verificação transversal**: confirmar pinch no Mapa principal (`CampaignMap` / `react-zoom-pan-pinch`); corrigir na mesma frente se gap confirmado (FR-005a).

## Technical Context

**Language/Version**: TypeScript / React 19 / Vite 8 (frontend only)  
**Primary Dependencies**: `react-zoom-pan-pinch` (mapa + digitalização); CSS tokens em `nocturne.css`; util `labelMatchesQuery`  
**Storage**: N/A — sem mudanças de persistência  
**Testing**: Manual quickstart; `npm run build` / `tsc -b`; touch em 3 dispositivos (SC-002)  
**Target Platform**: Web desktop + touch (notebook/tablet/telefone); breakpoint mobile **800px**  
**Project Type**: Monorepo web app — alterações só em `frontend/` + docs de versão  
**Performance Goals**: Busca filtra em tempo real; pinch suave sem jank perceptível; SC-001 &lt;10 s para achar waypoint  
**Constraints**: Clarifications 2026-08-13 locked; protocolo clique mapa inalterado; Rede mobile mantém coluna fixa (só elevação); hub 078 fora de escopo  
**Scale/Scope**: ~25 ficheiros CSS/TSX; 3 user stories; 4 contratos UI  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec clarified (5/5): **PASS**
- Puramente frontend/UX — sem impacto em dados ou auth: **PASS**
- Zero regressão protocolo digitalização (SC-004): **PASS**
- i18n (080) depois desta frente — strings PT hardcoded aceites: **PASS**

**Post-Phase 1**: Unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/079-ux-nocturne/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-digitizer-column.md
│   ├── ui-graph-gestures.md
│   ├── ui-nocturne-elevation.md
│   └── ui-gm-dialogs.md
└── tasks.md                    # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx       # layout coluna + mapa; busca; focus no mapa
├── RouteDigitizer.css           # grid lateral; bottom sheet ≤800px
└── DigitizerListPanel.tsx       # NEW — coluna/busca/secções (opcional extract)

frontend/src/components/relacoes/
├── GraphStage.tsx               # pinch-zoom + wheel unificado
├── GraphStage.css
├── RelacoesSideColumn.css       # elevação vs border-right
├── RelacoesDetailPanel.css      # sombra reforçada; referência bottom sheet
├── PersonagemFormDialog.tsx     # agrupamento campos
├── PersonagemFormDialog.css     # NEW se necessário
└── VinculoFormDialog.tsx / .css

frontend/src/components/sidebar/
└── SideMenu.css                 # elevação coluna Mapa

frontend/src/components/admin/
├── LocalFormDialog.tsx
├── NpcFormDialog.tsx
└── ArcoFormDialog.tsx           # agrupamento + tokens modal

frontend/src/components/common/
└── PinModal.css                 # elevação modal detalhe local

frontend/src/styles/nocturne.css   # tokens elevação; .dialog__group; backdrop

frontend/src/hooks/
└── usePinchZoom.ts              # NEW — pinch nativo reutilizável (GraphStage; Mapa se gap)

frontend/package.json / package-lock.json
README.md / CHANGELOG.md         # 0.14.0
```

**Structure Decision**: Frontend-only; extrair `usePinchZoom` se GraphStage e eventual fix do Mapa partilharem lógica; coluna de digitalização pode ser componente dedicado espelhando largura/padrões de `RelacoesSideColumn` sem forçar refactor do Mapa/Relações nesta frente.

## Complexity Tracking

> None.
