# Data Model: Anel de foco ainda mais compacto

**Feature**: `088-relacoes-focus-tighter`  
**Date**: 2026-08-14

Nenhuma entidade persistida nova. Nenhuma coluna, migração ou contrato HTTP.

## Folga (apresentação)

Três parâmetros de sessão no cliente, não gravados:

| Parâmetro | Valor | Aplica-se a |
|-----------|-------|-------------|
| `espacamento` (foco) | 240 | `computeFocusLayout` — anel exterior; anel interior se ≤6 conexões visíveis |
| `innerSpacing` (086+088) | `compactInnerSpacing(espacamento)` → **112** se `directIds.length > 6` | só anel interior do foco |
| `OVERVIEW_SPACING` (087) | **120** | só `computeInitialLayout` (vista sem selecção) |

**Validação**: `ringMinRadius(count, 112)` impede sobreposição das caixas 172×112. Rótulos nas **linhas** (texto de vínculo) não entram nesta fórmula — validação visual (FR-003 / SC-003). Sem estado extra em `RelacoesPage`.

**Lifecycle**: ao seleccionar alguém com >6 conexões visíveis, o palco anima o anel interior para posições com folga 112. Offsets de arrasto da sessão somam-se como hoje.

## Relação com 086 e 087

A 086 introduziu o gatilho >6 e a compactação a 160. Esta frente só muda **160 → 112**. A 087 (vista geral a 120) não se mistura: `OVERVIEW_SPACING` **não** desce para 112.
