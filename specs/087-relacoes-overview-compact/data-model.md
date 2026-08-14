# Data Model: Vista geral mais compacta

**Feature**: `087-relacoes-overview-compact`  
**Date**: 2026-08-14

Nenhuma entidade persistida nova. Nenhuma coluna, migração ou contrato HTTP.

## Folga (apresentação)

Dois parâmetros de sessão no cliente, não gravados:

| Parâmetro | Valor | Aplica-se a |
|-----------|-------|-------------|
| `espacamento` (foco) | 240 (default actual) | `computeFocusLayout` — anel exterior; anel interior se ≤6 conexões visíveis |
| `innerSpacing` (086) | `compactInnerSpacing(espacamento)` → 160 se `directIds.length > 6` | só anel interior do foco |
| `OVERVIEW_SPACING` (087) | **120** | só `computeInitialLayout` (vista sem selecção) |

**Validação**: `ringMinRadius` com `spacing >= 120` impede sobreposição das caixas 172×112. Não há estado extra em `RelacoesPage`.

**Lifecycle**: no load / ao desseleccionar, o palco anima para posições calculadas com 120. Offsets de arrasto da sessão somam-se como hoje.

## Relação com 086

A 086 compacta o **foco** (>6). Esta frente compacta a **vista geral**. Os dois `spacing` não se misturam.
