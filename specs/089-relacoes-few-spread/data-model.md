# Data Model: Anel de foco mais aberto (≤3)

**Feature**: `089-relacoes-few-spread`  
**Date**: 2026-08-14

Nenhuma entidade persistida nova. Nenhuma coluna, migração ou contrato HTTP.

## Folga (apresentação)

Parâmetros de sessão no cliente, não gravados:

| Parâmetro | Valor | Aplica-se a |
|-----------|-------|-------------|
| `espacamento` (foco) | 240 | anel **exterior** do foco; anel interior se **4–6** conexões visíveis |
| `innerSpacing` ≤3 (089) | `sparseInnerSpacing(240)` → **312** | anel interior se `1 ≤ directCount ≤ 3` |
| `innerSpacing` >6 (088) | `compactInnerSpacing(240)` | anel interior se `directCount > 6` |
| `OVERVIEW_SPACING` (087) | **120** | só `computeInitialLayout` |

**Validação**: `ringMinRadius` com 312 afasta caixas; não cria overlap. Sem estado extra em `RelacoesPage`.

**Lifecycle**: ao seleccionar alguém com 1–3 conexões visíveis, o palco anima o anel interior para posições com folga 312. Offsets de arrasto da sessão somam-se como hoje. Com 0 conexões o anel interior está vazio.

## Relação com 086–088

A 086/088 compactam **>6**. Esta frente **abre ≤3**. A banda **4–6** continua a ser a folga padrão. Os três ramos não se misturam.
