# Implementation Plan: Desfazer Último Ponto do Segmento (Botão Direito)

**Branch**: `027-undo-segment-point` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/027-undo-segment-point/spec.md` (botão direito desfaz último ponto do rascunho; limpa origem se não houver intermédios; igual sobre nós; sem menu de contexto).

## Summary

Adicionar handler de `contextmenu` na área de traçado de `RouteDigitizerView`: em modo `draw-seg`, `preventDefault` + desfazer — pop do último `draftMids`, ou limpar `draftA` se a lista estiver vazia; `mode` permanece `draw-seg`. Aplicar o mesmo nos botões de nó para cobrir clique direito sobre waypoint. Sem API/backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `RouteDigitizerView.tsx` (estado `mode`, `draftA`, `draftMids`)

**Storage**: N/A (só estado de rascunho em memória)

**Testing**: Validação manual [quickstart.md](./quickstart.md)

**Target Platform**: Browsers do Codex (mouse direito / gesto equivalente)

**Project Type**: Web application (gesto UI no digitizer)

**Performance Goals**: N/A (ação síncrona local)

**Constraints**:
- Só modo `draw-seg`
- Não chamar delete de segmentos/nós
- Direito no nó ≠ fechar segmento
- Ignorar ou no-op seguro quando `busy`

**Scale/Scope**: 1 componente (+ hint opcional)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (2 Qs) | PASS |
| Sem API/schema | PASS |
| Escopo só digitizer FE | PASS |
| Constitution placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract; data-model = máquina de estados do rascunho.

## Project Structure

### Documentation (this feature)

```text
specs/027-undo-segment-point/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-undo-segment-point.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/components/gm/
├── RouteDigitizerView.tsx   # contextmenu + undoDraft; hint opcional
└── RouteDigitizer.css       # sem mudança obrigatória
```

**Structure Decision**: Helper `undoDraftSegmentPoint` (ou inline) no mesmo ficheiro; `onContextMenu` no `route-digitizer__stage` e em cada `route-digitizer__wp`.

## Complexity Tracking

> Sem violações a justificar.
