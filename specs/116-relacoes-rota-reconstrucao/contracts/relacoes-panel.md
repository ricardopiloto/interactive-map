# Contract: Relações panel + graph shell (116)

**Feature**: `116-relacoes-rota-reconstrucao`  
**Surface**: `/c/:slug/relacoes`

## Shell

Same as [shared-floating-panel.md](./shared-floating-panel.md).

## Head

| Mode | Content |
|------|---------|
| List | Pill search + family/type filter chips (existing four vínculo families/tipos) |
| Detail | «Voltar» (i18n) |

## Body

| Mode | Content |
|------|---------|
| List | Compact personagem rows (avatar/initials, nome, papel/meta, status icon if any); empty i18n |
| Detail | Existing detail content: nome, status, markdown, linked vínculos; Edit Mode: edit/delete actions |

## Graph stage

| Requirement | Notes |
|-------------|--------|
| Keep GraphStage layout engine | Focus centre, direct ring, dimmed outer; four families |
| Sync selection | Node click ↔ list ↔ panel detail |
| Legend (optional) | May remain on stage; filters stay consistent with panel chips |

## MUST NOT

- Mount `RelacoesSideColumn` or `RelacoesDetailPanel` as page chrome.
- Open character detail in a separate anchored popover.
- Replace graph layout algorithm with the prototype SVG unless FR-005 fails verification (then document exception in tasks — default is keep).

## Permissions

- Hidden personagens: only what admin/public APIs already return for current Edit Mode.
- Create personagem/vínculo: Edit Mode only (FAB/menu + existing drawers).
