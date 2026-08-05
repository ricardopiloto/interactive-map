# Quickstart: Route Transport Mode

**Feature**: `050-route-transport-mode`  
**Date**: 2026-08-05

Validação manual. Ver [contracts/api-route-transport-mode.md](./contracts/api-route-transport-mode.md), [contracts/ui-route-transport-mode.md](./contracts/ui-route-transport-mode.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend + backend a correr
- Rede com De/Para que tenha trechos tarifados (estrada/rio) para contrastar pago vs próprio
- Panel **Calcular rota**

## Scenarios

### A — Default e controlos (SC-001, FR-012)

1. Abrir Calcular rota.
2. Fechar e reabrir (se estava em próprio numa sessão anterior do painel).

**Expect**: Modo **pago**; sem campo de velocidade editável; ritmo + ordenação presentes.

### B — Pago = tabela (FR-002, SC-002)

1. Modo **pago**; De/Para com estrada/rio; Calcular.

**Expect**: Tempos coerentes com tabela; Dentro/Fora **> 0** quando há trechos tarifados (não forçados a zero).

### C — Próprio default 4 + custos zero (FR-003–004, SC-002–003)

1. Mudar para **próprio** (com De/Para válidos — deve auto-recalcular).
2. Campo velocidade = **4** sem editar.

**Expect**: Lista actualizada sem clique extra em Calcular; Dentro **0** e Fora **0**; tempos tipicamente diferentes do pago na mesma geometria.

### D — Velocidade própria só no Calcular / modo (FR-011)

1. Em próprio, alterar velocidade para outro valor válido (ex. 8) **sem** clicar Calcular e **sem** mudar modo/ordenação.

**Expect**: Lista **não** muda só por editar o campo.
2. Clicar Calcular (ou mudar ordenação).

**Expect**: Tempos reflectem a nova velocidade; custos continuam 0.

### E — Reset ao reentrar em próprio (US2)

1. Em próprio, pôr velocidade 8.
2. Mudar para **pago**, depois outra vez **próprio**.

**Expect**: Campo volta a **4**.

### F — Validação (FR-008, SC-004)

1. Próprio; limpar velocidade ou pôr `0` / texto; Calcular.

**Expect**: Mensagem de erro; sem lista nova de rotas válida.

### G — Ordenação em próprio (edge)

1. Próprio; De/Para com várias alternativas; alternar Mais rápida ↔ Mais barata.

**Expect**: Auto-recalc; sem erro; com custos todos 0 a ordem “barata” permanece utilizável (desempate por tempo).

### H — Regressão

1. Ritmo Normal/Intenso em ambos os modos.
2. Overlay no mapa; digitizer / Rede.

**Expect**: Ritmo afecta horas/dia como hoje; digitizer inalterado.

## Optional API checks

```bash
# Pago (tabela)
curl -s "http://localhost:8000/api/routes/plan?origem_waypoint_id=1&destino_waypoint_id=2&ritmo=normal&modo_transporte=pago&ordenacao=mais_rapida" \
  | jq '[.rotas[0].custo_dentro_bp, .rotas[0].custo_fora_bp, .rotas[0].tempo_horas]'

# Próprio (custos 0, mph 4)
curl -s "http://localhost:8000/api/routes/plan?origem_waypoint_id=1&destino_waypoint_id=2&ritmo=normal&modo_transporte=proprio&velocidade_media_mph=4&ordenacao=mais_rapida" \
  | jq '[.rotas[0].custo_dentro_bp, .rotas[0].custo_fora_bp, .rotas[0].tempo_horas]'
```

**Expect**: Segundo pedido com Dentro/Fora = 0; tempos podem diferir do primeiro.
