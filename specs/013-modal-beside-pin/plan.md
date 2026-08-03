# Implementation Plan: Modal ao lado do pin

**Branch**: `013-modal-beside-pin` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-modal-beside-pin/spec.md` (painel ao lado do pin; lado oposto ao menu; mapa bloqueado; backdrop dimido).

## Summary

No modo jogador, o `PinModal` deixa de ficar centrado no viewport e passa a ancorar-se ao pin (`#map-pin-{id}`), preferindo o **lado oposto ao menu lateral**, com flip se não couber. Backdrop escurecido e bloqueio de pan/zoom permanecem. Sem backend.

## Technical Context

**Language/Version**: TypeScript / React

**Primary Dependencies**: React; DOM `getBoundingClientRect` no pin existente (`map-pin-{id}` de 012); CSS de `PinModal` / `nocturne` dialog

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (Codex)

**Project Type**: Web application (UX modal + mapa)

**Performance Goals**: Posicionamento estável em &lt; 100 ms após abrir/fim da animação de foco; SC-003 (&lt; 3 s para reconhecer pin + ler título)

**Constraints**:
- Lado preferido oposto ao menu; flip/ajuste de margem
- Pin não coberto pelo retângulo do painel
- Backdrop dimido + mapa bloqueado enquanto aberto
- Mobile / viewport estreita: fallback centrado (ou equivalente legível)
- GM inalterado (sem PinModal)
- Sem API/dados

**Scale/Scope**: `PinModal.tsx` / `PinModal.css`; possível ajuste mínimo em `MapPage` se precisar passar metadados; reutilizar ids de pin de 012

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Escopo só UX do detalhe do pin (jogador) | PASS |
| Sem schema/API | PASS |
| Preserva fechar/backdrop/bloqueio do mapa | PASS |
| GM fora do escopo do painel | PASS |

**Post-design re-check**: PASS — UI contract; data-model só estado de layout de sessão.

## Project Structure

### Documentation (this feature)

```text
specs/013-modal-beside-pin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-pin-modal-beside.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/src/
├── components/common/
│   ├── PinModal.tsx       # ancorar ao pin; medir/posicionar; fallback estreito
│   └── PinModal.css       # layout fixed/absolute; override do grid centrado
├── components/map/
│   └── CampaignMap.tsx    # ids map-pin-* já existem (012); sem mudança obrigatória
└── pages/
    └── MapPage.tsx        # PinModal já montado para jogador; wire se necessário
```

**Structure Decision**: Posicionamento encapsulado em `PinModal` (lê `#map-pin-{local.id}`); backdrop global permanece; CSS específico do pin-modal sobrescreve `place-items: center` do `.dialog-backdrop`.

## Complexity Tracking

> Nenhuma violação a justificar.
