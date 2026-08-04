# Quickstart: Named Route Endpoints Only

**Feature**: `040-named-route-endpoints`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-named-route-endpoints.md](./contracts/ui-named-route-endpoints.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend a correr
- Rede com waypoints **nomeados** e **sem nome** (ex. cruzamentos só com `Nó {id}` no digitizer)
- Preferível: dois locais nomeados ligados só via nó(s) sem nome

## Scenarios

### A — De/Para só nomeados

1. Abrir **Calcular rota**.
2. Abrir lista De e lista Para (sem filtrar).

**Expect**: Só opções com nome (nó ou local); nenhum `Nó {número}`.

### B — Busca não encontra sem nome

1. No De, digitar parte de um id ou “Nó” referente a um waypoint sem nome conhecido.

**Expect**: Sem resultados para esse nó sem nome.

### C — Rota nomeado → nomeado via intermédio

1. Escolher De e Para nomeados cujo caminho passa por nó(s) sem nome.
2. Calcular.

**Expect**: Plano válido (SC-003); custos/dias como antes.

### D — Digitizer intacto

1. Abrir Rede de rotas (GM).

**Expect**: Nós sem nome ainda visíveis/editáveis (SC-004).

### E — Poucos nomeados

1. Campanha com &lt; 2 nomeados (se possível em teste).

**Expect**: Listas curtas; UI não crasha; Calcular continua a exigir De ≠ Para válidos.

## Regression

- Ritmo / velocidade / custos inalterados.
- Overlay de rota no mapa inalterado.
- Plan API sem novos erros para ids sem nome (fora do âmbito UI).
