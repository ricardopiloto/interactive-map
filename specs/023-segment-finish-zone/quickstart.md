# Quickstart: 023-segment-finish-zone

Validação manual da zona menor ao finalizar segmentos.

## Prerequisites

- Backend e frontend em execução
- Modo GM autenticado; Rede de rotas com ≥2 nós (criar se preciso)
- Ver [ui-segment-finish-zone.md](./contracts/ui-segment-finish-zone.md)

## Steps

1. Abrir **Rede de rotas** → **Traçar segmento**.
2. Clicar **perto** (não necessariamente no centro) de um nó de origem.
3. **Esperado**: origem seleciona com a mesma facilidade de antes (raio 0.03).
4. Avançar a polilinha; na distância que **antes** fechava (~até 0.03 do destino) mas **fora** de ~0.01, clicar no mapa.
5. **Esperado**: adiciona intermediário; **não** grava o segmento.
6. Clicar bem junto ao nó destino (zona ~0.01) **ou** no marcador do nó.
7. **Esperado**: segmento grava com intermediários.
8. (Opcional) Com zoom alto (022), repetir 4–7 — ainda precisa proximidade real no mapa.
9. Confirmar dica de UI compreensível; clique longe sem erro alarmante.

## Pass criteria

- [ ] Origem fácil (zona atual)
- [ ] Clique na “faixa antiga” não fecha; vira intermediário
- [ ] Fechar em ~⅓ / no marcador funciona
- [ ] Zoom não restaura zona grande
