# Quickstart: Busca De/Para no Calcular Rota

**Feature**: `036-route-endpoint-search`  
**Date**: 2026-08-03

Validação manual end-to-end. Ver [contracts/ui-route-endpoint-combobox.md](./contracts/ui-route-endpoint-combobox.md) e [data-model.md](./data-model.md).

## Prerequisites

- Backend e frontend a correr (ex.: `uv run uvicorn` em `:8000`, `npm run dev`)
- Campanha com vários waypoints com rótulos distintos (ideal ≥ 20 para SC-001)
- Pelo menos um par com rota conhecida entre nós

## Scenarios

### A — Lista completa sem filtro

1. Abrir **Calcular rota**.
2. Focar **De** (sem digitar, ou limpar o texto).
3. Abrir/ver sugestões.

**Expect**: Número de opções = número de nós elegíveis (igual ao select antigo); ordenação estável.

Repetir em **Para**.

### B — Filtrar e calcular

1. Em **De**, digitar um fragmento de um nome conhecido.
2. Confirmar que só rótulos que contêm o fragmento aparecem.
3. Seleccionar uma sugestão; o campo mostra o rótulo.
4. Em **Para**, filtrar e seleccionar outro nó.
5. **Calcular**.

**Expect**: Rotas / mensagem de “nenhuma rota” como no comportamento actual para esse par.

### C — Acentos

1. Se existir rótulo com acento (ex. “São …”), digitar a variante sem acento.
2. **Expect**: A opção aparece nas sugestões.

### D — Reeditar limpa selecção

1. Seleccionar origem em **De**.
2. Alterar uma letra no input.
3. Tentar **Calcular** sem voltar a escolher.

**Expect**: Erro/aviso de origem em falta (ou equivalente); não usa o nó antigo.

### E — Extremo oposto na lista

1. Seleccionar nó X em **De**.
2. Em **Para**, sem filtro (ou filtro que inclui X), ver sugestões.

**Expect**: X continua listado; se seleccionar X nos dois e Calcular → aviso De ≠ Para.

### F — Zero resultados

1. Digitar texto que não coincide com nenhum rótulo.
2. **Expect**: Mensagem/lista vazia perceptível; sem selecção possível.

## Regression

- Ritmo, velocidade opcional, títulos/custos das rotas e overlay no mapa inalterados após um cálculo bem-sucedido (cenário B).
