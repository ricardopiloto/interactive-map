# Implementation Plan: Focar pin ao clicar no mapa

**Branch**: `015-map-pin-focus` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-map-pin-focus/spec.md` (foco no clique do pin, só jogador; reaplicar a cada clique).

## Summary

No modo jogador, o clique no pin do mapa passa a disparar o mesmo `focusRequest` (nonce) já usado pelo menu (`zoomToElement` + `FOCUS_SCALE`), para o pin ficar na vista. GM não dispara este foco. Reutiliza `PinFocusController` / constantes de 012. Sem backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: `MapPage` (`selectLocal` / `focusRequest`); `CampaignMap` (`PinFocusController`, `FOCUS_SCALE`, `FOCUS_ANIM_MS`)

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex)

**Project Type**: Web application (UX do mapa)

**Performance Goals**: Mesma animação ~400 ms; SC-003 &lt; 3 s

**Constraints**:
- Jogador: clique no pin → seleção + foco (reaplica com nonce)
- GM: sem foco obrigatório desta feature
- Mesmo `FOCUS_SCALE` / animação do menu
- Hover menu sem foco
- Sem API/dados

**Scale/Scope**: Principalmente `MapPage.tsx` (handler do mapa); `CampaignMap` só se precisar expor/ajustar API de foco

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo só foco no clique do pin (jogador) | PASS |
| Sem schema/API | PASS |
| Reutiliza foco 012; preserva 013 modal | PASS |
| GM fora do foco obrigatório | PASS |

**Post-design re-check**: PASS — UI contract; data-model só `focusRequest` de sessão.

## Project Structure

### Documentation (this feature)

```text
specs/015-map-pin-focus/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-map-pin-focus.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/
├── pages/
│   └── MapPage.tsx          # selectLocalFromMap: select + focusRequest se !isGm
└── components/map/
    └── CampaignMap.tsx      # PinFocusController já existe; onSelectLocal recebe handler focado
```

**Structure Decision**: Em `MapPage`, o `CampaignMap.onSelectLocal` deixa de ser só `selectLocal` e passa a um wrapper jogador que também seta `focusRequest` (nonce). Menu continua em `selectLocalFromMenu` (já foca).

## Complexity Tracking

> Nenhuma violação a justificar.
