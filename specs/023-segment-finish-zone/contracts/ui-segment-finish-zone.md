# UI Contract: Zona de finalização de segmento

**Feature**: 023-segment-finish-zone  
**Componente**: `RouteDigitizerView` (`frontend/src/components/gm/RouteDigitizerView.tsx`)

## Hit-test (modo Traçar segmento / `draw-seg`)

| Situação | Raio de captura (coords mapa 0–1) | Comportamento |
|----------|-----------------------------------|---------------|
| Sem origem (`draftA == null`) | `0.03` (atual) | Clique perto de um nó → seleciona origem |
| Com origem, clique no mapa | `0.01` (≈⅓ de 0.03) | Hit em nó ≠ origem → grava segmento; senão → ponto intermediário |
| Clique no botão do nó destino | N/A (alvo explícito) | Grava segmento (inalterado) |
| Clique no nó origem com draft ativo | — | Não grava para si; intermediário ou ignore (comportamento atual) |

## Feedback

- Hint com origem escolhida: orientar a clicar no nó de destino (perto dele) para salvar.
- Clique longe do destino: **não** mostrar erro alarmante; continuar rascunho com intermediário.

## Invariantes

1. Raios em coordenadas de mapa — zoom da digitalização não “infla” a zona.
2. Sem mudança de API / persistência / planner.
3. Seleção de origem não fica mais difícil que hoje.
