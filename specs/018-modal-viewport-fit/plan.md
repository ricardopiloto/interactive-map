# Implementation Plan: Modais que cabem na tela

**Branch**: `018-modal-viewport-fit` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-modal-viewport-fit/spec.md` (max-height + corpo rolável + rodapé fixo; chips no mesmo scroll; motivado pela 017).

## Summary

Garantir que diálogos (formulário de local, pin, demais GM) **caibam na viewport**: altura máxima com margem, **só o corpo rola**, **ações sempre no rodapé fixo**. Sem scroll aninhado nas listas de chips. CSS base em Nocturne + ajustes pontuais em `PinModal` (hoje o painel inteiro faz `overflow: auto`).

## Technical Context

**Language/Version**: TypeScript / React + CSS (Nocturne)

**Primary Dependencies**: `frontend/src/styles/nocturne.css` (`.dialog*`); `LocalFormDialog.tsx`; `PinModal.tsx` / `PinModal.css`; `NpcFormDialog` / `ArcoFormDialog` / `AdminGateDialog` (herdam `.dialog`)

**Storage**: N/A

**Testing**: Validação manual via [quickstart.md](./quickstart.md)

**Target Platform**: Browsers modernos (desktop + viewport estreita ~375px)

**Project Type**: Web application (frontend-only UX)

**Performance Goals**: Abrir modal sem jank; scroll interno 60fps em conteúdo longo

**Constraints**:
- Rodapé fixo de ações (clarificação A)
- Um único scroll no corpo; chips sem scroll próprio (clarificação A)
- Conteúdo curto não estica à altura máxima (FR-007)
- Preservar posicionamento beside-pin (013) com max-height na viewport
- Sem backend / sem wizard

**Scale/Scope**: Padrão compartilhado `.dialog` + markup mínimo (wrapper de corpo); pin modal alinhado ao mesmo padrão

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Spec clarificada (rodapé + scroll único) | PASS |
| Sem API/schema | PASS |
| Escopo UI limitado (não redesenhar DS) | PASS |
| Constitution template placeholder | PASS (N/A) |

**Post-design re-check**: PASS — UI contract + invariantes de layout; sem dados persistidos.

## Project Structure

### Documentation (this feature)

```text
specs/018-modal-viewport-fit/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-dialog-viewport-fit.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
frontend/src/
├── styles/nocturne.css                 # .dialog max-height + flex; .dialog__body scroll
├── components/admin/LocalFormDialog.tsx  # wrap fields in scroll body
├── components/admin/NpcAdminList.tsx   # NpcFormDialog structure if needed
├── components/admin/ArcoAdminList.tsx
├── components/gm/AdminGateDialog.tsx     # short form — verify no stretch
├── components/common/PinModal.tsx        # title | body | actions; stop whole-panel scroll
└── components/common/PinModal.css        # align with dialog layout; beside max-height
```

**Structure Decision**: Preferência por reforçar o padrão global `.dialog` em Nocturne para cobrir US1+US3; `PinModal` alinhado explicitamente (US2) porque hoje diverge (`overflow` no painel inteiro).

## Complexity Tracking

> Sem violações a justificar.
